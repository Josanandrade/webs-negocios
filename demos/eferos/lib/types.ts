export type HoursRow =
  | { days: string; dayIndexes: number[]; opens: string; closes: string; closed?: false }
  | { days: string; dayIndexes: number[]; closed: true };

export type TeamMember = {
  slug: string;
  name: string;
  initials: string;
  role: string;
  license: string;
  photo: string | null;
  summary: string;
  credentials: string[];
};

export type Space = {
  id: string;
  where: string;
  title: string;
  text: string;
};

/** Fotografía real del centro. Con `src: null` se muestra un hueco diseñado. */
export type GalleryPhoto = {
  src: string | null;
  alt: string;
  caption: string;
  /** Dimensiones del archivo original: fijan la proporción y evitan saltos de layout */
  width: number;
  height: number;
};

export type Service = {
  slug: string;
  name: string;
  fullName?: string;
  kind: string;
  summary: string;
  intro: string;
  sections: { title: string; body: string }[];
  indications: string[];
};

export type Business = {
  name: string;
  tagline: string;
  description: string;
  foundedYear: number;
  contact: { phoneDisplay: string; phoneE164: string; whatsappUrl: string; email: string };
  booking: { url: string; label: string };
  address: {
    street: string;
    postalCode: string;
    locality: string;
    region: string;
    country: string;
    landmark: string;
    mapsUrl: string;
  };
  hours: HoursRow[];
  registrations: { label: string; value: string; detail?: string }[];
  social: { label: string; url: string }[];
  nav: { label: string; href: string }[];
  team: TeamMember[];
  mentors: string[];
  spaces: Space[];
  gallery: GalleryPhoto[];
  services: Service[];
};
