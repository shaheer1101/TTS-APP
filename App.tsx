
import React, { useState, useMemo } from 'react';
import { EMOTIONS, MALE_VOICES, FEMALE_VOICES, ALL_VOICES } from './constants';
import { Emotion, GeneratedSpeech, VoiceOption } from './types';
import { generateSpeech, generatePodcast } from './services/geminiTTS';

const Icons = {
  Waveform: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.209.372l-1.165 1.553a15.053 15.053 0 01-6.792-6.792l1.553-1.165a1 1 0 00.372-1.209L5.228 3.684A1 1 0 004.28 3H5z" /></svg>,
  Export: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 03-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Mic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Solo: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Podcast: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Female: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" /></svg>,
  Male: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Chevron: () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>,
};

const App: React.FC = () => {
  const [view, setView] = useState<'solo' | 'podcast'>('solo');
  const [script, setScript] = useState('');
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [selectedVoiceId, setSelectedVoiceId] = useState(ALL_VOICES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [activeGenderTab, setActiveGenderTab] = useState<'female' | 'male'>('female');

  // Podcast state
  const [speakerA, setSpeakerA] = useState({ name: 'Alex', voiceId: ALL_VOICES[0].id, emotion: 'neutral' as Emotion });
  const [speakerB, setSpeakerB] = useState({ name: 'Jordan', voiceId: ALL_VOICES[1].id, emotion: 'neutral' as Emotion });

  const selectedVoice = useMemo(() => 
    ALL_VOICES.find(v => v.id === selectedVoiceId) || ALL_VOICES[0],
    [selectedVoiceId]
  );

  const stats = useMemo(() => {
    const words = script.trim() ? script.trim().split(/\s+/).length : 0;
    const estSecs = Math.ceil(words * 0.45);
    return { words, duration: estSecs < 60 ? `${estSecs}s` : `${Math.floor(estSecs/60)}m ${estSecs%60}s` };
  }, [script]);

  const insertTag = (tag: string) => {
    setScript(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + tag + ': ');
  };

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setIsGenerating(true);
    try {
      let audioUrl = '';
      let voiceLabel = '';
      if (view === 'solo') {
        audioUrl = await generateSpeech(script, emotion, selectedVoice);
        voiceLabel = selectedVoice.label;
      } else {
        const voiceA = ALL_VOICES.find(v => v.id === speakerA.voiceId)!;
        const voiceB = ALL_VOICES.find(v => v.id === speakerB.voiceId)!;
        audioUrl = await generatePodcast(script, 
          { name: speakerA.name, voice: voiceA, emotion: speakerA.emotion }, 
          { name: speakerB.name, voice: voiceB, emotion: speakerB.emotion }
        );
        voiceLabel = `${speakerA.name} & ${speakerB.name}`;
      }
      const newEntry: GeneratedSpeech = {
        id: crypto.randomUUID(), text: script, emotion: view === 'solo' ? emotion : 'neutral',
        voiceLabel, audioUrl, timestamp: Date.now(), wordCount: stats.words,
        durationEstimate: stats.duration, type: view,
      };
      setHistory(prev => [newEntry, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#06070a]">
      {/* HEADER SECTION - SAME AS PROVIDED */}
      <header className="flex-none h-20 border-b border-white/10 bg-[#0a0b0e] px-4 sm:px-10 flex items-center justify-between z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[0.5em] text-white">C R A F T</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          </div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">
            STABLE BUILD <span className="text-cyan-400">2.8.5.X</span>
          </p>
        </div>

        <nav className="flex bg-black/40 p-1 rounded-[18px] border border-white/10 shadow-inner">
          <button 
            onClick={() => setView('solo')} 
            className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-2xl transition-all duration-300 ${view === 'solo' ? 'bg-[#1a1c23] text-white shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-300'}`}
          >
            <Icons.Solo />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden xs:block">Solo Stage</span>
          </button>
          <button 
            onClick={() => setView('podcast')} 
            className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-2xl transition-all duration-300 ${view === 'podcast' ? 'bg-[#1a1c23] text-white shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-300'}`}
          >
            <Icons.Podcast />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hidden xs:block">Podcast</span>
          </button>
        </nav>
      </header>

      {/* SINGLE MERGED WORKSPACE CONTENT */}
      <main className="flex-1 bg-[#06070a] px-4 sm:px-10 pb-20">
        <div className="max-w-5xl mx-auto space-y-10 py-10">
          
          {/* Context Header */}
          <div className="flex items-end justify-between border-b border-white/5 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
                {view === 'solo' ? 'SIGNAL CHAIN: MONO' : 'SIGNAL CHAIN: STEREO MASTER'}
              </span>
              <h3 className="text-3xl font-black text-white leading-tight">
                {view === 'solo' ? 'Neural Synthesis' : 'Podcast Studio'}
              </h3>
            </div>
            <div className="hidden sm:flex gap-6 text-right">
              <div>
                 <span className="block text-[8px] font-black text-slate-700 uppercase tracking-widest">Buffer Size</span>
                 <p className="text-lg font-black text-white mono">{stats.words} WDS</p>
              </div>
              <div>
                 <span className="block text-[8px] font-black text-slate-700 uppercase tracking-widest">Est. Output</span>
                 <p className="text-lg font-black text-cyan-400 mono">{stats.duration}</p>
              </div>
            </div>
          </div>

          {/* Script Area */}
          <div className="bg-[#0d0e12] rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
            <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center px-6 justify-between">
              <div className="flex gap-4">
                {view === 'podcast' && (
                  <>
                    <button onClick={() => insertTag(speakerA.name)} className="text-[9px] font-black uppercase text-purple-400 hover:text-white transition-colors">ADD {speakerA.name.toUpperCase()}</button>
                    <button onClick={() => insertTag(speakerB.name)} className="text-[9px] font-black uppercase text-cyan-400 hover:text-white transition-colors">ADD {speakerB.name.toUpperCase()}</button>
                  </>
                )}
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
              </div>
            </div>
            <textarea
              className="w-full h-48 sm:h-64 bg-transparent p-6 focus:outline-none text-lg text-slate-200 leading-relaxed font-medium placeholder:text-slate-800 resize-none no-scrollbar"
              placeholder={view === 'solo' ? "Enter script..." : `${speakerA.name}: Welcome!\n${speakerB.name}: Excited to be here.`}
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
          </div>

          {/* Selection Grid */}
          {view === 'solo' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0d0e12] rounded-[24px] p-6 border border-white/5 space-y-4">
                 <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">VOICE PROFILE</h3>
                 <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                    <button onClick={() => setActiveGenderTab('female')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeGenderTab === 'female' ? 'bg-white/10 text-white' : 'text-slate-600'}`}>Female</button>
                    <button onClick={() => setActiveGenderTab('male')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeGenderTab === 'male' ? 'bg-white/10 text-white' : 'text-slate-600'}`}>Male</button>
                  </div>
                 <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                  {(activeGenderTab === 'female' ? FEMALE_VOICES : MALE_VOICES).map(v => (
                    <button key={v.id} onClick={() => setSelectedVoiceId(v.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedVoiceId === v.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-transparent border-transparent text-slate-600 hover:bg-white/5'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedVoiceId === v.id ? 'bg-cyan-500 text-black' : 'bg-white/5'}`}>{v.gender === 'female' ? <Icons.Female /> : <Icons.Male />}</div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${selectedVoiceId === v.id ? 'text-white' : ''}`}>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-[#0d0e12] rounded-[24px] p-6 border border-white/5 space-y-4">
                <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">EMOTION VECTOR</h3>
                <div className="grid grid-cols-3 gap-2">
                  {EMOTIONS.map(e => (
                    <button key={e.value} onClick={() => setEmotion(e.value)} className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${emotion === e.value ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-transparent text-slate-600 hover:border-white/10'}`}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0d0e12] rounded-[24px] p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-[9px] font-black text-purple-400 tracking-[0.4em]">TRACK ALPHA</h3>
                  <input className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] font-black text-white w-24 focus:outline-none" value={speakerA.name} onChange={(e) => setSpeakerA({...speakerA, name: e.target.value})} />
                </div>
                <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest" value={speakerA.voiceId} onChange={(e) => setSpeakerA({...speakerA, voiceId: e.target.value})}>
                  {ALL_VOICES.map(v => <option key={v.id} value={v.id}>{v.label} ({v.shortName})</option>)}
                </select>
              </div>
              <div className="bg-[#0d0e12] rounded-[24px] p-6 border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-[9px] font-black text-cyan-400 tracking-[0.4em]">TRACK BETA</h3>
                  <input className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[9px] font-black text-white w-24 focus:outline-none" value={speakerB.name} onChange={(e) => setSpeakerB({...speakerB, name: e.target.value})} />
                </div>
                <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest" value={speakerB.voiceId} onChange={(e) => setSpeakerB({...speakerB, voiceId: e.target.value})}>
                  {ALL_VOICES.map(v => <option key={v.id} value={v.id}>{v.label} ({v.shortName})</option>)}
                </select>
              </div>
            </div>
          )}

          {/* ACTION BUTTON - NOW IN THE SAME FLOW */}
          <div className="pt-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !script.trim()}
              className={`w-full h-16 rounded-[24px] overflow-hidden transition-all active:scale-[0.98] ${
                isGenerating ? 'cursor-not-allowed opacity-50' : 'hover:-translate-y-0.5 shadow-xl'
              } ${view === 'solo' ? 'bg-white text-black' : 'bg-[#1a1c23] text-white border border-white/10'}`}
            >
              <div className="flex items-center justify-center gap-4">
                {isGenerating ? (
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">PROCESSING SIGNAL...</span>
                ) : (
                  <span className="text-[11px] font-black uppercase tracking-[0.6em]">
                    {view === 'solo' ? 'INITIATE SYNTHESIS' : 'RENDER MULTI-TRACK'}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* MASTER BUFFER SECTION - NOW MERGED DIRECTLY BELOW */}
          <div className="space-y-6 pt-10 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-2">
                <Icons.Waveform /> MASTER BUFFER
              </h2>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-black text-cyan-400 mono">{history.length} ITEMS</div>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center opacity-10">
                  <Icons.Waveform />
                  <p className="text-[9px] font-black uppercase tracking-widest mt-4">Signal Empty</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="border border-white/10 rounded-[24px] p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <span className={`px-2 py-0.5 text-[7px] font-black uppercase rounded tracking-widest ${item.type === 'podcast' ? 'bg-purple-600 text-white' : 'bg-cyan-500 text-black'}`}>{item.type}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.voiceLabel}</p>
                      </div>
                      <a href={item.audioUrl} download={`voicecraft_${item.id}.wav`} className="p-2.5 bg-white/5 rounded-xl text-slate-600 hover:text-white transition-colors"><Icons.Export /></a>
                    </div>
                    <audio controls className="w-full h-10 invert opacity-80 mb-2"><source src={item.audioUrl} type="audio/wav" /></audio>
                    <div className="flex justify-between text-[8px] font-black text-slate-800 uppercase tracking-widest px-1">
                      <span>{item.durationEstimate}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        audio::-webkit-media-controls-panel { background-color: transparent; }
        @media (max-width: 480px) { .xs\\:block { display: none; } }
      `}</style>
    </div>
  );
};

export default App;
