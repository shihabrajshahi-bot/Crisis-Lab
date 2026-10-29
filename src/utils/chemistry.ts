import { ElementType, ElementData, BondedMolecule, StateOfMatter } from '../types/game';

export const ELEMENTS: Record<ElementType, ElementData> = {
  H: {
    symbol: 'H',
    name: 'Hydrogen',
    atomicNumber: 1,
    valenceElectrons: 1,
    requiredBonds: 1, // Duet rule
    cost: { protons: 1, electrons: 1, coreTokens: 0 },
    color: '#38bdf8', // Sky blue
    glowColor: 'rgba(56, 189, 248, 0.4)',
    description: 'Lightest element. Requires exactly 1 bond to satisfy the Duet Rule.',
  },
  O: {
    symbol: 'O',
    name: 'Oxygen',
    atomicNumber: 8,
    valenceElectrons: 6,
    requiredBonds: 2, // Needs 2 bonds
    cost: { protons: 2, electrons: 2, coreTokens: 1 },
    color: '#ef4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.4)',
    description: 'High electronegativity. Forms 2 single bonds or 1 double bond.',
  },
  C: {
    symbol: 'C',
    name: 'Carbon',
    atomicNumber: 6,
    valenceElectrons: 4,
    requiredBonds: 4, // Needs 4 bonds
    cost: { protons: 3, electrons: 2, coreTokens: 2 },
    color: '#334155', // Slate/Dark Charcoal
    glowColor: 'rgba(71, 85, 105, 0.4)',
    description: 'Backbone of organic synthesis. Forms up to 4 strong covalent bonds.',
  },
  N: {
    symbol: 'N',
    name: 'Nitrogen',
    atomicNumber: 7,
    valenceElectrons: 5,
    requiredBonds: 3, // Needs 3 bonds
    cost: { protons: 2, electrons: 3, coreTokens: 1 },
    color: '#3b82f6', // Royal Blue
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Pivotal for ammonia scrubbers. Forms 3 single bonds, or triple bonds.',
  },
  Na: {
    symbol: 'Na',
    name: 'Sodium',
    atomicNumber: 11,
    valenceElectrons: 1,
    requiredBonds: 1,
    cost: { protons: 3, electrons: 1, coreTokens: 2 },
    color: '#a855f7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Reactive alkali metal. Forms ionic salt lattice and strong hydroxides.',
  },
  Cl: {
    symbol: 'Cl',
    name: 'Chlorine',
    atomicNumber: 17,
    valenceElectrons: 7,
    requiredBonds: 1,
    cost: { protons: 3, electrons: 3, coreTokens: 2 },
    color: '#84cc16', // Lime green
    glowColor: 'rgba(132, 204, 22, 0.4)',
    description: 'Potent halogen. Readily satisfies octet with 1 covalent or ionic bond.',
  },
  S: {
    symbol: 'S',
    name: 'Sulfur',
    atomicNumber: 16,
    valenceElectrons: 6,
    requiredBonds: 2,
    cost: { protons: 3, electrons: 2, coreTokens: 3 },
    color: '#f59e0b', // Amber/Yellow
    glowColor: 'rgba(245, 158, 11, 0.4)',
    description: 'Reactive chalcogen. Forms stable 2-bond links or heavy compounds.',
  },
};

// 7-Hex personal workbench adjacency lookup
// Center is 0, outer rings are 1 through 6
export const WORKBENCH_NEIGHBORS: Record<number, number[]> = {
  0: [1, 2, 3, 4, 5, 6],
  1: [0, 6, 2],
  2: [0, 1, 3],
  3: [0, 2, 4],
  4: [0, 3, 5],
  5: [0, 4, 6],
  6: [0, 5, 1],
};

export interface HexBond {
  fromHex: number;
  toHex: number;
  order: 1 | 2 | 3;
}

export interface PlacedAtom {
  hexIndex: number;
  element: ElementType;
}

// Known molecules database for Catalyst: Crisis Lab
export interface MoleculeDefinition {
  formula: string;
  name: string;
  composition: Record<ElementType, number>;
  meltingPoint: number; // °C
  boilingPoint: number; // °C
  properties: ('acid' | 'base' | 'oxidizer' | 'solvent' | 'fire_suppressant' | 'fuel' | 'salt')[];
  description: string;
}

export const KNOWN_MOLECULES: MoleculeDefinition[] = [
  {
    formula: 'H2O',
    name: 'Water (Hydration Agent)',
    composition: { H: 2, O: 1, C: 0, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: 0,
    boilingPoint: 100,
    properties: ['solvent', 'fire_suppressant'],
    description: 'Universal solvent and thermal dampener. In liquid state it quenches plasma fires and dilutes corrosive spills.',
  },
  {
    formula: 'CO2',
    name: 'Carbon Dioxide (Inert Blanket)',
    composition: { H: 0, O: 2, C: 1, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -78,
    boilingPoint: -57, // Sublimation at -78
    properties: ['fire_suppressant'],
    description: 'Dense, non-flammable gas that starves plasma fires of oxygen.',
  },
  {
    formula: 'NH3',
    name: 'Ammonia (Alkaline Neutralizer)',
    composition: { H: 3, O: 0, C: 0, N: 1, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -77,
    boilingPoint: -33,
    properties: ['base'],
    description: 'Potent basic compound. Neutralizes corrosive acid spills instantly into harmless salts.',
  },
  {
    formula: 'CH4',
    name: 'Methane (Light Hydrocarbon)',
    composition: { H: 4, O: 0, C: 1, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -182,
    boilingPoint: -161,
    properties: ['fuel'],
    description: 'Clean combustible propellant required for Extraction Vault high-yield thrusters.',
  },
  {
    formula: 'O2',
    name: 'Dioxygen (Oxidizing Gas)',
    composition: { H: 0, O: 2, C: 0, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -218,
    boilingPoint: -183,
    properties: ['oxidizer'],
    description: 'High-purity oxygen. Rapidly oxidizes toxic organic bio-sludge in ventilation pipes.',
  },
  {
    formula: 'N2',
    name: 'Nitrogen Gas (Cryo-Inert)',
    composition: { H: 0, O: 0, C: 0, N: 2, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -210,
    boilingPoint: -196,
    properties: ['fire_suppressant'],
    description: 'Inert cryogenic coolant. Stabilizes superheated reactor cores.',
  },
  {
    formula: 'HCl',
    name: 'Hydrochloric Vapor',
    composition: { H: 1, O: 0, C: 0, N: 0, Na: 0, Cl: 1, S: 0 },
    meltingPoint: -114,
    boilingPoint: -85,
    properties: ['acid'],
    description: 'Pungent acidic vapor used to digest metallic debris or neutralize excess alkaline buildup.',
  },
  {
    formula: 'NaOH',
    name: 'Sodium Hydroxide (Caustic Lye)',
    composition: { H: 1, O: 1, C: 0, N: 0, Na: 1, Cl: 0, S: 0 },
    meltingPoint: 318,
    boilingPoint: 1388,
    properties: ['base'],
    description: 'Heavy alkaline solid at room temp. Smashes physical blockages and obliterates severe acid hazards.',
  },
  {
    formula: 'NaCl',
    name: 'Sodium Chloride (Halite Salt)',
    composition: { H: 0, O: 0, C: 0, N: 0, Na: 1, Cl: 1, S: 0 },
    meltingPoint: 801,
    boilingPoint: 1465,
    properties: ['salt'],
    description: 'Stabilized ionic crystal. Non-toxic and structurally durable in solid phase.',
  },
  {
    formula: 'H2O2',
    name: 'Hydrogen Peroxide (Super-Oxidizer)',
    composition: { H: 2, O: 2, C: 0, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -0.4,
    boilingPoint: 150,
    properties: ['oxidizer', 'solvent'],
    description: 'Unstable oxidizer that decomposes into oxygen and water while sterilizing toxic vapor clouds.',
  },
  {
    formula: 'C2H6O',
    name: 'Ethanol (Extraction Solvent)',
    composition: { H: 6, O: 1, C: 2, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -114,
    boilingPoint: 78,
    properties: ['solvent', 'fuel'],
    description: 'Major contract target! High volatility solvent capable of flushing chemical sludge from pipe conduits.',
  },
  {
    formula: 'CH4N2O',
    name: 'Urea (Scrubber Matrix)',
    composition: { H: 4, O: 1, C: 1, N: 2, Na: 0, Cl: 0, S: 0 },
    meltingPoint: 133,
    boilingPoint: 196,
    properties: ['base'],
    description: 'Critical Major Synthesis Contract! High-efficiency nitrogen scrubber capable of neutralizing core fallout.',
  },
  {
    formula: 'O3',
    name: 'Ozone (High-Energy Radical)',
    composition: { H: 0, O: 3, C: 0, N: 0, Na: 0, Cl: 0, S: 0 },
    meltingPoint: -193,
    boilingPoint: -112,
    properties: ['oxidizer'],
    description: 'Major Synthesis target! Powerful atmospheric oxidizer that purges airborne contaminants from vents.',
  },
  {
    formula: 'H2S',
    name: 'Hydrogen Sulfide',
    composition: { H: 2, O: 0, C: 0, N: 0, Na: 0, Cl: 0, S: 1 },
    meltingPoint: -82,
    boilingPoint: -60,
    properties: ['acid'],
    description: 'Chalcogen gas used in specialized catalytic scrubbing reactions.',
  },
];

export function getStateOfMatter(tempC: number, meltingPoint: number, boilingPoint: number): StateOfMatter {
  if (tempC < meltingPoint) return 'solid';
  if (tempC < boilingPoint) return 'liquid';
  return 'gas';
}

export function validateValenceWorkbench(
  atoms: PlacedAtom[],
  bonds: HexBond[]
): {
  isValid: boolean;
  errors: string[];
  molecule: BondedMolecule | null;
} {
  if (atoms.length === 0) {
    return { isValid: false, errors: ['Workbench is empty. Place atom tiles.'], molecule: null };
  }

  const errors: string[] = [];
  const atomByHex = new Map<number, PlacedAtom>();
  for (const a of atoms) {
    if (atomByHex.has(a.hexIndex)) {
      errors.push(`Multiple atoms occupying hex slot #${a.hexIndex}.`);
    }
    atomByHex.set(a.hexIndex, a);
  }

  // Count bonds per atom
  const bondsPerHex = new Map<number, number>();
  for (const a of atoms) {
    bondsPerHex.set(a.hexIndex, 0);
  }

  // Validate bonds
  for (const b of bonds) {
    if (!atomByHex.has(b.fromHex) || !atomByHex.has(b.toHex)) {
      errors.push(`Bond connects to an empty hex (#${b.fromHex} to #${b.toHex}).`);
      continue;
    }
    // Check adjacency
    const neighbors = WORKBENCH_NEIGHBORS[b.fromHex] || [];
    if (!neighbors.includes(b.toHex)) {
      errors.push(`Hex #${b.fromHex} and #${b.toHex} are not adjacent tiles.`);
    }

    const currentFrom = bondsPerHex.get(b.fromHex) || 0;
    const currentTo = bondsPerHex.get(b.toHex) || 0;
    bondsPerHex.set(b.fromHex, currentFrom + b.order);
    bondsPerHex.set(b.toHex, currentTo + b.order);
  }

  // Check Octet / Duet rule for each atom
  for (const a of atoms) {
    const data = ELEMENTS[a.element];
    const currentBonds = bondsPerHex.get(a.hexIndex) || 0;
    const required = data.requiredBonds;

    if (currentBonds < required) {
      errors.push(`${data.name} on hex #${a.hexIndex} has ${currentBonds}/${required} bonds (unfilled valence prongs).`);
    } else if (currentBonds > required) {
      errors.push(`${data.name} on hex #${a.hexIndex} has ${currentBonds}/${required} bonds (octet/duet exceeded!).`);
    }
  }

  // Check graph connectivity: All atoms must form a single connected molecule
  if (atoms.length > 1 && errors.length === 0) {
    const visited = new Set<number>();
    const queue = [atoms[0].hexIndex];
    visited.add(atoms[0].hexIndex);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const b of bonds) {
        let neighbor = -1;
        if (b.fromHex === curr) neighbor = b.toHex;
        else if (b.toHex === curr) neighbor = b.fromHex;

        if (neighbor !== -1 && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    if (visited.size < atoms.length) {
      errors.push('Disconnected atoms detected. All atoms in the molecule must be bonded into a single structure.');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, molecule: null };
  }

  // Calculate empirical composition
  const composition: Record<ElementType, number> = { H: 0, O: 0, C: 0, N: 0, Na: 0, Cl: 0, S: 0 };
  for (const a of atoms) {
    composition[a.element]++;
  }

  // Match known molecule or compute generic compound
  const matched = KNOWN_MOLECULES.find((km) => {
    return (
      km.composition.H === composition.H &&
      km.composition.O === composition.O &&
      km.composition.C === composition.C &&
      km.composition.N === composition.N &&
      km.composition.Na === composition.Na &&
      km.composition.Cl === composition.Cl &&
      km.composition.S === composition.S
    );
  });

  const formula = matched ? matched.formula : generateEmpiricalFormula(composition);
  const name = matched ? matched.name : `Synthesized Compound (${formula})`;
  const meltingPoint = matched ? matched.meltingPoint : 15;
  const boilingPoint = matched ? matched.boilingPoint : 85;
  const currentTemp = 20; // Default 20°C room temp
  const state = getStateOfMatter(currentTemp, meltingPoint, boilingPoint);
  const properties: BondedMolecule['properties'] = matched ? matched.properties : ['solvent'];
  const description = matched
    ? matched.description
    : `Custom engineered molecule with ${atoms.length} atoms. Fully stable Octet/Duet configuration.`;

  const molecule: BondedMolecule = {
    name,
    formula,
    atoms: atoms.map((a) => ({ element: a.element, hexIndex: a.hexIndex })),
    bonds: bonds.map((b) => ({ fromHex: b.fromHex, toHex: b.toHex, order: b.order })),
    meltingPoint,
    boilingPoint,
    currentTemp,
    state,
    properties,
    description,
  };

  return { isValid: true, errors: [], molecule };
}

function generateEmpiricalFormula(comp: Record<ElementType, number>): string {
  // Hill system: C then H then alphabetical
  let f = '';
  if (comp.C > 0) f += `C${comp.C > 1 ? comp.C : ''}`;
  if (comp.H > 0) f += `H${comp.H > 1 ? comp.H : ''}`;
  const others: ElementType[] = ['Cl', 'N', 'Na', 'O', 'S'];
  for (const el of others) {
    if (comp[el] > 0) {
      f += `${el}${comp[el] > 1 ? comp[el] : ''}`;
    }
  }
  return f || 'Unknown';
}
