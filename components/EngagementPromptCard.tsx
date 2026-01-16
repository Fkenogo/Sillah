
import React from 'react';
import { EngagementPrompt } from '../types';
import { Button } from './Button';

interface EngagementPromptCardProps {
  prompt: EngagementPrompt;
  onAction: () => void;
  onDismiss: () => void;
}

export const EngagementPromptCard: React.FC<EngagementPromptCardProps> = ({ prompt, onAction, onDismiss }) => {
  const icons = {
    icebreaker: 'fa-comments',
    depth: 'fa-heart-pulse',
    reflection: 'fa-book-open',
    check_in: 'fa-user-clock',
    celebration: 'fa-sparkles',
    re_engagement: 'fa-leaf'
  };

  const category = prompt.type as keyof typeof icons;

  return (
    <div className="relative mx-auto w-full max-w-2xl px-4">
      <div className="bg-white/90 backdrop-blur-md border border-siilah-sage/20 p-8 rounded-[2.5rem] shadow-xl shadow-siilah-sage/5 relative overflow-hidden group">
        {/* Subtle pattern background */}
        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
          <i className={`fa-solid ${icons[category] || icons.reflection} text-8xl`}></i>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0">
             <div className="w-14 h-14 rounded-2xl bg-siilah-sage/10 flex items-center justify-center text-siilah-sage text-xl shadow-inner">
               <i className={`fa-solid ${icons[category] || icons.reflection}`}></i>
             </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-siilah-sage/60">
                Siilah's Gentle Nudge
              </span>
              <button 
                onClick={onDismiss}
                className="text-gray-200 hover:text-siilah-clay transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight text-siilah-slate italic">
              "{prompt.text}"
            </h3>
            
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium tracking-wide uppercase">
              {prompt.context}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button 
                size="sm" 
                className="rounded-full shadow-md shadow-siilah-sage/10 px-8 h-12 text-[10px] font-bold uppercase tracking-widest"
                onClick={onAction}
              >
                {prompt.actionLabel || 'Share Reflection'}
              </Button>
              <button 
                className="text-[10px] uppercase font-bold tracking-[0.2em] text-gray-300 hover:text-siilah-slate transition-colors px-4"
                onClick={onDismiss}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
