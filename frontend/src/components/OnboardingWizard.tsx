import React, { useState } from 'react';
import { UserProfile, Template } from '../types';
import { TEMPLATES } from '../constants';
import { ShoppingBag, Users, Zap, Briefcase, Camera, ArrowRight, Check, Rocket } from 'lucide-react';

interface OnboardingWizardProps {
  user: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

type Goal = 'monetize' | 'grow' | 'showcase' | 'professional';
type Vibe = 'minimal' | 'vibrant' | 'dark' | 'professional';

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(0); // Started at 0 for Welcome
  const [goal, setGoal] = useState<Goal | null>(null);
  const [vibe, setVibe] = useState<Vibe | null>(null);

  // Step 3: Filter templates based on logic
  const getRecommendedTemplates = () => {
    let scores = TEMPLATES.map(t => {
      let score = 0;
      // Scored based on tags/category matches
      if (goal === 'monetize' && t.category === 'E-commerce') score += 5;
      if (goal === 'grow' && (t.category === 'Community' || t.category === 'Influencer')) score += 5;
      if (goal === 'showcase' && t.category === 'Creative') score += 5;
      if (goal === 'professional' && t.category === 'Coaching') score += 5;

      if (vibe && t.tags?.includes(vibe)) score += 3;
      
      return { template: t, score };
    });

    return scores.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.template);
  };

  const handleTemplateSelect = (t: Template) => {
    onComplete({
        ...user,
        templateId: t.id,
        blocks: t.initialBlocks,
        style: t.initialStyle,
        onboardingCompleted: true
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 w-full">
            <div 
                className="h-full bg-brand-600 transition-all duration-500 ease-in-out"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
            ></div>
          </div>

          <div className="p-8 md:p-12">
            
            {/* STEP 0: WELCOME */}
            {step === 0 && (
                <div className="animate-fadeIn text-center">
                    <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Rocket className="text-brand-600 w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to the future, {user.displayName || 'Creator'}!</h2>
                    <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
                        You are minutes away from launching a beautiful page that aggregates your content, sells your products, and grows your community.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-10">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">🚀  Instant Launch</h3>
                            <p className="text-sm text-gray-500">Pick a template, add your links, and go live instantly.</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">💸  Zero Fees</h3>
                            <p className="text-sm text-gray-500">Keep 100% of what you earn. We don't take a cut.</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">🎨  Total Control</h3>
                            <p className="text-sm text-gray-500">Customize colors, fonts, and layouts to match your brand.</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setStep(1)}
                        className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg"
                    >
                        Let's Build Your Page
                    </button>
                </div>
            )}

            {/* STEP 1: GOAL */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">What is your primary goal?</h2>
                <p className="text-lg text-gray-500 mb-8">This helps us recommend the right layout for you.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 'monetize', icon: ShoppingBag, title: 'Sell Products & Services', desc: 'I want to add store items and payment links.' },
                        { id: 'grow', icon: Users, title: 'Grow Community', desc: 'I want to get more followers and WhatsApp joins.' },
                        { id: 'showcase', icon: Camera, title: 'Showcase Portfolio', desc: 'I want to display my videos, photos, and blogs.' },
                        { id: 'professional', icon: Briefcase, title: 'Professional Brand', desc: 'I am a consultant, coach, or founder.' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setGoal(item.id as Goal)}
                            className={`flex items-start p-6 rounded-xl border-2 text-left transition-all hover:shadow-md ${goal === item.id ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-gray-200 hover:border-brand-200'}`}
                        >
                            <div className={`p-3 rounded-lg mr-4 ${goal === item.id ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                                <item.icon size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${goal === item.id ? 'text-brand-900' : 'text-gray-900'}`}>{item.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="mt-8 flex justify-end">
                    <button 
                        disabled={!goal}
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-full font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next Step <ArrowRight size={20}/>
                    </button>
                </div>
              </div>
            )}

            {/* STEP 2: VIBE */}
            {step === 2 && (
              <div className="animate-fadeIn">
                 <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Pick your aesthetic 🎨</h2>
                 <p className="text-lg text-gray-500 mb-8">Don't worry, you can change every detail later.</p>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: 'minimal', label: 'Minimal & Clean', color: '#f8fafc', text: '#334155' },
                        { id: 'vibrant', label: 'Bright & Vibrant', color: '#fce7f3', text: '#db2777' },
                        { id: 'dark', label: 'Dark & Edgy', color: '#18181b', text: '#e4e4e7' },
                        { id: 'professional', label: 'Professional Blue', color: '#eff6ff', text: '#1e40af' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setVibe(item.id as Vibe)}
                            className={`relative h-48 rounded-xl border-2 transition-all overflow-hidden group ${vibe === item.id ? 'border-brand-600 ring-2 ring-brand-600 ring-offset-2' : 'border-gray-200'}`}
                            style={{ backgroundColor: item.color }}
                        >
                            {vibe === item.id && (
                                <div className="absolute top-2 right-2 bg-brand-600 text-white p-1 rounded-full">
                                    <Check size={14} />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center p-4">
                                    <div className="w-16 h-4 bg-black/10 rounded mb-2 mx-auto"></div>
                                    <div className="w-24 h-4 bg-black/10 rounded mb-4 mx-auto"></div>
                                    <div className="w-8 h-8 rounded-full bg-black/5 mx-auto"></div>
                                </div>
                            </div>
                            <div className="absolute bottom-0 w-full p-3 bg-white/90 backdrop-blur-sm border-t border-black/5">
                                <span className="text-sm font-bold" style={{ color: item.text }}>{item.label}</span>
                            </div>
                        </button>
                    ))}
                 </div>
                 
                 <div className="mt-8 flex justify-between">
                    <button 
                        onClick={() => setStep(1)}
                        className="text-gray-500 font-medium hover:text-gray-900"
                    >
                        Back
                    </button>
                    <button 
                        disabled={!vibe}
                        onClick={() => setStep(3)}
                        className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-full font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        See Recommendations <ArrowRight size={20}/>
                    </button>
                </div>
              </div>
            )}

            {/* STEP 3: TEMPLATES */}
            {step === 3 && (
                <div className="animate-fadeIn">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">We found the best matches ✨</h2>
                    <p className="text-lg text-gray-500 mb-8">Based on your choices, these templates will help you succeed.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {getRecommendedTemplates().map(t => (
                            <div key={t.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all bg-white group flex flex-col">
                                <div className="h-40 bg-gray-100 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: t.previewColor }}>
                                     {/* Mini Visual */}
                                     <div className="w-24 h-32 bg-white shadow-lg rounded-lg transform rotate-[-5deg] group-hover:rotate-0 transition-transform"></div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg text-gray-900">{t.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 mb-4 flex-1">{t.description}</p>
                                    <button 
                                        onClick={() => handleTemplateSelect(t)}
                                        className="w-full py-2 bg-gray-900 text-white rounded-lg font-bold text-sm hover:bg-gray-800"
                                    >
                                        Use This Template
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-8 text-center">
                         <button onClick={() => handleTemplateSelect(TEMPLATES.find(t => t.id === 'blank')!)} className="text-gray-400 text-sm hover:text-gray-600 underline">
                             Skip & Start from Blank
                         </button>
                     </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};