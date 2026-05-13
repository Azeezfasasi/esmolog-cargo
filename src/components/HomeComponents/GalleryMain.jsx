'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Image from 'next/image';

function GalleryMain() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get('/api/gallery');
        console.log('GALLERY RESPONSE:', res.data);

        if (Array.isArray(res.data)) {
          setGalleryImages(res.data.filter((img) => img.status === 'active'));
        } else {
          console.error('Expected an array, but got:', res.data);
        }
      } catch (err) {
        console.error('Failed to fetch gallery images:', err);
      }
    };

    fetchGallery();
  }, []);

  const lightboxSlides = galleryImages.map((img) => ({
    src: img.imageUrl,
    alt: img.caption,
  }));

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8">Our Gallery</h2>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image._id}
              className="relative rounded-xl overflow-hidden shadow-md group cursor-pointer"
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}
            >
              <Image
                src={image.imageUrl}
                alt={image.caption}
                width={400}
                height={256}
                className="w-full h-64 object-cover group-hover:scale-105 transition duration-500 ease-in-out"
              />
              <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-sm px-3 py-2 text-left">
                <div className="font-semibold">{image.caption}</div>
                <div className="text-xs">{new Date(image.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Viewer */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Thumbnails]}
      />
    </section>
  );
}

export default GalleryMain;
