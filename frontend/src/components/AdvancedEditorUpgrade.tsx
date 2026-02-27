import React, { useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface AdvancedEditorUpgradeProps {
  user: UserProfile;
}

export const AdvancedEditorUpgrade: React.FC<AdvancedEditorUpgradeProps> = ({ user }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-business users directly to pricing page
    if (user.plan !== 'business') {
      navigate('/checkout?plan=business', { replace: true });
    }
  }, [user.plan, navigate]);

  // Show nothing while redirecting
  return null;
};
//         <div className="relative z-10">
//           <div className="flex items-center gap-3 mb-4">
//             <Sparkles size={32} className="animate-pulse" />
//             <h2 className="text-3xl font-black">Unlock Creative Freedom</h2>
//           </div>
//           <p className="text-lg text-white/80 max-w-2xl mb-8">
//             Drag and drop anywhere on your page. Use AI to generate beautiful layouts instantly. Design without limits.
//           </p>
//           {user.plan === 'business' && (
//             <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
//               <Check className="text-emerald-300" size={20} />
//               <span className="font-bold">You already have this!</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Features Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
//         {[
//           {
//             icon: <Sparkles className="text-yellow-500" size={24} />,
//             title: "AI Layout Generation",
//             desc: "Our AI analyzes your content and creates stunning layouts in seconds."
//           },
//           {
//             icon: <Check className="text-emerald-500" size={24} />,
//             title: "Unlimited Customization",
//             desc: "Drag, drop, resize, and position every element freely on the canvas."
//           },
//           {
//             icon: <Zap className="text-orange-500" size={24} />,
//             title: "Lightning Fast",
//             desc: "Change designs in real-time with instant preview updates."
//           },
//           {
//             icon: <ArrowRight className="text-blue-500" size={24} />,
//             title: "Advanced Animations",
//             desc: "Add smooth transitions and effects to impress your audience."
//           }
//         ].map((feature, i) => (
//           <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
//             <div className="mb-4">{feature.icon}</div>
//             <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
//             <p className="text-gray-600 text-sm">{feature.desc}</p>
//           </div>
//         ))}
//       </div>

//       {/* Comparison Table */}
//       <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Feature</th>
//                 <th className="px-6 py-4 text-center text-sm font-bold text-gray-400">Free/Pro</th>
//                 <th className="px-6 py-4 text-center text-sm font-bold text-brand-600">Business</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {[
//                 { feature: "Basic Editor", free: true, business: true },
//                 { feature: "Drag & Drop Canvas", free: false, business: true },
//                 { feature: "AI Layout Generation", free: false, business: true },
//                 { feature: "Unlimited Designs", free: false, business: true },
//                 { feature: "Advanced Animations", free: false, business: true },
//                 { feature: "Priority Support", free: false, business: true }
//               ].map((row, i) => (
//                 <tr key={i} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
//                   <td className="px-6 py-4 text-center">
//                     {row.free ? (
//                       <Check className="inline text-emerald-500" size={20} />
//                     ) : (
//                       <Lock className="inline text-gray-300" size={20} />
//                     )}
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <Check className="inline text-brand-600" size={20} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* CTA Section */}
//       <div className="bg-brand-50 rounded-[2rem] p-8 border border-brand-100 text-center">
//         <h3 className="text-2xl font-black text-gray-900 mb-2">Ready to Create Without Limits?</h3>
//         <p className="text-gray-600 mb-8">Join our Business plan and unlock the Advanced Canvas + AI Editor.</p>
        
//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           {(isFree || isPro) && (
//             <button 
//               onClick={() => navigate('/checkout?plan=business')}
//               className="bg-brand-600 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg flex items-center justify-center gap-2"
//             >
//               <Zap size={18} className="text-yellow-400 fill-yellow-400" />
//               Upgrade to Business (₹699/mo)
//             </button>
//           )}
//           <button 
//             onClick={() => window.history.back()}
//             className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
//           >
//             Go Back
//           </button>
//         </div>

//         {user.plan === 'business' && (
//           <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
//             <p className="text-emerald-700 font-bold text-sm">
//               ✨ You have access to the Advanced Editor! Head to the editor to start creating.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

