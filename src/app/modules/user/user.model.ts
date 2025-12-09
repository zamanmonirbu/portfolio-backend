import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ISocialLink {
  platform: string;
  url: string;
  icon?: string;
}


export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
  cloudinaryId?: string;
  bio?: string;
  socialLinks: ISocialLink[];
  about?: string;
  workExperience: {
    title: string;
    designation: string;
    location: string;
    timePeriod: string;
    details: string;
  }[];
  education: {
    institution: string;
    degree: string;
    timePeriod: string;
  }[];
  skills: {
    skillTile: string;
    skillName: string[];
  }[];
  logo: string;
  logoCloudinaryId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },

    profilePicture: { type: String, default: '' },
    cloudinaryId: { type: String },

    bio: { type: String, default: '' },

    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String },
      },
    ],

    about: { type: String, default: '' },

    workExperience: [
      {
        title: String,
        designation: String,
        location: String,
        timePeriod: String,
        details: String,
      },
    ],

    education: [
      {
        institution: String,
        degree: String,
        timePeriod: String,
      },
    ],

    skills: [{
      skillTile: { type: String },
      skillName:[{ type: String }],
    }],
    logo: { type: String, default: '' },
    logoCloudinaryId: { type: String },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
  next();
});

// Compare password
UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Cloudinary cleanup
UserSchema.pre('deleteOne', { document: true, query: false }, async function () {
  if (this.cloudinaryId) {
    try {
      const cloudinary = (await import('../../../utils/cloudinary')).default;
      await cloudinary.uploader.destroy(this.cloudinaryId);
    } catch (err) {
      console.error('Cloudinary cleanup failed:', err);
    }
  }
});

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
