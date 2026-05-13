'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchContent } from '@/lib/api';
import Link from 'next/link';

export default function ImportantSteps() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent('steps')
      .then(data => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-[400px] bg-gray-50 animate-pulse" />;
  }

  const data = content || {
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
  };

  const items = data.items || [];
  const note = data.note || {};

  return (
    <div id="steps" className="mt-0 bg-gray-50 pt-0 md:pt-12 pb-2.5 md:pb-12">
      <div className="relative w-[95%] lg:w-[90%] mx-auto">
        <div className="w-full flex flex-col items-center justify-center mx-auto">
          <h2 className="playwrite-text text-[#303a42] text-center font-bold w-full text-xl lg:text-2xl">
            {data.title}
          </h2>
          <p className="text-[rgba(48,58,66,0.80)] text-center text-[15px] leading-[30px] font-normal tracking-wide">
            {data.subtitle}
          </p>
        </div>

        <div className="w-[97%] lg:w-[80%] shadow-md pl-3 mx-auto mt-5 mb-5 rounded-md border border-solid border-gray-200 bg-white overflow-x-hidden">
          {items.map((item, index) => (
            <div key={index} className="w-full flex flex-row items-start justify-center gap-1 mx-auto my-3">
              <Image src="/images/check.svg" alt="check" width={32} height={32} className="w-8 h-8 flex-shrink-0 mt-1" />
              <div className="w-full text-black text-left text-lg leading-[30px] font-normal">
                {item.title && <span className="font-semibold">{item.title}</span>}
                {item.title && <br />}
                <span className="whitespace-pre-line">{item.description}</span>
              </div>
            </div>
          ))}
          <div className='pl-8 pb-4'>
            <Link href="https://chat.whatsapp.com/HIYN1KS826Y3iJ38kM3p1k?mode=gi_t5" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:underline font-semibold">
              Click here for more information
            </Link>
          </div>
        </div>

      <div className="flex flex-col items-start justify-center relative overflow-hidden">
        <div className="w-[97%] lg:w-[40%] shadow-md px-6 mx-auto mt-5 mb-5 rounded-md border border-solid border-gray-200 bg-white">
          <div className="w-full flex flex-row items-center justify-center gap-1 mx-auto my-3">
            <div className="w-full text-black text-lg leading-[30px] font-normal text-justify">
              <p className="whitespace-pre-line">{note.text}</p>
              {note.grading && note.grading.length > 0 && (
                <ul className="mt-4 list-disc list-inside">
                  <span className="font-semibold">Grading Scale:</span>
                  {note.grading.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              )}
            </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}
