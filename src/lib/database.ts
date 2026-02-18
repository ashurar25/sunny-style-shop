import { neon } from '@neondatabase/serverless';

// Database connection
const getDatabase = () => {
  const databaseUrl = import.meta.env.VITE_DATABASE_URL;
  if (!databaseUrl || databaseUrl === '') {
    return null;
  }
  return neon(databaseUrl);
};

// Initialize database tables
export async function initDatabase() {
  const sql = getDatabase();
  if (!sql) {
    console.log('Database URL not available, skipping initialization');
    return;
  }

  try {
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT,
        retail_price DECIMAL(10,2) NOT NULL,
        wholesale_price DECIMAL(10,2) NOT NULL,
        min_wholesale_qty INTEGER NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default categories if empty
    const existingCategories = await sql`SELECT COUNT(*) as count FROM categories`;
    if (existingCategories[0].count === 0) {
      const defaultCategories = ['ของทอด', 'กุ้ง', 'ไก่', 'อื่นๆ'];
      for (const category of defaultCategories) {
        await sql`INSERT INTO categories (name) VALUES (${category})`;
      }
    }

    // Insert default products if empty
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
    if (existingProducts[0].count === 0) {
      const defaultProducts = [
        {
          id: '1',
          name: 'ปอเปี๊ยะทอดกรอบ',
          image: '',
          retail_price: 59,
          wholesale_price: 45,
          min_wholesale_qty: 10,
          description: 'ปอเปี๊ยะทอดกรอบ ไส้แน่น อร่อยสดใหม่ทุกวัน',
          category: 'ของทอด',
        },
        {
          id: '2',
          name: 'ไก่ทอดกรอบ',
          image: '',
          retail_price: 79,
          wholesale_price: 60,
          min_wholesale_qty: 10,
          description: 'ไก่ทอดกรอบนอกนุ่มใน หอมเครื่องเทศ',
          category: 'ไก่',
        },
        {
          id: '3',
          name: 'กุ้งทอดกรอบ',
          image: '',
          retail_price: 99,
          wholesale_price: 75,
          min_wholesale_qty: 10,
          description: 'กุ้งทอดกรอบ ตัวใหญ่ เนื้อแน่น',
          category: 'กุ้ง',
        },
      ];

      for (const product of defaultProducts) {
        await sql`
          INSERT INTO products (id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category)
          VALUES (${product.id}, ${product.name}, ${product.image}, ${product.retail_price}, ${product.wholesale_price}, ${product.min_wholesale_qty}, ${product.description}, ${product.category})
        `;
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Product functions
export async function getProductsFromDB() {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    const products = await sql`
      SELECT id, name, image, retail_price as retailPrice, wholesale_price as wholesalePrice, 
             min_wholesale_qty as minWholesaleQty, description, category
      FROM products 
      ORDER BY created_at DESC
    `;
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function saveProductsToDB(products) {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    // Clear existing products
    await sql`DELETE FROM products`;
    
    // Insert all products
    for (const product of products) {
      await sql`
        INSERT INTO products (id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category)
        VALUES (${product.id}, ${product.name}, ${product.image}, ${product.retailPrice}, ${product.wholesalePrice}, ${product.minWholesaleQty}, ${product.description}, ${product.category})
      `;
    }
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
}

export async function addProductToDB(product) {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    const id = Date.now().toString();
    await sql`
      INSERT INTO products (id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category)
      VALUES (${id}, ${product.name}, ${product.image}, ${product.retailPrice}, ${product.wholesalePrice}, ${product.minWholesaleQty}, ${product.description}, ${product.category})
    `;
    return { ...product, id };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function deleteProductFromDB(id) {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function updateProductInDB(id, updates) {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    if (fields.length === 0) return;

    const setClause = fields.map(field => {
      const dbField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      return `${dbField} = ${updates[field]}`;
    }).join(', ');

    await sql`
      UPDATE products 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Category functions
export async function getCategoriesFromDB() {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    const categories = await sql`SELECT name FROM categories ORDER BY name`;
    return categories.map(cat => cat.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function addCategoryToDB(name) {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    await sql`INSERT INTO categories (name) VALUES (${name})`;
    return await getCategoriesFromDB();
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

export async function deleteCategoryFromDB(name) {
  const sql = getDatabase();
  if (!sql) {
    throw new Error('Database not available');
  }

  try {
    await sql`DELETE FROM categories WHERE name = ${name}`;
    return await getCategoriesFromDB();
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}
