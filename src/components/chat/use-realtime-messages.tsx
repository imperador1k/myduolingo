"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useRealtimeMessages = (initialMessages: any[], userId: string, otherUserId: string) => {
    const [messages, setMessages] = useState(initialMessages);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        const channel = supabase
            .channel('realtime:messages') // Unique tag
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const newMsg = payload.new;
                    // Filter: Only relevant messages
                    if (
                        (newMsg.sender_id === userId && newMsg.receiver_id === otherUserId) ||
                        (newMsg.sender_id === otherUserId && newMsg.receiver_id === userId)
                    ) {
                        // Need to format to match 'with sender' structure if possible, or handle partial data
                        // Payload new does not have relations.
                        // But we just need content and ID.
                        // We assume user info is known from context.
                        setMessages((prev) => [...prev, {
                            ...newMsg,
                            senderId: newMsg.sender_id, // Map snake_case to camelCase
                            receiverId: newMsg.receiver_id,
                            createdAt: new Date(newMsg.created_at),
                            content: newMsg.content,
                            type: newMsg.type,
                            fileName: newMsg.file_name,
                        }]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, otherUserId]);

    return messages;
};
