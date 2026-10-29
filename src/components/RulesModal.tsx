import React from 'react';
import { X, BookOpen, Atom, Network, Thermometer, Sparkles, AlertOctagon, Trophy } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              Catalyst: Crisis Lab — Field Manual & Protocol
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-slate-300 text-xs leading-relaxed">
          {/* Section 1: Objectives */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              1. The Core Objective
            </h3>
            <p>
              <strong className="text-emerald-400">To Win:</strong> Your team must successfully
              fulfill <strong>3 Major Synthesis Contracts</strong> (complex chemical compounds delivered
              to the Extraction Vault) and clear all active <strong>Level-3 Hazard Spills</strong> from
              the facility map.
            </p>
            <p>
              <strong className="text-red-400">To Lose:</strong> The game is lost if the{' '}
              <strong>Facility Toxicity Track reaches 10</strong> (Reactor Meltdown) or if the{' '}
              <strong>Element Market deck runs out</strong> before the facility is stabilized.
            </p>
          </div>

          {/* Section 2: Four Phases */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-300">
              2. The 4-Phase Turn Sequence
            </h3>

            {/* Phase 1 */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Atom className="w-4 h-4 text-sky-400" />
                <span>Phase 1: Harvest & Draft (The Particle Collider)</span>
              </div>
              <p>
                Place your 2 Scientist meeples on Particle Collider action spaces to harvest
                subatomic particles: <strong>Protons (p+)</strong>, <strong>Electrons (e-)</strong>,{' '}
                <strong>Core Tokens</strong>, and <strong>Thermal Energy</strong>. Spend these harvested
                tokens to pay the Collider Cost of face-up Element Cards in the market, adding them straight
                to your hand.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Phase 2: Bond Molecules (The Valence Workbench)</span>
              </div>
              <p>
                Place atom tiles from your hand onto your personal <strong>7-Hex Workbench</strong>.
                Connect prongs between adjacent tiles (Single, Double, or Triple bonds).
              </p>
              <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 my-1 text-[11px] font-mono text-cyan-200">
                • Hydrogen (H): 1 bond (Duet Rule)<br />
                • Oxygen (O): 2 bonds (Single or Double)<br />
                • Nitrogen (N): 3 bonds<br />
                • Carbon (C): 4 bonds (Backbone)<br />
                • Sodium (Na) / Chlorine (Cl): 1 bond<br />
                <span className="text-amber-300 font-bold">
                  Rule: A molecule is only legal if every open valence prong connects to an adjacent tile
                  with ZERO loose ends!
                </span>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span>Phase 3: Navigate the Thermal Pipeline (State & Movement)</span>
              </div>
              <p>
                Spend Thermal Energy tokens (each token shifts temp by ±50°C) to alter your molecule’s
                state relative to its melting and boiling points:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-blue-950/60 border border-blue-800">
                  <strong className="text-sky-300 block mb-0.5">🧊 Solid State</strong>
                  Moves 1 space. Smashes physical debris blocking corridors!
                </div>
                <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800">
                  <strong className="text-cyan-300 block mb-0.5">💧 Liquid State</strong>
                  Moves up to 2 spaces. Flows through doors and drainage pipes.
                </div>
                <div className="p-2 rounded bg-amber-950/60 border border-amber-800">
                  <strong className="text-amber-300 block mb-0.5">💨 Gas State</strong>
                  Moves up to 4 spaces through doors, pipes, and HVAC air vents!
                </div>
              </div>
            </div>

            {/* Phase 4 */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Phase 4: Neutralize Hazards & Escalation</span>
              </div>
              <p>
                <strong>React:</strong> When your molecule enters a chamber with an active hazard,
                execute a chemical reaction (e.g. neutralizing an acid spill with an alkaline base like
                Ammonia or NaOH, or quenching a plasma fire with CO2 gas / Liquid Water).
              </p>
              <p>
                <strong>Deliver Contracts:</strong> Deliver target compounds to the Extraction Vault to
                secure victory contracts.
              </p>
              <p>
                <strong>Escalation:</strong> Draw a Crisis Card at the end of each round. Advance the
                Toxicity Track by <strong>+1 for every uncontained hazard</strong> remaining on the map!
              </p>
            </div>
          </div>

          {/* Section 3: Synthesis Cheat Sheet */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-cyan-400" />
              Key Molecular Recipes & Properties
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300">Water (H₂O)</strong>: 2 H + 1 O. Liquid at room temp.
                Quenches plasma fires & dilutes corrosive acid spills.
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300">Ammonia (NH₃)</strong>: 3 H + 1 N. Strong alkaline base.
                Neutralizes acid spills into harmless sal ammoniac salt.
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300">Carbon Dioxide (CO₂)</strong>: 1 C + 2 O (Double bonds).
                Inert gas blanket that suffocates superheated fires.
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <strong className="text-cyan-300">Hydrogen Peroxide (H₂O₂)</strong>: 2 H + 2 O. Super-oxidizer.
                Breaks down toxic vapor aerosols in ventilation hubs.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Understood, Return to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
