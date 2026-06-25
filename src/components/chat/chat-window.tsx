"use client";

import { sendMessage, markAsRead, toggleReaction } from "@/actions/messages";
import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Send,
  Image as ImageIcon,
  X,
  FileText,
  Download,
  ChevronLeft,
  CheckCheck,
  Users,
  Loader2,
  Smile,
  BadgeCheck,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useRealtimeMessages,
  type ChatMessage,
} from "@/hooks/use-realtime-messages";
import { useGlobalPresence } from "@/components/providers/global-presence-provider";
import { toast } from "sonner";
import { EmptyLottie } from "@/app/(main)/messages/empty-lottie";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UploadButton } from "./upload-button";
const GifSelector = dynamic(
  () => import("./gif-selector").then((mod) => mod.GifSelector),
  { ssr: false },
);
import { motion, AnimatePresence } from "framer-motion";
import { useLongPress } from "@/hooks/use-long-press";
import dynamic from "next/dynamic";
import { MessageItem } from "./message-item";
import { SignalOnboarding } from "./signal-onboarding";
import { ChatSettingsModal } from "./chat-settings-modal";
import {
  getConversationKey,
  saveConversationKeys,
  getE2EPublicKey,
} from "@/actions/crypto";
import {
  generateConversationKey,
  encryptConversationKeyForUser,
  encryptMessage,
  decryptConversationKey,
  importPublicKey,
} from "@/lib/crypto";
import localforage from "localforage";

type Props = {
  userId: string;
  conversationId: string;
  partner: {
    userId: string;
    userName: string;
    userImageSrc: string | null;
    isPro?: boolean;
  } | null;
  participants: {
    userId: string;
    userName: string | null;
    userImageSrc: string | null;
  }[];
  isGroup?: boolean;
  groupName?: string | null;
  groupImageUrl?: string | null;
  initialMessages: ChatMessage[];
};

export const ChatWindow = ({
  userId,
  conversationId,
  partner,
  participants,
  isGroup,
  groupName,
  groupImageUrl,
  initialMessages,
}: Props) => {
  const { messages, addOptimisticMessage, isPartnerTyping, trackTyping } =
    useRealtimeMessages(initialMessages, userId, conversationId);
  const { isPartnerOnline: checkIsPartnerOnline } = useGlobalPresence();
  const isPartnerOnline = partner
    ? checkIsPartnerOnline(partner.userId)
    : false;

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | number | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Emojis for quick reactions
  const QUICK_EMOJIS = ["❤️", "🔥", "😂", "🙌", "✅"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Auto-resize logic
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px"; // Reset to base height to calculate scrollHeight
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120); // Max height 120px
      textareaRef.current.style.height = `${newHeight}px`;
    }

    if (trackTyping) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        trackTyping(true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        trackTyping(false);
      }, 2000);
    }
  };

  const scrollToBottom = (force = false) => {
    if (!scrollRef.current || !bottomRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

    if (force || isNearBottom) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Special initial scroll
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [conversationId]);

  // Handle auto-scrolling when messages change
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const isFromMe = lastMessage?.senderId === userId;

    // Only force scroll if the message was sent by me
    // Otherwise, only scroll if the user is already near the bottom
    scrollToBottom(isFromMe);

    // Mark as read when messages change or conversation opens
    if (conversationId) {
      markAsRead(conversationId).catch(console.error);
    }
  }, [messages.length, conversationId, userId]); // Depend on messages.length to avoid scrolling on reactions

  const handleSubmit = async (formData: FormData) => {
    const rawContent = formData.get("content")?.toString();
    if (!rawContent || isSending) return;

    setIsSending(true);
    const optimisticId = `temp-${Date.now()}`;

    // Optimistic UI update (shows plaintext to sender)
    addOptimisticMessage({
      id: optimisticId,
      senderId: userId,
      conversationId: Number(conversationId),
      content: rawContent,
      type: "text",
      createdAt: new Date(),
      read: false,
    });

    formRef.current?.reset();
    if (trackTyping) trackTyping(false);
    setTimeout(scrollToBottom, 50);

    try {
      let finalContent = rawContent;

      // E2EE Encryption flow for 1-on-1 and Group chats
      if (partner?.userId || isGroup) {
        let conversationKey: CryptoKey | null = null;

        // 1. Try to load Conversation Key locally
        const localRoomKeys =
          (await localforage.getItem<Record<string, CryptoKey>>(
            "e2e_room_keys",
          )) || {};
        conversationKey = localRoomKeys[conversationId];

        // 2. Try to fetch from server if not local
        if (!conversationKey) {
          const encryptedRoomKeyBase64 =
            await getConversationKey(conversationId);
          if (encryptedRoomKeyBase64) {
            const myPrivateKey =
              await localforage.getItem<CryptoKey>("e2e_private_key");
            if (myPrivateKey) {
              conversationKey = await decryptConversationKey(
                encryptedRoomKeyBase64,
                myPrivateKey,
              );
              localRoomKeys[conversationId] = conversationKey;
              await localforage.setItem("e2e_room_keys", localRoomKeys);
            }
          }
        }

        // 3. Generate a new one if it doesn't exist anywhere
        if (!conversationKey) {
          const myPrivateKey =
            await localforage.getItem<CryptoKey>("e2e_private_key");
          if (myPrivateKey) {
            conversationKey = await generateConversationKey();
            localRoomKeys[conversationId] = conversationKey;
            await localforage.setItem("e2e_room_keys", localRoomKeys);

            // Fetch public keys of all participants
            const targetIds = isGroup
              ? participants.map((p) => p.userId)
              : [partner!.userId, userId];
            const keysPayload = [];

            for (const tId of targetIds) {
              const pubKeyStr = await getE2EPublicKey(tId);
              if (pubKeyStr) {
                const pubKey = await importPublicKey(pubKeyStr);
                const encryptedForUser = await encryptConversationKeyForUser(
                  conversationKey,
                  pubKey,
                );
                keysPayload.push({
                  userId: tId,
                  encryptedRoomKey: encryptedForUser,
                });
              }
            }

            // Save to server
            if (keysPayload.length > 0) {
              await saveConversationKeys(conversationId, keysPayload);
            }
          }
        }

        // 4. Encrypt the message
        if (conversationKey) {
          const encryptedStr = await encryptMessage(
            rawContent,
            conversationKey,
          );
          finalContent = `[e2ee-v2]:${encryptedStr}`;
        }
      }

      await sendMessage(
        String(conversationId),
        finalContent,
        undefined,
        replyingTo?.id ? Number(replyingTo.id) : undefined,
      );
      setReplyingTo(null);
    } catch (error) {
      console.error("Erro E2EE ou envio", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const onReaction = async (messageId: string | number, emoji: string) => {
    if (typeof messageId !== "number") return;
    try {
      await toggleReaction(messageId, emoji);
      setActiveMenuId(null);
    } catch (error) {
      toast.error("Erro ao reagir");
    }
  };

  const handleSendGif = async (gif: import("@/types").GiphyGif) => {
    const gifUrl = gif.images.fixed_height.url;
    setShowGifPicker(false);

    const optimisticId = `temp-${Date.now()}`;
    addOptimisticMessage({
      id: optimisticId,
      senderId: userId,
      conversationId: Number(conversationId),
      content: gifUrl,
      type: "image",
      createdAt: new Date(),
      read: false,
    });
    setTimeout(scrollToBottom, 50);

    try {
      await sendMessage(conversationId, gifUrl, gifUrl); // gif as image
    } catch (error) {
      toast.error("Erro ao enviar GIF");
    }
  };

  const handleUploadComplete = async (
    url: string,
    type: "image" | "file",
    fileName: string,
  ) => {
    const optimisticId = `temp-${Date.now()}`;
    addOptimisticMessage({
      id: optimisticId,
      senderId: userId,
      conversationId: Number(conversationId),
      content: url,
      type: type,
      fileName: fileName,
      createdAt: new Date(),
      read: false,
    });
    setTimeout(scrollToBottom, 50);

    try {
      await sendMessage(
        conversationId,
        url,
        type === "image" ? url : undefined,
      );
    } catch (error) {
      toast.error("Erro no upload");
    }
  };

  const isGif = (content: string) => content.includes("giphy.com/media");

  const truncate = (text: string, length: number = 60) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const formatTimestamp = (dateString: string | Date) => {
    if (!mounted) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const scrollToMessage = (messageId: string | number) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(messageId);
      setTimeout(() => setHighlightedId(null), 2000);
    } else {
      toast.info("Mensagem original já não está visível");
    }
  };

  const lastMyMessageIndex = [...messages]
    .reverse()
    .findIndex((m) => m.senderId === userId);
  const actualLastMyMessageIndex =
    lastMyMessageIndex !== -1 ? messages.length - 1 - lastMyMessageIndex : -1;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 relative">
      {/* Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-5xl w-full h-full sm:h-auto sm:max-h-[95vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-visible [&>button]:hidden">
          <DialogTitle className="sr-only">Visualizador de Imagem</DialogTitle>
          {selectedImage && (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-10 animate-in fade-in zoom-in duration-300">
              <div className="relative max-w-full flex justify-center">
                <div className="absolute -top-12 right-0 sm:-right-6 sm:-top-6 flex gap-3 z-[60]">
                  <a
                    href={selectedImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-900/60 hover:bg-slate-900/80 backdrop-blur-xl text-white p-3.5 rounded-full transition-all border-2 border-white/20 shadow-2xl hover:scale-110 active:scale-95"
                  >
                    <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                  </a>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="bg-slate-900/60 hover:bg-rose-500/90 backdrop-blur-xl text-white p-3.5 rounded-full transition-all border-2 border-white/20 shadow-2xl hover:scale-110 active:scale-95"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                <div className="relative max-w-full min-h-[50vh] sm:min-h-[60vh] min-w-[50vw] sm:min-w-[60vw] rounded-[24px] sm:rounded-[32px] overflow-hidden border-4 border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-slate-900/50 backdrop-blur-sm">
                  <Image
                    src={selectedImage}
                    alt="Enlarged media"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Arcade Header */}
      <div className="h-20 flex items-center justify-between px-6 bg-white dark:bg-slate-900 z-20 w-full border-b-2 border-stone-100 dark:border-slate-800 relative shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/messages" className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl border-2 border-transparent hover:bg-stone-100 dark:hover:bg-slate-800 dark:bg-slate-800 active:translate-y-1"
            >
              <ChevronLeft className="h-6 w-6 text-stone-400 dark:text-slate-500 dark:text-slate-400" />
            </Button>
          </Link>

          <div
            className="flex items-center gap-x-4 group cursor-pointer hover:bg-stone-50 dark:bg-slate-950 p-2 -ml-2 rounded-2xl transition-colors active:bg-stone-100 dark:bg-slate-800"
            onClick={() => setIsSettingsOpen(true)}
          >
            <div className="relative h-12 w-12 shrink-0 flex items-center justify-center rounded-[18px] border-2 border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-950 overflow-visible shadow-sm transition-all group-hover:border-[#1CB0F6]">
              {isGroup ? (
                groupImageUrl ? (
                  <Image
                    src={groupImageUrl}
                    alt={groupName || "Group"}
                    fill
                    className="object-cover rounded-[16px]"
                  />
                ) : (
                  <div className="flex -space-x-3 items-center h-full w-full justify-center">
                    {(participants || []).slice(0, 2).map((p, idx) => (
                      <div
                        key={p.userId}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-stone-100 dark:bg-slate-800 shadow-sm relative shrink-0",
                          idx === 1 && "z-10",
                        )}
                      >
                        {p.userImageSrc ? (
                          <Image
                            src={p.userImageSrc}
                            alt={p.userName || ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-stone-400 dark:text-slate-500 dark:text-slate-400">
                            {p.userName?.[0] || "?"}
                          </div>
                        )}
                      </div>
                    ))}
                    {(participants || []).length > 2 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-stone-50 dark:bg-slate-950 flex items-center justify-center text-[8px] font-black text-stone-500 dark:text-slate-400 z-20 shadow-sm shrink-0">
                        +{(participants || []).length - 2}
                      </div>
                    )}
                  </div>
                )
              ) : partner?.userImageSrc ? (
                <Image
                  src={partner.userImageSrc}
                  alt={partner.userName}
                  fill
                  className="object-cover rounded-[16px]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-black text-stone-400 dark:text-slate-500 dark:text-slate-400 uppercase">
                  {partner?.userName?.[0] || "?"}
                </div>
              )}
              {isPartnerOnline && !isGroup && (
                <span className="w-3.5 h-3.5 bg-[#58CC02] rounded-full border-2 border-white absolute -bottom-1 -right-1 z-10 shadow-sm"></span>
              )}
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-stone-800 dark:text-slate-100 text-lg tracking-tight leading-none flex items-center">
                {isGroup ? groupName : partner?.userName}
                {!isGroup && partner?.isPro && (
                  <BadgeCheck
                    className="h-5 w-5 text-amber-500 fill-amber-300 ml-1.5 shrink-0 inline-block"
                    aria-hidden="true"
                  />
                )}
              </h2>
              <span
                className={cn(
                  "text-[11px] font-black uppercase tracking-widest mt-1",
                  isPartnerOnline || isGroup
                    ? "text-[#58CC02]"
                    : "text-stone-300",
                )}
              >
                {isGroup
                  ? "Conversa de Grupo"
                  : isPartnerOnline
                    ? "Online"
                    : "Offline"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="h-10 w-10 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-stone-400 dark:text-slate-500 dark:text-slate-400 hover:text-stone-600 dark:text-slate-300 transition-colors"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      <ChatSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isGroup={isGroup}
        groupName={groupName}
        partner={partner}
        participants={participants}
        messages={messages}
        conversationId={conversationId}
        isPartnerOnline={isPartnerOnline}
        groupImageUrl={groupImageUrl}
      />

      {/* Signal Onboarding flow for DMs */}
      {!isGroup && <SignalOnboarding />}

      {/* Message Canvas */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#f8fafc] dark:bg-slate-900 min-h-0 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 dark:text-slate-500 dark:text-slate-400 gap-4 mt-8 opacity-60">
            <div className="text-6xl animate-bounce">👋</div>
            <p className="font-black text-xl text-stone-600 dark:text-slate-300">
              Diz olá!
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageItem
            key={msg.id || i}
            msg={msg}
            i={i}
            userId={userId}
            actualLastMyMessageIndex={actualLastMyMessageIndex}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
            highlightedId={highlightedId}
            setReplyingTo={setReplyingTo}
            onReaction={onReaction}
            scrollToMessage={scrollToMessage}
            setSelectedImage={setSelectedImage}
            truncate={truncate}
            formatTimestamp={formatTimestamp}
            isGroup={isGroup}
          />
        ))}

        {isPartnerTyping && (
          <div className="self-start flex items-center px-4 py-3 bg-white dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 border-b-4 rounded-tl-md rounded-[1.2rem] shadow-sm animate-pulse mt-2">
            <div className="flex gap-1.5 items-center">
              <span
                className="w-2 h-2 bg-stone-300 dark:bg-slate-600 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-stone-300 dark:bg-slate-600 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-stone-300 dark:bg-slate-600 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Console (Action Bar) */}
      <div className="bg-white dark:bg-slate-900 border-t-2 border-stone-100 dark:border-slate-800 p-4 md:p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] shrink-0 relative z-20">
        {/* Reply Banner */}
        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-5xl mx-auto mb-4 overflow-hidden"
            >
              <div className="bg-stone-50 dark:bg-slate-800 border-2 border-stone-200 dark:border-slate-700 rounded-2xl flex items-center justify-between p-3 gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-1 h-8 bg-[#1CB0F6] rounded-full shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#1CB0F6]">
                      A responder a uma mensagem
                    </span>
                    <p className="text-sm font-bold text-stone-600 dark:text-slate-300 truncate">
                      {truncate(replyingTo.content)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="h-10 w-10 bg-stone-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-stone-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-all shrink-0"
                >
                  <X className="h-4 w-4 text-stone-500 dark:text-slate-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showGifPicker && (
          <div className="absolute bottom-24 left-6 right-6 sm:right-auto sm:left-6 z-[200] bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-2xl border-2 border-stone-200 dark:border-slate-800 border-b-[8px] h-[400px] w-auto sm:w-[320px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <span className="font-black text-xs text-stone-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-2">
                GIPHY VAULT
              </span>
              <button
                onClick={() => setShowGifPicker(false)}
                className="h-8 w-8 bg-stone-50 dark:bg-slate-950 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all"
              >
                <X className="h-4 w-4 text-stone-400 dark:text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <GifSelector onSelect={handleSendGif} />
            </div>
          </div>
        )}

        <form
          action={(formData) => {
            handleSubmit(formData);
            if (textareaRef.current) {
              textareaRef.current.style.height = "40px"; // Reset height after send
            }
          }}
          ref={formRef}
          className="flex gap-2 md:gap-4 items-end w-full max-w-5xl mx-auto"
        >
          <div className="relative flex-1 flex items-end gap-1 md:gap-3 bg-[#ff9cfc] border-[4px] border-black rounded-none px-2 md:px-4 py-2 min-h-[56px] shadow-[4px_4px_0_0_#000] md:shadow-[6px_6px_0_0_#000] focus-within:-translate-y-1 focus-within:shadow-[6px_6px_0_0_#000] md:focus-within:shadow-[8px_8px_0_0_#000] transition-all group z-10">
            {/* 8-bit Tail */}
            <div className="absolute -bottom-[16px] left-6 w-[20px] h-[20px] bg-[#ff9cfc] border-b-[4px] border-l-[4px] border-black -rotate-12 rounded-bl-sm z-[-1] pointer-events-none shadow-[-2px_2px_0_0_rgba(0,0,0,0.1)]"></div>

            <UploadButton onUploadComplete={handleUploadComplete} />
            <button
              type="button"
              onClick={() => setShowGifPicker(!showGifPicker)}
              className="bg-transparent rounded-none h-10 w-10 flex items-center justify-center transition-all shrink-0 text-black hover:bg-black/10"
            >
              <ImageIcon className="h-6 w-6 stroke-[2.5]" />
            </button>

            <textarea
              ref={textareaRef}
              name="content"
              disabled={isSending}
              placeholder="escreve a tua mensagem..."
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (formRef.current) {
                    formRef.current.requestSubmit();
                  }
                }
              }}
              className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[16px] font-mono font-black text-black placeholder:text-black/50 placeholder:font-mono h-[40px] max-h-[120px] w-full disabled:opacity-50 tracking-tight resize-none py-[10px] leading-tight"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="h-12 px-4 md:h-14 md:px-8 rounded-none bg-[#58CC02] hover:bg-[#4eb801] active:translate-y-1 active:shadow-none text-black font-black text-sm uppercase tracking-widest border-[4px] border-black transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000] md:shadow-[6px_6px_0_0_#000] shrink-0 disabled:bg-stone-400 disabled:border-black disabled:text-stone-700 disabled:shadow-[4px_4px_0_0_#000]"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5 drop-shadow-sm" />
            )}
            <span className="hidden md:inline">
              {isSending ? "A enviar..." : "Enviar"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};
