"use client";

import { useState, useRef, useEffect } from "react";
import { Check, Inbox, Star, UserCircle, Rocket, Loader2 } from "lucide-react";
import Image from "next/image";
import { resolveSupportTicket, dismissUserReview, replyToTicket, getInboxItems, reopenSupportTicket, reopenUserReview, type InboxItem } from "@/actions/admin-inbox";
import { toast } from "sonner";

const CANNED_RESPONSES = [
    { command: '/bug_fix', text: "Olá! A nossa equipa de engenheiros (e o Marco 🦉) já esmagaram esse bug. Obrigado por reportares! Como agradecimento, adicionámos algumas gemas à tua conta. Continua a aprender!" },
    { command: '/review_thanks', text: "Uau, muito obrigado pelas 5 estrelas! 🌟 É feedback como este que nos dá energia para continuar a construir a melhor app de aprendizagem do mundo. Se tiveres sugestões, não hesites!" },
    { command: '/more_info', text: "Olá! Recebemos o teu ticket, mas precisamos de um pouco mais de contexto. Podes explicar-nos exatamente que passos deste antes do erro acontecer? Obrigado!" },
];

interface Props {
    initialItems: InboxItem[];
}

export function InboxClient({ initialItems }: Props) {
    const [viewMode, setViewMode] = useState<"active" | "archived">("active");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [items, setItems] = useState<InboxItem[]>(initialItems);
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);
    
    // Reply State
    const [replyText, setReplyText] = useState("");
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const selectedTicket = items.find(t => t.id === selectedId);
    const unreadCount = items.filter(t => t.isUnread).length;

    // Fetch data when switching tabs
    useEffect(() => {
        const fetchItems = async () => {
            setIsGlobalLoading(true);
            try {
                const newItems = await getInboxItems(viewMode === "archived");
                setItems(newItems);
                setSelectedId(null);
            } catch (error) {
                toast.error("Erro ao carregar itens.");
            } finally {
                setIsGlobalLoading(false);
            }
        };

        fetchItems();
    }, [viewMode]);

    const handleSelect = (id: string) => {
        if (id !== selectedId) {
            setReplyText("");
            setShowSlashMenu(false);
            setSelectedId(id);
        }
    };

    const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setReplyText(text);

        const lastWord = text.split(/\s+/).pop();
        if (lastWord && lastWord.startsWith('/')) {
            setShowSlashMenu(true);
        } else {
            setShowSlashMenu(false);
        }
    };

    const applyTemplate = (templateText: string) => {
        const textParts = replyText.split(/\s+/);
        textParts.pop(); // Remove the slash command
        const newText = textParts.join(" ") + (textParts.length > 0 ? " " : "") + templateText;
        setReplyText(newText);
        setShowSlashMenu(false);
        textareaRef.current?.focus();
    };

    const handleSendReply = async () => {
        if (!selectedTicket || !selectedTicket.userEmail) {
            toast.error("Este ticket não tem um email válido associado para resposta.");
            return;
        }

        if (!replyText.trim()) {
            toast.error("A resposta não pode estar vazia.");
            return;
        }
        
        setIsReplying(true);
        const previousItems = [...items];
        const ticketId = selectedTicket.realId;
        
        // Optimistic UI
        setItems(items.filter(t => t.id !== selectedTicket.id));
        setSelectedId(null);
        setReplyText("");

        try {
            const response = await replyToTicket(ticketId, selectedTicket.userEmail, selectedTicket.subject, replyText, selectedTicket.userName);
            if (response.success) {
                toast.success("🚀 Resposta enviada com sucesso!");
            } else {
                throw new Error(response.error);
            }
        } catch (error: any) {
            setItems(previousItems);
            toast.error(error.message || "Falha ao enviar resposta.");
        } finally {
            setIsReplying(false);
        }
    };

    const handleResolve = async () => {
        if (!selectedTicket) return;
        
        const previousItems = [...items];
        setItems(items.filter(t => t.id !== selectedTicket.id));
        setSelectedId(null);
        
        try {
            if (selectedTicket.type === "ticket") {
                await resolveSupportTicket(selectedTicket.realId);
                toast.success("Ticket resolvido com sucesso.");
            } else {
                await dismissUserReview(selectedTicket.realId);
                toast.success("Avaliação marcada como lida.");
            }
        } catch (error) {
            setItems(previousItems);
            toast.error("Falha ao concluir ação.");
        }
    };

    const handleIgnore = () => {
        if (!selectedTicket) return;
        handleResolve(); 
    }

    const handleReopen = async () => {
        if (!selectedTicket) return;
        
        setIsReplying(true);
        const currentId = selectedTicket.id;
        const previousItems = [...items];
        
        setItems(prev => prev.filter(t => t.id !== currentId));
        setSelectedId(null);

        try {
            const res = selectedTicket.type === 'ticket' 
                ? await reopenSupportTicket(selectedTicket.realId)
                : await reopenUserReview(selectedTicket.realId);

            if (res.success) {
                toast.success("🚀 Item reaberto com sucesso!");
            } else {
                setItems(previousItems);
                toast.error("Erro ao reabrir item.");
            }
        } catch (error) {
            setItems(previousItems);
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-80px)] gap-6 p-6 font-sans">
            
            {/* Left Column (The Ticket List) */}
            <div className="w-[320px] md:w-[380px] shrink-0 bg-white border-2 border-stone-200 border-b-8 rounded-3xl flex flex-col overflow-hidden shadow-sm">
                
                {/* Header */}
                <div className="bg-stone-50 border-b-2 border-stone-200 shrink-0">
                    <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-2 rounded-xl border border-sky-200">
                                <Inbox className="h-5 w-5 text-sky-500" strokeWidth={3} />
                            </div>
                            <h2 className="text-xl font-black text-stone-800 tracking-tight">Caixa de Entrada</h2>
                        </div>
                        {unreadCount > 0 && viewMode === 'active' && (
                            <div className="bg-blue-100 text-blue-600 border-2 border-blue-200 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
                                {unreadCount} Nova{unreadCount !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex px-4 pb-0 gap-2">
                        <button 
                            onClick={() => setViewMode("active")}
                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-t-xl border-t-2 border-x-2 
                                ${viewMode === 'active' ? 'bg-white border-stone-200 text-sky-600' : 'bg-transparent border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            Ativos
                        </button>
                        <button 
                            onClick={() => setViewMode("archived")}
                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-t-xl border-t-2 border-x-2 
                                ${viewMode === 'archived' ? 'bg-white border-stone-200 text-amber-600' : 'bg-transparent border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            Arquivo (7d)
                        </button>
                    </div>
                </div>

                {/* Ticket List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {isGlobalLoading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                        </div>
                    )}
                    {items.length === 0 && !isGlobalLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-stone-400 p-8 text-center bg-stone-50/50">
                            <span className="text-5xl mb-4 grayscale opacity-50">🎉</span>
                            <p className="font-bold text-lg text-stone-500">Inbox limpa!</p>
                            <p className="text-sm font-medium mt-1">Nenhum pedido pendente. Bom trabalho.</p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const isSelected = selectedId === item.id;
                            const isReview = item.type === "review";
                            
                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className={`p-4 cursor-pointer flex flex-col gap-1.5 transition-all
                                        ${isSelected ? 'bg-sky-50 border-l-[6px] border-l-sky-400 border-b-2 border-b-sky-100 pl-3 shadow-inner' : 'border-b-2 border-b-stone-100 hover:bg-stone-50 border-l-[6px] border-l-transparent pl-3'}
                                        ${!isSelected ? (isReview ? 'bg-amber-50/30' : 'bg-blue-50/40') : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start gap-3 mb-0.5">
                                        <h3 className={`font-bold truncate leading-tight ${item.isUnread ? 'text-stone-900' : 'text-stone-600'}`}>
                                            {item.subject}
                                        </h3>
                                        {!isSelected && (
                                            isReview ? (
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0 mt-1" />
                                            ) : (
                                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0 mt-1 shadow-sm shadow-blue-200"></div>
                                            )
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center w-full">
                                        <span className={`text-xs font-bold truncate flex items-center gap-2 ${item.isUnread ? 'text-stone-600' : 'text-stone-400'}`}>
                                            <div className="w-5 h-5 rounded-full overflow-hidden bg-stone-200 border border-stone-300">
                                                {item.userImageSrc && !item.userImageSrc.endsWith('.svg') ? (
                                                    <Image src={item.userImageSrc} alt="" width={20} height={20} className="w-full h-full object-cover"/>
                                                ) : (
                                                    <UserCircle className="w-5 h-5 text-stone-400" />
                                                )}
                                            </div>
                                            {item.userName}
                                        </span>
                                        <span className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${item.isUnread ? (isReview ? 'text-amber-500' : 'text-blue-400') : 'text-stone-300'}`}>
                                            {new Date(item.createdAt || new Date()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Column (The Detail View) */}
            <div className="flex-1 bg-white border-2 border-stone-200 border-b-8 rounded-3xl p-8 flex flex-col relative shadow-sm overflow-hidden">
                {!selectedTicket ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center">
                        <div className="text-8xl mb-6 opacity-30 drop-shadow-sm filter">☕</div>
                        <h2 className="text-3xl font-black text-stone-300 tracking-tight">
                            Selecione um item
                        </h2>
                        <p className="text-stone-400 font-bold mt-3 max-w-sm">
                            Aproveita e bebe um café enquanto lês os pedidos dos utilizadores.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Header Info */}
                        <div className="shrink-0 mb-8 border-b-2 border-stone-100 pb-6">
                            <div className="flex justify-between items-start gap-4 mb-6">
                                <h2 className="text-4xl font-black text-stone-800 tracking-tight leading-tight flex items-center gap-3">
                                    {selectedTicket.type === 'review' && <Star className="w-8 h-8 text-amber-500 fill-amber-500" />}
                                    {selectedTicket.subject}
                                </h2>
                                <div className="text-xs text-stone-400 font-bold bg-stone-100 px-3 py-1.5 rounded-full border-2 border-stone-200 shrink-0 uppercase">
                                    {selectedTicket.type}: {selectedTicket.realId}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-stone-200 shrink-0 bg-stone-100 flex items-center justify-center">
                                    {selectedTicket.userImageSrc && !selectedTicket.userImageSrc.endsWith('.svg') ? (
                                        <Image src={selectedTicket.userImageSrc} alt="" width={48} height={48} className="w-full h-full object-cover"/>
                                    ) : (
                                        <UserCircle className="w-10 h-10 text-stone-400" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-stone-700 text-lg">
                                        {selectedTicket.userName}
                                    </span>
                                    {selectedTicket.userEmail && (
                                        <span className="text-sm text-stone-500 font-bold font-mono">
                                            {selectedTicket.userEmail}
                                        </span>
                                    )}
                                </div>
                                <div className="ml-auto text-xs text-stone-400 font-bold uppercase tracking-widest bg-white border-2 border-stone-200 rounded-xl px-4 py-2">
                                     {new Date(selectedTicket.createdAt || new Date()).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area (Scrollable everything) */}
                        <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">
                            
                            {/* User Message Box */}
                            <div className="bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-6 flex flex-col relative shadow-sm shrink-0">
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] mb-4 flex items-center gap-2 ${selectedTicket.type === 'review' ? 'text-amber-500' : 'text-sky-500'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedTicket.type === 'review' ? 'bg-amber-400' : 'bg-sky-400'}`}></div>
                                    {selectedTicket.type === 'review' ? 'Avaliação Recebida' : 'Mensagem do Utilizador'}
                                </span>
                                
                                <div className="text-stone-700 leading-relaxed font-semibold whitespace-pre-wrap text-lg">
                                    {selectedTicket.message}
                                </div>
                            </div>
                            
                            {/* Action Area/Reply Area */}
                            {viewMode === 'active' ? (
                                <div className="bg-white border-2 border-stone-200 border-b-6 rounded-2xl p-4 flex flex-col shrink-0 mb-4">
                                    <span className="text-xs font-black uppercase text-stone-400 tracking-widest pl-2 mb-2">
                                        Responder ao Utilizador (Dica: Usa / para Templates)
                                    </span>
                                    
                                    <textarea
                                        ref={textareaRef}
                                        value={replyText}
                                        onChange={handleReplyChange}
                                        placeholder="Escreve aqui a tua resposta..."
                                        className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-4 text-stone-700 font-medium placeholder:text-stone-400 focus:outline-none focus:border-[#1CB0F6] focus:bg-blue-50 transition-all resize-none min-h-[120px]"
                                    />
                                    
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="text-xs text-stone-400 font-bold hidden sm:block">
                                            Modo Admin ativado
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={handleIgnore}
                                                disabled={isReplying}
                                                className="bg-white text-stone-500 font-black uppercase tracking-wider py-3 px-6 rounded-2xl border-2 border-stone-200 border-b-4 hover:bg-stone-50 active:translate-y-1 active:border-b-2 transition-all disabled:opacity-50">
                                                Ignorar / Arquivar
                                            </button>
                                            
                                            {replyText.trim().length > 0 ? (
                                                <button 
                                                    onClick={handleSendReply}
                                                    disabled={isReplying}
                                                    className="bg-[#1CB0F6] text-white border-2 border-[#1899D6] border-b-6 rounded-2xl px-6 py-3 font-black uppercase tracking-wider active:translate-y-1 active:border-b-2 hover:bg-[#1fbffc] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {isReplying ? <Loader2 className="w-5 h-5 animate-spin"/> : <Rocket strokeWidth={3} className="h-5 w-5" />}
                                                    Enviar Resposta
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={handleResolve}
                                                    disabled={isReplying}
                                                    className="bg-[#58CC02] text-white font-black uppercase tracking-widest py-3 px-6 rounded-2xl border-2 border-[#46a302] border-b-6 hover:bg-[#4eb801] active:translate-y-2 active:border-b-2 transition-all flex items-center gap-2 drop-shadow-sm disabled:opacity-50"
                                                >
                                                    <Check strokeWidth={4} className="h-5 w-5" />
                                                    Resolver S/ Resposta
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6 p-10 bg-stone-50 border-2 border-stone-200 border-dashed rounded-3xl text-center mb-8 shrink-0">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-stone-500 font-bold text-lg">Este item está arquivado</p>
                                        <p className="text-stone-400 font-medium text-sm">
                                            Apenas modo de leitura disponível no arquivo.
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={handleReopen}
                                        disabled={isReplying}
                                        className="bg-white text-stone-600 font-black uppercase tracking-widest py-3 px-8 rounded-2xl border-2 border-stone-200 border-b-6 hover:bg-stone-50 active:translate-y-1 active:border-b-2 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isReplying ? <Loader2 className="w-5 h-5 animate-spin"/> : <Rocket strokeWidth={3} className="h-5 w-5 rotate-180" />}
                                        Reabrir Item
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Slash Command Popover (Absolute relative to the Detail View Right Column) */}
                        {showSlashMenu && viewMode === 'active' && (
                            <div className="absolute bottom-[220px] left-8 w-[calc(100%-64px)] sm:w-[500px] bg-white border-2 border-stone-200 border-b-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[999] overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 flex flex-col">
                                <div className="bg-stone-100 text-stone-500 font-bold text-[10px] uppercase tracking-widest px-4 py-3 border-b-2 border-stone-200">
                                    Respostas Rápidas
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {CANNED_RESPONSES.map((t, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => applyTemplate(t.text)}
                                            className="px-5 py-4 hover:bg-sky-50 border-b-2 border-stone-100 last:border-0 cursor-pointer transition-colors group"
                                        >
                                            <div className="font-black text-sky-600 mb-1 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full"></div>
                                                {t.command}
                                            </div>
                                            <div className="text-xs text-stone-500 line-clamp-2 leading-relaxed group-hover:text-stone-700 font-medium">{t.text}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
