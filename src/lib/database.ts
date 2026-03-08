// Neon database module - DEPRECATED on client-side
// All Neon operations now go through edge functions (sync-from-neon)
// This file is kept as a no-op stub so existing imports don't break

import type { Product } from './products';

export async function initDatabase(): Promise<void> {
  // No-op: Neon is no longer initialized from client
  console.log('Database initialized successfully');
}

export async function getProductsFromDB(): Promise<Product[]> {
  throw new Error('Neon client-side access removed for security');
}

export async function saveProductsToDB(_products: Product[]): Promise<void> {
  throw new Error('Neon client-side access removed for security');
}

export async function addProductToDB(_product: Omit<Product, 'id'>): Promise<Product> {
  throw new Error('Neon client-side access removed for security');
}

export async function deleteProductFromDB(_id: string): Promise<void> {
  throw new Error('Neon client-side access removed for security');
}

export async function updateProductInDB(_id: string, _updates: Partial<Product>): Promise<void> {
  throw new Error('Neon client-side access removed for security');
}

export async function getCategoriesFromDB(): Promise<string[]> {
  throw new Error('Neon client-side access removed for security');
}

export async function addCategoryToDB(_name: string): Promise<string[]> {
  throw new Error('Neon client-side access removed for security');
}

export async function deleteCategoryFromDB(_name: string): Promise<string[]> {
  throw new Error('Neon client-side access removed for security');
}
