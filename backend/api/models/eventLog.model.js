import mongoose from 'mongoose';

const eventLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['page_view', 'event_signup', 'share', 'interaction', 'custom'],
      required: true,
    },
    page: { type: String, index: true },
    slug: { type: String, index: true },
    label: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userAgent: { type: String },
    ip: { type: String },
  },
  { timestamps: true }
);

eventLogSchema.index({ type: 1, createdAt: -1 });
eventLogSchema.index({ slug: 1, type: 1 });

export default mongoose.model('EventLog', eventLogSchema);
