import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  blogTitle: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' }
}, { timestamps: true });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
