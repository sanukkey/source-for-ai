'use client';

import { useState, useEffect, useRef } from 'react';
import { Wind, Sparkles, Play, Square } from 'lucide-react';
import { useYouTubeAudio } from '@/utils/useYouTubeAudio';

type Phase = 'inhale' | 'hold' | 'exhale';

const DURATIONS: Record<Phase, number> = {
  inhale: 3000,
  hold:   1000,
  exhale: 5000,
};

const NEXT_PHASE: Record<Phase, Phase> = {
  inhale: 'hold',
  hold:   'exhale',
  exhale: 'inhale',
};

const MEDITATION_BGM_YT = '1ZYbU82GVz4'; // 528Hz ヒーリングピアノ

export default function MeditationPage() {
  const [isRunning, setIsRunning]       = useState(false);
  const [phase, setPhase]               = useState<Phase>('inhale');
  const [subCount, setSubCount]         = useState(1);
  const [elapsed, setElapsed]           = useState(0);
  const [barWidth, setBarWidth]         = useState(0);
  const [barDuration, setBarDuration]   = useState(0);

  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { audioRef, play, stop } = useYouTubeAudio();

  const clearAllTimers = () => {
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (countTimerRef.current) clearInterval(countTimerRef.current);
  };

  const startPhase = (p: Phase) => {
    setPhase(p);
    setSubCount(1);
    if (countTimerRef.current) clearInterval(countTimerRef.current);

    if (p === 'inhale') {
      setBarDuration(0);
      setBarWidth(0);
      setTimeout(() => { setBarDuration(DURATIONS.inhale); setBarWidth(100); }, 32);
      let c = 1;
      countTimerRef.current = setInterval(() => {
        c++;
        if (c <= 3) setSubCount(c);
      }, DURATIONS.inhale / 3);

    } else if (p === 'hold') {
      setBarDuration(0);
      setBarWidth(100);

    } else {
      setBarDuration(DURATIONS.exhale);
      setBarWidth(0);
      let c = 1;
      countTimerRef.current = setInterval(() => {
        c++;
        if (c <= 5) setSubCount(c);
      }, DURATIONS.exhale / 5);
    }

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = setTimeout(() => {
      startPhase(NEXT_PHASE[p]);
    }, DURATIONS[p]);
  };

  // ボタンタップ → ユーザージェスチャー内で play() / stop() を呼ぶ
  const handleToggle = () => {
    if (isRunning) {
      clearAllTimers();
      setIsRunning(false);
      setBarWidth(0);
      setBarDuration(0);
      stop(); // ← ユーザージェスチャー内で停止
    } else {
      setElapsed(0);
      setIsRunning(true);
      play(MEDITATION_BGM_YT); // ← ユーザージェスチャー内で再生 → iOS 許可
      startPhase('inhale');
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => () => clearAllTimers(), []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const circleScale =
    !isRunning         ? 'scale-100'  :
    phase === 'exhale' ? 'scale-[0.65]' : 'scale-125';

  const circleDuration =
    !isRunning         ? 'duration-500'      :
    phase === 'inhale' ? 'duration-[3000ms]' :
    phase === 'hold'   ? 'duration-0'        : 'duration-[5000ms]';

  const phaseLabel =
    phase === 'inhale' ? '鼻からゆっくり吸って' :
    phase === 'hold'   ? '止めて'               : '口からゆっくり吐いて';

  const countNumbers =
    phase === 'inhale' ? [1,2,3] : phase === 'hold' ? [1] : [1,2,3,4,5];

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-7 pt-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-primary-orange mb-2">
          <Wind className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">瞑想モード</h1>
        </div>
        <p className="text-foreground/60 text-base">思考を手放し、ただ「今」の呼吸に意識を向けてください。</p>
      </div>

      {/* フェーズ＆カウント */}
      <div className="h-20 flex flex-col items-center justify-center gap-2.5">
        {isRunning ? (
          <>
            <p className={`text-base font-semibold tracking-wide transition-all duration-300 ${
              phase === 'hold' ? 'text-primary-yellow' : 'text-foreground/70'
            }`}>
              {phaseLabel}
            </p>
            <div className="flex items-center gap-3">
              {countNumbers.map(n => (
                <span key={n} className={`text-2xl font-black tabular-nums transition-all duration-200 ${
                  phase === 'hold'
                    ? 'text-primary-yellow scale-125 drop-shadow-sm'
                    : n === subCount
                    ? 'text-primary-orange scale-125 drop-shadow-sm'
                    : n < subCount ? 'text-foreground/25' : 'text-foreground/15'
                }`}>
                  {n}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-foreground/45 text-sm space-y-0.5">
            <p>1・2・3 で鼻から吸って</p>
            <p className="text-primary-yellow/60">1 で一呼吸 止める</p>
            <p>1・2・3・4・5 で口から吐いて</p>
          </div>
        )}
      </div>

      {/* 呼吸アニメーション円 */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {isRunning && (
          <>
            <div className="absolute w-full h-full rounded-full border border-primary-orange/15 animate-ping"
              style={{ animationDuration: '9s', animationPlayState: phase === 'hold' ? 'paused' : 'running' }} />
            <div className="absolute w-[82%] h-[82%] rounded-full border border-primary-yellow/10 animate-ping"
              style={{ animationDuration: '9s', animationDelay: '2s', animationPlayState: phase === 'hold' ? 'paused' : 'running' }} />
          </>
        )}
        <div className={`w-44 h-44 rounded-full bg-gradient-to-tr flex items-center justify-center shadow-2xl transition-all ease-in-out ${circleDuration} ${circleScale}
          ${phase === 'hold' && isRunning
            ? 'from-primary-yellow to-primary-orange shadow-yellow-500/30 opacity-100'
            : 'from-primary-orange to-primary-pink shadow-orange-500/25'}
          ${isRunning ? 'opacity-90' : 'opacity-55'}`}
        >
          <Sparkles className="w-10 h-10 text-white/60" />
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-xs space-y-1.5">
        <div className="h-2 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              phase === 'hold' && isRunning
                ? 'bg-gradient-to-r from-primary-yellow to-primary-orange'
                : 'bg-gradient-to-r from-primary-orange to-primary-pink'
            }`}
            style={{ width: `${barWidth}%`, transition: `width ${barDuration}ms linear` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-foreground/35 px-0.5">
          <span>吸う（3秒）</span>
          <span className="text-primary-yellow/50">止（1秒）</span>
          <span>吐く（5秒）</span>
        </div>
      </div>

      {/* タイマー */}
      <div className="text-center">
        <p className="text-5xl font-black tabular-nums tracking-tighter text-foreground/80">{mm}:{ss}</p>
        <p className="text-sm text-foreground/40 mt-1">経過時間</p>
      </div>

      {/* スタート / ストップボタン */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-3 px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${
          isRunning
            ? 'bg-white dark:bg-[#1c1310] border-2 border-primary-pink text-primary-pink'
            : 'bg-gradient-to-r from-primary-orange to-primary-pink text-white shadow-orange-500/30'
        }`}
      >
        {isRunning
          ? <><Square className="w-5 h-5 fill-current" /> 瞑想を終了する</>
          : <><Play className="w-5 h-5 fill-current ml-1" /> 瞑想を始める</>
        }
      </button>

      {/* YouTube IFrame API マウントポイント（不可視） */}
      <div ref={audioRef} className="w-px h-px absolute opacity-0 overflow-hidden pointer-events-none" />
    </div>
  );
}
