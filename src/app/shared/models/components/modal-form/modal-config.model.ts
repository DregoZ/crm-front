// shared/models/components/modal-form/modal-config.model.ts
/**
 * Standard modal size tokens.
 * Adjust the pixel values here if you need different breakpoints.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

/** Map size tokens to concrete pixel widths. */
export const MODAL_WIDTH_MAP: Record<ModalSize, string> = {
  sm: '600px',   // small – current default
  md: '900px',   // medium – typical large dialog
  lg: '1200px',  // large – extra‑wide dialog
  xl: '1600px',  // extra‑large – for very wide content
};

/** Helper to retrieve the width for a given size token. */
export function getModalWidth(size: ModalSize = 'sm'): string {
  return MODAL_WIDTH_MAP[size] ?? MODAL_WIDTH_MAP['sm'];
}
