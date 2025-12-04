import express from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import path from 'path';
import Application from '../models/Application.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/roles.js';

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// @desc Submit a new application
// @route POST /api/applications
// @access Private
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'main' },
    { name: 'img2' },
    { name: 'img3' },
    { name: 'img4' }
  ]),
  asyncHandler(async (req, res) => {
    const existingApp = await Application.findOne({ userId: req.user._id, status: 'pending' });
    if (existingApp) {
      res.status(400);
      throw new Error('You already have a pending application.');
    }

    const images = {};
    ['main','img2','img3','img4'].forEach(key => {
      if (req.files[key]) images[key] = req.files[key][0].path;
    });

    const application = new Application({
      userId: req.user._id,
      ...req.body,
      images
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  })
);

// @desc Get logged-in user's applications
// @route GET /api/applications/my
// @access Private
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(applications);
  })
);

// @desc Get all applications (admin)
// @route GET /api/applications
// @access Admin
router.get(
  '/',
  protect,
  authorizeRoles('admin'),
  asyncHandler(async (req, res) => {
    const applications = await Application.find().populate('userId', 'fullname email').sort({ createdAt: -1 });
    res.json(applications);
  })
);

// @desc Update application status (admin)
// @route PUT /api/applications/:id/status
// @access Admin
router.put(
  '/:id/status',
  protect,
  authorizeRoles('admin'),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) {
      res.status(404);
      throw new Error('Application not found');
    }
    app.status = status;
    await app.save();
    res.json({ message: `Application ${status}` });
  })
);

export default router;