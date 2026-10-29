import React, { useState, useEffect } from 'react';
import { GameState, GamePhase, BondedMolecule } from '../types/game';
import { PhaseCollider } from './PhaseCollider';
import { PhaseWorkbench } from './PhaseWorkbench';
import { PhaseThermal } from './PhaseThermal';
import { PhaseReact } from './PhaseReact';
import { ResourceTooltip } from './ResourceTooltip';
import { ChevronDown, ChevronUp, Atom, Network, Thermometer, Sparkles, FileText } from 'lucide-react';

interface BottomDockProps {
  gameState: GameState;
  isTutorialActive?: boolean;
  spotlightPhase?: GamePhase;
  onPlaceMeeple: (spaceId: string) => void;
  onDraftElementCard: (elementIndex: number) => void;
  onConfirmMolecule: (molecule: BondedMolecule) => void;
  onAdjustTemperature: (deltaTemp: number, costTokens: number) => void;
  onMoveMolecule: (targetRoomId: number, spentMoveCost?: number) => void;
  onSmashDebris: (roomAId: number, roomBId: number) => void;
  onNeutralizeHazard: (roomId: number, reactionDesc: string) => void;
  onFulfillContract: (contractId: string) => void;
  onEndChemistTurn: () => void;
  onTriggerRoundEscalation: () => void;
  onSetPhase: (phase: GamePhase) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  gameState,
  isTutorialActive,
  spotlightPhase,
  onPlaceMeeple,
  onDraftElementCard,
  onConfirmMolecule,
  onAdjustTemperature,
  onMoveMolecule,
  onSmashDebris,
  onNeutralizeHazard,
  onFulfillContract,
  onEndChemistTurn,
  onTriggerRoundEscalation,
  onSetPhase,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-expand if tutorial becomes active
  useEffect(() => {
    if (isTutorialActive) {
      setIsCollapsed(false);
    }
  }, [isTutorialActive]);

  // Keyboard shortcut 'H' to toggle collapsed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentPhase = gameState.phase;
  const activeChemist = gameState.chemists[gameState.activeChemistIndex];

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out w-full max-w-[1060px] px-2.5 ${
        isCollapsed ? 'bottom-2 translate-y-[calc(100%-42px)]' : 'bottom-3'
      }`}
    >
      {/* Collapse / Expand Toggle Tab */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-slate-900 border-t border-x border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-colors shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Expand Control Dock (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Collapse Dock (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div
        className={`bg-slate-900/95 border rounded-2xl p-3.5 shadow-2xl overflow-hidden transition-all duration-300 ${
          isTutorialActive
            ? 'border-cyan-400 ring-2 ring-cyan-400/80 shadow-cyan-500/20'
            : 'border-slate-700/80'
        }`}
      >
        {/* Phase Tabs & Resource Quickbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-2 mb-2 sm:mb-3 gap-2 overflow-x-auto">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => onSetPhase('collider')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
                currentPhase === 'collider'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${spotlightPhase === 'collider' ? 'ring-2 ring-amber-400' : ''}`}
            >
              <Atom className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">1. Collider & Draft</span>
              <span className="md:hidden">1. Collider</span>
              {spotlightPhase === 'collider' && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">
                  Guide
                </span>
              )}
            </button>

            <button
              onClick={() => onSetPhase('workbench')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
                currentPhase === 'workbench'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${spotlightPhase === 'workbench' ? 'ring-2 ring-amber-400' : ''}`}
            >
              <Network className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">2. Valence Workbench</span>
              <span className="md:hidden">2. Workbench</span>
              {spotlightPhase === 'workbench' && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">
                  Guide
                </span>
              )}
            </button>

            <button
              onClick={() => onSetPhase('thermal')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
                currentPhase === 'thermal'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${spotlightPhase === 'thermal' ? 'ring-2 ring-amber-400' : ''}`}
            >
              <Thermometer className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">3. Thermal Pipeline</span>
              <span className="md:hidden">3. Thermal</span>
              {spotlightPhase === 'thermal' && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">
                  Guide
                </span>
              )}
            </button>

            <button
              onClick={() => onSetPhase('react')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
                currentPhase === 'react'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
              } ${spotlightPhase === 'react' ? 'ring-2 ring-amber-400' : ''}`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline">4. Neutralize & React</span>
              <span className="md:hidden">4. React</span>
              {spotlightPhase === 'react' && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black uppercase">
                  Guide
                </span>
              )}
            </button>
          </div>

          {/* Active Chemist Subatomic Resources with Interactive Tooltips */}
          <div className="flex items-center gap-2 sm:gap-2.5 bg-slate-950/80 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] sm:text-xs shrink-0 overflow-x-auto max-w-full">
            <span className="text-[10px] text-slate-400 font-bold uppercase hidden lg:inline">
              {activeChemist.name.split(' ')[1]}'s Stock:
            </span>
            <ResourceTooltip type="protons" amount={activeChemist.protons} />
            <ResourceTooltip type="electrons" amount={activeChemist.electrons} />
            <ResourceTooltip type="coreTokens" amount={activeChemist.coreTokens} />
            <ResourceTooltip type="thermalTokens" amount={activeChemist.thermalTokens} />
            <div className="border-l border-slate-700 pl-1.5 sm:pl-2">
              <ResourceTooltip type="meeples" amount={`${activeChemist.meeplesAvailable}/2`} />
            </div>
          </div>
        </div>

        {/* Active Phase Content with mobile scroll constraint */}
        <div className="max-h-[58vh] sm:max-h-[66vh] overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-slate-700">
          {currentPhase === 'collider' && (
            <PhaseCollider
              gameState={gameState}
              onPlaceMeeple={onPlaceMeeple}
              onDraftElementCard={onDraftElementCard}
              onProceedToWorkbench={() => onSetPhase('workbench')}
            />
          )}

          {currentPhase === 'workbench' && (
            <PhaseWorkbench
              gameState={gameState}
              onConfirmMolecule={(mol) => {
                onConfirmMolecule(mol);
                onSetPhase('thermal');
              }}
              onBackToCollider={() => onSetPhase('collider')}
            />
          )}

          {currentPhase === 'thermal' && (
            <PhaseThermal
              gameState={gameState}
              onAdjustTemperature={onAdjustTemperature}
              onMoveMolecule={onMoveMolecule}
              onSmashDebris={onSmashDebris}
              onProceedToReact={() => onSetPhase('react')}
            />
          )}

          {currentPhase === 'react' && (
            <PhaseReact
              gameState={gameState}
              onNeutralizeHazard={onNeutralizeHazard}
              onFulfillContract={onFulfillContract}
              onEndChemistTurn={onEndChemistTurn}
              onTriggerRoundEscalation={onTriggerRoundEscalation}
            />
          )}
        </div>
      </div>
    </div>
  );
};
