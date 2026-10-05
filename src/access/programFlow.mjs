// Set VITE_MANUAL_ACCESS_MODE=false to restore the retained payment entry points.
// This controls navigation only; Firebase remains the authority for access.
export const manualAccessMode = import.meta.env?.VITE_MANUAL_ACCESS_MODE !== 'false';
export function programDestination(program, hasAccess, manual = manualAccessMode) {
  const base = `/programs/${encodeURIComponent(program.id)}`;
  if (hasAccess || program.accessType === 'free') return base;
  return manual && program.accessType !== 'class' ? `${base}/access` : base;
}
