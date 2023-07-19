const express = require('express');
const router = express.Router();

const factorRecordController = require('../controllers/factorRecord');
const { checkAuthUser } = require('../middleware/check-auth');

router.post('/record/submit', checkAuthUser, factorRecordController.createRecord);

router.put('/record/update/:id', checkAuthUser, factorRecordController.updateRecord);

router.get('/record', checkAuthUser, factorRecordController.getRecords);

module.exports = router;