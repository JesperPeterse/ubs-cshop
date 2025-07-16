const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
});

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING }, // nullable for guest
  isGuest: { type: DataTypes.BOOLEAN, defaultValue: false },
  name: { type: DataTypes.STRING },
  street: { type: DataTypes.STRING },
  postcode: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
});

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING },
});

const Order = sequelize.define('Order', {
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
});

const OrderItem = sequelize.define('OrderItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

async function seedProducts() {
  const count = await Product.count();
  if (count === 0) {
    await Product.bulkCreate([
      {
        name: 'USB-C to USB-C Cable 1m',
        description: 'Durable 1 meter USB-C to USB-C cable, supports fast charging and data transfer.',
        price: 9.99,
        image: 'https://via.placeholder.com/150?text=USB-C+1m',
      },
      {
        name: 'USB-C to USB-A Cable 2m',
        description: '2 meter cable for connecting USB-C devices to USB-A ports.',
        price: 12.99,
        image: 'https://via.placeholder.com/150?text=USB-C+to+A+2m',
      },
      {
        name: 'Braided USB-C Cable 1.5m',
        description: 'Braided 1.5 meter USB-C cable for extra durability.',
        price: 14.99,
        image: 'https://via.placeholder.com/150?text=Braided+USB-C+1.5m',
      },
    ]);
    console.log('Seeded products');
  }
}

module.exports = { sequelize, User, Product, Order, OrderItem, seedProducts };
