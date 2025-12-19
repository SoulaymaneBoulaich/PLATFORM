const express = require('express');
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

// APPOINTMENTS (Confirmed meetings)
router.get('/', auth, appointmentController.getAppointments);
router.post('/', auth, appointmentController.createAppointment);
router.put('/:id', auth, appointmentController.updateAppointment);
router.delete('/:id', auth, appointmentController.deleteAppointment);

// VISITS (Pending requests)
// GET /api/appointments/visits -> Get my visits (as buyer) or visits to my properties (as seller)
router.get('/visits', auth, appointmentController.getVisits);
router.post('/visits', auth, appointmentController.createVisit); // Request a visit
router.put('/visits/:id', auth, appointmentController.updateVisitStatus); // Accept/Reject

module.exports = router;
