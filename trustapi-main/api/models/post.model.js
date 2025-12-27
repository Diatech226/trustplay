import mongoose from "mongoose";
import slugify from "slugify"; // ✅ To auto-generate slugs

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ Reference User model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default:
        "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
    },
    imageOriginal: { type: String, trim: true },
    imageThumb: { type: String, trim: true },
    imageCover: { type: String, trim: true },
    imageMedium: { type: String, trim: true },
    imageThumbAvif: { type: String, trim: true },
    imageCoverAvif: { type: String, trim: true },
    imageMediumAvif: { type: String, trim: true },
    category: {
      type: String,
      enum: ["TrustEvent", "TrustMedia", "TrustProduction", "TrustProd", "uncategorized"], // ✅ Restrict to predefined categories
      default: "uncategorized",
    },
    subCategory: {
      type: String, // ✅ Ajout de la sous-catégorie
      trim: true,
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // ✅ Track post comments
      },
    ],
    // Event-Specific Fields
    eventDate: {
      type: Date, // ✅ Optional field for event posts
    },
    location: {
      type: String,
      trim: true, // ✅ Optional field for event posts
    },
    pricingType: {
      type: String,
      enum: ["free", "paid"],
    },
    price: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "review", "published", "scheduled", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    featuredMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    coverMediaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    mediaIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media",
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

PostSchema.virtual("featuredMedia", {
  ref: "Media",
  localField: "featuredMediaId",
  foreignField: "_id",
  justOne: true,
});

// ✅ Auto-generate `slug` before saving
PostSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.publishedAt && this.status === "published") {
    this.publishedAt = new Date();
  }
  next();
});

PostSchema.index({ title: "text", content: "text", tags: "text" });
PostSchema.index({ slug: 1, status: 1, publishedAt: -1 });

export default mongoose.model("Post", PostSchema);
