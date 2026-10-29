export type ElementType = 'H' | 'O' | 'C' | 'N' | 'Na' | 'Cl' | 'S';

export interface ElementData {
  symbol: ElementType;
  name: string;
  atomicNumber: number;
  valenceElectrons: number;
  requiredBonds: number; // Duet = 1 for H, Octet = 2 for O, 3 for N, 4 for C, 1 for Cl/Na, 2 for S
  cost: {
    protons: number;
    electrons: number;
    coreTokens: number;
  };
  color: string;
  glowColor: string;
  description: string;
}

export type StateOfMatter = 'solid' | 'liquid' | 'gas';

export interface BondedMolecule {
  name: string;
  formula: string;
  atoms: { element: ElementType; hexIndex: number }[];
  bonds: { fromHex: number; toHex: number; order: 1 | 2 | 3 }[];
  meltingPoint: number; // in Celsius
  boilingPoint: number; // in Celsius
  currentTemp: number; // in Celsius (starts at 20°C room temp)
  state: StateOfMatter;
  properties: ('acid' | 'base' | 'oxidizer' | 'solvent' | 'fire_suppressant' | 'fuel' | 'salt')[];
  description: string;
}

export interface Chemist {
  id: string;
  name: string;
  title: string;
  color: string;
  avatarSeed: string;
  specialty: string;
  specialtyDesc: string;
  meeplesAvailable: number;
  thermalTokens: number;
  protons: number;
  electrons: number;
  coreTokens: number;
  hand: ElementType[];
  deckCount: number;
  discardCount: number;
  currentMolecule: BondedMolecule | null;
  moleculePosition: number; // Hex room ID on central map
}

export type HazardType = 'acid_spill' | 'plasma_fire' | 'toxic_vapor' | 'corrosive_sludge';

export interface HazardSpill {
  id: string;
  roomId: number;
  name: string;
  type: HazardType;
  level: 1 | 2 | 3;
  requiredProperty: 'base' | 'fire_suppressant' | 'oxidizer' | 'solvent';
  requiredState?: StateOfMatter;
  description: string;
}

export type PathType = 'door' | 'pipe' | 'vent' | 'debris';

export interface RoomConnection {
  targetRoomId: number;
  pathType: PathType;
  isDebrisCleared?: boolean;
}

export interface FacilityRoom {
  id: number;
  name: string;
  code: string;
  sector: string;
  q: number; // axial hex coords
  r: number;
  type: 'airlock' | 'vault' | 'reactor' | 'lab' | 'vent_hub' | 'pipe_junction' | 'storage' | 'hallway';
  connections: RoomConnection[];
  hazard?: HazardSpill;
  color: string;
  description: string;
}

export interface SynthesisContract {
  id: string;
  title: string;
  targetFormula: string;
  targetName: string;
  requiredState?: StateOfMatter;
  rewardText: string;
  fulfilled: boolean;
  fulfilledBy?: string;
  lore: string;
}

export interface ColliderSpace {
  id: string;
  name: string;
  iconName: string;
  yieldDesc: string;
  occupiedByChemistId: string | null;
  reward: {
    protons?: number;
    electrons?: number;
    coreTokens?: number;
    thermalTokens?: number;
    cardDraw?: number;
  };
}

export type GamePhase = 'collider' | 'workbench' | 'thermal' | 'react';

export interface CrisisCard {
  id: string;
  title: string;
  description: string;
  effect: (gameState: GameState) => Partial<GameState>;
  flavorText: string;
}

export interface GameState {
  round: number;
  phase: GamePhase;
  activeChemistIndex: number;
  chemists: Chemist[];
  toxicityTrack: number; // 0 to 10
  contracts: SynthesisContract[];
  elementMarket: ElementType[];
  marketDeckCount: number;
  facilityRooms: FacilityRoom[];
  colliderSpaces: ColliderSpace[];
  escalationLog: string[];
  gameStatus: 'playing' | 'won' | 'lost';
  winReason?: string;
  lossReason?: string;
}
