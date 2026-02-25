const express = require('express');
const controller = require('../controllers/tarea.controller');

const router = express.Router();

router.get('/get/all', controller.getAll);
router.get('/get/all/paginated', controller.getPaginated);
router.get('/get/upcoming', controller.getUpcoming);
router.get('/get/today', controller.getToday);
router.get('/get/:id', controller.getById);
router.post('/post', controller.post);
router.put('/update/:id', controller.updateById);
router.patch('/update/:id', controller.updateById);
router.delete('/delete/:id', controller.deleteById);

module.exports = router;
