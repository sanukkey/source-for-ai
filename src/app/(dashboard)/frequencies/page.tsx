'use client';

import { useState } from 'react';
import { Play, Square, Activity, Heart, Wind, Zap } from 'lucide-react';
import { useYouTubeAudio } from '@/utils/useYouTubeAudio';

const EMOTIONS = [
  { label: 'ストレス解放', icon: Activity, freq: 528, ytId: '1ZYbU82GVz4', desc: '528Hz - 疲労回復と奇跡のヒーリングピアノ' },
  { label: '愛と奇跡',    icon: Heart,    freq: 528, ytId: '1MPRbX7ACh8', desc: '528Hz - 愛の周波数・ポジティブな変容' },
  { label: '宇宙の静寂',  icon: Wind,     freq: 432, ytId: 'h4IzkCm0v_8', desc: '432Hz - 宇宙との一体感・深い癒やし' },
  { label: '浄化・表現',  icon: Zap,      freq: 741, ytId: '2kxRi-ZmogI', desc: '741Hz - 毒素の解放・直感と表現力の覚醒' },
];

export default function FrequencyOracle() {
  const [isPlaying, setIsPlaying]       = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState(EMOTIONS[0]);
  const { audioRef, play, stop, apiReady } = useYouTubeAudio();

  // 感情カードをタップ → ユーザージェスチャー内で play() を呼ぶ
  const handleEmotionSelect = (emotion: typeof EMOTIONS[0]) => {
    setSelectedEmotion(emotion);
    setIsPlaying(true);
    play(emotion.ytId); // ← クリックハンドラ内 = ユーザージェスチャー → iOS で再生許可
  };

  const handleToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stop();
    } else {
      setIsPlaying(true);
      play(selectedEmotion.ytId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">安らぎの周波数</h1>
        <p className="text-foreground/70 text-lg">今の感情を選ぶと、その周波数に合わせたヒーリングピアノが流れます。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 感情選択グリッド */}
        <div className="grid grid-cols-2 gap-4">
          {EMOTIONS.map((emotion) => (
            <button
              key={emotion.label}
              onClick={() => handleEmotionSelect(emotion)}
              className={`p-6 rounded-3xl border text-left transition-all duration-300 flex flex-col items-center text-center gap-3 ${
                selectedEmotion.label === emotion.label
                  ? 'border-primary-orange bg-orange-50 dark:bg-orange-900/20 shadow-md shadow-orange-500/10 scale-105'
                  : 'border-orange-100 dark:border-orange-900/40 bg-white dark:bg-[#1c1310]/50 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:scale-105'
              }`}
            >
              <div className={`p-4 rounded-full ${
                selectedEmotion.label === emotion.label
                  ? 'bg-gradient-to-tr from-primary-orange to-primary-pink text-white'
                  : 'bg-orange-100 dark:bg-orange-900/40 text-primary-orange'
              }`}>
                <emotion.icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{emotion.label}</h3>
                <p className="text-xs text-foreground/60 mt-1">{emotion.freq}Hz</p>
              </div>
            </button>
          ))}
        </div>

        {/* プレイヤー */}
        <div className="bg-white dark:bg-[#1c1310]/80 backdrop-blur-xl border border-orange-100 dark:border-orange-900/40 rounded-3xl p-8 shadow-xl shadow-orange-500/5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-[150%] h-[150%] rounded-full border border-primary-orange/20 animate-ping" style={{ animationDuration: '4s' }} />
            <div className="absolute w-[180%] h-[180%] rounded-full border border-primary-yellow/10 animate-ping" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          </div>

          <div className="z-10 flex flex-col items-center text-center">
            <h2 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary-orange to-primary-pink tracking-tighter mb-2">
              {selectedEmotion.freq}
              <span className="text-3xl text-foreground/40 ml-1">Hz</span>
            </h2>
            <p className="text-lg font-bold text-foreground mb-1">{selectedEmotion.label}</p>
            <p className="text-foreground/70 font-medium mb-10 max-w-xs leading-relaxed text-sm">
              {selectedEmotion.desc}
            </p>

            <button
              onClick={handleToggle}
              disabled={!apiReady}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                isPlaying
                  ? 'bg-white dark:bg-[#1c1310] border-2 border-primary-pink text-primary-pink'
                  : 'bg-gradient-to-tr from-primary-orange to-primary-pink text-white hover:shadow-orange-500/40'
              }`}
            >
              {isPlaying
                ? <Square className="w-8 h-8 fill-current" />
                : <Play className="w-10 h-10 ml-2 fill-current" />
              }
            </button>

            <p className="mt-6 text-sm text-foreground/50 font-medium tracking-widest">
              {!apiReady
                ? '読み込み中...'
                : isPlaying
                ? 'ヒーリングピアノ 共鳴中...'
                : '波動を合わせる'
              }
            </p>
          </div>
        </div>
      </div>

      {/* YouTube IFrame API のマウントポイント（不可視） */}
      <div ref={audioRef} className="w-px h-px absolute opacity-0 overflow-hidden pointer-events-none" />
    </div>
  );
}
