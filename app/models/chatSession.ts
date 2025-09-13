import mongoose, { Schema, Document } from 'mongoose';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSessionDocument extends Document {
  sessionId: string;
  messages: Message[];
  createdAt: Date;
  expiresAt: Date;
}

const MessageSchema = new Schema<Message>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSessionSchema = new Schema<ChatSessionDocument>({
  sessionId: { type: String, required: true, unique: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 1000 * 60 * 60 * 24) } // 24h TTL
});

// Automatically remove expired sessions
ChatSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ChatSession || mongoose.model<ChatSessionDocument>('ChatSession', ChatSessionSchema);
