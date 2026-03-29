import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// モジュールシングルトン：APIは一度だけ読み込む
let _apiStatus: 'idle' | 'loading' | 'ready' = 'idle';
const _callbacks: Array<() => void> = [];

function loadYTApi(onReady: () => void) {
  if (typeof window === 'undefined') return;
  if (_apiStatus === 'ready' && window.YT?.Player) { onReady(); return; }
  _callbacks.push(onReady);
  if (_apiStatus !== 'idle') return;
  _apiStatus = 'loading';
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
  window.onYouTubeIframeAPIReady = () => {
    _apiStatus = 'ready';
    _callbacks.splice(0).forEach(fn => fn());
  };
}

/**
 * スマホ対応 YouTube 音声プレイヤー
 *
 * 使い方：
 *   const { audioRef, play, stop } = useYouTubeAudio();
 *   <div ref={audioRef} />   ← 不可視マウントポイントをJSXに配置する
 *
 * play(videoId) は必ず onClick / onTouchEnd の中（ユーザージェスチャー内）で呼ぶこと。
 */
export function useYouTubeAudio() {
  const audioRef  = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const aliveRef  = useRef(true);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    loadYTApi(() => { if (aliveRef.current) setApiReady(true); });
    return () => {
      aliveRef.current = false;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  /**
   * 指定した videoId を再生する。
   * ・初回呼び出し：プレイヤーを新規作成して再生
   * ・2回目以降：loadVideoById で動画を差し替えて再生
   * → どちらもクリックハンドラ内で呼ぶことで iOS Safari の自動再生制限を回避
   */
  const play = (videoId: string) => {
    if (!apiReady || !audioRef.current) return;

    if (playerRef.current) {
      // 既存プレイヤーに動画を差し替え
      playerRef.current.loadVideoById({ videoId, startSeconds: 0 });
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      playerRef.current.playVideo();
    } else {
      // 初回：ユーザージェスチャー内でプレイヤーを生成 → iOS で再生許可が下りる
      playerRef.current = new window.YT.Player(audioRef.current, {
        height: '1',
        width: '1',
        videoId,
        playerVars: {
          autoplay:       1,
          controls:       0,
          playsinline:    1,   // iOS でフルスクリーンにならず背景再生
          fs:             0,
          rel:            0,
          iv_load_policy: 3,
          loop:           1,
          playlist:       videoId,
        },
        events: {
          onReady: (e: any) => {
            e.target.unMute();
            e.target.setVolume(100);
            e.target.playVideo();
          },
          onStateChange: (e: any) => {
            // YT.PlayerState.ENDED = 0 → 先頭から再生してループ
            if (e.data === 0) {
              e.target.seekTo(0);
              e.target.playVideo();
            }
          },
        },
      });
    }
  };

  const stop = () => {
    if (playerRef.current) {
      try { playerRef.current.pauseVideo(); } catch {}
    }
  };

  return { audioRef, play, stop, apiReady };
}
