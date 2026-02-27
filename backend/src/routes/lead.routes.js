const express = require('express');
const controller = require('../controllers/lead.controller');

const router = express.Router();

router.get('/get/all', controller.getAll);
router.get('/get/all/paginated', controller.getPaginated);
router.get('/get/export/csv', controller.exportCsv);
router.get('/get/:id', controller.getById);
router.get('/get/:id/interacciones', controller.getInteracciones);
router.get('/get/:id/tareas', controller.getTareas);
router.post('/get/:id/convertir-cliente', controller.convertirCliente);
router.post('/post', controller.post);
router.put('/update/:id', controller.updateById);
router.patch('/update/:id', controller.updateById);
router.delete('/delete/:id', controller.deleteById);

module.exports = router;



