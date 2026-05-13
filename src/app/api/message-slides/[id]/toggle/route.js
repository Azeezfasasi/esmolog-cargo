import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import MessageSlide from '@/server/models/MessageSlides';
import { ObjectId } from 'mongodb';

// Helper function to validate MongoDB ObjectId
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * PATCH /api/message-slides/[id]/toggle
 * Toggle the active status of a message slide
 */
export async function PATCH(request, { params }) {
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
    
    // Get current slide
    const slide = await MessageSlide.findById(id);
    
    if (!slide) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message slide not found' 
        },
        { status: 404 }
      );
    }
    
    // Toggle isActive status
    const updatedSlide = await MessageSlide.findByIdAndUpdate(
      id,
      { isActive: !slide.isActive },
      { new: true }
    ).select('-__v');
    
    return NextResponse.json({
      success: true,
      message: `Message slide ${updatedSlide.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedSlide
    });
  } catch (error) {
    console.error('Error toggling message slide status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to toggle message slide status',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
