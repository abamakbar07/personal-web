import { NextResponse } from 'next/server';
import connectToDatabase from '../../lib/db';
import Contact from '../../models/contact';
import nodemailer from 'nodemailer';

// Prevent static generation of this route
export const dynamic = 'force-dynamic';

// Create email transporter
const createTransporter = () => {
  // Replace these with environment variables
  const email = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: email,
      pass: password,
    },
  });
};

// Send email notification
const sendEmailNotification = async (name: string, email: string, message: string) => {
  try {
    const transporter = createTransporter();
    
    // Replace with your email
    const toEmail = process.env.TO_EMAIL || process.env.EMAIL_USER;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

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

    // Send email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendEmailNotification(name, email, message);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue execution, don't fail the request just because email failed
      }
    }

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