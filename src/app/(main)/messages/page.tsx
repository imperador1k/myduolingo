
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

export default async function MessagesPage({ searchParams }: Props) {
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
        <div className="flex h-[max(100vh-64px,100dvh-64px)] md:h-[calc(100vh-100px)] w-full gap-0 bg-white md:border-2 border-stone-200 md:border-b-[10px] md:rounded-[2.5rem] max-w-[1056px] overflow-hidden md:shadow-2xl mx-auto md:my-6 relative">
            {/* Sidebar Container */}
            <div className={cn("w-full md:w-[380px] flex-shrink-0 md:border-r-2 border-stone-100 bg-stone-50/50 z-10", activeConversationId ? "hidden md:flex" : "flex")}>
                <ChatSidebar conversations={conversationsList} />
            </div>

            {/* Window Container */}
            <div className={cn(
                "flex-1 flex flex-col bg-[#f8fafc] relative",
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
        </div>
    );
}

