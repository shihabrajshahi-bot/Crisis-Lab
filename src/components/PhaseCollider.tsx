import React from 'react';
import { GameState, ElementType } from '../types/game';
import { ELEMENTS } from '../utils/chemistry';
import { sounds } from '../utils/audio';
import { Atom, Zap, Cpu, Flame, Layers, PlusCircle, ArrowRight, Check } from 'lucide-react';

import { ResourceTooltip } from './ResourceTooltip';

interface PhaseColliderProps {
  gameState: GameState;
  onPlaceMeeple: (spaceId: string) => void;
  onDraftElementCard: (elementIndex: number) => void;
  onProceedToWorkbench: () => void;
}

export const PhaseCollider: React.FC<PhaseColliderProps> = ({
  gameState,
  onPlaceMeeple,
  onDraftElementCard,
  onProceedToWorkbench,
}) => {
  const activeChemist = gameState.chemists[gameState.activeChemistIndex];

  return (
    <div className="space-y-3">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeChemist.color }}
          />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Phase 1: Particle Collider & Element Market
          </h2>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            {activeChemist.name} ({activeChemist.specialty})
          </span>
        </div>

        {/* Chemist Resources Bar with Interactive Tooltips */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <ResourceTooltip type="protons" amount={activeChemist.protons} />
          <ResourceTooltip type="electrons" amount={activeChemist.electrons} />
          <ResourceTooltip type="coreTokens" amount={activeChemist.coreTokens} />
          <ResourceTooltip type="thermalTokens" amount={activeChemist.thermalTokens} />
          <div className="border-l border-slate-700 pl-2">
            <ResourceTooltip type="meeples" amount={`${activeChemist.meeplesAvailable} / 2`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Particle Collider Action Docks (6 spaces) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Particle Collider Action Spaces
            </span>
            <span className="text-[11px] text-slate-400">
              {activeChemist.meeplesAvailable > 0
                ? 'Assign meeple to harvest subatomic particles'
                : 'All meeples deployed'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gameState.colliderSpaces.map((space) => {
              const isOccupied = !!space.occupiedByChemistId;
              const occupyingChemist = isOccupied
                ? gameState.chemists.find((c) => c.id === space.occupiedByChemistId)
                : null;
              const canPlace = !isOccupied && activeChemist.meeplesAvailable > 0;

              return (
                <button
                  key={space.id}
                  disabled={!canPlace}
                  onClick={() => {
                    onPlaceMeeple(space.id);
                    sounds.playCollider();
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all relative ${
                    isOccupied
                      ? 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                      : canPlace
                      ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 hover:bg-slate-800/80 cursor-pointer shadow-sm'
                      : 'bg-slate-900/50 border-slate-800 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{space.name}</span>
                    {occupyingChemist && (
                      <span
                        className="w-3 h-3 rounded-full border border-slate-950 shadow-xs"
                        style={{ backgroundColor: occupyingChemist.color }}
                        title={`Occupied by ${occupyingChemist.name}`}
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-cyan-300 font-semibold">{space.yieldDesc}</p>
                  {isOccupied && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      Claimed by {occupyingChemist?.name.split(' ')[1]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Face-Up Element Market Deck */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Element Market (Draft to Hand)
              </span>
              <span className="text-[11px] text-slate-400">
                Deck: {gameState.marketDeckCount} cards left
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {gameState.elementMarket.map((elementSymbol, idx) => {
                const elData = ELEMENTS[elementSymbol];
                const canAfford =
                  activeChemist.protons >= elData.cost.protons &&
                  activeChemist.electrons >= elData.cost.electrons &&
                  activeChemist.coreTokens >= elData.cost.coreTokens;

                return (
                  <button
                    key={`${elementSymbol}-${idx}`}
                    disabled={!canAfford}
                    onClick={() => {
                      onDraftElementCard(idx);
                      sounds.playCardDraft();
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      canAfford
                        ? 'bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-slate-800 shadow cursor-pointer'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-base font-black px-1.5 py-0.2 rounded"
                        style={{ backgroundColor: `${elData.color}22`, color: elData.color }}
                      >
                        {elData.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        #{elData.atomicNumber}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 truncate">{elData.name}</div>
                    {/* Cost pills */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-slate-400">
                      {elData.cost.protons > 0 && <span>{elData.cost.protons}p+</span>}
                      {elData.cost.electrons > 0 && <span>{elData.cost.electrons}e-</span>}
                      {elData.cost.coreTokens > 0 && <span>{elData.cost.coreTokens}C</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hand summary & Proceed button */}
          <div className="pt-2 border-t border-slate-800 mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Hand ({activeChemist.hand.length}):</span>
              <div className="flex items-center gap-1 flex-wrap max-w-[200px] sm:max-w-none">
                {activeChemist.hand.map((h, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black border border-slate-700 shrink-0"
                    style={{ backgroundColor: `${ELEMENTS[h]?.color}25`, color: ELEMENTS[h]?.color }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onProceedToWorkbench();
                sounds.playBondSuccess();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer ml-auto"
            >
              <span>Bond Molecules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
