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
    category: {
      type: String,
      enum: ["TrustEvent", "TrustMedia", "TrustProd", "uncategorized"], // ✅ Restrict to predefined categories
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
  },
  { timestamps: true }
);

// ✅ Auto-generate `slug` before saving
PostSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Post", PostSchema);
