"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCheck, Reply, FileText, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLongPress } from "@/hooks/use-long-press";
import { useRef, useEffect, memo } from "react";

import { type ChatMessage } from "@/hooks/use-realtime-messages";

import { decryptMessage, decryptConversationKey } from "@/lib/crypto";
import { getConversationKey } from "@/actions/crypto";
import localforage from "localforage";
import { useState } from "react";

// Cache to prevent UI lag
const decryptedMessageCache = new Map<string, Promise<string>>();

type MessageItemProps = {
  msg: ChatMessage;
  i: number;
  userId: string;
  actualLastMyMessageIndex: number;
  activeMenuId: string | number | null;
  setActiveMenuId: (id: string | number | null) => void;
  highlightedId: string | number | null;
  setReplyingTo: (msg: ChatMessage) => void;
  onReaction: (messageId: string | number, emoji: string) => void;
  scrollToMessage: (messageId: string | number) => void;
  setSelectedImage: (url: string | null) => void;
  truncate: (text: string, length?: number) => string;
  formatTimestamp: (date: Date) => string;
  isGroup?: boolean; // We need to know if it's a group
};

export const MessageItem = memo(
  ({
    msg,
    i,
    userId,
    actualLastMyMessageIndex,
    activeMenuId,
    setActiveMenuId,
    highlightedId,
    setReplyingTo,
    onReaction,
    scrollToMessage,
    setSelectedImage,
    truncate,
    formatTimestamp,
    isGroup = false,
  }: MessageItemProps) => {
    const isMe = msg.senderId === userId;
    const isTemp = msg.id?.toString().startsWith("temp-");
    const isGif = (content: string) => content.includes("giphy.com/media");

    // E2EE Decryption State
    const [decryptedText, setDecryptedText] = useState<string | null>(null);
    const [isDecrypting, setIsDecrypting] = useState(false);

    useEffect(() => {
      if (msg.type === "text" && msg.content.startsWith("[e2ee-v2]:")) {
        let isMounted = true;

        const executeDecryption = async () => {
          setIsDecrypting(true);
          try {
            let decryptPromise = decryptedMessageCache.get(msg.id.toString());

            if (!decryptPromise) {
              const ciphertext = msg.content.replace("[e2ee-v2]:", "");

              // Find the conversation key
              let conversationKey: CryptoKey | null = null;
              const localRoomKeys =
                (await localforage.getItem<Record<string, CryptoKey>>(
                  "e2e_room_keys",
                )) || {};
              conversationKey = localRoomKeys[msg.conversationId.toString()];

              if (!conversationKey) {
                // Fetch encrypted room key from server
                const encryptedRoomKeyBase64 = await getConversationKey(
                  msg.conversationId.toString(),
                );
                if (encryptedRoomKeyBase64) {
                  const myPrivateKey =
                    await localforage.getItem<CryptoKey>("e2e_private_key");
                  if (myPrivateKey) {
                    conversationKey = await decryptConversationKey(
                      encryptedRoomKeyBase64,
                      myPrivateKey,
                    );
                    localRoomKeys[msg.conversationId.toString()] =
                      conversationKey;
                    await localforage.setItem("e2e_room_keys", localRoomKeys);
                  }
                }
              }

              if (!conversationKey) {
                throw new Error("Missing conversation key");
              }

              decryptPromise = decryptMessage(ciphertext, conversationKey);
              decryptedMessageCache.set(msg.id.toString(), decryptPromise);
            }

            const text = await decryptPromise;
            if (isMounted) setDecryptedText(text);
          } catch (e) {
            console.error("Decryption failed", e);
            if (isMounted)
              setDecryptedText("🔒 Mensagem encriptada (Erro de Chave)");
          } finally {
            if (isMounted) setIsDecrypting(false);
          }
        };

        executeDecryption();
        return () => {
          isMounted = false;
        };
      } else {
        setDecryptedText(null); // Reset if not encrypted
      }
    }, [msg.content, msg.id, msg.conversationId]);

    const isOldSignalMsg =
      msg.type === "text" && msg.content.startsWith("[e2ee]:");
    const displayContent =
      decryptedText ??
      (isOldSignalMsg
        ? "🔒 Mensagem protegida por E2EE (Protocolo Antigo)"
        : msg.content);
    const isImage = msg.type === "image" || isGif(displayContent);
    const isFile = msg.type === "file";
    const hasReactions = msg.reactions && msg.reactions.length > 0;

    const menuRef = useRef<HTMLDivElement>(null);
    const QUICK_EMOJIS = ["❤️", "🔥", "😂", "🙌", "✅"];

    // Group reactions by emoji
    const reactionsByEmoji = (msg.reactions || []).reduce<
      Record<string, number>
    >((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {});

    // Hook for long press menu
    const longPressProps = useLongPress(
      () => setActiveMenuId(msg.id),
      () => (isImage ? setSelectedImage(msg.content) : null),
    );

    // Close menu on click outside specifically for this item's menu
    useEffect(() => {
      if (activeMenuId !== msg.id) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setActiveMenuId(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [activeMenuId, msg.id, setActiveMenuId]);

    return (
      <div
        id={`msg-${msg.id}`}
        className={cn(
          "flex w-full flex-col group/msg transition-all duration-500 relative",
          isMe ? "items-end" : "items-start",
          (highlightedId === msg.id || activeMenuId === msg.id) &&
            "z-above-modal overflow-visible",
          highlightedId === msg.id && "scale-105 brightness-110",
        )}
      >
        {/* Reply Quote (Parent Message) */}
        {msg.repliedMessage && msg.replyToId && (
          <div
            onClick={() => scrollToMessage(msg.replyToId as number)}
            className={cn(
              "px-4 py-2 mb-[-8px] text-[13px] font-bold opacity-60 bg-stone-100 border-2 border-stone-200 rounded-t-2xl max-w-[70%] truncate flex items-center gap-2 cursor-pointer hover:bg-stone-200 transition-all active:scale-95",
              isMe
                ? "rounded-tr-md mr-1 border-r-0"
                : "rounded-tl-md ml-1 border-l-0",
            )}
          >
            <div className="w-1 h-4 bg-stone-300 rounded-full shrink-0" />
            <Reply className="w-3 h-3" />
            {truncate(msg.repliedMessage.content)}
          </div>
        )}

        <div
          {...longPressProps}
          onContextMenu={(e) => {
            e.preventDefault();
            setActiveMenuId(msg.id);
          }}
          className={cn(
            "max-w-[75%] rounded-[1.5rem] text-[15px] overflow-visible relative border-2 border-b-[6px] transition-all animate-in fade-in slide-in-from-bottom-1 duration-300 shadow-sm cursor-pointer break-words break-all whitespace-pre-wrap",
            isMe
              ? "bg-[#1CB0F6] text-white border-[#1CB0F6] rounded-tr-md self-end"
              : "bg-white text-stone-700 border-stone-200 rounded-tl-md self-start",
            isTemp && "opacity-70 grayscale-[0.5]",
            highlightedId === msg.id &&
              "ring-4 ring-[#1CB0F6]/20 border-[#1CB0F6]",
          )}
          style={isMe ? { borderBottomColor: "#0092d6" } : {}}
        >
          {/* Floating Menu (Reaction & Reply) */}
          <AnimatePresence>
            {activeMenuId === msg.id && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -65, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "absolute bottom-full flex bg-white border-2 border-stone-200 border-b-6 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1.5 z-above-modal gap-1",
                  isMe ? "right-0" : "left-0",
                )}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReaction(msg.id, emoji);
                    }}
                    className="h-10 w-10 flex items-center justify-center text-xl hover:bg-stone-50 hover:scale-125 transition-all rounded-xl active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-[2px] h-6 bg-stone-100 self-center mx-1 rounded-full" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setReplyingTo(msg);
                    setActiveMenuId(null);
                  }}
                  className="px-4 flex items-center gap-2 hover:bg-stone-50 transition-all rounded-xl active:scale-95"
                >
                  <Reply className="w-4 h-4 text-stone-400" />
                  <span className="text-xs font-black text-stone-600 uppercase tracking-widest">
                    Responder
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {isDecrypting ? (
            <div className="px-5 py-3 font-bold text-stone-500 italic animate-pulse">
              A desencriptar...
            </div>
          ) : isImage ? (
            <div className="relative group overflow-hidden rounded-2xl">
              <img
                src={displayContent}
                alt="Image"
                className="rounded-2xl object-cover max-h-72 w-auto bg-stone-200"
                loading="lazy"
              />
            </div>
          ) : isFile ? (
            <div className="flex items-center gap-3 px-5 py-4">
              <FileText
                className={cn(
                  "h-8 w-8",
                  isMe ? "text-white" : "text-stone-400",
                )}
              />
              <div className="flex flex-col">
                <span className="truncate font-black text-base max-w-[150px]">
                  {msg.fileName || "Ficheiro"}
                </span>
                <a
                  href={displayContent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-xs font-black uppercase tracking-widest mt-1",
                    isMe ? "text-sky-100" : "text-sky-500",
                  )}
                >
                  Transferir
                </a>
              </div>
            </div>
          ) : (
            <div className="px-5 py-3 font-bold leading-relaxed">
              {displayContent}
            </div>
          )}
        </div>

        {/* Reactions & Timestamp row */}
        <div
          className={cn(
            "flex flex-col gap-1.5 mt-1.5 px-1 w-full",
            isMe ? "items-end" : "items-start",
          )}
        >
          {/* Reaction Pills */}
          <AnimatePresence mode="popLayout">
            {hasReactions && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "flex flex-wrap gap-1.5",
                  isMe ? "justify-end" : "justify-start",
                )}
              >
                {Object.entries(reactionsByEmoji).map(
                  ([emoji, count]: [string, any]) => (
                    <motion.button
                      key={emoji}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onReaction(msg.id, emoji)}
                      className={cn(
                        "px-2.5 py-1 rounded-full border-2 border-b-4 text-[13px] font-black flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5 active:border-b-2",
                        isMe
                          ? "bg-white/10 border-white/20 text-white"
                          : "bg-white border-stone-200 text-stone-600",
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="text-[11px] opacity-70">{count}</span>
                    </motion.button>
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={cn(
              "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
              isMe
                ? "justify-end text-sky-400"
                : "justify-start text-stone-300",
            )}
          >
            <span>{formatTimestamp(msg.createdAt)}</span>
            {!isMe && msg.sender?.isPro && (
              <BadgeCheck className="w-3 h-3 text-amber-500 fill-amber-300" />
            )}
            {isMe && i === actualLastMyMessageIndex && msg.read && (
              <span className="ml-1 text-[#58CC02] flex items-center gap-1">
                <CheckCheck className="w-3 h-3" /> Visto
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);
MessageItem.displayName = "MessageItem";
