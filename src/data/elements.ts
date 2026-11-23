import type { ChemicalElement, ElementCategory } from '../types/lab';

type RawElementTuple = [
  number, // atomicNumber
  string, // symbol
  string, // name
  string, // zhName
  string, // mass
  ElementCategory, // category
  number, // row
  number, // col
  string, // liquidColor
  boolean? // radioactive
];

const RAW_ELEMENTS: RawElementTuple[] = [
  // Period 1
  [1, 'H', 'Hydrogen', '氢', '1.008', 'nonmetal', 1, 1, '#4c8bf5'],
  [2, 'He', 'Helium', '氦', '4.0026', 'noble-gas', 1, 18, '#a5f3fc'],

  // Period 2
  [3, 'Li', 'Lithium', '锂', '6.94', 'alkali-metal', 2, 1, '#f43f5e'],
  [4, 'Be', 'Beryllium', '铍', '9.0122', 'alkaline-earth', 2, 2, '#10b981'],
  [5, 'B', 'Boron', '硼', '10.81', 'metalloid', 2, 13, '#84cc16'],
  [6, 'C', 'Carbon', '碳', '12.011', 'nonmetal', 2, 14, '#a855f7'],
  [7, 'N', 'Nitrogen', '氮', '14.007', 'nonmetal', 2, 15, '#60a5fa'],
  [8, 'O', 'Oxygen', '氧', '15.999', 'nonmetal', 2, 16, '#38bdf8'],
  [9, 'F', 'Fluorine', '氟', '18.998', 'halogen', 2, 17, '#bef264'],
  [10, 'Ne', 'Neon', '氖', '20.180', 'noble-gas', 2, 18, '#22d3ee'],

  // Period 3
  [11, 'Na', 'Sodium', '钠', '22.990', 'alkali-metal', 3, 1, '#facc15'],
  [12, 'Mg', 'Magnesium', '镁', '24.305', 'alkaline-earth', 3, 2, '#e2e8f0'],
  [13, 'Al', 'Aluminum', '铝', '26.982', 'post-transition', 3, 13, '#cbd5e1'],
  [14, 'Si', 'Silicon', '硅', '28.085', 'metalloid', 3, 14, '#6366f1'],
  [15, 'P', 'Phosphorus', '磷', '30.974', 'nonmetal', 3, 15, '#fb923c'],
  [16, 'S', 'Sulfur', '硫', '32.06', 'nonmetal', 3, 16, '#fde047'],
  [17, 'Cl', 'Chlorine', '氯', '35.45', 'halogen', 3, 17, '#a3e635'],
  [18, 'Ar', 'Argon', '氩', '39.948', 'noble-gas', 3, 18, '#34d399'],

  // Period 4
  [19, 'K', 'Potassium', '钾', '39.098', 'alkali-metal', 4, 1, '#c084fc'],
  [20, 'Ca', 'Calcium', '钙', '40.078', 'alkaline-earth', 4, 2, '#fb7185'],
  [21, 'Sc', 'Scandium', '钪', '44.956', 'transition-metal', 4, 3, '#94a3b8'],
  [22, 'Ti', 'Titanium', '钛', '47.867', 'transition-metal', 4, 4, '#64748b'],
  [23, 'V', 'Vanadium', '钒', '50.942', 'transition-metal', 4, 5, '#8b5cf6'],
  [24, 'Cr', 'Chromium', '铬', '51.996', 'transition-metal', 4, 6, '#38bdf8'],
  [25, 'Mn', 'Manganese', '锰', '54.938', 'transition-metal', 4, 7, '#e879f9'],
  [26, 'Fe', 'Iron', '铁', '55.845', 'transition-metal', 4, 8, '#ea580c'],
  [27, 'Co', 'Cobalt', '钴', '58.933', 'transition-metal', 4, 9, '#2563eb'],
  [28, 'Ni', 'Nickel', '镍', '58.693', 'transition-metal', 4, 10, '#4ade80'],
  [29, 'Cu', 'Copper', '铜', '63.546', 'transition-metal', 4, 11, '#2dd4bf'],
  [30, 'Zn', 'Zinc', '锌', '65.38', 'transition-metal', 4, 12, '#93c5fd'],
  [31, 'Ga', 'Gallium', '镓', '69.723', 'post-transition', 4, 13, '#7dd3fc'],
  [32, 'Ge', 'Germanium', '锗', '72.630', 'metalloid', 4, 14, '#818cf8'],
  [33, 'As', 'Arsenic', '砷', '74.922', 'metalloid', 4, 15, '#84cc16'],
  [34, 'Se', 'Selenium', '硒', '78.971', 'nonmetal', 4, 16, '#f97316'],
  [35, 'Br', 'Bromine', '溴', '79.904', 'halogen', 4, 17, '#dc2626'],
  [36, 'Kr', 'Krypton', '氪', '83.798', 'noble-gas', 4, 18, '#818cf8'],

  // Period 5
  [37, 'Rb', 'Rubidium', '铷', '85.468', 'alkali-metal', 5, 1, '#db2777'],
  [38, 'Sr', 'Strontium', '锶', '87.62', 'alkaline-earth', 5, 2, '#ef4444'],
  [39, 'Y', 'Yttrium', '钇', '88.906', 'transition-metal', 5, 3, '#a7f3d0'],
  [40, 'Zr', 'Zirconium', '锆', '91.224', 'transition-metal', 5, 4, '#67e8f9'],
  [41, 'Nb', 'Niobium', '铌', '92.906', 'transition-metal', 5, 5, '#60a5fa'],
  [42, 'Mo', 'Molybdenum', '钼', '95.95', 'transition-metal', 5, 6, '#5eead4'],
  [43, 'Tc', 'Technetium', '锝', '98', 'transition-metal', 5, 7, '#a3e635', true],
  [44, 'Ru', 'Ruthenium', '钌', '101.07', 'transition-metal', 5, 8, '#0ea5e9'],
  [45, 'Rh', 'Rhodium', '铑', '102.91', 'transition-metal', 5, 9, '#f472b6'],
  [46, 'Pd', 'Palladium', '钯', '106.42', 'transition-metal', 5, 10, '#cbd5e1'],
  [47, 'Ag', 'Silver', '银', '107.87', 'transition-metal', 5, 11, '#e2e8f0'],
  [48, 'Cd', 'Cadmium', '镉', '112.41', 'transition-metal', 5, 12, '#fde047'],
  [49, 'In', 'Indium', '铟', '114.82', 'post-transition', 5, 13, '#6366f1'],
  [50, 'Sn', 'Tin', '锡', '118.71', 'post-transition', 5, 14, '#94a3b8'],
  [51, 'Sb', 'Antimony', '锑', '121.76', 'metalloid', 5, 15, '#a78bfa'],
  [52, 'Te', 'Tellurium', '碲', '127.60', 'metalloid', 5, 16, '#c084fc'],
  [53, 'I', 'Iodine', '碘', '126.90', 'halogen', 5, 17, '#9333ea'],
  [54, 'Xe', 'Xenon', '氙', '131.29', 'noble-gas', 5, 18, '#3b82f6'],

  // Period 6
  [55, 'Cs', 'Cesium', '铯', '132.91', 'alkali-metal', 6, 1, '#38bdf8'],
  [56, 'Ba', 'Barium', '钡', '137.33', 'alkaline-earth', 6, 2, '#4ade80'],
  [72, 'Hf', 'Hafnium', '铪', '178.49', 'transition-metal', 6, 4, '#60a5fa'],
  [73, 'Ta', 'Tantalum', '钽', '180.95', 'transition-metal', 6, 5, '#94a3b8'],
  [74, 'W', 'Tungsten', '钨', '183.84', 'transition-metal', 6, 6, '#f59e0b'],
  [75, 'Re', 'Rhenium', '铼', '186.21', 'transition-metal', 6, 7, '#a8a29e'],
  [76, 'Os', 'Osmium', '锇', '190.23', 'transition-metal', 6, 8, '#3b82f6'],
  [77, 'Ir', 'Iridium', '铱', '192.22', 'transition-metal', 6, 9, '#c4b5fd'],
  [78, 'Pt', 'Platinum', '铂', '195.08', 'transition-metal', 6, 10, '#e5e7eb'],
  [79, 'Au', 'Gold', '金', '196.97', 'transition-metal', 6, 11, '#f59e0b'],
  [80, 'Hg', 'Mercury', '汞', '200.59', 'transition-metal', 6, 12, '#94a3b8'],
  [81, 'Tl', 'Thallium', '铊', '204.38', 'post-transition', 6, 13, '#22c55e'],
  [82, 'Pb', 'Lead', '铅', '207.2', 'post-transition', 6, 14, '#64748b'],
  [83, 'Bi', 'Bismuth', '铋', '208.98', 'post-transition', 6, 15, '#ec4899'],
  [84, 'Po', 'Polonium', '钋', '209', 'post-transition', 6, 16, '#84cc16', true],
  [85, 'At', 'Astatine', '砹', '210', 'halogen', 6, 17, '#a855f7', true],
  [86, 'Rn', 'Radon', '氡', '222', 'noble-gas', 6, 18, '#65a30d', true],

  // Period 7
  [87, 'Fr', 'Francium', '钫', '223', 'alkali-metal', 7, 1, '#f43f5e', true],
  [88, 'Ra', 'Radium', '镭', '226', 'alkaline-earth', 7, 2, '#4ade80', true],
  [104, 'Rf', 'Rutherfordium', '𬬻', '267', 'transition-metal', 7, 4, '#22d3ee', true],
  [105, 'Db', 'Dubnium', '𬭊', '268', 'transition-metal', 7, 5, '#38bdf8', true],
  [106, 'Sg', 'Seaborgium', '𬭳', '269', 'transition-metal', 7, 6, '#818cf8', true],
  [107, 'Bh', 'Bohrium', '𬭛', '270', 'transition-metal', 7, 7, '#a855f7', true],
  [108, 'Hs', 'Hassium', '𬭶', '277', 'transition-metal', 7, 8, '#c084fc', true],
  [109, 'Mt', 'Meitnerium', '鿏', '278', 'transition-metal', 7, 9, '#e879f9', true],
  [110, 'Ds', 'Darmstadtium', '𫟼', '281', 'transition-metal', 7, 10, '#f472b6', true],
  [111, 'Rg', 'Roentgenium', '𬬭', '282', 'transition-metal', 7, 11, '#fb7185', true],
  [112, 'Cn', 'Copernicium', '鿔', '285', 'transition-metal', 7, 12, '#fb923c', true],
  [113, 'Nh', 'Nihonium', '鿭', '286', 'post-transition', 7, 13, '#fbbf24', true],
  [114, 'Fl', 'Flerovium', '𫓧', '289', 'post-transition', 7, 14, '#a3e635', true],
  [115, 'Mc', 'Moscovium', '镆', '290', 'post-transition', 7, 15, '#4ade80', true],
  [116, 'Lv', 'Livermorium', '𫟷', '293', 'post-transition', 7, 16, '#2dd4bf', true],
  [117, 'Ts', 'Tennessine', '鿬', '294', 'halogen', 7, 17, '#22d3ee', true],
  [118, 'Og', 'Oganesson', '鿫', '294', 'noble-gas', 7, 18, '#a855f7', true],

  // Lanthanides (Row 8, Cols 3..17)
  [57, 'La', 'Lanthanum', '镧', '138.91', 'lanthanide', 8, 3, '#67e8f9'],
  [58, 'Ce', 'Cerium', '铈', '140.12', 'lanthanide', 8, 4, '#fde047'],
  [59, 'Pr', 'Praseodymium', '镨', '140.91', 'lanthanide', 8, 5, '#4ade80'],
  [60, 'Nd', 'Neodymium', '钕', '144.24', 'lanthanide', 8, 6, '#c084fc'],
  [61, 'Pm', 'Promethium', '钷', '145', 'lanthanide', 8, 7, '#34d399', true],
  [62, 'Sm', 'Samarium', '钐', '150.36', 'lanthanide', 8, 8, '#fbbf24'],
  [63, 'Eu', 'Europium', '铕', '151.96', 'lanthanide', 8, 9, '#f43f5e'],
  [64, 'Gd', 'Gadolinium', '钆', '157.25', 'lanthanide', 8, 10, '#38bdf8'],
  [65, 'Tb', 'Terbium', '铽', '158.93', 'lanthanide', 8, 11, '#22c55e'],
  [66, 'Dy', 'Dysprosium', '镝', '162.50', 'lanthanide', 8, 12, '#a3e635'],
  [67, 'Ho', 'Holmium', '钬', '164.93', 'lanthanide', 8, 13, '#fb923c'],
  [68, 'Er', 'Erbium', '铒', '167.26', 'lanthanide', 8, 14, '#f472b6'],
  [69, 'Tm', 'Thulium', '铥', '168.93', 'lanthanide', 8, 15, '#60a5fa'],
  [70, 'Yb', 'Ytterbium', '镱', '173.05', 'lanthanide', 8, 16, '#818cf8'],
  [71, 'Lu', 'Lutetium', '镥', '174.97', 'lanthanide', 8, 17, '#a78bfa'],

  // Actinides (Row 9, Cols 3..17)
  [89, 'Ac', 'Actinium', '锕', '227', 'actinide', 9, 3, '#38bdf8', true],
  [90, 'Th', 'Thorium', '钍', '232.04', 'actinide', 9, 4, '#22d3ee', true],
  [91, 'Pa', 'Protactinium', '镤', '231.04', 'actinide', 9, 5, '#2dd4bf', true],
  [92, 'U', 'Uranium', '铀', '238.03', 'actinide', 9, 6, '#9be622', true],
  [93, 'Np', 'Neptunium', '镎', '237', 'actinide', 9, 7, '#65a30d', true],
  [94, 'Pu', 'Plutonium', '钚', '244', 'actinide', 9, 8, '#a3e635', true],
  [95, 'Am', 'Americium', '镅', '243', 'actinide', 9, 9, '#facc15', true],
  [96, 'Cm', 'Curium', '锔', '247', 'actinide', 9, 10, '#c084fc', true],
  [97, 'Bk', 'Berkelium', '锫', '247', 'actinide', 9, 11, '#a855f7', true],
  [98, 'Cf', 'Californium', '锎', '251', 'actinide', 9, 12, '#84cc16', true],
  [99, 'Es', 'Einsteinium', '锿', '252', 'actinide', 9, 13, '#38bdf8', true],
  [100, 'Fm', 'Fermium', '镄', '257', 'actinide', 9, 14, '#818cf8', true],
  [101, 'Md', 'Mendelevium', '钔', '258', 'actinide', 9, 15, '#e879f9', true],
  [102, 'No', 'Nobelium', '锘', '259', 'actinide', 9, 16, '#f472b6', true],
  [103, 'Lr', 'Lawrencium', '铹', '266', 'actinide', 9, 17, '#fb7185', true],
];

export const ELEMENTS: ChemicalElement[] = RAW_ELEMENTS.map(
  ([atomicNumber, symbol, name, zhName, mass, category, row, col, liquidColor, radioactive]) => ({
    atomicNumber,
    symbol,
    name,
    zhName,
    mass,
    category,
    row,
    col,
    liquidColor,
    radioactive: Boolean(radioactive),
  })
);

export const ELEMENT_BY_SYMBOL: Record<string, ChemicalElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.symbol, el])
);

export const ELEMENT_BY_NUMBER: Record<number, ChemicalElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.atomicNumber, el])
);

export const CATEGORY_LABELS: Record<ElementCategory, { en: string; zh: string }> = {
  'alkali-metal': { en: 'Alkali metal', zh: '碱金属' },
  'alkaline-earth': { en: 'Alkaline earth', zh: '碱土金属' },
  'transition-metal': { en: 'Transition metal', zh: '过渡金属' },
  'post-transition': { en: 'Post-transition', zh: '后过渡金属' },
  metalloid: { en: 'Metalloid', zh: '类金属' },
  nonmetal: { en: 'Reactive nonmetal', zh: '非金属' },
  halogen: { en: 'Halogen', zh: '卤素' },
  'noble-gas': { en: 'Noble gas', zh: '稀有气体' },
  lanthanide: { en: 'Lanthanide', zh: '镧系元素' },
  actinide: { en: 'Actinide', zh: '锕系元素' },
};
