import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    shippingType: {
      type: String,
      enum: ['Air Freight', 'Sea Freight', 'Road Transport', 'Other', null],
      default: null,
    },
    originCountry: {
      type: String,
      trim: true,
      default: null,
    },
    destinationCountry: {
      type: String,
      trim: true,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
    length: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'responded'],
      default: 'new',
    },
    replySubject: {
      type: String,
      default: null,
    },
    replyContent: {
      type: String,
      default: null,
    },
    repliedBy: {
      name: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
