const express = require('express');
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Use the authMiddleware to verify JWT token for protected routes
router.use(authMiddleware);

router.post('/store', dataController.storeData);
router.get('/get', dataController.getData);
router.delete('/delete/:dataId', dataController.deleteData);
router.post('/fetchflood',dataController.floodData);

module.exports = router;
