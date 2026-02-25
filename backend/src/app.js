const express = require('express');
const { config } = require('./config');
const corsManual = require('./middlewares/corsManual');
const requestLogger = require('./middlewares/requestLogger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const { buildDoc } = require('./documentacion');
const leadRoutes = require('./routes/lead.routes');
const interaccionRoutes = require('./routes/interaccion.routes');
const tareaRoutes = require('./routes/tarea.routes');
const clienteRoutes = require('./routes/cliente.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(corsManual);
app.use(express.json());
app.use(requestLogger);

app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/interacciones', interaccionRoutes);
app.use('/api/v1/tareas', tareaRoutes);
app.use('/api/v1/clientes', clienteRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({ ok: true, message: 'NakedCRM Lite API', provider: config.dataProvider });
});

function sendDocumentacion(req, res) {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${config.port}`;
  const baseUrl = `${protocol}://${host}`;
  const doc = buildDoc(baseUrl);
  res.json(doc);
}
app.get('/api/v1/documentacion', sendDocumentacion);
app.get('/api/v1/Documentacion', sendDocumentacion);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
