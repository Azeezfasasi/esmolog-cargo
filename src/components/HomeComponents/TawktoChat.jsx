'use client';

import React, { useEffect, useRef } from 'react';

const TawkToChat = () => {
  // Use a ref to ensure the script is only loaded once, even on re-renders
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only load the script if it hasn't been loaded before
    if (scriptLoaded.current) {
      return;
    }

    // Check if Tawk.to script is already present in the DOM
    // This helps prevent duplicate loading if the component mounts/unmounts rapidly
    const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
    if (existingScript) {
      console.log('Tawk.to script already exists, skipping re-insertion.');
      scriptLoaded.current = true; // Mark as loaded even if already present
      return;
    }

    console.log('Inserting Tawk.to script...');

    // Define Tawk.to API globals
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Create the script element
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0]; // Get the first script tag in the document

    s1.async = true; // Load asynchronously
    s1.src = 'https://embed.tawk.to/68933c97ddd4a01926701df8/1j1vi9c20'; // Your Tawk.to widget URL
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*'); // Allow cross-origin loading

    // Insert the script before the first existing script tag
    s0.parentNode.insertBefore(s1, s0);

    scriptLoaded.current = true; // Mark the script as loaded

    // Optional: Cleanup function if the component unmounts.
    // For Tawk.to, typically you want the chat widget to persist
    // across route changes, so a full cleanup might not be desired.
    // However, if you have specific scenarios where you want to remove
    // the chat widget (e.g., for a very specific page where it shouldn't appear),
    // you would implement removal logic here.
    // For most cases, leaving the widget active is the intent.
    return () => {
      // Example cleanup (uncomment if needed, but test thoroughly as Tawk.to might not fully remove)
      // const tawkScript = document.querySelector('script[src*="embed.tawk.to"]');
      // if (tawkScript) {
      //   tawkScript.remove();
      //   console.log('Tawk.to script removed on unmount.');
      // }
      // // Also try to hide the widget if Tawk_API is available
      // if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
      //   window.Tawk_API.hideWidget();
      // }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // This component doesn't render any visible JSX itself,
  // it only handles the script injection.
  return null;
};

export default TawkToChat;
