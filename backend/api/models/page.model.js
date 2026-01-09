import mongoose from 'mongoose';
import slugify from 'slugify';

const PageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    featuredMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Media',
    },
    featuredMediaUrl: {
      type: String,
      trim: true,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    ogImage: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    template: {
      type: String,
      enum: ['default', 'landing', 'article'],
      default: 'default',
    },
  },
  { timestamps: true }
);

PageSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.publishedAt && this.status === 'published') {
    this.publishedAt = new Date();
  }
  next();
});

PageSchema.index({ title: 'text', content: 'text', slug: 'text' });

export default mongoose.model('Page', PageSchema);
