import React, { useState, useCallback } from 'react';
import { GameState, GamePhase, BondedMolecule, ElementType } from './types/game';
import {
  INITIAL_CHEMISTS,
  INITIAL_FACILITY_ROOMS,
  INITIAL_COLLIDER_SPACES,
  INITIAL_CONTRACTS,
  INITIAL_MARKET_DECK,
  CRISIS_CARDS,
} from './utils/initialGameData';
import { ELEMENTS, getStateOfMatter } from './utils/chemistry';
import { sounds } from './utils/audio';
import { CameraPreset } from './three/ThreeScene';
import { ThreeCanvas } from './components/ThreeCanvas';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { RulesModal } from './components/RulesModal';
import { ContractsModal } from './components/ContractsModal';
import { GameOverModal } from './components/GameOverModal';
import { TutorialOverlay, TUTORIAL_STEPS } from './components/TutorialOverlay';

function createInitialGameState(): GameState {
  const initialDeck = [...INITIAL_MARKET_DECK].sort(() => Math.random() - 0.5);
  const faceUpMarket = initialDeck.splice(0, 5);

  return {
    round: 1,
    phase: 'collider',
    activeChemistIndex: 0,
    chemists: JSON.parse(JSON.stringify(INITIAL_CHEMISTS)),
    toxicityTrack: 0,
    contracts: JSON.parse(JSON.stringify(INITIAL_CONTRACTS)),
    elementMarket: faceUpMarket,
    marketDeckCount: initialDeck.length,
    facilityRooms: JSON.parse(JSON.stringify(INITIAL_FACILITY_ROOMS)),
    colliderSpaces: JSON.parse(JSON.stringify(INITIAL_COLLIDER_SPACES)),
    escalationLog: ['Crisis Lab initialized. Central containment doors sealed.'],
    gameStatus: 'playing',
  };
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('facility');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isContractsOpen, setIsContractsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(true);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleNextTutorialStep = () => {
    setTutorialStepIndex((prev) => {
      const next = Math.min(TUTORIAL_STEPS.length - 1, prev + 1);
      setGameState((g) => ({ ...g, phase: TUTORIAL_STEPS[next].phase }));
      sounds.playCardDraft();
      return next;
    });
  };

  const handlePrevTutorialStep = () => {
    setTutorialStepIndex((prev) => {
      const next = Math.max(0, prev - 1);
      setGameState((g) => ({ ...g, phase: TUTORIAL_STEPS[next].phase }));
      sounds.playCardDraft();
      return next;
    });
  };

  const handleJumpTutorialStep = (index: number) => {
    setTutorialStepIndex(index);
    setGameState((g) => ({ ...g, phase: TUTORIAL_STEPS[index].phase }));
  };

  const handleFocusTutorialPhase = (phase: GamePhase) => {
    setGameState((g) => ({ ...g, phase }));
  };

  // Helper to check victory & loss
  const checkGameEndConditions = useCallback((state: GameState): GameState => {
    // Loss Condition 1: Toxicity >= 10
    if (state.toxicityTrack >= 10) {
      return {
        ...state,
        gameStatus: 'lost',
        lossReason: 'Facility Toxicity reached 10! Catastrophic runaway reactor meltdown.',
      };
    }

    // Loss Condition 2: Market Deck depleted before stabilization
    if (state.marketDeckCount <= 0 && state.elementMarket.length === 0) {
      return {
        ...state,
        gameStatus: 'lost',
        lossReason: 'The Element Market deck depleted before the facility could be stabilized.',
      };
    }

    // Victory Condition: 3 Contracts fulfilled AND 0 active Level-3 Hazards
    const fulfilledCount = state.contracts.filter((c) => c.fulfilled).length;
    const activeLvl3Hazards = state.facilityRooms.filter(
      (r) => r.hazard && r.hazard.level === 3
    ).length;

    if (fulfilledCount >= 3 && activeLvl3Hazards === 0) {
      return {
        ...state,
        gameStatus: 'won',
        winReason:
          'Outstanding teamwork! 3 Major Synthesis Contracts were safely delivered to the Vault and all critical hazards were eradicated.',
      };
    }

    return state;
  }, []);

  // Phase 1 Actions: Place Meeple
  const handlePlaceMeeple = (spaceId: string) => {
    sounds.playMeeplePlace();
    setGameState((prev) => {
      const activeChemist = { ...prev.chemists[prev.activeChemistIndex] };
      if (activeChemist.meeplesAvailable <= 0) {
        sounds.playError();
        return prev;
      }

      const colliderSpaces = prev.colliderSpaces.map((space) => {
        if (space.id === spaceId && !space.occupiedByChemistId) {
          return { ...space, occupiedByChemistId: activeChemist.id };
        }
        return space;
      });

      const targetSpace = prev.colliderSpaces.find((s) => s.id === spaceId);
      if (!targetSpace) return prev;

      activeChemist.meeplesAvailable -= 1;
      activeChemist.protons += targetSpace.reward.protons || 0;
      activeChemist.electrons += targetSpace.reward.electrons || 0;
      activeChemist.coreTokens += targetSpace.reward.coreTokens || 0;
      activeChemist.thermalTokens += targetSpace.reward.thermalTokens || 0;

      // Chemist specialty: Dr. Aris Thorne gains +1 bonus Proton
      if (activeChemist.id === 'chemist_2') {
        activeChemist.protons += 1;
      }

      // Card draw if specified
      if (targetSpace.reward.cardDraw && prev.elementMarket.length > 0) {
        const drawn = prev.elementMarket[0];
        activeChemist.hand = [...activeChemist.hand, drawn];
      }

      const chemists = prev.chemists.map((c, i) =>
        i === prev.activeChemistIndex ? activeChemist : c
      );

      const nextLog = [
        ...prev.escalationLog,
        `${activeChemist.name} deployed meeple to ${targetSpace.name} (${targetSpace.yieldDesc}).`,
      ];

      return {
        ...prev,
        colliderSpaces,
        chemists,
        escalationLog: nextLog,
      };
    });
  };

  // Phase 1 Actions: Draft Card from Market
  const handleDraftElementCard = (elementIndex: number) => {
    setGameState((prev) => {
      const activeChemist = { ...prev.chemists[prev.activeChemistIndex] };
      const elementSymbol = prev.elementMarket[elementIndex];
      if (!elementSymbol) return prev;

      const elData = ELEMENTS[elementSymbol];
      if (
        activeChemist.protons < elData.cost.protons ||
        activeChemist.electrons < elData.cost.electrons ||
        activeChemist.coreTokens < elData.cost.coreTokens
      ) {
        return prev;
      }

      // Deduct cost
      activeChemist.protons -= elData.cost.protons;
      activeChemist.electrons -= elData.cost.electrons;
      activeChemist.coreTokens -= elData.cost.coreTokens;
      activeChemist.hand = [...activeChemist.hand, elementSymbol];

      // Remove from market and refill from deck
      const nextMarket = [...prev.elementMarket];
      nextMarket.splice(elementIndex, 1);

      let nextDeckCount = prev.marketDeckCount;
      if (nextDeckCount > 0) {
        // Draw replacement
        const pool: ElementType[] = ['C', 'H', 'O', 'N', 'Na', 'Cl', 'S'];
        const randomRefill = pool[Math.floor(Math.random() * pool.length)];
        nextMarket.push(randomRefill);
        nextDeckCount -= 1;
      }

      const chemists = prev.chemists.map((c, i) =>
        i === prev.activeChemistIndex ? activeChemist : c
      );

      const nextState: GameState = {
        ...prev,
        chemists,
        elementMarket: nextMarket,
        marketDeckCount: nextDeckCount,
        escalationLog: [
          ...prev.escalationLog,
          `${activeChemist.name} drafted ${elData.name} (${elementSymbol}) into hand.`,
        ],
      };

      return checkGameEndConditions(nextState);
    });
  };

  // Phase 2 Actions: Confirm Bonded Molecule
  const handleConfirmMolecule = (molecule: BondedMolecule) => {
    setGameState((prev) => {
      const activeChemist = { ...prev.chemists[prev.activeChemistIndex] };

      // Deduct used atoms from hand
      const nextHand = [...activeChemist.hand];
      molecule.atoms.forEach((atom) => {
        const idx = nextHand.indexOf(atom.element);
        if (idx !== -1) {
          nextHand.splice(idx, 1);
        }
      });

      activeChemist.hand = nextHand;
      activeChemist.currentMolecule = molecule;

      const chemists = prev.chemists.map((c, i) =>
        i === prev.activeChemistIndex ? activeChemist : c
      );

      return {
        ...prev,
        chemists,
        phase: 'thermal',
        escalationLog: [
          ...prev.escalationLog,
          `${activeChemist.name} successfully bonded ${molecule.name} (${molecule.formula}).`,
        ],
      };
    });
  };

  // Phase 3 Actions: Adjust Molecule Temperature
  const handleAdjustTemperature = (deltaTemp: number, costTokens: number) => {
    if (deltaTemp > 0) {
      sounds.playHeat();
    } else {
      sounds.playCool();
    }
    setGameState((prev) => {
      const activeChemist = { ...prev.chemists[prev.activeChemistIndex] };
      if (!activeChemist.currentMolecule || activeChemist.thermalTokens < costTokens) {
        sounds.playError();
        return prev;
      }

      activeChemist.thermalTokens -= costTokens;
      const newTemp = activeChemist.currentMolecule.currentTemp + deltaTemp;
      const newState = getStateOfMatter(
        newTemp,
        activeChemist.currentMolecule.meltingPoint,
        activeChemist.currentMolecule.boilingPoint
      );

      activeChemist.currentMolecule = {
        ...activeChemist.currentMolecule,
        currentTemp: newTemp,
        state: newState,
      };

      const chemists = prev.chemists.map((c, i) =>
        i === prev.activeChemistIndex ? activeChemist : c
      );

      return {
        ...prev,
        chemists,
        escalationLog: [
          ...prev.escalationLog,
          `${activeChemist.name} adjusted ${activeChemist.currentMolecule.formula} temp to ${newTemp}°C (Shifted to ${newState.toUpperCase()} state).`,
        ],
      };
    });
  };

  // Phase 3 Actions: Move Molecule on Grid
  const handleMoveMolecule = (targetRoomId: number) => {
    sounds.playMoveStep();
    setGameState((prev) => {
      const activeChemist = { ...prev.chemists[prev.activeChemistIndex] };
      activeChemist.moleculePosition = targetRoomId;

      const targetRoom = prev.facilityRooms.find((r) => r.id === targetRoomId);
      const chemists = prev.chemists.map((c, i) =>
        i === prev.activeChemistIndex ? activeChemist : c
      );

      return {
        ...prev,
        chemists,
        escalationLog: [
          ...prev.escalationLog,
          `${activeChemist.name}'s molecule moved into ${targetRoom?.name || 'Chamber'}.`,
        ],
      };
    });
  };

  // Phase 3 Actions: Smash Debris Barrier
  const handleSmashDebris = (roomAId: number, roomBId: number) => {
    sounds.playDebrisSmash();
    setGameState((prev) => {
      const rooms = prev.facilityRooms.map((room) => {
        if (room.id === roomAId || room.id === roomBId) {
          const updatedConns = room.connections.map((c) => {
            if (
              (room.id === roomAId && c.targetRoomId === roomBId) ||
              (room.id === roomBId && c.targetRoomId === roomAId)
            ) {
              return { ...c, isDebrisCleared: true };
            }
            return c;
          });
          return { ...room, connections: updatedConns };
        }
        return room;
      });

      return {
        ...prev,
        facilityRooms: rooms,
        escalationLog: [
          ...prev.escalationLog,
          `Debris smashed! Physical obstruction cleared permanently between rooms #${roomAId} and #${roomBId}.`,
        ],
      };
    });
  };

  // Phase 4 Actions: Neutralize Hazard
  const handleNeutralizeHazard = (roomId: number, reactionDesc: string) => {
    sounds.playReactionNeutralize();
    setGameState((prev) => {
      const activeChemist = prev.chemists[prev.activeChemistIndex];
      const isSamiraBonus = activeChemist.id === 'chemist_3'; // Reduces by 2 levels

      const rooms = prev.facilityRooms.map((room) => {
        if (room.id === roomId && room.hazard) {
          const levelReduction = isSamiraBonus ? 2 : 1;
          const nextLevel = room.hazard.level - levelReduction;
          if (nextLevel <= 0) {
            return { ...room, hazard: undefined };
          } else {
            return {
              ...room,
              hazard: { ...room.hazard, level: nextLevel as 1 | 2 | 3 },
            };
          }
        }
        return room;
      });

      // Reduce toxicity track for containment success
      const nextToxicity = Math.max(0, prev.toxicityTrack - 1);

      const nextState: GameState = {
        ...prev,
        facilityRooms: rooms,
        toxicityTrack: nextToxicity,
        escalationLog: [...prev.escalationLog, reactionDesc],
      };

      return checkGameEndConditions(nextState);
    });
  };

  // Phase 4 Actions: Fulfill Major Synthesis Contract
  const handleFulfillContract = (contractId: string) => {
    sounds.playContractDeliver();
    setGameState((prev) => {
      const activeChemist = prev.chemists[prev.activeChemistIndex];
      const contracts = prev.contracts.map((c) => {
        if (c.id === contractId) {
          return { ...c, fulfilled: true, fulfilledBy: activeChemist.name };
        }
        return c;
      });

      // Rewards: -2 Toxicity, grant bonus thermal tokens
      const nextToxicity = Math.max(0, prev.toxicityTrack - 2);
      const chemists = prev.chemists.map((c) => ({
        ...c,
        thermalTokens: c.thermalTokens + 1,
      }));

      const nextState: GameState = {
        ...prev,
        contracts,
        toxicityTrack: nextToxicity,
        chemists,
        escalationLog: [
          ...prev.escalationLog,
          `🏆 MAJOR CONTRACT COMPLETED: ${contractId} fulfilled at the Extraction Vault!`,
        ],
      };

      return checkGameEndConditions(nextState);
    });
  };

  // Pass Turn to Next Chemist in current round
  const handleEndChemistTurn = () => {
    sounds.playChemistSwitch();
    setGameState((prev) => {
      const nextIndex = (prev.activeChemistIndex + 1) % prev.chemists.length;
      return {
        ...prev,
        activeChemistIndex: nextIndex,
        phase: 'collider',
        escalationLog: [
          ...prev.escalationLog,
          `Turn passed to Chief Chemist ${prev.chemists[nextIndex].name}.`,
        ],
      };
    });
  };

  // End of Round: Trigger Crisis Escalation
  const handleTriggerRoundEscalation = () => {
    sounds.playCrisisCardDraw();
    setGameState((prev) => {
      // 1. Pick a random crisis card
      const crisis = CRISIS_CARDS[Math.floor(Math.random() * CRISIS_CARDS.length)];
      const crisisResult = crisis.effect(prev);

      // 2. Count uncontained hazards remaining on map
      const currentRooms = crisisResult.facilityRooms || prev.facilityRooms;
      const uncontainedCount = currentRooms.filter((r) => r.hazard).length;

      // 3. Advance Toxicity by uncontained hazards
      const toxicityIncrease = uncontainedCount;
      const baseToxicity = crisisResult.toxicityTrack ?? prev.toxicityTrack;
      const nextToxicity = Math.min(10, baseToxicity + toxicityIncrease);

      // 4. Return meeples and reset collider spaces
      const freedCollider = prev.colliderSpaces.map((s) => ({
        ...s,
        occupiedByChemistId: null,
      }));

      const refreshedChemists = (crisisResult.chemists || prev.chemists).map((c) => ({
        ...c,
        meeplesAvailable: 2,
        // Draw 1 starter card back to hand if hand is low
        hand: c.hand.length < 2 ? [...c.hand, 'H' as ElementType, 'O' as ElementType] : c.hand,
      }));

      const nextLog = [
        ...prev.escalationLog,
        `⚠️ CRISIS ESCALATION (Round ${prev.round}): ${crisis.title} — ${crisis.description}`,
        `+${toxicityIncrease} Facility Toxicity added from ${uncontainedCount} uncontained hazard spills.`,
      ];

      const nextState: GameState = {
        ...prev,
        ...crisisResult,
        round: prev.round + 1,
        phase: 'collider',
        activeChemistIndex: 0,
        colliderSpaces: freedCollider,
        chemists: refreshedChemists,
        toxicityTrack: nextToxicity,
        escalationLog: nextLog,
      };

      return checkGameEndConditions(nextState);
    });
  };

  // Room click handler from 3D scene
  const handleRoomClick = (roomId: number) => {
    const activeChemist = gameState.chemists[gameState.activeChemistIndex];
    if (gameState.phase === 'thermal' && activeChemist.currentMolecule) {
      handleMoveMolecule(roomId);
    }
  };

  const handleRestartGame = () => {
    setGameState(createInitialGameState());
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Three.js Canvas Viewport */}
      <ThreeCanvas
        gameState={gameState}
        cameraPreset={cameraPreset}
        onRoomClick={handleRoomClick}
      />

      {/* Top HUD Bar */}
      <TopBar
        gameState={gameState}
        activePreset={cameraPreset}
        onSetCameraPreset={setCameraPreset}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenContracts={() => setIsContractsOpen(true)}
        onOpenTutorial={() => {
          setIsTutorialOpen(true);
          setTutorialStepIndex(0);
          setGameState((g) => ({ ...g, phase: 'collider' }));
        }}
        onSelectChemist={(idx) =>
          setGameState((prev) => ({ ...prev, activeChemistIndex: idx }))
        }
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <BottomDock
        gameState={gameState}
        isTutorialActive={isTutorialOpen}
        spotlightPhase={isTutorialOpen ? TUTORIAL_STEPS[tutorialStepIndex].phase : undefined}
        onPlaceMeeple={handlePlaceMeeple}
        onDraftElementCard={handleDraftElementCard}
        onConfirmMolecule={handleConfirmMolecule}
        onAdjustTemperature={handleAdjustTemperature}
        onMoveMolecule={handleMoveMolecule}
        onSmashDebris={handleSmashDebris}
        onNeutralizeHazard={handleNeutralizeHazard}
        onFulfillContract={handleFulfillContract}
        onEndChemistTurn={handleEndChemistTurn}
        onTriggerRoundEscalation={handleTriggerRoundEscalation}
        onSetPhase={(phase) => {
          sounds.playPhaseTransition();
          setGameState((prev) => ({ ...prev, phase }));
        }}
      />

      {/* Guided 4-Phase Turn Sequence Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        currentStepIndex={tutorialStepIndex}
        onClose={() => setIsTutorialOpen(false)}
        onNextStep={handleNextTutorialStep}
        onPrevStep={handlePrevTutorialStep}
        onJumpToStep={handleJumpTutorialStep}
        onFocusPhase={handleFocusTutorialPhase}
      />

      {/* Rules & Reaction Guide Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Synthesis Contracts Modal */}
      <ContractsModal
        isOpen={isContractsOpen}
        onClose={() => setIsContractsOpen(false)}
        contracts={gameState.contracts}
        gameState={gameState}
      />

      {/* Victory / Defeat Modal */}
      {gameState.gameStatus !== 'playing' && (
        <GameOverModal
          status={gameState.gameStatus}
          winReason={gameState.winReason}
          lossReason={gameState.lossReason}
          gameState={gameState}
          onRestartGame={handleRestartGame}
        />
      )}
    </div>
  );
}
