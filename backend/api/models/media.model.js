import mongoose from 'mongoose';

const AssetVariantSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String, trim: true },
    size: { type: Number },
  },
  { _id: false }
);

const MediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
      index: true,
    },
    title: { type: String, trim: true },
    alt: { type: String, trim: true, default: '' },
    caption: { type: String, trim: true },
    credit: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    original: AssetVariantSchema,
    variants: {
      thumb: AssetVariantSchema,
      card: AssetVariantSchema,
      cover: AssetVariantSchema,
      og: AssetVariantSchema,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: { type: String, trim: true },
    subCategory: { type: String, trim: true },
    url: { type: String, trim: true },
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
  },
  { timestamps: true }
);

MediaSchema.index({ title: 'text', alt: 'text', tags: 'text' });
MediaSchema.index({ createdAt: -1, category: 1, type: 1 });

export default mongoose.model('Media', MediaSchema);
