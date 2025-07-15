const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

// Multer storage config for profile pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
router.post('/upload-profile-picture/:id', upload.single('profilePicture'), userController.uploadProfilePicture);


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
