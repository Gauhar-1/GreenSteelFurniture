export interface CategoryTheme {
  key: string;
  moodLabel: string;
  moodLabelHi: string;
  bgSurface: string;
  bgCard: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  borderTint: string;
  slot3Label: string; // Dynamic 3rd tab label on the visual stage
}

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  bedroom: {
    key: "bedroom",
    moodLabel: "Warm Sanctuary",
    moodLabelHi: "शांत शयनकक्ष संग्रह",
    bgSurface: "#F7F4EF", // Warm Limestone
    bgCard: "#FFFFFF",
    accentHex: "#9A3412", // Terracotta
    badgeBg: "#FDF2E9",
    badgeText: "#9A3412",
    borderTint: "rgba(154, 52, 18, 0.15)",
    slot3Label: "Inside Locker",
  },
  wardrobe: {
    key: "wardrobe",
    moodLabel: "Warm Sanctuary",
    moodLabelHi: "अलमारी और तिजोरी",
    bgSurface: "#F7F4EF",
    bgCard: "#FFFFFF",
    accentHex: "#9A3412",
    badgeBg: "#FDF2E9",
    badgeText: "#9A3412",
    borderTint: "rgba(154, 52, 18, 0.15)",
    slot3Label: "Inside Locker",
  },
  bed: {
    key: "bed",
    moodLabel: "Rest & Architecture",
    moodLabelHi: "मजबूत स्टील पलंग",
    bgSurface: "#F5F2EB",
    bgCard: "#FFFFFF",
    accentHex: "#854D0E", // Warm bronze
    badgeBg: "#FEF9C3",
    badgeText: "#854D0E",
    borderTint: "rgba(133, 77, 14, 0.15)",
    slot3Label: "Storage View",
  },
  "living-room": {
    key: "living-room",
    moodLabel: "Architectural Gallery",
    moodLabelHi: "आधुनिक बैठक संग्रह",
    bgSurface: "#F2F4F7", // Slate limestone
    bgCard: "#FFFFFF",
    accentHex: "#1E3A5F", // Navy steel
    badgeBg: "#EFF6FF",
    badgeText: "#1E3A5F",
    borderTint: "rgba(30, 58, 95, 0.15)",
    slot3Label: "Side Profile",
  },
  "living-lounge": {
    key: "living-lounge",
    moodLabel: "Architectural Gallery",
    moodLabelHi: "आधुनिक बैठक संग्रह",
    bgSurface: "#F2F4F7",
    bgCard: "#FFFFFF",
    accentHex: "#1E3A5F",
    badgeBg: "#EFF6FF",
    badgeText: "#1E3A5F",
    borderTint: "rgba(30, 58, 95, 0.15)",
    slot3Label: "Side Profile",
  },
  seating: {
    key: "seating",
    moodLabel: "Architectural Gallery",
    moodLabelHi: "बैठक फर्नीचर",
    bgSurface: "#F2F4F7",
    bgCard: "#FFFFFF",
    accentHex: "#1E3A5F",
    badgeBg: "#EFF6FF",
    badgeText: "#1E3A5F",
    borderTint: "rgba(30, 58, 95, 0.15)",
    slot3Label: "Side Profile",
  },
  dining: {
    key: "dining",
    moodLabel: "Gathering Hearth",
    moodLabelHi: "डाइनिंग और भोजन कक्ष",
    bgSurface: "#FBF6F0",
    bgCard: "#FFFFFF",
    accentHex: "#78350F", // Amber bronze
    badgeBg: "#FEF3C7",
    badgeText: "#78350F",
    borderTint: "rgba(120, 53, 15, 0.15)",
    slot3Label: "Joinery View",
  },
  "dining-space": {
    key: "dining-space",
    moodLabel: "Gathering Hearth",
    moodLabelHi: "डाइनिंग और भोजन कक्ष",
    bgSurface: "#FBF6F0",
    bgCard: "#FFFFFF",
    accentHex: "#78350F",
    badgeBg: "#FEF3C7",
    badgeText: "#78350F",
    borderTint: "rgba(120, 53, 15, 0.15)",
    slot3Label: "Joinery View",
  },
  table: {
    key: "table",
    moodLabel: "Gathering Hearth",
    moodLabelHi: "शुद्ध स्टील टेबल",
    bgSurface: "#FBF6F0",
    bgCard: "#FFFFFF",
    accentHex: "#78350F",
    badgeBg: "#FEF3C7",
    badgeText: "#78350F",
    borderTint: "rgba(120, 53, 15, 0.15)",
    slot3Label: "Joinery View",
  },
  workspace: {
    key: "workspace",
    moodLabel: "Focused Studio",
    moodLabelHi: "कार्यालय और अध्ययन",
    bgSurface: "#F3F4F6", // Matte steel
    bgCard: "#FFFFFF",
    accentHex: "#1F2937", // Charcoal
    badgeBg: "#F3F4F6",
    badgeText: "#1F2937",
    borderTint: "rgba(31, 41, 55, 0.15)",
    slot3Label: "Drawer Mechanism",
  },
  "home-office-study": {
    key: "home-office-study",
    moodLabel: "Focused Studio",
    moodLabelHi: "कार्यालय और अध्ययन",
    bgSurface: "#F3F4F6",
    bgCard: "#FFFFFF",
    accentHex: "#1F2937",
    badgeBg: "#F3F4F6",
    badgeText: "#1F2937",
    borderTint: "rgba(31, 41, 55, 0.15)",
    slot3Label: "Drawer Mechanism",
  },
  storage: {
    key: "storage",
    moodLabel: "Vault & Organization",
    moodLabelHi: "सुरक्षित स्टोरेज सिस्टम",
    bgSurface: "#F4F4F5",
    bgCard: "#FFFFFF",
    accentHex: "#27272A",
    badgeBg: "#F4F4F5",
    badgeText: "#27272A",
    borderTint: "rgba(39, 39, 42, 0.15)",
    slot3Label: "Inside Shelving",
  },
};

/**
 * Resolves category theme based on slug or blueprint type with safe fallback
 */
export function getCategoryTheme(slugOrBlueprint?: string | null): CategoryTheme {
  if (!slugOrBlueprint) {
    return CATEGORY_THEMES.bedroom;
  }

  const normalized = slugOrBlueprint.toLowerCase().trim();
  if (CATEGORY_THEMES[normalized]) {
    return CATEGORY_THEMES[normalized];
  }

  // Check partial key matches
  if (normalized.includes("bed")) return CATEGORY_THEMES.bedroom;
  if (normalized.includes("living") || normalized.includes("lounge")) return CATEGORY_THEMES["living-room"];
  if (normalized.includes("din")) return CATEGORY_THEMES.dining;
  if (normalized.includes("office") || normalized.includes("work") || normalized.includes("study"))
    return CATEGORY_THEMES.workspace;
  if (normalized.includes("stor") || normalized.includes("almirah") || normalized.includes("vault"))
    return CATEGORY_THEMES.storage;

  return CATEGORY_THEMES.bedroom;
}
