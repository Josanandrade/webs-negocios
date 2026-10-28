export type RmAchievement = {
  id: string;
  movement_name: string;
  rm_number: number;
  kg: number | string;
  previous_kg: number | string | null;
};

export type RmCelebration = {
  id: string;
  achievementIds: string[];
  message: string;
};

function formatKg(value: number | string) {
  const number = Number(value);
  return Number.isInteger(number) ? String(number) : String(Math.round(number * 100) / 100).replace(".", ",");
}

export function rmAchievementMessage(rows: RmAchievement[]) {
  if (rows.length === 0) return undefined;

  if (rows.length === 1) {
    const achievement = rows[0];
    const current = Number(achievement.kg);
    const previous = achievement.previous_kg == null ? null : Number(achievement.previous_kg);
    const gain = previous != null && current > previous ? ` · +${formatKg(current - previous)} kg` : "";
    const verb = previous == null ? "Has registrado" : "Has mejorado";
    return `🏆 ¡Enhorabuena! ${verb} tu ${achievement.rm_number}RM de ${achievement.movement_name}: ${formatKg(achievement.kg)} kg${gain}`;
  }

  const summary = rows
    .slice(0, 3)
    .map((achievement) => `${achievement.rm_number}RM ${achievement.movement_name} · ${formatKg(achievement.kg)} kg`)
    .join(" · ");
  const extra = rows.length > 3 ? ` · +${rows.length - 3} más` : "";
  return `🏆 ¡Enhorabuena! Has conseguido ${rows.length} nuevos RM: ${summary}${extra}`;
}
