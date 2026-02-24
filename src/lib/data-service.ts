import { Product } from './products';
import * as neonDb from './database';
import * as cloudDb from './cloud-database';
import * as localStorageFunctions from './products-db';

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
const DB_FETCH_TIMEOUT_MS = 2500;

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

// Helper: run on both DBs, don't let one failure block the other
async function runOnBoth<T>(
  neonFn: () => Promise<T>,
  cloudFn: () => Promise<T>
): Promise<T> {
  const results = await Promise.allSettled([neonFn(), cloudFn()]);
  // Return the first successful result
  for (const r of results) {
    if (r.status === 'fulfilled') return r.value;
  }
  // Both failed — throw the first error
  throw (results[0] as PromiseRejectedResult).reason;
}

export class DataService {
  // READ: prefer Cloud, fallback to Neon, then localStorage
  static async getProducts(): Promise<Product[]> {
    if (cache.products.data !== null) {
      if (!isCacheFresh(cache.products.timestamp)) {
        DataService._fetchProducts().catch(() => {});
      }
      return cache.products.data;
    }

    // Serve localStorage instantly, revalidate in background
    const local = localStorageFunctions.getProducts();
    cache.products = { data: local, timestamp: Date.now() };
    DataService._fetchProducts().catch(() => {});
    return local;
  }

  private static async _fetchProducts(): Promise<Product[]> {
    try {
      // Try Cloud first (faster, same region)
      const data = await withTimeout(cloudDb.getProductsFromCloud(), DB_FETCH_TIMEOUT_MS);
      cache.products = { data, timestamp: Date.now() };
      return data;
    } catch {
      try {
        const data = await withTimeout(neonDb.getProductsFromDB(), DB_FETCH_TIMEOUT_MS);
        cache.products = { data, timestamp: Date.now() };
        return data;
      } catch {
        const data = localStorageFunctions.getProducts();
        cache.products = { data, timestamp: Date.now() };
        return data;
      }
    }
  }

  static async getCategories(): Promise<string[]> {
    if (cache.categories.data !== null) {
      if (!isCacheFresh(cache.categories.timestamp)) {
        DataService._fetchCategories().catch(() => {});
      }
      return cache.categories.data;
    }

    const local = localStorageFunctions.getCategories();
    cache.categories = { data: local, timestamp: Date.now() };
    DataService._fetchCategories().catch(() => {});
    return local;
  }

  private static async _fetchCategories(): Promise<string[]> {
    try {
      const data = await withTimeout(cloudDb.getCategoriesFromCloud(), DB_FETCH_TIMEOUT_MS);
      cache.categories = { data, timestamp: Date.now() };
      return data;
    } catch {
      try {
        const data = await withTimeout(neonDb.getCategoriesFromDB(), DB_FETCH_TIMEOUT_MS);
        cache.categories = { data, timestamp: Date.now() };
        return data;
      } catch {
        const data = localStorageFunctions.getCategories();
        cache.categories = { data, timestamp: Date.now() };
        return data;
      }
    }
  }

  private static _invalidateCache() {
    cache.products = { data: null, timestamp: 0 };
    cache.categories = { data: null, timestamp: 0 };
  }

  // WRITE: write to BOTH Neon + Cloud, plus localStorage as fallback
  static async saveProducts(products: Product[]): Promise<void> {
    await Promise.allSettled([
      neonDb.saveProductsToDB(products).catch(e => console.warn('Neon save error:', e)),
      cloudDb.saveProductsToCloud(products).catch(e => console.warn('Cloud save error:', e)),
    ]);
    localStorageFunctions.saveProducts(products);
    DataService._invalidateCache();
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const newProduct = await runOnBoth(
        () => neonDb.addProductToDB(product),
        () => cloudDb.addProductToCloud(product)
      );
      localStorageFunctions.addProduct(product);
      DataService._invalidateCache();
      return newProduct;
    } catch (error) {
      console.warn('Both DBs failed, using localStorage:', error);
      DataService._invalidateCache();
      return localStorageFunctions.addProduct(product);
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    await Promise.allSettled([
      neonDb.deleteProductFromDB(id).catch(e => console.warn('Neon delete error:', e)),
      cloudDb.deleteProductFromCloud(id).catch(e => console.warn('Cloud delete error:', e)),
    ]);
    localStorageFunctions.deleteProduct(id);
    DataService._invalidateCache();
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await Promise.allSettled([
      neonDb.updateProductInDB(id, updates).catch(e => console.warn('Neon update error:', e)),
      cloudDb.updateProductInCloud(id, updates).catch(e => console.warn('Cloud update error:', e)),
    ]);
    localStorageFunctions.updateProduct(id, updates);
    DataService._invalidateCache();
  }

  static async addCategory(name: string): Promise<string[]> {
    try {
      const categories = await runOnBoth(
        () => neonDb.addCategoryToDB(name),
        () => cloudDb.addCategoryToCloud(name)
      );
      localStorageFunctions.addCategory(name);
      DataService._invalidateCache();
      return categories;
    } catch (error) {
      console.warn('Both DBs failed, using localStorage:', error);
      DataService._invalidateCache();
      return localStorageFunctions.addCategory(name);
    }
  }

  static async deleteCategory(name: string): Promise<string[]> {
    try {
      const categories = await runOnBoth(
        () => neonDb.deleteCategoryFromDB(name),
        () => cloudDb.deleteCategoryFromCloud(name)
      );
      localStorageFunctions.deleteCategory(name);
      DataService._invalidateCache();
      return categories;
    } catch (error) {
      console.warn('Both DBs failed, using localStorage:', error);
      DataService._invalidateCache();
      return localStorageFunctions.deleteCategory(name);
    }
  }

  static async initializeDatabase(): Promise<void> {
    try {
      await neonDb.initDatabase();
      console.log('Neon database initialized');
    } catch (error) {
      console.error('Neon init failed:', error);
    }
  }
}
