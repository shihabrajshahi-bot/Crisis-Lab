import React from 'react';
import { GameState, SynthesisContract } from '../types/game';
import { X, Award, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: SynthesisContract[];
  gameState: GameState;
}

export const ContractsModal: React.FC<ContractsModalProps> = ({
  isOpen,
  onClose,
  contracts,
  gameState,
}) => {
  if (!isOpen) return null;

  const fulfilledCount = contracts.filter((c) => c.fulfilled).length;
  const level3Hazards = gameState.facilityRooms.filter((r) => r.hazard?.level === 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Major Synthesis Contracts (Extraction Vault)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Victory Progress Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 block">
                Victory Milestone: Fulfill 3 of 4 Major Contracts
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Completed: <strong className="text-amber-400">{fulfilledCount} / 3</strong> needed
                • Level-3 Spills Remaining:{' '}
                <strong className={level3Hazards.length > 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {level3Hazards.length}
                </strong>
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx < fulfilledCount
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Contracts List */}
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  contract.fulfilled
                    ? 'bg-emerald-950/20 border-emerald-700/80'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{contract.title}</h4>
                      {contract.fulfilled ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          Fulfilled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 uppercase">
                          <Clock className="w-3 h-3" />
                          Pending Delivery
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-cyan-300 font-mono mt-0.5">
                      Required Delivery: <strong>{contract.targetName}</strong> ({contract.targetFormula})
                      {contract.requiredState && ` in ${contract.requiredState.toUpperCase()} state`}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 italic">{contract.lore}</p>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-amber-400/90 font-medium">Reward: {contract.rewardText}</span>
                  <span className="text-slate-500 font-mono">Deliver to: Extraction Vault (Room #2)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Level 3 Hazard Alert */}
          {level3Hazards.length > 0 && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-center gap-2.5 text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <strong className="block text-xs font-bold text-red-300">
                  Critical Level-3 Hazards Active ({level3Hazards.length})
                </strong>
                <span className="text-[11px] text-red-300/80">
                  The facility cannot be stabilized until all Level-3 spills are eliminated by neutralization reactions!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
