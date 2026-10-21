import type { Metadata } from "next";
import { Avatar } from "@/components/avatar";
import { NoAccess } from "@/components/no-access";
import { SocialBlockProgram } from "@/components/social-block-program";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { divisionLabel, formatKg, formatScore, loadSetWeights } from "@/lib/scores";
import type { BuilderSection, ComplexMovementRow, Division, Score, ScoreType, StrengthSchemeRow } from "@/lib/types";
import { addPostComment, toggleCommentReaction, togglePostReaction } from "./actions";

export const metadata: Metadata = { title: "Home" };

const EMOJIS = ["👍", "❤️", "🔥", "💪", "👏", "😂", "🍆", "🍑", "💦", "🔩", "🦍", "🍼", "🛴", "😍"] as const;

type ReactionRow = { user_id: string; emoji: string };
type CommentReactionRow = { user_id: string; emoji: string };
type CommentRow = { id: string; post_id: string; user_id: string; parent_comment_id: string | null; author_name: string; author_avatar_url: string | null; body: string; created_at: string; workout_comment_reactions: CommentReactionRow[] };
type SocialResult = Partial<Score> & { division?: Division | null };
type SocialBlockRow = { post_id: string; block_id: string; block_title: string; block_score_type: ScoreType; block_position: number; completed_at: string; note: string; result: SocialResult | null };
type SocialPostRow = { id: string; user_id: string; training_date: string; athlete_name: string; athlete_avatar_url: string | null; first_completed_at: string; updated_at: string; workout_post_blocks: SocialBlockRow[]; workout_post_reactions: ReactionRow[]; workout_post_comments: CommentRow[] };
type SourceBlock = { id: string; content: string; sets_count: number | null; reps_per_set: number | null; movement_id: string | null; strength_scheme: StrengthSchemeRow[] | null; is_complex: boolean; complex_movements: ComplexMovementRow[] | null; is_emom: boolean; emom_reps: number | null; emom_interval_seconds: number | null; emom_rounds: number | null; emom_percentage: number | null; builder_sections: BuilderSection[] | null };

export default async function HomePage() {
  const viewer = await getViewer();
  if (!viewer.canViewProgram) return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_posts")
    .select(`id, user_id, training_date, athlete_name, athlete_avatar_url, first_completed_at, updated_at, workout_post_blocks(post_id, block_id, block_title, block_score_type, block_position, completed_at, note, result), workout_post_reactions(user_id, emoji), workout_post_comments(id, post_id, user_id, parent_comment_id, author_name, author_avatar_url, body, created_at, workout_comment_reactions(user_id, emoji))`)
    .order("updated_at", { ascending: false })
    .limit(40)
    .returns<SocialPostRow[]>();

  const posts = data ?? [];
  const blockIds = [...new Set(posts.flatMap((post) => post.workout_post_blocks.map((block) => block.block_id)))];
  const { data: sourceRows } = blockIds.length ? await supabase
    .from("workout_blocks")
    .select("id, content, sets_count, reps_per_set, movement_id, strength_scheme, is_complex, complex_movements, is_emom, emom_reps, emom_interval_seconds, emom_rounds, emom_percentage, builder_sections")
    .in("id", blockIds)
    .returns<SourceBlock[]>() : { data: [] as SourceBlock[] };
  const sourceBlocks = sourceRows ?? [];
  const movementIds = [...new Set(sourceBlocks.flatMap((block) => {
    const ids: string[] = [];
    if (block.movement_id) ids.push(block.movement_id);
    for (const row of block.complex_movements ?? []) ids.push(row.movement_id);
    for (const section of block.builder_sections ?? []) for (const item of section.items) {
      if (item.type === "exercise") ids.push(item.movement_id);
      if (item.type === "complex") for (const movement of item.movements) ids.push(movement.movement_id);
    }
    return ids;
  }))];
  const { data: movements } = movementIds.length ? await supabase.from("movements").select("id, name").in("id", movementIds).returns<Array<{ id: string; name: string }>>() : { data: [] as Array<{ id: string; name: string }> };
  const sourceMap = new Map(sourceBlocks.map((block) => [block.id, block]));
  const movementNames = Object.fromEntries((movements ?? []).map((row) => [row.id, row.name]));
  const me = viewer.profile.id;

  return <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:px-6 md:pb-16 md:pt-10">
    <p className="eyebrow">Lemon RX</p>
    <h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-none md:text-[48px]">Home</h1>
    <p className="mt-3 max-w-xl text-[16px] leading-[1.5] text-chalk-2">La actividad de la comunidad se actualiza automáticamente según se completan los bloques.</p>
    {error ? <p className="mt-8 border-y border-line py-5 text-[15px] text-chalk-3">No se ha podido cargar la actividad.</p> : posts.length === 0 ? <section className="mt-10 border-y border-line py-8"><h2 className="font-display text-[24px] font-bold uppercase">Todavía no hay actividad</h2><p className="mt-2 text-[16px] text-chalk-3">Cuando alguien marque su primer bloque como hecho aparecerá aquí automáticamente.</p></section> : <div className="mt-8 space-y-5">{posts.map((post) => <PostCard key={post.id} post={post} me={me} sourceMap={sourceMap} movementNames={movementNames} />)}</div>}
  </main>;
}

function PostCard({ post, me, sourceMap, movementNames }: { post: SocialPostRow; me: string; sourceMap: Map<string, SourceBlock>; movementNames: Record<string, string> }) {
  const blocks = [...post.workout_post_blocks].sort((a, b) => a.block_position - b.block_position || a.block_title.localeCompare(b.block_title, "es"));
  const comments = [...post.workout_post_comments].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const roots = comments.filter((c) => !c.parent_comment_id);
  const replies = new Map<string, CommentRow[]>();
  for (const comment of comments.filter((c) => c.parent_comment_id)) { const list = replies.get(comment.parent_comment_id!) ?? []; list.push(comment); replies.set(comment.parent_comment_id!, list); }
  return <article id={`post-${post.id}`} className="scroll-mt-20 overflow-hidden rounded-lg border border-line bg-ink-2">
    <header className="flex items-center gap-3 px-4 py-4"><Avatar url={post.athlete_avatar_url} name={post.athlete_name} size="md" /><div className="min-w-0 flex-1"><h2 className="truncate text-[17px] font-bold">{post.athlete_name || "Atleta"}</h2><p className="text-[13px] text-chalk-3">{dateLabel(post.training_date)} · {blocks.length} {blocks.length === 1 ? "bloque" : "bloques"}</p></div><span className="shrink-0 font-display text-[13px] font-bold uppercase tracking-[0.05em] text-lemon">✓ Hecho</span></header>
    <div className="border-t border-line">{blocks.map((block) => <SocialBlock key={block.block_id} block={block} source={sourceMap.get(block.block_id) ?? null} movementNames={movementNames} />)}</div>
    <div className="border-t border-line px-4 py-3"><ReactionBar postId={post.id} reactions={post.workout_post_reactions} me={me} /></div>
    <details className="border-t border-line"><summary className="day-trigger flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[14px] font-semibold text-chalk-2 marker:hidden"><span>Comentarios{comments.length ? ` · ${comments.length}` : ""}</span><span aria-hidden>＋</span></summary><div className="px-4 pb-4">{roots.length > 0 && <div className="mb-4 space-y-4 border-t border-line pt-4">{roots.map((comment) => <CommentThread key={comment.id} comment={comment} replies={replies.get(comment.id) ?? []} me={me} postId={post.id} />)}</div>}<CommentForm postId={post.id} /></div></details>
  </article>;
}

function SocialBlock({ block, source, movementNames }: { block: SocialBlockRow; source: SourceBlock | null; movementNames: Record<string, string> }) {
  const result = normalizeResult(block.result);
  const score = result && block.block_score_type !== "none" ? formatScore(block.block_score_type, result) : null;
  const weights = block.block_score_type === "load" && result ? loadSetWeights(result.reps_detail) : null;
  const division = result?.division && block.block_score_type !== "load" ? divisionLabel(result.division) : null;
  return <section className="px-4 py-4 [&+&]:border-t [&+&]:border-line">
    <div className="flex items-start justify-between gap-3"><h3 className="font-display text-[18px] font-bold uppercase leading-tight">{block.block_title || "Bloque"}</h3>{score && <span className="shrink-0 text-right text-[15px] font-bold text-lemon">{score}</span>}</div>
    {(division || weights?.length) && <p className="mt-1 text-[13px] text-chalk-3">{division}{division && weights?.length ? " · " : ""}{weights?.length ? `Series: ${weights.map((kg) => formatKg(kg)).join(" / ")} kg` : ""}</p>}
    {block.note && <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.5] text-chalk-2">“{block.note}”</p>}
    <details className="mt-3 border-t border-line"><summary className="day-trigger flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 py-2 text-[13px] font-semibold text-chalk-3 marker:hidden hover:text-chalk"><span>Ver entrenamiento</span><span aria-hidden>＋</span></summary><div className="pb-1 pt-2"><SocialBlockProgram block={source} movementNames={movementNames} /></div></details>
  </section>;
}

function ReactionBar({ postId, reactions, me }: { postId: string; reactions: ReactionRow[]; me: string }) { return <div className="flex flex-wrap gap-1.5" aria-label="Reacciones al entrenamiento">{EMOJIS.map((emoji) => { const count = reactions.filter((r) => r.emoji === emoji).length; const active = reactions.some((r) => r.emoji === emoji && r.user_id === me); return <form action={togglePostReaction} key={emoji}><input type="hidden" name="post_id" value={postId} /><input type="hidden" name="emoji" value={emoji} /><button type="submit" aria-pressed={active} aria-label={`${emoji}${count ? `, ${count} reacciones` : ""}`} className={`press min-h-9 rounded-full border px-2.5 text-[14px] ${active ? "border-lemon bg-lemon/10 text-chalk" : "border-line-strong text-chalk-2"}`}>{emoji}{count > 0 && <span className="ml-1 text-[12px]">{count}</span>}</button></form>; })}</div>; }
function CommentThread({ comment, replies, me, postId }: { comment: CommentRow; replies: CommentRow[]; me: string; postId: string }) { return <div><Comment comment={comment} me={me} />{replies.length > 0 && <div className="ml-8 mt-3 space-y-3 border-l border-line pl-3">{replies.map((reply) => <Comment key={reply.id} comment={reply} me={me} compact />)}</div>}<details className="ml-11 mt-2"><summary className="press cursor-pointer list-none py-1 text-[12px] font-semibold text-chalk-3 marker:hidden hover:text-chalk">Responder</summary><div className="mt-2"><CommentForm postId={postId} parentCommentId={comment.id} compact /></div></details></div>; }
function Comment({ comment, me, compact = false }: { comment: CommentRow; me: string; compact?: boolean }) { return <div className="flex items-start gap-2.5"><Avatar url={comment.author_avatar_url} name={comment.author_name} size="sm" /><div className="min-w-0 flex-1"><p className="text-[13px] leading-tight"><span className="font-bold text-chalk">{comment.author_name}</span> <span className="text-chalk-3">· {timeLabel(comment.created_at)}</span></p><p className={`mt-1 whitespace-pre-wrap leading-[1.45] text-chalk-2 ${compact ? "text-[14px]" : "text-[15px]"}`}>{comment.body}</p><CommentReactions commentId={comment.id} reactions={comment.workout_comment_reactions ?? []} me={me} /></div></div>; }
function CommentReactions({ commentId, reactions, me }: { commentId: string; reactions: CommentReactionRow[]; me: string }) { return <div className="mt-1.5 flex flex-wrap gap-1">{EMOJIS.map((emoji) => { const count = reactions.filter((r) => r.emoji === emoji).length; const active = reactions.some((r) => r.emoji === emoji && r.user_id === me); if (!count && !active && !["👍","❤️","🔥","🍆","🍑","💦"].includes(emoji)) return null; return <form action={toggleCommentReaction} key={emoji}><input type="hidden" name="comment_id" value={commentId} /><input type="hidden" name="emoji" value={emoji} /><button type="submit" aria-pressed={active} className={`press min-h-7 rounded-full border px-2 text-[12px] ${active ? "border-lemon text-chalk" : "border-line text-chalk-3"}`}>{emoji}{count > 0 && <span className="ml-1">{count}</span>}</button></form>; })}</div>; }
function CommentForm({ postId, parentCommentId, compact = false }: { postId: string; parentCommentId?: string; compact?: boolean }) { return <form action={addPostComment} className="flex items-end gap-2"><input type="hidden" name="post_id" value={postId} />{parentCommentId && <input type="hidden" name="parent_comment_id" value={parentCommentId} />}<label className="min-w-0 flex-1"><span className="sr-only">{parentCommentId ? "Responder comentario" : "Escribir comentario"}</span><input name="body" maxLength={1000} required autoComplete="off" placeholder={parentCommentId ? "Escribe una respuesta…" : "Comenta el entrenamiento…"} className={`field ${compact ? "min-h-10 py-2 text-[14px]" : ""}`} /></label><button type="submit" className={`btn-primary shrink-0 ${compact ? "min-h-10 px-3 text-[13px]" : ""}`}>Enviar</button></form>; }
function normalizeResult(value: SocialResult | null): (Score & { division?: Division | null }) | null { if (!value) return null; return { division: value.division ?? null, seconds: value.seconds == null ? null : Number(value.seconds), capped: Boolean(value.capped), rounds: value.rounds == null ? null : Number(value.rounds), reps: value.reps == null ? null : Number(value.reps), kg: value.kg == null ? null : Number(value.kg), total_load: value.total_load == null ? null : Number(value.total_load), as_prescribed: value.as_prescribed == null ? null : Boolean(value.as_prescribed), reps_detail: String(value.reps_detail ?? "") }; }
function dateLabel(iso: string) { return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "short", timeZone: "Europe/Madrid" }).format(new Date(`${iso}T12:00:00+02:00`)); }
function timeLabel(iso: string) { return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(new Date(iso)); }
