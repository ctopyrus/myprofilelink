
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Block, ProfileStyle, Template, BlockType, LayoutData, VersionSnapshot } from '../types';
import { TEMPLATES } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';
import { Preview } from './Preview';
import { 
    Move, Image as ImageIcon, Sparkles, Save, ArrowLeft, Plus, Square, 
    LayoutTemplate, MousePointer, Box, Video, Type as TypeIcon, Smartphone, 
    Tablet, Monitor, X, Palette, Wand2, Check, AlertCircle, GripHorizontal,
    Instagram, Twitter, Github, Linkedin, Mail, Globe, Facebook, MessageCircle, Youtube, ShoppingBag, ExternalLink, Zap,
    Undo, Redo, Maximize2, RotateCcw, Clock, Eye, MessageSquare, Send, Loader2, Lock
} from 'lucide-react';

interface AdvancedEditorProps {
    profile: UserProfile;
    setProfile: (p: UserProfile) => void;
}

interface DragState {
    isDragging: boolean;
    isResizing: boolean;
    blockId: string | null;
    startX: number;
    startY: number;
    initialBlockX: number;
    initialBlockY: number;
    initialWidth: number;
    initialHeight: number;
}

interface HistoryState {
    blocks: Block[];
    style: ProfileStyle;
    positions: LayoutMap;
}

type DeviceView = 'mobile' | 'tablet' | 'desktop';
type LayoutMap = Record<string, LayoutData>; 

const ICON_MAP: any = {
    instagram: Instagram,
    twitter: Twitter,
    github: Github,
    linkedin: Linkedin,
    mail: Mail,
    globe: Globe,
    facebook: Facebook,
    whatsapp: MessageCircle,
    youtube: Youtube
};

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({ profile, setProfile }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- CORE STATE ---
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [localStyle, setLocalStyle] = useState<ProfileStyle>(profile.style);
    const [showLimitModal, setShowLimitModal] = useState(false); // NEW
    
    // Position & Size State
    const [currentPositions, setCurrentPositions] = useState<LayoutMap>({});
    
    // Undo/Redo History Stack
    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Version History State
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    
    // Dragging/Resizing State
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        isResizing: false,
        blockId: null,
        startX: 0,
        startY: 0,
        initialBlockX: 0,
        initialBlockY: 0,
        initialWidth: 0,
        initialHeight: 0
    });
    
    // --- UI STATE ---
    const [viewMode, setViewMode] = useState<DeviceView>('mobile');
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [activeRailTab, setActiveRailTab] = useState<'add' | 'design' | 'themes' | null>('add');
    const [showAiModal, setShowAiModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isThinking, setIsThinking] = useState(false); 
    const [prompt, setPrompt] = useState('');
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);

    const canvasRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Derived State
    const isMobileDevice = screenWidth < 1024;

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking, pendingTemplate]);

    // --- INITIALIZATION & RESIZE LISTENER ---
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        let initialBlocks = profile.blocks;
        if (location.state?.importBlocks === false) {
            initialBlocks = [];
        }
        setBlocks(initialBlocks);

        const layout: LayoutMap = {};
        const canvasW = 375; 
        
        initialBlocks.forEach((b, i) => {
            if (location.state?.importBlocks === true) {
                if (b.layout && b.layout['mobile']) {
                    layout[b.id] = b.layout['mobile'];
                } else {
                    const defaultW = 280;
                    const defaultH = 80;
                    const spacing = 20;
                    const startY = 80;
                    layout[b.id] = { 
                        x: (canvasW / 2) - (defaultW / 2), 
                        y: startY + (i * (defaultH + spacing)), 
                        w: defaultW, 
                        h: defaultH 
                    };
                }
            } else {
                if (b.layout && b.layout['mobile']) {
                    layout[b.id] = b.layout['mobile'];
                }
            }
        });
        setCurrentPositions(layout);
        setLocalStyle({...profile.style, layoutMode: 'canvas'});
        
        const initialState: HistoryState = {
            blocks: initialBlocks,
            style: {...profile.style, layoutMode: 'canvas'},
            positions: layout
        };
        setHistory([initialState]);
        setHistoryIndex(0);

        return () => window.removeEventListener('resize', handleResize);
    }, [location.state]);

    const pushToHistory = (newBlocks: Block[], newStyle: ProfileStyle, newPositions: LayoutMap) => {
        const newState = { blocks: newBlocks, style: newStyle, positions: newPositions };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        if (newHistory.length > 20) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            const state = history[prevIndex];
            setBlocks(state.blocks);
            setLocalStyle(state.style);
            setCurrentPositions(state.positions);
            setHistoryIndex(prevIndex);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const state = history[nextIndex];
            setBlocks(state.blocks);
            setLocalStyle(state.style);
            setCurrentPositions(state.positions);
            setHistoryIndex(nextIndex);
        }
    };

    const getScaleFactor = () => {
        if (screenWidth >= 1024 && viewMode === 'desktop') return 1;
        if (screenWidth >= 1024 && viewMode === 'tablet') return 0.8; 
        return 1;
    };

    const handleViewChange = (newView: DeviceView) => {
        const updatedBlocks = blocks.map(b => ({
            ...b,
            layout: { ...b.layout, [viewMode]: currentPositions[b.id] || {x:0, y:0, w:280, h:80} }
        }));
        setBlocks(updatedBlocks);

        const newLayout: LayoutMap = {};
        const canvasW = newView === 'mobile' ? 375 : newView === 'tablet' ? 768 : 1024;
        const defaultW = newView === 'mobile' ? 280 : newView === 'tablet' ? 400 : 500;

        updatedBlocks.forEach((b, i) => {
            if (b.layout && b.layout[newView]) {
                newLayout[b.id] = b.layout[newView]!;
            } else {
                const currentY = currentPositions[b.id]?.y || (100 + i * 120);
                newLayout[b.id] = { x: (canvasW / 2) - (defaultW / 2), y: currentY, w: defaultW, h: 80 };
            }
        });

        setCurrentPositions(newLayout);
        setViewMode(newView);
    };

    const saveChanges = () => {
        const finalBlocks = blocks.map(b => ({
            ...b,
            layout: { ...b.layout, [viewMode]: currentPositions[b.id] || {x:0, y:0, w:280, h:80} }
        }));
        
        const currentVersion: VersionSnapshot = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            blocks: finalBlocks,
            style: localStyle
        };

        const updatedHistory = profile.versionHistory ? [...profile.versionHistory, currentVersion] : [currentVersion];
        const finalStyle = { ...localStyle, layoutMode: 'canvas' as const };

        setProfile({ ...profile, blocks: finalBlocks, style: finalStyle, versionHistory: updatedHistory });
        
        const btn = document.getElementById('save-btn');
        if(btn) {
            const originalText = btn.innerText;
            btn.innerText = "Saved!";
            setTimeout(() => btn.innerText = originalText, 1500);
        }
    };

    const restoreVersion = (v: VersionSnapshot) => {
        setBlocks(v.blocks);
        setLocalStyle(v.style);
        const layout: LayoutMap = {};
        v.blocks.forEach((b, i) => {
            if (b.layout && b.layout[viewMode]) {
                layout[b.id] = b.layout[viewMode]!;
            } else {
                layout[b.id] = { x: 100, y: 100 + (i*100), w: 280, h: 80 };
            }
        });
        setCurrentPositions(layout);
        setShowVersionHistory(false);
        pushToHistory(v.blocks, v.style, layout);
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent, id: string, type: 'drag' | 'resize') => {
        e.stopPropagation();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const pos = currentPositions[id] || {x:0, y:0, w: 280, h: 80};

        setDragState({
            isDragging: type === 'drag',
            isResizing: type === 'resize',
            blockId: id,
            startX: clientX,
            startY: clientY,
            initialBlockX: pos.x,
            initialBlockY: pos.y,
            initialWidth: pos.w || 280,
            initialHeight: pos.h || 80
        });
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!dragState.blockId) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const scale = getScaleFactor();
        const deltaX = (clientX - dragState.startX) / scale;
        const deltaY = (clientY - dragState.startY) / scale;

        if (dragState.isDragging) {
            const newX = dragState.initialBlockX + deltaX;
            const newY = dragState.initialBlockY + deltaY;
            const snappedX = Math.round(newX / 10) * 10;
            const snappedY = Math.round(newY / 10) * 10;
            setCurrentPositions(prev => ({...prev, [dragState.blockId!]: { ...prev[dragState.blockId!], x: snappedX, y: snappedY } }));
        } else if (dragState.isResizing) {
            const newW = Math.max(50, dragState.initialWidth + deltaX);
            const newH = Math.max(20, dragState.initialHeight + deltaY);
            const snappedW = Math.round(newW / 10) * 10;
            const snappedH = Math.round(newH / 10) * 10;
            setCurrentPositions(prev => ({...prev, [dragState.blockId!]: { ...prev[dragState.blockId!], w: snappedW, h: snappedH } }));
        }
    };

    const handleEnd = () => {
        if (dragState.blockId) pushToHistory(blocks, localStyle, currentPositions);
        setDragState({ isDragging: false, isResizing: false, blockId: null, startX: 0, startY: 0, initialBlockX: 0, initialBlockY: 0, initialWidth: 0, initialHeight: 0 });
    };

    // --- ADD ELEMENT ---
    const addElement = (type: string) => {
        let intendedType: BlockType = 'text';
        if (type === 'Button') intendedType = 'link';
        else if (type === 'Image') intendedType = 'media';
        else if (type === 'Header') intendedType = 'header';
        
        if (profile.plan === 'free') {
             const restrictedTypes = ['link', 'product', 'media'];
             if (restrictedTypes.includes(intendedType)) {
                 const restrictedCount = blocks.filter(b => restrictedTypes.includes(b.type)).length;
                 if (restrictedCount >= 1) {
                     setShowLimitModal(true); // NEW MODAL
                     return;
                 }
             }
        }
        
        const newId = Math.random().toString(36).substr(2, 9);
        let newBlock: Block = {
            id: newId,
            type: intendedType,
            title: intendedType === 'header' ? 'New Header' : 'New Element',
            visible: true,
            url: '#'
        };

        if (type === 'Button') { newBlock.type = 'link'; newBlock.title = 'Click Me'; }
        else if (type === 'Image') { newBlock.type = 'media'; newBlock.title = 'New Image'; newBlock.imageUrl = 'https://picsum.photos/300/200'; }
        else if (type === 'Header') { newBlock.type = 'header'; newBlock.title = 'Header'; }
        else if (type === 'Box') { newBlock.type = 'text'; newBlock.title = 'Container'; newBlock.customStyle = { shape: 'square' }; }

        const updatedBlocks = [...blocks, newBlock];
        setBlocks(updatedBlocks);

        const canvasW = viewMode === 'mobile' ? 375 : viewMode === 'tablet' ? 768 : 1000;
        const elWidth = viewMode === 'mobile' ? 280 : viewMode === 'tablet' ? 400 : 500;
        const positions = Object.values(currentPositions);
        let maxY = 100;
        if (positions.length > 0) {
            maxY = Math.max(...positions.map((p) => (p as LayoutData).y + ((p as LayoutData).h || 80))) + 20;
        }
        
        const newPos = { ...currentPositions, [newId]: { x: (canvasW/2) - (elWidth/2), y: maxY, w: elWidth, h: 80 } };
        setCurrentPositions(newPos);
        pushToHistory(updatedBlocks, localStyle, newPos);
        if (screenWidth < 1024) setActiveRailTab(null);
    };

    // --- TEMPLATE IMPORT ---
    const applyTemplate = (strategy: 'design' | 'content' | 'all') => {
        if (!pendingTemplate) return;

        let newStyle = localStyle;
        let newBlocks = blocks;
        let newPositions = currentPositions;

        // 1. Apply Style
        if (strategy !== 'content') {
            newStyle = { ...pendingTemplate.initialStyle, layoutMode: 'canvas' };
            setLocalStyle(newStyle);
        }

        // 2. Apply Content (Blocks & Positions)
        if (strategy !== 'design') {
            // Apply Free Plan Limits
            let templateBlocks = pendingTemplate.initialBlocks;
            if (profile.plan === 'free') {
                const restrictedTypes = ['link', 'product', 'media'];
                let restrictedCount = 0;
                templateBlocks = templateBlocks.filter(b => {
                    if (restrictedTypes.includes(b.type)) {
                        if (restrictedCount < 1) {
                            restrictedCount++;
                            return true;
                        }
                        return false;
                    }
                    return true;
                });
                alert("Restricted imports due to Free plan limits.");
            }

            const generatedBlocks = templateBlocks.map(b => ({
                ...b, 
                id: Math.random().toString(36).substr(2,9),
                layout: undefined 
            }));
            
            const baseLayout: LayoutMap = {};
            const canvasW = viewMode === 'mobile' ? 375 : viewMode === 'tablet' ? 768 : 1024;
            const elementWidth = viewMode === 'mobile' ? 280 : viewMode === 'tablet' ? 400 : 500;
            const startY = 100;
            const spacing = 20;

            generatedBlocks.forEach((b, i) => {
                 const height = b.type === 'media' ? 200 : 80;
                 baseLayout[b.id] = { x: (canvasW/2)-(elementWidth/2), y: startY + (i * (height + spacing)), w: elementWidth, h: height };
            });
            
            newBlocks = generatedBlocks.map(b => ({ ...b, layout: { [viewMode]: baseLayout[b.id] } }));
            setBlocks(newBlocks);
            newPositions = baseLayout;
            setCurrentPositions(baseLayout); 
        }
        
        pushToHistory(newBlocks, newStyle, newPositions);
        setPendingTemplate(null);
    };

    const handleAiGenerate = async () => {
        if (!prompt) return;
        if (profile.plan === 'free') { alert("AI features are available on Pro and Business plans."); return; }
        if (profile.plan === 'pro' && (profile.aiGenerationCount || 0) >= 5) { alert("Upgrade to Business for unlimited access."); return; }

        setIsGenerating(true);
        setChatHistory(prev => [...prev, {role: 'user', text: prompt}]);

        try {
            const context = JSON.stringify({ currentBlocks: blocks, currentStyle: localStyle });

            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Context: ${context}. Request: ${prompt}`
                })
            });

            if (!response.ok) {
                throw new Error('AI request failed');
            }

            const payload = await response.json();
            const rawText = payload?.result || "";
            let jsonPart = null;
            let textPart = rawText;
            const jsonMatch = rawText.match(/```json([\s\S]*?)```/);
            if (jsonMatch) {
                try {
                    jsonPart = JSON.parse(jsonMatch[1]);
                    textPart = rawText.replace(jsonMatch[0], '').trim();
                } catch (e) {}
            }

            setChatHistory(prev => [...prev, {role: 'ai', text: textPart || "Updated."}]);

            if (jsonPart && jsonPart.initialBlocks) {
                const tempTemplate: Template = {
                    id: 'ai-' + Date.now(), name: 'AI Gen', description: prompt, category: 'Creative', previewColor: '#fff',
                    initialBlocks: jsonPart.initialBlocks, initialStyle: jsonPart.initialStyle || localStyle
                };
                setIsThinking(true);
                setTimeout(() => {
                    setIsThinking(false);
                    setPendingTemplate(tempTemplate);
                    if (profile.plan === 'pro') setProfile({ ...profile, aiGenerationCount: (profile.aiGenerationCount || 0) + 1 });
                }, 15000);
            }
            setPrompt('');
        } catch (error) {
            console.error("AI Error", error);
            setChatHistory(prev => [...prev, {role: 'ai', text: "Error processing request."}]);
        } finally {
            setIsGenerating(false);
        }
    };

    const getBackgroundStyle = () => {
        const dim = viewMode === 'mobile' ? { width: '375px', height: '800px' } : viewMode === 'tablet' ? { width: '768px', height: '1024px' } : { width: '100%', height: '100%' };
        
        const style: React.CSSProperties = {
            backgroundColor: localStyle.backgroundColor, color: localStyle.textColor, fontFamily: localStyle.fontFamily,
            width: dim.width, minHeight: viewMode === 'desktop' ? '100%' : dim.height,
            transform: viewMode === 'tablet' && screenWidth >= 1024 ? 'scale(0.8)' : 'scale(1)', transformOrigin: 'top center',
        };
        if (localStyle.backgroundType === 'gradient') style.background = localStyle.backgroundGradient;
        if (localStyle.backgroundType === 'image') { style.backgroundImage = `url(${localStyle.backgroundImage})`; style.backgroundSize = 'cover'; }
        if (localStyle.backgroundType === 'mesh') { style.background = 'radial-gradient(at 0% 0%, #111 0, transparent 50%), radial-gradient(at 100% 0%, #333 0, transparent 50%)'; style.backgroundColor = '#000'; }
        if (localStyle.backgroundType === 'animated') { style.backgroundImage = localStyle.backgroundGradient || "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)"; style.backgroundSize = "400% 400%"; }
        return style;
    };

    const ViewSwitcher = () => (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => handleViewChange('mobile')} className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}><Smartphone size={16}/></button>
            <button onClick={() => handleViewChange('tablet')} className={`p-1.5 rounded-md transition-all ${viewMode === 'tablet' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}><Tablet size={16}/></button>
            <button onClick={() => handleViewChange('desktop')} className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}><Monitor size={16}/></button>
        </div>
    );

    const renderSettingsContent = () => {
        switch (activeRailTab) {
            case 'add':
                return (
                    <div className="p-4 grid grid-cols-2 gap-3">
                         {[
                             { id: 'Header', icon: TypeIcon, label: 'Header' },
                             { id: 'Box', icon: Square, label: 'Box' },
                             { id: 'Button', icon: MousePointer, label: 'Button' },
                             { id: 'Image', icon: ImageIcon, label: 'Image' }
                         ].map(item => (
                             <button key={item.id} onClick={() => addElement(item.id)} className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 transition-colors group">
                                 <item.icon className="text-gray-500 group-hover:text-gray-900 mb-2" size={24} />
                                 <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">{item.label}</span>
                             </button>
                         ))}
                    </div>
                );
            case 'design':
                return (
                    <div className="p-4 space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Background</label>
                            <div className="flex gap-2 flex-wrap">
                                {['#ffffff', '#f8fafc', '#000000', '#18181b', '#fce7f3', '#dbeafe'].map(c => (
                                    <button key={c} onClick={() => setLocalStyle(s => ({...s, backgroundColor: c, backgroundType: 'solid'}))} className={`w-8 h-8 rounded-full border border-gray-200 ${localStyle.backgroundColor === c ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`} style={{backgroundColor: c}} />
                                ))}
                                <label className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer bg-white relative overflow-hidden">
                                    <Palette size={14} className="text-gray-400"/>
                                    <input type="color" className="absolute inset-0 opacity-0" value={localStyle.backgroundColor} onChange={(e) => setLocalStyle(s => ({...s, backgroundColor: e.target.value, backgroundType: 'solid'}))} />
                                </label>
                            </div>
                        </div>
                        <div>
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 block">Button Style</label>
                             <div className="grid grid-cols-2 gap-2">
                                 {['rounded', 'pill', 'square', 'shadow', 'glass', 'outline'].map(s => (
                                     <button key={s} onClick={() => setLocalStyle(p => ({...p, buttonStyle: s as any}))} className={`px-3 py-2 text-[10px] font-bold uppercase rounded border ${localStyle.buttonStyle === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'}`}>{s}</button>
                                 ))}
                             </div>
                        </div>
                    </div>
                );
            case 'themes':
                return (
                    <div className="p-4 grid grid-cols-2 gap-3">
                        {TEMPLATES.filter(t => t.id !== 'blank').map(t => (
                            <button 
                                key={t.id} 
                                onClick={() => setPendingTemplate(t)} 
                                className="group relative w-full aspect-[9/16] rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:border-brand-400 transition-all text-left bg-gray-50 ring-2 ring-transparent hover:ring-brand-100"
                            >
                                <div className="absolute top-0 left-0 w-[375px] h-[800px] origin-top-left transform scale-[0.35] pointer-events-none bg-white">
                                     <Preview 
                                        profile={{
                                            username: 'preview',
                                            email: '',
                                            uid: 'preview',
                                            role: 'creator',
                                            displayName: t.name,
                                            bio: '',
                                            avatarUrl: `https://picsum.photos/seed/${t.id}/200`,
                                            blocks: t.initialBlocks,
                                            style: t.initialStyle,
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
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-white/95 backdrop-blur-sm border-t border-gray-100">
                                    <div className="text-[10px] font-bold text-gray-900 truncate">{t.name}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-50 overflow-hidden flex flex-col font-sans text-gray-900" onMouseMove={handleMove} onTouchMove={handleMove} onMouseUp={handleEnd} onTouchEnd={handleEnd}>
            <style>{`.bg-animate-gradient { animation: gradient 15s ease infinite; } @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
            
            <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-20 shrink-0 shadow-sm relative">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin/editor')} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
                    <div><h1 className="font-black text-gray-900 text-lg flex items-center gap-2">Advanced Editor <span className="bg-brand-100 text-brand-600 px-2 py-0.5 rounded text-[10px] font-bold">Beta</span></h1></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3">
                     {!isMobileDevice && <ViewSwitcher />}
                     <div className="w-px h-8 bg-gray-200 mx-2"></div>
                     <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"><Undo size={18}/></button>
                     <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30"><Redo size={18}/></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowVersionHistory(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg hidden sm:block"><Clock size={20}/></button>
                    <button onClick={() => setShowPreviewModal(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye size={20}/></button>
                    <button id="save-btn" onClick={saveChanges} className="bg-brand-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-brand-700 shadow-lg flex items-center gap-2"><Save size={16}/> Save</button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <div className="hidden lg:flex w-20 bg-white border-r border-gray-200 flex-col items-center py-6 gap-6 z-30 shadow-lg">
                    {[{ id: 'add', icon: Plus, label: 'Add' }, { id: 'design', icon: Palette, label: 'Style' }, { id: 'themes', icon: LayoutTemplate, label: 'Theme' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveRailTab(activeRailTab === tab.id ? null : tab.id as any)} className={`flex flex-col items-center gap-1 p-3 w-14 rounded-xl transition-all ${activeRailTab === tab.id ? 'bg-brand-600 text-white shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                            <tab.icon size={22} strokeWidth={activeRailTab === tab.id ? 2.5 : 2} /><span className="text-[9px] font-bold uppercase">{tab.label}</span>
                        </button>
                    ))}
                    <div className="mt-auto"><button onClick={() => setShowAiModal(true)} className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex flex-col items-center justify-center shadow-lg hover:scale-105 transition-transform gap-1"><Sparkles size={20} className="animate-pulse" /><span className="text-[8px] font-bold uppercase leading-none text-center">Ask AI</span></button></div>
                </div>

                {activeRailTab && (
                    <div className="hidden lg:flex w-80 bg-white border-r border-gray-200 z-20 flex-col animate-slideIn shadow-2xl relative">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-black text-gray-900 uppercase tracking-wide text-sm">{activeRailTab}</h3><button onClick={() => setActiveRailTab(null)}><X size={18} className="text-gray-400 hover:text-gray-900"/></button></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">{renderSettingsContent()}</div>
                    </div>
                )}

                <div className="flex-1 bg-gray-100 overflow-auto relative flex items-start justify-center p-8 sm:p-12 touch-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
                    <div ref={canvasRef} className={`relative shadow-2xl transition-all duration-300 ease-out bg-white overflow-hidden ring-1 ring-gray-900/5 ${localStyle.backgroundType === 'animated' ? 'bg-animate-gradient' : ''} ${viewMode === 'mobile' ? 'rounded-[3rem] border-[12px] border-gray-900' : ''} ${viewMode === 'tablet' ? 'rounded-[2rem] border-[12px] border-gray-800' : ''} ${viewMode === 'desktop' ? 'rounded-xl border border-gray-200 w-full min-h-full' : ''}`} style={getBackgroundStyle()}>
                        {viewMode === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-xl z-20 pointer-events-none"></div>}
                        {blocks.map(block => {
                            const pos = currentPositions[block.id] || block.layout?.[viewMode] || block.layout?.['mobile'] || {x: 0, y: 0, w: 280, h: 80};
                            const shape = block.customStyle?.shape || localStyle.buttonStyle;
                            let buttonClasses = `w-full h-full px-4 py-4 flex items-center justify-between pointer-events-none`;
                            if (shape === 'rounded') buttonClasses += ' rounded-xl';
                            if (shape === 'pill') buttonClasses += ' rounded-full';
                            if (shape === 'square') buttonClasses += ' rounded-none';
                            if (shape === 'shadow') buttonClasses += ' rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] border-2 border-black';
                            if (shape === 'glass') buttonClasses += ' rounded-xl backdrop-blur-md border border-white/20 shadow-lg bg-white/10';
                            if (shape === 'outline') buttonClasses += ' rounded-xl border-2 bg-transparent';
                            const inlineStyles: React.CSSProperties = { fontFamily: localStyle.fontFamily, color: localStyle.buttonTextColor };
                            if (shape !== 'outline' && shape !== 'glass') inlineStyles.backgroundColor = localStyle.buttonColor;
                            if (shape === 'outline') { inlineStyles.borderColor = localStyle.buttonColor; inlineStyles.color = localStyle.buttonColor; }
                            const IconComponent = block.icon && ICON_MAP[block.icon] ? ICON_MAP[block.icon] : null;

                            return (
                                <div key={block.id} onMouseDown={(e) => handleStart(e, block.id, 'drag')} onTouchStart={(e) => handleStart(e, block.id, 'drag')} style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, width: pos.w, height: pos.h, cursor: dragState.blockId === block.id ? 'grabbing' : 'grab', zIndex: dragState.blockId === block.id ? 50 : 1, position: 'absolute', touchAction: 'none', userSelect: 'none' }} className={`group absolute transition-shadow ${dragState.blockId === block.id ? 'opacity-100 z-50 ring-2 ring-brand-500 shadow-xl' : 'hover:z-10 hover:ring-1 hover:ring-brand-300'}`}>
                                    <div onMouseDown={(e) => handleStart(e, block.id, 'resize')} onTouchStart={(e) => handleStart(e, block.id, 'resize')} className="absolute -bottom-2 -right-2 w-6 h-6 z-[60] cursor-se-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-md border border-gray-200 hover:bg-brand-50"><div className="w-2 h-2 bg-brand-600 rounded-full"></div></div>
                                    <div className="absolute -top-3 -right-3 hidden group-hover:flex z-[60] animate-fadeIn"><button onClick={(e) => { e.stopPropagation(); setBlocks(blocks.filter(b => b.id !== block.id)); }} className="bg-white p-1.5 rounded-full shadow text-red-500 hover:bg-red-50 border border-gray-100"><X size={12}/></button></div>
                                    <div className="pointer-events-none relative w-full h-full overflow-hidden">
                                        {block.type === 'header' && <h3 className="text-xl font-bold flex items-center justify-center w-full h-full text-center" style={{ color: localStyle.textColor }}>{block.title}</h3>}
                                        {block.type === 'text' && <p className="flex items-center justify-center w-full h-full text-center opacity-80 text-sm p-2" style={{ color: localStyle.textColor }}>{block.title}</p>}
                                        {block.type === 'link' && (<div className={buttonClasses} style={inlineStyles}><div className="flex items-center gap-3 relative z-10 w-full h-full overflow-hidden">{block.imageUrl ? <img src={block.imageUrl} className="w-8 h-8 rounded-md object-cover flex-shrink-0 bg-black/5" /> : IconComponent && <IconComponent size={20} />}<div className="flex-1 text-left min-w-0"><div className="font-medium leading-tight truncate">{block.title}</div>{block.subtitle && <div className="text-[10px] opacity-70 mt-0.5 truncate">{block.subtitle}</div>}</div>{!IconComponent && !block.imageUrl && <ExternalLink className="w-4 h-4 opacity-60 ml-2 flex-shrink-0" />}</div></div>)}
                                        {block.type === 'product' && (<div className={buttonClasses} style={inlineStyles}><div className="flex items-center gap-3 relative z-10 w-full h-full">{block.imageUrl && <img src={block.imageUrl} className="w-10 h-10 rounded-md object-cover bg-white/20" />}<div className="text-left flex-1"><div className="font-medium leading-tight text-sm">{block.title}</div><div className="text-[10px] opacity-80 mt-1">{block.price}</div></div></div><ShoppingBag className="w-4 h-4 opacity-60 relative z-10" /></div>)}
                                        {block.type === 'media' && (<div className={`overflow-hidden border border-white/10 w-full h-full flex flex-col ${shape === 'pill' ? 'rounded-3xl' : 'rounded-xl'}`} style={{ backgroundColor: localStyle.buttonColor }}>{block.imageUrl ? <div className="relative flex-1 w-full bg-black/20 overflow-hidden"><img src={block.imageUrl} className="w-full h-full object-cover opacity-90" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"><Youtube className="w-5 h-5 text-red-600 fill-current ml-0.5" /></div></div></div> : <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-300">Media</div>}<div className="block p-2 text-center text-sm font-medium truncate" style={{ color: localStyle.buttonTextColor }}>{block.title}</div></div>)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="lg:hidden bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between z-40 shrink-0 safe-pb shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                 <button onClick={() => setActiveRailTab('add')} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${activeRailTab === 'add' ? 'text-brand-600 bg-brand-50' : 'text-gray-400'}`}><Plus size={24} /><span className="text-[10px] font-bold">Add</span></button>
                 <button onClick={() => setActiveRailTab('design')} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${activeRailTab === 'design' ? 'text-brand-600 bg-brand-50' : 'text-gray-400'}`}><Palette size={24} /><span className="text-[10px] font-bold">Style</span></button>
                 <div className="-mt-8"><button onClick={() => setShowAiModal(true)} className="w-16 h-16 rounded-full bg-gray-900 text-white flex flex-col items-center justify-center shadow-xl border-4 border-gray-50 animate-bounce-in gap-0.5"><Sparkles size={24} className="text-yellow-400" /><span className="text-[8px] font-black uppercase tracking-widest leading-none text-gray-300">Ask AI</span></button></div>
                 <button onClick={() => setActiveRailTab('themes')} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${activeRailTab === 'themes' ? 'text-brand-600 bg-brand-50' : 'text-gray-400'}`}><LayoutTemplate size={24} /><span className="text-[10px] font-bold">Theme</span></button>
                 {!isMobileDevice && <button onClick={() => handleViewChange(viewMode === 'mobile' ? 'desktop' : 'mobile')} className="flex flex-col items-center gap-1 p-2 text-gray-400">{viewMode === 'mobile' ? <Monitor size={24}/> : <Smartphone size={24}/>}<span className="text-[10px] font-bold">View</span></button>}
            </div>
            {activeRailTab && (
                <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveRailTab(null)}></div>
                    <div className="bg-white w-full max-w-lg rounded-t-[2rem] p-6 animate-slideIn max-h-[70vh] overflow-y-auto relative shadow-2xl">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                        <div className="flex justify-between items-center mb-6"><h3 className="font-black text-lg text-gray-900 flex items-center gap-2">{activeRailTab}</h3><button onClick={() => setActiveRailTab(null)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={16}/></button></div>
                        {renderSettingsContent()}
                    </div>
                </div>
            )}
            
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[500px]">
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2"><Sparkles className="text-yellow-300"/> Design Assistant</h3>
                            <button onClick={() => setShowAiModal(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                            {chatHistory.length === 0 && (
                                <div className="text-center text-gray-500 mt-10">
                                    <Sparkles size={40} className="mx-auto mb-4 text-indigo-300"/>
                                    <p className="text-sm">Describe what you want to change.</p>
                                    <p className="text-xs mt-2 opacity-70">"Make the buttons round and blue"</p>
                                    <p className="text-xs opacity-70">"Add a contact section"</p>
                                </div>
                            )}
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isGenerating && (
                                <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm"><Loader2 size={20} className="animate-spin text-indigo-500"/></div></div>
                            )}
                            <div ref={chatEndRef}></div>
                        </div>
                        <div className="p-4 bg-white border-t border-gray-100">
                             {pendingTemplate ? (
                                 <div className="text-center">
                                     <p className="text-sm font-bold text-gray-900 mb-2">Design Generated!</p>
                                     <div className="flex gap-2 justify-center">
                                         <button onClick={() => { applyTemplate('all'); setShowAiModal(false); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Apply All</button>
                                         <button onClick={() => { applyTemplate('design'); setShowAiModal(false); }} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-700">Style Only</button>
                                         <button onClick={() => setPendingTemplate(null)} className="text-gray-400 px-2 text-xs">Discard</button>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="flex gap-2">
                                     <input 
                                         type="text" 
                                         value={prompt} 
                                         onChange={(e) => setPrompt(e.target.value)} 
                                         onKeyPress={(e) => e.key === 'Enter' && handleAiGenerate()}
                                         placeholder="Ask AI to change something..." 
                                         className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                                     />
                                     <button onClick={handleAiGenerate} disabled={isGenerating || !prompt} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50"><Send size={18}/></button>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
            
            {showVersionHistory && (
                 <div className="fixed inset-0 z-50 flex items-center justify-end">
                     <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowVersionHistory(false)}></div>
                     <div className="bg-white h-full w-80 shadow-2xl relative z-10 p-6 flex flex-col animate-slideInRight">
                         <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">History</h3><button onClick={() => setShowVersionHistory(false)}><X size={20}/></button></div>
                         <div className="flex-1 overflow-y-auto space-y-4">
                             {profile.versionHistory?.slice().reverse().map((v, i) => (
                                 <div key={v.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer group" onClick={() => restoreVersion(v)}>
                                     <div className="flex justify-between items-start mb-1">
                                         <span className="text-xs font-bold text-gray-900">Version {profile.versionHistory!.length - i}</span>
                                         <span className="text-[10px] text-gray-400">{new Date(v.timestamp).toLocaleTimeString()}</span>
                                     </div>
                                     <p className="text-xs text-gray-500">{v.blocks.length} blocks • {v.style.backgroundType}</p>
                                     <div className="mt-2 text-brand-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Restore this version</div>
                                 </div>
                             ))}
                             {(!profile.versionHistory || profile.versionHistory.length === 0) && <p className="text-sm text-gray-400 text-center mt-10">No history yet.</p>}
                         </div>
                     </div>
                 </div>
            )}
            
            {showPreviewModal && (
                <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                    <button onClick={() => setShowPreviewModal(false)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={32}/></button>
                    <div className="h-[85vh] w-full max-w-[400px] bg-white rounded-[3rem] overflow-hidden border-8 border-gray-800 shadow-2xl relative">
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
                         <Preview profile={{...profile, blocks: blocks, style: localStyle}} previewMode={true} deviceMode="mobile" />
                    </div>
                </div>
            )}

            {/* THEME SELECTION MODAL */}
            {pendingTemplate && !showAiModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
                        <button onClick={() => setPendingTemplate(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20}/></button>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Apply {pendingTemplate.name}?</h3>
                        <p className="text-gray-500 mb-6 text-sm">Choose how you want to apply this theme to your canvas.</p>
                        <div className="space-y-3">
                            <button onClick={() => applyTemplate('design')} className="w-full flex items-center gap-3 p-3 border-2 border-brand-100 hover:border-brand-600 rounded-xl bg-brand-50/50 hover:bg-brand-50 transition-all group text-left">
                                <div className="bg-white p-2 rounded-full shadow-sm text-brand-600"><Palette size={18}/></div>
                                <div><div className="font-bold text-gray-900 text-sm">Design Only</div><div className="text-[10px] text-gray-500">Colors, fonts & button styles.</div></div>
                            </button>
                            <button onClick={() => applyTemplate('content')} className="w-full flex items-center gap-3 p-3 border-2 border-indigo-100 hover:border-indigo-600 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 transition-all group text-left">
                                <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600"><LayoutTemplate size={18}/></div>
                                <div><div className="font-bold text-gray-900 text-sm">Layout Only</div><div className="text-[10px] text-gray-500">Blocks & positioning.</div></div>
                            </button>
                            <button onClick={() => applyTemplate('all')} className="w-full flex items-center gap-3 p-3 border-2 border-gray-100 hover:border-gray-900 rounded-xl hover:bg-gray-50 transition-all group text-left">
                                <div className="bg-white p-2 rounded-full shadow-sm text-gray-900"><Zap size={18}/></div>
                                <div><div className="font-bold text-gray-900 text-sm">Everything</div><div className="text-[10px] text-gray-500">Replace current design completely.</div></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIMIT WARNING MODAL - NEW! */}
            {showLimitModal && (
                <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                        <button onClick={() => setShowLimitModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20}/></button>
                        
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock size={28} />
                        </div>
                        
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Limit Reached</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            You are on the Free plan, which allows only <strong>1 active link/content block</strong>. To add more items, please upgrade your account.
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/checkout?plan=pro')}
                                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <Zap size={16} className="text-yellow-400 fill-current"/> Upgrade Now
                            </button>
                            <button 
                                onClick={() => setShowLimitModal(false)}
                                className="w-full text-gray-400 hover:text-gray-600 py-2 text-xs font-bold uppercase tracking-widest"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdvancedEditor;
