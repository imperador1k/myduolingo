
import { getConversations, getMessagesForThread, getUserProgressById } from "@/db/queries";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
    searchParams: {
        userId?: string;
    };
};

export default async function MessagesPage({ searchParams }: Props) {
    const { userId } = await auth();
    if (!userId) redirect("/");

    const conversations = await getConversations();
    const activeUserId = searchParams.userId;

    let activePartner = null;
    let initialMessages: any[] = [];

    if (activeUserId) {
        activePartner = await getUserProgressById(activeUserId);
        if (activePartner) {
            initialMessages = await getMessagesForThread(activeUserId);
        }
    }

    return (
        <div className="flex h-[calc(100vh-120px)] w-full gap-0 bg-white border-2 border-slate-200 border-b-[8px] rounded-[32px] max-w-[1056px] overflow-hidden shadow-xl mx-auto my-6">
            {/* Sidebar Container */}
            <div className={cn("w-full md:w-[360px] flex-shrink-0 border-r-2 border-slate-200 bg-white z-10", activeUserId ? "hidden md:flex" : "flex")}>
                <ChatSidebar conversations={conversations} />
            </div>

            {/* Window Container */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50 relative",
                !activeUserId ? "hidden md:flex" : "fixed inset-0 z-[100] bg-slate-50 h-[100dvh] md:static md:h-auto md:z-auto"
            )}>
                {activeUserId && activePartner ? (
                    <ChatWindow
                        userId={userId}
                        partner={{
                            userId: activePartner.userId,
                            userName: activePartner.userName,
                            userImageSrc: activePartner.userImageSrc
                        }}
                        initialMessages={initialMessages}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                        <div className="text-8xl mb-4 drop-shadow-sm">💬</div>
                        <p className="font-black text-2xl text-slate-700 uppercase tracking-wide">Mensagens</p>
                        <p className="text-lg font-bold text-slate-400">Seleciona uma conversa para começares a interagir.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

