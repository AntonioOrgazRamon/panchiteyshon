const express = require('express');
const clienteController = require('../controllers/cliente.controller');
const tareaController = require('../controllers/tarea.controller');

const router = express.Router();

router.get('/get/all', clienteController.getAll);
router.get('/get/all/paginated', clienteController.getPaginated);
router.get('/get/:id', clienteController.getById);
router.post('/post', clienteController.post);
router.put('/update/:id', clienteController.updateById);
router.patch('/update/:id', clienteController.updateById);
router.delete('/delete/:id', clienteController.deleteById);

// Tareas del cliente (delegado al controller de tareas con query clienteId)
router.get('/get/:id/tareas', tareaController.getByClienteId);

module.exports = router;
