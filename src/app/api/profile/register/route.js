import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { hashPassword } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    // Verify authentication - only admin or employee can add users
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Check authorization - only admin and employees can add users
    if (!['admin', 'employee'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins and employees can add users' },
        { status: 403 }
      );
    }

    await connectDB();

    // Parse request body
    const {
      name,
      email,
      password,
      role,
      gender,
      phoneNumber,
      homeAddress,
      country,
      state,
    } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      gender: gender || '',
      phoneNumber: phoneNumber || '',
      homeAddress: homeAddress || '',
      country: country || '',
      state: state || '',
    });

    await newUser.save();

    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
