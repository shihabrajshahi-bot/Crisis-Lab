import React, { useState } from 'react';
import { GameState } from '../types/game';
import { CameraPreset } from '../three/ThreeScene';
import { sounds } from '../utils/audio';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Camera,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  HelpCircle,
  Menu,
  ChevronRight,
} from 'lucide-react';

interface TopBarProps {
  gameState: GameState;
  activePreset: CameraPreset;
  onSetCameraPreset: (preset: CameraPreset) => void;
  onOpenRules: () => void;
  onOpenContracts: () => void;
  onOpenTutorial: () => void;
  onSelectChemist: (index: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  gameState,
  activePreset,
  onSetCameraPreset,
  onOpenRules,
  onOpenContracts,
  onOpenTutorial,
  onSelectChemist,
  isMuted,
  onToggleMute,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeChemist = gameState.chemists[gameState.activeChemistIndex];
  const fulfilledContractsCount = gameState.contracts.filter((c) => c.fulfilled).length;

  // Count active level 3 hazards
  const activeLvl3Hazards = gameState.facilityRooms.filter(
    (r) => r.hazard && r.hazard.level === 3
  ).length;

  const cycleCameraPreset = () => {
    const presets: CameraPreset[] = ['facility', 'collider', 'tactical'];
    const nextIdx = (presets.indexOf(activePreset) + 1) % presets.length;
    onSetCameraPreset(presets[nextIdx]);
    sounds.playCardDraft();
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-3">
      {/* Container with responsive flex */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Left: Branding & Chemist Selector */}
        <div className="pointer-events-auto flex items-center justify-between gap-2 bg-slate-900/95 border border-slate-700/80 rounded-xl px-3 py-2 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-600/30 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black tracking-wider text-xs sm:text-sm shrink-0">
              CL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wide uppercase truncate max-w-[130px] sm:max-w-none">
                  Catalyst: Crisis Lab
                </h1>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                  R{gameState.round}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1">
                <span className="text-amber-400 font-semibold capitalize">
                  Phase {gameState.phase}
                </span>
                <span>•</span>
                <span className="truncate max-w-[90px] sm:max-w-none text-slate-300">
                  {activeChemist.name.split(' ')[1]}
                </span>
              </p>
            </div>
          </div>

          {/* Chemist Selector Pills (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 pl-2.5 border-l border-slate-700/80">
            {gameState.chemists.map((chemist, idx) => {
              const isActive = idx === gameState.activeChemistIndex;
              return (
                <button
                  key={chemist.id}
                  onClick={() => {
                    onSelectChemist(idx);
                    sounds.playCardDraft();
                  }}
                  title={`${chemist.name} (${chemist.title})`}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-700 text-white border border-slate-500 shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: chemist.color }}
                  />
                  <span className="truncate max-w-[70px]">{chemist.name.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Chemist Quick Switcher Button */}
          <button
            onClick={() => {
              const nextIdx = (gameState.activeChemistIndex + 1) % gameState.chemists.length;
              onSelectChemist(nextIdx);
              sounds.playCardDraft();
            }}
            className="lg:hidden flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200"
            title="Switch Chemist"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeChemist.color }}
            />
            <span>Next Chemist</span>
          </button>
        </div>

        {/* Center: Meltdown Toxicity Track & Contracts Tracker */}
        <div className="pointer-events-auto flex items-center justify-between md:justify-center gap-2 sm:gap-3 bg-slate-900/95 border border-slate-700/80 rounded-xl px-3 py-1.5 sm:py-2 shadow-xl">
          {/* Toxicity Track */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
            <span className="hidden sm:inline">Toxicity:</span>
            <span
              className={`font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded ${
                gameState.toxicityTrack >= 7
                  ? 'bg-red-950 text-red-300 font-black'
                  : 'bg-slate-800 text-amber-300'
              }`}
            >
              {gameState.toxicityTrack}/10
            </span>
          </div>

          {/* 10 Segment Gauge (Responsive mini-segments) */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: 10 }).map((_, i) => {
              const isFilled = i < gameState.toxicityTrack;
              let barColor = 'bg-slate-700';
              if (isFilled) {
                if (i < 4) barColor = 'bg-amber-400';
                else if (i < 7) barColor = 'bg-orange-500';
                else barColor = 'bg-red-500';
              }
              return (
                <div
                  key={i}
                  className={`w-1.5 sm:w-2 h-4 sm:h-5 rounded-xs transition-all ${barColor} ${
                    isFilled && i >= 7 ? 'border border-red-300' : ''
                  }`}
                  title={`Toxicity Level ${i + 1}`}
                />
              );
            })}
          </div>

          {/* Contracts Victory Tracker */}
          <button
            onClick={onOpenContracts}
            className="flex items-center gap-1 sm:gap-1.5 pl-2 sm:pl-3 border-l border-slate-700/80 text-[11px] sm:text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors"
          >
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Vault: {fulfilledContractsCount}/3</span>
            {activeLvl3Hazards > 0 ? (
              <span className="text-[9px] bg-red-900/80 text-red-200 px-1 py-0.2 rounded font-mono">
                {activeLvl3Hazards} L3!
              </span>
            ) : (
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
            )}
          </button>
        </div>

        {/* Right: Camera Presets, Sound, Tutorial & Manual */}
        <div className="pointer-events-auto flex items-center justify-end gap-1 sm:gap-1.5 bg-slate-900/95 border border-slate-700/80 rounded-xl p-1 sm:p-1.5 shadow-xl">
          {/* Camera presets (Desktop pills, Mobile single cycle button) */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-800/80 rounded-lg p-0.5">
            <button
              onClick={() => onSetCameraPreset('facility')}
              title="Facility Overview View"
              className={`px-2 py-1 text-xs font-medium rounded ${
                activePreset === 'facility'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Facility
            </button>
            <button
              onClick={() => onSetCameraPreset('collider')}
              title="Particle Collider View"
              className={`px-2 py-1 text-xs font-medium rounded ${
                activePreset === 'collider'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Collider
            </button>
            <button
              onClick={() => onSetCameraPreset('tactical')}
              title="Top-Down Tactical Hex View"
              className={`px-2 py-1 text-xs font-medium rounded ${
                activePreset === 'tactical'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tactical
            </button>
          </div>

          {/* Mobile Camera View Cycle button */}
          <button
            onClick={cycleCameraPreset}
            className="sm:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold capitalize"
            title="Cycle Camera View"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activePreset}</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Tutorial Guide button */}
          <button
            onClick={onOpenTutorial}
            title="Interactive 4-Phase Guided Tutorial"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-xs font-bold text-cyan-300 transition-colors border border-cyan-700/80 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Tutorial</span>
          </button>

          {/* Rules Guide Modal button */}
          <button
            onClick={onOpenRules}
            title="Crisis Lab Field Manual & Chemical Reaction Guide"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Manual</span>
          </button>
        </div>
      </div>
    </header>
  );
};
