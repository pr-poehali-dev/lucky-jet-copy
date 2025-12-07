import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type GameState = 'waiting' | 'flying' | 'crashed';

interface Point {
  x: number;
  y: number;
}

interface HistoryItem {
  multiplier: number;
  color: string;
}

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [pathPoints, setPathPoints] = useState<Point[]>([{ x: 0, y: 100 }]);
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 100 });
  const [betAmount1, setBetAmount1] = useState(0.2);
  const [betAmount2, setBetAmount2] = useState(0.2);
  const [balance, setBalance] = useState(10000.0);
  const [activeBet1, setActiveBet1] = useState(false);
  const [activeBet2, setActiveBet2] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [history, setHistory] = useState<HistoryItem[]>([
    { multiplier: 2.46, color: 'text-purple-400' },
    { multiplier: 3.77, color: 'text-purple-400' },
    { multiplier: 1.27, color: 'text-blue-400' },
    { multiplier: 1.68, color: 'text-blue-400' },
    { multiplier: 10.78, color: 'text-orange-500' },
    { multiplier: 1.34, color: 'text-blue-400' },
    { multiplier: 1.12, color: 'text-blue-400' },
    { multiplier: 2.06, color: 'text-purple-400' },
    { multiplier: 2.06, color: 'text-purple-400' },
    { multiplier: 2.38, color: 'text-purple-400' },
    { multiplier: 2.06, color: 'text-purple-400' },
    { multiplier: 2.06, color: 'text-purple-400' },
  ]);

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
            
            setHistory(prev => [
              { 
                multiplier: newMultiplier, 
                color: newMultiplier >= 10 ? 'text-orange-500' : newMultiplier >= 2 ? 'text-purple-400' : 'text-blue-400' 
              },
              ...prev.slice(0, 11)
            ]);
            
            setTimeout(() => {
              setGameState('waiting');
              setMultiplier(1.0);
              setPathPoints([{ x: 0, y: 100 }]);
              setRocketPosition({ x: 0, y: 100 });
              setActiveBet1(false);
              setActiveBet2(false);
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

  const handleBet = (betNum: number) => {
    const amount = betNum === 1 ? betAmount1 : betAmount2;
    
    if (gameState === 'waiting') {
      if (amount > balance) {
        toast.error('Недостаточно средств!');
        return;
      }
      
      setBalance(prev => prev - amount);
      
      if (betNum === 1) {
        setActiveBet1(true);
      } else {
        setActiveBet2(true);
      }
      
      if (!activeBet1 && !activeBet2) {
        setTimeout(() => {
          setGameState('flying');
        }, 500);
      }
      
      toast.success(`Ставка ${amount}$ принята!`);
    }
  };

  const handleCashout = (betNum: number) => {
    const amount = betNum === 1 ? betAmount1 : betAmount2;
    
    if (gameState === 'flying') {
      const win = amount * multiplier;
      setBalance(prev => prev + win);
      
      if (betNum === 1) {
        setActiveBet1(false);
      } else {
        setActiveBet2(false);
      }
      
      toast.success(`Выигрыш: ${win.toFixed(2)}$ (x${multiplier.toFixed(2)})`);
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

  const quickAmounts = [5, 25, 50, 100];

  return (
    <div className="min-h-screen bg-[#1a1525] text-white flex">
      <aside className={`bg-[#1f1a2e] border-r border-white/5 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'} flex flex-col`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          {sidebarOpen && <span className="text-2xl font-bold">1W</span>}
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icon name={sidebarOpen ? "ChevronLeft" : "ChevronRight"} size={20} />
          </Button>
        </div>

        <div className="p-3">
          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white">
            <Icon name="User" size={20} className="mr-2" />
            {sidebarOpen && 'Войти'}
          </Button>
        </div>

        <div className="p-3 bg-teal-600/20 mx-3 rounded-lg">
          <div className="flex items-center gap-2 text-teal-400">
            <Icon name="Gift" size={20} />
            {sidebarOpen && <span className="text-sm font-semibold">Free money</span>}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Button variant="ghost" className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700">
            <Icon name="Gamepad2" size={20} className="mr-2" />
            {sidebarOpen && 'Казино'}
          </Button>
          
          <details className="group">
            <summary className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer list-none">
              <Icon name="Heart" size={20} />
              {sidebarOpen && <span>Лобби</span>}
              {sidebarOpen && <Icon name="ChevronDown" size={16} className="ml-auto group-open:rotate-180 transition-transform" />}
            </summary>
          </details>

          <details className="group">
            <summary className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer list-none">
              <Icon name="Tv" size={20} />
              {sidebarOpen && <span>Live казино</span>}
              {sidebarOpen && <Icon name="ChevronDown" size={16} className="ml-auto group-open:rotate-180 transition-transform" />}
            </summary>
          </details>

          <details className="group">
            <summary className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer list-none">
              <Icon name="Zap" size={20} />
              {sidebarOpen && <span>Быстрые игры</span>}
              {sidebarOpen && <Icon name="ChevronDown" size={16} className="ml-auto group-open:rotate-180 transition-transform" />}
            </summary>
          </details>

          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white">
            <Icon name="Trophy" size={20} className="mr-2" />
            {sidebarOpen && 'Спорт'}
          </Button>

          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white relative">
            <Icon name="Gift" size={20} className="mr-2" />
            {sidebarOpen && 'Бонусы'}
            <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
          </Button>

          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white">
            <Icon name="Crown" size={20} className="mr-2" />
            {sidebarOpen && 'VIP club'}
          </Button>

          <div className="border-t border-white/5 my-3" />

          <Button variant="ghost" className="w-full justify-start text-white/60 hover:text-white">
            <Icon name="Tag" size={20} className="mr-2" />
            {sidebarOpen && 'Акции'}
          </Button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-[#1f1a2e] border-b border-white/5 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white/60">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Button>
            <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Казино
            </Button>
            <Button variant="ghost" size="sm" className="text-white/60">
              <Icon name="Gift" size={18} className="mr-2" />
              Free Money
            </Button>
            <Button variant="ghost" size="sm" className="text-white/60">
              <Icon name="Trophy" size={18} className="mr-2" />
              Спорт
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/60">Как играть?</span>
            <Button variant="outline" size="sm" className="border-white/20">
              Вход
            </Button>
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white font-bold">
              Регистрация
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#1a1525]">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2 text-white/60">
              <Icon name="ChevronLeft" size={20} />
              <span>Назад</span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-4">
                <Card className="bg-[#1f1a2e] border-purple-500/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      LUCKYJET
                    </h1>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-white/60">
                        <Icon name="Volume2" size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60">
                        <Icon name="Settings" size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60">
                        <Icon name="HelpCircle" size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60">
                        <Icon name="Tv" size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/60">
                        <Icon name="Maximize2" size={20} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <Button size="sm" className="bg-purple-600/30 text-purple-300 hover:bg-purple-600/50">
                      Все
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white/60">
                      Мои
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white/60">
                      Топ
                    </Button>
                  </div>

                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {history.map((item, i) => (
                      <div 
                        key={i}
                        className={`px-3 py-1.5 rounded-lg ${
                          item.multiplier >= 10 ? 'bg-orange-500/20 text-orange-400' :
                          item.multiplier >= 2 ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        } font-bold text-sm whitespace-nowrap`}
                      >
                        {item.multiplier.toFixed(2)}x
                      </div>
                    ))}
                    <Button size="icon" variant="ghost" className="shrink-0">
                      <Icon name="ChevronRight" size={20} />
                    </Button>
                  </div>

                  <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#2a1f47] to-[#1a1430]">
                    <div className="absolute inset-0 opacity-40">
                      {[...Array(60)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full bg-white"
                          style={{
                            width: Math.random() * 2 + 1 + 'px',
                            height: Math.random() * 2 + 1 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            animation: `twinkle ${Math.random() * 3 + 2}s infinite ${Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-48 opacity-60">
                      <svg viewBox="0 0 1200 200" className="w-full h-full">
                        <path
                          d="M 0,100 Q 150,70 300,90 T 600,80 T 900,95 T 1200,85"
                          fill="#1a1f3a"
                          opacity="0.6"
                        />
                        <path
                          d="M 0,120 Q 200,90 400,110 T 800,100 T 1200,105"
                          fill="#151a2e"
                          opacity="0.7"
                        />
                        <path
                          d="M 0,140 Q 180,120 360,135 T 720,125 T 1200,130"
                          fill="#0f1424"
                          opacity="0.8"
                        />
                      </svg>
                    </div>

                    <div ref={canvasRef} className="absolute inset-0">
                      <svg 
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 800 500"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="pathGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.3" />
                          </linearGradient>
                          
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>

                        {pathPoints.length > 1 && (
                          <>
                            <path
                              d={`${generatePath()} L ${pathPoints[pathPoints.length - 1].x} 500 L 0 500 Z`}
                              fill="url(#pathGradient)"
                            />
                            
                            <path
                              d={generatePath()}
                              fill="none"
                              stroke="#8b5cf6"
                              strokeWidth="3"
                              filter="url(#glow)"
                              strokeLinecap="round"
                            />
                          </>
                        )}
                      </svg>

                      {gameState === 'flying' && (
                        <div 
                          className="absolute transition-all duration-75"
                          style={{
                            left: `${(rocketPosition.x / 800) * 100}%`,
                            top: `${(rocketPosition.y / 500) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="relative">
                            <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl animate-pulse" />
                            <img 
                              src="https://cdn.poehali.dev/files/Screenshot_7.png" 
                              alt="Lucky"
                              className="relative w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                              style={{ 
                                clipPath: 'inset(35% 30% 10% 35%)',
                                transform: 'scale(2.5)'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className={`text-center transition-all duration-300`}>
                        {gameState === 'waiting' && (
                          <div className="flex items-center gap-3 bg-purple-900/40 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-500/30">
                            <Icon name="Clock" size={24} className="text-purple-400 animate-pulse" />
                            <span className="text-xl text-purple-300">Ожидание ставок</span>
                            <span className="text-2xl font-bold text-white">0</span>
                          </div>
                        )}
                        
                        {gameState !== 'waiting' && (
                          <div className={`text-9xl font-black mb-4 transition-all duration-200 ${
                            gameState === 'flying' ? 'text-purple-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.9)]' : 
                            'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.9)]'
                          }`}>
                            x{multiplier.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {gameState === 'crashed' && (
                      <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-4xl font-bold text-red-400 animate-bounce">
                          Улетел! 💥
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 right-4 text-white/60 text-sm">
                      {balance.toFixed(2)} $
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card className="bg-[#241d35] border-purple-500/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Button 
                          size="sm" 
                          variant={activeBet1 ? "default" : "ghost"}
                          className={activeBet1 ? "bg-purple-600" : "text-white/60"}
                        >
                          Автоставка
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-white/60"
                        >
                          Автовывод
                        </Button>
                        <span className="text-white/60">x 2.00</span>
                      </div>

                      <div className="flex items-center justify-between bg-[#1a1430] rounded-lg p-3 mb-3">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setBetAmount1(Math.max(0.1, betAmount1 - 0.1))}
                        >
                          <Icon name="Minus" size={16} />
                        </Button>
                        <div className="text-center">
                          <input 
                            type="number"
                            value={betAmount1.toFixed(1)}
                            onChange={(e) => setBetAmount1(parseFloat(e.target.value) || 0.1)}
                            className="bg-transparent text-xl font-bold w-20 text-center"
                            step="0.1"
                          />
                          <span className="text-xl font-bold ml-1">$</span>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setBetAmount1(betAmount1 + 0.1)}
                        >
                          <Icon name="Plus" size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {quickAmounts.map(amount => (
                          <Button
                            key={amount}
                            size="sm"
                            variant="ghost"
                            className="text-white/60 hover:text-white"
                            onClick={() => setBetAmount1(amount)}
                          >
                            {amount}
                          </Button>
                        ))}
                      </div>

                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-lg"
                        onClick={() => activeBet1 && gameState === 'flying' ? handleCashout(1) : handleBet(1)}
                        disabled={gameState === 'crashed'}
                      >
                        {activeBet1 && gameState === 'flying' ? 'ВЫВЕСТИ' : 'СТАВКА'}
                      </Button>
                    </Card>

                    <Card className="bg-[#241d35] border-purple-500/10 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Button 
                          size="sm" 
                          variant={activeBet2 ? "default" : "ghost"}
                          className={activeBet2 ? "bg-purple-600" : "text-white/60"}
                        >
                          Автоставка
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-white/60"
                        >
                          Автовывод
                        </Button>
                        <span className="text-white/60">x 2.00</span>
                      </div>

                      <div className="flex items-center justify-between bg-[#1a1430] rounded-lg p-3 mb-3">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setBetAmount2(Math.max(0.1, betAmount2 - 0.1))}
                        >
                          <Icon name="Minus" size={16} />
                        </Button>
                        <div className="text-center">
                          <input 
                            type="number"
                            value={betAmount2.toFixed(1)}
                            onChange={(e) => setBetAmount2(parseFloat(e.target.value) || 0.1)}
                            className="bg-transparent text-xl font-bold w-20 text-center"
                            step="0.1"
                          />
                          <span className="text-xl font-bold ml-1">$</span>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => setBetAmount2(betAmount2 + 0.1)}
                        >
                          <Icon name="Plus" size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {quickAmounts.map(amount => (
                          <Button
                            key={amount}
                            size="sm"
                            variant="ghost"
                            className="text-white/60 hover:text-white"
                            onClick={() => setBetAmount2(amount)}
                          >
                            {amount}
                          </Button>
                        ))}
                      </div>

                      <Button 
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-lg"
                        onClick={() => activeBet2 && gameState === 'flying' ? handleCashout(2) : handleBet(2)}
                        disabled={gameState === 'crashed'}
                      >
                        {activeBet2 && gameState === 'flying' ? 'ВЫВЕСТИ' : 'СТАВКА'}
                      </Button>
                    </Card>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="bg-[#1f1a2e] border-purple-500/20 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon name="TrendingUp" size={20} className="text-orange-500" />
                      <span className="font-bold">5</span>
                      <span className="text-white/60 text-sm">игроков онлайн</span>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Icon name="ChevronRight" size={20} />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-purple-900/20 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm">
                        EB
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">Евгения</div>
                        <div className="text-xs text-purple-400">2.10x</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/60">ASsLab</div>
                        <div className="text-sm font-bold text-green-400">x2.27</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-white/60">Максимум:</div>
                        <div className="text-purple-400 font-bold">2.10x</div>
                        <div className="text-xs text-white/40">x2.27</div>
                      </div>
                      
                      <div className="bg-purple-900/20 rounded p-2">
                        <div className="text-xs text-white/60">Ставка:</div>
                        <div className="text-lg font-bold">627.65 $</div>
                      </div>

                      <div className="bg-purple-900/20 rounded p-2">
                        <div className="text-xs text-white/60">Выигрыш:</div>
                        <div className="text-lg font-bold text-green-400">1.31K $</div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center text-xs">
                          D1
                        </div>
                        <span className="text-sm">d1c0bc</span>
                      </div>

                      <div className="bg-[#1a1430] rounded-lg overflow-hidden">
                        <img 
                          src="https://cdn.poehali.dev/files/Screenshot_7.png"
                          alt="Game"
                          className="w-full h-32 object-cover opacity-60"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs">
                          MM
                        </div>
                        <span className="text-sm">Миша</span>
                        <span className="text-xs text-green-400">Есть русские</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-[#1f1a2e] border-purple-500/20 p-4">
                  <div className="text-sm text-white/60 mb-2">Сообщение</div>
                  <textarea 
                    className="w-full bg-[#1a1430] rounded-lg p-3 text-sm resize-none"
                    rows={3}
                    placeholder="Введите сообщение..."
                  />
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
