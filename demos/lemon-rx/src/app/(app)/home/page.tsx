import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { NoAccess } from "@/components/no-access";
import { SocialBlockProgram } from "@/components/social-block-program";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { divisionLabel, formatKg, formatScore, loadSetWeights } from "@/lib/scores";
import type { BuilderSection, ComplexMovementRow, Division, Score, ScoreType, StrengthSchemeRow } from "@/lib/types";
import { togglePostReaction } from "./actions";
import { CommentsPanel, type CommentPreview, type CommentReactionRow, type CommentRow, type Names } from "./comments-panel";

export const metadata: Metadata = { title: "Home" };
const EMOJIS = ["👍", "❤️", "🔥", "💪", "👏", "😂", "🍆", "🍑", "💦", "🔩", "🦍", "🍼", "🛴", "😍"] as const;
const PAGE_SIZE = 15;
type ReactionRow = { user_id: string; emoji: string };
type SocialResult = Partial<Score> & { division?: Division | null };
type SocialBlockRow = { post_id: string; block_id: string; block_title: string; block_score_type: ScoreType; block_position: number; completed_at: string; note: string; result: SocialResult | null };
type SocialPostRow = { id: string; user_id: string; training_date: string; athlete_name: string; athlete_avatar_url: string | null; first_completed_at: string; updated_at: string; workout_post_blocks: SocialBlockRow[]; workout_post_reactions: ReactionRow[] };
type SourceBlock = { id: string; content: string; sets_count: number | null; reps_per_set: number | null; movement_id: string | null; strength_scheme: StrengthSchemeRow[] | null; is_complex: boolean; complex_movements: ComplexMovementRow[] | null; is_emom: boolean; emom_reps: number | null; emom_interval_seconds: number | null; emom_rounds: number | null; emom_percentage: number | null; builder_sections: BuilderSection[] | null };
type ReactionProfile = { user_id: string; full_name: string };
type CommentPreviewRpcRow = {
  post_id: string;
  comment_count: number | string;
  root_count: number | string;
  id: string;
  user_id: string;
  parent_comment_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  body: string;
  created_at: string;
  reactions: CommentReactionRow[] | null;
};

export default async function HomePage({ searchParams }: PageProps<"/home">) {
  const sp = await searchParams;
  const rawPage = Array.isArray(sp.pagina) ? sp.pagina[0] : sp.pagina;
  const parsedPage = Number.parseInt(rawPage ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, 1000) : 1;
  const offset = (page - 1) * PAGE_SIZE;
  const viewer = await getViewer();
  if (!viewer.canViewProgram) return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;

  const supabase = await createClient();
  const { data, error } = await supabase.from("workout_posts")
    .select(`id, user_id, training_date, athlete_name, athlete_avatar_url, first_completed_at, updated_at, workout_post_blocks(post_id, block_id, block_title, block_score_type, block_position, completed_at, note, result), workout_post_reactions(user_id, emoji)`)
    .order("updated_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + PAGE_SIZE).returns<SocialPostRow[]>();
  const rows = data ?? []; const hasOlder = rows.length > PAGE_SIZE; const posts = rows.slice(0, PAGE_SIZE);

  const blockIds = [...new Set(posts.flatMap((post) => post.workout_post_blocks.map((block) => block.block_id)))];
  const postIds = posts.map((post) => post.id);
  const sourcePromise = blockIds.length
    ? supabase.from("workout_blocks").select("id, content, sets_count, reps_per_set, movement_id, strength_scheme, is_complex, complex_movements, is_emom, emom_reps, emom_interval_seconds, emom_rounds, emom_percentage, builder_sections").in("id", blockIds).returns<SourceBlock[]>()
    : Promise.resolve({ data: [] as SourceBlock[] });
  const commentsPromise = postIds.length
    ? supabase.rpc("home_comment_previews", { p_post_ids: postIds })
    : Promise.resolve({ data: [] });
  const [sourceResult, commentResult] = await Promise.all([sourcePromise, commentsPromise]);
  const sourceBlocks = sourceResult.data ?? [];
  const commentPreviewRows = (commentResult.data ?? []) as CommentPreviewRpcRow[];

  const commentPreviews = new Map<string, CommentPreview>();
  for (const row of commentPreviewRows) {
    const preview = commentPreviews.get(row.post_id) ?? { commentCount: Number(row.comment_count), rootCount: Number(row.root_count), comments: [] };
    preview.comments.push({
      id: row.id,
      post_id: row.post_id,
      user_id: row.user_id,
      parent_comment_id: row.parent_comment_id,
      author_name: row.author_name,
      author_avatar_url: row.author_avatar_url,
      body: row.body,
      created_at: row.created_at,
      workout_comment_reactions: (Array.isArray(row.reactions) ? row.reactions : []) as CommentReactionRow[],
    });
    commentPreviews.set(row.post_id, preview);
  }

  const movementIds = [...new Set(sourceBlocks.flatMap((block) => { const ids: string[] = []; if (block.movement_id) ids.push(block.movement_id); for (const row of block.complex_movements ?? []) ids.push(row.movement_id); for (const section of block.builder_sections ?? []) for (const item of section.items) { if (item.type === "exercise") ids.push(item.movement_id); if (item.type === "complex") for (const movement of item.movements) ids.push(movement.movement_id); } return ids; }))];
  const previewComments = [...commentPreviews.values()].flatMap((preview) => preview.comments);
  const reactionUserIds = [...new Set([
    ...posts.flatMap((post) => post.workout_post_reactions.map((reaction) => reaction.user_id)),
    ...previewComments.flatMap((comment) => (comment.workout_comment_reactions ?? []).map((reaction) => reaction.user_id)),
  ])];
  const movementsPromise = movementIds.length
    ? supabase.from("movements").select("id, name").in("id", movementIds).returns<Array<{ id: string; name: string }>>()
    : Promise.resolve({ data: [] as Array<{ id: string; name: string }> });
  const profilesPromise = reactionUserIds.length
    ? supabase.rpc("social_reaction_actor_names", { p_user_ids: reactionUserIds })
    : Promise.resolve({ data: [] });
  const [movementsResult, profilesResult] = await Promise.all([movementsPromise, profilesPromise]);
  const movements = movementsResult.data ?? [];
  const reactionProfiles = (profilesResult.data ?? []) as ReactionProfile[];

  const sourceMap = new Map(sourceBlocks.map((block) => [block.id, block]));
  const movementNames = Object.fromEntries(movements.map((row) => [row.id, row.name]));
  const reactionNames: Names = Object.fromEntries(reactionProfiles.map((row) => [row.user_id, row.full_name || "Atleta"]));
  const me = viewer.profile.id;

  return <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10">
    <p className="eyebrow">Lemon RX</p><h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Home</h1><p className="mt-3 max-w-xl text-[16px] leading-[1.5] text-chalk-2">La actividad de la comunidad se actualiza automáticamente según se completan los bloques.</p>
    {error ? <p className="mt-8 border-y border-line py-5 text-[15px] text-chalk-3">No se ha podido cargar la actividad.</p> : posts.length === 0 ? <section className="mt-10 border-y border-line py-8"><h2 className="font-display text-[24px] font-bold uppercase">{page === 1 ? "Todavía no hay actividad" : "No hay más actividad"}</h2><p className="mt-2 text-[16px] text-chalk-3">{page === 1 ? "Cuando alguien marque su primer bloque como hecho aparecerá aquí automáticamente." : "Has llegado al final de esta parte del timeline."}</p>{page > 1 && <Link href="/home" className="btn-secondary mt-6">Volver a lo más reciente</Link>}</section> : <><div className="mt-8 space-y-5">{posts.map((post) => <PostCard key={post.id} post={post} me={me} sourceMap={sourceMap} movementNames={movementNames} reactionNames={reactionNames} commentPreview={commentPreviews.get(post.id) ?? { commentCount: 0, rootCount: 0, comments: [] }} />)}</div><nav aria-label="Páginas del timeline" className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">{page > 1 ? <Link href={page === 2 ? "/home" : `/home?pagina=${page - 1}`} className="btn-secondary">← Más recientes</Link> : <span />}{hasOlder && <Link href={`/home?pagina=${page + 1}`} className="btn-secondary ml-auto">Anteriores →</Link>}</nav></>}
  </main>;
}

function PostCard({ post, me, sourceMap, movementNames, reactionNames, commentPreview }: { post: SocialPostRow; me: string; sourceMap: Map<string, SourceBlock>; movementNames: Record<string, string>; reactionNames: Names; commentPreview: CommentPreview }) {
  const blocks = [...post.workout_post_blocks].sort((a, b) => a.block_position - b.block_position || a.block_title.localeCompare(b.block_title, "es"));
  return <article id={`post-${post.id}`} className="scroll-mt-20 overflow-hidden rounded-lg border border-line bg-ink-2">
    <header className="flex items-center gap-3 px-4 py-4"><Avatar url={post.athlete_avatar_url} name={post.athlete_name} size="md" /><div className="min-w-0 flex-1"><h2 className="truncate text-[17px] font-bold">{post.athlete_name || "Atleta"}</h2><p className="text-[13px] text-chalk-3">{dateLabel(post.training_date)} · {blocks.length} {blocks.length === 1 ? "bloque" : "bloques"}</p></div><span className="shrink-0 font-display text-[13px] font-bold uppercase tracking-[0.05em] text-lemon">✓ Hecho</span></header>
    <div className="border-t border-line">{blocks.map((block) => <SocialBlock key={block.block_id} block={block} source={sourceMap.get(block.block_id) ?? null} movementNames={movementNames} />)}</div>
    <div className="border-t border-line px-4 py-3"><ReactionBar postId={post.id} reactions={post.workout_post_reactions} me={me} names={reactionNames} /></div>
    <CommentsPanel postId={post.id} me={me} preview={commentPreview} initialNames={reactionNames} />
  </article>;
}

function SocialBlock({ block, source, movementNames }: { block: SocialBlockRow; source: SourceBlock | null; movementNames: Record<string, string> }) {
  const result = normalizeResult(block.result); const score = result && block.block_score_type !== "none" ? formatScore(block.block_score_type, result) : null; const weights = block.block_score_type === "load" && result ? loadSetWeights(result.reps_detail) : null; const division = result?.division && block.block_score_type !== "load" ? divisionLabel(result.division) : null;
  return <section className="px-4 py-4 [&+&]:border-t [&+&]:border-line"><div className="flex items-start justify-between gap-3"><h3 className="font-display text-[18px] font-bold uppercase leading-tight">{block.block_title || "Bloque"}</h3>{score && <span className="shrink-0 text-right text-[15px] font-bold text-lemon">{score}</span>}</div>{(division || weights?.length) && <p className="mt-1 text-[13px] text-chalk-3">{division}{division && weights?.length ? " · " : ""}{weights?.length ? `Series: ${weights.map((kg) => formatKg(kg)).join(" / ")} kg` : ""}</p>}{block.note && <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.5] text-chalk-2">“{block.note}”</p>}<details className="mt-3 border-t border-line"><summary className="day-trigger flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 py-2 text-[13px] font-semibold text-chalk-3 marker:hidden hover:text-chalk"><span>Ver entrenamiento</span><span aria-hidden>＋</span></summary><div className="pb-1 pt-2"><SocialBlockProgram block={source} movementNames={movementNames} /></div></details></section>;
}

function namesFor(reactions: Array<{ user_id: string }>, names: Names) { return reactions.map((reaction) => names[reaction.user_id] ?? "Atleta").filter((name, index, rows) => rows.indexOf(name) === index); }
function ReactionBar({ postId, reactions, me, names }: { postId: string; reactions: ReactionRow[]; me: string; names: Names }) {
  const groups = EMOJIS.map((emoji) => ({ emoji, rows: reactions.filter((reaction) => reaction.emoji === emoji) })).filter((group) => group.rows.length);
  return <div aria-label="Reacciones al entrenamiento">
    <div className="flex flex-wrap gap-1.5">{EMOJIS.map((emoji) => { const rows = reactions.filter((reaction) => reaction.emoji === emoji); const active = rows.some((reaction) => reaction.user_id === me); return <ReactionForm key={emoji} postId={postId} emoji={emoji} active={active} count={rows.length} />; })}</div>
    {groups.length > 0 && <div className="mt-3 space-y-1.5 border-t border-line pt-3">{groups.map(({ emoji, rows }) => <div key={emoji} className="flex items-start gap-2 text-[13px]"><span className="shrink-0 text-[17px]">{emoji}</span><span className="font-semibold text-chalk">{rows.length}</span><span className="min-w-0 text-chalk-3">· {namesFor(rows, names).join(", ")}</span></div>)}</div>}
  </div>;
}
function ReactionForm({ postId, emoji, active, count }: { postId: string; emoji: string; active: boolean; count: number }) { return <form action={togglePostReaction}><input type="hidden" name="post_id" value={postId} /><input type="hidden" name="emoji" value={emoji} /><button type="submit" aria-pressed={active} aria-label={`${emoji}${count ? `, ${count} reacciones` : ""}`} className={`press min-h-9 rounded-full border px-2.5 text-[15px] ${active ? "border-lemon bg-lemon/10" : "border-line-strong"}`}>{emoji}{count > 0 && <span className="ml-1 text-[12px]">{count}</span>}</button></form>; }
function normalizeResult(value: SocialResult | null): (Score & { division?: Division | null }) | null { if (!value) return null; return { division: value.division ?? null, seconds: value.seconds == null ? null : Number(value.seconds), capped: Boolean(value.capped), rounds: value.rounds == null ? null : Number(value.rounds), reps: value.reps == null ? null : Number(value.reps), kg: value.kg == null ? null : Number(value.kg), total_load: value.total_load == null ? null : Number(value.total_load), as_prescribed: value.as_prescribed == null ? null : Boolean(value.as_prescribed), reps_detail: String(value.reps_detail ?? "") }; }
function dateLabel(iso: string) { return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "short", timeZone: "Europe/Madrid" }).format(new Date(`${iso}T12:00:00+02:00`)); }
