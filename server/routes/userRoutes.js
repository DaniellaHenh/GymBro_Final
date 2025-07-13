const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/search-partners', userController.searchByFilters);
router.get('/search', userController.searchUsers);

router.post('/', userController.handleUserCommand);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);


router.post('/', userController.handleUserCommand);
router.get('/search', userController.searchUsers);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);

module.exports = router;
