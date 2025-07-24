const KitCategory = {
  TCR: 'tcr',
  BCR: 'bcr',
  WT: 'wt',
  fromKit: (kit) => {
    // Using startsWith instead of explicitly checking is a bit brittle so be careful with kit names
    if (kit.startsWith(KitCategory.TCR)) {
      return KitCategory.TCR;
    }
    if (kit.startsWith(KitCategory.BCR)) {
      return KitCategory.BCR;
    }
    if (kit.startsWith(KitCategory.WT)) {
      return KitCategory.WT;
    }
    throw new Error(`Unknown kit: ${kit}`);
  },
};

const isKitCategory = (kit, categoryInput) => {
  if (!kit) return false;

  if (Array.isArray(categoryInput)) {
    return categoryInput.some((category) => kit.startsWith(category));
  }
  return kit.startsWith(categoryInput);
};

const immuneDbOptionsByKitCategory = {
  [KitCategory.BCR]: ['human', 'mouse', 'transgenic_mouse'],
  [KitCategory.TCR]: ['human', 'mouse'],
  [KitCategory.WT]: [],
};

export default KitCategory;
export { isKitCategory, immuneDbOptionsByKitCategory };
