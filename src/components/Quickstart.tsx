import React, { useState, useEffect, useRef } from 'react';
import Circles from '@site/src/components/circles';

export default function Quickstart() {
  // Image data provided by you
  const images = [
    './img/coolimgs/1fe86102-08d2-4481-83fe-a66ef157a4fe.png',
    './img/coolimgs/2b7a15f5-a9ab-4cf2-b0e3-c10bcd5e72c7.png',
    './img/coolimgs/2d5379e7-4fe6-4c55-9922-cb4ea9adfd1b.png',
    './img/coolimgs/7c06eb43-2173-4264-9c1f-2f4e8884b2bd.png',
    './img/coolimgs/14f2975a-d6d4-4517-9e01-8d96f153012c.png',
    './img/coolimgs/20f906ed-6697-4ae2-bc10-13bbd027289f.png',
    './img/coolimgs/30f36a43-ffb8-4685-9f44-590ed0d57fd8.png',
    './img/coolimgs/41fa95c2-706a-45f2-8931-b3c48902bfbd.png',
    './img/coolimgs/231cca55-4c4b-4599-b683-11f95ff0c590.png',
    './img/coolimgs/260a7b16-84fa-4525-8e30-67b7c9da36ed.png',
    './img/coolimgs/0942a4ef-cdb2-4444-a64c-76f066c93dc7.png',
    './img/coolimgs/1293ee45-725c-473b-8bf3-a782b9e81d91.png',
    './img/coolimgs/4823dec5-5543-4b2e-bc70-515be7d31606.png',
    './img/coolimgs/9578a4f7-d521-43f6-8465-5094ad9be0dc.png',
    './img/coolimgs/56432b2e-be20-4624-917d-feb273f34aee.png',
    './img/coolimgs/e7be0b20-2b91-44d7-b867-4ed186e37164.png',
  ];

  // State for enlarged image and auto-scroll index
  const [selectedImage, setSelectedImage] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const galleryRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (galleryRef.current) {
        setScrollIndex((prev) => {
          const newIndex = prev + 1;
          if (newIndex >= images.length) return 0;
          galleryRef.current.scrollTo({
            top: 0,
            left: newIndex * 200, // Adjust based on image width + gap
            behavior: 'smooth',
          });
          return newIndex;
        });
      }
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach((el) => {
        el.style.transform = `translateY(${scrollTop * -0.3}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative flex justify-end bg-yellow-400 mb-0 pb-32 sm:-mb-[100px] lg:-mb-[270px] lg:pb-[200px]">
      <div className="relative max-w-7xl m-auto">
        <div className="relative flex justify-end py-10">
          <div className="absolute bottom-0 sm:top-1/2 right-0">
            <Circles color="red" animate="animate-circle-delay-1" />
          </div>

          {/* Image Wall with Dynamic Effects */}
          <div
            ref={galleryRef}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-8 py-10 mb-20 w-full overflow-y-auto max-h-[800px] custom-scrollbar"
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="relative inline-block overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer parallax"
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-64 h-64 object-cover opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              </div>
            ))}
          </div>

          {/* Enlarged Image Modal with Rotation */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-spin-slow"
              onClick={() => setSelectedImage(null)}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-3/4 max-h-3/4 object-contain transition-transform duration-500 hover:rotate-3"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}