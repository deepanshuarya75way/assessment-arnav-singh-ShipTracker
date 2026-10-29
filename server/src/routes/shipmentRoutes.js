const express = require('express');
const { body } = require('express-validator');
const {
  createShipment,
  getShipments,
  getShipmentSummary,
  getShipmentById,
  updateShipment,
  deleteShipment,
  addStatusUpdate,
  updateStatusEntry,
  deleteStatusEntry,
} = require('../controllers/shipmentController');
const { protect, authorize } = require('../middleware/auth');
const Shipment = require('../models/Shipment');

const router = express.Router();

const createShipmentValidation = [
  body('origin').trim().notEmpty().withMessage('Origin is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('carrier').trim().notEmpty().withMessage('Carrier is required'),
  body('estimatedDelivery')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('estimatedDelivery must be a valid date'),
  body('ownerId').optional({ values: 'falsy'}).isMongoId().withMessage('owner id must be valid'),
];

// Same field rules as create, but every field is optional since this is
// a partial update (PUT here behaves like a PATCH would - the client only
// sends the fields it wants to change).
const updateShipmentValidation = [
  body('origin').optional().trim().notEmpty().withMessage('Origin cannot be empty'),
  body('destination').optional().trim().notEmpty().withMessage('Destination cannot be empty'),
  body('carrier').optional().trim().notEmpty().withMessage('Carrier cannot be empty'),
  body('estimatedDelivery')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('estimatedDelivery must be a valid date'),
];

const statusHistoryValidation = [
  body('status')
    .notEmpty()
    .withMessage('status is required')
    .isIn(Shipment.STATUS_VALUES)
    .withMessage(`status must be one of: ${Shipment.STATUS_VALUES.join(', ')}`),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('note must be under 500 characters'),
  body('timestamp').optional().isISO8601().withMessage('timestamp must be a valid date'),
];

// Same as above but every field optional, since this is a PATCH (partial edit).
const statusHistoryUpdateValidation = [
  body('status')
    .optional()
    .isIn(Shipment.STATUS_VALUES)
    .withMessage(`status must be one of: ${Shipment.STATUS_VALUES.join(', ')}`),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('note must be under 500 characters'),
  body('timestamp').optional().isISO8601().withMessage('timestamp must be a valid date'),
];

// Every route below requires a valid JWT.
router.use(protect);

// IMPORTANT: /summary must be registered BEFORE /:id, otherwise Express
// would match "summary" as if it were an :id param on the GET /:id route.
router.get('/summary', getShipmentSummary);

router.route('/')
  .post(createShipmentValidation, createShipment) // any authenticated user
  .get(getShipments); // admin: all, customer: own only (scoped inside controller)

router.route('/:id')
  .get(getShipmentById) // admin: any. customer: own only (scoped inside controller)
  .put(authorize('admin'), updateShipmentValidation, updateShipment)
  .delete(authorize('admin'), deleteShipment);

router.route('/:id/history')
  .post(authorize('admin'), statusHistoryValidation, addStatusUpdate);

router.route('/:id/history/:historyId')
  .patch(authorize('admin'), statusHistoryUpdateValidation, updateStatusEntry)
  .delete(authorize('admin'), deleteStatusEntry);

module.exports = router;
