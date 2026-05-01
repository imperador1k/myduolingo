use tauri::Emitter;
use tauri::Manager;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use futures_util::StreamExt;
use std::env;
use std::path::Path;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct ProgressPayload {
    percentage: u8,
    message_key: String,
}

#[tauri::command]
async fn install_app(app: tauri::AppHandle) -> Result<(), String> {
    // O link oficial de PRODUÇÃO (Aponta para o teu .exe no GitHub)
    let url = "https://github.com/imperador1k/myduolingo/releases/download/MyDuolingo_v0.1.0/MyDuolingo_0.1.0_x64-setup.exe";
    let temp_path = std::env::temp_dir().join("MyDuolingo_Setup.exe");

    app.emit("install-progress", ProgressPayload { 
        percentage: 0, 
        message_key: "extracting".to_string() 
    }).map_err(|e| e.to_string())?;

    // Faz o download real da internet
    let response = reqwest::get(url).await.map_err(|e| format!("Erro de rede ao conectar ao GitHub: {}", e))?;
    
    // Se o link falhar (ex: ficheiro não existe), dá um erro bonito e para.
    if !response.status().is_success() {
        return Err(format!("O link falhou com erro: HTTP {}. Verifica se carregaste o .exe correto no GitHub.", response.status()));
    }

    let total_size = response.content_length().unwrap_or(0);
    
    let mut file = File::create(&temp_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    // Mostra o progresso real do download
    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        if total_size > 0 {
            let percentage = (downloaded as f64 / total_size as f64 * 100.0) as u8;
            if percentage % 2 == 0 {
                app.emit("install-progress", ProgressPayload { 
                    percentage: percentage.clamp(0, 90), // Guardamos 10% para a execução
                    message_key: "extracting".to_string() 
                }).map_err(|e| e.to_string())?;
            }
        }
    }

    // CRÍTICO: Fechar o ficheiro ("largar" o ficheiro) para que o Windows permita executá-lo!
    drop(file);

    app.emit("install-progress", ProgressPayload { 
        percentage: 90, 
        message_key: "finishing".to_string() 
    }).map_err(|e| e.to_string())?;

    #[cfg(target_os = "windows")]
    {
        // Executa o .exe NSIS em modo silencioso (/S)
        let status = Command::new(temp_path)
            .arg("/S") // Flag secreta do NSIS para silent install
            .status()
            .map_err(|e| format!("Falha ao iniciar o instalador: {}", e))?;

        if !status.success() {
            return Err(format!("A instalação NSIS falhou com código: {}", status));
        }
    }

    // ─── GOLPE DE REGISTO E CÓPIA DO DESINSTALADOR ───
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        if let Ok(local_app_data) = env::var("LOCALAPPDATA") {
            let app_dir = Path::new(&local_app_data).join("MyDuolingo");
            let custom_uninstaller_path = app_dir.join("MyDuolingo_Uninstaller.exe");

            // 1. Copia este próprio executável (que está a correr agora) para a pasta da app
            if let Ok(current_exe) = env::current_exe() {
                let _ = std::fs::copy(&current_exe, &custom_uninstaller_path);
            }

            // 2. Altera a chave de registo UninstallString para apontar para o nosso desinstalador
            // O NSIS escreve o uninstall na chave local do utilizador para MyDuolingo
            let hkcu = RegKey::predef(HKEY_CURRENT_USER);
            // O caminho pode variar ligeiramente dependendo do teu nome de autor/produto no tauri.conf
            let reg_path = "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\MyDuolingo";
            
            if let Ok((key, _)) = hkcu.create_subkey(reg_path) {
                // Diz ao Windows: "Para desinstalar, corre o MyDuolingo_Uninstaller.exe"
                let uninstall_cmd = format!("\"{}\"", custom_uninstaller_path.to_string_lossy());
                let _ = key.set_value("UninstallString", &uninstall_cmd);
                // Opcional: Impedir que o Windows exiba o painel de modificar
                let _ = key.set_value("NoModify", &1u32);
                let _ = key.set_value("NoRepair", &1u32);
            }
        }
    }

    // Finalizar
    app.emit("install-progress", ProgressPayload { 
        percentage: 100, 
        message_key: "finishing".to_string() 
    }).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn launch_app(app: tauri::AppHandle) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        // Encontra a pasta onde o Tauri instalou a app (AppData/Local/MyDuolingo)
        if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
            let app_path = std::path::Path::new(&local_app_data)
                .join("MyDuolingo")
                .join("myduolingo.exe"); 
            
            // Se a app existir lá, executa-a!
            if app_path.exists() {
                let _ = Command::new(app_path).spawn();
            } else {
                return Err("Não foi possível encontrar a aplicação instalada em AppData/Local/MyDuolingo/myduolingo.exe".to_string());
            }
        }
    }
    
    // Fecha a janela do instalador após iniciar a app
    let _ = app.get_webview_window("main").map(|w| w.close());
    Ok(())
}

#[tauri::command]
fn get_execution_mode() -> Result<String, String> {
    if let Ok(exe_path) = env::current_exe() {
        if let Some(file_name) = exe_path.file_name() {
            let name = file_name.to_string_lossy().to_lowercase();
            // Se o nome do ficheiro contiver "uninstall", arrancamos em modo desinstalador
            if name.contains("uninstall") {
                return Ok("uninstall".to_string());
            }
        }
    }
    // Por defeito, é instalador
    Ok("install".to_string())
}

#[tauri::command]
fn uninstall_app(app: tauri::AppHandle, feedback: String) -> Result<(), String> {
    println!("Feedback recolhido: {}", feedback); // Podes depois enviar isto para a tua base de dados/API!

    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        if let Ok(local_app_data) = env::var("LOCALAPPDATA") {
            let app_dir = Path::new(&local_app_data).join("MyDuolingo");
            
            // 1. Apagar chave de Registo (para sair da lista de programas do Windows)
            let hkcu = RegKey::predef(HKEY_CURRENT_USER);
            let reg_path = "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\MyDuolingo";
            let _ = hkcu.delete_subkey_all(reg_path);

            // 2. Apagar atalho do Ambiente de Trabalho
            if let Ok(desktop) = env::var("USERPROFILE") {
                let shortcut_path = Path::new(&desktop).join("Desktop").join("MyDuolingo.lnk");
                let _ = std::fs::remove_file(shortcut_path);
            }

            // 3. AUTO-DESTRUIÇÃO KAMIKAZE (Via script .bat temporário para máxima segurança)
            // Se a app principal ainda estiver aberta, não conseguimos apagar a pasta.
            // Por isso, o script .bat vai primeiro matar a app, esperar que nos fechemos, apagar a pasta, e apagar-se a si mesmo.
            let dir_to_delete = app_dir.to_string_lossy().to_string();
            let temp_bat = std::env::temp_dir().join("myduolingo_uninstaller_kamikaze.bat");
            let bat_content = format!(
                "@echo off\r\n\
                taskkill /F /IM myduolingo.exe /T > nul 2>&1\r\n\
                ping 127.0.0.1 -n 4 > nul\r\n\
                rmdir /s /q \"{}\"\r\n\
                del \"%~f0\"",
                dir_to_delete
            );
            
            if let Ok(_) = std::fs::write(&temp_bat, bat_content) {
                let _ = Command::new("cmd.exe")
                    .args(["/C", temp_bat.to_str().unwrap_or("")])
                    .spawn();
            }
        }
    }
    
    // Fechamos-nos imediatamente para que o cmd.exe consiga apagar a pasta daqui a 3 segundos
    std::process::exit(0);
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    let _ = window.close();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            install_app, 
            launch_app,
            minimize_window,
            close_window,
            get_execution_mode,
            uninstall_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
