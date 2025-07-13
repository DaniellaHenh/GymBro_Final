const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/search-partners', userController.searchByFilters);
router.get('/search', userController.searchUsers);

router.get('/', userController.getAllUsers);
router.post('/', userController.handleUserCommand);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
// routes/userRoutes.js
router.post('/:id/follow', userController.followUser);     // POST /api/users/:id/follow
router.post('/:id/unfollow', userController.unfollowUser); // POST /api/users/:id/unfollow


module.exports = router;
