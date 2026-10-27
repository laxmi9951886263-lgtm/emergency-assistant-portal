const express = require('express');
const { getRequests, createRequest } = require('../controllers/requests.controller');

const router = express.Router();
router.get('/', getRequests);
router.post('/', createRequest);

module.exports = router;
