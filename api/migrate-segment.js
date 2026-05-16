import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando Company...');
  const resCompany = await prisma.company.updateMany({
    where: { segment: 'GEOMEMBRANA' },
    data: { segment: 'OUTRO' }
  });
  console.log(`Updated ${resCompany.count} companies.`);

  console.log('Atualizando BusinessTypeKnowledge...');
  const resBTK = await prisma.businessTypeKnowledge.updateMany({
    where: { segment: 'GEOMEMBRANA' },
    data: { segment: 'OUTRO' }
  });
  console.log(`Updated ${resBTK.count} knowledge records.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
