// lib/constants.ts

export const CATEGORY_TYPES: Record<string, string[]> = {
  FURNITURE:   ['Chair', 'Table', 'Bed Frame', 'Sofa', 'Desk', 'Wardrobe', 'Headboard', 'Sideboard', 'Ottoman', 'Other'],
  LINEN:       ['Bedsheet', 'Duvet', 'Pillow', 'Towel', 'Curtain', 'Tablecloth', 'Cushion', 'Bathmat', 'Other'],
  ELECTRONICS: ['TV', 'Telephone', 'Bedside Lamp', 'Minibar', 'Safe', 'Coffee Machine', 'Hairdryer', 'Other'],
  KITCHEN:     ['Crockery', 'Cutlery', 'Glassware', 'Cookware', 'Trolley', 'Chafing Dish', 'Other'],
  FIXTURES:    ['Mirror', 'Artwork', 'Light Fitting', 'Bathroom Fitting', 'Signage', 'Other'],
  OTHER:       ['Other'],
};

export const CONDITION_OPTIONS = [
  { code: 'A', label: 'New / Unused', desc: 'Never used. No wear.',                      color: 'bg-emerald-500', border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { code: 'B', label: 'Good',         desc: 'Normal wear. Fully functional.',             color: 'bg-teal-500',    border: 'border-teal-300',    bg: 'bg-teal-50',    text: 'text-teal-700'    },
  { code: 'C', label: 'Fair',         desc: 'Visible wear or minor damage. Functional.',  color: 'bg-amber-500',   border: 'border-amber-300',   bg: 'bg-amber-50',   text: 'text-amber-700'   },
  { code: 'D', label: 'Poor',         desc: 'Significant damage or functional issues.',   color: 'bg-red-500',     border: 'border-red-300',     bg: 'bg-red-50',     text: 'text-red-700'     },
];

export const DEPARTMENT_LABELS: Record<string, string> = {
  ROOMS: 'Rooms & Housekeeping', FNB: 'Food & Beverage',
  EVENTS: 'Events & Conference', SPA: 'Spa & Wellness',
  BACK_OF_HOUSE: 'Back of House', GENERAL: 'General',
};

// ESG weight (kg/unit) — placeholder values, validate vs WRAP Hospitality before external reporting
export const ASSET_WEIGHT_KG: Record<string, number> = {
  'Chair': 8, 'Table': 25, 'Bed Frame': 40, 'Sofa': 60, 'Desk': 20,
  'Wardrobe': 55, 'Headboard': 15, 'Sideboard': 35, 'Ottoman': 12,
  'Bedsheet': 0.8, 'Duvet': 2.5, 'Pillow': 1.2, 'Towel': 0.6,
  'TV': 12, 'Telephone': 0.5, 'Coffee Machine': 4,
  'Crockery': 0.4, 'Cutlery': 0.1, 'Glassware': 0.3, 'Trolley': 15,
  'Mirror': 8, 'Artwork': 3, 'Light Fitting': 4,
};

// CO2 factor (kg CO2 saved per kg diverted from landfill)
export const CO2_FACTOR: Record<string, number> = {
  FURNITURE: 2.5, LINEN: 3.1, ELECTRONICS: 8.0, KITCHEN: 1.8, FIXTURES: 2.0, OTHER: 2.0,
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft', PENDING_DEPT_APPROVAL: 'Pending Approval',
  PENDING_GM_APPROVAL: 'Pending GM Sign-off', APPROVED: 'Approved',
  REJECTED: 'Rejected', LISTED: 'Listed', COMPLETED: 'Completed',
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT:                  'bg-gray-100 text-gray-600',
  PENDING_DEPT_APPROVAL:  'bg-amber-100 text-amber-700',
  PENDING_GM_APPROVAL:    'bg-blue-100 text-blue-700',
  APPROVED:               'bg-green-100 text-green-700',
  REJECTED:               'bg-red-100 text-red-700',
  LISTED:                 'bg-purple-100 text-purple-700',
  COMPLETED:              'bg-emerald-100 text-emerald-700',
};
