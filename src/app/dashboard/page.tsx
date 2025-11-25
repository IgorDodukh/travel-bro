'use client';

import { motion } from 'framer-motion';
import { TRAVEL_PLANS, MOCK_CHART_DATA } from '@/lib/data';
import Link from 'next/link';
import { Plus, Clock, MapPin, Wallet, Bus, ArrowRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, CartesianGrid } from 'recharts';
import dynamic from 'next/dynamic';
import PlanCard from '@/components/PlanCard';

// Dynamically import Map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Dashboard() {
    return (
        <div className="p-8 space-y-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-brand-dark">Travel Dashboard</h1>
                    <p className="text-gray-400">Manage your upcoming adventures</p>
                </div>
                <button className="bg-brand-primary text-white px-6 py-3 rounded-full font-medium shadow-lg hover:bg-[#d93300] transition-colors flex items-center gap-2">
                    <Plus size={20} /> Generate Plan
                </button>
            </div>

            {/* Top Grid: Stats & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">

                {/* 1. Main Featured Plan (Left Large Card) */}
                <div className="lg:col-span-1 bg-gray-100 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group shadow-sm border border-white">
                    <div className="z-10 relative">
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Next Trip</h3>
                        <h2 className="text-2xl font-bold text-brand-dark">{TRAVEL_PLANS[0].title}</h2>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <StatItem icon={Clock} label="Duration" value={TRAVEL_PLANS[0].stats.duration} />
                            <StatItem icon={MapPin} label="Distance" value={TRAVEL_PLANS[0].stats.distance} />
                            <StatItem icon={Wallet} label="Avg. Stay" value={TRAVEL_PLANS[0].stats.accomPrice} />
                            <StatItem icon={Bus} label="Transport" value={TRAVEL_PLANS[0].stats.transportPrice} />
                        </div>
                    </div>

                    <Link href={`/plans/${TRAVEL_PLANS[0].id}`} className="z-10 mt-6 bg-black text-white py-4 px-6 rounded-2xl flex items-center justify-between hover:bg-black transition-colors font-semibold shadow-md w-full max-w-xs relative">
                        <span>View Itinerary</span>
                        <ArrowRight size={18} />
                    </Link>

                    {/* Abstract visual decoration */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all duration-500"></div>
                </div>

                {/* 2. Chart Card (Middle) */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-gray-500 text-sm font-medium mb-6">Activity Level</h3>
                    <div className="flex-1 w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={MOCK_CHART_DATA}>
                                {/* 👇 Added Grid Here */}
                                <CartesianGrid
                                    strokeDasharray="3 3"      // Creates the dashed effect
                                    vertical={true}            // Set to false if you only want horizontal lines
                                    horizontal={true}
                                    stroke="#a2a0a0ff"           // Tailwind gray-200 equivalent
                                    opacity={0.5}              // Keeps it subtle
                                />

                                <XAxis dataKey="name" hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#ff3c00', strokeWidth: 1, strokeDasharray: '5 5' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="speed"
                                    stroke="#ff3c00"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#212528' }}
                                    activeDot={{ r: 6, fill: '#ff3c00' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* 3. Current Location / Small Map (Right) */}
                <div className="lg:col-span-1 bg-brand-dark rounded-3xl overflow-hidden shadow-lg relative">
                    <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-xl">
                        <h4 className="font-bold text-sm">Tracking</h4>
                        <p className="text-xs text-gray-500">Live Updates</p>
                    </div>
                    <div className="h-full w-full opacity-80">
                        <MapComponent
                            center={[35.0116, 135.7681]}
                            zoom={10}
                            markers={[{ position: [35.0116, 135.7681], title: 'Current' }]}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Section: Plans List */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Your Travel Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TRAVEL_PLANS.map((plan) => (
                        // <motion.div
                        //     key={plan.id}
                        //     whileHover={{ y: -5 }}
                        //     className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group"
                        // >
                            <PlanCard
                                id={plan.id}
                                title={plan.title}
                                image={plan.image}
                                destination={plan.country}
                                duration={plan.stats.duration}
                                placesCount={plan.itinerary.length}
                                date="Oct 24, 2025" // Mock date since it's not in data
                            />
                        // </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-white p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <Icon size={18} className="text-gray-400 mb-1" />
            <span className="text-brand-dark font-bold text-sm">{value}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
        </div>
    );
}