"use client";

import { useMemo, useState, useTransition } from "react";
import { Avatar } from "@/components/avatar";
import { addPostComment, loadPostComments, toggleCommentReaction } from "./actions";

const EMOJIS = ["👍", "❤️", "🔥", "💪", "👏", "😂", "🍆", "🍑", "💦", "🔩", "🦍", "🍼", "🛴", "😍"] as const;

export type CommentReactionRow = { user_id: string; emoji: string };
export type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  body: string;
  created_at: string;
  workout_comment_reactions: CommentReactionRow[];
};
export type Names = Record<string, string>;

export type CommentPreview = {
  commentCount: number;
  rootCount: number;
  comments: CommentRow[];
};

export function CommentsPanel({ postId, me, preview, initialNames }: { postId: string; me: string; preview: CommentPreview; initialNames: Names }) {
  const [loadedComments, setLoadedComments] = useState<CommentRow[] | null>(null);
  const [loadedNames, setLoadedNames] = useState<Names>({});
  const [isPending, startTransition] = useTransition();

  const initialThreads = useMemo(() => buildThreads(preview.comments), [preview.comments]);
  const latest = initialThreads.roots[0] ?? null;
  const latestReplies = latest ? initialThreads.replies.get(latest.id) ?? [] : [];
  const olderCount = Math.max(0, preview.rootCount - (latest ? 1 : 0));
  const names = { ...initialNames, ...loadedNames };

  const loadedThreads = useMemo(() => buildThreads(loadedComments ?? []), [loadedComments]);
  const olderRoots = loadedThreads.roots.filter((root) => root.id !== latest?.id);

  function loadOlder() {
    if (isPending || loadedComments) return;
    startTransition(async () => {
      const result = await loadPostComments(postId);
      setLoadedComments(result.comments);
      setLoadedNames(result.names);
    });
  }

  return <details open className="border-t border-line">
    <summary className="day-trigger flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[14px] font-semibold text-chalk-2 marker:hidden">
      <span>Comentarios{preview.commentCount ? ` · ${preview.commentCount}` : ""}</span>
      <span className="text-[12px] text-chalk-3">Mostrar / minimizar</span>
    </summary>
    <div className="px-4 pb-4">
      {latest && <div className="border-t border-line pt-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Más reciente</p>
        <CommentThread comment={latest} replies={latestReplies} me={me} postId={postId} names={names} />
      </div>}

      {olderCount > 0 && !loadedComments && <div className="mt-4 border-t border-line pt-3">
        <button type="button" onClick={loadOlder} disabled={isPending} className="press min-h-10 py-2 text-[13px] font-semibold text-chalk-3 hover:text-chalk disabled:opacity-60">
          {isPending ? "Cargando comentarios…" : `Ver comentarios anteriores · ${olderCount}`}
        </button>
      </div>}

      {loadedComments && olderRoots.length > 0 && <details open className="mt-4 border-t border-line pt-3">
        <summary className="press cursor-pointer list-none py-2 text-[13px] font-semibold text-chalk-3 marker:hidden hover:text-chalk">Comentarios anteriores · {olderRoots.length}</summary>
        <div className="mt-2 space-y-4">
          {olderRoots.map((comment) => <CommentThread key={comment.id} comment={comment} replies={loadedThreads.replies.get(comment.id) ?? []} me={me} postId={postId} names={names} />)}
        </div>
      </details>}

      <div className="mt-4 border-t border-line pt-4"><CommentForm postId={postId} /></div>
    </div>
  </details>;
}

function buildThreads(comments: CommentRow[]) {
  const roots = comments.filter((comment) => !comment.parent_comment_id);
  const replies = new Map<string, CommentRow[]>();
  for (const comment of comments.filter((comment) => comment.parent_comment_id).sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const list = replies.get(comment.parent_comment_id!) ?? [];
    list.push(comment);
    replies.set(comment.parent_comment_id!, list);
  }
  const threadTime = (comment: CommentRow) => Math.max(new Date(comment.created_at).getTime(), ...(replies.get(comment.id) ?? []).map((reply) => new Date(reply.created_at).getTime()));
  return { roots: [...roots].sort((a, b) => threadTime(b) - threadTime(a)), replies };
}

function namesFor(reactions: Array<{ user_id: string }>, names: Names) {
  return reactions.map((reaction) => names[reaction.user_id] ?? "Atleta").filter((name, index, rows) => rows.indexOf(name) === index);
}

function CommentThread({ comment, replies, me, postId, names }: { comment: CommentRow; replies: CommentRow[]; me: string; postId: string; names: Names }) {
  return <div>
    <Comment comment={comment} me={me} names={names} />
    {replies.length > 0 && <div className="ml-8 mt-3 space-y-3 border-l border-line pl-3">{replies.map((reply) => <Comment key={reply.id} comment={reply} me={me} names={names} compact />)}</div>}
    <details className="ml-11 mt-2"><summary className="press cursor-pointer list-none py-1 text-[12px] font-semibold text-chalk-3 marker:hidden hover:text-chalk">Responder</summary><div className="mt-2"><CommentForm postId={postId} parentCommentId={comment.id} compact /></div></details>
  </div>;
}

function Comment({ comment, me, names, compact = false }: { comment: CommentRow; me: string; names: Names; compact?: boolean }) {
  return <div className="flex items-start gap-2.5">
    <Avatar url={comment.author_avatar_url} name={comment.author_name} size="sm" />
    <div className="min-w-0 flex-1">
      <p className="text-[13px] leading-tight"><span className="font-bold text-chalk">{comment.author_name}</span> <span className="text-chalk-3">· {timeLabel(comment.created_at)}</span></p>
      <p className={`mt-1 whitespace-pre-wrap leading-[1.45] text-chalk-2 ${compact ? "text-[14px]" : "text-[15px]"}`}>{comment.body}</p>
      <CommentReactions commentId={comment.id} reactions={comment.workout_comment_reactions ?? []} me={me} names={names} />
    </div>
  </div>;
}

function CommentReactions({ commentId, reactions, me, names }: { commentId: string; reactions: CommentReactionRow[]; me: string; names: Names }) {
  const existing = EMOJIS.filter((emoji) => reactions.some((reaction) => reaction.emoji === emoji));
  return <div className="mt-2">
    <div className="flex flex-wrap gap-1">{existing.map((emoji) => {
      const rows = reactions.filter((reaction) => reaction.emoji === emoji);
      const active = rows.some((reaction) => reaction.user_id === me);
      return <form action={toggleCommentReaction} key={emoji}>
        <input type="hidden" name="comment_id" value={commentId} /><input type="hidden" name="emoji" value={emoji} />
        <button type="submit" title={namesFor(rows, names).join(", ")} aria-pressed={active} className={`press min-h-7 rounded-full border px-2 text-[12px] ${active ? "border-lemon bg-lemon/5 text-chalk" : "border-line text-chalk-3"}`}>{emoji} <span>{rows.length}</span> <span className="ml-1 hidden sm:inline">· {namesFor(rows, names).join(", ")}</span></button>
      </form>;
    })}</div>
    <details className="mt-1"><summary className="press cursor-pointer list-none py-1 text-[11px] font-semibold text-chalk-3 marker:hidden">+ Reacción</summary><div className="flex flex-wrap gap-1 pt-1">{EMOJIS.map((emoji) => <form action={toggleCommentReaction} key={emoji}><input type="hidden" name="comment_id" value={commentId} /><input type="hidden" name="emoji" value={emoji} /><button type="submit" className="press min-h-7 rounded-full border border-line px-2 text-[12px]">{emoji}</button></form>)}</div></details>
  </div>;
}

function CommentForm({ postId, parentCommentId, compact = false }: { postId: string; parentCommentId?: string; compact?: boolean }) {
  return <form action={addPostComment} className="flex items-end gap-2">
    <input type="hidden" name="post_id" value={postId} />{parentCommentId && <input type="hidden" name="parent_comment_id" value={parentCommentId} />}
    <label className="min-w-0 flex-1"><span className="sr-only">{parentCommentId ? "Responder comentario" : "Escribir comentario"}</span><input name="body" maxLength={1000} required autoComplete="off" placeholder={parentCommentId ? "Escribe una respuesta…" : "Comenta el entrenamiento…"} className={`field ${compact ? "min-h-10 py-2 text-[14px]" : ""}`} /></label>
    <button type="submit" className={`btn-primary shrink-0 ${compact ? "min-h-10 px-3 text-[13px]" : ""}`}>Enviar</button>
  </form>;
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" }).format(new Date(iso));
}
