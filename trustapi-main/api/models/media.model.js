import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    url: { type: String, required: true, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number },
    kind: {
      type: String,
      enum: ['image', 'video', 'file'],
      default: 'file',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    altText: { type: String, trim: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

MediaSchema.index({ name: 'text', tags: 'text', category: 'text' });
MediaSchema.index({ category: 1, kind: 1, createdAt: -1 });

export default mongoose.model('Media', MediaSchema);
