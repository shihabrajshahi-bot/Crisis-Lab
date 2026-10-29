import React, { useState } from 'react';
import { GameState, ElementType, BondedMolecule } from '../types/game';
import {
  ELEMENTS,
  PlacedAtom,
  HexBond,
  WORKBENCH_NEIGHBORS,
  validateValenceWorkbench,
  KNOWN_MOLECULES,
} from '../utils/chemistry';
import { sounds } from '../utils/audio';
import { Check, AlertTriangle, Sparkles, RefreshCw, ArrowRight, X } from 'lucide-react';

interface PhaseWorkbenchProps {
  gameState: GameState;
  onConfirmMolecule: (molecule: BondedMolecule) => void;
  onBackToCollider: () => void;
}

// 7-hex layout coordinates in 2D space (relative % or px)
// Center 0 is (50%, 50%)
// Outer 1 to 6 in a hexagonal circle
const HEX_LAYOUT: { [key: number]: { x: number; y: number; label: string } } = {
  0: { x: 50, y: 50, label: 'Core #0' },
  1: { x: 50, y: 15, label: 'North #1' },
  2: { x: 79, y: 32, label: 'NE #2' },
  3: { x: 79, y: 68, label: 'SE #3' },
  4: { x: 50, y: 85, label: 'South #4' },
  5: { x: 21, y: 68, label: 'SW #5' },
  6: { x: 21, y: 32, label: 'NW #6' },
};

export const PhaseWorkbench: React.FC<PhaseWorkbenchProps> = ({
  gameState,
  onConfirmMolecule,
  onBackToCollider,
}) => {
  const activeChemist = gameState.chemists[gameState.activeChemistIndex];

  // Workbench local placement state
  const [placedAtoms, setPlacedAtoms] = useState<PlacedAtom[]>([]);
  const [bonds, setBonds] = useState<HexBond[]>([]);
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [selectedHexForBond, setSelectedHexForBond] = useState<number | null>(null);

  // Compute remaining hand elements
  const usedElements = placedAtoms.map((a) => a.element);
  const remainingHand = [...activeChemist.hand];
  for (const used of usedElements) {
    const idx = remainingHand.indexOf(used);
    if (idx !== -1) {
      remainingHand.splice(idx, 1);
    }
  }

  // Validate current setup
  const validation = validateValenceWorkbench(placedAtoms, bonds);

  // Handle clicking a hex on the workbench
  const handleHexClick = (hexIndex: number) => {
    // If we have an element selected from hand, place it!
    if (selectedHandIndex !== null && selectedHandIndex < remainingHand.length) {
      const elementToPlace = remainingHand[selectedHandIndex];

      // Remove any existing atom at this hex
      const filtered = placedAtoms.filter((a) => a.hexIndex !== hexIndex);
      setPlacedAtoms([...filtered, { hexIndex, element: elementToPlace }]);

      // Remove invalid bonds if an atom was replaced
      sounds.playAtomPlace();
      setSelectedHandIndex(null);
      setSelectedHexForBond(null);
      return;
    }

    // If an atom already sits here and no hand atom is selected, click to create bonds
    const existingAtom = placedAtoms.find((a) => a.hexIndex === hexIndex);
    if (!existingAtom) return;

    if (selectedHexForBond === null) {
      sounds.playBondConnect();
      setSelectedHexForBond(hexIndex);
    } else if (selectedHexForBond === hexIndex) {
      // Deselect
      sounds.playBondDisconnect();
      setSelectedHexForBond(null);
    } else {
      // Toggle bond between selectedHexForBond and hexIndex if adjacent
      const neighbors = WORKBENCH_NEIGHBORS[selectedHexForBond] || [];
      if (neighbors.includes(hexIndex)) {
        toggleBond(selectedHexForBond, hexIndex);
      } else {
        sounds.playError();
      }
      setSelectedHexForBond(null);
    }
  };

  const toggleBond = (hexA: number, hexB: number) => {
    const fromHex = Math.min(hexA, hexB);
    const toHex = Math.max(hexA, hexB);

    const existingIndex = bonds.findIndex((b) => b.fromHex === fromHex && b.toHex === toHex);
    if (existingIndex === -1) {
      // Add single bond
      setBonds([...bonds, { fromHex, toHex, order: 1 }]);
      sounds.playBondConnect();
    } else {
      const currentOrder = bonds[existingIndex].order;
      if (currentOrder === 1) {
        // Upgrade to double bond
        const next = [...bonds];
        next[existingIndex].order = 2;
        setBonds(next);
        sounds.playBondConnect();
      } else if (currentOrder === 2) {
        // Upgrade to triple bond
        const next = [...bonds];
        next[existingIndex].order = 3;
        setBonds(next);
        sounds.playBondConnect();
      } else {
        // Remove bond
        setBonds(bonds.filter((_, idx) => idx !== existingIndex));
        sounds.playBondDisconnect();
      }
    }
  };

  const removeAtom = (hexIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedAtoms(placedAtoms.filter((a) => a.hexIndex !== hexIndex));
    setBonds(bonds.filter((b) => b.fromHex !== hexIndex && b.toHex !== hexIndex));
    if (selectedHexForBond === hexIndex) setSelectedHexForBond(null);
    sounds.playBondDisconnect();
  };

  const clearWorkbench = () => {
    sounds.playBondDisconnect();
    setPlacedAtoms([]);
    setBonds([]);
    setSelectedHandIndex(null);
    setSelectedHexForBond(null);
  };

  // Quick Auto-Synthesize known molecule helper if player has atoms
  const autoSynthesize = (formula: string) => {
    clearWorkbench();
    if (formula === 'H2O' && activeHandCount('H') >= 2 && activeHandCount('O') >= 1) {
      setPlacedAtoms([
        { hexIndex: 0, element: 'O' },
        { hexIndex: 1, element: 'H' },
        { hexIndex: 2, element: 'H' },
      ]);
      setBonds([
        { fromHex: 0, toHex: 1, order: 1 },
        { fromHex: 0, toHex: 2, order: 1 },
      ]);
      sounds.playBondSuccess();
    } else if (formula === 'CO2' && activeHandCount('C') >= 1 && activeHandCount('O') >= 2) {
      setPlacedAtoms([
        { hexIndex: 0, element: 'C' },
        { hexIndex: 1, element: 'O' },
        { hexIndex: 4, element: 'O' },
      ]);
      setBonds([
        { fromHex: 0, toHex: 1, order: 2 },
        { fromHex: 0, toHex: 4, order: 2 },
      ]);
      sounds.playBondSuccess();
    } else if (formula === 'NH3' && activeHandCount('N') >= 1 && activeHandCount('H') >= 3) {
      setPlacedAtoms([
        { hexIndex: 0, element: 'N' },
        { hexIndex: 1, element: 'H' },
        { hexIndex: 2, element: 'H' },
        { hexIndex: 3, element: 'H' },
      ]);
      setBonds([
        { fromHex: 0, toHex: 1, order: 1 },
        { fromHex: 0, toHex: 2, order: 1 },
        { fromHex: 0, toHex: 3, order: 1 },
      ]);
      sounds.playBondSuccess();
    } else if (formula === 'CH4' && activeHandCount('C') >= 1 && activeHandCount('H') >= 4) {
      setPlacedAtoms([
        { hexIndex: 0, element: 'C' },
        { hexIndex: 1, element: 'H' },
        { hexIndex: 2, element: 'H' },
        { hexIndex: 4, element: 'H' },
        { hexIndex: 5, element: 'H' },
      ]);
      setBonds([
        { fromHex: 0, toHex: 1, order: 1 },
        { fromHex: 0, toHex: 2, order: 1 },
        { fromHex: 0, toHex: 4, order: 1 },
        { fromHex: 0, toHex: 5, order: 1 },
      ]);
      sounds.playBondSuccess();
    } else {
      sounds.playError();
    }
  };

  function activeHandCount(el: ElementType): number {
    return activeChemist.hand.filter((h) => h === el).length;
  }

  // Count bonds connected to a given hex
  const getBondsForHex = (hexIndex: number) => {
    return bonds
      .filter((b) => b.fromHex === hexIndex || b.toHex === hexIndex)
      .reduce((sum, b) => sum + b.order, 0);
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
            Phase 2: The Valence Workbench (7-Hex Grid)
          </h2>
          <span className="text-xs text-slate-400">
            Satisfy Octet & Duet Rules: Every prong must connect with zero loose ends.
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearWorkbench}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear Workbench</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: Player Hand Element Cards */}
        <div className="md:col-span-1 lg:col-span-3 bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Available Hand ({remainingHand.length})
            </span>
            <span className="text-[11px] text-cyan-400">Click to place</span>
          </div>

          {remainingHand.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              All hand element tiles placed on workbench.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5 max-h-[180px] sm:max-h-[220px] overflow-y-auto pr-1">
              {remainingHand.map((symbol, idx) => {
                const elData = ELEMENTS[symbol];
                const isSelected = selectedHandIndex === idx;

                return (
                  <button
                    key={`${symbol}-${idx}`}
                    onClick={() => {
                      setSelectedHandIndex(isSelected ? null : idx);
                      sounds.playCardDraft();
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md ring-1 ring-cyan-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className="text-sm font-black px-1.5 rounded"
                        style={{ backgroundColor: `${elData.color}25`, color: elData.color }}
                      >
                        {elData.symbol}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {elData.requiredBonds} {elData.requiredBonds === 1 ? 'prong' : 'prongs'}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 truncate">
                      {elData.name}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Recipe Synthesizers */}
          <div className="mt-3 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              Rapid Synthesis Recipes:
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                onClick={() => autoSynthesize('H2O')}
                disabled={activeHandCount('H') < 2 || activeHandCount('O') < 1}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left truncate"
              >
                💧 Water (H₂O)
              </button>
              <button
                onClick={() => autoSynthesize('NH3')}
                disabled={activeHandCount('N') < 1 || activeHandCount('H') < 3}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left truncate"
              >
                🧪 Ammonia (NH₃)
              </button>
              <button
                onClick={() => autoSynthesize('CO2')}
                disabled={activeHandCount('C') < 1 || activeHandCount('O') < 2}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left truncate"
              >
                💨 CO₂ Blanket
              </button>
              <button
                onClick={() => autoSynthesize('CH4')}
                disabled={activeHandCount('C') < 1 || activeHandCount('H') < 4}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-left truncate"
              >
                🔥 Methane (CH₄)
              </button>
            </div>
          </div>
        </div>

        {/* Center Column: 7-Hex Personal Workbench */}
        <div className="md:col-span-1 lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              7-Hex Valence Array
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedHexForBond !== null
                ? `Click adjacent atom to bond to Hex #${selectedHexForBond}`
                : selectedHandIndex !== null
                ? 'Click empty slot to place atom'
                : 'Click atom to bond / remove'}
            </span>
          </div>

          {/* Interactive 7-Hex Canvas Area */}
          <div className="relative w-[280px] h-[260px] my-1">
            {/* Render SVG bond lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {bonds.map((b, bIdx) => {
                const posA = HEX_LAYOUT[b.fromHex];
                const posB = HEX_LAYOUT[b.toHex];
                return (
                  <g key={bIdx}>
                    <line
                      x1={`${posA.x}%`}
                      y1={`${posA.y}%`}
                      x2={`${posB.x}%`}
                      y2={`${posB.y}%`}
                      stroke="#38bdf8"
                      strokeWidth={b.order * 2.5}
                      strokeLinecap="round"
                      strokeOpacity={0.8}
                    />
                    {b.order > 1 && (
                      <circle
                        cx={`${(posA.x + posB.x) / 2}%`}
                        cy={`${(posA.y + posB.y) / 2}%`}
                        r={7}
                        fill="#0284c7"
                        stroke="#7dd3fc"
                        strokeWidth={1}
                      />
                    )}
                    {b.order > 1 && (
                      <text
                        x={`${(posA.x + posB.x) / 2}%`}
                        y={`${(posA.y + posB.y) / 2}%`}
                        dy="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {b.order === 2 ? '═' : '≡'}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 7 Hex Nodes */}
            {[0, 1, 2, 3, 4, 5, 6].map((hexIndex) => {
              const layout = HEX_LAYOUT[hexIndex];
              const placed = placedAtoms.find((a) => a.hexIndex === hexIndex);
              const isSelectedBond = selectedHexForBond === hexIndex;
              const isBondCandidate =
                selectedHexForBond !== null &&
                selectedHexForBond !== hexIndex &&
                WORKBENCH_NEIGHBORS[selectedHexForBond]?.includes(hexIndex);

              const currentBonds = placed ? getBondsForHex(hexIndex) : 0;
              const requiredBonds = placed ? ELEMENTS[placed.element].requiredBonds : 0;
              const isSatisfied = placed && currentBonds === requiredBonds;
              const isOverBonds = placed && currentBonds > requiredBonds;

              return (
                <div
                  key={hexIndex}
                  onClick={() => handleHexClick(hexIndex)}
                  style={{
                    left: `${layout.x}%`,
                    top: `${layout.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute w-15 h-15 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all z-10 ${
                    isSelectedBond
                      ? 'bg-cyan-900 border-cyan-300 shadow-lg ring-2 ring-cyan-400 scale-105'
                      : isBondCandidate
                      ? 'bg-amber-950/80 border-amber-400 animate-pulse'
                      : placed
                      ? 'bg-slate-900 border-slate-700 hover:border-slate-500 shadow'
                      : 'bg-slate-900/50 border-slate-800 border-dashed hover:border-cyan-500'
                  }`}
                >
                  {placed ? (
                    <>
                      <div className="flex items-center justify-between w-full px-1.5 -mt-1">
                        <span
                          className={`text-[9px] font-mono font-bold ${
                            isSatisfied
                              ? 'text-emerald-400'
                              : isOverBonds
                              ? 'text-red-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {currentBonds}/{requiredBonds}
                        </span>
                        <button
                          onClick={(e) => removeAtom(hexIndex, e)}
                          title="Remove atom back to hand"
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <span
                        className="text-lg font-black leading-none"
                        style={{ color: ELEMENTS[placed.element].color }}
                      >
                        {placed.element}
                      </span>
                      <span className="text-[9px] text-slate-400 -mb-1">
                        {hexIndex === 0 ? 'Core' : `#${hexIndex}`}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold uppercase">
                      {hexIndex === 0 ? 'Core' : `#${hexIndex}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-1">
            Tip: Click an atom, then click an adjacent neighbor to toggle bonds (Single ➜ Double ➜ Triple ➜ Remove).
          </p>
        </div>

        {/* Right Column: Molecule Analysis & Confirmation */}
        <div className="md:col-span-2 lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between min-h-[260px] sm:min-h-[290px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Synthesis Diagnostics
              </span>
              {validation.isValid ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  <Check className="w-3 h-3" />
                  Stable Molecule
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  <AlertTriangle className="w-3 h-3" />
                  Incomplete
                </span>
              )}
            </div>

            {validation.molecule ? (
              <div className="space-y-2 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5">
                <div>
                  <div className="text-sm font-black text-white flex items-center justify-between">
                    <span>{validation.molecule.name}</span>
                    <span className="text-cyan-300 font-mono text-base">
                      {validation.molecule.formula}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                    {validation.molecule.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Melting Point:</span>
                    <span className="font-mono font-bold text-sky-300">
                      {validation.molecule.meltingPoint}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Boiling Point:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {validation.molecule.boilingPoint}°C
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {validation.molecule.properties.map((prop) => (
                    <span
                      key={prop}
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase"
                    >
                      {prop.replace('_', ' ')}
                    </span>
                  ))}
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                    Initial State: {validation.molecule.state}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-3 space-y-1">
                <span className="text-xs font-semibold text-slate-300 block">
                  Rule Violations:
                </span>
                <ul className="text-[11px] text-amber-400/90 space-y-1 list-disc list-inside">
                  {validation.errors.slice(0, 3).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 mt-2">
            <button
              onClick={onBackToCollider}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Back to Collider
            </button>

            <button
              disabled={!validation.isValid || !validation.molecule}
              onClick={() => {
                if (validation.molecule) {
                  onConfirmMolecule(validation.molecule);
                  sounds.playBondSuccess();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Deploy to Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
