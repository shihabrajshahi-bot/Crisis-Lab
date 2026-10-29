import React, { useState } from 'react';
import { GameState, StateOfMatter, FacilityRoom, RoomConnection } from '../types/game';
import { getStateOfMatter } from '../utils/chemistry';
import { sounds } from '../utils/audio';
import {
  Thermometer,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Hammer,
  ArrowRight,
  Shield,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

import { ResourceTooltip } from './ResourceTooltip';

interface PhaseThermalProps {
  gameState: GameState;
  onAdjustTemperature: (deltaTemp: number, costTokens: number) => void;
  onMoveMolecule: (targetRoomId: number, spentMoveCost: number) => void;
  onSmashDebris: (roomAId: number, roomBId: number) => void;
  onProceedToReact: () => void;
}

export const PhaseThermal: React.FC<PhaseThermalProps> = ({
  gameState,
  onAdjustTemperature,
  onMoveMolecule,
  onSmashDebris,
  onProceedToReact,
}) => {
  const activeChemist = gameState.chemists[gameState.activeChemistIndex];
  const molecule = activeChemist.currentMolecule;
  const currentRoom = gameState.facilityRooms.find(
    (r) => r.id === activeChemist.moleculePosition
  ) || gameState.facilityRooms[0];

  // Track moves remaining for this turn
  const maxMovesForState = (state: StateOfMatter) => {
    if (state === 'solid') return 1;
    if (state === 'liquid') return 2;
    return 4; // Gas
  };

  const [movesRemaining, setMovesRemaining] = useState<number>(
    molecule ? maxMovesForState(molecule.state) : 0
  );

  if (!molecule) {
    return (
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
        <p className="text-sm text-slate-300">
          No active molecule bonded yet. Please synthesize a molecule in Phase 2.
        </p>
      </div>
    );
  }

  // Handle temperature adjustments
  const handleTempChange = (delta: number) => {
    if (activeChemist.thermalTokens < 1) {
      sounds.playError();
      return;
    }
    if (delta > 0) {
      sounds.playHeat();
    } else {
      sounds.playCool();
    }
    onAdjustTemperature(delta, 1);

    // Recalculate remaining moves if state changed
    const newTemp = molecule.currentTemp + delta;
    const newState = getStateOfMatter(newTemp, molecule.meltingPoint, molecule.boilingPoint);
    if (newState !== molecule.state) {
      setMovesRemaining(maxMovesForState(newState));
    }
  };

  // Determine which connections are valid given current state
  const isConnectionTraversable = (conn: RoomConnection) => {
    if (conn.pathType === 'door') return true;
    if (conn.pathType === 'pipe') return molecule.state === 'liquid' || molecule.state === 'gas';
    if (conn.pathType === 'vent') return molecule.state === 'gas';
    if (conn.pathType === 'debris') return !!conn.isDebrisCleared;
    return false;
  };

  const handleMove = (targetRoomId: number) => {
    if (movesRemaining <= 0) {
      sounds.playError();
      return;
    }
    sounds.playMoveStep();
    onMoveMolecule(targetRoomId, 1);
    setMovesRemaining((prev) => Math.max(0, prev - 1));
  };

  const handleSmash = (targetRoomId: number) => {
    if (molecule.state !== 'solid') {
      sounds.playError();
      return;
    }
    sounds.playDebrisSmash();
    onSmashDebris(currentRoom.id, targetRoomId);
  };

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
            Phase 3: Thermal Pipeline & Movement
          </h2>
          <span className="text-xs bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
            {molecule.name} ({molecule.formula})
          </span>
        </div>

        {/* Chemist Thermal Tokens */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Available:</span>
          <ResourceTooltip type="thermalTokens" amount={activeChemist.thermalTokens} />
          <span className="border-l border-slate-700 pl-2 text-cyan-300 font-bold">
            Moves Left: {movesRemaining}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left Column: Thermal Controller (Heat/Cool & State of Matter) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                State of Matter Regulation
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-black uppercase tracking-wider border ${
                  molecule.state === 'solid'
                    ? 'bg-blue-950 text-sky-300 border-sky-700'
                    : molecule.state === 'liquid'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    : 'bg-amber-950 text-amber-300 border-amber-700'
                }`}
              >
                {molecule.state === 'solid' && '🧊 Solid State'}
                {molecule.state === 'liquid' && '💧 Liquid State'}
                {molecule.state === 'gas' && '💨 Gas State'}
              </span>
            </div>

            {/* Current Temperature Display */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 my-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Temperature:</span>
                <span className="font-mono text-lg font-black text-white">
                  {molecule.currentTemp}°C
                </span>
              </div>

              {/* Temperature Bar with Phase Boundaries */}
              <div className="mt-2 space-y-1">
                <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-500/70"
                    style={{ width: '33%' }}
                    title={`Solid (T < ${molecule.meltingPoint}°C)`}
                  />
                  <div
                    className="h-full bg-cyan-400/70"
                    style={{ width: '34%' }}
                    title={`Liquid (${molecule.meltingPoint}°C <= T < ${molecule.boilingPoint}°C)`}
                  />
                  <div
                    className="h-full bg-amber-500/70"
                    style={{ width: '33%' }}
                    title={`Gas (T >= ${molecule.boilingPoint}°C)`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Melting: {molecule.meltingPoint}°C</span>
                  <span>Boiling: {molecule.boilingPoint}°C</span>
                </div>
              </div>

              {/* State Abilities Explanation */}
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-300 space-y-1">
                <p className="font-semibold text-cyan-300">
                  {molecule.state === 'solid' && '• Solid: Moves 1 space. Ability: Smash physical debris.'}
                  {molecule.state === 'liquid' && '• Liquid: Moves up to 2 spaces through doors and drainage pipes.'}
                  {molecule.state === 'gas' && '• Gas: Moves up to 4 spaces through doors, pipes, AND air vents.'}
                </p>
              </div>
            </div>
          </div>

          {/* Temperature Controls */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => handleTempChange(-50)}
              disabled={activeChemist.thermalTokens < 1}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-sky-200 text-xs font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Cool -50°C (1 Heat)</span>
            </button>
            <button
              onClick={() => handleTempChange(50)}
              disabled={activeChemist.thermalTokens < 1}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Heat +50°C (1 Heat)</span>
            </button>
          </div>
        </div>

        {/* Right Column: Facility Map Navigation & Hallway Transit */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Current Room: <span className="text-white font-mono">{currentRoom.name}</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                {currentRoom.code} ({currentRoom.sector})
              </span>
            </div>

            {/* Current Room Status Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 mb-2.5">
              <p className="text-xs text-slate-300">{currentRoom.description}</p>
              {currentRoom.hazard && (
                <div className="mt-2 flex items-center justify-between bg-red-950/60 border border-red-800/80 rounded px-2.5 py-1 text-xs">
                  <span className="text-red-300 font-bold flex items-center gap-1">
                    ⚠️ Active Hazard: {currentRoom.hazard.name} (Lvl {currentRoom.hazard.level})
                  </span>
                  <span className="text-amber-300 text-[11px]">
                    Requires: {currentRoom.hazard.requiredProperty.toUpperCase()}
                  </span>
                </div>
              )}
              {currentRoom.type === 'vault' && (
                <div className="mt-2 flex items-center justify-between bg-amber-950/60 border border-amber-800/80 rounded px-2.5 py-1 text-xs">
                  <span className="text-amber-300 font-bold">
                    🏛️ Extraction Vault Delivery Station
                  </span>
                  <span className="text-slate-300 text-[11px]">
                    Deliver required contracts here in Phase 4!
                  </span>
                </div>
              )}
            </div>

            {/* Adjacent Room Connections & Movement Options */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Connected Corridors & Chambers:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentRoom.connections.map((conn) => {
                  const targetRoom = gameState.facilityRooms.find((r) => r.id === conn.targetRoomId);
                  if (!targetRoom) return null;

                  const canTraverse = isConnectionTraversable(conn);
                  const isDebrisBlock = conn.pathType === 'debris' && !conn.isDebrisCleared;

                  return (
                    <div
                      key={targetRoom.id}
                      className={`p-2 rounded-lg border flex items-center justify-between gap-2 transition-all ${
                        canTraverse && movesRemaining > 0
                          ? 'bg-slate-900 border-slate-700 hover:border-cyan-400'
                          : 'bg-slate-900/40 border-slate-800/70 opacity-60'
                      }`}
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                          <span className="truncate">{targetRoom.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <span className="capitalize">{conn.pathType}</span>
                          {targetRoom.hazard && (
                            <span className="text-red-400 font-bold">
                              • Spill Lvl {targetRoom.hazard.level}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      {isDebrisBlock ? (
                        <button
                          onClick={() => handleSmash(targetRoom.id)}
                          disabled={molecule.state !== 'solid'}
                          className="px-2.5 py-1 bg-amber-900/80 hover:bg-amber-800 text-amber-200 text-xs font-bold rounded border border-amber-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Hammer className="w-3 h-3" />
                          <span>Smash</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMove(targetRoom.id)}
                          disabled={!canTraverse || movesRemaining <= 0}
                          className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span>Move</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Proceed to Reaction Phase */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 mt-3">
            <span className="text-xs text-slate-400">
              When satisfied with molecule position, proceed to chemical reactions.
            </span>
            <button
              onClick={() => {
                onProceedToReact();
                sounds.playBondSuccess();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Execute Reactions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
