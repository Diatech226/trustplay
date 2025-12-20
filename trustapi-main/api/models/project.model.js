import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    url: { type: String, trim: true },
    type: { type: String, trim: true },
    mime: { type: String, trim: true },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    brief: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'delivered', 'on_hold', 'archived'],
      default: 'planning',
      index: true,
    },
    deadline: {
      type: Date,
    },
    attachments: {
      type: [assetSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

projectSchema.index({ title: 'text', brief: 'text' });

const Project = mongoose.model('Project', projectSchema);
export default Project;
