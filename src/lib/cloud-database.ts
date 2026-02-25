import { supabase } from '@/integrations/supabase/client';
import type { Product } from './products';

// Cloud (Supabase) database functions

function isMissingColumnError(error: any, column: string) {
  const msg = String(error?.message ?? error ?? "");
  const code = String(error?.code ?? "");
  const m = msg.toLowerCase();
  const col = column.toLowerCase();
  // Common PostgREST/Supabase shapes:
  // - SQL error: column "weight_kg" does not exist
  // - PostgREST schema cache: PGRST204 Could not find the 'weight_kg' column of 'products' in the schema cache
  if (code === "PGRST204") {
    return m.includes(col);
  }
  return m.includes("column") && m.includes(col) && m.includes("does not exist");
}

export async function getProductsFromCloud(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[cloud-db] getProductsFromCloud error:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('[cloud-db] getProductsFromCloud: empty result');
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    image: row.image || '',
    retailPrice: Number(row.retail_price),
    wholesalePrice: Number(row.wholesale_price),
    minWholesaleQty: Number(row.min_wholesale_qty),
    weightKg: row.weight_kg !== undefined && row.weight_kg !== null ? Number(row.weight_kg) : undefined,
    description: row.description || '',
    category: row.category || '',
    pinned: !!row.pinned,
    pinnedAt: row.pinned_at ? Number(row.pinned_at) : undefined,
  }));
}

export async function addProductToCloud(product: Omit<Product, 'id'>): Promise<Product> {
  const id = Date.now().toString();
  const payload: Record<string, any> = {
    id,
    name: product.name,
    image: product.image,
    retail_price: product.retailPrice,
    wholesale_price: product.wholesalePrice,
    min_wholesale_qty: product.minWholesaleQty,
    weight_kg: product.weightKg ?? null,
    description: product.description,
    category: product.category,
    pinned: !!product.pinned,
    pinned_at: product.pinnedAt ?? null,
  };
  let { error } = await supabase.from('products').insert(payload);
  if (error && isMissingColumnError(error, 'weight_kg')) {
    delete payload.weight_kg;
    ({ error } = await supabase.from('products').insert(payload));
  }
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
  if (updates.weightKg !== undefined) mapped.weight_kg = updates.weightKg ?? null;
  if (updates.description !== undefined) mapped.description = updates.description;
  if (updates.category !== undefined) mapped.category = updates.category;
  if (updates.pinned !== undefined) mapped.pinned = !!updates.pinned;
  if (updates.pinnedAt !== undefined) mapped.pinned_at = updates.pinnedAt ?? null;
  mapped.updated_at = new Date().toISOString();

  let { error } = await supabase.from('products').update(mapped).eq('id', id);
  if (error && isMissingColumnError(error, 'weight_kg')) {
    delete mapped.weight_kg;
    ({ error } = await supabase.from('products').update(mapped).eq('id', id));
  }
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
    weight_kg: p.weightKg ?? null,
    description: p.description,
    category: p.category,
    pinned: !!p.pinned,
    pinned_at: p.pinnedAt ?? null,
  }));
  let { error } = await supabase.from('products').insert(rows);
  if (error && isMissingColumnError(error, 'weight_kg')) {
    const rowsWithoutWeight = rows.map((r) => {
      const { weight_kg, ...rest } = r as any;
      return rest;
    });
    ({ error } = await supabase.from('products').insert(rowsWithoutWeight));
  }
  if (error) throw error;
}

export async function getCategoriesFromCloud(): Promise<string[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('name');
  if (error) {
    console.error('[cloud-db] getCategoriesFromCloud error:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    console.warn('[cloud-db] getCategoriesFromCloud: empty result');
    return [];
  }
  return data.map((c: any) => c.name);
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
