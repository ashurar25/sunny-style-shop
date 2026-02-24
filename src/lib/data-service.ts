import { Product } from './products';
import * as dbFunctions from './database';
import * as localStorageFunctions from './products-db';

// Re-export Product type
export type { Product } from './products';

// In-memory cache for stale-while-revalidate pattern
const cache: {
  products: { data: Product[] | null; timestamp: number };
  categories: { data: string[] | null; timestamp: number };
} = {
  products: { data: null, timestamp: 0 },
  categories: { data: null, timestamp: 0 },
};

const CACHE_TTL = 60_000; // 1 minute – serve cached, revalidate in background

const DB_FETCH_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('Timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      }
    );
  });
}

function isCacheFresh(timestamp: number) {
  return Date.now() - timestamp < CACHE_TTL;
}

// Data service that automatically chooses between database and localStorage
export class DataService {
  static async getProducts(): Promise<Product[]> {
    // Fast-path: return cached data instantly if available
    if (cache.products.data !== null) {
      if (!isCacheFresh(cache.products.timestamp)) {
        DataService._fetchProducts().catch(() => {});
      }
      return cache.products.data;
    }

    // Fast-path: serve localStorage immediately to avoid slow DB on poor networks,
    // then revalidate from DB in background.
    const local = localStorageFunctions.getProducts();
    cache.products = { data: local, timestamp: Date.now() };
    DataService._fetchProducts().catch(() => {});
    return local;
  }

  private static async _fetchProducts(): Promise<Product[]> {
    try {
      const data = await withTimeout(dbFunctions.getProductsFromDB(), DB_FETCH_TIMEOUT_MS);
      cache.products = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.warn('Database error, falling back to localStorage:', error);
      const data = localStorageFunctions.getProducts();
      cache.products = { data, timestamp: Date.now() };
      return data;
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
      const data = await withTimeout(dbFunctions.getCategoriesFromDB(), DB_FETCH_TIMEOUT_MS);
      cache.categories = { data, timestamp: Date.now() };
      return data;
    } catch (error) {
      console.warn('Database error, falling back to localStorage:', error);
      const data = localStorageFunctions.getCategories();
      cache.categories = { data, timestamp: Date.now() };
      return data;
    }
  }

  // Invalidate cache after mutations
  private static _invalidateCache() {
    cache.products = { data: null, timestamp: 0 };
    cache.categories = { data: null, timestamp: 0 };
  }

  static async saveProducts(products: Product[]): Promise<void> {
    try {
      await dbFunctions.saveProductsToDB(products);
      localStorageFunctions.saveProducts(products);
    } catch (error) {
      console.warn('Database error, saving to localStorage:', error);
      localStorageFunctions.saveProducts(products);
    }
    DataService._invalidateCache();
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const newProduct = await dbFunctions.addProductToDB(product);
      localStorageFunctions.addProduct(product);
      DataService._invalidateCache();
      return newProduct;
    } catch (error) {
      console.warn('Database error, adding to localStorage:', error);
      DataService._invalidateCache();
      return localStorageFunctions.addProduct(product);
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      await dbFunctions.deleteProductFromDB(id);
      localStorageFunctions.deleteProduct(id);
    } catch (error) {
      console.warn('Database error, deleting from localStorage:', error);
      localStorageFunctions.deleteProduct(id);
    }
    DataService._invalidateCache();
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      await dbFunctions.updateProductInDB(id, updates);
      localStorageFunctions.updateProduct(id, updates);
    } catch (error) {
      console.warn('Database error, updating in localStorage:', error);
      localStorageFunctions.updateProduct(id, updates);
    }
    DataService._invalidateCache();
  }

  static async addCategory(name: string): Promise<string[]> {
    try {
      const categories = await dbFunctions.addCategoryToDB(name);
      localStorageFunctions.addCategory(name);
      DataService._invalidateCache();
      return categories;
    } catch (error) {
      console.warn('Database error, adding to localStorage:', error);
      DataService._invalidateCache();
      return localStorageFunctions.addCategory(name);
    }
  }

  static async deleteCategory(name: string): Promise<string[]> {
    try {
      const categories = await dbFunctions.deleteCategoryFromDB(name);
      localStorageFunctions.deleteCategory(name);
      DataService._invalidateCache();
      return categories;
    } catch (error) {
      console.warn('Database error, deleting from localStorage:', error);
      DataService._invalidateCache();
      return localStorageFunctions.deleteCategory(name);
    }
  }

  static async initializeDatabase(): Promise<void> {
    try {
      await dbFunctions.initDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
}
