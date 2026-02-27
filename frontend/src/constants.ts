import { Template } from './types';

// Helper to generate IDs
const id = () => Math.random().toString(36).substr(2, 9);

export const TEMPLATES: Template[] = [
  {
    id: 'blank',
    name: 'Custom / Blank',
    description: 'A clean slate. Design it exactly your way.',
    category: 'All',
    previewColor: '#ffffff',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Welcome', visible: true },
      { id: id(), type: 'link', title: 'My First Link', url: '#', visible: true },
    ],
    tags: ['simple']
  },
  // --- INFLUENCER VARIATIONS ---
  {
    id: 'influencer',
    name: 'The Viral',
    description: 'Trendy gradients and pill buttons. For Instagram & TikTok.',
    category: 'Influencer',
    badge: 'Trending',
    previewColor: '#fce7f3',
    initialStyle: {
      backgroundType: 'gradient',
      backgroundColor: '#fce7f3',
      backgroundGradient: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)',
      textColor: '#4a044e',
      buttonColor: '#ffffff',
      buttonTextColor: '#db2777',
      buttonStyle: 'pill',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: '@sarahcreates', visible: true },
      { id: id(), type: 'media', title: 'New Vlog: Week in my life', url: 'https://www.youtube.com', imageUrl: 'https://picsum.photos/400/200?random=3', visible: true },
      { id: id(), type: 'link', title: 'My Skincare Routine', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Shop my Outfits', url: '#', visible: true },
    ],
    tags: ['vibrant', 'fun']
  },
  {
    id: 'influencer-dark',
    name: 'Night Mode',
    description: 'Sleek dark aesthetics for content creators.',
    category: 'Influencer',
    badge: 'Popular',
    previewColor: '#18181b',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#18181b',
      textColor: '#ffffff',
      buttonColor: '#27272a',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Davids Vlogs', visible: true },
      { id: id(), type: 'link', title: 'Latest Video', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Twitter / X', url: '#', visible: true },
    ],
    tags: ['dark', 'clean']
  },
  {
    id: 'influencer-minimal',
    name: 'Editorial',
    description: 'High-fashion, stark black and white. Focus on imagery.',
    category: 'Influencer',
    badge: 'Minimal',
    previewColor: '#ffffff',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      buttonColor: 'transparent',
      buttonTextColor: '#000000',
      buttonStyle: 'square',
      fontFamily: 'serif',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'ROHINI M.', visible: true },
      { id: id(), type: 'text', title: 'Digital Creator | Mumbai', visible: true },
      { id: id(), type: 'media', title: 'Portfolio 2024', url: '#', imageUrl: 'https://picsum.photos/400/250?random=33', visible: true },
      { id: id(), type: 'link', title: 'Contact Management', url: '#', visible: true },
    ],
    tags: ['minimal', 'professional']
  },
  
  // --- CREATIVE / GAMING ---
  {
    id: 'streamer',
    name: 'The Glitch',
    description: 'Dark mode with neon accents. For Gamers & Streamers.',
    category: 'Creative',
    badge: 'New',
    previewColor: '#0f172a',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#09090b',
      textColor: '#e4e4e7',
      buttonColor: '#22c55e',
      buttonTextColor: '#000000',
      buttonStyle: 'square',
      fontFamily: 'monospace',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'LIVE NOW 🔴', visible: true },
      { id: id(), type: 'link', title: 'Twitch Stream', subtitle: 'Valorant Ranked', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Discord Community', url: '#', visible: true },
      { id: id(), type: 'product', title: 'My Headset', subtitle: 'Gear List', price: '', url: '#', imageUrl: 'https://picsum.photos/200/200?random=10', visible: true },
    ],
    tags: ['dark', 'bold']
  },
  {
    id: 'artist',
    name: 'Art Gallery',
    description: 'Soft pastel tones to let your art pop.',
    category: 'Creative',
    previewColor: '#fff1f2',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#fff1f2',
      textColor: '#881337',
      buttonColor: '#ffffff',
      buttonTextColor: '#881337',
      buttonStyle: 'shadow',
      fontFamily: 'serif',
    },
    initialBlocks: [
        { id: id(), type: 'header', title: 'Art by Ananya', visible: true },
        { id: id(), type: 'product', title: 'Digital Prints', price: 'from ₹299', url: '#', visible: true },
        { id: id(), type: 'link', title: 'Commission Info', url: '#', visible: true }
    ],
    tags: ['soft', 'art']
  },

  // --- PROFESSIONAL / COACHING ---
  {
    id: 'coach',
    name: 'The Professional',
    description: 'Clean, trustworthy blue tones. For Consultants.',
    category: 'Coaching',
    badge: 'Popular',
    previewColor: '#f0f9ff',
    initialStyle: {
      backgroundType: 'gradient',
      backgroundColor: '#f0f9ff',
      backgroundGradient: 'linear-gradient(to bottom, #f0f9ff 0%, #e0f2fe 100%)',
      textColor: '#0c4a6e',
      buttonColor: '#0284c7',
      buttonTextColor: '#ffffff',
      buttonStyle: 'shadow',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'text', title: 'Helping Founders Scale.', visible: true },
      { id: id(), type: 'link', title: 'Book a Strategy Call', subtitle: '15 min Discovery', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Download Free Guide', url: '#', visible: true },
    ],
    tags: ['professional', 'clean']
  },
  {
    id: 'coach-dark',
    name: 'Executive',
    description: 'Premium dark blue & gold. For High-ticket sales.',
    category: 'Coaching',
    previewColor: '#1e3a8a',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#172554',
      textColor: '#ffffff',
      buttonColor: '#fbbf24',
      buttonTextColor: '#451a03',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Rajiv Consultant', visible: true },
      { id: id(), type: 'link', title: 'Apply for Mentorship', subtitle: 'Limited Spots', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Watch Masterclass', url: '#', visible: true },
    ],
    tags: ['professional', 'dark']
  },
   {
    id: 'yoga',
    name: 'Wellness',
    description: 'Earth tones and serenity. For Yoga & Health.',
    category: 'Coaching',
    previewColor: '#f7fee7',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#ecfccb',
      textColor: '#365314',
      buttonColor: '#65a30d',
      buttonTextColor: '#ffffff',
      buttonStyle: 'pill',
      fontFamily: 'sans-serif',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Breathe & Flow', visible: true },
      { id: id(), type: 'link', title: 'Morning Routine PDF', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Join Retreat', url: '#', visible: true },
    ],
    tags: ['nature', 'calm']
  },

  // --- LIFESTYLE ---
  {
    id: 'luxury',
    name: 'The Aesthetic',
    description: 'Soft beige, serif fonts. For Lifestyle & Fashion.',
    category: 'Influencer',
    previewColor: '#fffbeb',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#fffbeb',
      textColor: '#78350f',
      buttonColor: '#ffffff',
      buttonTextColor: '#78350f',
      buttonStyle: 'rounded',
      fontFamily: 'serif',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Curated Finds', visible: true },
      { id: id(), type: 'product', title: 'Silk Scarf', subtitle: 'Autumn Collection', price: '₹1,499', url: '#', imageUrl: 'https://picsum.photos/200/200?random=20', visible: true },
      { id: id(), type: 'link', title: 'Read the Blog', url: '#', visible: true },
    ],
    tags: ['minimal', 'soft']
  },

  // --- TECH ---
  {
    id: 'techie',
    name: 'The Founder',
    description: 'Glassmorphism and gradients. For SaaS & Tech.',
    category: 'Tech',
    previewColor: '#4f46e5',
    initialStyle: {
      backgroundType: 'gradient',
      backgroundColor: '#4f46e5',
      backgroundGradient: 'linear-gradient(to bottom right, #4f46e5, #ec4899)',
      textColor: '#ffffff',
      buttonColor: 'rgba(255,255,255,0.2)',
      buttonTextColor: '#ffffff',
      buttonStyle: 'glass',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'text', title: 'Building public infrastructure.', visible: true },
      { id: id(), type: 'link', title: 'My Startup', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Github', url: '#', visible: true },
    ],
    tags: ['modern', 'vibrant']
  },

  // --- E-COMMERCE ---
  {
    id: 'seller',
    name: 'The Storefront',
    description: 'Product-first layout. For E-commerce.',
    category: 'E-commerce',
    badge: 'Best Seller',
    previewColor: '#fff1f2',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#fff1f2',
      textColor: '#881337',
      buttonColor: '#be123c',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Flash Sale ⚡', visible: true },
      { id: id(), type: 'product', title: 'Beach Tote', subtitle: 'Summer Essential', price: '₹999', url: '#', imageUrl: 'https://picsum.photos/200/200?random=1', visible: true },
      { id: id(), type: 'product', title: 'Sun Hat', subtitle: 'Limited Edition', price: '₹799', url: '#', imageUrl: 'https://picsum.photos/200/200?random=2', visible: true },
      { id: id(), type: 'link', title: 'Visit Full Store', url: '#', visible: true },
    ],
    tags: ['business', 'vibrant']
  },
  {
    id: 'seller-dark',
    name: 'Luxury Goods',
    description: 'Black and gold for high-end items.',
    category: 'E-commerce',
    previewColor: '#000000',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#000000',
      textColor: '#fbbf24',
      buttonColor: '#171717',
      buttonTextColor: '#fbbf24',
      buttonStyle: 'outline',
      fontFamily: 'serif',
    },
    initialBlocks: [
      { id: id(), type: 'header', title: 'Maison De Luxe', visible: true },
      { id: id(), type: 'product', title: 'Gold Watch', price: '₹12,499', url: '#', visible: true },
      { id: id(), type: 'link', title: 'New Arrivals', url: '#', visible: true },
    ],
    tags: ['luxury', 'dark']
  },
  {
    id: 'community',
    name: 'The Hub',
    description: 'Green & Friendly. For WhatsApp & Communities.',
    category: 'Community',
    previewColor: '#d1fae5',
    initialStyle: {
      backgroundType: 'solid',
      backgroundColor: '#064e3b',
      textColor: '#ecfdf5',
      buttonColor: '#10b981',
      buttonTextColor: '#ffffff',
      buttonStyle: 'rounded',
      fontFamily: 'Inter',
    },
    initialBlocks: [
      { id: id(), type: 'text', title: 'Join the family 👇', visible: true },
      { id: id(), type: 'link', title: 'WhatsApp Group', subtitle: 'Daily tips', url: '#', visible: true },
      { id: id(), type: 'link', title: 'Telegram Channel', url: '#', visible: true },
    ],
    tags: ['community', 'simple']
  },
];
