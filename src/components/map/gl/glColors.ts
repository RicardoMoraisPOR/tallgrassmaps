const probeCanvas = document.createElement('canvas');

probeCanvas.width = 1;
probeCanvas.height = 1;

const probeContext = probeCanvas.getContext('2d', { willReadFrequently: true });
const resolved = new Map<string, string>();

export const toRgba = (css: string) => {
  const cached = resolved.get(css);

  if (cached) return cached;

  if (!probeContext) return css;

  probeContext.clearRect(0, 0, 1, 1);
  probeContext.fillStyle = '#000';
  probeContext.fillStyle = css;
  probeContext.fillRect(0, 0, 1, 1);

  const [r, g, b, a] = probeContext.getImageData(0, 0, 1, 1).data;
  const color = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;

  resolved.set(css, color);

  return color;
};

export const isDark = () => document.documentElement.classList.contains('dark');

export const probe = <T>(
  className: string,
  read: (element: HTMLElement) => T,
  tag = 'span',
) => {
  const element = document.createElement(tag);

  element.className = className;
  element.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;';
  document.body.appendChild(element);

  try {
    return read(element);
  } finally {
    element.remove();
  }
};

const linkColors = new Map<string, string>();

export const linkColor = (className: string | undefined) => {
  const key = `${isDark() ? 'dark' : 'light'}|${className ?? ''}`;
  const cached = linkColors.get(key);

  if (cached) return cached;

  const color = toRgba(
    probe(className ?? '', (element) =>
      getComputedStyle(element).getPropertyValue('--map-link'),
    ) || 'oklch(0.65 0.2 145)',
  );

  linkColors.set(key, color);

  return color;
};

export const cssColor = (value: string) =>
  toRgba(
    probe('', (element) => {
      element.style.color = value;

      return getComputedStyle(element).color;
    }),
  );

export const probeHtml = <T>(html: string, read: (root: HTMLElement) => T) => {
  const root = document.createElement('div');

  root.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;';
  root.innerHTML = html;
  document.body.appendChild(root);

  try {
    return read(root);
  } finally {
    root.remove();
  }
};
