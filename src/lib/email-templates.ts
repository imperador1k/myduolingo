const COLORS = { 
    primary: '#1CB0F6', 
    primaryDark: '#1899D6', 
    green: '#58CC02', 
    greenDark: '#46a302', 
    bg: '#f5f5f4', 
    card: '#ffffff', 
    text: '#333333', 
    textMuted: '#888888',
    amber: '#FFC800',
    red: '#ea2b2b'
};

export function getEmailLayout(content: string, preheader: string = "Notificação da MyDuolingo", headerColor: string = COLORS.card, headerTitle: string = "MyDuolingo") {
    return `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headerTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.bg}; font-family: 'Arial', sans-serif; -webkit-font-smoothing: antialiased;">
    <!-- Preheader (Hidden but visible in inbox previews) -->
    <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 0; mso-hide: all;">
        ${preheader}
    </div>

    <!-- Main Background Canvas -->
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.bg}; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- The Bento Card -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.card}; border: 2px solid #e5e7eb; border-bottom: 6px solid #e5e7eb; border-radius: 24px; overflow: hidden; border-collapse: separate;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: ${headerColor}; padding: 40px 30px 20px; border-bottom: 2px solid #f0f0f0; text-align: center;">
                            <img src="https://myduolingo.vercel.app/mascot.svg" alt="MyDuolingo Mascot" width="60" style="display: inline-block; margin-bottom: 15px;" />
                            <h1 style="margin: 0; color: ${COLORS.green}; font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
                                ${headerTitle}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content Area -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #ffffff; color: ${COLORS.text}; font-size: 16px; line-height: 1.6; text-align: left;">
                            ${content}
                        </td>
                    </tr>

                </table>

                <!-- Corporate Footer -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
                    <tr>
                        <td align="center" style="margin-top: 30px; text-align: center; color: ${COLORS.textMuted}; font-size: 12px; line-height: 1.6; font-family: sans-serif; padding: 30px 20px 0;">
                            
                            <!-- Social Links -->
                            <div style="margin-bottom: 20px;">
                                <a href="https://www.linkedin.com/in/miguel-santos-159900282/" target="_blank" style="margin: 0 10px; color: ${COLORS.textMuted}; text-decoration: none; font-weight: bold;">💼 LinkedIn</a>
                                <span style="color: #cccccc;">|</span>
                                <a href="https://instagram.com/miguelsantos.pr" target="_blank" style="margin: 0 10px; color: ${COLORS.textMuted}; text-decoration: none; font-weight: bold;">📸 Instagram</a>
                            </div>

                            <!-- Reason for receiving -->
                            <p style="margin: 0 0 15px; color: #aaaaaa;">
                                Recebeste este email porque interagiste com os serviços do MyDuolingo.
                            </p>

                            <!-- Company Info -->
                            <p style="margin: 0 0 15px;">
                                &copy; ${new Date().getFullYear()} MyDuolingo by Miguel Santos. Todos os direitos reservados.<br>
                                Avenida da Liberdade, 123, Lisboa, Portugal
                            </p>

                            <!-- Unsubscribe / Legal -->
                            <p style="margin: 0;">
                                <a href="https://myduolingo.vercel.app/privacy" style="color: ${COLORS.primary}; text-decoration: none; font-weight: bold;">Política de Privacidade</a> 
                                &nbsp;&nbsp;|&nbsp;&nbsp; 
                                <a href="https://myduolingo.vercel.app/terms" style="color: ${COLORS.primary}; text-decoration: none; font-weight: bold;">Termos de Serviço</a>
                            </p>

                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

export function getButtonHtml(url: string, text: string, color: string = COLORS.primary, darkColor: string = COLORS.primaryDark) {
    return `
    <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
        <a href="${url}" target="_blank" style="display: inline-block; background-color: ${color}; color: #ffffff !important; font-weight: bold; font-size: 15px; text-decoration: none; padding: 15px 30px; border-radius: 14px; border-bottom: 4px solid ${darkColor}; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">
            ${text}
        </a>
    </div>
    `;
}

// ----------------------------------------------------
// Specific Email Templates
// ----------------------------------------------------

export function getSupportReplyEmail(userName: string, replyText: string, ticketSubject: string) {
    const content = `
        <h2 style="color: ${COLORS.text}; margin-top: 0; font-weight: 900; font-size: 22px;">Olá, ${userName}! 👋</h2>
        
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6; margin-bottom: 20px; white-space: pre-wrap;">${replyText}</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: ${COLORS.textMuted}; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Contexto Original do Ticket:</p>
            <p style="margin: 8px 0 0 0; color: ${COLORS.text}; font-weight: bold;">${ticketSubject}</p>
        </div>

        ${getButtonHtml("https://myduolingo.vercel.app/support", "Ver Resposta Completa", COLORS.primary, COLORS.primaryDark)}
    `;

    return getEmailLayout(content, "Temos novidades sobre o teu ticket de suporte!", COLORS.card, "Apoio ao Cliente");
}

export function getWelcomeEmail(userName: string) {
    const content = `
        <h2 style="color: ${COLORS.text}; margin-top: 0; font-weight: 900; font-size: 26px; text-align: center;">Bem-vindo à jornada! 🚀</h2>
        
        <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
            Olá <strong>${userName}</strong>! Estamos super entusiasmados por te receber na MyDuolingo. Prepara-te para aprender idiomas de uma forma gamificada, divertida e viciante!
        </p>

        ${getButtonHtml("https://miguelweb.dev", "Começar a Aprender", COLORS.green, COLORS.greenDark)}
    `;

    return getEmailLayout(content, "Bem-vindo à MyDuolingo! Começa a tua jornada de aprendizagem.", COLORS.card, "MyDuolingo");
}

export function getAdminNotificationEmail(userName: string, userEmail: string, subject: string, message: string) {
    const content = `
        <h2 style="color: ${COLORS.text}; margin-top: 0; font-weight: 900; font-size: 22px;">🚨 Novo Reporte Submetido</h2>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 30px 0;">
            <p style="margin: 5px 0; color: ${COLORS.text}; font-size: 15px;"><strong>De:</strong> ${userName}</p>
            <p style="margin: 5px 0; color: ${COLORS.text}; font-size: 15px;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0; color: ${COLORS.text}; font-size: 15px;"><strong>Assunto:</strong> ${subject}</p>
        </div>
        
        <div style="background-color: #ffffff; border-left: 6px solid ${COLORS.amber}; padding: 20px; border-radius: 0 16px 16px 0; font-size: 16px; line-height: 1.6; color: ${COLORS.text}; white-space: pre-wrap; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border-top: 2px solid #e5e7eb; border-right: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb;">${message}</div>

        ${getButtonHtml("https://myduolingo.vercel.app/admin/inbox", "Abrir na Inbox Admin", COLORS.red, "#cc0000")}
    `;

    return getEmailLayout(content, "Um novo ticket aguarda a tua atenção na Inbox.", COLORS.card, "Admin Alerts");
}

export function getUserReceiptEmail(userName: string, subject: string) {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 60px; margin-bottom: 20px;">📨</div>
            <h2 style="color: ${COLORS.green}; margin-top: 0; font-weight: 900; font-size: 24px;">Recebemos a tua mensagem!</h2>
            
            <p style="color: ${COLORS.text}; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Olá <strong>${userName}</strong>! Apenas para confirmar que o teu reporte sobre "<em>${subject}</em>" chegou são e salvo.
                A nossa equipa de ninjas já está a investigar o caso.
            </p>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px 20px; border-radius: 12px; font-size: 13px; font-weight: bold; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">
                Tempo previsto de análise: 24h a 48h
            </div>
        </div>
    `;

    return getEmailLayout(content, "O teu pedido de suporte foi recebido com sucesso.", COLORS.card, "Suporte MyDuolingo");
}
