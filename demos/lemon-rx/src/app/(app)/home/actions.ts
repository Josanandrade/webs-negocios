"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getViewer } from "@/lib/auth";
import { notifyUser } from "@/lib/push";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMOJIS = new Set(["👍", "❤️", "🔥", "💪", "👏", "😂", "🍆", "🍑", "💦", "🔩", "🦍", "🍼", "🛴", "😍"]);

type LazyCommentReaction = { user_id: string; emoji: string };
type LazyComment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  body: string;
  created_at: string;
  workout_comment_reactions: LazyCommentReaction[];
};

async function socialViewer() {
  const viewer = await getViewer();
  if (!viewer.canViewProgram) return null;
  return viewer;
}

export async function togglePostReaction(formData: FormData) {
  const viewer = await socialViewer();
  const postId = String(formData.get("post_id") ?? "");
  const emoji = String(formData.get("emoji") ?? "");
  if (!viewer || !UUID.test(postId) || !EMOJIS.has(emoji)) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("workout_post_reactions")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", viewer.profile.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from("workout_post_reactions").delete().eq("post_id", postId).eq("user_id", viewer.profile.id).eq("emoji", emoji);
  } else {
    const { error } = await supabase.from("workout_post_reactions").insert({ post_id: postId, user_id: viewer.profile.id, emoji });
    if (!error) {
      const { data: post } = await supabase.from("workout_posts").select("user_id").eq("id", postId).maybeSingle<{ user_id: string }>();
      if (post && post.user_id !== viewer.profile.id) {
        const actor = viewer.profile.full_name || "Un compañero";
        after(() => notifyUser(post.user_id, {
          title: `${actor} ha reaccionado ${emoji}`,
          body: "Ha reaccionado a tu entrenamiento.",
          url: `/home?post=${postId}#reactions-${postId}`,
          tag: `post-reaction-${postId}-${viewer.profile.id}-${emoji}`,
        }));
      }
    }
  }

  revalidatePath("/home");
}

export async function addPostComment(formData: FormData) {
  const viewer = await socialViewer();
  const postId = String(formData.get("post_id") ?? "");
  const rawParent = String(formData.get("parent_comment_id") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 1000);
  if (!viewer || !UUID.test(postId) || !body) return;

  const supabase = await createClient();
  let parentCommentId: string | null = UUID.test(rawParent) ? rawParent : null;
  let parentAuthorId: string | null = null;

  if (parentCommentId) {
    const { data: parent } = await supabase
      .from("workout_post_comments")
      .select("id, post_id, parent_comment_id, user_id")
      .eq("id", parentCommentId)
      .eq("post_id", postId)
      .maybeSingle<{ id: string; post_id: string; parent_comment_id: string | null; user_id: string }>();
    if (!parent) return;
    parentAuthorId = parent.user_id;
    parentCommentId = parent.parent_comment_id ?? parent.id;
    if (parent.parent_comment_id) {
      const { data: root } = await supabase.from("workout_post_comments").select("user_id").eq("id", parent.parent_comment_id).maybeSingle<{ user_id: string }>();
      parentAuthorId = root?.user_id ?? parentAuthorId;
    }
  }

  const { data: insertedComment, error } = await supabase
    .from("workout_post_comments")
    .insert({ post_id: postId, user_id: viewer.profile.id, parent_comment_id: parentCommentId, body })
    .select("id")
    .single<{ id: string }>();
  if (!error && insertedComment) {
    const { data: post } = await supabase.from("workout_posts").select("user_id").eq("id", postId).maybeSingle<{ user_id: string }>();
    const actor = viewer.profile.full_name || "Un compañero";
    const recipients = new Set<string>();
    if (post?.user_id && post.user_id !== viewer.profile.id) recipients.add(post.user_id);
    if (parentAuthorId && parentAuthorId !== viewer.profile.id) recipients.add(parentAuthorId);
    for (const recipient of recipients) {
      const isReply = Boolean(parentCommentId && recipient === parentAuthorId);
      after(() => notifyUser(recipient, {
        title: isReply ? `${actor} ha respondido a tu comentario` : `${actor} ha comentado tu entrenamiento`,
        body: body.slice(0, 180),
        url: `/home?post=${postId}&comment=${insertedComment.id}#comment-${insertedComment.id}`,
        tag: `comment-${insertedComment.id}-${recipient}`,
      }));
    }
  }

  revalidatePath("/home");
}

export async function toggleCommentReaction(formData: FormData) {
  const viewer = await socialViewer();
  const commentId = String(formData.get("comment_id") ?? "");
  const emoji = String(formData.get("emoji") ?? "");
  if (!viewer || !UUID.test(commentId) || !EMOJIS.has(emoji)) return;

  const supabase = await createClient();
  const { data: existing } = await supabase.from("workout_comment_reactions").select("comment_id").eq("comment_id", commentId).eq("user_id", viewer.profile.id).eq("emoji", emoji).maybeSingle();

  if (existing) {
    await supabase.from("workout_comment_reactions").delete().eq("comment_id", commentId).eq("user_id", viewer.profile.id).eq("emoji", emoji);
  } else {
    const { error } = await supabase.from("workout_comment_reactions").insert({ comment_id: commentId, user_id: viewer.profile.id, emoji });
    if (!error) {
      const { data: comment } = await supabase.from("workout_post_comments").select("user_id, post_id").eq("id", commentId).maybeSingle<{ user_id: string; post_id: string }>();
      if (comment && comment.user_id !== viewer.profile.id) {
        const actor = viewer.profile.full_name || "Un compañero";
        after(() => notifyUser(comment.user_id, {
          title: `${actor} ha reaccionado ${emoji} a tu comentario`,
          body: "Ha reaccionado a un comentario que dejaste en Home.",
          url: `/home?post=${comment.post_id}&comment=${commentId}#comment-${commentId}`,
          tag: `comment-reaction-${commentId}-${viewer.profile.id}-${emoji}`,
        }));
      }
    }
  }

  revalidatePath("/home");
}

export async function loadPostComments(postId: string): Promise<{ comments: LazyComment[]; names: Record<string, string> }> {
  const viewer = await socialViewer();
  if (!viewer || !UUID.test(postId)) return { comments: [], names: {} };

  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_post_comments")
    .select("id, post_id, user_id, parent_comment_id, author_name, author_avatar_url, body, created_at, workout_comment_reactions(user_id, emoji)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .returns<LazyComment[]>();
  const comments = data ?? [];
  const reactionUserIds = [...new Set(comments.flatMap((comment) => (comment.workout_comment_reactions ?? []).map((reaction) => reaction.user_id)))];
  if (reactionUserIds.length === 0) return { comments, names: {} };

  const { data: profiles } = await supabase.rpc("social_reaction_actor_names", { p_user_ids: reactionUserIds });
  const names = Object.fromEntries(((profiles ?? []) as Array<{ user_id: string; full_name: string }>).map((row) => [row.user_id, row.full_name || "Atleta"]));
  return { comments, names };
}
