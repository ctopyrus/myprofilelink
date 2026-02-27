import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Zap, Smartphone, IndianRupee, Globe, Layers, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const Hero = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      navigate(`/signup?username=${username}`);
    }
  };

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto pt-16 pb-24 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
          
          {/* LEFT: Copy & CTA */}
          <div className="lg:col-span-6 text-center lg:text-left mb-12 lg:mb-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-bold mb-6 border border-brand-100">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 mr-2 animate-pulse"></span>
              Join 10,000+ Indian Creators
            </div>
            
            <h1 className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl mb-6 leading-tight">
              Everything you are, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">in one simple link.</span>
            </h1>
            
            <p className="mt-4 text-lg text-gray-500 mb-8 leading-relaxed">
              Stop losing followers to scattered links. Create a beautiful page to showcase your videos, sell products via UPI, and grow your WhatsApp community.
            </p>

            {/* CLAIM USERNAME INPUT */}
            <form onSubmit={handleClaim} className="max-w-md mx-auto lg:mx-0 relative mb-8 group">
              <div className="flex items-center shadow-lg rounded-full border-2 border-gray-100 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-50 transition-all bg-white p-2">
                <span className="pl-4 text-gray-400 font-medium select-none">myprofilelink.in/</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                  placeholder="yourname"
                  className="flex-1 outline-none text-gray-900 font-bold placeholder-gray-300 bg-transparent py-2"
                />
                <button 
                  type="submit"
                  className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  Claim my Link
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 pl-4">Free forever. No credit card required.</p>
            </form>

            {/* TRUST BADGES */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
               <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Instant Setup</div>
               <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> 0% Transaction Fees</div>
               <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Mobile Optimized</div>
            </div>
          </div>

          {/* RIGHT: Visual / Phone Mockup */}
          <div className="lg:col-span-6 relative">
             {/* Background blobs */}
             <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
             <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
             
             <div className="relative mx-auto w-[280px] h-[580px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                <img 
                  src="https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=800&auto=format&fit=crop" 
                  alt="App Preview" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 flex flex-col justify-end p-6 text-white">
                    <div className="font-bold text-xl">Rahul's Store</div>
                    <div className="text-sm opacity-80 mb-4">Tech Reviewer & Creator</div>
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg"></div>
                        <div className="flex-1 h-2 bg-white/50 rounded"></div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg"></div>
                        <div className="flex-1 h-2 bg-white/50 rounded"></div>
                    </div>
                </div>
             </div>
          </div>

        </div>
        
        {/* Features Grid - Quick Explainer */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 border-t border-gray-100 pt-16">
            <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-brand-600">
                    <Globe size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Your Corner of the Internet</h3>
                <p className="text-gray-500 text-sm">Don't rely on algorithms. Own your audience with a website that aggregates everything you do.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-green-600">
                    <IndianRupee size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Monetize Instantly</h3>
                <p className="text-gray-500 text-sm">Add UPI payment links, sell digital downloads, or book consultations without a complex store.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-indigo-600">
                    <Layers size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Designed to Convert</h3>
                <p className="text-gray-500 text-sm">Professionally designed templates that look great on every device and load instantly.</p>
            </div>
        </div>

      </div>
    </div>
  );
};