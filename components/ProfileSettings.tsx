
import React, { useState } from 'react';
import { Button } from './Button';
import { UserProfile, FaithStage, UserStatus, PrivacyLevel } from '../types';

interface ProfileSettingsProps {
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  onCancel: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });

  const toggleArrayItem = (field: 'seeking_goals' | 'prayer_focus' | 'life_stages' | 'personality_indicators', item: string) => {
    const current = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item]
    });
  };

  const updatePrivacy = (key: keyof UserProfile['privacy_settings'], value: PrivacyLevel) => {
    setFormData({
      ...formData,
      privacy_settings: {
        ...formData.privacy_settings,
        [key]: value
      }
    });
  };

  const updateNotification = async (key: keyof UserProfile['notification_settings'], value: boolean) => {
    if (key === 'push_enabled' && value === true) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          alert("Please enable notification permissions in your browser settings to receive alerts.");
          return;
        }
      }
    }

    setFormData({
      ...formData,
      notification_settings: {
        ...formData.notification_settings,
        [key]: value
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-siilah-beige pb-48 animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-siilah-beige/80 backdrop-blur-md py-4 z-10 border-b border-gray-100">
        <button onClick={onCancel} className="text-siilah-slate hover:text-siilah-sage transition-colors p-2">
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        <h1 className="font-serif text-2xl font-bold text-siilah-slate italic">Your Soul Profile</h1>
        <div className="w-8"></div>
      </div>

      <div className="space-y-10">
        {/* Personal Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest border-b border-siilah-sage/10 pb-2">Personal</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-siilah-slate mb-2">Display Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 ring-siilah-sage/20 text-sm font-medium text-siilah-slate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-siilah-slate mb-2">Tradition</label>
              <input
                type="text"
                placeholder="e.g. Non-denominational, Catholic"
                className="w-full px-4 py-3 rounded-2xl border-none bg-white shadow-sm focus:ring-2 ring-siilah-sage/20 text-sm font-medium text-siilah-slate"
                value={formData.christian_tradition || ''}
                onChange={(e) => setFormData({ ...formData, christian_tradition: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* User Status */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest border-b border-siilah-sage/10 pb-2">Current Presence</h2>
          <div className="flex gap-2">
            {(['online', 'away', 'offline'] as UserStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setFormData({ ...formData, current_status: status })}
                className={`flex-1 p-3 rounded-xl border-2 transition-all text-[9px] font-bold uppercase tracking-widest ${
                  formData.current_status === status ? 'bg-siilah-sage border-siilah-sage text-white' : 'border-white bg-white text-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest border-b border-siilah-sage/10 pb-2">Privacy & Visibility</h2>
          <div className="space-y-6">
             <div>
               <label className="block text-xs font-bold text-siilah-slate mb-3">Profile Visibility</label>
               <div className="flex gap-2">
                 {(['public', 'friends_only', 'private'] as PrivacyLevel[]).map(level => (
                   <button
                     key={level}
                     onClick={() => updatePrivacy('profile_visibility', level)}
                     className={`flex-1 py-3 text-[9px] font-bold uppercase rounded-xl border-2 transition-all ${
                       formData.privacy_settings.profile_visibility === level ? 'bg-siilah-slate border-siilah-slate text-white' : 'border-white bg-white text-gray-300'
                     }`}
                   >
                     {level.replace('_', ' ')}
                   </button>
                 ))}
               </div>
             </div>
             <div>
               <label className="block text-xs font-bold text-siilah-slate mb-3">Post Default Visibility</label>
               <div className="flex gap-2">
                 {(['public', 'friends_only', 'private'] as PrivacyLevel[]).map(level => (
                   <button
                     key={level}
                     onClick={() => updatePrivacy('posts_visibility', level)}
                     className={`flex-1 py-3 text-[9px] font-bold uppercase rounded-xl border-2 transition-all ${
                       formData.privacy_settings.posts_visibility === level ? 'bg-siilah-slate border-siilah-slate text-white' : 'border-white bg-white text-gray-300'
                     }`}
                   >
                     {level.replace('_', ' ')}
                   </button>
                 ))}
               </div>
             </div>
          </div>
        </section>

        {/* Notification Section */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest border-b border-siilah-sage/10 pb-2">Notifications</h2>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 space-y-4">
             <button 
               onClick={() => updateNotification('push_enabled', !formData.notification_settings.push_enabled)}
               className="w-full flex items-center justify-between py-2 group"
             >
               <div>
                 <p className="text-xs font-bold text-siilah-slate uppercase tracking-widest">Push Notifications</p>
                 <p className="text-[10px] text-gray-300 italic">Toggle device push messages</p>
               </div>
               <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.notification_settings.push_enabled ? 'bg-siilah-sage' : 'bg-gray-200'}`}>
                 <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.notification_settings.push_enabled ? 'left-5.5' : 'left-0.5'}`} />
               </div>
             </button>
             <div className="pt-2 space-y-3">
                {[
                  { id: 'prayer_requests', label: 'New Prayer Requests' },
                  { id: 'circle_activity', label: 'Circle Milestones' },
                  { id: 'messages', label: 'Soul Responses' }
                ].map(pref => (
                  <div key={pref.id} className="flex items-center justify-between">
                     <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{pref.label}</span>
                     <button 
                       onClick={() => updateNotification(pref.id as any, !formData.notification_settings[pref.id as keyof UserProfile['notification_settings']])}
                       className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                         formData.notification_settings[pref.id as keyof UserProfile['notification_settings']] ? 'border-siilah-sage bg-siilah-sage text-white' : 'border-gray-200 bg-white'
                       }`}
                     >
                       {formData.notification_settings[pref.id as keyof UserProfile['notification_settings']] && <i className="fa-solid fa-check text-[8px]"></i>}
                     </button>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Faith Journey */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest border-b border-siilah-sage/10 pb-2">Faith Journey</h2>
          <div className="space-y-2">
            {Object.values(FaithStage).map((stage) => (
              <button
                key={stage}
                onClick={() => setFormData({ ...formData, faith_stage: stage })}
                className={`w-full p-4 text-left rounded-2xl border-2 transition-all flex justify-between items-center ${
                  formData.faith_stage === stage
                    ? 'border-siilah-sage bg-siilah-sage/5 ring-1 ring-siilah-sage/20 shadow-sm'
                    : 'border-white bg-white hover:border-siilah-sage/30'
                }`}
              >
                <span className="text-sm font-bold text-siilah-slate">{stage.replace('_', ' ')}</span>
                {formData.faith_stage === stage && <i className="fa-solid fa-check text-siilah-sage"></i>}
              </button>
            ))}
          </div>
        </section>

        {/* Personality Indicators */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-siilah-sage uppercase tracking-widest border-b border-siilah-sage/10 pb-2">Presence Style</h2>
          <div className="grid grid-cols-2 gap-2">
            {['Deep Thinker', 'Encourager', 'Quiet Listener', 'Truth Speaker', 'Prayer Warrior', 'Caregiver'].map((item) => (
              <button
                key={item}
                onClick={() => toggleArrayItem('personality_indicators', item)}
                className={`p-3 text-center rounded-xl border-2 transition-all ${
                  formData.personality_indicators?.includes(item)
                    ? 'border-siilah-sage bg-siilah-sage/5 text-siilah-sage font-bold'
                    : 'border-white bg-white text-gray-400 font-medium'
                } text-[10px] uppercase tracking-wider`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-siilah-beige/90 backdrop-blur-md border-t border-gray-100 flex gap-4 max-w-[430px] mx-auto z-20">
        <Button variant="ghost" fullWidth onClick={onCancel}>Cancel</Button>
        <Button fullWidth className="shadow-xl shadow-siilah-olive/20" onClick={() => onSave(formData)}>Save Changes</Button>
      </div>
    </div>
  );
};
