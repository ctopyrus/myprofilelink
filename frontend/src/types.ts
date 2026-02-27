

export type BlockType = 'link' | 'header' | 'product' | 'media' | 'text';

export interface LayoutData {
    x: number;
    y: number;
    w?: number;
    h?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  url?: string;
  subtitle?: string;
  imageUrl?: string;
  price?: string; // e.g. "₹499"
  icon?: string; // Icon name e.g. "instagram", "twitter"
  visible: boolean;
  // Individual block customization
  customStyle?: {
    shape?: 'rounded' | 'square' | 'pill' | 'shadow' | 'glass' | 'outline';
    highlight?: boolean;
  };
  // Advanced Editor Layout Data
  layout?: {
    mobile?: LayoutData;
    tablet?: LayoutData;
    desktop?: LayoutData;
  }
}

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'mesh' | 'animated';

export interface ProfileStyle {
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundClass?: string; // For Tailwind classes like 'bg-grid-slate-900'
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill' | 'shadow' | 'glass' | 'outline';
  fontFamily: string;
  layoutMode?: 'list' | 'grid' | 'canvas'; // New: Control layout structure
}

export type SubscriptionPlan = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'pending';

export interface VersionSnapshot {
    id: string;
    timestamp: string;
    blocks: Block[];
    style: ProfileStyle;
    note?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  blocks: Block[];
  style: ProfileStyle;
  templateId?: string;
  role: 'creator' | 'company_admin' | 'admin';
  
  // Auth & Verification
  isVerified: boolean;
  joinedAt: string;
  
  // Commercial Details
  isPro?: boolean; 
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  customDomain?: string; // e.g. "rahul.com"
  
  // Usage Tracking
  aiGenerationCount: number;
  
  // Onboarding Status
  onboardingCompleted: boolean;
  
  // Version History
  versionHistory?: VersionSnapshot[];
}

export type TemplateCategory = 'All' | 'E-commerce' | 'Services' | 'Coaching' | 'Influencer' | 'Community' | 'Creative' | 'Tech' | 'Personal';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  badge?: 'Popular' | 'New' | 'Best Seller' | 'Trending' | 'Minimal' | 'Pro' | 'AI';
  previewColor: string;
  initialStyle: ProfileStyle;
  initialBlocks: Block[];
  tags?: string[]; // e.g. ['dark', 'professional', 'fun']
}

export interface AnalyticsData {
  date: string;
  views: number;
  clicks: number;
}