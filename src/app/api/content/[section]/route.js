import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Content from '@/server/models/Content';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { section } = params;
    
    try {
      await connectDB();
      const content = await Content.findOne({ section }).lean();
      
      if (content) {
        return NextResponse.json({ data: content.data });
      }
    } catch (dbError) {
      console.warn('Database unavailable, returning default content:', dbError.message);
    }
    
    // Return default content if DB fails or content not found
    return NextResponse.json({ data: getDefaultContent(section) });
    
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(request, ['admin', 'manager']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const { section } = params;
    const { data } = await request.json();
    
    await connectDB();
    
    const content = await Content.findOneAndUpdate(
      { section },
      { data, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, data: content.data });
    
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function getDefaultContent(section) {
  const defaults = {
    hero: {
      title: 'LASU MBA ONBOARDING TOOLKIT',
      subtitle: 'Dear Managers, welcome to the LASU MBA community!',
      description: "It's Not Just About Academics\nYou'll get far more from networking, collaborations, side projects, and informal meetups than from textbooks. Your classmates are CEOs, Consultants, and policymakers, connect wisely.",
      button1Text: 'Important Steps',
      button1Target: 'steps',
      button2Text: 'People To Know',
      button2Target: 'people',
      backgroundImage: '/images/hero3.jpg',
    },
    mission: {
      title: 'MISSION',
      heading: 'LASU MBA COMMUNITY',
      description: "We're thrilled to have you join us on this exciting journey and as you embark on this transformative and exciting experience, we want you to know that you're not alone. You're part of a vibrant community of like-minded individuals who are passionate about learning, growth, making positive impact and ready to support and inspire each other.",
      image: '/images/mission.svg',
    },
    community: {
      title: 'The Power of Community and Collaboration',
      description: 'At LASU MBA, we believe that community and collaboration are the keys to success. By working together, sharing ideas, and supporting one another, we can achieve great things. Our community is built on the principles of mutual respect, trust and a shared passion for excellence.\n\nAs AL-AMEEN always says, "Leadership starts with service." We\'re committed to creating an environment where you can grow, learn, and thrive. Whether you\'re looking for academic support, career guidance, or simply a friendly ear, we\'re here for you.',
      image: '/images/lasu.jpg',
    },
    steps: {
      title: 'IMPORTANT FIRST STEPS',
      subtitle: 'To kick off your MBA journey, here are some essential steps to take:',
      items: [
        {
          title: 'Payment of Important Fees',
          description: 'After you have been offered admission, visit the school portal to pay the required fees like Acceptance Fee, Medical Fee, LACACA Fee and Library Fee.',
        },
        {
          title: 'School fee payment',
          description: 'The school fee payment can be made in two (2) installments of 70% and 30%.',
        },
        {
          title: 'Activate Your LASU Student Portal',
          description: 'In order to access essential resources and information through the portal activate your LASU student portal and ensure you complete your course registration as soon as possible.',
        },
        {
          title: 'Familiarize yourself with the campus to make your transition smoother',
          description: 'Class Venues: Know where your classes will take place.\nFaculty Office: Find out where to meet your professors.\nLibrary: Discover the resources available for your studies.\nCool Spots: Check out popular locations to relax or grab a bite.',
        },
        {
          title: '',
          description: 'To stay updated on important announcement click here For further information: https://chat.whatsapp.com/DOkruJS6Epl8jqdeFZ29X5',
        },
      ],
      note: {
        title: '',
        text: 'LASU is renowned for its commitment to academic excellence. As such, all lectures must be taken seriously, and class attendance is compulsory.\n\nThe pass mark is set at 50%. Final scores are determined through a combination of examinations and Continuous Assessments (CAs). The examination constitutes 70% of the total score, while the remaining 30% comes from CAs, which may include tests, assignments, and class participation, including attendance.',
        grading: [
          'A - 70% and above',
          'B - 60% - 69%',
          'C - 50% - 59%',
          'Less than 50% - FAIL',
        ],
      },
    },
    people: {
      title: 'PEOPLE TO KNOW',
      subtitle: 'Building connections is vital to your MBA experience. Get to know the key people who will support you throughout your studies',
      items: [
        'Coordinator of MBA Program',
        'Dean of Post Graduate School',
        'Program Secretary',
        'LASUMBA Executives',
        'GBENUSI Community',
      ],
    },
    network: {
      title: 'Your MBA network starts now, engage with your community from the start.',
      subtitle: 'Below are upcoming important events:',
      events: [
        'LASUMBA Election: Participate in the voting process to choose the right team for your needs. AL-AMEEN has the capacity to show!',
        'MBA Orientation Program: Participate in this event that is organized and designed to welcome and integrate new students into the LASU MBA program.',
        'Get involved and expand your network by joining LASUMBA and GBENUSI Community.',
      ],
      quote: 'As you begin this journey, remember to "enjoy the journey, not just the destination." The future is in our hands and AL-AMEEN is committed to making this MBA experience smoother for everyone.',
    },
  };
  
  return defaults[section] || {};
}
