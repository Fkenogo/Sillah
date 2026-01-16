
import React from 'react';
import { CircleSummary } from '../types';

interface SummaryCardProps {
  summary: CircleSummary;
  circleName: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary, circleName }) => {
  return (
    <div className="bg-gradient-to-br from-siilah-slate to-siilah-olive p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-700">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <i className="fa-solid fa-sparkles text-siilah-gold"></i>
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold italic">Circle Recap</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{circleName} • Last 7 Days</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-4 bg-white/5 rounded-3xl border border-white/10">
             <p className="text-xl font-bold">{summary.highlights.prayers_shared}</p>
             <p className="text-[8px] font-bold uppercase tracking-tighter opacity-50">Prayers</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-3xl border border-white/10">
             <p className="text-xl font-bold">{summary.highlights.responses}</p>
             <p className="text-[8px] font-bold uppercase tracking-tighter opacity-50">Heart-to-Hearts</p>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-3xl border border-white/10">
             <p className="text-xl font-bold">{summary.highlights.praying_now}</p>
             <p className="text-[8px] font-bold uppercase tracking-tighter opacity-50">Sessions</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 opacity-60">Emerging Themes</h4>
            <div className="flex flex-wrap gap-2">
              {summary.themes.map((t, i) => (
                <span key={i} className="px-4 py-1.5 bg-white/10 rounded-full text-xs font-medium border border-white/5">
                  {t.theme} ({t.count})
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-[2rem] border border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-siilah-gold">Key Moment</h4>
            <p className="text-sm font-medium italic leading-relaxed opacity-90">"{summary.key_moment}"</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
             <div className="flex items-center gap-2">
                <i className="fa-solid fa-trophy text-siilah-gold text-sm"></i>
                <span className="text-xs font-bold">{summary.celebration}</span>
             </div>
             <button className="text-[10px] font-bold uppercase tracking-widest bg-white text-siilah-slate px-6 py-2.5 rounded-full">Share Reflection</button>
          </div>
        </div>
      </div>
    </div>
  );
};
