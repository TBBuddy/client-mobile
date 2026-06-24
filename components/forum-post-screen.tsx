import { ArrowLeft, Heart, RefreshCw, Send } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

import { ApiError } from "../services/repository/api-error";
import { ForumService } from "../services/repository/forum-service";
import type { ForumComment, ForumPost } from "../services/repository/types";
import { authorName, formatRelativeTime } from "./forum-screen";
import { Pressable, ScrollView, Text, View } from "./tw";

type Props = { id: string };

export function ForumPostScreen({ id }: Props) {
  const router = useRouter();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const [commentText, setCommentText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      ForumService.getPost(id, { signal: controller.signal }),
      ForumService.listComments(id, { limit: 100 }, { signal: controller.signal }),
    ])
      .then(([postData, commentsRes]) => {
        setPost(postData);
        setComments(commentsRes.data.filter((c) => !c.isDeleted));
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setLoadError(
          err instanceof ApiError ? err.message : "Gagal memuat post.",
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, refetchKey]);

  async function handleToggleLike() {
    if (!post) return;
    const liked = post.isLiked;
    setPost({
      ...post,
      isLiked: !liked,
      likeCount: post.likeCount + (liked ? -1 : 1),
    });
    try {
      if (liked) await ForumService.unlikePost(post.id);
      else await ForumService.likePost(post.id);
    } catch {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              isLiked: liked,
              likeCount: prev.likeCount + (liked ? 1 : -1),
            }
          : prev,
      );
    }
  }

  async function handleSendComment() {
    if (isSending) return;
    const text = commentText.trim();
    if (!text) return;
    setSendError(null);
    setIsSending(true);
    try {
      await ForumService.createComment(id, { content: text });
      const res = await ForumService.listComments(id, { limit: 100 });
      setComments(res.data.filter((c) => !c.isDeleted));
      setPost((prev) =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev,
      );
      setCommentText("");
    } catch (err) {
      setSendError(
        err instanceof ApiError ? err.message : "Gagal mengirim komentar.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <View className="flex-1 bg-brand-mist">
      <View className="flex-row items-center gap-3 bg-brand-white border-b border-brand-border px-5 pt-14 pb-4">
        <Pressable
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#263238" size={18} strokeWidth={2} />
        </Pressable>
        <Text className="flex-1 text-[18px] font-extrabold text-brand-ink">
          Post
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#263238" />
        </View>
      ) : loadError || !post ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text
            className="text-center text-[14px] text-brand-ink"
            style={{ opacity: 0.6 }}
          >
            {loadError ?? "Post tidak ditemukan."}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="h-9 flex-row items-center gap-2 rounded-control bg-brand-ink px-4 active:opacity-70"
            onPress={() => setRefetchKey((v) => v + 1)}
          >
            <RefreshCw color="#FFFFFF" size={13} strokeWidth={2} />
            <Text className="text-[13px] font-bold text-brand-white">
              Coba lagi
            </Text>
          </Pressable>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 py-5 gap-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Post */}
            <View className="gap-3 rounded-card border border-brand-border bg-brand-white p-4">
              <View className="gap-1">
                <Text className="text-[19px] font-extrabold leading-7 text-brand-ink">
                  {post.title ?? "(Post dihapus)"}
                </Text>
                <Text className="text-[12px] text-brand-ink" style={{ opacity: 0.5 }}>
                  {authorName(post.author)} · {formatRelativeTime(post.createdAt)}
                </Text>
              </View>

              {post.content ? (
                <Text className="text-[15px] leading-6 text-brand-ink" style={{ opacity: 0.85 }}>
                  {post.content}
                </Text>
              ) : null}

              <View className="flex-row items-center gap-5 pt-1">
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center gap-1.5 active:opacity-60"
                  hitSlop={8}
                  onPress={handleToggleLike}
                >
                  <Heart
                    color={post.isLiked ? "#FF3B30" : "#263238"}
                    fill={post.isLiked ? "#FF3B30" : "transparent"}
                    size={19}
                    strokeWidth={2}
                    style={post.isLiked ? undefined : { opacity: 0.55 }}
                  />
                  <Text
                    className="text-[13px] font-semibold text-brand-ink"
                    style={{ opacity: post.isLiked ? 1 : 0.55 }}
                  >
                    {post.likeCount} suka
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Comments */}
            <Text className="text-[14px] font-bold text-brand-ink">
              Komentar ({post.commentCount})
            </Text>

            {comments.length === 0 ? (
              <View className="items-center rounded-card border border-brand-border bg-brand-white p-6">
                <Text
                  className="text-center text-[13px] text-brand-ink"
                  style={{ opacity: 0.5 }}
                >
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View
                  className="gap-1 rounded-card border border-brand-border bg-brand-white p-3.5"
                  key={comment.id}
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[13px] font-bold text-brand-ink">
                      @{comment.author.username}
                    </Text>
                    <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.4 }}>
                      {formatRelativeTime(comment.createdAt)}
                    </Text>
                  </View>
                  <Text className="text-[14px] leading-5 text-brand-ink" style={{ opacity: 0.85 }}>
                    {comment.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>

          {/* Comment input */}
          <View className="border-t border-brand-border bg-brand-white px-4 pt-2.5 pb-7 gap-1.5">
            {sendError ? (
              <Text className="text-[12px]" style={{ color: "#EF4444" }}>
                {sendError}
              </Text>
            ) : null}
            <View className="flex-row items-end gap-2">
              <View className="flex-1 rounded-control border border-brand-border bg-brand-mist px-4 py-2.5">
                <TextInput
                  maxLength={2000}
                  multiline
                  onChangeText={setCommentText}
                  placeholder="Tulis komentar…"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  style={{
                    color: "#263238",
                    fontSize: 15,
                    lineHeight: 21,
                    maxHeight: 100,
                  }}
                  value={commentText}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-full bg-brand-ink active:opacity-70"
                disabled={isSending || commentText.trim().length === 0}
                onPress={handleSendComment}
                style={
                  isSending || commentText.trim().length === 0
                    ? { opacity: 0.45 }
                    : undefined
                }
              >
                {isSending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Send color="#FFFFFF" size={17} strokeWidth={2} />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
