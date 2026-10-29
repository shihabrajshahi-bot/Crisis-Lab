import {
  Chemist,
  FacilityRoom,
  SynthesisContract,
  ColliderSpace,
  ElementType,
  HazardSpill,
  CrisisCard,
} from '../types/game';

export const INITIAL_CHEMISTS: Chemist[] = [
  {
    id: 'chemist_1',
    name: 'Dr. Maya Lin',
    title: 'Chief Cryo-Chemist',
    color: '#38bdf8', // Cyan
    avatarSeed: 'maya',
    specialty: 'Thermal Inversion',
    specialtyDesc: 'Starts with +2 Thermal Tokens. Can cool molecules to solid state without cost once per round.',
    meeplesAvailable: 2,
    thermalTokens: 4,
    protons: 2,
    electrons: 2,
    coreTokens: 1,
    hand: ['H', 'H', 'O', 'C'],
    deckCount: 6,
    discardCount: 0,
    currentMolecule: null,
    moleculePosition: 1, // Starts at Airlock Alpha
  },
  {
    id: 'chemist_2',
    name: 'Dr. Aris Thorne',
    title: 'Plasma & Subatomic Lead',
    color: '#f59e0b', // Amber
    avatarSeed: 'aris',
    specialty: 'Proton Magnetism',
    specialtyDesc: 'Gains +1 bonus Proton whenever placing a meeple on the Particle Collider.',
    meeplesAvailable: 2,
    thermalTokens: 2,
    protons: 4,
    electrons: 2,
    coreTokens: 1,
    hand: ['H', 'H', 'N', 'O'],
    deckCount: 6,
    discardCount: 0,
    currentMolecule: null,
    moleculePosition: 1,
  },
  {
    id: 'chemist_3',
    name: 'Dr. Samira Vance',
    title: 'Acid-Base Specialist',
    color: '#10b981', // Emerald
    avatarSeed: 'samira',
    specialty: 'Catalytic Neutralization',
    specialtyDesc: 'Reduces hazard spill level by 2 instead of 1 when executing neutralization reactions.',
    meeplesAvailable: 2,
    thermalTokens: 2,
    protons: 2,
    electrons: 3,
    coreTokens: 1,
    hand: ['H', 'H', 'H', 'N'],
    deckCount: 6,
    discardCount: 0,
    currentMolecule: null,
    moleculePosition: 9, // Starts at Bio Airlock
  },
  {
    id: 'chemist_4',
    name: 'Dr. Leo Sterling',
    title: 'Polymerization Engineer',
    color: '#a855f7', // Purple
    avatarSeed: 'leo',
    specialty: 'Valence Resonance',
    specialtyDesc: 'Can rearrange 1 valence bond on the 7-hex workbench during Phase 2 for free.',
    meeplesAvailable: 2,
    thermalTokens: 3,
    protons: 2,
    electrons: 2,
    coreTokens: 2,
    hand: ['C', 'H', 'H', 'O'],
    deckCount: 6,
    discardCount: 0,
    currentMolecule: null,
    moleculePosition: 9,
  },
];

export const INITIAL_COLLIDER_SPACES: ColliderSpace[] = [
  {
    id: 'space_protons',
    name: 'Proton Beam Siphon',
    iconName: 'Atom',
    yieldDesc: '+2 Protons (p+)',
    occupiedByChemistId: null,
    reward: { protons: 2 },
  },
  {
    id: 'space_electrons',
    name: 'Electron Injector Ring',
    iconName: 'Zap',
    yieldDesc: '+2 Electrons (e-)',
    occupiedByChemistId: null,
    reward: { electrons: 2 },
  },
  {
    id: 'space_core',
    name: 'Catalyst Core Breeder',
    iconName: 'Cpu',
    yieldDesc: '+1 Core Token, +1 Thermal Token',
    occupiedByChemistId: null,
    reward: { coreTokens: 1, thermalTokens: 1 },
  },
  {
    id: 'space_thermal',
    name: 'Thermal Exchanger Array',
    iconName: 'Flame',
    yieldDesc: '+3 Thermal Energy Tokens',
    occupiedByChemistId: null,
    reward: { thermalTokens: 3 },
  },
  {
    id: 'space_isotope',
    name: 'Heavy Isotope Harvester',
    iconName: 'Layers',
    yieldDesc: '+1 Proton, +1 Core Token',
    occupiedByChemistId: null,
    reward: { protons: 1, coreTokens: 1 },
  },
  {
    id: 'space_quantum',
    name: 'Subatomic Transmuter',
    iconName: 'Shuffle',
    yieldDesc: '+1 Wild Subatomic Token & +1 Card Draw',
    occupiedByChemistId: null,
    reward: { protons: 1, cardDraw: 1 },
  },
];

export const INITIAL_FACILITY_ROOMS: FacilityRoom[] = [
  {
    id: 0,
    name: 'Reactor Chamber Alpha',
    code: 'SEC-CORE',
    sector: 'Central Power',
    q: 0,
    r: 0,
    type: 'reactor',
    color: '#0284c7',
    description: 'The core facility reactor. Highly vulnerable to runaway meltdown if adjacent hazards breach containment.',
    connections: [
      { targetRoomId: 1, pathType: 'door' },
      { targetRoomId: 2, pathType: 'door' },
      { targetRoomId: 3, pathType: 'pipe' },
      { targetRoomId: 5, pathType: 'vent' },
      { targetRoomId: 8, pathType: 'debris', isDebrisCleared: false },
    ],
  },
  {
    id: 1,
    name: 'Lab Airlock Alpha',
    code: 'AIR-01',
    sector: 'North Entrance',
    q: 0,
    r: -1,
    type: 'airlock',
    color: '#38bdf8',
    description: 'Primary clean airlock. Chief Chemists assemble here to synthesize initial molecules.',
    connections: [
      { targetRoomId: 0, pathType: 'door' },
      { targetRoomId: 4, pathType: 'door' },
      { targetRoomId: 6, pathType: 'door' },
    ],
  },
  {
    id: 2,
    name: 'Extraction Vault',
    code: 'VAULT-X',
    sector: 'Secure Deliveries',
    q: 1,
    r: -1,
    type: 'vault',
    color: '#f59e0b',
    description: 'Target delivery vault for Major Synthesis Contracts. Deliver 3 requested molecules here to win!',
    connections: [
      { targetRoomId: 0, pathType: 'door' },
      { targetRoomId: 4, pathType: 'pipe' },
      { targetRoomId: 7, pathType: 'door' },
    ],
  },
  {
    id: 3,
    name: 'Chemical Pipeline Corridor',
    code: 'PIPE-03',
    sector: 'Conduit Network',
    q: 1,
    r: 0,
    type: 'pipe_junction',
    color: '#06b6d4',
    description: 'Heavy drainage pipelines connect this junction directly to the waste sumps and core.',
    connections: [
      { targetRoomId: 0, pathType: 'pipe' },
      { targetRoomId: 7, pathType: 'door' },
      { targetRoomId: 8, pathType: 'pipe' },
    ],
    hazard: {
      id: 'haz_1',
      roomId: 3,
      name: 'Hydrochloric Acid Leak',
      type: 'acid_spill',
      level: 2,
      requiredProperty: 'base',
      description: 'Corrosive acid eating through floor plating. Must be neutralized with an Alkaline Base (e.g. NH3 or NaOH).',
    },
  },
  {
    id: 4,
    name: 'Cryogenic Cooling Core',
    code: 'CRYO-04',
    sector: 'Cooling Plant',
    q: -1,
    r: -1,
    type: 'lab',
    color: '#67e8f9',
    description: 'Liquid nitrogen heat exchanger. Molecules passing through lose temperature rapidly.',
    connections: [
      { targetRoomId: 1, pathType: 'door' },
      { targetRoomId: 2, pathType: 'pipe' },
      { targetRoomId: 10, pathType: 'vent' },
    ],
  },
  {
    id: 5,
    name: 'Ventilation Hub Gamma',
    code: 'VENT-05',
    sector: 'HVAC Ducting',
    q: -1,
    r: 0,
    type: 'vent_hub',
    color: '#64748b',
    description: 'Central HVAC air circulation turbines. Only molecules in GAS state can enter the air vent ducting.',
    connections: [
      { targetRoomId: 0, pathType: 'vent' },
      { targetRoomId: 6, pathType: 'door' },
      { targetRoomId: 11, pathType: 'vent' },
    ],
    hazard: {
      id: 'haz_2',
      roomId: 5,
      name: 'Superheated Plasma Fire',
      type: 'plasma_fire',
      level: 2,
      requiredProperty: 'fire_suppressant',
      description: 'High-temperature plasma rupture feeding on electrical conduit. Extinguish with Water or Carbon Dioxide.',
    },
  },
  {
    id: 6,
    name: 'Acid Neutralization Sump',
    code: 'ACID-06',
    sector: 'Hazmat Containment',
    q: -1,
    r: 1,
    type: 'storage',
    color: '#84cc16',
    description: 'Automated chemical wash facility designed for hazardous reagents.',
    connections: [
      { targetRoomId: 1, pathType: 'door' },
      { targetRoomId: 5, pathType: 'door' },
      { targetRoomId: 10, pathType: 'door' },
    ],
  },
  {
    id: 7,
    name: 'Toxic Waste Cistern',
    code: 'WASTE-07',
    sector: 'Basement Storage',
    q: 2,
    r: -1,
    type: 'storage',
    color: '#a855f7',
    description: 'Deep subterranean retention tank storing contaminated volatile compounds.',
    connections: [
      { targetRoomId: 2, pathType: 'door' },
      { targetRoomId: 3, pathType: 'door' },
      { targetRoomId: 8, pathType: 'door' },
    ],
  },
  {
    id: 8,
    name: 'Debris-Choked Hallway Beta',
    code: 'HALL-08',
    sector: 'Transit Corridor',
    q: 0,
    r: 1,
    type: 'hallway',
    color: '#475569',
    description: 'Collapsed steel beams block transit! A molecule in SOLID state can smash through this obstruction.',
    connections: [
      { targetRoomId: 0, pathType: 'debris', isDebrisCleared: false },
      { targetRoomId: 3, pathType: 'pipe' },
      { targetRoomId: 7, pathType: 'door' },
      { targetRoomId: 9, pathType: 'door' },
    ],
  },
  {
    id: 9,
    name: 'Bio-Airlock Beta',
    code: 'AIR-02',
    sector: 'South Outpost',
    q: 1,
    r: 1,
    type: 'airlock',
    color: '#10b981',
    description: 'Secondary emergency airlock equipped with decontamination washdown nozzles.',
    connections: [
      { targetRoomId: 8, pathType: 'door' },
      { targetRoomId: 11, pathType: 'door' },
    ],
  },
  {
    id: 10,
    name: 'Catalytic Synthesis Lab',
    code: 'LAB-10',
    sector: 'R&D Wing',
    q: -2,
    r: 0,
    type: 'lab',
    color: '#eab308',
    description: 'Advanced organic synthesis bench fitted with precision spectroscopy sensors.',
    connections: [
      { targetRoomId: 4, pathType: 'vent' },
      { targetRoomId: 6, pathType: 'door' },
      { targetRoomId: 11, pathType: 'door' },
    ],
  },
  {
    id: 11,
    name: 'Secondary Filtration Duct',
    code: 'DUCT-11',
    sector: 'HVAC Ducting',
    q: -1,
    r: 2,
    type: 'vent_hub',
    color: '#334155',
    description: 'Auxiliary air scrubbers purifying exhaust fumes before atmospheric release.',
    connections: [
      { targetRoomId: 5, pathType: 'vent' },
      { targetRoomId: 9, pathType: 'door' },
      { targetRoomId: 10, pathType: 'door' },
    ],
  },
];

export const INITIAL_CONTRACTS: SynthesisContract[] = [
  {
    id: 'contract_1',
    title: 'Emergency Scrubber Matrix',
    targetFormula: 'NH3',
    targetName: 'Ammonia or Urea (Scrubber Base)',
    rewardText: '-2 Facility Toxicity & Clear 1 Level-2 Hazard',
    fulfilled: false,
    lore: 'The main air scrubbers are saturated with acid fumes. Deliver Ammonia (NH3) to the Extraction Vault to recharge the scrubbers.',
  },
  {
    id: 'contract_2',
    title: 'Cooling Quench Agent',
    targetFormula: 'H2O',
    targetName: 'Water (Liquid State)',
    requiredState: 'liquid',
    rewardText: '-2 Facility Toxicity & All Chemists gain +2 Thermal Energy',
    fulfilled: false,
    lore: 'The coolant reservoirs are nearly dry. Synthesize pure Water (H2O) and deliver it in LIQUID state to the Extraction Vault.',
  },
  {
    id: 'contract_3',
    title: 'Inert Blanket Blanket',
    targetFormula: 'CO2',
    targetName: 'Carbon Dioxide (Gas State)',
    requiredState: 'gas',
    rewardText: '-3 Facility Toxicity & Quench all fires in adjacent rooms',
    fulfilled: false,
    lore: 'A high-pressure CO2 vapor blanket is urgently required at the Extraction Vault to prevent atmospheric explosion.',
  },
  {
    id: 'contract_4',
    title: 'Sterilization Super-Oxidizer',
    targetFormula: 'H2O2',
    targetName: 'Hydrogen Peroxide (H2O2)',
    rewardText: 'Instantly eliminate all Level-1 Hazards across the facility',
    fulfilled: false,
    lore: 'High-grade antiseptic oxidizer needed to sanitize bio-ducts and break down stubborn toxic sludge.',
  },
];

export const INITIAL_MARKET_DECK: ElementType[] = [
  'C', 'C', 'C', 'N', 'N', 'O', 'O', 'O', 'H', 'H', 'H', 'Na', 'Na', 'Cl', 'Cl', 'S', 'S', 'O', 'C', 'N'
];

export const CRISIS_CARDS: CrisisCard[] = [
  {
    id: 'crisis_1',
    title: 'Acid Tank Overpressure',
    description: 'Corrosive fumes breach pipe seals! +1 Spill Level to nearest acid spill.',
    flavorText: 'Sensors in the conduit network report severe pressure surges.',
    effect: (state) => {
      const rooms = [...state.facilityRooms];
      const acidRoom = rooms.find((r) => r.hazard?.type === 'acid_spill');
      if (acidRoom && acidRoom.hazard && acidRoom.hazard.level < 3) {
        acidRoom.hazard.level = (acidRoom.hazard.level + 1) as 1 | 2 | 3;
      }
      return { facilityRooms: rooms, toxicityTrack: Math.min(10, state.toxicityTrack + 1) };
    },
  },
  {
    id: 'crisis_2',
    title: 'Ventilation Fan Short-Circuit',
    description: 'Sparks ignite toxic vapor in the HVAC ducting. Level 1 Plasma Fire erupts in Sector Gamma.',
    flavorText: 'An electrical arc ignites stagnant gas pockets.',
    effect: (state) => {
      const rooms = [...state.facilityRooms];
      const ventRoom = rooms.find((r) => r.type === 'vent_hub' && !r.hazard);
      if (ventRoom) {
        ventRoom.hazard = {
          id: `haz_${Date.now()}`,
          roomId: ventRoom.id,
          name: 'HVAC Plasma Fire',
          type: 'plasma_fire',
          level: 1,
          requiredProperty: 'fire_suppressant',
          description: 'Flames licking at air duct grates.',
        };
      }
      return { facilityRooms: rooms, toxicityTrack: Math.min(10, state.toxicityTrack + 1) };
    },
  },
  {
    id: 'crisis_3',
    title: 'Thermal Core Flare',
    description: 'Radiation spike elevates facility temperature! +1 Toxicity and all chemists lose 1 Thermal Token.',
    flavorText: 'The containment shielding flickers under intense neutron bombardment.',
    effect: (state) => {
      const chemists = state.chemists.map((c) => ({
        ...c,
        thermalTokens: Math.max(0, c.thermalTokens - 1),
      }));
      return { chemists, toxicityTrack: Math.min(10, state.toxicityTrack + 1) };
    },
  },
  {
    id: 'crisis_4',
    title: 'Drainage Conduit Siphon Failure',
    description: 'Backflow in drainage pipes! Level 2 Toxic Vapor spreads to adjacent room.',
    flavorText: 'Automatic check valves have jammed open under chemical sediment.',
    effect: (state) => {
      const rooms = [...state.facilityRooms];
      const pipeRoom = rooms.find((r) => r.type === 'pipe_junction' && !r.hazard);
      if (pipeRoom) {
        pipeRoom.hazard = {
          id: `haz_${Date.now()}`,
          roomId: pipeRoom.id,
          name: 'Drainage Toxic Vapor',
          type: 'toxic_vapor',
          level: 2,
          requiredProperty: 'oxidizer',
          description: 'Noxious gas cloud billowing from floor drains.',
        };
      }
      return { facilityRooms: rooms, toxicityTrack: Math.min(10, state.toxicityTrack + 1) };
    },
  },
];
