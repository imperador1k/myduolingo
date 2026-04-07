"use server";

import { z } from "zod";
import { Resend } from "resend";
import { currentUser } from "@clerk/nextjs/server";

const supportSchema = z.object({
    subject: z.string().min(3, "O assunto tem de ter pelo menos 3 caracteres."),
    message: z.string().min(10, "A mensagem tem de ter pelo menos 10 caracteres."),
});

// Avoid initializing resend if env var is missing during build time
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function submitSupportTicket(prevState: any, formData: FormData) {
    const rawData = {
        subject: formData.get("subject") as string,
        message: formData.get("message") as string,
    };

    const validatedFields = supportSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Por favor, verifica os campos do formulário.",
        };
    }

    const { subject, message } = validatedFields.data;

    // Fetch authenticated user
    const user = await currentUser();
    if (!user) {
        return {
            message: "Precisas de ter sessão iniciada para enviar pedidos de suporte.",
            errors: { message: ["Acesso não autorizado"] }
        };
    }

    const userEmail = user.emailAddresses[0]?.emailAddress || "sem_email@user.com";
    const userName = user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Utilizador";

    if (!resend) {
        return {
            message: "A API do Resend não está configurada corretamente no servidor.",
            errors: { message: ["Erro de configuração no servidor"] }
        };
    }

    const targetEmail = process.env.SUPPORT_EMAIL;

    if (!targetEmail) {
        return {
            message: "O email de suporte destino não está listado nas configurações do sistema.",
            errors: { message: ["Erro de configuração no servidor"] }
        };
    }

    try {
        const adminEmailHtml = `
            <div style="background-color: #fbf9f8; padding: 40px 20px; font-family: sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #e5e7eb; border-bottom: 6px solid #e5e7eb; border-radius: 24px; padding: 30px;">
                    <h2 style="color: #ea2b2b; margin-top: 0; font-weight: bold; font-size: 22px;">🚨 Novo Reporte de Bug</h2>
                    
                    <div style="background-color: #f4f4f5; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #374151;"><strong>De:</strong> ${userName}</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${userEmail}</p>
                        <p style="margin: 5px 0; color: #374151;"><strong>Assunto:</strong> ${subject}</p>
                    </div>
                    
                    <div style="background-color: #ffffff; border-left: 4px solid #1CB0F6; padding: 15px; font-size: 16px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</div>
                </div>
            </div>
        `;

        const userReceiptHtml = `
            <div style="background-color: #fbf9f8; padding: 40px 20px; font-family: sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #e5e7eb; border-bottom: 6px solid #e5e7eb; border-radius: 24px; padding: 30px; text-align: center;">
                    <img src="https://via.placeholder.com/100" alt="Marco Mascot" style="width: 100px; margin-bottom: 20px; border-radius: 12px;" />
                    
                    <h2 style="color: #58CC02; margin-top: 0; font-weight: bold; font-size: 24px;">Mensagem Recebida!</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Olá <strong>${userName}</strong>! O Marco e a nossa equipa de engenharia já receberam o teu reporte sobre "<em>${subject}</em>". Vamos analisar isto com a máxima urgência. Obrigado por nos ajudares a melhorar!
                    </p>
                    
                    <a href="https://miguelweb.dev" style="display: inline-block; background-color: #1CB0F6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 16px; border-bottom: 6px solid #0092d6; font-weight: bold; font-family: sans-serif; font-size: 16px; margin-top: 20px; text-transform: uppercase;">VOLTAR À APP</a>
                </div>
            </div>
        `;

        // Send internal notification to Admin
        await resend.emails.send({
            from: "Equipa MyDuolingo <suporte@miguelweb.dev>",
            to: targetEmail,
            subject: `[Bug Report] ${subject}`,
            replyTo: userEmail,
            html: adminEmailHtml,
        });

        // Send auto-reply to the User
        await resend.emails.send({
            from: "Equipa MyDuolingo <suporte@miguelweb.dev>",
            to: userEmail,
            subject: "Recebemos a tua mensagem! 🚀",
            html: userReceiptHtml,
        });

        return {
            success: true,
            message: "O teu bilhete voou até nós! Obrigado pelo feedback. 🕊️",
        };
    } catch (error) {
        console.error("Resend Error:", error);
        return {
            message: "Ocorreu um erro interno ao enviar o email. Tenta novamente mais tarde.",
            errors: { message: ["Falha no envio de email"] }
        };
    }
}
