import { Heart, MessageCircle, Plus, RefreshCw } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, TextInput } from "react-native";
import { router, useFocusEffect, type Href } from "expo-router";

import { ApiError } from "../services/repository/api-error";
import { ForumService } from "../services/repository/forum-service";
import type { ForumPost } from "../services/repository/types";
import { BottomSheet } from "./bottom-sheet";
import { Pressable, ScrollView, Text, View } from "./tw";

const inputStyle = {
  borderWidth: 1.5,
  borderColor: "#D9E5E5",
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontSize: 15,
  color: "#263238",
  backgroundColor: "#F5FBFA",
} as const;

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  const d = new Date(iso);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function authorName(author: ForumPost["author"]): string {
  return `@${author.username}`;
}

function PostCard({
  post,
  onToggleLike,
}: {
  post: ForumPost;
  onToggleLike: (post: ForumPost) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="gap-3 rounded-card border border-brand-border bg-brand-white p-4 active:opacity-80"
      onPress={() => router.push(`/forum/${post.id}` as Href)}
    >
      <View className="gap-1">
        <Text className="text-[16px] font-bold leading-6 text-brand-ink">
          {post.title ?? "(Post dihapus)"}
        </Text>
        <Text className="text-[12px] text-brand-ink" style={{ opacity: 0.5 }}>
          {authorName(post.author)} · {formatRelativeTime(post.createdAt)}
        </Text>
      </View>

      <View className="flex-row items-center gap-5">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 active:opacity-60"
          hitSlop={8}
          onPress={() => onToggleLike(post)}
        >
          <Heart
            color={post.isLiked ? "#FF3B30" : "#263238"}
            fill={post.isLiked ? "#FF3B30" : "transparent"}
            size={18}
            strokeWidth={2}
            style={post.isLiked ? undefined : { opacity: 0.55 }}
          />
          <Text
            className="text-[13px] font-semibold text-brand-ink"
            style={{ opacity: post.isLiked ? 1 : 0.55 }}
          >
            {post.likeCount}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-1.5">
          <MessageCircle
            color="#263238"
            size={18}
            strokeWidth={2}
            style={{ opacity: 0.55 }}
          />
          <Text
            className="text-[13px] font-semibold text-brand-ink"
            style={{ opacity: 0.55 }}
          >
            {post.commentCount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function CreatePostModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (isSubmitting) return;
    setError(null);
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle) {
      setError("Judul wajib diisi.");
      return;
    }
    if (!trimmedContent) {
      setError("Isi post wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await ForumService.createPost({
        title: trimmedTitle,
        content: trimmedContent,
      });
      setTitle("");
      setContent("");
      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Gagal membuat post. Coba lagi.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet onClose={onClose} title="Buat Post Baru" visible={visible}>
          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-brand-ink" style={{ opacity: 0.65 }}>
              Judul *
            </Text>
            <TextInput
              maxLength={120}
              onChangeText={setTitle}
              placeholder="Tulis judul post"
              placeholderTextColor="rgba(38,50,56,0.3)"
              style={inputStyle}
              value={title}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-brand-ink" style={{ opacity: 0.65 }}>
              Isi *
            </Text>
            <TextInput
              maxLength={5000}
              multiline
              onChangeText={setContent}
              placeholder="Bagikan ceritamu…"
              placeholderTextColor="rgba(38,50,56,0.3)"
              style={[inputStyle, { minHeight: 120, textAlignVertical: "top" }]}
              value={content}
            />
          </View>

          {error ? (
            <Text className="text-[13px]" style={{ color: "#EF4444" }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="h-[50px] items-center justify-center rounded-control bg-brand-ink active:opacity-70"
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={isSubmitting ? { opacity: 0.6 } : undefined}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[15px] font-bold text-brand-white">
                Posting
              </Text>
            )}
          </Pressable>
    </BottomSheet>
  );
}

export function ForumScreen() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadPosts = useCallback((signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);

    return ForumService.listPosts({ sort: "latest", limit: 50 }, { signal })
      .then((res) => {
        setPosts(res.data.filter((p) => !p.isDeleted));
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setLoadError(
          err instanceof ApiError ? err.message : "Gagal memuat forum.",
        );
        setIsLoading(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      loadPosts(controller.signal);
      return () => controller.abort();
    }, [loadPosts]),
  );

  async function handleToggleLike(post: ForumPost) {
    const liked = post.isLiked;
    // optimistic
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              isLiked: !liked,
              likeCount: p.likeCount + (liked ? -1 : 1),
            }
          : p,
      ),
    );
    try {
      if (liked) await ForumService.unlikePost(post.id);
      else await ForumService.likePost(post.id);
    } catch {
      // revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                isLiked: liked,
                likeCount: p.likeCount + (liked ? 1 : -1),
              }
            : p,
        ),
      );
    }
  }

  return (
    <View className="flex-1 bg-brand-mist">
      <View className="flex-row items-center justify-between bg-brand-white border-b border-brand-border px-5 pt-14 pb-4">
        <Text className="text-[20px] font-extrabold text-brand-ink">
          Komunitas
        </Text>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-control bg-brand-ink px-3 py-2 active:opacity-70"
          onPress={() => setShowCreate(true)}
        >
          <Plus color="#FFFFFF" size={15} strokeWidth={2.5} />
          <Text className="text-[12px] font-bold text-brand-white">
            Buat Post
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View className="items-center py-10">
            <ActivityIndicator color="#263238" />
          </View>
        )}

        {!isLoading && loadError && (
          <View className="items-center gap-3 rounded-card border border-brand-border bg-brand-white p-6">
            <Text
              className="text-center text-[14px] text-brand-ink"
              style={{ opacity: 0.6 }}
            >
              {loadError}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="h-9 flex-row items-center gap-2 rounded-control bg-brand-ink px-4"
              onPress={() => loadPosts()}
            >
              <RefreshCw color="#FFFFFF" size={13} strokeWidth={2} />
              <Text className="text-[13px] font-bold text-brand-white">
                Coba lagi
              </Text>
            </Pressable>
          </View>
        )}

        {!isLoading && !loadError && posts.length === 0 && (
          <View className="items-center gap-3 rounded-card border border-brand-border bg-brand-white p-8">
            <MessageCircle
              color="#263238"
              size={32}
              strokeWidth={1.5}
              style={{ opacity: 0.25 }}
            />
            <Text
              className="text-center text-[14px] text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Belum ada post.{"\n"}Jadilah yang pertama berbagi!
            </Text>
          </View>
        )}

        {!isLoading &&
          !loadError &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              onToggleLike={handleToggleLike}
              post={post}
            />
          ))}
      </ScrollView>

      <CreatePostModal
        onClose={() => setShowCreate(false)}
        onCreated={() => loadPosts()}
        visible={showCreate}
      />
    </View>
  );
}
