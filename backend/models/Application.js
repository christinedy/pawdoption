import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Address & Contact
    addressLine1: { type: String, required: true },
    addressLine2: String,
    town: { type: String, required: true },
    postcode: { type: String, required: true },
    phone: String,
    mobile: String,

    // Home Details
    hasGarden: { type: String, enum: ['yes','no'] },
    livingSituation: String,
    householdSetting: String,
    activityLevel: String,

    // Household
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    youngestChildAge: String,
    visitingChildren: { type: String, enum: ['yes','no'] },
    flatmates: { type: String, enum: ['yes','no'] },
    visitingChildAges: String,

    // Animals
    allergies: String,
    hasOtherAnimals: { type: String, enum: ['yes','no'] },
    otherAnimalsDetails: String,
    isNeutered: String,
    isVaccinated: String,
    experience: String,

    // Images
    images: {
      main: String,
      img2: String,
      img3: String,
      img4: String
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);
export default Application;