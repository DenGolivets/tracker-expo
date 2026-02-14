/**
 * Parses macro strings like "150г" or "150" into numeric values.
 */
export const parseMacro = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;

  const sanitized = value.replace(",", ".");
  const matches = sanitized.match(/(\d+(\.\d+)?)/);
  return matches ? parseFloat(matches[1]) : 0;
};
