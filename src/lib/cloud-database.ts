import { supabase } from '@/integrations/supabase/client';
import type { Product } from './products';

// Cloud (Supabase) database functions

export async function getProductsFromCloud(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    image: row.image || '',
    retailPrice: Number(row.retail_price),
    wholesalePrice: Number(row.wholesale_price),
    minWholesaleQty: Number(row.min_wholesale_qty),
    description: row.description || '',
    category: row.category || '',
    pinned: !!row.pinned,
    pinnedAt: row.pinned_at ? Number(row.pinned_at) : undefined,
  }));
}

export async function addProductToCloud(product: Omit<Product, 'id'>): Promise<Product> {
  const id = Date.now().toString();
  const { error } = await supabase.from('products').insert({
    id,
    name: product.name,
    image: product.image,
    retail_price: product.retailPrice,
    wholesale_price: product.wholesalePrice,
    min_wholesale_qty: product.minWholesaleQty,
    description: product.description,
    category: product.category,
    pinned: !!product.pinned,
    pinned_at: product.pinnedAt ?? null,
  });
  if (error) throw error;
  return { ...product, id };
}

export async function deleteProductFromCloud(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function updateProductInCloud(id: string, updates: Partial<Product>): Promise<void> {
  const mapped: Record<string, any> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.image !== undefined) mapped.image = updates.image;
  if (updates.retailPrice !== undefined) mapped.retail_price = updates.retailPrice;
  if (updates.wholesalePrice !== undefined) mapped.wholesale_price = updates.wholesalePrice;
  if (updates.minWholesaleQty !== undefined) mapped.min_wholesale_qty = updates.minWholesaleQty;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.category !== undefined) mapped.category = updates.category;
  if (updates.pinned !== undefined) mapped.pinned = !!updates.pinned;
  if (updates.pinnedAt !== undefined) mapped.pinned_at = updates.pinnedAt ?? null;
  mapped.updated_at = new Date().toISOString();

  const { error } = await supabase.from('products').update(mapped).eq('id', id);
  if (error) throw error;
}

export async function saveProductsToCloud(products: Product[]): Promise<void> {
  await supabase.from('products').delete().neq('id', '');
  if (products.length === 0) return;
  const rows = products.map(p => ({
    id: p.id,
    name: p.name,
    image: p.image,
    retail_price: p.retailPrice,
    wholesale_price: p.wholesalePrice,
    min_wholesale_qty: p.minWholesaleQty,
    description: p.description,
    category: p.category,
    pinned: !!p.pinned,
    pinned_at: p.pinnedAt ?? null,
  }));
  const { error } = await supabase.from('products').insert(rows);
  if (error) throw error;
}

export async function getCategoriesFromCloud(): Promise<string[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('name');
  if (error) throw error;
  return (data || []).map((c: any) => c.name);
}

export async function addCategoryToCloud(name: string): Promise<string[]> {
  const { error } = await supabase.from('categories').insert({ name });
  if (error) throw error;
  return getCategoriesFromCloud();
}

export async function deleteCategoryFromCloud(name: string): Promise<string[]> {
  const { error } = await supabase.from('categories').delete().eq('name', name);
  if (error) throw error;
  return getCategoriesFromCloud();
}
