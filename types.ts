
// @ts-nocheck

export enum FaithStage {
  EXPLORING = 'exploring',
  NEW = 'new_believer',
  GROWING = 'growing',
  ESTABLISHED = 'established',
  DECONSTRUCTING = 'deconstructing'
}

export enum CircleSeason {
  SIX_WEEKS = '6-Week Journey',
  TWELVE_WEEKS = '12-Week Season',
  OPEN_ENDED = 'Open-Ended'
}

export type UserStatus = 'online' | 'away' | 'offline';
export type PrivacyLevel = 'public' | 'friends_only' | 'private';

/* Broadened to string to allow for the dynamic custom inputs requested */
export type LifeStage = string;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    timestamp: string;
    version: string;
  };
  errors: Array<{ code: string; message: string; field?: string }> | null;
}

export interface UserStats {
  circles_count: number;
  posts_count: number;
  prayers_offered: number;
}

export interface UserProfile {
  user_id: string;
  email: string;
  name: string;
  photo_url?: string;
  location?: {
    city: string;
    country?: string;
  };
  faith_stage: FaithStage;
  seeking_goals: string[];
  sharing_comfort: 'one_on_one' | 'small_group' | 'either';
  activity_preference: 'daily' | 'weekly' | 'biweekly';
  prayer_focus: string[];
  christian_tradition: string;
  life_stages: string[];
  timezone_preference: 'morning' | 'evening' | 'flexible';
  personality_indicators: string[];
  status: 'active' | 'inactive';
  current_status?: UserStatus;
  privacy_settings: {
    profile_visibility: PrivacyLevel;
    posts_visibility: PrivacyLevel;
  };
  notification_settings: {
    push_enabled: boolean;
    prayer_requests: boolean;
    circle_activity: boolean;
    messages: boolean;
  };
}

export type PostType = 'prayer_request' | 'testimony' | 'struggle' | 'gratitude' | 'question' | 'ai_prompt' | 'summary' | 'chat_message';

export interface Post {
  post_id: string;
  circle_id: string;
  user: {
    user_id: string;
    name: string;
    photo_url?: string;
    status?: UserStatus;
  };
  content_text: string;
  post_type: PostType;
  created_at: string;
  visibility: 'members' | 'public';
  is_answered_prayer: boolean;
  answered_at?: string;
  reactions: Record<string, string[]>;
  response_count: number;
  responses?: PostResponse[];
  tags?: string[];
  voice_note_url?: string;
  photo_urls?: string[];
  praying_now?: PrayingNow[];
  auto_summary?: string;
  summaryData?: CircleSummary;
  is_edited?: boolean;
  last_edited_at?: string;
  has_unread_responses?: boolean; // New visual cue
}

export interface PostResponse {
  response_id: string;
  user: {
    user_id: string;
    name: string;
    photo_url?: string;
  };
  content_text?: string;
  voice_note_url?: string;
  created_at: string;
  is_unread?: boolean; // New visual cue
}

export interface PrayingNow {
  user_id: string;
  name: string;
  prayer_text?: string;
  started_at: string;
}

export interface Circle {
  circle_id: string;
  circle_name: string;
  circle_type: 'triad' | 'one_on_one' | 'small_group' | 'ai_companion';
  activity_level: 'daily' | 'weekly' | 'biweekly';
  member_count: number;
  members: CircleMember[];
  unread_count: number;
  last_activity_at: string;
  created_at: string;
  health_score: number;
}

export interface CircleMember {
  user_id: string;
  name: string;
  joined_at: string;
  posts_count: number;
  responses_count: number;
  status?: UserStatus;
}

export interface EngagementPrompt {
  text: string;
  type: string;
  actionLabel: string;
  context: string;
}

export interface MatchRecommendation {
  candidateNames: string[];
  groupType: string;
  overallScore: number;
  pillars: {
    spiritualSync: number;
    rhythmMatch: number;
    vulnerabilityBalance: number;
  };
  reasoning: string;
  commonGround: string[];
}

export interface CircleSummary {
  summary_id: string;
  summary_type: string;
  period_start: string;
  period_end: string;
  highlights: {
    prayers_shared: number;
    responses: number;
    praying_now: number;
  };
  themes: { theme: string; count: number; sentiment: string }[];
  key_moment: string;
  next_prompt: string;
  celebration: string;
  generated_at: string;
}

export interface IndividualSummary {
  connectedCircles: string[];
  metrics: {
    shared: number;
    encouraged: number;
    prayed: number;
    streak: number;
  };
  personalThemes: string[];
  growthMoment: string;
}

export interface Notification {
  notification_id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  sourceName: string;
}
