// In-memory sample data resets whenever the Node.js process restarts.
const products = [
  { id: 'p-1001', name: 'Wireless Mouse', price: 24.99, category: 'Accessories', stock: 23 },
  { id: 'p-1002', name: 'Mechanical Keyboard', price: 79.5, category: 'Accessories', stock: 12 },
  { id: 'p-1003', name: 'USB-C Hub', price: 39.99, category: 'Connectivity', stock: 18 },
  { id: 'p-1004', name: '27-inch Monitor', price: 229.0, category: 'Displays', stock: 7 },
  { id: 'p-1005', name: 'Noise-Cancelling Headphones', price: 119.95, category: 'Audio', stock: 10 }
];

const orders = [
  {
    id: 'o-sample-1001',
    productId: 'p-1001',
    productName: 'Wireless Mouse',
    quantity: 2,
    customerName: 'Alex Morgan',
    total: 49.98,
    createdAt: '2025-01-15T10:30:00.000Z'
  }
];

module.exports = { products, orders };
