import { Product } from './products';
import * as dbFunctions from './database';
import * as localStorageFunctions from './products-db';

// Re-export Product type
export type { Product } from './products';

// Database is always available since we have a hardcoded fallback URL
const isDatabaseAvailable = () => {
  return true;
};

// Data service that automatically chooses between database and localStorage
export class DataService {
  static async getProducts(): Promise<Product[]> {
    if (isDatabaseAvailable()) {
      try {
        return await dbFunctions.getProductsFromDB();
      } catch (error) {
        console.warn('Database error, falling back to localStorage:', error);
        return localStorageFunctions.getProducts();
      }
    }
    return localStorageFunctions.getProducts();
  }

  static async saveProducts(products: Product[]): Promise<void> {
    if (isDatabaseAvailable()) {
      try {
        await dbFunctions.saveProductsToDB(products);
        // Also update localStorage as backup
        localStorageFunctions.saveProducts(products);
      } catch (error) {
        console.warn('Database error, saving to localStorage:', error);
        localStorageFunctions.saveProducts(products);
      }
    } else {
      localStorageFunctions.saveProducts(products);
    }
  }

  static async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    if (isDatabaseAvailable()) {
      try {
        const newProduct = await dbFunctions.addProductToDB(product);
        // Also update localStorage as backup
        localStorageFunctions.addProduct(product);
        return newProduct;
      } catch (error) {
        console.warn('Database error, adding to localStorage:', error);
        return localStorageFunctions.addProduct(product);
      }
    }
    return localStorageFunctions.addProduct(product);
  }

  static async deleteProduct(id: string): Promise<void> {
    if (isDatabaseAvailable()) {
      try {
        await dbFunctions.deleteProductFromDB(id);
        // Also update localStorage as backup
        localStorageFunctions.deleteProduct(id);
      } catch (error) {
        console.warn('Database error, deleting from localStorage:', error);
        localStorageFunctions.deleteProduct(id);
      }
    } else {
      localStorageFunctions.deleteProduct(id);
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    if (isDatabaseAvailable()) {
      try {
        await dbFunctions.updateProductInDB(id, updates);
        // Also update localStorage as backup
        localStorageFunctions.updateProduct(id, updates);
      } catch (error) {
        console.warn('Database error, updating in localStorage:', error);
        localStorageFunctions.updateProduct(id, updates);
      }
    } else {
      localStorageFunctions.updateProduct(id, updates);
    }
  }

  static async getCategories(): Promise<string[]> {
    if (isDatabaseAvailable()) {
      try {
        return await dbFunctions.getCategoriesFromDB();
      } catch (error) {
        console.warn('Database error, falling back to localStorage:', error);
        return localStorageFunctions.getCategories();
      }
    }
    return localStorageFunctions.getCategories();
  }

  static async addCategory(name: string): Promise<string[]> {
    if (isDatabaseAvailable()) {
      try {
        const categories = await dbFunctions.addCategoryToDB(name);
        // Also update localStorage as backup
        localStorageFunctions.addCategory(name);
        return categories;
      } catch (error) {
        console.warn('Database error, adding to localStorage:', error);
        return localStorageFunctions.addCategory(name);
      }
    }
    return localStorageFunctions.addCategory(name);
  }

  static async deleteCategory(name: string): Promise<string[]> {
    if (isDatabaseAvailable()) {
      try {
        const categories = await dbFunctions.deleteCategoryFromDB(name);
        // Also update localStorage as backup
        localStorageFunctions.deleteCategory(name);
        return categories;
      } catch (error) {
        console.warn('Database error, deleting from localStorage:', error);
        return localStorageFunctions.deleteCategory(name);
      }
    }
    return localStorageFunctions.deleteCategory(name);
  }

  // Initialize database if available
  static async initializeDatabase(): Promise<void> {
    if (isDatabaseAvailable()) {
      try {
        await dbFunctions.initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
  }
}
