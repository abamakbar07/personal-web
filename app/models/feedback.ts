import mongoose, { Schema, Document } from 'mongoose';

// Interface for the Feedback document
export interface FeedbackDocument extends Document {
  formType: string;
  name?: string;
  age?: number;
  gameFrequency?: string;
  accessExperience?: string;
  accessDifficulties?: string[];
  gameUnderstanding?: string;
  featureClarity?: string;
  confusingFeatures?: string;
  questionDifficulty?: string;
  rewardSystem?: string;
  rewardSuggestions?: string;
  improvementSuggestions?: string;
  errorFeedback?: string;
  wouldRetry?: string;
  createdAt: Date;
}

// Feedback schema
const FeedbackSchema = new Schema<FeedbackDocument>({
  formType: { type: String, required: true }, // To identify which feedback form it is (e.g., "THR-APP")
  name: { type: String },
  age: { type: Number },
  gameFrequency: { type: String, enum: ['Sering | lebih dari 3x seminggu', 'Kadang-kadang | 1-2x seminggu', 'Jarang | sekali dalam sebulan atau lebih jarang', 'Tidak pernah'] },
  accessExperience: { type: String, enum: ['Sangat mudah', 'Cukup mudah', 'Sedikit sulit', 'Sangat sulit'] },
  accessDifficulties: [{ type: String }],
  gameUnderstanding: { type: String, enum: ['Sangat mudah', 'Cukup mudah', 'Sedikit sulit', 'Sangat sulit'] },
  featureClarity: { type: String, enum: ['Ya, semuanya jelas', 'Beberapa fitur masih membingungkan', 'Sulit memahami fitur yang ada'] },
  confusingFeatures: { type: String },
  questionDifficulty: { type: String, enum: ['Sudah pas', 'Terlalu mudah', 'Terlalu sulit', 'Terlalu banyak pertanyaan', 'Terlalu sedikit pertanyaan'] },
  rewardSystem: { type: String, enum: ['Sangat menarik', 'Cukup menarik', 'Kurang menarik', 'Tidak menarik'] },
  rewardSuggestions: { type: String },
  improvementSuggestions: { type: String },
  errorFeedback: { type: String },
  wouldRetry: { type: String, enum: ['Ya', 'Mungkin', 'Tidak'] },
  createdAt: { type: Date, default: Date.now }
});

// Create or retrieve the model
export default mongoose.models.Feedback || mongoose.model<FeedbackDocument>('Feedback', FeedbackSchema); 