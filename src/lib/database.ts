// Simple database stub for now - will be implemented when Neon is available
// This prevents build errors while keeping the structure

export async function initDatabase() {
  console.log('Database initialization skipped - Neon not configured');
}

export async function getProductsFromDB() {
  throw new Error('Database not available');
}

export async function saveProductsToDB() {
  throw new Error('Database not available');
}

export async function addProductToDB() {
  throw new Error('Database not available');
}

export async function deleteProductFromDB() {
  throw new Error('Database not available');
}

export async function updateProductInDB() {
  throw new Error('Database not available');
}

export async function getCategoriesFromDB() {
  throw new Error('Database not available');
}

export async function addCategoryToDB() {
  throw new Error('Database not available');
}

export async function deleteCategoryFromDB() {
  throw new Error('Database not available');
}
