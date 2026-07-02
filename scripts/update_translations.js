const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'messages');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.settings) {
    if (!data.settings.active_sessions) {
      data.settings.active_sessions = {
        title: "Active Devices",
        description: "Review devices currently logged into your account.",
        browser_unknown: "Unknown Browser",
        os_unknown: "Unknown OS",
        ip_unknown: "Unknown IP",
        current_device: "Current",
        last_activity: "Last activity:",
        unknown: "Unknown",
        messages: {
          success: "Session revoked successfully.",
          error: "Failed to revoke session."
        }
      };
    }
    
    if (!data.settings.sign_out) {
      data.settings.sign_out = {
        title: "Sign Out",
        description: "Are you sure you want to sign out of your account?",
        confirm: "Sign Out",
        cancel: "Cancel",
        trigger_label: "Sign Out"
      };
    }
    
    // Add specific translations for Portuguese and others as fallback
    if (file === 'pt.json') {
      data.settings.active_sessions.title = "Dispositivos Ativos";
      data.settings.active_sessions.description = "Revê os dispositivos atualmente com sessão iniciada.";
      data.settings.active_sessions.current_device = "Atual";
      data.settings.active_sessions.last_activity = "Última atividade:";
      data.settings.active_sessions.messages.success = "Sessão terminada com sucesso.";
      data.settings.active_sessions.messages.error = "Erro ao terminar sessão.";
      
      data.settings.sign_out.title = "Terminar Sessão";
      data.settings.sign_out.description = "Tens a certeza que pretendes terminar sessão na tua conta?";
      data.settings.sign_out.confirm = "Terminar Sessão";
      data.settings.sign_out.cancel = "Cancelar";
      data.settings.sign_out.trigger_label = "Terminar Sessão";
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
  }
}
