
import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ className = "", textClassName = "text-xl", showText = true }: { className?: string, textClassName?: string, showText?: boolean }) => (
  <Link to="/" className={`flex items-center gap-2.5 transition-transform active:scale-95 ${className}`}>
    <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <rect width="48" height="48" rx="14" fill="url(#paint0_linear)" />
        <path d="M24 26C18.4772 26 14 30.4772 14 36H34C34 30.4772 29.5228 26 24 26Z" fill="white"/>
        <circle cx="24" cy="17" r="6" fill="white"/>
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7c3aed"/>
            <stop offset="1" stopColor="#6d28d9"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-brand-50">
         <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
         </svg>
      </div>
    </div>
    {showText && (
      <span className={`font-black tracking-tighter text-gray-900 ${textClassName}`}>
        myprofilelink
      </span>
    )}
  </Link>
);
