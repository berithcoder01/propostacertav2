import { API_URL } from '../../../shared/services/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('@narogestor:token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.isProduct !== undefined) params.set('isProduct', filters.isProduct);
  if (filters.category) params.set('category', filters.category);
  if (filters.lowStock) params.set('lowStock', filters.lowStock);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit);

  const response = await fetch(`${API_URL}/products?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Falha ao buscar produtos');
  return response.json();
};

export const fetchLowStockProducts = async () => {
  const response = await fetch(`${API_URL}/products/low-stock`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Falha ao buscar produtos com estoque baixo');
  return response.json();
};

export const fetchProductStats = async () => {
  const response = await fetch(`${API_URL}/products/stats`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Falha ao buscar estatísticas');
  return response.json();
};

export const fetchProductById = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Falha ao buscar produto');
  return response.json();
};

export const createProduct = async (productData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Falha ao criar produto');
  }
  return response.json();
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  if (!response.ok) throw new Error('Falha ao atualizar produto');
  return response.json();
};

export const updateStock = async (id, quantity, operation) => {
  const response = await fetch(`${API_URL}/products/${id}/stock`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity, operation })
  });
  if (!response.ok) throw new Error('Falha ao atualizar estoque');
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Falha ao deletar produto');
  return true;
};
