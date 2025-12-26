import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, trim: true },
    url: { type: String, required: true, trim: true },
    originalUrl: { type: String, trim: true },
    thumbUrl: { type: String, trim: true },
    coverUrl: { type: String, trim: true },
    mediumUrl: { type: String, trim: true },
    thumbAvifUrl: { type: String, trim: true },
    coverAvifUrl: { type: String, trim: true },
    mediumAvifUrl: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number },
    width: { type: Number },
    height: { type: Number },
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
