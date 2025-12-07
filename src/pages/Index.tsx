import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type GameState = 'waiting' | 'flying' | 'crashed';

interface Point {
  x: number;
  y: number;
}

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [pathPoints, setPathPoints] = useState<Point[]>([{ x: 0, y: 100 }]);
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 100 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (gameState === 'flying') {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 50;
        
        setMultiplier(prev => {
          const increase = Math.random() * 0.08 + 0.02;
          const newMultiplier = prev + increase;
          
          if (Math.random() < 0.015 || newMultiplier > 15) {
            setGameState('crashed');
            cancelAnimationFrame(animationRef.current!);
            
            setTimeout(() => {
              setGameState('waiting');
              setMultiplier(1.0);
              setPathPoints([{ x: 0, y: 100 }]);
              setRocketPosition({ x: 0, y: 100 });
            }, 2500);
            
            return newMultiplier;
          }
          
          const newX = progress * 2;
          const newY = 100 - (newMultiplier - 1) * 15 - Math.sin(progress * 0.1) * 5;
          
          setPathPoints(prev => [...prev, { x: newX, y: newY }]);
          setRocketPosition({ x: newX, y: newY });
          
          return newMultiplier;
        });
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState]);

  const handleStart = () => {
    if (gameState === 'waiting') {
      setGameState('flying');
      toast.success('Полетели! 🚀');
    } else if (gameState === 'flying') {
      toast.success(`Вывод на ${multiplier.toFixed(2)}x! 💰`);
      setGameState('crashed');
      cancelAnimationFrame(animationRef.current!);
      
      setTimeout(() => {
        setGameState('waiting');
        setMultiplier(1.0);
        setPathPoints([{ x: 0, y: 100 }]);
        setRocketPosition({ x: 0, y: 100 });
      }, 2500);
    }
  };

  const generatePath = () => {
    if (pathPoints.length < 2) return '';
    
    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const prev = pathPoints[i - 1];
      const curr = pathPoints[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${cpX} ${prev.y} ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  return (
    <div className="min-h-screen bg-[#0a0118] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a3e] via-[#0a0118] to-[#0a0118]" />
      
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="text-4xl">✈️</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6940ff] to-[#a384ff] bg-clip-text text-transparent">
              Lucky Jet
            </h1>
          </div>
        </header>

        <div className="relative h-[600px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#1a0f3e]/50 to-[#0f0620]/50 backdrop-blur-xl border border-[#6940ff]/20 shadow-[0_0_50px_rgba(105,64,255,0.3)]">
          <div ref={canvasRef} className="absolute inset-0">
            <svg 
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 800 600"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#6940ff" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#835bff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a384ff" stopOpacity="0.5" />
                </linearGradient>
                
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <radialGradient id="rocketGlow">
                  <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#a384ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6940ff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {pathPoints.length > 1 && (
                <>
                  <path
                    d={`${generatePath()} L ${pathPoints[pathPoints.length - 1].x} 600 L 0 600 Z`}
                    fill="url(#pathGradient)"
                  />
                  
                  <path
                    d={generatePath()}
                    fill="none"
                    stroke="#6940ff"
                    strokeWidth="4"
                    filter="url(#glow)"
                    strokeLinecap="round"
                  />
                  
                  <path
                    d={generatePath()}
                    fill="none"
                    stroke="#a384ff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </>
              )}

              {gameState === 'flying' && (
                <>
                  <circle
                    cx={rocketPosition.x}
                    cy={rocketPosition.y}
                    r="40"
                    fill="url(#rocketGlow)"
                    className="animate-pulse"
                  />
                  
                  <g transform={`translate(${rocketPosition.x}, ${rocketPosition.y})`}>
                    <circle
                      r="8"
                      fill="#fff"
                      filter="url(#glow)"
                    />
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fontSize="20"
                      fill="#fff"
                    >
                      ✈️
                    </text>
                  </g>
                </>
              )}
            </svg>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className={`text-center transition-all duration-300 ${
              gameState === 'flying' ? 'scale-110' : 'scale-100'
            }`}>
              <div className={`text-8xl font-black mb-4 transition-all duration-200 ${
                gameState === 'flying' ? 'text-[#a384ff] drop-shadow-[0_0_30px_rgba(163,132,255,0.8)]' : 
                gameState === 'crashed' ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]' : 
                'text-white/50'
              }`}>
                {multiplier.toFixed(2)}x
              </div>
              
              {gameState === 'waiting' && (
                <div className="text-xl text-white/60 animate-pulse">
                  Нажмите кнопку для старта
                </div>
              )}
              
              {gameState === 'crashed' && (
                <div className="text-2xl font-bold text-red-400 animate-bounce">
                  Самолёт улетел! 💥
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0118] to-transparent pointer-events-none" />
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleStart}
            disabled={gameState === 'crashed'}
            size="lg"
            className={`
              text-xl font-bold px-16 py-8 rounded-2xl transition-all duration-300 transform hover:scale-105
              ${gameState === 'waiting' 
                ? 'bg-gradient-to-r from-[#6940ff] to-[#835bff] hover:from-[#7b4bff] hover:to-[#9365ff] shadow-[0_0_40px_rgba(105,64,255,0.6)] animate-pulse-glow' 
                : gameState === 'flying'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-[0_0_40px_rgba(249,115,22,0.6)]'
                : 'bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {gameState === 'waiting' && '🚀 ПОЛУЧИТЬ СИГНАЛ'}
            {gameState === 'flying' && `💰 ЗАБРАТЬ ${multiplier.toFixed(2)}x`}
            {gameState === 'crashed' && '⏳ ОЖИДАНИЕ...'}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
