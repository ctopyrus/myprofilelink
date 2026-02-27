import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
               <Logo />
            </div>
            <p className="text-sm text-gray-500">
              One link to help you share everything you create, curate, and sell.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/pricing" className="text-base text-gray-500 hover:text-gray-900">Pricing</Link></li>
              <li><Link to="/examples" className="text-base text-gray-500 hover:text-gray-900">Examples</Link></li>
              <li><Link to="/templates" className="text-base text-gray-500 hover:text-gray-900">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/faq" className="text-base text-gray-500 hover:text-gray-900">FAQ</Link></li>
              <li><Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">Contact</Link></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Help Center</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privacy</a></li>
              <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Terms</a></li>
            </ul>
          </div>
                      <p className="text-xs text-gray-400 mt-4">© 2026 All Rights Reserved. Myprofilelink.in Made with ❤️ in India.</p>
        </div>
      </div>
    </footer>
  );
};