
import React from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <div className="bg-white/40 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border-2 border-siilah-sage/20 shadow-xl shadow-siilah-sage/5 animate-in fade-in slide-in-from-right-4 duration-700 relative overflow-hidden group">
      {/* Decorative background icon */}
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-9xl group-hover:scale-110 transition-transform duration-1000">
        <i className="fa-solid fa-earth-americas"></i>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-siilah-sage/10 text-siilah-sage rounded-full flex items-center justify-center text-xs">
              <i className="fa-solid fa-newspaper"></i>
            </div>
            <span className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest">Spiritual Pulse</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {news.sourceName}
          </span>
        </div>

        <h3 className="font-serif text-xl md:text-2xl font-bold text-siilah-slate mb-3 leading-tight italic">
          {news.title}
        </h3>
        
        <p className="text-sm text-siilah-slate/80 leading-relaxed mb-6 font-medium italic">
          {news.description}
        </p>

        <a 
          href={news.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-siilah-sage text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-siilah-olive transition-all shadow-lg shadow-siilah-sage/20"
        >
          Read the Full Story
          <i className="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
        </a>
      </div>
    </div>
  );
};
