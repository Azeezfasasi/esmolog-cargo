import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { createToken, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role = 'user' } = body;

    console.log('[REGISTER] Attempting registration for email:', email);

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('[REGISTER] Email already exists:', email);
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    console.log('[REGISTER] Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('[REGISTER] Password hashed, length:', hashedPassword?.length);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    console.log('[REGISTER] User created successfully');
    console.log('[REGISTER] Stored password hash length:', user.password?.length);

    const token = createToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[REGISTER] Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}

