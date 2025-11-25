// import React from 'react';
// import { 
//   MapPin, 
//   Clock, 
//   Hotel, 
//   Bus, 
//   Info, 
//   Lock, 
//   MoreHorizontal, 
//   ArrowRight 
// } from 'lucide-react';

// // --- Component 1: Monthly Rating Card (Bar Chart) ---
// export const MonthlyRatingCard = ({ ratings }: any) => {
//   const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  
//   return (
//     <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-full mb-3">
//       <div className="flex justify-between items-center mb-3">
//         <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Time to Visit</h4>
//         <div className="group relative">
//           <Info size={14} className="text-slate-300 cursor-help" />
//           {/* Tooltip */}
//           <div className="absolute right-0 bottom-6 w-48 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
//             Higher bars indicate better weather and conditions for visiting.
//           </div>
//         </div>
//       </div>
//       <div className="flex justify-between items-end h-16 gap-1">
//         {ratings.map((rating, index) => (
//           <div key={index} className="flex flex-col items-center gap-1 w-full group cursor-default">
//             <div 
//               className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
//                 rating >= 8 ? 'bg-green-500' : rating >= 5 ? 'bg-blue-400' : 'bg-slate-200'
//               }`}
//               style={{ height: `${rating * 10}%` }}
//             ></div>
//             <span className="text-[9px] font-medium text-slate-400 group-hover:text-slate-600">{months[index]}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // --- Component 2: Info Card (Individual Stat) ---
// export const InfoCard = ({ icon: Icon, label, value, info, delay = 0 }) => (
//   <div 
//     className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:border-blue-200 transition-all duration-300 hover:shadow-md opacity-0 animate-fade-in-up"
//     style={{ 
//       animationDelay: `${delay}ms`,
//       animationFillMode: 'forwards'
//     }}
//   >
//     <div className="flex justify-between items-start mb-2">
//       <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
//         <Icon size={18} />
//       </div>
//       {info && (
//         <div className="group relative">
//             <Info size={14} className="text-slate-200 hover:text-slate-400 cursor-help" />
//              <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-32 bg-slate-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
//                 {info}
//             </div>
//         </div>
//       )}
//     </div>
//     <div>
//       <h4 className="text-lg font-bold text-slate-800 tracking-tight">{value}</h4>
//       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
//     </div>
//   </div>
// );

// // --- Component 3: Premium Overlay (Lock Screen) ---
// export const PremiumOverlay = ({ onUpgrade }) => (
//   <div className="absolute inset-0 top-[100px] bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl border border-white/50 animate-fade-in">
//     <div className="bg-white p-4 rounded-full shadow-xl mb-4 text-blue-600 ring-4 ring-blue-50">
//       <Lock size={32} />
//     </div>
//     <h3 className="text-xl font-bold text-slate-800 mb-2">Premium Stats</h3>
//     <p className="text-slate-500 text-sm mb-6 text-center max-w-[200px] leading-relaxed">
//       Unlock detailed cost breakdowns, distance metrics, and transport options.
//     </p>
//     <button 
//       onClick={onUpgrade}
//       className="bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
//     >
//       Unlock Summary
//     </button>
//   </div>
// );

// // --- Main Container: Summary Trip Card ---
// export default function SummaryTripCard({ plan, isPremium, onUpgrade }) {
//   // Keyframes for the fade-in-up animation (Add to your global CSS or Tailwind config if missing)
//   const styleSheet = document.createElement("style");
//   styleSheet.innerText = `
//     @keyframes fade-in-up {
//       from { opacity: 0; transform: translateY(10px); }
//       to { opacity: 1; transform: translateY(0); }
//     }
//     .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
//     .animate-fade-in { animation: fade-in-up 0.3s ease-out; }
//   `;
//   React.useEffect(() => {
//     document.head.appendChild(styleSheet);
//     return () => document.head.removeChild(styleSheet);
//   }, []);

//   return (
//     <div className="bg-slate-50 rounded-3xl p-6 flex flex-col relative overflow-hidden h-full border border-slate-200 shadow-sm">
      
//       {/* Header */}
//       <div className="flex justify-between items-start mb-6 z-10">
//         <div>
//            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 text-blue-600">Next Adventure</h3>
//            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{plan.destination}</h2>
//         </div>
//         <button className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-blue-600 transition-colors border border-slate-100">
//           <MoreHorizontal size={20} />
//         </button>
//       </div>

//       <div className="space-y-3 relative z-10 flex-1">
        
//         {/* 1. Monthly Ratings - Always Visible */}
//         <MonthlyRatingCard ratings={plan.monthlyRatings} />

//         {/* 2. Grid of Info Cards */}
//         <div className="grid grid-cols-2 gap-3 relative">
           
//            {/* Premium Overlay Layer */}
//            {!isPremium && (
//               <PremiumOverlay onUpgrade={onUpgrade} />
//            )}
           
//            {/* Stats */}
//            <InfoCard 
//              icon={MapPin} 
//              label="Distance" 
//              value={plan.stats.distance} 
//              info="Total walking distance"
//              delay={100}
//            />
//            <InfoCard 
//              icon={Clock} 
//              label="Duration" 
//              value={plan.stats.duration} 
//              info="Estimated completion time"
//              delay={200}
//            />
//            <InfoCard 
//              icon={Hotel} 
//              label="Avg. Stay" 
//              value={plan.stats.accomPrice} 
//              info="Average nightly rate"
//              delay={300}
//            />
//            <InfoCard 
//              icon={Bus} 
//              label="Transport" 
//              value={plan.stats.transportPrice} 
//              info="Estimated public transit cost"
//              delay={400}
//            />
//         </div>
//       </div>

//       {/* Footer Action */}
//       <div className="mt-6 z-10">
//         <button className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl flex items-center justify-between hover:bg-slate-800 transition-all group shadow-xl shadow-slate-200">
//             <span className="font-bold">View Full Itinerary</span>
//             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
//         </button>
//       </div>
      
//       {/* Background Decor */}
//       <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
//       <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl pointer-events-none mix-blend-multiply"></div>
//     </div>
//   );
// }