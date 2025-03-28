import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Feedback from '../../../models/feedback';

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the form type from the query parameter
    const url = new URL(req.url);
    const formType = url.searchParams.get('formType');

    // Build query
    const query = formType ? { formType } : {};

    // Get the feedback data
    const feedbackList = await Feedback.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ 
      success: true, 
      data: feedbackList 
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch feedback' 
    }, { status: 500 });
  }
} 