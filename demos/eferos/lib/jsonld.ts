import { business } from "@/business.config";
import { siteUrl } from "@/lib/site";
import { isOpenRow } from "@/lib/hours";

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Datos estructurados schema.org para el centro (ficha local en buscadores). */
export function clinicJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "Physiotherapy"],
    "@id": `${siteUrl}/#centro`,
    name: business.name,
    description: business.description,
    url: siteUrl,
    telephone: business.contact.phoneE164,
    email: business.contact.email,
    foundingDate: String(business.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.locality,
      addressRegion: business.address.region,
      addressCountry: business.address.country,
    },
    hasMap: business.address.mapsUrl,
    openingHoursSpecification: business.hours.filter(isOpenRow).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.dayIndexes.map((d) => dayNames[d]),
      opens: h.opens,
      closes: h.closes,
    })),
    availableService: business.services.map((s) => ({
      "@type": "MedicalTherapy",
      name: s.fullName ? `${s.name} (${s.fullName})` : s.name,
      url: `${siteUrl}/especialidades/${s.slug}`,
    })),
    employee: business.team.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: `${m.role} (${m.license})`,
    })),
  };
}
