export interface Product {
  id: string;
  name: string;
  image: string;
  retailPrice: number;
  wholesalePrice: number;
  minWholesaleQty: number;
  description?: string;
}

const STORAGE_KEY = 'krungkring_products';

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'ปอเปี๊ยะทอดกรอบ',
    image: '',
    retailPrice: 59,
    wholesalePrice: 45,
    minWholesaleQty: 10,
    description: 'ปอเปี๊ยะทอดกรอบ ไส้แน่น อร่อยสดใหม่ทุกวัน',
  },
  {
    id: '2',
    name: 'ไก่ทอดกรอบ',
    image: '',
    retailPrice: 79,
    wholesalePrice: 60,
    minWholesaleQty: 10,
    description: 'ไก่ทอดกรอบนอกนุ่มใน หอมเครื่องเทศ',
  },
  {
    id: '3',
    name: 'กุ้งทอดกรอบ',
    image: '',
    retailPrice: 99,
    wholesalePrice: 75,
    minWholesaleQty: 10,
    description: 'กุ้งทอดกรอบ ตัวใหญ่ เนื้อแน่น',
  },
];

export function getProducts(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultProducts;
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct = { ...product, id: Date.now().toString() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function deleteProduct(id: string) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function updateProduct(id: string, updates: Partial<Product>) {
  const products = getProducts().map(p => p.id === id ? { ...p, ...updates } : p);
  saveProducts(products);
}
