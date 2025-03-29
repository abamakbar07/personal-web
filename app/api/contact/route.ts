import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/db';
import Contact from '../../models/contact';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { name, email, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: 'Name, email, and message are required' 
      }, { status: 400 });
    }

    // Save to the database
    const contact = await Contact.create({
      name,
      email,
      message
    });

    // Respond with a success message
    return NextResponse.json({ 
      success: true,
      message: 'Form submitted successfully',
      id: contact._id
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json({ 
      error: 'Failed to submit form' 
    }, { status: 500 });
  }
} 