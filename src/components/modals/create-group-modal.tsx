"use client";

import { useState, useEffect } from "react";
import { X, Users, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createConversation, getFriendsAction } from "@/actions/messages";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";

export const CreateGroupModal = ({ isOpen, onClose }: Props) => {
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchFriends = async () => {
                setIsLoadingFriends(true);
                try {
                    const data = await getFriendsAction();
                    setFriends(data.map((f: any) => f.following).filter(Boolean));
                } catch (error) {
                    console.error("Error fetching friends:", error);
                } finally {
                    setIsLoadingFriends(false);
                }
            };
            fetchFriends();
        }
    }, [isOpen]);

    const toggleFriend = (id: string) => {
        setSelectedFriends((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const onCreate = async () => {
        if (!groupName || selectedFriends.length === 0) return;

        setIsSubmitting(true);
        try {
            const conversationId = await createConversation(selectedFriends, true, groupName);
            
            toast.success("Grupo Criado!", {
                description: `O grupo "${groupName}" está pronto para as mensagens.`,
                icon: <div className="bg-green-100 p-1.5 rounded-full"><Users className="w-4 h-4 text-green-600" /></div>
            });

            setGroupName("");
            setSelectedFriends([]);
            onClose();
            router.push(`/messages?conversationId=${conversationId}`);
        } catch (error) {
            toast.error("Erro ao criar grupo", {
                description: "Tenta novamente em instantes."
            });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="z-[9999] max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
                <div className="relative bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 md:p-8">
                    {/* Custom Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-xl bg-white border-2 border-stone-200 border-b-4 hover:bg-stone-50 active:translate-y-1 active:border-b-0 transition-all z-50 group"
                    >
                        <X className="w-5 h-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-3 rounded-2xl">
                            <Users className="w-6 h-6 text-[#1CB0F6]" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-stone-800 tracking-tight">
                                Criar Novo Grupo
                            </DialogTitle>
                        </DialogHeader>
                    </div>

                    {/* Group Name Input */}
                    <div className="space-y-2 mb-6">
                        <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                            Nome do Grupo
                        </label>
                        <input
                            disabled={isSubmitting}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="ex: Clube do Café ☕"
                            className="w-full bg-stone-50 border-2 border-stone-200 border-b-4 rounded-2xl p-4 font-bold text-stone-700 outline-none focus:border-[#58CC02] focus:bg-green-50/50 transition-all placeholder:text-stone-300 disabled:opacity-50"
                        />
                    </div>

                    {/* Friend Selection */}
                    <div className="space-y-3 mb-8">
                        <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                            Adicionar Amigos ({selectedFriends.length})
                        </label>
                        <div className="max-h-48 overflow-y-auto pr-2 flex flex-col gap-2 scrollbar-hide">
                            {isLoadingFriends ? (
                                <div className="flex justify-center py-8 text-stone-300">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : friends.length === 0 ? (
                                <div className="text-center py-8 text-stone-400 font-bold text-sm">
                                    Segue alguns amigos para os adicionares a grupos.
                                </div>
                            ) : friends.map((friend) => {
                                const isSelected = selectedFriends.includes(friend.userId);
                                return (
                                    <div
                                        key={friend.userId}
                                        onClick={() => !isSubmitting && toggleFriend(friend.userId)}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-2xl border-2 border-stone-100 cursor-pointer transition-all hover:border-stone-300 hover:bg-stone-50 group",
                                            isSelected && "border-[#1CB0F6] bg-blue-50/50 hover:border-[#1CB0F6] hover:bg-blue-50",
                                            isSubmitting && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-stone-100 shadow-sm">
                                                {friend.userImageSrc ? (
                                                    <img src={friend.userImageSrc} alt={friend.userName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center font-black text-stone-400">
                                                        {friend.userName[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-bold text-stone-700">{friend.userName}</span>
                                        </div>
                                        <div className={cn(
                                            "h-6 w-6 rounded-full border-2 border-stone-200 flex items-center justify-center transition-all",
                                            isSelected ? "bg-[#1CB0F6] border-[#1CB0F6]" : "bg-white"
                                        )}>
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={onCreate}
                        disabled={!groupName || selectedFriends.length === 0 || isSubmitting}
                        className="w-full bg-[#58CC02] hover:bg-[#46a302] text-white border-b-6 border-[#46a302] active:border-b-0 py-7 rounded-2xl text-lg font-black tracking-widest uppercase transition-all shadow-xl disabled:bg-stone-200 disabled:border-stone-300 disabled:text-stone-400"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "CRIAR GRUPO"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
