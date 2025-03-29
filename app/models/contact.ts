import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Contact document
export interface ContactDocument extends Document {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

// Contact schema
const ContactSchema = new Schema<ContactDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create or retrieve the model
export default mongoose.models.Contact || mongoose.model<ContactDocument>('Contact', ContactSchema); 