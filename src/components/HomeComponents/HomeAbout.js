import Link from 'next/link';
import Image from 'next/image';

function HomeAbout() {
  // Dummy data for the most recent post
  const mostRecentPost = {
    id: 1,
    image: 'https://placehold.co/800x500/CCCCCC/000000?text=Children+Reading', // Placeholder image
    date: 'TUESDAY 13 MAY, 2022',
    author: 'JOHN HUNAU DEO',
    title: 'EXPERIENCING GOD’S POWER, WALKING IN HIS LIGHT',
    description: 'At CAC Lightway Assembly, we are a family rooted in Christ, empowered by the Holy Spirit, and committed to living out God’s Word. Join us as we worship, grow, and impact lives for the Kingdom. You are welcome here.',
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Most Recent Post Card */}
        <div className="bg-gray-50 rounded-lg shadow-lg overflow-hidden flex flex-col lg:flex-row items-stretch">
          {/* Image Section */}
          <div className="lg:w-1/2 flex-shrink-0">
            <Image
              src={mostRecentPost.image}
              alt="Children reading"
              width={800}
              height={500}
              className="w-full h-64 sm:h-80 lg:h-full object-cover object-center"
            />
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 p-8 flex flex-col justify-center text-left">

            {/* Title */}
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {mostRecentPost.title}
            </h3>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-8">
              {mostRecentPost.description}
            </p>

            {/* Read More Button */}
            <Link href="/app/about" className="w-fit px-8 py-3 bg-orange-300 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-orange-400 transition duration-300 ease-in-out transform hover:-translate-y-1">
              READ MORE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeAbout;
