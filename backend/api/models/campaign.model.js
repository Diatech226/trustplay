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

const kpiSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    target: { type: String, trim: true },
    current: { type: String, trim: true },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    start: Date,
    end: Date,
    cadence: { type: String, trim: true },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    channel: {
      type: String,
      trim: true,
      required: true,
    },
    goal: {
      type: String,
      trim: true,
    },
    budget: {
      type: Number,
      default: 0,
    },
    kpis: {
      type: [kpiSchema],
      default: [],
    },
    assets: {
      type: [assetSchema],
      default: [],
    },
    schedule: {
      type: scheduleSchema,
      default: {},
    },
    status: {
      type: String,
      enum: ['planned', 'in_progress', 'delivered', 'on_hold', 'archived'],
      default: 'planned',
      index: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ title: 'text', goal: 'text', channel: 'text' });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
