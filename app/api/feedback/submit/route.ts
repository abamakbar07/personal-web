import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Feedback from '../../../models/feedback';

export async function POST(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const data = await req.json();

    // Validate required fields
    if (!data.formType) {
      return NextResponse.json({ error: 'Form type is required' }, { status: 400 });
    }

    // Process the data
    const feedbackData = {
      formType: data.formType,
      name: data.name || undefined,
      age: data.age ? Number(data.age) : undefined,
      gameFrequency: data.gameFrequency || undefined,
      accessExperience: data.accessExperience || undefined,
      accessDifficulties: data.accessDifficulties || [],
      gameUnderstanding: data.gameUnderstanding || undefined,
      featureClarity: data.featureClarity || undefined,
      confusingFeatures: data.confusingFeatures || undefined,
      questionDifficulty: data.questionDifficulty || undefined,
      rewardSystem: data.rewardSystem || undefined,
      rewardSuggestions: data.rewardSuggestions || undefined,
      improvementSuggestions: data.improvementSuggestions || undefined,
      errorFeedback: data.errorFeedback || undefined,
      wouldRetry: data.wouldRetry || undefined,
    };

    // Add "Lainnya" text if present
    if (data.otherDifficulty && 
        feedbackData.accessDifficulties.includes('Lainnya')) {
      feedbackData.accessDifficulties = feedbackData.accessDifficulties.map(
        item => item === 'Lainnya' ? `Lainnya: ${data.otherDifficulty}` : item
      );
    }

    // Save to the database
    const feedback = await Feedback.create(feedbackData);

    return NextResponse.json({ 
      success: true, 
      message: 'Feedback submitted successfully',
      id: feedback._id 
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ 
      error: 'Failed to submit feedback' 
    }, { status: 500 });
  }
} 