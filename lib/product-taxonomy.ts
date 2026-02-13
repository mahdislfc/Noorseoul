const CATEGORY_CANONICAL_MAP: Record<string, string> = {
  skintoner: "Skin/toner",
  toner: "Skin/toner",
  toners: "Skin/toner",
  essenceserumampoule: "Essence/Serum/Ampoule",
  serum: "Essence/Serum/Ampoule",
  serums: "Essence/Serum/Ampoule",
  ampoule: "Essence/Serum/Ampoule",
  ampoules: "Essence/Serum/Ampoule",
  moisturizer: "cream",
  moisturizers: "cream",
  cream: "cream",
  cleanser: "Cleansing foam/gel",
  cleansers: "Cleansing foam/gel",
  cleansingfoamgel: "Cleansing foam/gel",
  mist: "Mist/Oil",
  mists: "Mist/Oil",
  mistoil: "Mist/Oil",
};

const DEPARTMENT_CANONICAL_MAP: Record<string, string> = {
  skincare: "Skincare",
  makeup: "Makeup",
  cleansing: "Cleansing",
  maskpack: "Mask pack",
  suncare: "Sun care",
  bodycare: "Body care",
  haircare: "Hair care",
};

function normalizeLookupKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export const CATEGORY_OPTIONS = [
  "Skin/toner",
  "Essence/Serum/Ampoule",
  "cream",
  "lotion",
  "Mist/Oil",
  "Cleansing foam/gel",
  "Oil/Night",
  "Water/Milk",
  "sheet pack",
  "pad",
  "facial pack",
  "Patch",
];

export const DEPARTMENT_OPTIONS = [
  "Skincare",
  "Makeup",
  "Cleansing",
  "Mask pack",
  "Sun care",
  "Body care",
  "Hair care",
];

export function normalizeCategoryInput(value: string) {
  const collapsed = collapseWhitespace(value);
  const canonical = CATEGORY_CANONICAL_MAP[normalizeLookupKey(collapsed)];
  return canonical || collapsed;
}

export function normalizeDepartmentInput(value: string) {
  const collapsed = collapseWhitespace(value);
  const canonical = DEPARTMENT_CANONICAL_MAP[normalizeLookupKey(collapsed)];
  return canonical || collapsed;
}

export function normalizeBrandInput(value: string) {
  return collapseWhitespace(value);
}

export function categoriesMatch(filterCategory: string, productCategory: string) {
  return (
    normalizeCategoryInput(filterCategory).toLowerCase() ===
    normalizeCategoryInput(productCategory).toLowerCase()
  );
}

export function departmentsMatch(
  filterDepartment: string,
  productDepartment: string
) {
  return (
    normalizeDepartmentInput(filterDepartment).toLowerCase() ===
    normalizeDepartmentInput(productDepartment).toLowerCase()
  );
}
