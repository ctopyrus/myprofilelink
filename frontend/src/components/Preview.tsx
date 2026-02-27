
import React from 'react';
import { UserProfile, Block, ProfileStyle, LayoutData } from '../types';
import { ExternalLink, ShoppingBag, Youtube, Check, Instagram, Twitter, Github, Linkedin, Mail, Globe, Facebook, MessageCircle } from 'lucide-react';

interface PreviewProps {
  profile: UserProfile;
  previewMode?: boolean; // If true, rendering in the editor context
  deviceMode?: 'mobile' | 'tablet' | 'desktop'; // Support tablet
}

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

const BlockRenderer: React.FC<{ block: Block; globalStyle: ProfileStyle; layoutMode?: string; deviceMode?: string }> = ({ block, globalStyle, layoutMode, deviceMode }) => {
  // Determine style source (individual > global)
  const shape = block.customStyle?.shape || globalStyle.buttonStyle;
  
  // Base button styles
  let buttonClasses = `w-full h-full px-4 py-2 flex items-center justify-between transition-transform active:scale-95 group relative overflow-hidden`;
  
  // Shape logic
  if (shape === 'rounded') buttonClasses += ' rounded-xl';
  if (shape === 'pill') buttonClasses += ' rounded-full';
  if (shape === 'square') buttonClasses += ' rounded-none';
  if (shape === 'shadow') buttonClasses += ' rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0 hover:shadow-none transition-all border-2 border-black';
  if (shape === 'glass') buttonClasses += ' rounded-xl backdrop-blur-md border border-white/20 shadow-lg bg-white/10';
  if (shape === 'outline') buttonClasses += ' rounded-xl border-2 bg-transparent';

  // Dynamic CSS for colors
  const inlineStyles: React.CSSProperties = {
    fontFamily: globalStyle.fontFamily,
    color: globalStyle.buttonTextColor,
  };
  
  // Only enforce min-height in List/Grid mode, not Canvas
  if (layoutMode !== 'canvas') {
      inlineStyles.minHeight = '64px';
  }

  if (shape !== 'outline' && shape !== 'glass') {
      inlineStyles.backgroundColor = globalStyle.buttonColor;
  }
  if (shape === 'outline') {
      inlineStyles.borderColor = globalStyle.buttonColor;
      inlineStyles.color = globalStyle.buttonColor;
  }

  // Icon Resolution
  const IconComponent = block.icon && ICON_MAP[block.icon] ? ICON_MAP[block.icon] : null;
  
  // LAYOUT POSITIONING (For Canvas Mode)
  const wrapperStyle: React.CSSProperties = {};
  if (layoutMode === 'canvas') {
      const mode = (deviceMode === 'tablet' || deviceMode === 'desktop') ? deviceMode : 'mobile';
      // Fallback: If desktop layout missing, try mobile
      const layoutData: LayoutData | undefined = block.layout?.[mode as keyof typeof block.layout] || block.layout?.['mobile'];
      
      if (layoutData) {
          wrapperStyle.position = 'absolute';
          wrapperStyle.left = `${layoutData.x}px`;
          wrapperStyle.top = `${layoutData.y}px`;
          wrapperStyle.width = layoutData.w ? `${layoutData.w}px` : (mode === 'mobile' ? '280px' : '400px');
          if (layoutData.h) wrapperStyle.height = `${layoutData.h}px`;
      } else {
          // If absolutely no layout data, hide it or place it at 0,0
          wrapperStyle.position = 'absolute';
          wrapperStyle.left = '0px';
          wrapperStyle.top = '0px';
          wrapperStyle.width = '200px';
          wrapperStyle.height = '60px';
      }
  }

  const Content = () => {
      switch (block.type) {
        case 'header':
          return <h3 className="text-lg font-bold flex items-center justify-center w-full h-full text-center tracking-tight" style={{fontFamily: globalStyle.fontFamily, color: globalStyle.textColor}}>{block.title}</h3>;

        case 'text':
          return <p className="text-sm flex items-center justify-center w-full h-full text-center px-2 opacity-80" style={{fontFamily: globalStyle.fontFamily, color: globalStyle.textColor}}>{block.title}</p>;

        case 'link':
          if (block.imageUrl) {
            return (
               <a href={block.url || '#'} className={buttonClasses} style={inlineStyles}>
                 <div className="flex items-center gap-3 relative z-10 w-full h-full overflow-hidden">
                    <img src={block.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0 bg-black/5" />
                    <div className="flex-1 text-left min-w-0">
                        <div className="font-medium leading-tight truncate text-sm">{block.title}</div>
                        {block.subtitle && <div className="text-[10px] opacity-70 mt-0.5 truncate">{block.subtitle}</div>}
                    </div>
                 </div>
               </a>
            );
          }
          return (
            <a href={block.url || '#'} className={buttonClasses} style={inlineStyles}>
              <div className="flex items-center gap-3 relative z-10 w-full h-full">
                  {IconComponent && <IconComponent size={18} />}
                  <div className="flex-1 text-left">
                      <span className="font-medium text-sm block">{block.title}</span>
                      {block.subtitle && <span className="text-[10px] opacity-70 block">{block.subtitle}</span>}
                  </div>
              </div>
            </a>
          );

        case 'product':
          return (
            <a href={block.url || '#'} className={buttonClasses} style={inlineStyles}>
              <div className="flex items-center gap-3 relative z-10 w-full h-full">
                 {block.imageUrl && (
                     <img src={block.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover bg-white/20" />
                 )}
                 <div className="text-left flex-1">
                     <div className="font-medium leading-tight text-sm">{block.title}</div>
                     <div className="text-[10px] opacity-80 mt-1">{block.price}</div>
                 </div>
                 <ShoppingBag className="w-4 h-4 opacity-60 relative z-10" />
              </div>
            </a>
          );
          
        case 'media':
            return (
                <div className={`overflow-hidden border border-white/10 w-full h-full flex flex-col ${shape === 'pill' ? 'rounded-3xl' : 'rounded-xl'}`} style={{ backgroundColor: globalStyle.buttonColor }}>
                    {block.imageUrl ? (
                        <div className="relative flex-1 w-full bg-black/20 overflow-hidden">
                            <img src={block.imageUrl} alt="" className="w-full h-full object-cover opacity-90" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                    <Youtube className="w-4 h-4 text-red-600 fill-current ml-0.5" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold border-2 border-dashed border-gray-300">
                            Media
                        </div>
                    )}
                    <a href={block.url || '#'} className="block p-2 text-center text-xs font-medium hover:underline truncate" style={{ color: globalStyle.buttonTextColor, fontFamily: globalStyle.fontFamily }}>
                        {block.title}
                    </a>
                </div>
            );

        default:
          return null;
      }
  };

  if (layoutMode === 'canvas') {
      return <div style={wrapperStyle}>{Content()}</div>;
  }
  
  return Content();
};

export const Preview: React.FC<PreviewProps> = ({ profile, previewMode = false, deviceMode = 'mobile' }) => {
  // --- LAYOUT CONSISTENCY LOGIC ---
  // In Canvas mode, the positions (x,y) are stored as raw pixels relative to a standard frame (375px mobile, 768px tablet).
  // To ensure they look identical on all screens, we must render them in a fixed-size container
  // and scale that container using CSS transform, rather than letting it be responsive.
  
  const layoutMode = profile.style.layoutMode || 'list';
  const isCanvas = layoutMode === 'canvas';
  const isGrid = layoutMode === 'grid';

  // Base dimensions for the reference frame
  const referenceWidth = deviceMode === 'mobile' ? 375 : deviceMode === 'tablet' ? 768 : 1024;
  const referenceHeight = deviceMode === 'mobile' ? 800 : deviceMode === 'tablet' ? 1024 : 800; // Desktop height is just visual constraint

  let containerClass = "min-h-screen w-full max-w-md mx-auto shadow-none sm:shadow-xl sm:my-8 sm:rounded-xl overflow-hidden min-h-screen sm:min-h-[800px]";
  let wrapperStyle: React.CSSProperties = {};

  if (previewMode) {
      if (isCanvas) {
          // In Canvas mode within editor, we render a fixed box and let parent scale it if needed
          containerClass = "relative overflow-hidden bg-white shadow-2xl mx-auto origin-top-left transition-transform";
          if (deviceMode === 'mobile') {
              containerClass += " rounded-[2.5rem] border-[8px] border-gray-900";
              wrapperStyle = { width: '375px', height: '800px' };
          } else if (deviceMode === 'tablet') {
              containerClass += " rounded-[2rem] border-[12px] border-gray-800";
              wrapperStyle = { width: '768px', height: '1024px' };
          } else {
              containerClass += " rounded-xl border border-gray-200 w-full h-full";
              wrapperStyle = { width: '100%', height: '100%', minWidth: '1024px' };
          }
      } else {
          // Standard List/Grid Preview Logic
          containerClass = deviceMode === 'desktop' 
            ? "w-full h-full rounded-xl border border-gray-200 overflow-y-auto shadow-sm bg-white mx-auto" 
            : "w-[320px] h-[640px] rounded-[2.5rem] border-[8px] border-gray-900 overflow-hidden shadow-2xl bg-white relative mx-auto";
      }
  }

  // Background Logic
  const backgroundStyle: React.CSSProperties = {
      backgroundColor: profile.style.backgroundColor,
      fontFamily: profile.style.fontFamily,
      color: profile.style.textColor,
      ...wrapperStyle
  };

  if (profile.style.backgroundType === 'gradient' && profile.style.backgroundGradient) {
      backgroundStyle.background = profile.style.backgroundGradient;
  }
  
  if (profile.style.backgroundType === 'image' && profile.style.backgroundImage) {
      backgroundStyle.backgroundImage = `url(${profile.style.backgroundImage})`;
      backgroundStyle.backgroundSize = 'cover';
      backgroundStyle.backgroundPosition = 'center';
  }

  // Handle Mesh/Animated classes
  let bgClass = "";
  if (profile.style.backgroundType === 'mesh') {
      backgroundStyle.background = 'radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)';
      backgroundStyle.backgroundColor = '#000'; 
  }
  if (profile.style.backgroundType === 'animated') {
      bgClass = "bg-animate-gradient"; 
      backgroundStyle.backgroundSize = "400% 400%";
      backgroundStyle.backgroundImage = profile.style.backgroundGradient || "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)";
  }

  const rawTextColor = profile.style.textColor || '#000000';
  const watermarkFill = rawTextColor.startsWith('#') ? rawTextColor.replace('#', '%23') : rawTextColor;

  return (
    <div className={`${containerClass} ${bgClass} transition-all duration-300`} style={backgroundStyle}>
      {/* Phone Notch only in Mobile Preview Mode */}
      {previewMode && deviceMode === 'mobile' && !isCanvas && (
         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
      )}
      {previewMode && deviceMode === 'mobile' && isCanvas && (
         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20 pointer-events-none"></div>
      )}

      {/* Mesh Overlay */}
      {profile.style.backgroundType === 'mesh' && (
           <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>
      )}
      
      {/* WATERMARK */}
      {profile.plan === 'free' && (
          <div 
             className="absolute inset-0 opacity-[0.10] pointer-events-none z-0" 
             style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50' y='50' font-family='Arial' font-size='10' font-weight='bold' fill='${watermarkFill}' text-anchor='middle' transform='rotate(-45 50 50)'%3EMyProfileLink%3C/text%3E%3C/svg%3E")`,
                 backgroundRepeat: 'repeat'
             }}
          ></div>
      )}

      <div className={`h-full overflow-y-auto hide-scrollbar ${previewMode && deviceMode === 'mobile' && !isCanvas ? 'pt-14 pb-8' : 'py-12'} px-6 relative z-10 flex flex-col`}>
        {/* Profile Header - Only show in List/Grid mode */}
        {!isCanvas && (
            <div className={`text-center mb-8 ${deviceMode === 'desktop' ? 'max-w-2xl mx-auto w-full' : ''}`}>
            <div className="relative inline-block mb-4">
                <img 
                src={profile.avatarUrl || "https://picsum.photos/200"} 
                alt={profile.displayName} 
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-lg mx-auto object-cover"
                />
                {profile.plan !== 'free' && (
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white" title="Verified Creator">
                        <Check className="w-3 h-3" /> 
                    </div> 
                )}
            </div>
            <h1 className="text-xl font-bold tracking-tight">{profile.displayName}</h1>
            <p className="mt-2 text-sm opacity-80 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
            </div>
        )}

        <div className={`${deviceMode === 'desktop' && !isCanvas ? 'max-w-2xl mx-auto w-full' : 'w-full'} flex-1 relative`}>
            {/* Conditional Layout Rendering */}
            <div className={`
                ${isGrid ? 'grid grid-cols-2 gap-3' : ''}
                ${isCanvas ? 'relative w-full h-full min-h-[500px]' : 'flex flex-col gap-3'}
            `}>
                {profile.blocks.filter(b => b.visible).map(block => (
                    <BlockRenderer 
                        key={block.id} 
                        block={block} 
                        globalStyle={profile.style} 
                        layoutMode={layoutMode}
                        deviceMode={deviceMode}
                    />
                ))}
            </div>
        </div>
        
        {!isCanvas && (
            <div className="mt-8 text-center pb-4 col-span-full">
                <a href="https://www.myprofilelink.in" target="_blank" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity font-bold text-current">
                    <span>Made with ❤️ by MyProfileLink Team</span>
                </a>
            </div>
        )}
      </div>
      
      <style>{`
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .bg-animate-gradient {
            animation: gradient 15s ease infinite;
        }
      `}</style>
    </div>
  );
};
