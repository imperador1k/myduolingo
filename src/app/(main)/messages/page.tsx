import { Suspense } from "react";
import { getConversations, getMessages } from "@/actions/messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { EmptyLottie } from "./empty-lottie";

type Props = {
    searchParams: {
        userId?: string;
        conversationId?: string;
    };
};

export default function MessagesPage({ searchParams }: Props) {
    const activeConversationId = searchParams.conversationId;

    return (
        <div className="flex h-[max(100vh-64px,100dvh-64px)] md:h-[calc(100vh-100px)] w-full gap-0 bg-white md:border-2 border-stone-200 md:border-b-[10px] md:rounded-[2.5rem] max-w-[1056px] overflow-hidden md:shadow-2xl mx-auto md:my-6 relative">
            <Suspense fallback={<MessagesSkeleton activeConversationId={activeConversationId} />}>
                <MessagesData searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

async function MessagesData({ searchParams }: Props) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const conversationsList = await getConversations();
    const activeConversationId = searchParams.conversationId;

    let activeConversation = null;
    let initialMessages: any[] = [];
    let partner = null;

    if (activeConversationId) {
        activeConversation = conversationsList.find((c: any) => c.id === activeConversationId);
        if (activeConversation) {
            initialMessages = await getMessages(activeConversationId);
            partner = activeConversation.partner;
        }
    }

    return (
        <>
            {/* Sidebar Container */}
            <div className={cn("w-full md:w-[380px] flex-shrink-0 md:border-r-2 border-stone-100 bg-stone-50/50 z-10 animate-in fade-in duration-500", activeConversationId ? "hidden md:flex" : "flex")}>
                <ChatSidebar conversations={conversationsList} />
            </div>

            {/* Window Container */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#f8fafc] relative animate-in fade-in duration-500",
                !activeConversationId ? "hidden md:flex" : "fixed inset-0 z-[100] bg-[#f8fafc] md:static md:z-auto h-[100dvh] md:h-auto"
            )}>
                {activeConversationId && activeConversation ? (
                    <ChatWindow
                        userId={userId}
                        conversationId={activeConversationId}
                        partner={partner}
                        participants={activeConversation.participants}
                        isGroup={activeConversation.isGroup}
                        groupName={activeConversation.name}
                        initialMessages={initialMessages.reverse()}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-6 p-12">
                        <div className="w-72 h-72 mb-4 drop-shadow-xl animate-in fade-in zoom-in duration-700">
                            <EmptyLottie />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="font-black text-3xl text-stone-800 uppercase tracking-tighter">As Tuas Conversas</p>
                            <p className="text-lg font-bold text-stone-400 max-w-sm">Seleciona um amigo ou grupo para começares a interagir no Vault.</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// --- SKELETON FALLBACK ---
const MessagesSkeleton = ({ activeConversationId }: { activeConversationId?: string }) => {
    return (
        <>
            {/* Sidebar Skeleton */}
            <div className={cn("w-full md:w-[380px] flex-shrink-0 md:border-r-2 border-stone-100 bg-stone-50/50 z-10 p-4", activeConversationId ? "hidden md:flex" : "flex")}>
                <div className="w-full flex flex-col gap-4 animate-pulse">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-8 w-32 bg-stone-200 rounded-xl" />
                        <div className="h-10 w-10 bg-stone-200 rounded-full" />
                    </div>
                    {/* Search */}
                    <div className="h-12 w-full bg-stone-200 rounded-2xl mb-4" />
                    {/* Chat Items */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white border-2 border-stone-100 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-4 w-24 bg-stone-200 rounded-md" />
                                <div className="h-3 w-full bg-stone-200 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Window Skeleton */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#f8fafc] relative",
                !activeConversationId ? "hidden md:flex" : "fixed inset-0 z-[100] bg-[#f8fafc] md:static md:z-auto h-[100dvh] md:h-auto"
            )}>
                {activeConversationId ? (
                    <div className="w-full h-full flex flex-col animate-pulse">
                        {/* Header */}
                        <div className="h-20 w-full bg-white border-b-2 border-stone-200 px-6 flex items-center gap-4 shrink-0">
                            <div className="w-10 h-10 rounded-full bg-stone-200" />
                            <div className="h-5 w-32 bg-stone-200 rounded-md" />
                        </div>
                        {/* Messages Area */}
                        <div className="flex-1 p-6 flex flex-col gap-6 justify-end">
                            <div className="w-3/4 h-16 bg-stone-200 rounded-2xl self-start" />
                            <div className="w-1/2 h-16 bg-stone-200 rounded-2xl self-start" />
                            <div className="w-2/3 h-20 bg-sky-100 rounded-2xl self-end" />
                        </div>
                        {/* Input */}
                        <div className="h-24 w-full bg-white border-t-2 border-stone-200 p-4 shrink-0">
                            <div className="w-full h-full bg-stone-100 rounded-2xl" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-stone-200 gap-6 p-12 animate-pulse">
                        <div className="w-72 h-72 rounded-full bg-stone-100 mb-4" />
                        <div className="h-8 w-64 bg-stone-100 rounded-xl" />
                        <div className="h-4 w-48 bg-stone-100 rounded-md" />
                    </div>
                )}
            </div>
        </>
    );
};
