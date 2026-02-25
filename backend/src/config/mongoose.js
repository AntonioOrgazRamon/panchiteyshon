const mongoose = require('mongoose');
const { config } = require('./index');

async function connect() {
  if (config.dataProvider !== 'mongo') return;
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB conectado');
}

module.exports = { connect };
