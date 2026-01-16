import React, { useState } from 'react';
import { Post, PostResponse } from '../types';
import { PostReactions } from './PostReactions';
import { MiniAudioPlayer } from './MiniAudioPlayer';
import { Button } from './Button';
import { VoiceRecorder } from './VoiceRecorder';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
  post: Post;
  userId: string;
  userName: string;
  isOwner: boolean;
  onReact: (emoji: string) => void;
  onPrayToggle: (prayerText?: string) => void;
  onReply: (content: string, voiceNoteUrl?: string) => void;
  onMarkAnswered: () => void;
  onEdit: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  userId, 
  userName, 
  isOwner, 
  onReact, 
  onPrayToggle, 
  onReply, 
  onMarkAnswered,
  onEdit
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [pendingReplyVoiceNote, setPendingReplyVoiceNote] = useState<string | null>(null);
  const [showPrayInput, setShowPrayInput] = useState(false);
  const [activePrayerText, setActivePrayerText] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isUserPraying = post.praying_now?.some(p => p.user_id === userId);
  const prayingCount = post.praying_now?.length || 0;
  
  // Logic to determine if there are any unread replies
  const hasUnread = post.responses?.some(r => r.is_unread) || post.has_unread_responses;

  const handleSendReply = () => {
    if (replyText.trim() || pendingReplyVoiceNote) {
      onReply(replyText, pendingReplyVoiceNote || undefined);
      setReplyText('');
      setPendingReplyVoiceNote(null);
    }
  };

  const handlePrayClick = () => {
    if (isUserPraying) {
      onPrayToggle();
    } else {
      setShowPrayInput(true);
    }
  };

  const submitPrayer = () => {
    onPrayToggle(activePrayerText);
    setShowPrayInput(false);
    setActivePrayerText('');
  };

  const getPostTypeStyles = (type: string) => {
    switch (type) {
      case 'prayer_request': return 'border-siilah-sage/20 text-siilah-sage bg-siilah-sage/[0.04]';
      case 'testimony': return 'border-siilah-gold/30 text-siilah-gold bg-siilah-gold/[0.04]';
      case 'struggle': return 'border-siilah-clay/30 text-siilah-clay bg-siilah-clay/[0.04]';
      case 'gratitude': return 'border-siilah-olive/30 text-siilah-olive bg-siilah-olive/[0.04]';
      case 'question': return 'border-siilah-slate/30 text-siilah-slate bg-siilah-slate/[0.04]';
      default: return 'border-gray-100 text-gray-400 bg-gray-50';
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'prayer_request': return 'fa-hands-praying';
      case 'testimony': return 'fa-sun';
      case 'struggle': return 'fa-cloud-showers-heavy';
      case 'gratitude': return 'fa-heart';
      case 'question': return 'fa-circle-question';
      default: return 'fa-message';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-siilah-sage';
      case 'away': return 'bg-siilah-gold';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className={`p-5 md:p-8 rounded-[2.5rem] shadow-sm border transition-all relative ${post.is_answered_prayer ? 'border-siilah-gold/40 bg-siilah-gold/[0.03]' : 'bg-white border-gray-100/60 hover:shadow-md'}`}>
      
      {/* Thread Visual Line */}
      {showReplies && post.responses && post.responses.length > 0 && (
        <div className="absolute left-[34px] md:left-[46px] top-[72px] bottom-[100px] w-0.5 bg-gradient-to-b from-siilah-sage/30 via-siilah-sage/10 to-transparent z-0" />
      )}

      {/* Answered Prayer Tag */}
      {post.is_answered_prayer && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-3 left-8 bg-siilah-gold text-white text-[8px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full z-10 shadow-md flex items-center gap-1.5"
        >
          <i className="fa-solid fa-star animate-spin-slow"></i>
          Answered Prayer
        </motion.div>
      )}

      {/* Post Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={post.user.photo_url === 'siilah_logo' ? 'https://picsum.photos/seed/siilah/100/100' : (post.user.photo_url || `https://picsum.photos/seed/${post.user.user_id}/100/100`)} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl object-cover border border-white shadow-sm" alt="Avatar" />
            
            <div className={`absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(post.user.status || 'offline')}`}></div>
            
            {prayingCount > 0 && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-siilah-sage opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-siilah-sage border-2 border-white"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[12px] md:text-sm font-bold text-siilah-slate leading-tight">{post.user.name}</p>
              {post.is_edited && (
                <span className="text-[8px] font-bold text-gray-300 uppercase italic tracking-tighter">(Edited)</span>
              )}
            </div>
            <p className="text-[9px] md:text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">
              {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <span className={`flex items-center gap-1.5 text-[8px] px-3.5 py-1.5 rounded-full font-bold uppercase tracking-[0.1em] border ${getPostTypeStyles(post.post_type)}`}>
            <i className={`fa-solid ${getPostTypeIcon(post.post_type)} text-[9px]`}></i>
            {post.post_type.replace('_', ' ')}
          </span>
          
          {isOwner && (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className={`w-8 h-8 flex items-center justify-center transition-colors rounded-full ${showMenu ? 'bg-siilah-slate text-white' : 'text-gray-200 hover:text-siilah-slate hover:bg-gray-50'}`}
              >
                <i className="fa-solid fa-ellipsis-vertical"></i>
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden py-1"
                    >
                      <button 
                        onClick={() => { onEdit(post.post_id); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-siilah-slate hover:bg-gray-50 flex items-center gap-3"
                      >
                        <i className="fa-solid fa-pen-to-square w-4"></i>
                        Edit Post
                      </button>
                      
                      {post.post_type === 'prayer_request' && !post.is_answered_prayer && (
                        <button 
                          onClick={() => { onMarkAnswered(); setShowMenu(false); }}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-siilah-gold hover:bg-siilah-gold/5 flex items-center gap-3 border-t border-gray-50"
                        >
                          <i className="fa-solid fa-check-circle w-4"></i>
                          Mark as Answered
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Message Body */}
      <div className="space-y-4 pl-0 md:pl-1 relative z-10">
        {post.auto_summary && (
          <div className="px-4 py-3 bg-siilah-sage/[0.02] rounded-2xl border-l-2 border-siilah-sage/20">
            <p className="text-[11px] md:text-xs font-medium text-siilah-slate/50 italic leading-snug">"{post.auto_summary}"</p>
          </div>
        )}

        <p className={`text-siilah-slate leading-relaxed font-serif italic whitespace-pre-wrap transition-all ${post.is_answered_prayer ? 'text-base md:text-lg opacity-100' : 'text-sm md:text-base opacity-90'}`}>
          {post.content_text}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {post.tags.map(tag => (
              <span key={tag} className="text-[9px] md:text-[10px] font-bold text-siilah-sage uppercase tracking-wider bg-siilah-sage/5 px-2.5 py-1 rounded-lg border border-siilah-sage/10">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {post.voice_note_url && (
          <div className="max-w-xs pt-1">
            <MiniAudioPlayer url={post.voice_note_url} label="Voice Reflection" compact />
          </div>
        )}
      </div>

      {/* Action Footer Bar */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-5 relative z-10">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex flex-col gap-1">
            <button 
              onClick={handlePrayClick}
              disabled={post.is_answered_prayer}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all h-10 ${
                post.is_answered_prayer
                ? 'bg-siilah-gold/10 text-siilah-gold cursor-default'
                : isUserPraying 
                ? 'bg-siilah-sage text-white shadow-lg shadow-siilah-sage/20' 
                : 'border border-siilah-sage/30 text-siilah-sage hover:bg-siilah-sage/5'
              }`}
            >
              <i className={`fa-solid ${post.is_answered_prayer ? 'fa-check' : 'fa-hands-praying'} ${isUserPraying ? 'animate-soft-pulse' : ''}`}></i>
              <span className="hidden sm:inline">
                {post.is_answered_prayer ? 'Prayer Answered' : isUserPraying ? 'Praying' : 'Pray'} 
                {prayingCount > 0 && !post.is_answered_prayer && ` (${prayingCount})`}
              </span>
              <span className="sm:hidden">
                {post.is_answered_prayer ? 'Done' : isUserPraying ? 'Praying' : 'Pray'}
                {prayingCount > 0 && !post.is_answered_prayer && ` (${prayingCount})`}
              </span>
            </button>
            {isUserPraying && !post.is_answered_prayer && (
              <span className="text-[7px] font-bold text-siilah-sage uppercase tracking-tighter text-center animate-pulse">
                Click to stop
              </span>
            )}
          </div>

          <button 
            onClick={() => setShowReplies(!showReplies)}
            className={`flex items-center gap-2 text-gray-300 hover:text-siilah-slate transition-colors relative h-10`}
          >
            <i className="fa-solid fa-comment-dots text-sm"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest">{post.response_count}</span>
            {hasUnread && (
              <span className="absolute -top-1 -right-2 w-2.5 h-2.5 rounded-full bg-siilah-sage shadow-[0_0_8px_rgba(158,179,132,0.8)] animate-pulse" />
            )}
          </button>
        </div>

        <PostReactions 
          reactions={post.reactions} 
          userName={userName} 
          onReact={onReact} 
          onReplyClick={() => setShowReplies(!showReplies)} 
        />
      </div>

      {/* Interactive Expandables */}
      <AnimatePresence>
        {showPrayInput && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden relative z-10"
          >
            <div className="mt-4 p-5 bg-siilah-sage/5 rounded-3xl space-y-3 border border-siilah-sage/10">
              <p className="text-[9px] font-bold text-siilah-sage uppercase tracking-widest">Intercession</p>
              <textarea 
                className="w-full bg-white/50 border-none rounded-2xl p-4 text-xs font-serif italic text-siilah-slate focus:ring-2 ring-siilah-sage/20 resize-none"
                placeholder="What is the Spirit leading you to pray?"
                rows={2}
                value={activePrayerText}
                onChange={(e) => setActivePrayerText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl" onClick={() => setShowPrayInput(false)}>Skip</Button>
                <Button size="sm" className="h-9 px-6 rounded-xl" onClick={submitPrayer}>Pray Now</Button>
              </div>
            </div>
          </motion.div>
        )}

        {showReplies && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="overflow-hidden relative z-10"
          >
            <div className="mt-6 space-y-6 pt-6 border-t border-gray-50 pl-2 md:pl-6 relative">
              {post.responses?.map((resp) => (
                <div key={resp.response_id} className="flex gap-4 relative group">
                  <div className="absolute -left-[14px] md:-left-[24px] top-5 w-3.5 md:w-6 h-px bg-siilah-sage/20" />
                  
                  <div className="relative shrink-0">
                    <img src={resp.user.photo_url || `https://picsum.photos/seed/${resp.user.user_id}/100/100`} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border border-white shadow-sm" alt="" />
                    {resp.is_unread && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-siilah-sage border-2 border-white shadow-sm animate-pulse" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] md:text-xs font-bold text-siilah-slate">{resp.user.name}</p>
                        {resp.is_unread && (
                          <span className="text-[7px] font-bold uppercase text-white bg-siilah-sage px-1.5 py-0.5 rounded-full tracking-wider">New</span>
                        )}
                      </div>
                      <span className="text-[8px] md:text-[9px] text-gray-300 font-bold uppercase">{new Date(resp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className={`p-4 rounded-2xl ${resp.is_unread ? 'bg-siilah-sage/[0.06] border border-siilah-sage/20 shadow-sm' : 'bg-gray-50 border border-gray-100/50'}`}>
                      {resp.content_text && (
                        <p className="text-xs md:text-sm text-siilah-slate/80 italic font-serif leading-relaxed whitespace-pre-wrap">{resp.content_text}</p>
                      )}
                      {resp.voice_note_url && (
                        <div className="mt-2">
                          <MiniAudioPlayer url={resp.voice_note_url} compact label="Voice Reply" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="sticky bottom-0 pt-4 bg-white/80 backdrop-blur-md pb-2">
                <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl flex items-end gap-2 focus-within:ring-2 ring-siilah-sage/10 transition-all">
                  <div className="flex-1 min-h-[44px] flex items-center">
                    <textarea 
                      className="w-full bg-transparent border-none text-xs md:text-sm font-serif italic focus:ring-0 placeholder:text-gray-300 py-3 px-4 resize-none"
                      placeholder="Share a word of encouragement..."
                      rows={1}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-1.5 pb-1 pr-1">
                    <button 
                      onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isVoiceRecording ? 'bg-siilah-clay text-white shadow-lg' : 'text-gray-300 hover:text-siilah-sage hover:bg-gray-50'}`}
                    >
                      <i className="fa-solid fa-microphone text-sm"></i>
                    </button>
                    <button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim() && !pendingReplyVoiceNote}
                      className="w-10 h-10 bg-siilah-sage text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-30 disabled:shadow-none active:scale-90 transition-all"
                    >
                      <i className="fa-solid fa-paper-plane text-[11px]"></i>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isVoiceRecording && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-3"
                    >
                      <VoiceRecorder 
                        onRecordingComplete={(url) => { setPendingReplyVoiceNote(url); setIsVoiceRecording(false); }} 
                        onCancel={() => setIsVoiceRecording(false)} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
