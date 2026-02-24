import { neon } from '@neondatabase/serverless';

// Database connection
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_pq2xNLg1BCJS@ep-soft-tooth-a1ppjto0-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const getDatabase = () => {
  if (!DATABASE_URL) {
    return null;
  }
  return neon(DATABASE_URL);
};

// Helper: run a query and return rows as objects (forces arrayMode: false)
async function queryObjects(queryStr: string, params: unknown[] = []) {
  const sql = getDatabase();
  if (!sql) throw new Error('Database not available');
  return await sql(queryStr, params, { arrayMode: false, fullResults: false });
}

// Helper: run a command (no result needed)
async function execute(queryStr: string, params: unknown[] = []) {
  const sql = getDatabase();
  if (!sql) throw new Error('Database not available');
  await sql(queryStr, params);
}

// Initialize database tables
export async function initDatabase() {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT,
        retail_price DECIMAL(10,2) NOT NULL,
        wholesale_price DECIMAL(10,2) NOT NULL,
        min_wholesale_qty INTEGER NOT NULL,
        description TEXT,
        category VARCHAR(100),
        pinned BOOLEAN DEFAULT FALSE,
        pinned_at BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migrations for older tables (safe to run repeatedly)
    await execute('ALTER TABLE products ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE');
    await execute('ALTER TABLE products ADD COLUMN IF NOT EXISTS pinned_at BIGINT');

    await execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existingCategories = await queryObjects('SELECT COUNT(*) as count FROM categories');
    if (Number(existingCategories[0]?.count) === 0) {
      const defaultCategories = ['ของทอด', 'กุ้ง', 'ไก่', 'อื่นๆ'];
      for (const category of defaultCategories) {
        await execute('INSERT INTO categories (name) VALUES ($1)', [category]);
      }
    }

    const existingProducts = await queryObjects('SELECT COUNT(*) as count FROM products');
    if (Number(existingProducts[0]?.count) === 0) {
      const defaultProducts = [
        { id: '1', name: 'ปอเปี๊ยะทอดกรอบ', image: '', retail_price: 59, wholesale_price: 45, min_wholesale_qty: 10, description: 'ปอเปี๊ยะทอดกรอบ ไส้แน่น อร่อยสดใหม่ทุกวัน', category: 'ของทอด' },
        { id: '2', name: 'ไก่ทอดกรอบ', image: '', retail_price: 79, wholesale_price: 60, min_wholesale_qty: 10, description: 'ไก่ทอดกรอบนอกนุ่มใน หอมเครื่องเทศ', category: 'ไก่' },
        { id: '3', name: 'กุ้งทอดกรอบ', image: '', retail_price: 99, wholesale_price: 75, min_wholesale_qty: 10, description: 'กุ้งทอดกรอบ ตัวใหญ่ เนื้อแน่น', category: 'กุ้ง' },
      ];
      for (const p of defaultProducts) {
        await execute(
          'INSERT INTO products (id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [p.id, p.name, p.image, p.retail_price, p.wholesale_price, p.min_wholesale_qty, p.description, p.category]
        );
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
  try {
    const rows = await queryObjects(`
      SELECT
        id,
        name,
        image,
        retail_price::float8 as "retailPrice",
        wholesale_price::float8 as "wholesalePrice",
        min_wholesale_qty::int as "minWholesaleQty",
        description,
        category,
        COALESCE(pinned, FALSE) as pinned,
        pinned_at as "pinnedAt"
      FROM products 
      ORDER BY created_at DESC
    `);
    return rows as unknown as import('./products').Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function saveProductsToDB(products: any[]) {
  try {
    await execute('DELETE FROM products');
    for (const product of products) {
      await execute(
        'INSERT INTO products (id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category, pinned, pinned_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
        [product.id, product.name, product.image, product.retailPrice, product.wholesalePrice, product.minWholesaleQty, product.description, product.category, !!product.pinned, product.pinnedAt ?? null]
      );
    }
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
}

export async function addProductToDB(product: any) {
  try {
    const id = Date.now().toString();
    await execute(
      'INSERT INTO products (id, name, image, retail_price, wholesale_price, min_wholesale_qty, description, category, pinned, pinned_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [id, product.name, product.image, product.retailPrice, product.wholesalePrice, product.minWholesaleQty, product.description, product.category, !!product.pinned, product.pinnedAt ?? null]
    );
    return { ...product, id };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function deleteProductFromDB(id: string) {
  try {
    await execute('DELETE FROM products WHERE id = $1', [id]);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function updateProductInDB(id: string, updates: any) {
  try {
    if (!updates || typeof updates !== 'object') return;

    const allowed: Record<string, string> = {
      name: 'name',
      image: 'image',
      retailPrice: 'retail_price',
      wholesalePrice: 'wholesale_price',
      minWholesaleQty: 'min_wholesale_qty',
      description: 'description',
      category: 'category',
      pinned: 'pinned',
      pinnedAt: 'pinned_at',
    };

    const entries = Object.entries(updates).filter(([key]) => key in allowed);
    if (entries.length === 0) return;

    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of entries) {
      const col = allowed[key];
      sets.push(`${col} = $${values.length + 1}`);
      values.push(value);
    }
    values.push(id);

    await execute(`UPDATE products SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`, values);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Category functions
export async function getCategoriesFromDB() {
  try {
    const categories = await queryObjects('SELECT name FROM categories ORDER BY name');
    return categories.map((cat: any) => cat.name);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function addCategoryToDB(name: string) {
  try {
    await execute('INSERT INTO categories (name) VALUES ($1)', [name]);
    return await getCategoriesFromDB();
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

export async function deleteCategoryFromDB(name: string) {
  try {
    await execute('DELETE FROM categories WHERE name = $1', [name]);
    return await getCategoriesFromDB();
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}
