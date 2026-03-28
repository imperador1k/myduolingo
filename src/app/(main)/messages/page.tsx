
import { getConversations, getMessagesForThread, getUserProgressById } from "@/db/queries";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { EmptyLottie } from "./empty-lottie";

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
        <div className="flex h-[max(100vh-64px,100dvh-64px)] md:h-[calc(100vh-120px)] w-full gap-0 bg-white md:border-2 border-slate-200 md:border-b-[8px] md:rounded-[32px] max-w-[1056px] overflow-hidden md:shadow-xl mx-auto md:my-6 relative">
            {/* Sidebar Container */}
            <div className={cn("w-full md:w-[360px] flex-shrink-0 md:border-r-2 border-slate-200 bg-white z-10", activeUserId ? "hidden md:flex" : "flex")}>
                <ChatSidebar conversations={conversations} />
            </div>

            {/* Window Container */}
            <div className={cn(
                "flex-1 flex flex-col bg-slate-50 relative",
                !activeUserId ? "hidden md:flex" : "fixed inset-0 z-[100] bg-slate-50 md:static md:z-auto h-[100dvh] md:h-auto"
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
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 p-6">
                        <div className="w-64 h-64 mb-4">
                            <EmptyLottie />
                        </div>
                        <p className="font-black text-2xl text-slate-700 uppercase tracking-wide">Mensagens</p>
                        <p className="text-lg font-bold text-slate-400 text-center">Seleciona uma conversa para começares a interagir.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

