
import React, { useState, useEffect, useRef } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { GAME_VERSION } from '../version';
import SaveLoadModal from './SaveLoadModal';
import { loginUser, registerUser } from '../services/db';

interface TitleScreenProps {
  onLogin: (uid: number) => void;
  onStartGame: () => void;
  onLoadGame: (slotId: number) => void;
  onOpenConfig: () => void;
  volume: number;
  isMuted: boolean;
  currentUserId: number | null;
}

const TITLE_VIDEO = "img/bg/Title/Title_01.webm";
const TITLE_BGM = "audio/bgm/_title.ogg";

const TITLE_BG_IMAGES = [
  "img/bg/Title/Title_02.png",
  "img/bg/Title/Title_03.png",
  "img/bg/Title/Title_04.png",
  "img/bg/Title/Title_05.png",
  "img/bg/Title/Title_06.png",
  "img/bg/Title/Title_07.png",
];

const TitleScreen: React.FC<TitleScreenProps> = ({ onLogin, onStartGame, onLoadGame, onOpenConfig, volume, isMuted, currentUserId }) => {
  const [showVideo, setShowVideo] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // UI States
  const [titleState, setTitleState] = useState<'WAITING' | 'AUTH' | 'MENU'>('WAITING');
  
  // Auth Form States
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  // If we already have a user ID (e.g. returning from game), show menu directly
  useEffect(() => {
      if (currentUserId !== null && titleState === 'WAITING') {
          setTitleState('MENU');
      }
  }, [currentUserId]);

  // --- Audio Control Logic ---
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume, isMuted]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => {
        console.warn("Audio playback failed:", e);
      });
      setIsPlaying(true);
    }
  };

  // --- Background Slideshow Logic ---
  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * TITLE_BG_IMAGES.length));
  }, []);

  useEffect(() => {
    if (showVideo) return;

    const interval = setInterval(() => {
        setCurrentIndex(prev => {
            let next;
            do {
                next = Math.floor(Math.random() * TITLE_BG_IMAGES.length);
            } while (next === prev && TITLE_BG_IMAGES.length > 1);
            return next;
        });
    }, 6000);

    return () => clearInterval(interval);
  }, [showVideo]);

  const handleVideoEnd = () => {
      setShowVideo(false);
  };

  const handleScreenClick = () => {
      if (titleState === 'WAITING') {
          setTitleState('AUTH');
      }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);

      // Basic Validation
      if (!username || !password) {
          setAuthError("请输入用户名和密码");
          return;
      }
      
      const usernameRegex = /^[a-zA-Z0-9]+$/;
      if (!usernameRegex.test(username)) {
          setAuthError("用户名只允许字母和数字");
          return;
      }

      if (authMode === 'REGISTER') {
          if (password !== confirmPassword) {
              setAuthError("两次输入的密码不一致");
              return;
          }
          
          const result = await registerUser(username, password);
          if (result.success && result.uid !== undefined) {
              onLogin(result.uid);
              setTitleState('MENU');
          } else {
              setAuthError(result.message);
          }
      } else {
          // Login
          const result = await loginUser(username, password);
          if (result.success && result.uid !== undefined) {
              onLogin(result.uid);
              setTitleState('MENU');
          } else {
              setAuthError(result.message);
          }
      }
  };

  // --- Particle Effect Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    const PARTICLE_COUNT = 60; 
    const COLORS = ['rgba(251, 191, 36, ', 'rgba(252, 211, 77, ', 'rgba(255, 255, 255, ']; 

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      colorBase: string;
      opacity: number;
      fadeSpeed: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 0.5; 
        this.speedY = Math.random() * 0.4 + 0.1; 
        this.speedX = Math.random() * 0.4 - 0.2; 
        this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.opacity = Math.random() * 0.6 + 0.1;
        this.fadeSpeed = Math.random() * 0.003 + 0.001;
      }

      reset() {
        this.x = Math.random() * canvas!.width;
        this.y = canvas!.height + 10;
        this.opacity = 0;
        this.speedY = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -10) this.reset();
        if (Math.random() > 0.98) this.opacity = Math.min(0.8, this.opacity + 0.05);
        else this.opacity = Math.max(0.1, this.opacity - 0.002);
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorBase + this.opacity + ')';
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.colorBase + '0.5)';
        ctx.fill();
        ctx.shadowBlur = 0; 
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
        className="absolute inset-0 z-0 w-full h-full bg-black overflow-hidden"
    >
        {/* Audio Element */}
        <audio 
            ref={audioRef}
            autoPlay
            loop
            className="hidden"
        >
            <source src={resolveImgPath(TITLE_BGM)} type="audio/ogg" />
        </audio>

        {/* CSS Animation Keyframes */}
        <style>{`
            @keyframes kenburns {
                0% { transform: scale(1) translate(0, 0); transform-origin: 50% 50%; }
                50% { transform: scale(1.08) translate(-1%, 1%); transform-origin: 40% 60%; }
                100% { transform: scale(1.15) translate(1%, -1%); transform-origin: 60% 40%; }
            }
            @keyframes music-rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes breath {
                0%, 100% { opacity: 0.3; transform: scale(0.98); }
                50% { opacity: 0.9; transform: scale(1.02); }
            }
        `}</style>

        {/* Background Layers Container */}
        <div className="absolute inset-0 z-0" onClick={handleScreenClick}>
            {/* 0. Video Layer (Intro) */}
            <div 
                className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                    showVideo ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
                <video
                    ref={videoRef}
                    src={resolveImgPath(TITLE_VIDEO)}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                    onError={handleVideoEnd}
                />
            </div>

            {/* 1. Images (Layer 0-5) */}
            {TITLE_BG_IMAGES.map((src, index) => (
                <div 
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
                        !showVideo && index === currentIndex ? 'opacity-100 z-5' : 'opacity-0 z-0'
                    }`}
                >
                    <img 
                        src={resolveImgPath(src)} 
                        alt="Game Background" 
                        className="w-full h-full object-cover"
                        style={{
                            animation: `kenburns ${25 + (index % 3) * 5}s ease-in-out infinite alternate` 
                        }}
                    />
                </div>
            ))}

            {/* 2. Particles (Layer 15) */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 z-[15] pointer-events-none opacity-80"
            />

            {/* 3. Cinematic Overlay (Layer 20) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-black/60 z-20 pointer-events-none mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-20 pointer-events-none" />
        </div>

        {/* Main Content */}
        <div className="relative z-30 w-full h-full pointer-events-none">
            
            {/* Music Toggle Button */}
            <div className="absolute top-6 right-6 pointer-events-auto z-[100]">
              <button 
                onClick={toggleMusic}
                className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-500 backdrop-blur-md ${
                  isPlaying 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                  : 'bg-black/40 border-white/20 text-white/40 hover:text-white hover:border-white/40'
                }`}
                title={isPlaying ? "暂停 BGM" : "播放 BGM"}
              >
                <i 
                  className={`fa-solid fa-music text-xl ${isPlaying ? 'animate-pulse' : ''}`}
                  style={isPlaying ? { animation: 'music-rotate 4s linear infinite' } : {}}
                ></i>
              </button>
            </div>

            {/* Title Area */}
            <div className={`absolute top-12 left-12 md:top-20 md:left-24 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] pointer-events-auto transition-all duration-1000 ${titleState === 'AUTH' ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
                <div className="flex items-end gap-3 mb-2">
                    <div className="w-20 h-20 opacity-90 animate-pulse">
                        <img 
                        src={resolveImgPath("img/svg/unicorn.svg")} 
                        alt="Title Logo" 
                        className="w-full h-full object-contain" 
                        />
                    </div>
                    <span className="text-amber-500/50 font-sans text-sm text-shadow select-none">
                        {GAME_VERSION}
                    </span>
                </div>
                <h1 className="vn-title text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-400 tracking-tighter filter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] border-white">
                Adventurer<br/>
                <span className="text-amber-500 text-5xl md:text-7xl">Tavern</span>
                </h1>
                <div className="mt-4 flex items-center gap-4">
                <div className="h-0.5 w-16 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                <p className="text-white/90 text-xl md:text-2xl font-light tracking-[0.2em] text-shadow">
                    冒险者聚集的酒馆
                </p>
                </div>
            </div>

            {/* WAITING STATE: Click to Enter */}
            {titleState === 'WAITING' && (
                <div 
                    className="absolute bottom-20 left-0 w-full text-center pointer-events-auto cursor-pointer z-50"
                    onClick={handleScreenClick}
                >
                    <span 
                        className="text-slate-300/80 font-light tracking-[0.5em] text-lg md:text-xl select-none"
                        style={{ animation: 'breath 3s infinite ease-in-out' }}
                    >
                        点击屏幕进入游戏
                    </span>
                </div>
            )}

            {/* AUTH STATE: Login/Register Modal */}
            {titleState === 'AUTH' && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto animate-fadeIn">
                    <div className="bg-slate-900/90 border border-slate-700/50 p-8 rounded-lg shadow-2xl backdrop-blur-md w-full max-w-sm">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-[#f0e6d2] tracking-wider mb-2">
                                {authMode === 'LOGIN' ? '冒险者登录' : '注册新身份'}
                            </h2>
                            <div className="h-0.5 w-12 bg-amber-500 mx-auto"></div>
                        </div>

                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="用户名 (字母/数字)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-slate-600 rounded px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                                />
                            </div>
                            
                            {authMode === 'REGISTER' && (
                                <div className="animate-fadeIn">
                                    <input
                                        type="password"
                                        placeholder="确认密码"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-slate-600 rounded px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                                    />
                                </div>
                            )}

                            {authError && (
                                <div className="text-red-400 text-xs text-center font-bold animate-pulse">
                                    {authError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded transition-colors shadow-lg mt-2"
                            >
                                {authMode === 'LOGIN' ? '登 录' : '注 册'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                                    setAuthError(null);
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                                className="text-slate-400 text-sm hover:text-amber-400 transition-colors underline underline-offset-4"
                            >
                                {authMode === 'LOGIN' ? '还没有账号？点击注册' : '已有账号？返回登录'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MENU STATE: Main Buttons */}
            {titleState === 'MENU' && (
                <div className="absolute bottom-20 right-0 flex flex-col items-end gap-1 w-[400px] md:w-[500px] pointer-events-auto animate-fadeIn">
                    <MenuButton 
                    label="开始游戏" 
                    subLabel="New Game" 
                    color="cyan"
                    onClick={onStartGame} 
                    />
                    <MenuButton 
                    label="载入进度" 
                    subLabel="Load Game" 
                    color="purple"
                    onClick={() => setIsLoadModalOpen(true)} 
                    />
                    <MenuButton 
                    label="系统设置" 
                    subLabel="Config" 
                    color="emerald"
                    onClick={onOpenConfig} 
                    />
                </div>
            )}

            {/* Bottom Footer */}
            <div className="absolute bottom-4 left-6 text-white/30 text-[10px] tracking-widest uppercase select-none pointer-events-auto">
                Powered by <a href="https://github.com/NyaaCaster/AVG-AdventurerTavern" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500/50 transition-colors"><span className="text-amber-500/50">🐈︎</span>Nyaa</a> with Google AI Studio IN 2026
            </div>
        </div>

        {/* Load Game Modal */}
        <SaveLoadModal 
            isOpen={isLoadModalOpen}
            onClose={() => setIsLoadModalOpen(false)}
            mode="load"
            allowSwitchMode={false}
            userId={currentUserId || 0} // Should be set if state is MENU
            onLoad={async (slotId) => {
                onLoadGame(slotId);
                setIsLoadModalOpen(false);
            }}
        />
    </div>
  );
};

// MenuButton Component
interface MenuButtonProps {
  label: string;
  subLabel: string;
  onClick: () => void;
  color: 'cyan' | 'purple' | 'emerald';
}

const MenuButton: React.FC<MenuButtonProps> = ({ label, subLabel, onClick, color }) => {
  // Color variants
  const colorStyles = {
    cyan: {
      border: 'group-hover:border-cyan-400/50',
      gradient: 'from-cyan-900/40',
      text: 'group-hover:text-cyan-100',
      glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]',
      line: 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
    },
    purple: {
      border: 'group-hover:border-purple-400/50',
      gradient: 'from-purple-900/40',
      text: 'group-hover:text-purple-100',
      glow: 'shadow-[0_0_15px_rgba(192,132,252,0.3)]',
      line: 'bg-gradient-to-r from-transparent via-purple-400 to-transparent'
    },
    emerald: {
      border: 'group-hover:border-emerald-400/50',
      gradient: 'from-emerald-900/40',
      text: 'group-hover:text-emerald-100',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.3)]',
      line: 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent'
    }
  };

  const style = colorStyles[color];

  return (
    <button 
      onClick={onClick}
      className={`group relative w-full h-20 overflow-hidden transition-all duration-300 ease-out hover:w-[110%] focus:outline-none`}
    >
      {/* Button Background */}
      <div className={`absolute inset-0 bg-gradient-to-l from-slate-950/90 via-slate-900/60 to-transparent transform skew-x-[-12deg] translate-x-4 border-y border-white/5 ${style.border} transition-colors duration-300`} />
      {/* Hover Glow */}
      <div className={`absolute inset-0 bg-gradient-to-l ${style.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      {/* Decorative Line */}
      <div className={`absolute top-1/2 left-0 w-full h-[1px] ${style.line} opacity-30 group-hover:opacity-80`} />
      {/* Content */}
      <div className="relative h-full flex items-center justify-end px-12 pr-16 gap-4">
        <div className="flex flex-col items-end">
          <span className={`text-2xl font-bold text-slate-100 tracking-[0.2em] transition-all duration-300 ${style.text} drop-shadow-lg`}>
            {label}
          </span>
          <span className="text-xs font-light text-slate-400 uppercase tracking-widest group-hover:tracking-[0.3em] transition-all duration-300">
            {subLabel}
          </span>
        </div>
        <div className="w-2 h-2 bg-slate-400 rotate-45 group-hover:bg-white group-hover:shadow-[0_0_10px_white] transition-all duration-300" />
      </div>
    </button>
  );
};

export default TitleScreen;
