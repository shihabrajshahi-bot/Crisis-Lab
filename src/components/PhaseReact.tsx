import React, { useState } from 'react';
import { GameState, SynthesisContract } from '../types/game';
import { sounds } from '../utils/audio';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowRight,
  RefreshCw,
  Skull,
  Radio,
  Flame,
} from 'lucide-react';

interface PhaseReactProps {
  gameState: GameState;
  onNeutralizeHazard: (roomId: number, reactionDesc: string) => void;
  onFulfillContract: (contractId: string) => void;
  onEndChemistTurn: () => void;
  onTriggerRoundEscalation: () => void;
}

export const PhaseReact: React.FC<PhaseReactProps> = ({
  gameState,
  onNeutralizeHazard,
  onFulfillContract,
  onEndChemistTurn,
  onTriggerRoundEscalation,
}) => {
  const activeChemist = gameState.chemists[gameState.activeChemistIndex];
  const molecule = activeChemist.currentMolecule;
  const currentRoom = gameState.facilityRooms.find(
    (r) => r.id === activeChemist.moleculePosition
  ) || gameState.facilityRooms[0];

  const [reactionLog, setReactionLog] = useState<string | null>(null);

  // Check Hazard Neutralization feasibility
  const hazard = currentRoom.hazard;
  const canNeutralize =
    hazard &&
    molecule &&
    molecule.properties.includes(hazard.requiredProperty) &&
    (!hazard.requiredState || hazard.requiredState === molecule.state);

  // Check Contract Fulfillment feasibility
  const isAtVault = currentRoom.type === 'vault';
  const eligibleContracts = gameState.contracts.filter(
    (c) =>
      !c.fulfilled &&
      molecule &&
      (c.targetFormula === molecule.formula ||
        (c.id === 'contract_1' && (molecule.formula === 'NH3' || molecule.formula === 'CH4N2O')) ||
        (c.id === 'contract_2' && molecule.formula === 'H2O' && molecule.state === 'liquid') ||
        (c.id === 'contract_3' && molecule.formula === 'CO2' && molecule.state === 'gas') ||
        (c.id === 'contract_4' && molecule.formula === 'H2O2')) &&
      (!c.requiredState || c.requiredState === molecule.state)
  );

  const handleNeutralize = () => {
    if (!hazard || !molecule) return;

    let desc = '';
    if (hazard.type === 'acid_spill') {
      desc = `Neutralized ${hazard.name} with alkaline ${molecule.name} ➜ Yielded non-toxic salt & water precipitate.`;
    } else if (hazard.type === 'plasma_fire') {
      desc = `Extinguished ${hazard.name} with ${molecule.name} in ${molecule.state.toUpperCase()} state.`;
    } else if (hazard.type === 'toxic_vapor') {
      desc = `Quenched toxic aerosol with ${molecule.name} oxidizer cloud.`;
    } else {
      desc = `Diluted and stabilized hazardous spill with ${molecule.name}.`;
    }

    setReactionLog(desc);
    sounds.playReactionNeutralize();
    onNeutralizeHazard(currentRoom.id, desc);
  };

  const handleContractFulfill = (contract: SynthesisContract) => {
    sounds.playContractDeliver();
    setReactionLog(`Vault successfully accepted delivery of ${contract.title}!`);
    onFulfillContract(contract.id);
  };

  const isLastChemistInRound =
    gameState.activeChemistIndex === gameState.chemists.length - 1;

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: activeChemist.color }}
          />
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Phase 4: Chemical Reaction & Crisis Escalation
          </h2>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Stationed at: <strong className="text-white">{currentRoom.name}</strong>
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Chemist {gameState.activeChemistIndex + 1} of {gameState.chemists.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Column: Chemical Reactions (Hazards & Vault) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Room Reaction Capabilities:
            </span>

            {/* 1. Active Hazard in room */}
            {hazard ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Hazard Alert: {hazard.name} (Level {hazard.level})</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    Needs: {hazard.requiredProperty.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{hazard.description}</p>

                <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Active Molecule: <strong className="text-cyan-300">{molecule?.formula}</strong> (
                    {molecule?.properties.join(', ')})
                  </span>

                  <button
                    onClick={handleNeutralize}
                    disabled={!canNeutralize}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Execute Neutralization Reaction</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No active hazard spill in {currentRoom.name}. Chamber containment is stable.</span>
              </div>
            )}

            {/* 2. Extraction Vault Contract Delivery */}
            {isAtVault && (
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Extraction Vault Delivery Terminal
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Target: 3 Major Contracts (Currently {gameState.contracts.filter((c) => c.fulfilled).length}/3)
                  </span>
                </div>

                {eligibleContracts.length > 0 ? (
                  <div className="space-y-1.5 mt-2">
                    {eligibleContracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-900 border border-amber-700/80"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{contract.title}</div>
                          <div className="text-[11px] text-cyan-300">
                            Deliver: {contract.targetName}
                          </div>
                        </div>
                        <button
                          onClick={() => handleContractFulfill(contract)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded shadow cursor-pointer transition-all"
                        >
                          Deliver Compound
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">
                    Your current molecule ({molecule?.formula || 'None'}) does not match any pending Major Synthesis Contracts.
                  </p>
                )}
              </div>
            )}

            {/* Reaction feedback log */}
            {reactionLog && (
              <div className="p-2 rounded bg-cyan-950/80 border border-cyan-700/80 text-xs text-cyan-200">
                ✨ {reactionLog}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Tip: Deliver molecules in the specified state of matter (Liquid or Gas) for maximum contract efficacy!
          </div>
        </div>

        {/* Right Column: Turn Advance & Crisis Escalation Trigger */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Round Progress & Crisis Watch
            </span>

            <div className="space-y-2 bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Phase:</span>
                <span className="text-cyan-300 font-bold uppercase">Phase 4 (Reaction)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Uncontained Hazards:</span>
                <span className="text-red-400 font-bold font-mono">
                  {gameState.facilityRooms.filter((r) => r.hazard).length} active spills
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Escalation Threat:</span>
                <span className="text-amber-400 font-semibold">
                  +{gameState.facilityRooms.filter((r) => r.hazard).length} Toxicity at round end
                </span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400">
              {isLastChemistInRound ? (
                <p>
                  All Chief Chemists have acted this round! Ready to trigger the{' '}
                  <strong className="text-amber-300">Facility Crisis Escalation</strong>.
                </p>
              ) : (
                <p>
                  Chemist {activeChemist.name} has finished reactions. Pass turn to next chemist in team.
                </p>
              )}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-3 border-t border-slate-800 mt-2">
            {isLastChemistInRound ? (
              <button
                onClick={() => {
                  sounds.playCrisisCardDraw();
                  onTriggerRoundEscalation();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg cursor-pointer"
              >
                <Skull className="w-4 h-4" />
                <span>Trigger Crisis Escalation & End Round</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.playChemistSwitch();
                  onEndChemistTurn();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer"
              >
                <span>Pass Turn to Next Chemist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
