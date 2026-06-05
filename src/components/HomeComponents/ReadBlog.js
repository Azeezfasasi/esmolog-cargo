import React from 'react';

function ReadBlog() {
  // Dummy data for blog posts to populate the cards
  const blogPosts = [
    {
      id: 1,
      category: 'RELATIONSHIP',
      title: 'WATCH AND LISTEN TO OUR SERMONS',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      author: 'Mathew Johnson',
      date: 'Tuesday 13 May, 2021',
    },
    {
      id: 2,
      category: 'RELATIONSHIP',
      title: 'WATCH AND LISTEN TO OUR SERMONS',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      author: 'Mathew Johnson',
      date: 'Tuesday 13 May, 2021',
    },
    {
      id: 3,
      category: 'RELATIONSHIP',
      title: 'WATCH AND LISTEN TO OUR SERMONS',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      author: 'Mathew Johnson',
      date: 'Tuesday 13 May, 2021',
    },
    {
      id: 4,
      category: 'RELATIONSHIP',
      title: 'WATCH AND LISTEN TO OUR SERMONS',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
      author: 'Mathew Johnson',
      date: 'Tuesday 13 May, 2021',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Top Section: Sub-headline and Main Headline */}
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          READ OUR BLOG
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-16">
          SHARE, INSPIRE, INNOVATE
        </h2>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {blogPosts.map((post, index) => (
            <div
              key={post.id}
              className="bg-orange-50 p-6 rounded-lg shadow-md flex flex-col text-left group"
            >
              {/* Category */}
              <p className="text-sm uppercase tracking-widest text-orange-500 mb-2">
                {post.category}
              </p>
              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h3>
              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
                {post.description}
              </p>
              {/* Author and Date */}
              <div className="text-gray-600 text-sm mt-auto"> {/* mt-auto pushes it to the bottom */}
                <p className="font-semibold">{post.author}</p>
                <p className="text-xs">{post.date}</p>
              </div>
              {/* Bottom Accent Bar (only for the first card as per image) */}
              {index === 0 && (
                <div className="w-2/3 h-2 bg-orange-300 rounded-full mt-6 self-start"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReadBlog;
