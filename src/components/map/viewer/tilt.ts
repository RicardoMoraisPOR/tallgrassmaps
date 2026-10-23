export const DEFAULT_TILT_DEGREES = 40;

export const tiltFromSearch = (search: string) => {
  const value = new URLSearchParams(search).get('tilt');

  if (value === null) return undefined;

  return Number(value) || DEFAULT_TILT_DEGREES;
};
