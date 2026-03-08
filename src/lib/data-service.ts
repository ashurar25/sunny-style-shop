import { Product } from './products';
import * as cloudDb from './cloud-database';

export type { Product } from './products';

// In-memory cache for stale-while-revalidate pattern
const cache: {
  products: { data: Product[] | null; timestamp: number };
  categories: { data: string[] | null; timestamp: number };
} = {
  products: { data: null, timestamp: 0 },
  categories: { data: null, timestamp: 0 },
};

const CACHE_TTL = 60_000;
const DB_FETCH_TIMEOUT_MS = 120_000;

async function retryOnce<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Timeout')), ms);
    promise.then(
      (v) => { clearTimeout(id); resolve(v); },
      (e) => { clearTimeout(id); reject(e); }
    );
  });
}

function isCacheFresh(timestamp: number) {
  return Date.now() - timestamp < CACHE_TTL;
}

export class DataService {
  static async getProducts(): Promise<Product[]> {
    if (cache.products.data !== null) {
      if (!isCacheFresh(cache.products.timestamp)) {
        DataService._fetchProducts().catch(() => {});
      }
      return cache.products.data;
    }
    return DataService._fetchProducts();
  }

  private static async _fetchProducts(): Promise<Product[]> {
    const data = await withTimeout(cloudDb.getProductsFromCloud(), DB_FETCH_TIMEOUT_MS);
    cache.products = { data, timestamp: Date.now() };
    return data;
  }

  static async getCategories(): Promise<string[]> {
    if (cache.categories.data !== null) {
      if (!isCacheFresh(cache.categories.timestamp)) {
        DataService._fetchCategories().catch(() => {});
      }
      return cache.categories.data;
    }
    return DataService._fetchCategories();
  }

  private static async _fetchCategories(): Promise<string[]> {
    const data = await withTimeout(cloudDb.getCategoriesFromCloud(), DB_FETCH_TIMEOUT_MS);
    cache.categories = { data, timestamp: Date.now() };
    return data;
  }

  static async getProductsFromDBOnly(): Promise<Product[]> {
    const data = await retryOnce(() => withTimeout(cloudDb.getProductsFromCloud(), DB_FETCH_TIMEOUT_MS));
    cache.products = { data, timestamp: Date.now() };
    return data;
  }

  static async getCategoriesFromDBOnly(): Promise<string[]> {
    const data = await retryOnce(() => withTimeout(cloudDb.getCategoriesFromCloud(), DB_FETCH_TIMEOUT_MS));
    cache.categories = { data, timestamp: Date.now() };
    return data;
  }

  private static _invalidateCache() {
    cache.products = { data: null, timestamp: 0 };
    cache.categories = { data: null, timestamp: 0 };
  }

  static async saveProducts(products: Product[]): Promise<void> {
    await cloudDb.saveProductsToCloud(products);
    DataService._invalidateCache();
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct = await cloudDb.addProductToCloud(product);
    DataService._invalidateCache();
    return newProduct;
  }

  static async deleteProduct(id: string): Promise<void> {
    await cloudDb.deleteProductFromCloud(id);
    DataService._invalidateCache();
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const normalizedUpdates: Partial<Product> = { ...updates };
    if (normalizedUpdates.pinned === false && normalizedUpdates.pinnedAt === undefined) {
      (normalizedUpdates as any).pinnedAt = null;
    }
    await cloudDb.updateProductInCloud(id, normalizedUpdates);
    DataService._invalidateCache();
  }

  static async addCategory(name: string): Promise<string[]> {
    const categories = await cloudDb.addCategoryToCloud(name);
    DataService._invalidateCache();
    return categories;
  }

  static async deleteCategory(name: string): Promise<string[]> {
    const categories = await cloudDb.deleteCategoryFromCloud(name);
    DataService._invalidateCache();
    return categories;
  }

  static async initializeDatabase(): Promise<void> {
    // No-op: Cloud DB is always ready
  }
}
