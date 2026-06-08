const express = require('express');
const router = express.Router();
const { getCameras, getCameraById, getTopCameras } = require('../controllers/cameraController');

router.get('/top', getTopCameras);
router.get('/', getCameras);
router.get('/:id', getCameraById);

module.exports = router;
