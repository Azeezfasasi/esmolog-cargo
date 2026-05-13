import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import MessageSlide from '@/server/models/MessageSlides';

// Validate request body for creating/updating slides
function validateMessageSlide(data) {
  const errors = [];
  
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required and must be a string');
  } else if (data.message.trim().length === 0) {
    errors.push('Message cannot be empty');
  } else if (data.message.length > 500) {
    errors.push('Message cannot exceed 500 characters');
  }
  
  if (data.title && typeof data.title !== 'string') {
    errors.push('Title must be a string');
  } else if (data.title && data.title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }
  
  if (data.displayOrder !== undefined && typeof data.displayOrder !== 'number') {
    errors.push('Display order must be a number');
  }
  
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  
  if (data.backgroundColor && typeof data.backgroundColor !== 'string') {
    errors.push('Background color must be a string');
  }
  
  if (data.icon && typeof data.icon !== 'string') {
    errors.push('Icon must be a string');
  }
  
  return errors;
}

/**
 * GET /api/message-slides
 * Fetch all message slides or filter by query parameters
 * Query params: isActive (boolean), limit (number), skip (number), sort (string)
 */
export async function GET(request) {
  try {
    await connectDB();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');
    const sort = searchParams.get('sort') || '-createdAt';
    
    // Build query
    const query = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    // Fetch slides with pagination
    const slides = await MessageSlide.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select('-__v');
    
    const total = await MessageSlide.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: slides,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching message slides:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch message slides',
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/message-slides
 * Create a new message slide
 */
export async function POST(request) {
  try {
    // Verify authentication
    const auth = await requireAuth(request, ['admin']);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Validate input
    const validationErrors = validateMessageSlide(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          errors: validationErrors
        },
        { status: 400 }
      );
    }
    
    // Create new slide
    const newSlide = new MessageSlide({
      title: body.title || body.message.substring(0, 50),
      message: body.message.trim(),
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
      icon: body.icon || null,
      backgroundColor: body.backgroundColor || '#1976D2'
    });
    
    await newSlide.save();
    
    return NextResponse.json(
      {
        success: true,
        message: 'Message slide created successfully',
        data: newSlide
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message slide:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create message slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


