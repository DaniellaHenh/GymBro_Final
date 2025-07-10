const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.handleUserCommand);
<<<<<<< HEAD
=======
router.get('/search', userController.searchUsers);
>>>>>>> e901f03f6f66d8b64a01b8f87c66ce5ed7ad4863
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);

module.exports = router;
