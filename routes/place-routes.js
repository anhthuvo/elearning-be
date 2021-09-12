const express = require('express');
const router = express.Router();

const {
    getPlaceById,
    getPlaceByUserId,
    createPlace,
    updatePlace,
    deletePlace
} = require('../controllers/place-controller');

router.get('/:pid', getPlaceById);

router.get('/user/:uid', getPlaceByUserId);

router.post('/', createPlace);

router.delete('/:pid', deletePlace);

router.put('/:pid', updatePlace);

module.exports = router;