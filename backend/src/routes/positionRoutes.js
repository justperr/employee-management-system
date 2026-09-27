const express = require('express');

const {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition
} = require('../controllers/positionController');

const {
  authMiddleware,
  adminMiddleware
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  getPositions
);

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  createPosition
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  updatePosition
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  deletePosition
);

module.exports = router;