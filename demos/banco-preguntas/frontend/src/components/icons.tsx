// Iconos de trazo (24×24), heredan el color del texto.
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconDocs = () => (
  <svg {...base} aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
);
export const IconBank = () => (
  <svg {...base} aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /><circle cx="19" cy="18" r="2" /></svg>
);
export const IconQuiz = () => (
  <svg {...base} aria-hidden="true"><path d="M9 11l2 2 4-4" /><rect x="4" y="3" width="16" height="18" rx="2" /></svg>
);
export const IconStats = () => (
  <svg {...base} aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);
export const IconUpload = () => (
  <svg {...base} aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>
);
export const IconCheck = () => (
  <svg {...base} aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
);
export const IconX = () => (
  <svg {...base} aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconClock = () => (
  <svg {...base} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconChevronLeft = () => (
  <svg {...base} aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
);
export const IconChevronRight = () => (
  <svg {...base} aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
);
export const IconLogout = () => (
  <svg {...base} aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" /></svg>
);
export const IconTrash = () => (
  <svg {...base} aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
);
