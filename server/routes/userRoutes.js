const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.handleUserCommand);
router.get('/:uid', userController.getUserByUid);
router.put('/:uid', userController.updateUserByUid);


module.exports = router;
