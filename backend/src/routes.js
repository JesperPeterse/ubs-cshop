const express = require('express');
const { User, Product, Order, OrderItem } = require('./models');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, street, postcode, city } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const exists = await User.findOne({ where: { email, isGuest: false } });
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash, isGuest: false, name, street, postcode, city });
  res.status(201).json({ success: true });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await User.findOne({ where: { email, isGuest: false } });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Authenticated order history
router.get('/orders', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const orders = await Order.findAll({
    where: { UserId: user.id },
    include: [
      {
        model: OrderItem,
        include: [Product],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders.map(order => ({
    id: order.id,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
    items: order.OrderItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        name: item.Product.name,
      },
    })),
  })));
});

// GET /api/products - list all products
router.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// Get user profile (address)
router.get('/profile', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ email: user.email, name: user.name, street: user.street, postcode: user.postcode, city: user.city });
});

// Update user profile (address)
router.put('/profile', auth, async (req, res) => {
  const { name, street, postcode, city } = req.body;
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.name = name;
  user.street = street;
  user.postcode = postcode;
  user.city = city;
  await user.save();
  res.json({ success: true });
});

// Update guest-checkout to use user address if logged in, and update user address if provided
router.post('/guest-checkout', async (req, res) => {
  const { cart, shipping } = req.body;
  let user = null;
  // If JWT is provided, use logged-in user
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findByPk(decoded.id);
      // If shipping info is provided, update user address
      if (user && shipping && shipping.naam && shipping.straat && shipping.postcode && shipping.plaats) {
        user.name = shipping.naam;
        user.street = shipping.straat;
        user.postcode = shipping.postcode;
        user.city = shipping.plaats;
        await user.save();
      }
    } catch (e) { user = null; }
  }
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  let guest = null;
  if (!user) {
    if (!shipping || !shipping.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // Reuse guest user if email exists, otherwise create
    guest = await User.findOne({ where: { email: shipping.email, isGuest: true } });
    if (!guest) {
      guest = await User.create({ isGuest: true, email: shipping.email });
    }
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
  const order = await Order.create({ UserId: (user ? user.id : guest.id), total, status: 'paid' });
  for (const item of orderItems) {
    await OrderItem.create({ ...item, OrderId: order.id });
  }
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
