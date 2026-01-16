
import React, { useState } from 'react';
import { Button } from './Button';
import { FaithStage, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [otherInput, setOtherInput] = useState('');
  const [isOtherActive, setIsOtherActive] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    faith_stage: FaithStage.EXPLORING,
    seeking_goals: [],
    sharing_comfort: 'either',
    activity_preference: 'weekly',
    prayer_focus: [],
    christian_tradition: '',
    life_stages: [],
    timezone_preference: 'flexible',
    personality_indicators: [],
    location: { city: '', country: '' },
    current_status: 'online',
    privacy_settings: {
      profile_visibility: 'public',
      // Fix: changed 'members' to 'friends_only' to align with PrivacyLevel type definition
      posts_visibility: 'friends_only'
    },
    notification_settings: {
      push_enabled: false,
      prayer_requests: true,
      circle_activity: true,
      messages: true
    }
  });

  const nextStep = () => {
    setStep(s => s + 1);
    setIsOtherActive(false);
    setOtherInput('');
  };
  const prevStep = () => {
    setStep(s => s - 1);
    setIsOtherActive(false);
    setOtherInput('');
  };

  const toggleArrayItem = (field: any, item: string, max?: number) => {
    const current = (formData[field] as string[]) || [];
    if (!current.includes(item) && max && current.length >= max) return;
    
    setFormData({
      ...formData,
      [field]: current.includes(item) 
        ? current.filter(i => i !== item) 
        : [...current, item]
    });
  };

  const addCustomItem = (field: any) => {
    if (!otherInput.trim()) {
      setIsOtherActive(false);
      return;
    }
    const current = (formData[field] as string[]) || [];
    if (!current.includes(otherInput.trim())) {
      setFormData({
        ...formData,
        [field]: [...current, otherInput.trim()]
      });
    }
    setOtherInput('');
    setIsOtherActive(false);
  };

  const totalSteps = 11;

  const renderWhisper = (text: string) => (
    <p className="text-sm text-gray-400 font-medium mb-6 flex items-start gap-2 animate-in fade-in duration-700">
      <i className="fa-solid fa-leaf text-[10px] mt-1 text-siilah-sage/60"></i>
      <span className="italic">{text}</span>
    </p>
  );

  const OtherInputArea = ({ field, placeholder }: { field: string, placeholder: string }) => (
    <div className="mt-6 animate-in zoom-in duration-300">
      {!isOtherActive ? (
        <button 
          onClick={() => setIsOtherActive(true)}
          className="group flex items-center gap-3 px-6 py-5 border-2 border-dashed border-siilah-sage/20 rounded-[2.5rem] hover:bg-siilah-sage/5 hover:border-siilah-sage transition-all w-full text-left"
        >
          <div className="w-8 h-8 rounded-full bg-siilah-beige flex items-center justify-center text-siilah-sage group-hover:bg-siilah-sage group-hover:text-white transition-colors">
            <i className="fa-solid fa-plus text-xs"></i>
          </div>
          <span className="text-[10px] font-bold text-siilah-sage uppercase tracking-[0.2em]">Add something specific...</span>
        </button>
      ) : (
        <div className="flex gap-2">
          <input 
            autoFocus
            type="text" 
            placeholder={placeholder} 
            className="flex-1 bg-white border-2 border-siilah-sage rounded-[2rem] px-6 py-4 text-xs font-medium focus:ring-0 transition-all shadow-lg"
            value={otherInput}
            onChange={(e) => setOtherInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem(field)}
          />
          <button 
            onClick={() => addCustomItem(field)}
            className="w-14 h-14 bg-siilah-sage text-white rounded-[2rem] flex items-center justify-center shadow-xl active:scale-90 transition-all"
          >
            <i className="fa-solid fa-check"></i>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-siilah-beige relative font-sans selection:bg-siilah-sage/20 overflow-hidden">
      {/* Progress Header - Fixed at top */}
      {step > 0 && step <= totalSteps && (
        <div className="shrink-0 p-6 pt-8 bg-siilah-beige/80 backdrop-blur-sm z-20">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              STAGE <span className="text-siilah-sage font-bold">{step}</span> / {totalSteps}
            </span>
            <button onClick={prevStep} className="text-gray-400 hover:text-siilah-slate transition-colors p-2 flex items-center gap-2 group">
              <i className="fa-solid fa-arrow-left text-[10px] transition-transform group-hover:-translate-x-1"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest">Previous</span>
            </button>
          </div>
          <div className="flex gap-2 h-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 rounded-full transition-all duration-700 ${
                  i < step ? 'bg-siilah-sage' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24">
        <div className={`min-h-full flex flex-col ${step === 0 ? 'justify-center py-12' : 'justify-start pt-4'}`}>
          {step === 0 && (
            <div className="text-center animate-in fade-in duration-1000 space-y-12">
              <div className="w-28 h-28 bg-siilah-sage rounded-[2.8rem] mx-auto flex items-center justify-center text-white text-4xl shadow-2xl animate-float">
                 <i className="fa-solid fa-hands-praying"></i>
              </div>
              <div className="space-y-4">
                <h1 className="font-serif text-7xl font-bold text-siilah-slate italic tracking-tight">Siilah</h1>
                <p className="text-siilah-slate italic opacity-60 px-8 leading-relaxed text-lg">"Authentic spiritual connection begins with a single shared heart."</p>
              </div>
              <div className="pt-8">
                <Button fullWidth size="lg" className="rounded-[2.5rem] h-20 text-xl font-bold shadow-2xl bg-siilah-sage hover:bg-siilah-olive text-white" onClick={nextStep}>
                  Begin My Journey
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">What's your name?</h2>
              {renderWhisper("A community is built on being known by name.")}
              <div className="relative group">
                <input 
                  type="text" 
                  autoFocus 
                  className="w-full bg-transparent border-b-2 border-gray-200 py-6 text-4xl font-serif italic outline-none focus:border-siilah-sage transition-all placeholder:text-gray-100" 
                  placeholder="Type here..." 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  onKeyDown={(e) => e.key === 'Enter' && formData.name && nextStep()} 
                />
              </div>
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 text-lg font-bold shadow-xl" onClick={nextStep} disabled={!formData.name}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-[1.15]">Your faith stage?</h2>
              {renderWhisper("Honesty here creates the most compatible circles.")}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: FaithStage.EXPLORING, label: 'EXPLORING' },
                  { id: 'seeker', label: 'SEEKER / CURIOUS' },
                  { id: FaithStage.NEW, label: 'NEW BELIEVER' },
                  { id: FaithStage.GROWING, label: 'GROWING' },
                  { id: FaithStage.ESTABLISHED, label: 'ESTABLISHED' },
                  { id: FaithStage.DECONSTRUCTING, label: 'DECONSTRUCTING' },
                  { id: 'reconnecting', label: 'RE-CONNECTING' }
                ].map((stage) => {
                  const isActive = formData.faith_stage === stage.id as any;
                  return (
                    <button 
                      key={stage.id} 
                      onClick={() => setFormData({ ...formData, faith_stage: stage.id as any })} 
                      className={`group w-full p-6 text-left rounded-[2rem] border-2 transition-all flex items-center justify-between active:scale-[0.98] ${
                        isActive 
                        ? 'border-siilah-sage bg-siilah-sage/5 shadow-md -translate-y-1' 
                        : 'border-white bg-white hover:border-gray-100'
                      }`}
                    >
                      <p className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${isActive ? 'text-siilah-slate' : 'text-siilah-slate/60'}`}>
                        {stage.label}
                      </p>
                      {isActive && <i className="fa-solid fa-check text-siilah-sage text-sm animate-in zoom-in"></i>}
                    </button>
                  );
                })}
              </div>
              <div className="pt-4">
                <Button fullWidth size="lg" className="rounded-[2rem] h-20 text-xl font-bold bg-siilah-sage hover:bg-siilah-olive text-white shadow-xl" onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">What are you seeking?</h2>
              {renderWhisper("Siilah matches people based on spiritual intent.")}
              <div className="flex flex-wrap gap-2.5">
                {[
                  'Deep accountability', 'Encouragement', 'Prayer support', 
                  'Spiritual friendship', 'Growing in prayer', 'Theology', 
                  'Vulnerability', 'Mentorship', 'Healing', 'Scripture depth', 
                  'Silence/Solitude', 'Liturgy', 'Social Justice', 'Creative Worship'
                ].concat((formData.seeking_goals || []).filter(g => ![
                  'Deep accountability', 'Encouragement', 'Prayer support', 
                  'Spiritual friendship', 'Growing in prayer', 'Theology', 
                  'Vulnerability', 'Mentorship', 'Healing', 'Scripture depth', 
                  'Silence/Solitude', 'Liturgy', 'Social Justice', 'Creative Worship'
                ].includes(g)))
                .map((goal) => {
                  const isSelected = formData.seeking_goals?.includes(goal);
                  return (
                    <button
                      key={goal}
                      onClick={() => toggleArrayItem('seeking_goals', goal)}
                      className={`px-5 py-3 rounded-full border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        isSelected 
                        ? 'bg-siilah-gold border-siilah-gold text-white shadow-lg -translate-y-1' 
                        : 'bg-white border-transparent text-gray-400 hover:border-siilah-sage/20'
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
              <OtherInputArea field="seeking_goals" placeholder="What else is your soul seeking?" />
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 text-lg font-bold shadow-xl" onClick={nextStep} disabled={formData.seeking_goals!.length === 0}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">Your current season?</h2>
              {renderWhisper("Shared seasons foster deep understanding.")}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Career focus', icon: 'fa-briefcase' },
                  { id: 'Starting a Business', icon: 'fa-rocket' },
                  { id: 'Parenting', icon: 'fa-baby-carriage' },
                  { id: 'Expectant Parent', icon: 'fa-person-pregnant' },
                  { id: 'Empty Nesting', icon: 'fa-dove' },
                  { id: 'Caring for Elderly', icon: 'fa-hands-holding' },
                  { id: 'Student life', icon: 'fa-graduation-cap' },
                  { id: 'New Marriage', icon: 'fa-ring' },
                  { id: 'Singleness', icon: 'fa-user' },
                  { id: 'Transition', icon: 'fa-shuffle' },
                  { id: 'Grief/loss', icon: 'fa-cloud-rain' },
                  { id: 'Health challenges', icon: 'fa-heart-pulse' },
                  { id: 'Financial struggle', icon: 'fa-coins' },
                  { id: 'Digital Nomad', icon: 'fa-laptop' },
                  { id: 'Military Life', icon: 'fa-shield-halved' },
                  { id: 'Waiting Season', icon: 'fa-hourglass' },
                  { id: 'Relocation', icon: 'fa-map-location-dot' },
                  { id: 'Retirement', icon: 'fa-sun-plant-wilt' }
                ].map((item) => {
                  const isSelected = formData.life_stages?.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleArrayItem('life_stages', item.id)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border-2 transition-all ${
                        isSelected 
                        ? 'border-siilah-clay bg-siilah-clay/5 text-siilah-slate shadow-inner' 
                        : 'border-white bg-white text-gray-300 hover:border-gray-50'
                      }`}
                    >
                      <i className={`fa-solid ${item.icon} text-xl ${isSelected ? 'text-siilah-clay' : 'opacity-40'}`}></i>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-center">{item.id}</span>
                    </button>
                  );
                })}
              </div>
              <OtherInputArea field="life_stages" placeholder="Describe your current season..." />
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 font-bold shadow-xl" onClick={nextStep} disabled={formData.life_stages!.length === 0}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">Prayer focus?</h2>
              {renderWhisper("Select up to 3 areas currently on your heart.")}
              <div className="space-y-2.5">
                {[
                  'Personal growth', 'Family roots', 'Marriage/Relationship', 'Career/Purpose', 'Health/Healing', 
                  'Anxiety/Rest', 'Gratitude', 'Biblical wisdom', 'Service',
                  'Global issues', 'Stewardship', 'Mental clarity', 'Inner Peace', 'Addiction/Recovery'
                ].concat((formData.prayer_focus || []).filter(p => ![
                  'Personal growth', 'Family roots', 'Marriage/Relationship', 'Career/Purpose', 'Health/Healing', 
                  'Anxiety/Rest', 'Gratitude', 'Biblical wisdom', 'Service',
                  'Global issues', 'Stewardship', 'Mental clarity', 'Inner Peace', 'Addiction/Recovery'
                ].includes(p)))
                .map((item) => {
                  const isSelected = formData.prayer_focus?.includes(item);
                  const count = formData.prayer_focus?.indexOf(item) ?? -1;
                  return (
                    <button
                      key={item}
                      onClick={() => toggleArrayItem('prayer_focus', item, 3)}
                      className={`w-full p-5 rounded-[2rem] border-2 flex items-center justify-between transition-all ${
                        isSelected 
                        ? 'border-siilah-olive bg-siilah-olive/5 shadow-md' 
                        : 'border-white bg-white hover:border-gray-50'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-siilah-slate' : 'text-gray-400'}`}>
                        {item}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-siilah-olive text-white text-[9px] flex items-center justify-center font-bold">
                          {count + 1}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <OtherInputArea field="prayer_focus" placeholder="What specific area needs prayer?" />
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 font-bold shadow-xl" onClick={nextStep} disabled={formData.prayer_focus!.length === 0}>
                  Lock in Focus
                </Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">Faith tradition?</h2>
              {renderWhisper("Understanding your spiritual background.")}
              <div className="grid grid-cols-1 gap-3">
                 {[
                   'Non-denominational', 'Protestant', 'Catholic', 'Orthodox', 'Pentecostal', 'Latter-day Saint', 
                   'Baptist', 'Methodist', 'Anglican / Episcopalian', 'Presbyterian', 'Lutheran', 
                   'Seventh-day Adventist', 'Messianic Judaism', 'Charismatic', 'Reformed', 
                   'Quaker', 'Church of Christ', 'Anabaptist / Mennonite', 'Nazarene', 'No preference'
                 ].map(trad => {
                   const isActive = formData.christian_tradition === trad;
                   return (
                    <button 
                      key={trad} 
                      onClick={() => setFormData({ ...formData, christian_tradition: trad })}
                      className={`p-5 text-left rounded-[1.5rem] border-2 transition-all flex items-center gap-4 ${
                        isActive ? 'border-siilah-sage bg-siilah-sage/5 shadow-inner' : 'border-white bg-white'
                      }`}
                    >
                       <div className={`w-2.5 h-2.5 rounded-full border-2 border-siilah-sage/30 ${isActive ? 'bg-siilah-sage' : ''}`}></div>
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-siilah-slate' : 'text-gray-400'}`}>{trad}</span>
                    </button>
                   );
                 })}
              </div>
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Or specify another tradition..." 
                  className="w-full bg-white border-2 border-transparent focus:border-siilah-sage rounded-[1.5rem] py-4 px-6 text-xs font-medium italic outline-none transition-all shadow-sm"
                  value={formData.christian_tradition && ![
                   'Non-denominational', 'Protestant', 'Catholic', 'Orthodox', 'Pentecostal', 'Latter-day Saint', 'Baptist', 'Methodist', 'Anglican / Episcopalian', 'Presbyterian', 'Lutheran', 'Seventh-day Adventist', 'Messianic Judaism', 'Charismatic', 'Reformed', 'Quaker', 'Church of Christ', 'Anabaptist / Mennonite', 'Nazarene', 'No preference'
                  ].includes(formData.christian_tradition) ? formData.christian_tradition : ''}
                  onChange={(e) => setFormData({ ...formData, christian_tradition: e.target.value })}
                />
              </div>
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 font-bold shadow-xl" onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-8 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">Your presence.</h2>
              {renderWhisper("How do you typically contribute to a circle?")}
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Encourager', desc: 'I find light in dark places' },
                  { id: 'Deep thinker', desc: 'I reflect on underlying truths' },
                  { id: 'Truth speaker', desc: 'I speak with gentle conviction' },
                  { id: 'Quiet listener', desc: 'I hold space through silence' },
                  { id: 'Prayer warrior', desc: 'I intercede with fervency' },
                  { id: 'Caregiver', desc: 'I show love through action' }
                ].map((item) => {
                  const isSelected = formData.personality_indicators?.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleArrayItem('personality_indicators', item.id)}
                      className={`flex items-center gap-5 p-6 rounded-[2.5rem] border-2 transition-all text-left ${
                        isSelected 
                        ? 'border-siilah-sage bg-siilah-sage/5 shadow-md -translate-x-1' 
                        : 'border-white bg-white hover:border-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${isSelected ? 'bg-siilah-sage text-white' : 'bg-gray-50 text-gray-200'}`}>
                        <i className="fa-solid fa-star"></i>
                      </div>
                      <div>
                        <span className={`block text-[11px] font-bold uppercase tracking-widest ${isSelected ? 'text-siilah-slate' : 'text-gray-400'}`}>{item.id}</span>
                        <span className="text-[10px] text-gray-300 italic font-medium leading-tight">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 font-bold shadow-xl" onClick={nextStep} disabled={formData.personality_indicators!.length === 0}>
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {step === 8 && (
            <div className="flex flex-col items-center justify-center text-center space-y-16 animate-in fade-in py-12">
              <div className="relative">
                <div className="w-32 h-32 bg-siilah-sage/10 rounded-full flex items-center justify-center animate-soft-pulse">
                  <i className="fa-solid fa-sparkles text-siilah-sage text-4xl"></i>
                </div>
                <div className="absolute top-0 right-0 animate-ping h-4 w-4 rounded-full bg-siilah-sage/40"></div>
              </div>
              <div className="space-y-4">
                <h2 className="font-serif text-4xl text-siilah-slate italic font-bold">Finding your rhythm.</h2>
                <p className="text-sm text-gray-400 max-w-xs mx-auto italic font-medium leading-relaxed">Siilah's AI is matching your heart's frequency with compatible seekers.</p>
              </div>
              <div className="w-full px-4 pt-10">
                <Button 
                  fullWidth 
                  size="lg" 
                  className="rounded-full h-20 bg-siilah-slate hover:bg-siilah-olive text-white shadow-2xl text-xl font-bold" 
                  onClick={nextStep}
                >
                  Almost Done
                </Button>
              </div>
            </div>
          )}

          {step === 9 && (
            <div className="space-y-10 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight text-center">Availability.</h2>
              {renderWhisper("Consistency is the bedrock of deep friendship.")}
              <div className="space-y-4">
                {[
                  { id: 'morning', icon: 'fa-sun', label: 'Morning Person', sub: 'I start my day in prayer' },
                  { id: 'evening', icon: 'fa-moon', label: 'Evening Person', sub: 'I reflect at day\'s end' },
                  { id: 'flexible', icon: 'fa-clock', label: 'Flexible/Varies', sub: 'My rhythm changes often' }
                ].map((time) => {
                  const isActive = formData.timezone_preference === time.id;
                  return (
                    <button 
                      key={time.id} 
                      onClick={() => setFormData({ ...formData, timezone_preference: time.id as any })} 
                      className={`w-full p-8 rounded-[3rem] border-2 transition-all flex items-center gap-6 ${
                        isActive ? 'border-siilah-gold bg-siilah-gold/5 shadow-lg -translate-y-1' : 'border-white bg-white hover:border-gray-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-xl transition-colors ${isActive ? 'bg-siilah-gold text-white' : 'bg-gray-50 text-gray-200'}`}>
                         <i className={`fa-solid ${time.icon}`}></i>
                      </div>
                      <div className="text-left">
                        <p className={`text-[11px] font-bold uppercase tracking-widest ${isActive ? 'text-siilah-slate' : 'text-gray-400'}`}>{time.label}</p>
                        <p className="text-[10px] text-gray-300 italic font-medium">{time.sub}</p>
                      </div>
                      {isActive && <i className="fa-solid fa-check text-siilah-gold ml-auto"></i>}
                    </button>
                  );
                })}
              </div>
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 font-bold shadow-xl" onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 10 && (
            <div className="space-y-10 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic text-center leading-tight">Circle Style.</h2>
              <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 space-y-10">
                <div className="space-y-6">
                  <label className="block text-[11px] font-bold text-siilah-sage uppercase tracking-[0.3em] text-center">Preference</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'one_on_one', label: '1:1' },
                      { id: 'small_group', label: 'Group' },
                      { id: 'either', label: 'Either' }
                    ].map(pref => (
                      <button 
                        key={pref.id} 
                        onClick={() => setFormData({ ...formData, sharing_comfort: pref.id as any })} 
                        className={`py-5 text-[10px] font-bold uppercase rounded-3xl border-2 transition-all ${
                          formData.sharing_comfort === pref.id ? 'bg-siilah-olive border-siilah-olive text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-300'
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <label className="block text-[11px] font-bold text-siilah-sage uppercase tracking-[0.3em] text-center">Frequency</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['daily', 'weekly', 'biweekly'].map(pref => (
                      <button 
                        key={pref} 
                        onClick={() => setFormData({ ...formData, activity_preference: pref as any })} 
                        className={`py-5 text-[10px] font-bold uppercase rounded-3xl border-2 transition-all ${
                          formData.activity_preference === pref ? 'bg-siilah-olive border-siilah-olive text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-300'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <Button fullWidth size="lg" className="rounded-[2rem] h-18 font-bold shadow-xl" onClick={nextStep}>
                  Almost there...
                </Button>
              </div>
            </div>
          )}

          {step === 11 && (
            <div className="space-y-10 animate-in slide-in-from-right">
              <h2 className="font-serif text-5xl font-bold text-siilah-slate italic leading-tight">Stay Connected.</h2>
              {renderWhisper("Notifications keep the flame of prayer alive.")}
              
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 space-y-6">
                <button 
                  onClick={() => setFormData({
                    ...formData,
                    notification_settings: {
                      ...formData.notification_settings!,
                      push_enabled: !formData.notification_settings?.push_enabled
                    }
                  })}
                  className={`w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${
                    formData.notification_settings?.push_enabled ? 'border-siilah-sage bg-siilah-sage/5' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-xs font-bold text-siilah-slate uppercase tracking-widest">Enable Push Notifications</p>
                    <p className="text-[10px] text-gray-400 italic">Never miss a prayer request</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.notification_settings?.push_enabled ? 'bg-siilah-sage' : 'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.notification_settings?.push_enabled ? 'left-7' : 'left-1'}`} />
                  </div>
                </button>

                <div className="space-y-3 pt-4">
                  {[
                    { id: 'prayer_requests', label: 'New Prayer Requests' },
                    { id: 'circle_activity', label: 'Circle Milestones' },
                    { id: 'messages', label: 'Soul Responses' }
                  ].map(pref => (
                    <div key={pref.id} className="flex items-center justify-between px-4 py-2">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{pref.label}</span>
                       <button 
                         onClick={() => setFormData({
                           ...formData,
                           notification_settings: {
                             ...formData.notification_settings!,
                             [pref.id]: !formData.notification_settings?.[pref.id]
                           }
                         })}
                         className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                           formData.notification_settings?.[pref.id] ? 'border-siilah-sage bg-siilah-sage text-white' : 'border-gray-200 bg-white'
                         }`}
                       >
                         {formData.notification_settings?.[pref.id] && <i className="fa-solid fa-check text-[8px]"></i>}
                       </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  fullWidth 
                  size="lg" 
                  className="rounded-[2.5rem] h-20 bg-siilah-slate text-white shadow-2xl text-xl font-bold active:scale-95 transition-transform" 
                  onClick={() => onComplete(formData as UserProfile)}
                >
                  Finish & Explore
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
