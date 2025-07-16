const express = require('express');
const { User, Product, Order, OrderItem } = require('./models');
const router = express.Router();

// GET /api/products - list all products
router.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// POST /api/guest-checkout - create guest user, order, and order items
// Expects: { cart: [{ productId, quantity }], shipping: { name, address, ... } }
router.post('/guest-checkout', async (req, res) => {
  const { cart, shipping } = req.body;
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!shipping || !shipping.email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Reuse guest user if email exists, otherwise create
  let guest = await User.findOne({ where: { email: shipping.email, isGuest: true } });
  if (!guest) {
    guest = await User.create({ isGuest: true, email: shipping.email });
  }
  // Calculate total and create order
  let total = 0;
  const orderItems = [];
  for (const item of cart) {
    const product = await Product.findByPk(item.productId);
    if (!product) continue;
    const price = product.price * item.quantity;
    total += price;
    orderItems.push({
      ProductId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }
  // Mock payment (always succeeds)
  const paymentSuccess = true;
  if (!paymentSuccess) {
    return res.status(402).json({ error: 'Payment failed' });
  }
  // Create order and order items
  const order = await Order.create({ UserId: guest.id, total, status: 'paid' });
  for (const item of orderItems) {
    await OrderItem.create({ ...item, OrderId: order.id });
  }
  // Optionally, save shipping info (not modeled here)
  res.json({ orderId: order.id, message: 'Order placed successfully', total });
});

// GET /api/orders/:id - fetch order details for confirmation
router.get('/orders/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      {
        model: OrderItem,
        include: [Product],
      },
    ],
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({
    id: order.id,
    total: order.total,
    items: order.OrderItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        name: item.Product.name,
      },
    })),
  });
});

// Add a new product
router.post('/products', async (req, res) => {
  const { name, description, price, image } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }
  const product = await Product.create({ name, description, price, image });
  res.status(201).json(product);
});

// Edit an existing product
router.put('/products/:id', async (req, res) => {
  const { name, description, price, image } = req.body;
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.name = name ?? product.name;
  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.image = image ?? product.image;
  await product.save();
  res.json(product);
});

// Delete a product
router.delete('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await product.destroy();
  res.json({ success: true });
});

module.exports = router;
