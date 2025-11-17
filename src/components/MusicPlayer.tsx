import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat } from 'lucide-react';
import { CubeVisualizer } from './CubeVisualizer';

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(91);
  const [duration] = useState(221);
  const [volume, setVolume] = useState(70);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const visualizerRef = useRef<CubeVisualizer | null>(null);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isPlaying && visualizerContainerRef.current && !visualizerRef.current) {
      visualizerRef.current = new CubeVisualizer(visualizerContainerRef.current);
      visualizerRef.current.start();
    } else if (isPlaying && visualizerRef.current) {
      visualizerRef.current.dispose();
      visualizerRef.current = null;
    }

    return () => {
      if (visualizerRef.current) {
        visualizerRef.current.dispose();
        visualizerRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleResize = () => {
      if (visualizerRef.current) {
        visualizerRef.current.handleResize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  return (
    <div className="relative w-full max-w-sm aspect-[9/16] mx-auto flex items-center justify-center overflow-visible bg-black">
      <img
        src="/Copilot_20251116_160743.png"
        alt="Music Player Background"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
        style={{ transform: 'scaleY(1.23) scaleX(1.02)' }}
      />
      <video
        src="/grok-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: 'scaleY(1.23)' }}
      >
        <source src="/grok-video.mp4" type="video/mp4; codecs=hev1" />
        <source src="/grok-video.mp4" type="video/mp4; codecs=avc1" />
        <source src="/grok-video.mp4" type="video/mp4" />
      </video>

      <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0" style={{ transform: 'translateY(69px)' }}>
          <div className={`absolute top-[16%] left-1/2 -translate-x-1/2 text-center transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
            <div className="rounded-lg inline-block" style={{ backgroundColor: '#010d0d', padding: '0.125rem 0.5rem', transform: 'translateY(4px)' }}>
              <h1 className="text-2xl font-bold text-green-400 tracking-wider mb-0.5 whitespace-nowrap">
                ELECTRONIC FUTURE
              </h1>
            </div>
            <div className="rounded-lg inline-block mt-0.25" style={{ backgroundColor: '#010d0d', padding: '0.25rem 1rem' }}>
              <p className="text-green-500 text-sm tracking-widest whitespace-nowrap">
                ELECTRONIC DREAMS
              </p>
            </div>
            <br />
            <div className="rounded-lg inline-block" style={{ backgroundColor: '#010d0d', padding: '0.0625rem 0.5rem', transform: 'translateY(-1px)' }}>
              <p className="text-green-400 text-sm leading-none">1:3:1</p>
            </div>
          </div>

          <div className={`absolute top-[32%] left-1/2 -translate-x-1/2 w-48 h-48 flex items-center justify-center ${isPlaying ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
            <div className="flex items-end justify-center gap-0.5 h-20">
              {Array.from({ length: 32 }).map((_, i) => {
                const height = Math.sin(i * 0.3) * 35 + 35 + Math.random() * 15;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-green-500 rounded-t transition-all duration-300"
                    style={{
                      height: `${isPlaying ? height : height * 0.5}px`,
                      opacity: 0.6 + Math.random() * 0.4,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className={`absolute left-1/2 -translate-x-1/2 w-[70%] bg-green-950 rounded-lg transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`} style={{ top: '58.5%', backgroundColor: '#010d0d', padding: '6px 5px' }}>
            <div className="flex justify-between items-center px-2 leading-none -mb-3">
              <span className="text-green-400 text-xs font-mono">{formatTime(currentTime)}</span>
              <span className="text-green-400 text-xs font-mono">{formatTime(duration)}</span>
            </div>
            <div className="w-[95%] mx-auto">
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-0.5 bg-green-900 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #22c55e ${(currentTime / duration) * 100}%, #064e3b ${(currentTime / duration) * 100}%)`,
                }}
              />
            </div>
          </div>

          <button className="absolute top-[70%] left-1/2 -translate-x-1/2 text-green-500 hover:text-green-400 transition-colors opacity-70 hover:opacity-100 flex items-start justify-center" style={{ transform: 'translateX(-120px) translateY(8px)' }}>
            <Shuffle size={16} />
          </button>

          <button className="absolute top-[70%] left-1/2 -translate-x-1/2 text-green-500 hover:text-green-400 transition-colors opacity-70 hover:opacity-100 flex items-start justify-center" style={{ transform: 'translateX(-80px) translateY(8px)' }}>
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              setShowVideo(!isPlaying);
            }}
            className="absolute top-[70%] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-black flex items-center justify-center text-green-500 hover:bg-gray-900 transition-all hover:scale-105"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
          </button>

          <button className="absolute top-[70%] left-1/2 -translate-x-1/2 text-green-500 hover:text-green-400 transition-colors opacity-70 hover:opacity-100 flex items-start justify-center" style={{ transform: 'translateX(62px) translateY(8px)' }}>
            <SkipForward size={18} fill="currentColor" />
          </button>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-[70%] left-1/2 -translate-x-1/2 text-green-500 hover:text-green-400 transition-colors opacity-70 hover:opacity-100 flex items-start justify-center"
            style={{ transform: 'translateX(102px) translateY(8px)' }}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          </button>

          <div className="absolute top-[79%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-20">
            <div className="flex items-center justify-center gap-2.5" style={{ transform: 'translateX(-2px)' }}>
              <button className="w-6 h-6 rounded border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>

              <button className="w-6 h-6 rounded border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
                <Repeat size={12} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2.5" style={{ transform: 'translateX(1px)' }}>
              <button className="w-6 h-6 rounded border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>

              <button className="w-6 h-6 rounded border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </button>
            </div>
          </div>

          <div className="absolute top-[85%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
            <button className="w-7 h-7 rounded-full border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </button>

            <button className="w-7 h-7 rounded-full border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </button>

            <button className="w-7 h-7 rounded-full border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>

            <button className="w-7 h-7 rounded-full border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <button className="w-7 h-7 rounded-full border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </button>
          </div>

          {/* 3D Cube Visualizer - Only visible when music is not playing */}
          <div 
            ref={visualizerContainerRef}
            className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-64 h-64 flex items-center justify-center ${!isPlaying ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            style={{ pointerEvents: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;