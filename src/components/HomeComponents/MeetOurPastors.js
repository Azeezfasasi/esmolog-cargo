import Image from 'next/image';

function MeetOurPastors() {
  // Dummy data for team members
  const teamMembers = [
    {
      id: 1,
      name: 'KIM BOWEN',
      title: 'Pastor, Church',
      image: 'https://placehold.co/150x150/CCCCCC/000000?text=Kim', // Placeholder image
      social: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
      },
    },
    {
      id: 2,
      name: 'DANIELLE WATKINS',
      title: 'Pastor, Church',
      image: 'https://placehold.co/150x150/FF8C00/FFFFFF?text=Danielle', // Placeholder image
      social: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
      },
    },
    {
      id: 3,
      name: 'NAOMI CRAIG',
      title: 'Pastor, Church',
      image: 'https://placehold.co/150x150/A0522D/FFFFFF?text=Naomi', // Placeholder image
      social: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
      },
    },
    {
      id: 4,
      name: 'SANTOS PAYNE',
      title: 'Pastor, Church',
      image: 'https://placehold.co/150x150/6A5ACD/FFFFFF?text=Santos', // Placeholder image
      social: {
        facebook: '#',
        twitter: '#',
        linkedin: '#',
      },
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Top Section: Sub-headline and Main Headline */}
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          CHURCH MEMBERS
        </p>
        <h2 className="text-[18px] sm:text-[24px] lg:text-[35px] font-extrabold text-gray-900 mb-16">
          MEET OUR INSPIRATIONAL MEMBERS
        </h2>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-gray-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center group"
            >
              {/* Member Image */}
              <div className="mb-6">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={144}
                  height={144}
                  className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-md transform group-hover:scale-105 transition-transform duration-300 ease-in-out"
                />
              </div>
              {/* Member Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {member.name}
              </h3>
              {/* Member Title */}
              <p className="text-gray-600 text-sm mb-4">
                {member.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MeetOurPastors;