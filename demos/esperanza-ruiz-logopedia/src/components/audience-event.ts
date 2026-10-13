export type AudienceFilter = "todas" | "infancia" | "adultos" | "neuro";
export const AUDIENCE_EVENT = "er:audience";

export function selectAudience(value: AudienceFilter) {
  window.dispatchEvent(new CustomEvent<AudienceFilter>(AUDIENCE_EVENT, { detail: value }));
}
