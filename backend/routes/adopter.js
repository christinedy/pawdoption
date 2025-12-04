import express from 'express';
import asyncHandler from 'express-async-handler';
import Application from '../models/Application.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

//get dashboard data
router.get(
  '/dashboard',
  protect,
  asyncHandler(async (req, res) => {
    //get user's applications 
    const applications = await Application.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedApps = applications.map(app => ({
      id: app._id,
      petName: app.petDetails?.name || 'Unknown Pet',
      breed: app.petDetails?.breed || 'Unknown Breed',
      status: app.status,
      appliedDate: app.createdAt,
      notes: app.notes
    }));

    //get approved adoptions for adoption history
    const adoptionHistory = applications
      .filter(app => app.status === 'approved')
      .map(app => ({
        id: app._id,
        petName: app.petDetails?.name || 'Unknown Pet',
        breed: app.petDetails?.breed || 'Unknown Breed',
        status: 'adopted',
        adoptedDate: app.updatedAt
      }));

    res.json({
      adopter: {
        id: req.user._id,
        name: req.user.fullname,
        email: req.user.email,
        phone: req.user.phone,
        address: req.user.address,
        joinDate: req.user.createdAt
      },
      applications: formattedApps,
      likedPets: [], 
      adoptionHistory: adoptionHistory
    });
  })
);

//delete application
router.delete(
  '/applications/:id',
  protect,
  asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    //check if the application belongs to the user
    if (application.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this application');
    }

    //pending applications ra ang allowed ma delete
    if (application.status !== 'pending') {
      res.status(400);
      throw new Error('Cannot delete approved or rejected applications');
    }

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: 'Application deleted successfully' });
  })
);

export default router;