import mongoose from 'mongoose';

export const RUBRIC_SCOPES = ['TrustMedia', 'TrustEvent', 'TrustProduction', 'Media'];

const rubricSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      enum: RUBRIC_SCOPES,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

rubricSchema.index({ scope: 1, slug: 1 }, { unique: true });
rubricSchema.index({ scope: 1, order: 1, label: 1 });

export default mongoose.model('Rubric', rubricSchema);
