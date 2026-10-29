import React from 'react';
import { GamePhase } from '../types/game';
import { sounds } from '../utils/audio';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Atom,
  Network,
  Thermometer,
  ShieldAlert,
  Award,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export interface TutorialStep {
  stepIndex: number;
  phase: GamePhase;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  content: string[];
  proTip: string;
  actionLabel: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepIndex: 0,
    phase: 'collider',
    title: 'Phase 1: Harvest & Draft (The Particle Collider)',
    subtitle: 'Deploy your meeples to harvest subatomic particles and purchase elements.',
    badge: 'Step 1 of 4: Subatomic Harvesting',
    icon: <Atom className="w-5 h-5 text-sky-400" />,
    content: [
      'Assign your 2 Scientist meeples to Particle Collider action spaces around the accelerator ring.',
      'Harvest subatomic tokens: Protons (p+), Electrons (e-), Core Tokens, and Thermal Energy.',
      'Spend harvested tokens to pay the Collider Cost of face-up Element Cards (H, O, C, N, Na, Cl, S) in the market, drafting them into your hand.',
    ],
    proTip: 'Pro-Tip: Dr. Aris Thorne gains +1 bonus Proton whenever placing a meeple on the Collider!',
    actionLabel: 'Inspect Collider & Market',
  },
  {
    stepIndex: 1,
    phase: 'workbench',
    title: 'Phase 2: Bond Molecules (The Valence Workbench)',
    subtitle: 'Construct stable chemical compounds on your personal 7-hex workbench.',
    badge: 'Step 2 of 4: Chemical Bonding',
    icon: <Network className="w-5 h-5 text-cyan-400" />,
    content: [
      'Click element cards from your hand, then click any hex slot on the 7-Hex Workbench to place them.',
      'Click adjacent atoms to establish Single, Double, or Triple covalent bonds.',
      'The Octet/Duet Rule is strictly enforced: Hydrogen requires 1 bond, Oxygen needs 2, Nitrogen needs 3, and Carbon needs 4.',
      'A molecule is only legal when every open prong connects with zero loose ends!',
    ],
    proTip: 'Pro-Tip: Use Rapid Synthesis shortcuts (H₂O, NH₃, CO₂) to quickly lock in stable molecules!',
    actionLabel: 'Inspect Valence Workbench',
  },
  {
    stepIndex: 2,
    phase: 'thermal',
    title: 'Phase 3: Navigate the Thermal Pipeline (State & Movement)',
    subtitle: 'Regulate molecule temperature to unlock unique state-of-matter movement abilities.',
    badge: 'Step 3 of 4: Thermodynamic Transit',
    icon: <Thermometer className="w-5 h-5 text-orange-400" />,
    content: [
      'Spend Thermal Energy tokens (±50°C) to shift your molecule between Solid, Liquid, and Gas phases.',
      '🧊 Solid State (1 space): Dense crystal lattice capable of smashing through physical debris blocking hallways.',
      '💧 Liquid State (up to 2 spaces): Fluid flow that travels through standard doors and drainage pipes.',
      '💨 Gas State (up to 4 spaces): High-velocity vapor that drifts through doors, pipes, and HVAC air vents!',
    ],
    proTip: 'Pro-Tip: Water (H₂O) boils at 100°C and melts at 0°C. Cool it to solid ice to smash debris in Sector 8!',
    actionLabel: 'Inspect Thermal Pipeline',
  },
  {
    stepIndex: 3,
    phase: 'react',
    title: 'Phase 4: Neutralize Hazards & Escalation',
    subtitle: 'Execute neutralization reactions, deliver Major Contracts, and manage crisis threat.',
    badge: 'Step 4 of 4: Crisis Containment',
    icon: <ShieldAlert className="w-5 h-5 text-emerald-400" />,
    content: [
      'In chambers with active spills, execute chemical reactions: Alkaline Bases (NH₃, NaOH) neutralize Acid spills; Water/CO₂ quench Plasma fires; Oxidizers neutralize Toxic vapor.',
      'Deliver matching synthesized compounds to the Extraction Vault (Room #2) to fulfill 3 Major Synthesis Contracts.',
      'At round end, draw a Crisis Card. The Facility Toxicity Track increases by +1 for every uncontained hazard remaining on the map!',
    ],
    proTip: 'To Win: Deliver 3 Major Contracts to the Vault AND eliminate all Level-3 spills before Toxicity reaches 10.',
    actionLabel: 'Inspect Reaction Console',
  },
];

interface TutorialOverlayProps {
  isOpen: boolean;
  currentStepIndex: number;
  onClose: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onJumpToStep: (stepIndex: number) => void;
  onFocusPhase: (phase: GamePhase) => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isOpen,
  currentStepIndex,
  onClose,
  onNextStep,
  onPrevStep,
  onJumpToStep,
  onFocusPhase,
}) => {
  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex] || TUTORIAL_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleStepAction = () => {
    onFocusPhase(currentStep.phase);
    sounds.playCardDraft();
  };

  return (
    <aside
      role="region"
      aria-label="Tutorial Guide"
      className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-3 sm:p-5"
    >
      {/* Dimmed background with spotlight border */}
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-auto" onClick={onClose} />

      {/* Top Floating Tutorial Stepper Card */}
      <div className="pointer-events-auto relative z-10 mx-auto w-full max-w-2xl bg-slate-900/95 border-2 border-cyan-500/80 rounded-2xl p-3 sm:p-5 shadow-2xl backdrop-blur-md max-h-[80vh] sm:max-h-[82vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-400 flex items-center justify-center">
              {currentStep.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {currentStep.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Tutorial (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <p className="text-slate-200 font-medium">{currentStep.subtitle}</p>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
            {currentStep.content.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>

          {/* Pro-Tip Box */}
          <div className="p-2.5 bg-amber-950/40 border border-amber-800/80 rounded-lg text-[11px] text-amber-200 font-medium">
            💡 {currentStep.proTip}
          </div>
        </div>

        {/* Navigation & Phase Focus Action */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onJumpToStep(idx);
                  onFocusPhase(s.phase);
                  sounds.playCardDraft();
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-cyan-400'
                    : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStepAction}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/60 rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentStep.actionLabel}</span>
            </button>

            <button
              onClick={onPrevStep}
              disabled={isFirstStep}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {isLastStep ? (
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
              >
                Complete Tutorial
              </button>
            ) : (
              <button
                onClick={onNextStep}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Spotlight Callout pointing to the BottomDock */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1070px] mb-2 px-3">
        <div className="bg-cyan-950/90 border-2 border-cyan-400 text-cyan-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>
              Currently Spotlighting: <strong className="text-white uppercase">{currentStep.phase}</strong> in the BottomDock below
            </span>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">
            Tab #{currentStepIndex + 1} Activated
          </span>
        </div>
      </div>
    </aside>
  );
};
