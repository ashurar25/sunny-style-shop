import { Product } from './products';

// Fallback to localStorage when database is not available
export function getProducts(): Product[] {
  const stored = localStorage.getItem('krungkring_products');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem('krungkring_products', JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now().toString() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function deleteProduct(id: string) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function updateProduct(id: string, updates: Partial<Product>) {
  const products = getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
  saveProducts(products);
}

export function getCategories(): string[] {
  const stored = localStorage.getItem('krungkring_categories');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCategories(categories: string[]) {
  localStorage.setItem('krungkring_categories', JSON.stringify(categories));
}

export function addCategory(name: string): string[] {
  const categories = getCategories();
  if (!categories.includes(name)) {
    categories.push(name);
    saveCategories(categories);
  }
  return categories;
}

export function deleteCategory(name: string): string[] {
  const categories = getCategories().filter(c => c !== name);
  saveCategories(categories);
  return categories;
}


