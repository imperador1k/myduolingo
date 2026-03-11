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
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    const newMsg = payload.new as any;
                    
                    if (payload.eventType === 'INSERT') {
                        // Filter: Only relevant messages
                        if (
                            (newMsg.sender_id === userId && newMsg.receiver_id === otherUserId) ||
                            (newMsg.sender_id === otherUserId && newMsg.receiver_id === userId)
                        ) {
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
                    } else if (payload.eventType === 'UPDATE') {
                        // Update existing message (e.g., read status changed)
                        setMessages((prev) => prev.map((msg) => 
                            msg.id === newMsg.id 
                                ? { ...msg, read: newMsg.read } 
                                : msg
                        ));
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
