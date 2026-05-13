import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { signJWT } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('[LOGIN] Attempting login for email:', email);
    
    await connectDB();
    console.log('[LOGIN] Database connected');
    
    const user = await User.findOne({ email }).lean();
    console.log('[LOGIN] User found:', !!user);
    
    if (!user) {
      console.log('[LOGIN] User not found in database for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('[LOGIN] Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', isMatch);
    console.log('[LOGIN] User password hash exists:', !!user.password);
    console.log('[LOGIN] User password hash length:', user.password?.length);
    
    if (!isMatch) {
      console.log('[LOGIN] Password mismatch for user:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('[LOGIN] Login successful for:', email);
    
    const token = signJWT({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
    
    const response = NextResponse.json({
      success: true,
      token: token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('[LOGIN] Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
