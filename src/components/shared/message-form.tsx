"use client";

import { onSendMessage } from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export const MessageForm = ({ receiverId }: { receiverId: string }) => {
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        await onSendMessage(receiverId, formData);
        formRef.current?.reset();
    };

    return (
        <form action={handleSubmit} ref={formRef} className="flex gap-2 w-full">
            <input
                name="content"
                placeholder="Diz olá..."
                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2 focus:border-sky-500 focus:outline-none"
                required
            />
            <Button variant="secondary" type="submit">Enviar</Button>
        </form>
    );
};
