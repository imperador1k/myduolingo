"use client";

import { useState, useRef, useEffect } from "react";
import {
  Heart,
  Share2,
  Volume2,
  Bookmark,
  ChevronLeft,
  Search,
  CheckCircle2,
  X,
  Send,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CreatePostModal } from "@/components/feed/create-post-modal";
import { HappyStarLottie, CatLottie } from "@/components/ui/lottie-animation";
import {
  toggleLike,
  toggleSave,
  getShareableContacts,
  sharePostToChat,
  markPostAsRead,
} from "@/actions/feed";

// Types
type Post = {
  id: string;
  title: string;
  category: string;
  body: string;
  targetLanguage: string;
  cefrLevel: string;
  bgClass: string;
  likes: any[];
  saves: any[];
  creator: any;
};

export default function FeedClient({
  initialPosts = [],
}: {
  initialPosts?: any[];
}) {
  const router = useRouter();
  const [posts] = useState<Post[]>(initialPosts);

  // Initialize active post and track reads via IntersectionObserver
  useEffect(() => {
    if (posts.length > 0) {
      setActivePostId(posts[0].id);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("data-post-id");
              if (id) {
                setActivePostId(id);
                // Fire and forget, marks it as read in the background
                markPostAsRead(id).catch(console.error);
              }
            }
          });
        },
        { threshold: 0.6 },
      ); // 60% of the post needs to be visible to count as read

      const elements = document.querySelectorAll(".snap-start");
      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [posts]);

  // PC Drag-to-Scroll State
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  // Ghost Dictionary State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);

  // Social States
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [activePostId, setActivePostId] = useState<string>("post-1");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [activeSharePostId, setActiveSharePostId] = useState<string | null>(
    null,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharingTo, setSharingTo] = useState<string | null>(null);

  const translateGhost = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-ZÀ-ÿ]/g, "").toLowerCase();
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setTranslation(`[Tradução: ${cleanWord}]`);

    setTimeout(() => {
      setSelectedWord(null);
      setTranslation(null);
    }, 3000);
  };

  const renderInteractiveBody = (text: string) => {
    return text.split(" ").map((word, i) => (
      <span
        key={i}
        onClick={(e) => {
          e.stopPropagation();
          translateGhost(word);
        }}
        className="active:bg-white/20 rounded px-0.5 cursor-pointer transition-colors inline-block"
      >
        {word}{" "}
      </span>
    ));
  };

  const handleLike = async (postId: string) => {
    // Optimistic Update
    const newLikes = new Set(likedPosts);
    if (newLikes.has(postId)) newLikes.delete(postId);
    else newLikes.add(postId);
    setLikedPosts(newLikes);

    // Server Action
    await toggleLike(postId).catch(console.error);
  };

  const handleSave = async (postId: string) => {
    // Optimistic Update
    const newSaves = new Set(savedPosts);
    if (newSaves.has(postId)) newSaves.delete(postId);
    else newSaves.add(postId);
    setSavedPosts(newSaves);

    // Server Action
    await toggleSave(postId).catch(console.error);
  };

  const openShareModal = async (postId: string) => {
    setActiveSharePostId(postId);
    setIsShareModalOpen(true);
    setLoadingFriends(true);
    try {
      const contacts = await getShareableContacts();
      setFriends(contacts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleShare = async (friendId: string) => {
    if (!activeSharePostId) return;
    setSharingTo(friendId);
    try {
      await sharePostToChat(friendId, activeSharePostId);
      // Show success briefly
      setTimeout(() => {
        setIsShareModalOpen(false);
        setSharingTo(null);
        setActiveSharePostId(null);
      }, 500);
    } catch (e) {
      console.error(e);
      setSharingTo(null);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="bg-stone-100 dark:bg-slate-900 w-full h-[100dvh] overflow-hidden relative font-sans text-slate-900 dark:text-white flex items-center justify-center">
      {/* Duolingo Gamified PC Background Pattern (Light & Dark modes) */}
      <div
        className="absolute inset-0 hidden md:block dark:hidden opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div
        className="absolute inset-0 hidden md:dark:block opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      ></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl hidden md:block"></div>
      <AnimatePresence>
        {selectedWord && translation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-24 left-4 right-4 z-[100] bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="bg-sky-100 dark:bg-sky-500/20 p-3 rounded-full text-sky-500 dark:text-sky-400 shrink-0">
              <Volume2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest truncate">
                {selectedWord}
              </p>
              <p className="text-slate-900 dark:text-white text-lg font-black truncate">
                {translation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 w-full md:max-w-[450px] z-50 px-4 pt-8 pb-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => router.push("/learn")}
          className="p-3 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl pointer-events-auto hover:bg-black/10 dark:hover:bg-white/20 transition-all active:scale-95 border-b-4 border-black/10 dark:border-white/10"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-white" />
        </button>
        <div className="flex items-center font-black text-xl tracking-widest drop-shadow-md text-slate-800 dark:text-white">
          FEED
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-3 bg-sky-500/20 backdrop-blur-md rounded-2xl hover:bg-sky-500/30 transition-all active:scale-95 border-b-4 border-sky-500/20"
          >
            <Plus className="w-6 h-6 text-sky-600 dark:text-sky-400 stroke-[3]" />
          </button>
          <button
            onClick={() => router.push("/feed/saved")}
            className="p-3 bg-amber-500/20 backdrop-blur-md rounded-2xl hover:bg-amber-500/30 transition-all active:scale-95 border-b-4 border-amber-500/20"
          >
            <Bookmark className="w-6 h-6 text-amber-500 dark:text-amber-400 fill-amber-500/20 dark:fill-amber-400/20" />
          </button>
        </div>
      </div>

      {/* Centered Phone-like Container for PC */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={cn(
          "h-[100dvh] w-full md:max-w-[450px] mx-auto relative bg-white dark:bg-slate-950 overflow-y-scroll overflow-x-hidden snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:border-x-[8px] md:border-slate-200 md:dark:border-slate-800 md:rounded-[40px] md:h-[95dvh] shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)]",
          isDragging ? "cursor-grabbing snap-none" : "cursor-grab",
        )}
      >
        {posts.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
            <CatLottie className="w-48 h-48 mb-4 opacity-50" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
              Feed Vazio!
            </h2>
            <p className="font-medium max-w-[250px] mx-auto">
              Já viste tudo o que tinhas a ver! 🚀 Volta mais tarde para mais
              curiosidades ou cria a tua própria.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isSaved =
              savedPosts.has(post.id) || (post.saves?.length || 0) > 0;
            const likeCount = (post.likes?.length || 0) + (isLiked ? 1 : 0);
            const shareCount = 0; // Temporary placeholder for shares

            const authorName = post.creator?.name || "System";
            const authorImg =
              post.creator?.imageSrc || "https://i.pravatar.cc/150";

            return (
              <div
                key={post.id}
                data-post-id={post.id}
                className={cn(
                  "snap-start w-full h-[100dvh] md:h-[95dvh] flex flex-col justify-end relative overflow-hidden",
                )}
              >
                {/* Background Image / Color */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-b opacity-100 dark:opacity-80",
                    post.bgClass,
                  )}
                >
                  {/* Abstract Blur blobs to make it look premium */}
                  <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-60 dark:opacity-30 bg-white"></div>
                </div>

                {/* Dark gradient at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-stone-100/80 dark:from-black dark:via-black/40 to-transparent"></div>

                {/* Bottom Content Area */}
                <div className="relative w-full p-4 pb-8 flex items-end justify-between pointer-events-none z-10">
                  {/* Left Side: Post Info */}
                  <div className="flex-1 pr-16 pointer-events-auto mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        <img
                          src={authorImg}
                          alt={authorName}
                          className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-rose-500 rounded-full p-0.5 border-2 border-slate-900">
                          <Plus className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 dark:text-white drop-shadow-md">
                            {authorName}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-sky-500" />
                        </div>
                        <span className="text-[10px] font-black tracking-wider px-2 py-0.5 bg-black/10 dark:bg-white/20 rounded-full backdrop-blur-md text-slate-700 dark:text-white inline-block mt-0.5">
                          {post.category} • {post.cefrLevel}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-black mb-2 text-slate-900 dark:text-white drop-shadow-md">
                      {post.title}
                    </h2>
                    <div className="text-[15px] text-slate-700 dark:text-slate-100 font-medium leading-snug drop-shadow-sm select-none">
                      {renderInteractiveBody(post.body)}
                    </div>
                  </div>

                  {/* Right Side: Interactions */}
                  <div className="flex flex-col items-center gap-5 pb-4 pointer-events-auto shrink-0">
                    <div className="relative mb-2">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                        <img
                          src={authorImg}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-500 rounded-full w-5 h-5 flex items-center justify-center border border-white cursor-pointer active:scale-90 transition-transform">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
                        </svg>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <Heart
                        className={cn(
                          "w-9 h-9 group-active:scale-90 transition-all drop-shadow-lg",
                          isLiked
                            ? "text-rose-500 fill-rose-500"
                            : "text-slate-600 dark:text-white",
                        )}
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-white drop-shadow-md">
                        {formatNumber(likeCount)}
                      </span>
                    </button>

                    <button
                      onClick={() => handleSave(post.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <Bookmark
                        className={cn(
                          "w-9 h-9 group-active:scale-90 transition-all drop-shadow-lg",
                          isSaved
                            ? "text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400"
                            : "text-slate-600 dark:text-white fill-slate-200 dark:fill-white/20",
                        )}
                      />
                      <span className="text-xs font-bold text-slate-600 dark:text-white drop-shadow-md">
                        Save
                      </span>
                    </button>

                    <button
                      onClick={() => openShareModal(post.id)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <Share2 className="w-9 h-9 text-slate-600 dark:text-white group-active:scale-90 transition-transform drop-shadow-lg fill-slate-200 dark:fill-white/20" />
                      <span className="text-xs font-bold text-slate-600 dark:text-white drop-shadow-md">
                        {formatNumber(shareCount)}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        targetLanguage="Português"
      />

      {/* Share Modal Overlay */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm flex items-end md:items-center justify-center p-4 md:p-0"
          >
            <motion.div
              initial={{ y: "100%", scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-slate-900 w-full md:w-[400px] h-[60vh] md:h-[500px] rounded-[32px] p-6 flex flex-col border-4 border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Partilhar com Amigos
                </h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-90 border-b-4 border-slate-300 dark:border-slate-950"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {loadingFriends ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    Loading friends...
                  </div>
                ) : friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Share2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">
                      No mutual friends yet.
                    </p>
                    <p className="text-slate-500 text-sm">
                      Follow people and get them to follow you back to share
                      directly.
                    </p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.userId}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-b-4 border-slate-200 dark:border-slate-950"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.userImageSrc}
                          alt={friend.userName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-bold text-slate-900 dark:text-white text-lg">
                          {friend.userName}
                        </span>
                      </div>
                      <button
                        onClick={() => handleShare(friend.userId)}
                        disabled={sharingTo === friend.userId}
                        className="bg-sky-500 hover:bg-sky-400 text-white font-black py-2 px-5 rounded-2xl flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 border-b-4 border-sky-600 active:border-b-0 active:translate-y-1"
                      >
                        {sharingTo === friend.userId ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            Enviar <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
