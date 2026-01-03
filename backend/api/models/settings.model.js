import mongoose from 'mongoose';

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { _id: false }
);

const emailSettingsSchema = new mongoose.Schema(
  {
    senderName: { type: String, default: '' },
    senderEmail: { type: String, default: '' },
    replyToEmail: { type: String, default: '' },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Trust Media' },
    siteDescription: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#2563eb' },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    navigationCategories: {
      type: [String],
      default: ['news', 'politique', 'science-tech', 'sport', 'cinema'],
    },
    commentsEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    emailSettings: { type: emailSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const Setting = mongoose.model('Setting', settingsSchema);

export default Setting;
