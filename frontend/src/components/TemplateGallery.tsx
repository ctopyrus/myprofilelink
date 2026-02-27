
import React, { useState } from 'react';
import { TEMPLATES } from '../constants';
import { Template, TemplateCategory, UserProfile, Block } from '../types';
import { Check, Star, Plus, Sparkles, Loader, Lock, Layers, Layout, FileText, Palette, Zap, LayoutTemplate, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Preview } from './Preview';
import { useNavigate } from 'react-router-dom';


interface TemplateGalleryProps {
  onSelect: (templateData: Partial<UserProfile>) => void;
  user?: UserProfile; 
}

const CATEGORIES: TemplateCategory[] = ['All', 'E-commerce', 'Services', 'Coaching', 'Influencer', 'Community', 'Creative', 'Tech'];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, user }) => {
  const [filter, setFilter] = useState<TemplateCategory>('All');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Preview Modal State
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  
  const navigate = useNavigate();

const generateTemplate = async () => {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: aiPrompt
    })
  });

  const data = await response.json();
  console.log(data);
};

  const handleAiGenerate = async () => {
    if (user?.plan === 'free') {
        alert("Upgrade to Pro to use AI Generation.");
        navigate('/pricing');
        return;
    }
    if (user?.plan === 'pro' && (user?.aiGenerationCount || 0) >= 5) {
        alert("You have reached your 5 AI generation limit for this month. Upgrade to Business for unlimited.");
        navigate('/pricing');
        return;
    }

    if (!aiPrompt) return;
    setIsGenerating(true);
    
    try {
        const schemaDef = `
        {
            "name": "string",
            "description": "string",
            "category": "Creative", 
            "previewColor": "#hex",
            "initialStyle": {
                "backgroundType": "solid" | "gradient" | "image" | "mesh",
                "backgroundColor": "#hex",
                "backgroundGradient": "string (optional)",
                "textColor": "#hex",
                "buttonColor": "#hex",
                "buttonTextColor": "#hex",
                "buttonStyle": "rounded" | "pill" | "square" | "shadow" | "glass" | "outline",
                "fontFamily": "Inter" | "serif" | "monospace"
            },
            "initialBlocks": [
                { 
                    "id": "random_string", 
                    "type": "header" | "link" | "product" | "media" | "text", 
                    "title": "string", 
                    "url": "string (optional)", 
                    "subtitle": "string (optional)",
                    "price": "string (optional)",
                    "imageUrl": "string (optional)",
                    "visible": true 
                }
            ]
        }
        `;

        const systemInstruction = `
            You are a UI/UX designer. Generate a JSON object for a website template matching the user description.
            Return ONLY the raw JSON object matching the schema below.
            Schema: ${schemaDef}
        `;

        let jsonStr = '{}';
        const markdownMatch = jsonStr.match(/```json([\s\S]*?)```/) || jsonStr.match(/```([\s\S]*?)```/);
        if (markdownMatch) jsonStr = markdownMatch[1];
        else if (jsonStr.includes('{')) {
             const start = jsonStr.indexOf('{');
             const end = jsonStr.lastIndexOf('}');
             if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);
        }

        const generatedTemplate: Template = JSON.parse(jsonStr);
        if(generatedTemplate.initialStyle && Array.isArray(generatedTemplate.initialBlocks)) {
            generatedTemplate.id = `ai-${Date.now()}`;
            generatedTemplate.badge = 'AI';
            if (!CATEGORIES.includes(generatedTemplate.category)) generatedTemplate.category = 'Creative';
            setSelectedTemplate(generatedTemplate);
        } else {
            throw new Error("Invalid structure");
        }

    } catch (e) {
        console.error("AI Generation failed", e);
        alert("AI could not generate a valid template. Please try a different prompt.");
    } finally {
        setIsGenerating(false);
    }
  };

  const enforceFreePlanLimits = (blocks: Block[]): Block[] => {
      const restrictedTypes = ['link', 'product', 'media'];
      let restrictedCount = 0;
      
      return blocks.filter(b => {
          if (restrictedTypes.includes(b.type)) {
              if (restrictedCount < 1) {
                  restrictedCount++;
                  return true;
              }
              return false; // Remove excess
          }
          return true; // Keep header/text
      });
  };

  const finalizeSelection = (strategy: 'all' | 'design' | 'content') => {
      const target = previewTemplateId ? TEMPLATES.find(t => t.id === previewTemplateId) : selectedTemplate;
      if (!target) return;

      const updateData: Partial<UserProfile> = {};
      const isFree = user?.plan === 'free';

      if (strategy === 'all') {
          updateData.blocks = isFree ? enforceFreePlanLimits(target.initialBlocks) : target.initialBlocks;
          updateData.style = target.initialStyle;
      } else if (strategy === 'design') {
          updateData.style = target.initialStyle;
      } else if (strategy === 'content') {
           updateData.blocks = isFree ? enforceFreePlanLimits(target.initialBlocks) : target.initialBlocks;
      }
      
      if (isFree && (strategy === 'all' || strategy === 'content')) {
          const originalCount = target.initialBlocks.filter(b => ['link', 'product', 'media'].includes(b.type)).length;
          if (originalCount > 1) {
              alert("Only one item was imported due to your free plan. Upgrade to unlock full templates.");
          }
      }
      
      onSelect(updateData);
      navigate('/admin/editor');
  };

  const filteredTemplates = TEMPLATES.filter(t => {
      if (t.id === 'blank' && filter !== 'All') return false;
      return filter === 'All' ? true : t.category === filter;
  });

  const activePreviewTemplate = previewTemplateId ? TEMPLATES.find(t => t.id === previewTemplateId) : null;
  const activePreviewIndex = previewTemplateId ? TEMPLATES.findIndex(t => t.id === previewTemplateId) : -1;

  const navigatePreview = (direction: 'next' | 'prev') => {
      if (activePreviewIndex === -1) return;
      let newIndex = direction === 'next' ? activePreviewIndex + 1 : activePreviewIndex - 1;
      if (newIndex >= TEMPLATES.length) newIndex = 0;
      if (newIndex < 0) newIndex = TEMPLATES.length - 1;
      setPreviewTemplateId(TEMPLATES[newIndex].id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Choose your starting point</h2>
        </div>

        {/* AI Section */}
        <div className="max-w-3xl mx-auto mb-16 bg-white rounded-2xl p-1 shadow-lg ring-1 ring-gray-200">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Sparkles className="text-yellow-300 animate-pulse" /> Create with AI</h3>
                            <p className="text-indigo-100 text-sm mb-6 max-w-md">
                                {user?.plan === 'free' ? 'Upgrade to Pro to generate unique templates instantly.' : 'Describe your vibe and we\'ll build it.'}
                            </p>
                         </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="Describe your perfect profile..."
                            disabled={user?.plan === 'free'}
                            onKeyPress={(e) => e.key === 'Enter' && handleAiGenerate()}
                            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <button 
                            onClick={handleAiGenerate}
                            disabled={isGenerating || user?.plan === 'free'}
                            className="bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                        >
                            {isGenerating ? <Loader className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map(template => (
            <div key={template.id} className="group relative bg-white rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-[600px]">
              
              {/* Card Preview Area */}
              <div 
                className="flex-1 relative bg-gray-50 overflow-hidden cursor-pointer" 
                style={{ backgroundColor: template.previewColor }} 
                onClick={() => setPreviewTemplateId(template.id)}
              >
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/20 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                        <Eye size={18}/> Preview
                    </button>
                </div>

                {template.id === 'blank' ? (
                     <div className="w-full h-full flex items-center justify-center bg-gray-50">
                         <div className="text-center">
                             <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-white mx-auto mb-4"><Plus className="text-gray-400 w-8 h-8" /></div>
                             <span className="text-gray-500 font-medium">Empty Canvas</span>
                         </div>
                     </div>
                ) : (
                    // Centered, Scaled Preview Wrapper - LARGE SCALE
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[375px] h-[812px] origin-top transform scale-[0.75] shadow-2xl rounded-[3rem] border-[10px] border-gray-900 bg-white pointer-events-none">
                         <div className="w-full h-full overflow-hidden rounded-[2.3rem]">
                             <Preview 
                                    profile={{
                                        username: 'preview',
                                        email: '',
                                        uid: 'preview',
                                        role: 'creator',
                                        displayName: template.name,
                                        bio: template.description,
                                        avatarUrl: `https://picsum.photos/seed/${template.id}/200`,
                                        blocks: template.initialBlocks,
                                        style: template.initialStyle,
                                        isVerified: false,
                                        plan: 'pro',
                                        subscriptionStatus: 'active',
                                        onboardingCompleted: true,
                                        joinedAt: new Date().toISOString(),
                                        aiGenerationCount: 0
                                    }} 
                                    previewMode={true} 
                                    deviceMode="mobile"
                             />
                         </div>
                    </div>
                )}
              </div>

              <div className="p-6 bg-white relative z-30 border-t border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-600 mb-1">{template.category}</p>
                        <h3 className="text-lg font-bold text-gray-900 truncate">{template.name}</h3>
                    </div>
                    {template.badge && <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded">{template.badge}</span>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}
                  className="w-full flex items-center justify-center px-4 py-3 mt-4 border border-transparent text-sm font-bold rounded-xl transition-colors text-white bg-gray-900 hover:bg-black"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {previewTemplateId && activePreviewTemplate && (
          <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center animate-fadeIn">
              <button onClick={() => setPreviewTemplateId(null)} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[110]">
                  <X size={32}/>
              </button>

              <div className="flex flex-col items-center h-full py-10 w-full max-w-4xl px-4 relative z-[105]">
                  <h2 className="text-white text-2xl font-bold mb-2">{activePreviewTemplate.name}</h2>
                  <p className="text-white/60 mb-8">{activePreviewTemplate.category} • {activePreviewTemplate.description}</p>
                  
                  <div className="flex-1 w-full flex items-center justify-center overflow-hidden mb-8">
                        <div className="scale-[0.85] sm:scale-100 shadow-2xl rounded-[3rem] border-8 border-gray-800 overflow-hidden h-[700px] w-[350px] bg-white">
                            <Preview 
                                profile={{
                                    username: 'preview',
                                    email: '',
                                    uid: 'preview',
                                    role: 'creator',
                                    displayName: activePreviewTemplate.name,
                                    bio: activePreviewTemplate.description,
                                    avatarUrl: `https://picsum.photos/seed/${activePreviewTemplate.id}/200`,
                                    blocks: activePreviewTemplate.initialBlocks,
                                    style: activePreviewTemplate.initialStyle,
                                    isVerified: false,
                                    plan: 'pro',
                                    subscriptionStatus: 'active',
                                    onboardingCompleted: true,
                                    joinedAt: new Date().toISOString(),
                                    aiGenerationCount: 0
                                }} 
                                previewMode={true} 
                            />
                        </div>
                  </div>

                  <div className="flex gap-4">
                      <button onClick={() => setSelectedTemplate(activePreviewTemplate)} className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-brand-700 shadow-lg hover:shadow-brand-500/30 transition-all">
                          Use This Template
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Merge Strategy Modal */}
      {(selectedTemplate || (previewTemplateId && selectedTemplate)) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
                  <button onClick={() => { setSelectedTemplate(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><div className="bg-gray-100 p-2 rounded-full">✕</div></button>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Use Template?</h3>
                  <p className="text-gray-500 mb-6 text-sm">You selected <strong>{selectedTemplate?.name}</strong>. What do you want to use?</p>
                  <div className="space-y-3">
                      <button onClick={() => finalizeSelection('design')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-brand-600 rounded-xl hover:bg-brand-50 transition-all group text-left">
                          <div className="bg-white p-3 rounded-full shadow-sm text-brand-600"><Palette size={20}/></div>
                          <div><div className="font-bold text-gray-900 text-sm">Style Only</div><div className="text-xs text-gray-500 mt-0.5">Colors & fonts. Keep content.</div></div>
                      </button>
                      <button onClick={() => finalizeSelection('content')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-indigo-600 rounded-xl hover:bg-indigo-50 transition-all group text-left">
                          <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600"><LayoutTemplate size={20}/></div>
                          <div><div className="font-bold text-gray-900 text-sm">Structure Only</div><div className="text-xs text-gray-500 mt-0.5">Blocks & links. Keep colors.</div></div>
                      </button>
                      <button onClick={() => finalizeSelection('all')} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 hover:border-gray-900 rounded-xl hover:bg-gray-50 transition-all group text-left">
                          <div className="bg-white p-3 rounded-full shadow-sm text-gray-900"><Zap size={20}/></div>
                          <div><div className="font-bold text-gray-900 text-sm">Everything</div><div className="text-xs text-gray-500 mt-0.5">Replace it all.</div></div>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
export default TemplateGallery;
