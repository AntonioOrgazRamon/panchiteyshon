require('dotenv').config();
const app = require('./app');
const { config } = require('./config');

const port = config.port;

async function start() {
  if (config.dataProvider === 'mongo') {
    try {
      const { connect } = require('./config/mongoose');
      await connect();
    } catch (err) {
      console.error('Error conectando a MongoDB:', err.message);
      process.exit(1);
    }
  }
  app.listen(port, () => {
    console.log(`NakedCRM Lite API escuchando en http://localhost:${port}`);
    console.log(`Data provider: ${config.dataProvider}`);
  });
}

start();
