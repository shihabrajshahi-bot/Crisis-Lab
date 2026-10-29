import React, { useState, useRef, useEffect } from 'react';
import { Atom, Zap, Cpu, Flame, Users, Layers, Info } from 'lucide-react';

export type ResourceType = 'protons' | 'electrons' | 'coreTokens' | 'thermalTokens' | 'meeples' | 'elements';

export interface ResourceDetails {
  name: string;
  symbol: string;
  color: string;
  accentBg: string;
  borderColor: string;
  icon: React.ReactNode;
  summary: string;
  usedFor: string[];
  howToHarvest: string[];
  tacticalTip: string;
}

export const RESOURCE_DETAILS: Record<ResourceType, ResourceDetails> = {
  protons: {
    name: 'Protons',
    symbol: 'p+',
    color: '#38bdf8', // Sky blue
    accentBg: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    icon: <Atom className="w-4 h-4 text-sky-400" />,
    summary: 'Positively charged subatomic nucleons essential for synthesizing atomic nuclei.',
    usedFor: [
      'Purchasing heavy and structural elements from the market (Carbon costs 3 p+, Sodium 3 p+, Chlorine 3 p+, Sulfur 3 p+, Hydrogen 1 p+).',
      'Paying collider transmutation exchange fees.',
    ],
    howToHarvest: [
      'Deploy a meeple to the Proton Beam Siphon space (+2 p+).',
      'Deploy a meeple to the Heavy Isotope Harvester (+1 p+, +1 Core).',
      'Specialty: Dr. Aris Thorne gains +1 bonus Proton whenever placing any meeple on the Collider!',
    ],
    tacticalTip: 'Stockpile protons early if your strategy requires Carbon (C) for complex organic backbones like Ethanol or Urea.',
  },
  electrons: {
    name: 'Electrons',
    symbol: 'e-',
    color: '#facc15', // Yellow
    accentBg: 'rgba(250, 204, 21, 0.15)',
    borderColor: 'rgba(250, 204, 21, 0.4)',
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    summary: 'Negatively charged valence leptons responsible for chemical bonding affinity.',
    usedFor: [
      'Paying electronegative bonding costs for elements (Chlorine costs 3 e-, Nitrogen 3 e-, Oxygen 2 e-, Carbon 2 e-).',
      'Fueling electron donor reactions in high-energy catalysts.',
    ],
    howToHarvest: [
      'Deploy a meeple to the Electron Injector Ring space (+2 e-).',
      'Exchange wild tokens via the Subatomic Transmuter space.',
    ],
    tacticalTip: 'Ammonia (NH₃) scrubbers require high Nitrogen and Hydrogen, demanding both electrons and protons in balance.',
  },
  coreTokens: {
    name: 'Catalyst Core Tokens',
    symbol: 'Cores',
    color: '#c084fc', // Purple
    accentBg: 'rgba(192, 132, 252, 0.15)',
    borderColor: 'rgba(192, 132, 252, 0.4)',
    icon: <Cpu className="w-4 h-4 text-purple-400" />,
    summary: 'Dense subatomic catalyst cores required to stabilize expanded octets and heavy elements.',
    usedFor: [
      'Drafting advanced element cards from the market (Sulfur requires 3 Cores, Carbon 2 Cores, Sodium 2 Cores, Chlorine 2 Cores, Oxygen 1 Core).',
    ],
    howToHarvest: [
      'Deploy a meeple to the Catalyst Core Breeder (+1 Core Token, +1 Thermal Token).',
      'Deploy a meeple to the Heavy Isotope Harvester (+1 Core Token, +1 Proton).',
    ],
    tacticalTip: 'Heavy elements like Sodium (Na) and Sulfur (S) are indispensable for Caustic Lye (NaOH) and Halite Salt (NaCl).',
  },
  thermalTokens: {
    name: 'Thermal Energy',
    symbol: 'Heat',
    color: '#fb923c', // Orange
    accentBg: 'rgba(251, 146, 60, 0.15)',
    borderColor: 'rgba(251, 146, 60, 0.4)',
    icon: <Flame className="w-4 h-4 text-orange-400" />,
    summary: 'High-enthalpy thermodynamic units that alter active molecular temperature.',
    usedFor: [
      'Phase 3 Thermal Pipeline: Spend 1 Thermal Token to raise or lower temperature by ±50°C.',
      'Shifting molecules into Solid (to smash physical debris), Liquid (to flow through drainage pipes), or Gas (to drift through air vents).',
    ],
    howToHarvest: [
      'Deploy a meeple to the Thermal Exchanger Array (+3 Thermal Tokens).',
      'Deploy a meeple to the Catalyst Core Breeder (+1 Thermal Token).',
      'Fulfilling Contract #2 (Cooling Quench Agent) rewards all chemists with +2 Thermal Tokens!',
    ],
    tacticalTip: 'Water (H₂O) melts at 0°C and boils at 100°C. One cooling token shifts room temp (20°C) down to -30°C (Solid Ice) to smash hallway debris!',
  },
  meeples: {
    name: 'Scientist Meeples',
    symbol: 'Meeples',
    color: '#06b6d4', // Cyan
    accentBg: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
    icon: <Users className="w-4 h-4 text-cyan-400" />,
    summary: 'Certified Chief Chemist personnel equipped with Hazmat pressure suits.',
    usedFor: [
      'Stationed on the 6 Particle Collider spaces in Phase 1 to harvest subatomic particles and energy.',
    ],
    howToHarvest: [
      'Each Chief Chemist starts each round with 2 available meeples.',
      'All deployed meeples return to personal lab boards at the end of Phase 4 during round reset.',
    ],
    tacticalTip: 'Collaborate with your teammates! Collider action spaces can only hold 1 meeple per round, so coordinate assignments.',
  },
  elements: {
    name: 'Element Cards',
    symbol: 'Elements',
    color: '#10b981', // Emerald
    accentBg: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    icon: <Layers className="w-4 h-4 text-emerald-400" />,
    summary: 'Refined reagent cards (H, O, C, N, Na, Cl, S) held in the chemist’s personal hand.',
    usedFor: [
      'Placed onto the 7-Hex Valence Workbench in Phase 2 to synthesize molecules.',
    ],
    howToHarvest: [
      'Drafted from the face-up Element Market by paying their Collider Cost (Protons, Electrons, Cores).',
      'The Subatomic Transmuter space allows drawing 1 card directly.',
    ],
    tacticalTip: 'Hold onto spare Hydrogen (H) cards: they only need 1 bond (Duet Rule) and are perfect for capping open valence prongs.',
  },
};

interface ResourceTooltipProps {
  type: ResourceType;
  amount: number | string;
  suffix?: string;
  showIcon?: boolean;
  className?: string;
}

export const ResourceTooltip: React.FC<ResourceTooltipProps> = ({
  type,
  amount,
  suffix,
  showIcon = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const details = RESOURCE_DETAILS[type];

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95 group focus:outline-hidden"
        aria-label={`Inspect ${details.name}`}
      >
        {showIcon && details.icon}
        <span
          className="font-bold font-mono tracking-tight group-hover:underline underline-offset-2"
          style={{ color: details.color }}
        >
          {amount} {suffix ?? details.symbol}
        </span>
        <Info className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-opacity" />
      </button>

      {/* Popover Tooltip Card */}
      {isOpen && (
        <div
          className="fixed sm:absolute bottom-16 sm:bottom-full left-1/2 -translate-x-1/2 mb-2 w-[calc(100vw-24px)] max-w-xs sm:w-80 p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 pointer-events-auto text-left max-h-[75vh] overflow-y-auto"
          style={{ borderColor: details.borderColor }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border"
                style={{ backgroundColor: details.accentBg, borderColor: details.borderColor }}
              >
                {details.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {details.name} ({details.symbol})
                </h4>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  Resource Guide
                </span>
              </div>
            </div>
            <span
              className="text-xs font-black font-mono px-2 py-0.5 rounded"
              style={{ backgroundColor: details.accentBg, color: details.color }}
            >
              {amount} In Stock
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
            {details.summary}
          </p>

          {/* Section: Used For */}
          <div className="mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Used For:
            </span>
            <ul className="text-[10px] text-slate-300 space-y-1">
              {details.usedFor.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: How to Harvest */}
          <div className="mb-2.5 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              How to Harvest:
            </span>
            <ul className="text-[10px] text-slate-300 space-y-1">
              {details.howToHarvest.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-amber-400 font-bold">➜</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tactical Tip */}
          <div
            className="p-2 rounded-lg text-[10px] leading-relaxed border"
            style={{ backgroundColor: details.accentBg, borderColor: details.borderColor, color: details.color }}
          >
            💡 <strong className="text-white">Tip:</strong> {details.tacticalTip}
          </div>

          {/* Downward indicator triangle */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-slate-900"
          />
        </div>
      )}
    </div>
  );
};
