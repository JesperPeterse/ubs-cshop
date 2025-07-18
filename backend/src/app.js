require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { sequelize, seedProducts, ensureIsAdminColumn } = require('./models');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', routes);

const PORT = process.env.PORT || 4000;
(async () => {
  await ensureIsAdminColumn();
  await sequelize.sync();
  await seedProducts();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

