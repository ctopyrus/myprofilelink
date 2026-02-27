
import React from 'react';
import { Check, HelpCircle, Mail, X as XIcon, Crown, Sparkles, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TEMPLATES } from '../constants';
import { Preview } from './Preview';

export const PricingPage = () => (
  <div className="bg-white py-20 sm:py-32" id="pricing">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <div className="inline-flex bg-brand-50 text-brand-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">Plans & Access</div>
        <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
          One link to <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Power your entire career.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* FREE */}
        <div className="bg-gray-50 rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 flex flex-col hover:bg-white hover:shadow-xl transition-all">
          <div className="flex-1">
            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-4">Essential</h3>
            <div className="flex items-baseline text-gray-900 mb-2">
              <span className="text-5xl font-black">₹0</span>
              <span className="ml-1 text-xs font-bold text-gray-400 uppercase">Forever</span>
            </div>
            <p className="text-gray-500 font-medium text-sm mb-10 leading-relaxed">Perfect for creators just starting their journey.</p>
            
            <ul className="space-y-5">
              {[
                { label: '1 Smart Link', active: true },
                { label: 'Standard Themes', active: true },
                { label: 'Basic Analytics', active: true },
                { label: 'AI Customizer', active: false },
              ].map((item, i) => (
                <li key={i} className={`flex items-center gap-3 text-sm font-bold ${item.active ? 'text-gray-900' : 'text-gray-300 line-through'}`}>
                  {item.active ? <Check size={18} className="text-emerald-500 stroke-[3]"/> : <XIcon size={18}/>}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/signup?plan=free" className="mt-12 block w-full bg-white border-2 border-gray-100 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-gray-900 text-center hover:bg-gray-50 hover:border-gray-200 transition-all">Start Free</Link>
        </div>

        {/* PRO */}
        <div className="bg-white rounded-[3rem] p-8 sm:p-10 border-4 border-brand-500 shadow-2xl flex flex-col relative transform md:-translate-y-6">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Most Popular</div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-brand-500 uppercase tracking-widest mb-4 flex items-center gap-2">Professional <Crown size={16}/></h3>
            <div className="flex items-baseline text-gray-900 mb-2">
              <span className="text-5xl font-black">₹399</span>
              <span className="ml-1 text-xs font-bold text-gray-400 uppercase">/ Month</span>
            </div>
            <p className="text-gray-500 font-medium text-sm mb-10 leading-relaxed">Advanced tools for serious growth and branding.</p>

            <ul className="space-y-5">
              {[
                { label: 'Unlimited Links', active: true },
                { label: 'Remove Watermark', active: true },
                { label: '5 AI Layouts /mo', active: true },
                { label: 'Priority Support', active: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-black text-gray-900">
                  <Check size={18} className="text-brand-500 stroke-[4]"/>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/checkout?plan=pro" className="mt-12 block w-full bg-brand-600 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white text-center hover:bg-brand-700 shadow-xl shadow-brand-200 transition-all">Claim Pro</Link>
        </div>

        {/* BUSINESS */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 sm:p-10 border border-gray-800 flex flex-col text-white hover:shadow-2xl transition-all">
          <div className="flex-1">
            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">Business <Sparkles size={16} className="text-yellow-400"/></h3>
            <div className="flex items-baseline text-white mb-2">
              <span className="text-5xl font-black">₹699</span>
              <span className="ml-1 text-xs font-bold text-gray-400 uppercase">/ Month</span>
            </div>
            <p className="text-gray-400 font-medium text-sm mb-10 leading-relaxed">Total control with custom domains and power features.</p>

            <ul className="space-y-5">
              {[
                { label: 'Unlimited AI Access', active: true },
                { label: 'Custom Domains', active: true },
                { label: 'Team Accounts', active: true },
                { label: 'Advanced Analytics', active: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                  <Check size={18} className="text-yellow-400 stroke-[3]"/>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <Link to="/checkout?plan=business" className="mt-12 block w-full bg-white text-gray-900 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-center hover:bg-gray-100 transition-all">Go Global</Link>
        </div>
      </div>
    </div>
  </div>
);

export const ExamplesPage = () => (
  <div className="bg-white py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Built by the Best</h2>
        <p className="text-gray-500 font-medium mt-2">See how top Indian creators use myprofilelink.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {TEMPLATES.slice(1, 4).map((template) => (
          <div key={template.id} className="group relative">
             <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-[2.5rem] border-8 border-gray-50 shadow-xl transition-all group-hover:shadow-2xl group-hover:-translate-y-2 pointer-events-none">
                <Preview 
                    profile={{
                        uid: `example-${template.id}`,
                        displayName: template.name,
                        username: 'example',
                        plan: 'pro',
                        email: 'example@myprofilelink.in',
                        bio: '',
                        avatarUrl: '',
                        blocks: template.initialBlocks || [],
                        style: template.initialStyle,
                        templateId: template.id,
                        role: 'creator',
                        isVerified: true,
                        joinedAt: new Date().toISOString(),
                        subscriptionStatus: 'active' as const,
                        aiGenerationCount: 0,
                        onboardingCompleted: true
                    }} 
                    previewMode={true} 
                />
             </div>
             <div className="mt-6 text-center">
                 <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{template.name}</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase mt-1">{template.category}</p>
                 <Link to={`/signup?username=${template.id}`} className="mt-4 inline-block text-[10px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-colors">Start with this &rarr;</Link>
             </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const FAQPage = () => (
  <div className="bg-gray-50 min-h-screen py-20 px-4">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-black text-gray-900 text-center mb-12 tracking-tight">Common Questions</h2>
      <div className="space-y-4">
        {[
            { q: "Is it really free?", a: "Yes. Our Essential plan is ₹0 forever. We believe every creator should have a home online." },
            { q: "What's the catch with AI?", a: "AI generation uses the Google Gemini 3 models to analyze your niche and build a unique theme. It's a premium feature but free to try for Pro users." },
            { q: "Can I use UPI?", a: "Absolutely. You can add buttons that trigger GPay, PhonePe, or any UPI app instantly." }
        ].map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />
                    {item.q}
                </h3>
                <p className="mt-4 text-xs sm:text-sm text-gray-500 font-medium leading-relaxed ml-8">{item.a}</p>
            </div>
        ))}
      </div>
    </div>
  </div>
);

export const ContactPage = () => (
    <div className="bg-white py-24 px-4 overflow-hidden">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-4xl font-black tracking-tight text-gray-900">Need help?</h2>
        <p className="mt-4 text-gray-500 font-medium">We're usually around and happy to assist.</p>
        <div className="mt-12 bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 flex flex-col items-center">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-brand-600">
             <Mail size={24} />
           </div>
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Send us an email</p>
           <h3 className="text-xl font-black text-gray-900">hello@myprofilelink.in</h3>
           <a href="mailto:hello@myprofilelink.in" className="mt-8 bg-brand-600 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-all">Get in touch</a>
        </div>
      </div>
    </div>
);
