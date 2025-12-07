import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type GameState = 'waiting' | 'flying' | 'crashed';

interface HistoryRound {
  id: number;
  multiplier: number;
  time: string;
}

interface LeaderboardPlayer {
  name: string;
  win: number;
  avatar: string;
}

export default function Index() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [multiplier, setMultiplier] = useState(1.0);
  const [betAmount, setBetAmount] = useState(100);
  const [balance, setBalance] = useState(10000);
  const [currentBet, setCurrentBet] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('game');
  
  const [history, setHistory] = useState<HistoryRound[]>([
    { id: 1, multiplier: 2.45, time: '14:23' },
    { id: 2, multiplier: 1.23, time: '14:22' },
    { id: 3, multiplier: 5.67, time: '14:21' },
    { id: 4, multiplier: 1.89, time: '14:20' },
    { id: 5, multiplier: 3.12, time: '14:19' },
  ]);

  const leaderboard: LeaderboardPlayer[] = [
    { name: 'Игрок_123', win: 45600, avatar: '🏆' },
    { name: 'ProGamer', win: 38900, avatar: '💎' },
    { name: 'LuckyWin', win: 32400, avatar: '🎯' },
    { name: 'MegaBet', win: 28700, avatar: '⭐' },
    { name: 'TopPlayer', win: 24500, avatar: '🔥' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'flying') {
      interval = setInterval(() => {
        setMultiplier(prev => {
          const increase = Math.random() * 0.1;
          const newMultiplier = prev + increase;
          
          if (Math.random() < 0.02 || newMultiplier > 10) {
            setGameState('crashed');
            if (currentBet) {
              toast.error(`Самолёт улетел на ${newMultiplier.toFixed(2)}x!`);
            }
            setTimeout(() => {
              setHistory(prev => [
                { id: Date.now(), multiplier: newMultiplier, time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) },
                ...prev.slice(0, 9)
              ]);
              setGameState('waiting');
              setMultiplier(1.0);
              setCurrentBet(null);
            }, 2000);
            return newMultiplier;
          }
          
          return newMultiplier;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [gameState, currentBet]);

  const handleBet = () => {
    if (betAmount > balance) {
      toast.error('Недостаточно средств!');
      return;
    }
    
    if (gameState === 'waiting') {
      setBalance(prev => prev - betAmount);
      setCurrentBet(betAmount);
      setGameState('flying');
      toast.success(`Ставка ${betAmount}₽ принята!`);
    }
  };

  const handleCashout = () => {
    if (currentBet && gameState === 'flying') {
      const win = Math.floor(currentBet * multiplier);
      setBalance(prev => prev + win);
      toast.success(`Выигрыш: ${win}₽ (${multiplier.toFixed(2)}x)`);
      setCurrentBet(null);
      setGameState('waiting');
      setMultiplier(1.0);
    }
  };

  const quickBets = [100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-float">✈️</div>
            <h1 className="text-2xl font-bold text-gradient">Lucky Jet</h1>
          </div>
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 bg-gradient-primary border-0">
              <div className="flex items-center gap-2">
                <Icon name="Wallet" size={20} />
                <span className="font-bold">{balance.toLocaleString()}₽</span>
              </div>
            </Card>
            <Button variant="outline" size="icon">
              <Icon name="User" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 bg-card">
            <TabsTrigger value="game">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Игра
            </TabsTrigger>
            <TabsTrigger value="history">
              <Icon name="History" size={18} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="profile">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Icon name="Trophy" size={18} className="mr-2" />
              Топ
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Правила
            </TabsTrigger>
          </TabsList>

          <TabsContent value="game" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="relative overflow-hidden min-h-[500px] gradient-game border-primary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-center transition-all duration-300 ${gameState === 'flying' ? 'scale-110' : 'scale-100'}`}>
                      <div className={`text-9xl mb-6 ${gameState === 'flying' ? 'animate-float' : ''}`}>
                        ✈️
                      </div>
                      <div className={`text-7xl font-bold mb-4 ${
                        gameState === 'flying' ? 'text-primary animate-pulse' : 
                        gameState === 'crashed' ? 'text-destructive' : 
                        'text-muted-foreground'
                      }`}>
                        {multiplier.toFixed(2)}x
                      </div>
                      <div className="text-xl text-muted-foreground">
                        {gameState === 'waiting' && 'Ожидание раунда...'}
                        {gameState === 'flying' && currentBet && `Ваша ставка: ${currentBet}₽`}
                        {gameState === 'crashed' && 'Самолёт улетел!'}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-4 bg-card/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Coins" size={24} className="text-accent" />
                    <h3 className="text-xl font-bold">Сделать ставку</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Сумма ставки</label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="text-lg font-bold bg-muted"
                        disabled={currentBet !== null}
                      />
                      <span className="flex items-center text-2xl font-bold">₽</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {quickBets.map(amount => (
                      <Button 
                        key={amount}
                        variant="outline"
                        onClick={() => setBetAmount(amount)}
                        disabled={currentBet !== null}
                        className="font-semibold"
                      >
                        {amount}₽
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-3">
                    <Button 
                      size="lg"
                      onClick={handleBet}
                      disabled={gameState !== 'waiting' || currentBet !== null}
                      className="gradient-primary text-white font-bold text-lg h-14 animate-pulse-glow"
                    >
                      <Icon name="Rocket" size={20} className="mr-2" />
                      Ставка
                    </Button>
                    <Button 
                      size="lg"
                      variant="destructive"
                      onClick={handleCashout}
                      disabled={!currentBet || gameState !== 'flying'}
                      className="font-bold text-lg h-14"
                    >
                      <Icon name="ArrowDown" size={20} className="mr-2" />
                      Забрать
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-4 bg-card/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="History" size={20} className="text-secondary" />
                    <h3 className="font-bold">История раундов</h3>
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {history.map(round => (
                      <div 
                        key={round.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                      >
                        <span className={`font-bold text-lg ${
                          round.multiplier >= 2 ? 'text-accent' : 
                          round.multiplier >= 1.5 ? 'text-secondary' : 
                          'text-muted-foreground'
                        }`}>
                          {round.multiplier.toFixed(2)}x
                        </span>
                        <span className="text-sm text-muted-foreground">{round.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="History" size={28} className="text-secondary" />
                История игр
              </h2>
              <div className="space-y-3">
                {history.map(round => (
                  <div 
                    key={round.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/70 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">✈️</div>
                      <div>
                        <div className={`text-2xl font-bold ${
                          round.multiplier >= 2 ? 'text-accent' : 
                          round.multiplier >= 1.5 ? 'text-secondary' : 
                          'text-muted-foreground'
                        }`}>
                          {round.multiplier.toFixed(2)}x
                        </div>
                        <div className="text-sm text-muted-foreground">{round.time}</div>
                      </div>
                    </div>
                    <Icon name="TrendingUp" size={24} className="text-primary" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-8 max-w-2xl mx-auto">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center text-5xl">
                  👤
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Игрок_1234</h2>
                  <p className="text-muted-foreground">Премиум аккаунт</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="p-6 rounded-xl bg-gradient-game border border-primary/20">
                    <Icon name="Wallet" size={32} className="mx-auto mb-2 text-accent" />
                    <div className="text-3xl font-bold">{balance.toLocaleString()}₽</div>
                    <div className="text-sm text-muted-foreground mt-1">Баланс</div>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-game border border-secondary/20">
                    <Icon name="TrendingUp" size={32} className="mx-auto mb-2 text-secondary" />
                    <div className="text-3xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground mt-1">Игр сыграно</div>
                  </div>
                </div>

                <Button size="lg" className="w-full gradient-primary text-white font-bold">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Пополнить баланс
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card className="p-6 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Trophy" size={28} className="text-accent" />
                Топ игроков
              </h2>
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <div 
                    key={player.name}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted hover:bg-muted/70 transition-all"
                  >
                    <div className={`text-2xl font-bold w-8 ${
                      index === 0 ? 'text-accent' : 
                      index === 1 ? 'text-secondary' : 
                      index === 2 ? 'text-primary' : 
                      'text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="text-3xl">{player.avatar}</div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{player.name}</div>
                      <div className="text-accent font-semibold">{player.win.toLocaleString()}₽</div>
                    </div>
                    {index < 3 && <Icon name="Award" size={24} className="text-accent" />}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card className="p-8 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Icon name="BookOpen" size={32} className="text-primary" />
                Правила игры
              </h2>
              <div className="space-y-6 text-lg leading-relaxed">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-secondary">Как играть?</h3>
                  <p className="text-muted-foreground">
                    Lucky Jet — это игра на удачу с растущим коэффициентом. Сделайте ставку и заберите выигрыш до того, как самолёт улетит!
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-secondary">Механика игры</h3>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    <li>Сделайте ставку перед началом раунда</li>
                    <li>Следите за растущим коэффициентом</li>
                    <li>Нажмите "Забрать" чтобы зафиксировать выигрыш</li>
                    <li>Если самолёт улетит - ставка сгорает</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2 text-secondary">Выигрыш</h3>
                  <p className="text-muted-foreground">
                    Ваш выигрыш = Ставка × Коэффициент в момент вывода
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-gradient-game border border-accent/20">
                  <div className="flex items-start gap-3">
                    <Icon name="Lightbulb" size={24} className="text-accent mt-1" />
                    <div>
                      <h4 className="font-bold mb-1">Совет</h4>
                      <p className="text-sm text-muted-foreground">
                        Не гонитесь за большими коэффициентами! Лучше чаще забирать небольшие выигрыши, чем рисковать всё.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/50 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Button variant="ghost" size="sm">
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Поддержка
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Mail" size={18} className="mr-2" />
              Контакты
            </Button>
          </div>
          <p className="text-sm">Lucky Jet © 2024 | Играйте ответственно</p>
        </div>
      </footer>
    </div>
  );
}
