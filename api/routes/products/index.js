'use strict';

export default async function (fastify, opts) {

  async function getCompanyId(request) {
    let { companyId } = request.user;
    if (!companyId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: request.user.id } });
      companyId = user?.companyId;
    }
    return companyId;
  }

  // GET /products — lista produtos e serviços com filtros
  fastify.get('/', async (request, reply) => {
    const companyId = await getCompanyId(request);
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' });

    const { isProduct, category, lowStock, search, page = 1, limit = 50 } = request.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { companyId, active: true };

    if (isProduct !== undefined) where.isProduct = isProduct === 'true';
    if (category) where.category = category;
    if (lowStock === 'true') {
      where.stockQuantity = { lte: fastify.prisma.catalogItem.fields.minStock };
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await fastify.prisma.$transaction([
      fastify.prisma.catalogItem.findMany({
        where,
        orderBy: [{ isProduct: 'desc' }, { category: 'asc' }, { description: 'asc' }],
        skip,
        take: parseInt(limit),
      }),
      fastify.prisma.catalogItem.count({ where }),
    ]);

    return { items, total, page: parseInt(page), limit: parseInt(limit) };
  });

  // GET /products/low-stock — itens com estoque baixo
  fastify.get('/low-stock', async (request, reply) => {
    const companyId = await getCompanyId(request);
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' });

    const allItems = await fastify.prisma.catalogItem.findMany({
      where: { companyId, active: true, isProduct: true },
    });

    const lowStockItems = allItems.filter(item => item.stockQuantity <= item.minStock);

    return { items: lowStockItems, count: lowStockItems.length };
  });

  // GET /products/stats — estatísticas de estoque
  fastify.get('/stats', async (request, reply) => {
    const companyId = await getCompanyId(request);
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' });

    const allItems = await fastify.prisma.catalogItem.findMany({
      where: { companyId, active: true },
      select: { isProduct: true, stockQuantity: true, minStock: true, category: true, defaultPrice: true },
    });

    const products = allItems.filter(i => i.isProduct);
    const services = allItems.filter(i => !i.isProduct);
    const lowStock = products.filter(i => i.stockQuantity <= i.minStock);
    const totalValue = products.reduce((sum, i) => sum + (i.stockQuantity * (i.defaultPrice || 0)), 0);

    return {
      totalProducts: products.length,
      totalServices: services.length,
      lowStockCount: lowStock.length,
      totalStockValue: totalValue,
    };
  });

  // GET /products/:id
  fastify.get('/:id', async (request, reply) => {
    const companyId = await getCompanyId(request);
    const { id } = request.params;

    const item = await fastify.prisma.catalogItem.findFirst({
      where: { id, companyId },
    });
    if (!item) return reply.notFound();
    return item;
  });

  // POST /products — cria produto ou serviço
  fastify.post('/', async (request, reply) => {
    const companyId = await getCompanyId(request);
    if (!companyId) return reply.code(400).send({ error: 'Empresa não configurada' });

    const {
      code, description, unit, category, defaultPrice, notes,
      isProduct, stockQuantity, minStock, imageUrl,
    } = request.body;

    if (!description || !unit) {
      return reply.code(400).send({ error: 'Descrição e unidade são obrigatórios' });
    }

    const item = await fastify.prisma.catalogItem.create({
      data: {
        companyId,
        code: code || null,
        description,
        unit,
        category: category || 'SERVICO',
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : null,
        notes: notes || null,
        isProduct: isProduct || false,
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : 0,
        minStock: minStock !== undefined ? parseInt(minStock) : 5,
        imageUrl: imageUrl || null,
      },
    });

    return reply.code(201).send(item);
  });

  // PUT /products/:id — atualiza produto
  fastify.put('/:id', async (request, reply) => {
    const companyId = await getCompanyId(request);
    const { id } = request.params;

    const exists = await fastify.prisma.catalogItem.findFirst({ where: { id, companyId } });
    if (!exists) return reply.notFound();

    const data = { ...request.body };
    delete data.id;
    delete data.companyId;
    delete data.createdAt;
    delete data.updatedAt;

    if (data.defaultPrice !== undefined) data.defaultPrice = parseFloat(data.defaultPrice);
    if (data.stockQuantity !== undefined) data.stockQuantity = parseInt(data.stockQuantity);
    if (data.minStock !== undefined) data.minStock = parseInt(data.minStock);

    const updated = await fastify.prisma.catalogItem.update({ where: { id }, data });
    return updated;
  });

  // PATCH /products/:id/stock — atualiza apenas estoque
  fastify.patch('/:id/stock', async (request, reply) => {
    const companyId = await getCompanyId(request);
    const { id } = request.params;
    const { quantity, operation } = request.body;

    const exists = await fastify.prisma.catalogItem.findFirst({ where: { id, companyId } });
    if (!exists) return reply.notFound();

    let newQuantity;
    if (operation === 'add') {
      newQuantity = exists.stockQuantity + parseInt(quantity);
    } else if (operation === 'remove') {
      newQuantity = Math.max(0, exists.stockQuantity - parseInt(quantity));
    } else {
      newQuantity = parseInt(quantity);
    }

    const updated = await fastify.prisma.catalogItem.update({
      where: { id },
      data: { stockQuantity: newQuantity },
    });

    return {
      ...updated,
      isLowStock: updated.stockQuantity <= updated.minStock,
    };
  });

  // DELETE /products/:id — inativa item (soft delete)
  fastify.delete('/:id', async (request, reply) => {
    const companyId = await getCompanyId(request);
    const { id } = request.params;

    const exists = await fastify.prisma.catalogItem.findFirst({ where: { id, companyId } });
    if (!exists) return reply.notFound();

    await fastify.prisma.catalogItem.update({ where: { id }, data: { active: false } });
    return reply.code(204).send();
  });
}
