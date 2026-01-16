
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Onboarding } from './components/Onboarding';
import { Button } from './components/Button';
import { EngagementPromptCard } from './components/EngagementPromptCard';
import { PostCard } from './components/PostCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { MiniAudioPlayer } from './components/MiniAudioPlayer';
import { ProfileSettings } from './components/ProfileSettings';
import { UserProfile, Circle, Post, FaithStage, EngagementPrompt, MatchRecommendation, CircleMember, PostType, PostResponse, UserStatus } from './types';
import { geminiService } from './services/geminiService';
import { 
  Paperclip, 
  Send, 
  Hash, 
  ChevronDown, 
  ChevronRight,
  X,
  Plus,
  Sparkles,
  Search,
  Users,
  Compass,
  LayoutGrid,
  Heart,
  User,
  MessageCircle,
  TrendingUp,
  Leaf,
  ShieldCheck,
  Stars,
  Mic,
  Trash2,
  Gem,
  Command,
  ArrowRight,
  Settings,
  Bell,
  Eye,
  MessageSquare
} from 'lucide-react';

const POST_TYPES: { type: PostType; label: string; icon: string; color: string; bg: string; shadow: string; description: string; placeholder: string }[] = [
  { type: 'prayer_request', label: 'PRAYER', icon: 'fa-hands-praying', color: 'text-siilah-sage', bg: 'bg-siilah-sage', shadow: 'shadow-siilah-sage/20', description: 'Ask for intercession', placeholder: 'What can we bring before the Father with you?' },
  { type: 'testimony', label: 'TESTIMONY', icon: 'fa-sun', color: 'text-siilah-gold', bg: 'bg-siilah-gold', shadow: 'shadow-siilah-gold/20', description: 'Share God\'s goodness', placeholder: 'How has the Lord shown His faithfulness today?' },
  { type: 'struggle', label: 'STRUGGLE', icon: 'fa-cloud-showers-heavy', color: 'text-siilah-clay', bg: 'bg-siilah-clay', shadow: 'shadow-siilah-clay/20', description: 'Be vulnerable & real', placeholder: 'In what area do you need His strength right now?' },
  { type: 'gratitude', label: 'GRATITUDE', icon: 'fa-heart', color: 'text-siilah-olive', bg: 'bg-siilah-olive', shadow: 'shadow-siilah-olive/20', description: 'Give thanks together', placeholder: 'What are you pausing to thank God for today?' },
  { type: 'question', label: 'QUESTION', icon: 'fa-circle-question', color: 'text-siilah-slate', bg: 'bg-siilah-slate', shadow: 'shadow-siilah-slate/20', description: 'Seek spiritual wisdom', placeholder: 'What spiritual mystery is on your heart?' },
];

/**
 * Fix: Added missing personality_indicators property to mock candidates 
 * to align with the UserProfile interface definition in types.ts.
 */
const MOCK_CANDIDATES: UserProfile[] = [
  { user_id: '2', name: 'Sarah', email: 'sarah@example.com', faith_stage: FaithStage.ESTABLISHED, seeking_goals: ['Deep accountability'], sharing_comfort: 'small_group', activity_preference: 'daily', prayer_focus: ['Personal growth'], life_stages: ['Parenting'], timezone_preference: 'morning', christian_tradition: 'Baptist', status: 'active', current_status: 'online', personality_indicators: ['Encourager', 'Prayer warrior'], privacy_settings: { profile_visibility: 'public', posts_visibility: 'friends_only' }, notification_settings: { push_enabled: true, prayer_requests: true, circle_activity: true, messages: true } },
  { user_id: '3', name: 'Isaiah', email: 'isaiah@example.com', faith_stage: FaithStage.GROWING, seeking_goals: ['Spiritual friendship'], sharing_comfort: 'one_on_one', activity_preference: 'weekly', prayer_focus: ['Career/purpose'], life_stages: ['Student life'], timezone_preference: 'evening', christian_tradition: 'Methodist', status: 'active', current_status: 'away', personality_indicators: ['Deep thinker'], privacy_settings: { profile_visibility: 'public', posts_visibility: 'friends_only' }, notification_settings: { push_enabled: true, prayer_requests: true, circle_activity: true, messages: true } },
  { user_id: '4', name: 'Hannah', email: 'hannah@example.com', faith_stage: FaithStage.EXPLORING, seeking_goals: ['Spiritual friendship'], sharing_comfort: 'small_group', activity_preference: 'daily', prayer_focus: ['Health/healing'], life_stages: ['Career focus'], timezone_preference: 'morning', christian_tradition: 'Catholic', status: 'active', current_status: 'offline', personality_indicators: ['Quiet listener', 'Caregiver'], privacy_settings: { profile_visibility: 'friends_only', posts_visibility: 'friends_only' }, notification_settings: { push_enabled: false, prayer_requests: true, circle_activity: true, messages: true } },
];

const PUBLIC_CIRCLES = [
  { id: 'c1', name: 'Waiting Season Triad', theme: 'Waiting', activity: 'Daily' },
  { id: 'c2', name: 'Parenting Support', theme: 'Parenting', activity: 'Weekly' },
  { id: 'c3', name: 'New Believer Sanctuary', theme: 'Foundations', activity: 'Daily' },
  { id: 'c4', name: 'Healing Hearts', theme: 'Grief', activity: 'Biweekly' },
];

const SPIRITUAL_THEMES = [
  'Forgiveness', 'Authenticity', 'Resilience', 'Prayer Depth', 'Liturgy', 'Grief', 'Healing', 'Transition', 'Parenting', 'Marriage', 'Career'
];

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback((reset?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (reset) {
      textarea.style.height = `${minHeight}px`;
      return;
    }
    textarea.style.height = `${minHeight}px`;
    const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight));
    textarea.style.height = `${newHeight}px`;
  }, [minHeight, maxHeight]);
  return { textareaRef, adjustHeight };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'circles' | 'discover' | 'profile'>('feed');
  const [feedMode, setFeedMode] = useState<'reflections' | 'chat'>('reflections');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<Record<string, Post[]>>({});
  const [matchingResults, setMatchingResults] = useState<MatchRecommendation[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [dailyEncouragement, setDailyEncouragement] = useState<string>('');
  const [activePrompt, setActivePrompt] = useState<EngagementPrompt | null>(null);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [postContent, setPostContent] = useState('');
  const [selectedPostType, setSelectedPostType] = useState<PostType>('prayer_request');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [pendingVoiceNote, setPendingVoiceNote] = useState<string | null>(null);

  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea(48, 150);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !dailyEncouragement) {
      geminiService.getDailyEncouragement(user).then(setDailyEncouragement);
    }
  }, [user, dailyEncouragement]);

  useEffect(() => {
    if (activeCircle && !activePrompt && !isPromptLoading && activeCircle.circle_type !== 'ai_companion') {
      const timeout = setTimeout(triggerAIPrompt, 5000);
      return () => clearTimeout(timeout);
    }
  }, [activeCircle]);

  useEffect(() => {
    if (feedMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feedMode, posts]);

  /**
   * Simulated Pruning for Inactive Intercessors
   * If an intercessor has been praying for more than 5 minutes, 
   * we simulate them "finishing" their session.
   */
  useEffect(() => {
    const pruneInterval = setInterval(() => {
      setPosts(prev => {
        const newPosts = { ...prev };
        const now = Date.now();
        let changed = false;

        Object.keys(newPosts).forEach(circleId => {
          newPosts[circleId] = newPosts[circleId].map(post => {
            if (post.praying_now && post.praying_now.length > 0) {
              const pruned = post.praying_now.filter(p => {
                const startedAt = new Date(p.started_at).getTime();
                // Prune after 5 minutes of simulated activity
                return (now - startedAt) < (5 * 60 * 1000); 
              });
              if (pruned.length !== post.praying_now.length) {
                changed = true;
                return { ...post, praying_now: pruned };
              }
            }
            return post;
          });
        });

        return changed ? newPosts : prev;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(pruneInterval);
  }, []);

  const triggerAIPrompt = async () => {
    if (!activeCircle) return;
    setIsPromptLoading(true);
    try {
      const recent = posts[activeCircle.circle_id] || [];
      const prompt = await geminiService.getEngagementPrompt(activeCircle.circle_name, recent, activeCircle.members.map(m => m.name));
      setActivePrompt(prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleOnboardingComplete = async (profile: UserProfile) => {
    const userWithStatus: UserProfile = { 
      ...profile, 
      status: 'active', 
      user_id: Math.random().toString(),
      current_status: profile.current_status || 'online'
    };
    setUser(userWithStatus);
    setActiveTab('discover');
    startMatchingProcess(userWithStatus);
  };

  const handlePrayToggle = (postId: string, prayerText?: string) => {
    if (!activeCircle || !user) return;
    
    setPosts(prev => {
      const circleId = activeCircle.circle_id;
      const currentCirclePosts = prev[circleId] || [];
      
      const updatedPosts = currentCirclePosts.map(post => {
        if (post.post_id === postId) {
          const isPraying = post.praying_now?.some(p => p.user_id === user.user_id);
          let newPrayingNow = post.praying_now || [];
          
          if (isPraying) {
            // Stop praying
            newPrayingNow = newPrayingNow.filter(p => p.user_id !== user.user_id);
          } else {
            // Start praying
            newPrayingNow = [...newPrayingNow, {
              user_id: user.user_id,
              name: user.name,
              prayer_text: prayerText,
              started_at: new Date().toISOString()
            }];
          }
          
          return { ...post, praying_now: newPrayingNow };
        }
        return post;
      });
      
      return { ...prev, [circleId]: updatedPosts };
    });
  };

  const handleMarkAnswered = (postId: string) => {
    if (!activeCircle) return;
    setPosts(prev => {
      const circleId = activeCircle.circle_id;
      const updated = (prev[circleId] || []).map(p => 
        p.post_id === postId ? { ...p, is_answered_prayer: true, answered_at: new Date().toISOString() } : p
      );
      return { ...prev, [circleId]: updated };
    });
  };

  const startMatchingProcess = async (profile: UserProfile) => {
    setMatchingLoading(true);
    setMatchingResults([]);
    try {
      const results = await geminiService.getMatchingRecommendations(profile, MOCK_CANDIDATES);
      setTimeout(() => {
        setMatchingResults(results);
        setMatchingLoading(false);
      }, 3500);
    } catch (e) {
      console.error(e);
      setMatchingLoading(false);
    }
  };

  const handleAiSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsAiSearching(true);
    try {
      const results = await geminiService.searchCommunity(searchTerm, {
        people: MOCK_CANDIDATES,
        circles: PUBLIC_CIRCLES,
        themes: SPIRITUAL_THEMES
      });
      setAiSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiSearching(false);
    }
  };

  const createAiPartnerCircle = () => {
    const existing = circles.find(c => c.circle_type === 'ai_companion');
    if (existing) {
      setActiveCircle(existing);
      setActiveTab('feed');
      return;
    }

    const aiMember: CircleMember = { 
      user_id: 'siilah_ai', 
      name: 'Siilah', 
      joined_at: new Date().toISOString(), 
      posts_count: 0, 
      responses_count: 999,
      status: 'online'
    };
    const userMember: CircleMember = { 
      user_id: user!.user_id, 
      name: user!.name, 
      joined_at: new Date().toISOString(), 
      posts_count: 0, 
      responses_count: 0,
      status: user!.current_status
    };

    const newCircle: Circle = {
      circle_id: 'ai_sanctuary',
      circle_name: 'Sacred Sanctuary',
      circle_type: 'ai_companion',
      activity_level: 'daily',
      member_count: 2,
      members: [userMember, aiMember],
      unread_count: 0,
      last_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      health_score: 1.0
    };

    setCircles([newCircle, ...circles]);
    setActiveCircle(newCircle);
    setPosts({ ...posts, [newCircle.circle_id]: [] });
    setActiveTab('feed');
  };

  const createCircleFromMatch = (match: MatchRecommendation) => {
    const circleMembers: CircleMember[] = [
      { user_id: user!.user_id, name: user!.name, joined_at: new Date().toISOString(), posts_count: 0, responses_count: 0, status: user!.current_status }, 
      ...match.candidateNames.map(name => ({ user_id: Math.random().toString(), name, joined_at: new Date().toISOString(), posts_count: 0, responses_count: 0, status: (['online', 'away', 'offline'] as UserStatus[])[Math.floor(Math.random() * 3)] }))
    ];
    
    const newCircle: Circle = {
      circle_id: Math.random().toString(36).substr(2, 9),
      circle_name: `${match.groupType} Triad`,
      circle_type: 'triad',
      activity_level: user!.activity_preference,
      member_count: circleMembers.length,
      members: circleMembers,
      unread_count: 0,
      last_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      health_score: 1.0
    };
    setCircles([...circles, newCircle]);
    setActiveCircle(newCircle);
    setPosts({ ...posts, [newCircle.circle_id]: [] });
    setMatchingResults([]);
    setActiveTab('feed');
  };

  const handlePostSubmit = async () => {
    if (!activeCircle || !user || (!postContent.trim() && !pendingVoiceNote)) return;

    let submittedPost: Post;
    const finalPostType = feedMode === 'chat' ? 'chat_message' : selectedPostType;

    if (editingPostId) {
      const circlePosts = [...(posts[activeCircle.circle_id] || [])];
      const postIndex = circlePosts.findIndex(p => p.post_id === editingPostId);
      
      if (postIndex !== -1) {
        circlePosts[postIndex] = {
          ...circlePosts[postIndex],
          content_text: postContent,
          post_type: finalPostType,
          is_edited: true,
          voice_note_url: pendingVoiceNote || circlePosts[postIndex].voice_note_url,
          last_edited_at: new Date().toISOString()
        };
        submittedPost = circlePosts[postIndex];
        setPosts({ ...posts, [activeCircle.circle_id]: circlePosts });
      }
      setEditingPostId(null);
    } else {
      const newPost: Post = {
        post_id: Math.random().toString(36).substr(2, 9),
        circle_id: activeCircle.circle_id,
        user: { user_id: user.user_id, name: user.name, photo_url: user.photo_url, status: user.current_status },
        content_text: postContent,
        post_type: finalPostType,
        created_at: new Date().toISOString(),
        visibility: user.privacy_settings.posts_visibility === 'public' ? 'public' : 'members',
        is_answered_prayer: false,
        reactions: {},
        response_count: 0,
        responses: [],
        praying_now: [],
        voice_note_url: pendingVoiceNote || undefined
      };
      
      submittedPost = newPost;
      const updatedCirclePosts = [newPost, ...(posts[activeCircle.circle_id] || [])];
      setPosts({ ...posts, [activeCircle.circle_id]: updatedCirclePosts });
    }

    setPostContent('');
    setPendingVoiceNote(null);
    adjustHeight(true);

    if (activeCircle.circle_type === 'ai_companion') {
      try {
        const aiResponseText = await geminiService.getAiPartnerResponse(user, submittedPost);
        
        if (feedMode === 'chat') {
          const aiChatMsg: Post = {
            post_id: Math.random().toString(36).substr(2, 9),
            circle_id: activeCircle.circle_id,
            user: { user_id: 'siilah_ai', name: 'Siilah', photo_url: 'siilah_logo', status: 'online' },
            content_text: aiResponseText,
            post_type: 'chat_message',
            created_at: new Date().toISOString(),
            visibility: 'members',
            is_answered_prayer: false,
            reactions: {},
            response_count: 0
          };
          
          setTimeout(() => {
            setPosts(prev => ({
              ...prev,
              [activeCircle.circle_id]: [aiChatMsg, ...(prev[activeCircle.circle_id] || [])]
            }));
          }, 1200);
        } else {
          const aiResponse: PostResponse = {
            response_id: Math.random().toString(36).substr(2, 9),
            user: { user_id: 'siilah_ai', name: 'Siilah', photo_url: 'siilah_logo' },
            content_text: aiResponseText,
            created_at: new Date().toISOString()
          };

          setTimeout(() => {
            setPosts(prev => {
              const currentPosts = prev[activeCircle.circle_id] || [];
              const updatedPosts = currentPosts.map(p => {
                if (p.post_id === submittedPost.post_id) {
                  return {
                    ...p,
                    response_count: (p.response_count || 0) + 1,
                    responses: [...(p.responses || []), aiResponse]
                  };
                }
                return p;
              });
              return { ...prev, [activeCircle.circle_id]: updatedPosts };
            });
          }, 1500);
        }
      } catch (e) {
        console.error("AI Response error", e);
      }
    }
  };

  const handleReplySubmit = (postId: string, content: string, voiceNoteUrl?: string) => {
    if (!activeCircle) return;
    
    const reply: PostResponse = {
      response_id: Math.random().toString(36).substr(2, 9),
      user: { user_id: user!.user_id, name: user!.name, photo_url: user!.photo_url },
      content_text: content,
      voice_note_url: voiceNoteUrl,
      created_at: new Date().toISOString()
    };

    setPosts(prev => {
      const currentPosts = prev[activeCircle.circle_id] || [];
      const updatedPosts = currentPosts.map(p => {
        if (p.post_id === postId) {
          return {
            ...p,
            response_count: (p.response_count || 0) + 1,
            responses: [...(p.responses || []), reply]
          };
        }
        return p;
      });
      return { ...prev, [activeCircle.circle_id]: updatedPosts };
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-siilah-sage';
      case 'away': return 'bg-siilah-gold';
      default: return 'bg-gray-300';
    }
  };

  if (!user) return <div className="app-container"><Onboarding onComplete={handleOnboardingComplete} /></div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return activeCircle ? (
          <div className="flex-1 flex flex-col min-h-0 bg-siilah-beige">
            {/* Circle Header with Sub-Tabs */}
            <div className="px-6 py-4 bg-white/40 backdrop-blur-xl border-b border-gray-100/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-2xl bg-siilah-sage/10 flex items-center justify-center text-siilah-sage">
                     {activeCircle.circle_type === 'ai_companion' ? <Stars size={20} /> : <Users size={20} />}
                   </div>
                   <div>
                     <h2 className="font-serif text-lg font-bold text-siilah-slate italic">{activeCircle.circle_name}</h2>
                     <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{activeCircle.member_count} Members Joined</p>
                   </div>
                </div>
                <button onClick={() => setActiveCircle(null)} className="text-gray-200 hover:text-siilah-clay p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button 
                  onClick={() => setFeedMode('reflections')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${feedMode === 'reflections' ? 'bg-white text-siilah-sage shadow-sm' : 'text-gray-300 hover:text-siilah-slate'}`}
                >
                  Reflections
                </button>
                <button 
                  onClick={() => setFeedMode('chat')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${feedMode === 'chat' ? 'bg-white text-siilah-sage shadow-sm' : 'text-gray-300 hover:text-siilah-slate'}`}
                >
                  Circle Chat
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-48">
              {feedMode === 'reflections' ? (
                <div className="space-y-8">
                  {activePrompt && (
                    <EngagementPromptCard 
                      prompt={activePrompt} 
                      onDismiss={() => setActivePrompt(null)} 
                      onAction={() => { textareaRef.current?.focus(); setActivePrompt(null); }} 
                    />
                  )}
                  
                  {/* Active Circle Members Scroll */}
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
                    {activeCircle.members.map(member => (
                      <div key={member.user_id} className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative group cursor-pointer">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden group-hover:border-siilah-sage transition-all">
                             <img src={`https://picsum.photos/seed/${member.user_id}/100/100`} className="w-full h-full object-cover" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-siilah-beige ${getStatusColor(member.status)} shadow-sm`}></div>
                        </div>
                        <span className="text-[9px] font-bold text-siilah-slate uppercase tracking-tighter truncate w-14 text-center">{member.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    {(posts[activeCircle.circle_id] || [])
                      .filter(p => p.post_type !== 'chat_message')
                      .map(post => (
                        <PostCard 
                          key={post.post_id}
                          post={post}
                          userId={user.user_id}
                          userName={user.name}
                          isOwner={post.user.user_id === user.user_id}
                          onReact={() => {}} 
                          onPrayToggle={(text) => handlePrayToggle(post.post_id, text)}
                          onReply={(content, voiceNote) => handleReplySubmit(post.post_id, content, voiceNote)}
                          onMarkAnswered={() => handleMarkAnswered(post.post_id)}
                          onEdit={(pid) => { setEditingPostId(pid); setPostContent(post.content_text); }}
                        />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col-reverse space-y-4 space-y-reverse min-h-full">
                  <div ref={chatEndRef} />
                  {(posts[activeCircle.circle_id] || [])
                    .filter(p => p.post_type === 'chat_message')
                    .map(msg => {
                      const isMe = msg.user.user_id === user.user_id;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.post_id} 
                          className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                        >
                          {!isMe && (
                             <div className="relative shrink-0">
                               <img src={`https://picsum.photos/seed/${msg.user.user_id}/100/100`} className="w-7 h-7 rounded-lg object-cover" />
                               <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-siilah-beige ${getStatusColor(msg.user.status)} shadow-sm`}></div>
                             </div>
                          )}
                          <div className={`p-4 rounded-2xl text-xs leading-relaxed font-medium ${isMe ? 'bg-siilah-sage text-white rounded-br-none shadow-lg shadow-siilah-sage/10' : 'bg-white text-siilah-slate rounded-bl-none shadow-sm border border-gray-100'}`}>
                             {!isMe && <p className="text-[8px] font-bold uppercase tracking-widest text-siilah-sage mb-1">{msg.user.name}</p>}
                             <p className="font-serif italic">{msg.content_text}</p>
                             {msg.voice_note_url && (
                               <div className="mt-2 min-w-[120px]">
                                 <MiniAudioPlayer url={msg.voice_note_url} compact />
                               </div>
                             )}
                          </div>
                        </motion.div>
                      );
                  })}
                </div>
              )}
            </div>

            <div className="absolute bottom-[84px] left-0 right-0 px-4 z-40 pb-[env(safe-area-inset-bottom)]">
               <AnimatePresence>
                 {pendingVoiceNote && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="mb-3 px-4 py-2 bg-siilah-deep text-white rounded-[1.5rem] shadow-xl flex items-center justify-between border border-siilah-gold/20"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-siilah-gold flex items-center justify-center">
                         <Mic size={14} className="text-siilah-deep" />
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest">Voice Note Attached</span>
                     </div>
                     <button onClick={() => setPendingVoiceNote(null)} className="text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>

               <AnimatePresence>
                {isVoiceRecording && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mb-4"
                  >
                    <VoiceRecorder 
                      onRecordingComplete={(url) => { setPendingVoiceNote(url); setIsVoiceRecording(false); }} 
                      onCancel={() => setIsVoiceRecording(false)} 
                    />
                  </motion.div>
                )}
               </AnimatePresence>

               <div className="bg-white/95 backdrop-blur-3xl border border-gray-100 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] p-2">
                 <div className="flex items-end gap-2">
                   {feedMode === 'reflections' ? (
                     <button 
                      onClick={() => setShowTypeSelector(!showTypeSelector)}
                      className={`shrink-0 w-11 h-11 rounded-full ${POST_TYPES.find(p => p.type === selectedPostType)?.bg} text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform`}
                     >
                       <i className={`fa-solid ${POST_TYPES.find(p => p.type === selectedPostType)?.icon} text-sm`}></i>
                     </button>
                   ) : (
                     <div className="shrink-0 w-11 h-11 rounded-full bg-siilah-sage/10 text-siilah-sage flex items-center justify-center">
                        <MessageSquare size={18} />
                     </div>
                   )}
                   
                   <div className="flex-1">
                     <textarea
                       ref={textareaRef}
                       className="w-full bg-transparent border-none resize-none py-3 px-2 text-sm font-serif italic text-siilah-slate focus:ring-0 placeholder:text-gray-300 min-h-[44px]"
                       placeholder={feedMode === 'chat' ? 'Type a chat message...' : POST_TYPES.find(p => p.type === selectedPostType)?.placeholder}
                       value={postContent}
                       onChange={(e) => { setPostContent(e.target.value); adjustHeight(); }}
                       rows={1}
                     />
                   </div>

                   <div className="flex items-center gap-1 pr-1 pb-1">
                     <button 
                      onClick={() => setIsVoiceRecording(!isVoiceRecording)}
                      className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all ${isVoiceRecording ? 'bg-siilah-clay text-white shadow-lg' : 'text-gray-300 hover:text-siilah-sage hover:bg-gray-50'}`}
                     >
                       <Mic size={18} />
                     </button>
                     <button 
                      disabled={!postContent.trim() && !pendingVoiceNote}
                      onClick={handlePostSubmit}
                      className="shrink-0 w-11 h-11 rounded-full bg-siilah-sage text-white flex items-center justify-center shadow-lg disabled:opacity-20 active:scale-90 transition-all"
                     >
                       <Send size={18} />
                     </button>
                   </div>
                 </div>
               </div>

               <AnimatePresence>
                {showTypeSelector && feedMode === 'reflections' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute bottom-full left-0 right-0 mb-4 bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-2 grid grid-cols-5 gap-1 border border-gray-50 mx-4"
                  >
                    {POST_TYPES.map(type => (
                      <button 
                        key={type.type}
                        onClick={() => { setSelectedPostType(type.type); setShowTypeSelector(false); }}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${selectedPostType === type.type ? 'bg-siilah-sage/10 text-siilah-sage' : 'text-gray-300'}`}
                      >
                        <div className={`w-9 h-9 rounded-full ${type.bg} text-white flex items-center justify-center shadow-md`}>
                          <i className={`fa-solid ${type.icon} text-xs`}></i>
                        </div>
                        <span className="text-[7px] font-bold uppercase tracking-widest">{type.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
               </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
            <Leaf className="text-siilah-sage/30" size={64} />
            <h2 className="font-serif text-2xl font-bold text-siilah-slate italic">Find Your Sanctuary</h2>
            <p className="text-xs text-siilah-slate/40 italic px-8">Select or discover a circle to begin building sacred connections.</p>
            <Button onClick={() => setActiveTab('discover')} className="rounded-full px-8 h-14">Discover Potential Triads</Button>
          </div>
        );

      case 'circles':
        return (
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 no-scrollbar">
             <div className="space-y-1 mb-6">
               <h2 className="font-serif text-3xl font-bold text-siilah-slate italic">Community</h2>
               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Your Sacred Circles</p>
             </div>
             <div className="grid gap-4">
               {circles.map(c => (
                 <button 
                  key={c.circle_id} 
                  onClick={() => { setActiveCircle(c); setActiveTab('feed'); }}
                  className={`w-full p-5 bg-white rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-4 text-left active:scale-[0.97] transition-all ${c.circle_type === 'ai_companion' ? 'border-siilah-sage/20 bg-siilah-sage/[0.02]' : ''}`}
                 >
                   {/* Fix: Corrected broken template literal and JSX nesting */}
                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-50">
                     {c.circle_type === 'ai_companion' ? <Stars size={22} /> : <Users size={22} />}
                   </div>
                   <div className="flex-1">
                     <p className="font-bold text-siilah-slate text-sm">{c.circle_name}</p>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mt-0.5">
                       {c.circle_type === 'ai_companion' ? 'Sacred Partner' : `${c.activity_level} Rhythm`}
                     </p>
                   </div>
                   <ChevronRight size={18} className="text-gray-200" />
                 </button>
               ))}
             </div>
          </div>
        );

      case 'discover': {
        const filteredPeople = MOCK_CANDIDATES.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.faith_stage.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const filteredCircles = PUBLIC_CIRCLES.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          c.theme.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const filteredThemes = SPIRITUAL_THEMES.filter(t => 
          t.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const isSearching = searchTerm.length > 0;

        return (
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 no-scrollbar bg-siilah-beige">
            <div className="sticky top-0 z-30 pt-2 pb-6 bg-siilah-beige/80 backdrop-blur-xl">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search size={16} className={`${isSearching ? 'text-siilah-sage' : 'text-gray-300'} transition-colors`} />
                </div>
                <input 
                  type="text"
                  placeholder="Search themes, people, or triads..."
                  className="w-full h-14 bg-white/70 backdrop-blur-md rounded-[2rem] border border-gray-100 pl-12 pr-12 text-sm font-medium focus:ring-2 ring-siilah-sage/10 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setAiSearchResults(null); }}
                />
                {isSearching && (
                  <button 
                    onClick={() => { setSearchTerm(''); setAiSearchResults(null); }}
                    className="absolute inset-y-0 right-5 flex items-center text-gray-300 hover:text-siilah-clay"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isSearching ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-1">
                    <h2 className="font-serif text-3xl font-bold text-siilah-slate italic">Sacred Matching</h2>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Find your triad</p>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-siilah-deep p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-siilah-gold/20"
                  >
                    <div className="absolute -right-8 -top-8 w-40 h-40 bg-siilah-gold/10 rounded-full blur-3xl group-hover:bg-siilah-gold/20 transition-all duration-700"></div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-siilah-gold/10 border border-siilah-gold/20 rounded-2xl flex items-center justify-center text-siilah-gold">
                          <Stars size={24} className="animate-soft-pulse" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-bold italic text-siilah-gold">Sacred Companion</h3>
                          <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-50">Partner with Siilah</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/70 italic leading-relaxed">
                        Can't wait for a triad? Create a "Sacred Sanctuary" now. Receive private intercession and wise spiritual partnership directly from Siilah.
                      </p>
                      <Button 
                        fullWidth 
                        className="bg-siilah-gold hover:bg-siilah-gold/90 text-siilah-deep font-bold rounded-2xl h-14"
                        onClick={createAiPartnerCircle}
                      >
                        Create Sanctuary
                      </Button>
                    </div>
                  </motion.div>
                  
                  {matchingLoading ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="w-16 h-16 bg-siilah-sage/10 rounded-full mx-auto flex items-center justify-center animate-pulse">
                        <Sparkles size={32} className="text-siilah-sage" />
                      </div>
                      <p className="text-sm text-siilah-slate/60 italic">Aligning frequencies...</p>
                    </div>
                  ) : matchingResults.length > 0 ? (
                    <div className="space-y-6">
                      {matchingResults.map((match, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                          className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-xl shadow-siilah-sage/5 space-y-5"
                        >
                          <div className="flex justify-center -space-x-3">
                            {match.candidateNames.map((name, idx) => (
                              <div key={idx} className="w-12 h-12 rounded-xl border-2 border-white bg-siilah-beige flex items-center justify-center font-bold text-siilah-sage text-xs shadow-sm uppercase">{name[0]}</div>
                            ))}
                          </div>
                          <div className="text-center space-y-1">
                            <span className="inline-block px-2.5 py-1 bg-siilah-gold/10 text-siilah-gold text-[7px] font-bold uppercase tracking-widest rounded-full">{match.overallScore}% Soul Sync</span>
                            <h3 className="font-serif text-lg font-bold text-siilah-slate italic">{match.groupType} Triad</h3>
                            <p className="text-[11px] text-siilah-slate/50 italic px-4 leading-relaxed line-clamp-2">"{match.reasoning}"</p>
                          </div>
                          <Button fullWidth className="h-12 rounded-2xl font-bold text-sm" onClick={() => createCircleFromMatch(match)}>Connect</Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-6">
                       <p className="text-xs text-siilah-slate/40 italic">Ready to explore more triads?</p>
                       <Button onClick={() => startMatchingProcess(user!)} className="rounded-full px-10 h-14">Discover Potential Triads</Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="space-y-10"
                >
                  <div className="p-6 bg-siilah-sage/[0.03] rounded-[2.5rem] border-2 border-dashed border-siilah-sage/20 text-center space-y-4">
                    <p className="text-xs text-siilah-slate/60 italic leading-relaxed px-4">
                      "{searchTerm}" is a unique search. Let Siilah seek deep spiritual connections for you.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      fullWidth 
                      className="rounded-2xl border-siilah-sage/40 h-12 text-[10px]"
                      onClick={handleAiSearch}
                      disabled={isAiSearching}
                    >
                      {isAiSearching ? 'Seeking...' : 'Seek Deep Meaning with Siilah'}
                    </Button>
                  </div>

                  {aiSearchResults && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 bg-white p-6 rounded-[2.5rem] border border-siilah-gold/10 shadow-lg">
                      <div className="flex items-center gap-2 text-siilah-gold">
                        <Stars size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Siilah's Insight</span>
                      </div>
                      <p className="text-xs text-siilah-slate italic leading-relaxed">{aiSearchResults.explanation}</p>
                      
                      <div className="space-y-4 pt-4 border-t border-gray-50">
                        {aiSearchResults.themeMatch?.map((t: string, i: number) => (
                          <div key={i} className="flex items-center justify-between group">
                            <span className="text-xs font-bold text-siilah-slate">{t}</span>
                            <ArrowRight size={14} className="text-gray-200 group-hover:text-siilah-sage group-hover:translate-x-1 transition-all" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {filteredThemes.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pl-2">Spiritual Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {filteredThemes.map(theme => (
                          <button key={theme} className="px-5 py-2.5 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-siilah-slate uppercase tracking-widest hover:border-siilah-sage hover:text-siilah-sage transition-all">
                            {theme}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredPeople.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pl-2">Soul Seekers</h3>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {filteredPeople.map(p => (
                          <div key={p.user_id} className="shrink-0 w-32 bg-white p-4 rounded-3xl border border-gray-100 text-center space-y-3 relative overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl mx-auto bg-siilah-beige flex items-center justify-center relative">
                              <User size={24} className="text-siilah-sage/40" />
                              <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(p.current_status)}`}></div>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-siilah-slate truncate">{p.name}</p>
                              <p className="text-[8px] text-gray-400 uppercase tracking-tighter truncate">{p.faith_stage}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredCircles.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest pl-2">Active Sanctuaries</h3>
                      <div className="grid gap-3">
                        {filteredCircles.map(c => (
                          <div key={c.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-siilah-sage/5 flex items-center justify-center text-siilah-sage">
                                <Users size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-siilah-slate">{c.name}</p>
                                <p className="text-[8px] text-gray-300 uppercase tracking-widest">{c.activity} Rhythm</p>
                              </div>
                            </div>
                            <Button size="sm" className="h-9 px-4 rounded-xl text-[8px] uppercase">Join</Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredPeople.length === 0 && filteredCircles.length === 0 && filteredThemes.length === 0 && !isAiSearching && (
                    <div className="py-20 text-center space-y-4">
                      <Command size={48} className="mx-auto text-gray-100" />
                      <p className="text-sm text-gray-300 italic">No direct matches found. Try searching for a broad spiritual theme.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }

      case 'profile':
        if (showSettings) {
          return (
            <ProfileSettings 
              profile={user} 
              onSave={(updated) => { setUser(updated); setShowSettings(false); }} 
              onCancel={() => setShowSettings(false)} 
            />
          );
        }
        return (
          <div className="flex-1 overflow-y-auto pb-32 no-scrollbar bg-siilah-beige">
             <div className="relative h-44 bg-siilah-slate/5 overflow-hidden">
                <button 
                  onClick={() => setShowSettings(true)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center text-siilah-slate shadow-sm z-10 hover:bg-white transition-colors"
                >
                  <Settings size={20} />
                </button>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-[2rem] border-4 border-siilah-beige bg-white shadow-xl overflow-hidden">
                        <img src={`https://picsum.photos/seed/${user.user_id}/200/200`} className="w-full h-full object-cover" />
                      </div>
                      <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-siilah-beige ${getStatusColor(user.current_status)} shadow-sm`}></div>
                   </div>
                </div>
             </div>
             <div className="pt-16 px-6 text-center space-y-6">
                <div className="space-y-0.5">
                  <h2 className="font-serif text-3xl font-bold text-siilah-slate italic">{user.name}</h2>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{user.christian_tradition}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   {[
                     { label: 'Prayers', value: 12, icon: Heart },
                     { label: 'Circles', value: circles.length, icon: Users },
                     { label: 'Growth', value: '42%', icon: TrendingUp }
                   ].map((stat, i) => (
                     <div key={i} className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm space-y-1">
                        <stat.icon size={16} className="mx-auto text-siilah-sage/40" />
                        <p className="text-xl font-bold text-siilah-slate">{stat.value}</p>
                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">{stat.label}</p>
                     </div>
                   ))}
                </div>

                <div className="space-y-3 pt-6 text-left">
                  <div className="p-5 bg-white rounded-[2rem] border border-gray-50 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest">Soul Privacy</p>
                       <Eye size={14} className="text-gray-200" />
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="px-3 py-1 bg-siilah-slate/5 rounded-lg border border-siilah-slate/10 text-[9px] font-bold text-siilah-slate uppercase">Profile: {user.privacy_settings.profile_visibility}</div>
                       <div className="px-3 py-1 bg-siilah-slate/5 rounded-lg border border-siilah-slate/10 text-[9px] font-bold text-siilah-slate uppercase">Posts: {user.privacy_settings.posts_visibility}</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowSettings(true)}
                    className="w-full h-16 bg-white rounded-[2.5rem] border border-gray-100 flex items-center justify-between px-6 active:scale-[0.98] transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-siilah-sage/5 flex items-center justify-center text-siilah-sage">
                        <User size={18} />
                      </div>
                      <span className="text-[11px] font-bold text-siilah-slate uppercase tracking-[0.2em]">Adjust Soul Profile</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-200" />
                  </button>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container flex flex-col font-sans">
      <header className="px-6 py-4 bg-white/60 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between z-50 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-siilah-sage flex items-center justify-center text-white shadow-md">
            <i className="fa-solid fa-leaf text-[10px]"></i>
          </div>
          <h1 className="font-serif text-lg font-bold text-siilah-slate italic">Siilah</h1>
        </div>
        <div className="flex items-center gap-2">
           {dailyEncouragement && (
             <div className="text-[9px] font-medium text-siilah-slate/40 italic hidden sm:block">"{dailyEncouragement}"</div>
           )}
           <button 
             onClick={() => setActiveTab('discover')}
             className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-siilah-slate/40 active:bg-gray-50"
           >
             <Search size={16} />
           </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {renderTabContent()}
      </main>

      <nav className="h-[calc(84px+env(safe-area-inset-bottom))] bg-white/80 backdrop-blur-3xl border-t border-gray-100 px-6 flex items-center justify-between z-50 pb-[env(safe-area-inset-bottom)] relative">
        {[
          { id: 'feed', label: 'Feed', icon: MessageCircle },
          { id: 'circles', label: 'Circles', icon: LayoutGrid },
          { id: 'discover', label: 'Discover', icon: Compass },
          { id: 'profile', label: 'Soul', icon: User }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setShowSettings(false); }}
              className={`flex flex-col items-center gap-1 transition-all relative ${isActive ? 'text-siilah-sage' : 'text-gray-300'} min-w-[60px]`}
            >
              <tab.icon size={22} className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[7px] font-bold uppercase tracking-widest transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="tab-underline"
                  className="absolute -top-4 w-1 h-1 rounded-full bg-siilah-sage"
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
