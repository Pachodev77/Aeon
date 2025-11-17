import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Repeat } from 'lucide-react';
import { CubeVisualizer } from './CubeVisualizer';
import { PlaylistManager, Song } from '../utils/playlistManager';

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [marqueePosition, setMarqueePosition] = useState(0);
  const playlistManager = useRef(new PlaylistManager());
  const audioRef = useRef<HTMLAudioElement>(null);
  const visualizerRef = useRef<CubeVisualizer | null>(null);
  const visualizerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSongs = async () => {
      const loadedSongs = await playlistManager.current.loadSongsFromMusicFolder();
      setSongs(loadedSongs);
    };
    loadSongs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => {
        if (prev <= -100) {
          return 100; // Reset to right side
        }
        return prev - 0.5; // Move left slowly
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: number;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(Math.floor(audioRef.current.currentTime));
          if (audioRef.current.currentTime >= audioRef.current.duration) {
            handleNextSong();
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

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
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // Make sure we have a valid source before playing
          if (songs[currentSongIndex]) {
            audioRef.current.src = songs[currentSongIndex].url;
            await audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } catch (error) {
        console.error('Audio play error:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleNextSong = async () => {
    const nextSong = playlistManager.current.getNextSong();
    if (nextSong) {
      const nextIndex = songs.findIndex(song => song.id === nextSong.id);
      setCurrentSongIndex(nextIndex);
      setCurrentTime(0);
      setDuration(nextSong.duration);
      if (audioRef.current) {
        try {
          // Stop current playback
          audioRef.current.pause();
          // Load new song
          audioRef.current.src = nextSong.url;
          // Wait a bit for the source to load
          await new Promise(resolve => setTimeout(resolve, 100));
          // Always play next song
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Next song error:', error);
          setIsPlaying(false);
        }
      }
    }
  };

  const handlePreviousSong = async () => {
    const prevSong = playlistManager.current.getPreviousSong();
    if (prevSong) {
      const prevIndex = songs.findIndex(song => song.id === prevSong.id);
      setCurrentSongIndex(prevIndex);
      setCurrentTime(0);
      setDuration(prevSong.duration);
      if (audioRef.current) {
        try {
          // Stop current playback
          audioRef.current.pause();
          // Load new song
          audioRef.current.src = prevSong.url;
          // Wait a bit for the source to load
          await new Promise(resolve => setTimeout(resolve, 100));
          // Always play previous song
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Previous song error:', error);
          setIsPlaying(false);
        }
      }
    }
  };

  const handleSongSelect = async (index: number) => {
    setCurrentSongIndex(index);
    setCurrentTime(0);
    const song = songs[index];
    setDuration(song.duration);
    if (audioRef.current) {
      try {
        // Stop current playback
        audioRef.current.pause();
        // Load selected song
        audioRef.current.src = song.url;
        // Wait a bit for the source to load
        await new Promise(resolve => setTimeout(resolve, 100));
        // Always play selected song
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Song select error:', error);
        setIsPlaying(false);
      }
    }
    setShowPlaylist(false);
  };

  return (
    <div className="relative w-full max-w-sm aspect-[9/16] mx-auto flex items-center justify-center overflow-visible bg-black">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]?.url || ''}
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          setDuration(Math.floor(audio.duration));
        }}
      />

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
            <div className="rounded-lg inline-block" style={{ backgroundColor: '#010d0d', padding: '0.125rem 0.5rem', transform: 'translateY(4px)', width: '250px', overflow: 'hidden' }}>
              <h1 
                className="text-2xl font-bold text-green-400 tracking-wider mb-0.5 whitespace-nowrap"
                style={{ 
                  transform: `translateX(${marqueePosition}%)`,
                  transition: 'transform 0.05s linear'
                }}
              >
                {songs[currentSongIndex]?.title || 'ELECTRONIC FUTURE'}
              </h1>
            </div>
            <div className="rounded-lg inline-block mt-0.25" style={{ backgroundColor: '#010d0d', padding: '0.25rem 1rem' }}>
              <p className="text-green-500 text-sm leading-none">{songs[currentSongIndex]?.artist || 'ELECTRONIC DREAMS'}</p>
            </div>
            <div className="rounded-lg inline-block mt-0.25" style={{ backgroundColor: '#010d0d', padding: '0.0625rem 0.5rem', transform: 'translateY(-1px)' }}>
              <p className="text-green-400 text-sm leading-none">{formatTime(currentTime)}:{formatTime(duration)}</p>
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

          <button className="absolute top-[70%] left-1/2 -translate-x-1/2 text-green-500 hover:text-green-400 transition-colors opacity-70 hover:opacity-100 flex items-start justify-center" style={{ transform: 'translateX(-80px) translateY(8px)' }}
            onClick={handlePreviousSong}>
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={() => {
              handlePlayPause();
              setShowVideo(!isPlaying);
            }}
            className="absolute top-[70%] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-black flex items-center justify-center text-green-500 hover:bg-gray-900 transition-all hover:scale-105"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
          </button>

          <button className="absolute top-[70%] left-1/2 -translate-x-1/2 text-green-500 hover:text-green-400 transition-colors opacity-70 hover:opacity-100 flex items-start justify-center" style={{ transform: 'translateX(62px) translateY(8px)' }}
            onClick={handleNextSong}>
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

          <div className="absolute top-[86%] left-1/2 -translate-x-1/2 flex items-center justify-center gap-2">
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="w-7 h-7 rounded-full border border-green-600/40 flex items-center justify-center text-green-500 hover:border-green-500 transition-colors opacity-60 hover:opacity-100"
            >
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

          {/* Playlist Panel */}
          {showPlaylist && (
            <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[calc(80%-10px)] bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-green-600/40 transition-opacity duration-300">
              <h3 className="text-green-400 text-sm font-bold mb-3 text-center">Playlist</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {songs.map((song, index) => (
                  <div 
                    key={song.id}
                    onClick={() => handleSongSelect(index)}
                    className={`text-xs cursor-pointer transition-colors p-2 rounded ${
                      index === currentSongIndex 
                        ? 'text-green-400 bg-green-950/30' 
                        : 'text-green-500 hover:text-green-400'
                    }`}
                  >
                    {index + 1}. {song.title} - {song.artist}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;