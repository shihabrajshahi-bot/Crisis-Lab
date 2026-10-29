import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types/game';
import { sounds } from '../utils/audio';
import { Trophy, Skull, RefreshCw, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  status: 'won' | 'lost';
  winReason?: string;
  lossReason?: string;
  gameState: GameState;
  onRestartGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  winReason,
  lossReason,
  gameState,
  onRestartGame,
}) => {
  useEffect(() => {
    if (status === 'won') {
      sounds.playVictoryFanfare();
      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);
    } else {
      sounds.playAlarm();
    }
  }, [status]);

  const isWon = status === 'won';
  const fulfilledCount = gameState.contracts.filter((c) => c.fulfilled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 text-center shadow-2xl relative overflow-hidden ${
          isWon
            ? 'bg-slate-900 border-amber-500/80 shadow-amber-500/10'
            : 'bg-slate-950 border-red-600/80 shadow-red-500/20'
        }`}
      >
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isWon ? 'bg-amber-400' : 'bg-red-600'
          }`}
        />

        {/* Hero Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg mx-auto">
          {isWon ? (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/80 flex items-center justify-center text-amber-300">
              <Trophy className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/80 flex items-center justify-center text-red-400">
              <Skull className="w-9 h-9" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black uppercase tracking-wider text-white">
          {isWon ? 'Facility Stabilized!' : 'Facility Meltdown!'}
        </h2>

        <p className="text-sm font-semibold mt-1 mb-4 text-cyan-300">
          {isWon ? 'Mission Accomplished, Chief Chemists.' : 'Critical Containment Failure.'}
        </p>

        <p className="text-xs text-slate-300 mb-6 bg-slate-900/80 border border-slate-800 rounded-xl p-3 leading-relaxed">
          {isWon
            ? winReason ||
              'Your team successfully synthesized and delivered 3 Major Contracts to the Extraction Vault and eliminated all critical hazard spills from the facility!'
            : lossReason ||
              'Facility Toxicity reached 10 or the Element Market deck depleted before stabilization.'}
        </p>

        {/* Mission Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs mb-6 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Rounds Survived</span>
            <span className="font-mono text-base font-bold text-white">{gameState.round}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Contracts Fulfilled</span>
            <span className="font-mono text-base font-bold text-amber-400">
              {fulfilledCount} / 3
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Final Toxicity</span>
            <span
              className={`font-mono text-base font-bold ${
                gameState.toxicityTrack >= 10 ? 'text-red-400' : 'text-cyan-300'
              }`}
            >
              {gameState.toxicityTrack} / 10
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestartGame}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
            isWon
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Deploy Another Crisis Team</span>
        </button>
      </div>
    </div>
  );
};
