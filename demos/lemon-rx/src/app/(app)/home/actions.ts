"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMOJIS = new Set(["👍", "❤️", "🔥", "💪", "👏", "😂"]);

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
    await supabase
      .from("workout_post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", viewer.profile.id)
      .eq("emoji", emoji);
  } else {
    await supabase.from("workout_post_reactions").insert({
      post_id: postId,
      user_id: viewer.profile.id,
      emoji,
    });
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

  if (parentCommentId) {
    const { data: parent } = await supabase
      .from("workout_post_comments")
      .select("id, post_id, parent_comment_id")
      .eq("id", parentCommentId)
      .eq("post_id", postId)
      .maybeSingle<{ id: string; post_id: string; parent_comment_id: string | null }>();
    if (!parent) return;
    parentCommentId = parent.parent_comment_id ?? parent.id;
  }

  await supabase.from("workout_post_comments").insert({
    post_id: postId,
    user_id: viewer.profile.id,
    parent_comment_id: parentCommentId,
    body,
  });

  revalidatePath("/home");
}

export async function toggleCommentReaction(formData: FormData) {
  const viewer = await socialViewer();
  const commentId = String(formData.get("comment_id") ?? "");
  const emoji = String(formData.get("emoji") ?? "");
  if (!viewer || !UUID.test(commentId) || !EMOJIS.has(emoji)) return;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("workout_comment_reactions")
    .select("comment_id")
    .eq("comment_id", commentId)
    .eq("user_id", viewer.profile.id)
    .eq("emoji", emoji)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("workout_comment_reactions")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", viewer.profile.id)
      .eq("emoji", emoji);
  } else {
    await supabase.from("workout_comment_reactions").insert({
      comment_id: commentId,
      user_id: viewer.profile.id,
      emoji,
    });
  }

  revalidatePath("/home");
}
