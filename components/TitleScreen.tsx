
import React, { useState, useEffect, useRef } from 'react';
import { resolveImgPath } from '../utils/imagePath';
import { GAME_VERSION } from '../version';

interface TitleScreenProps {
  onStartGame: () => void;
  onLoadGame: () => void;
  onOpenConfig: () => void;
  volume: number;
  isMuted: boolean;
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

const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, onLoadGame, onOpenConfig, volume, isMuted }) => {
  const [showVideo, setShowVideo] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    // 初始化随机背景索引
    setCurrentIndex(Math.floor(Math.random() * TITLE_BG_IMAGES.length));
  }, []);

  useEffect(() => {
    // 只有当视频结束（不再显示）时才开始幻灯片计时
    if (showVideo) return;

    const interval = setInterval(() => {
        setCurrentIndex(prev => {
            let next;
            // 确保下一个图片不与当前相同（除非只有一张）
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

  // --- Particle Effect Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // 调整粒子数量和颜色，营造“炉火余烬”或“光尘”的氛围
    const PARTICLE_COUNT = 60; 
    const COLORS = ['rgba(251, 191, 36, ', 'rgba(252, 211, 77, ', 'rgba(255, 255, 255, ']; // Amber-400, Amber-300, White

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
        this.size = Math.random() * 2 + 0.5; // 0.5 ~ 2.5px
        this.speedY = Math.random() * 0.4 + 0.1; // 缓慢向上
        this.speedX = Math.random() * 0.4 - 0.2; // 轻微左右漂移
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
        
        // 简单的淡入淡出逻辑（正弦波模拟闪烁）
        // 这里简化为生命周期结束重置
        if (this.y < -10) {
           this.reset();
        }
        
        // 简单的闪烁效果
        if (Math.random() > 0.98) {
            this.opacity = Math.min(0.8, this.opacity + 0.05);
        } else {
             this.opacity = Math.max(0.1, this.opacity - 0.002);
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorBase + this.opacity + ')';
        
        // 添加轻微发光效果
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.colorBase + '0.5)';
        
        ctx.fill();
        ctx.shadowBlur = 0; // 重置以避免性能问题
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

        {/* CSS Animation Keyframes for Ken Burns Effect */}
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
        `}</style>

        {/* Background Layers Container */}
        <div className="absolute inset-0 z-0">
            {/* 0. Video Layer (Intro) */}
            <div 
                className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
                    showVideo ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
                {/* 即使 video 标签被隐藏，只要不销毁，淡出效果就会自然显示 */}
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
                            // 给每张图片设置稍微不同的动画时长，错开节奏
                            animation: `kenburns ${25 + (index % 3) * 5}s ease-in-out infinite alternate` 
                        }}
                        onError={(e) => {
                            console.error("Failed to load image:", resolveImgPath(src));
                        }}
                    />
                </div>
            ))}

            {/* 2. Particles (Layer 15) - Between images and overlay */}
            <canvas 
                ref={canvasRef}
                className="absolute inset-0 z-[15] pointer-events-none opacity-80"
            />

            {/* 3. Cinematic Overlay (Layer 20) - On top of everything */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-black/60 z-20 pointer-events-none mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-20 pointer-events-none" />
        </div>

        {/* Main Content */}
        <div className="relative z-30 w-full h-full pointer-events-none">
            
            {/* Music Toggle Button (Top Right) */}
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
                
                {/* Visual indicator of playing state */}
                {isPlaying && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-amber-500/10 pointer-events-none"></span>
                )}
              </button>
            </div>

            {/* Top Left Title Area */}
            <div className="absolute top-12 left-12 md:top-20 md:left-24 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] pointer-events-auto">
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

            {/* Right Side Menu Buttons */}
            <div className="absolute bottom-20 right-0 flex flex-col items-end gap-1 w-[400px] md:w-[500px] pointer-events-auto">
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
                onClick={onLoadGame} 
                />
                <MenuButton 
                label="系统设置" 
                subLabel="Config" 
                color="emerald"
                onClick={onOpenConfig} 
                />
            </div>

            {/* Bottom Footer */}
            <div className="absolute bottom-4 left-6 text-white/30 text-[10px] tracking-widest uppercase select-none pointer-events-auto">
                Powered by <a href="https://github.com/NyaaCaster/AVG-AdventurerTavern" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500/50 transition-colors"><span className="text-amber-500/50">🐈︎</span>Nyaa</a> with Google AI Studio IN 2026
            </div>
        </div>
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
