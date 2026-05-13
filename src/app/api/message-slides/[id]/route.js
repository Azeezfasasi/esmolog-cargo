import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import MessageSlide from '@/server/models/MessageSlides';
import { ObjectId } from 'mongodb';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

// Validate request body for updates
function validateMessageSlide(data) {
  const errors = [];
  
  if (data.message !== undefined) {
    if (typeof data.message !== 'string') {
      errors.push('Message must be a string');
    } else if (data.message.trim().length === 0) {
      errors.push('Message cannot be empty');
    } else if (data.message.length > 500) {
      errors.push('Message cannot exceed 500 characters');
    }
  }
  
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('Title must be a string');
    } else if (data.title.length > 100) {
      errors.push('Title cannot exceed 100 characters');
    }
  }
  
  if (data.displayOrder !== undefined && typeof data.displayOrder !== 'number') {
    errors.push('Display order must be a number');
  }
  
  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  
  if (data.backgroundColor !== undefined && typeof data.backgroundColor !== 'string') {
    errors.push('Background color must be a string');
  }
  
  if (data.icon !== undefined && typeof data.icon !== 'string') {
    errors.push('Icon must be a string');
  }
  
  return errors;
}

/**
 * GET /api/message-slides/[id]
 * Fetch a single message slide by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid slide ID format' 
        },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const slide = await MessageSlide.findById(id).select('-__v');
    
    if (!slide) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message slide not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: slide
    });
  } catch (error) {
    console.error('Error fetching message slide:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch message slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/message-slides/[id]
 * Update an existing message slide
 */
export async function PUT(request, { params }) {
  try {
    // Verify authentication
    const auth = await requireAuth(request, ['admin']);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }
    
    const { id } = params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid slide ID format' 
        },
        { status: 400 }
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
    
    // Update slide
    const updatedSlide = await MessageSlide.findByIdAndUpdate(
      id,
      {
        ...(body.title && { title: body.title }),
        ...(body.message && { message: body.message.trim() }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.displayOrder !== undefined && { displayOrder: body.displayOrder }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.backgroundColor && { backgroundColor: body.backgroundColor })
      },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedSlide) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message slide not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message slide updated successfully',
      data: updatedSlide
    });
  } catch (error) {
    console.error('Error updating message slide:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update message slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/message-slides/[id]
 * Delete a message slide
 */
export async function DELETE(request, { params }) {
  try {
    // Verify authentication
    const auth = await requireAuth(request, ['admin']);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }
    
    const { id } = params;
    
    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid slide ID format' 
        },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const deletedSlide = await MessageSlide.findByIdAndDelete(id);
    
    if (!deletedSlide) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message slide not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message slide deleted successfully',
      data: deletedSlide
    });
  } catch (error) {
    console.error('Error deleting message slide:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete message slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
