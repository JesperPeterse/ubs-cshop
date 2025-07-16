const { sequelize, User } = require('./src/models');
(async () => {
  await sequelize.sync();
  const user = await User.findOne({ where: { email: 'jpeterse@pm.me' } });
  if (user) {
    user.isAdmin = true;
    await user.save();
    console.log('User is now admin!');
  } else {
    console.log('User not found');
  }
  process.exit();
})(); 