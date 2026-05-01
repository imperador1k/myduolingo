use tauri::Emitter;
use tauri::Manager;
use std::fs::File;
use std::io::Write;
use std::process::Command;
use futures_util::StreamExt;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct ProgressPayload {
    percentage: u8,
    message_key: String,
}

#[tauri::command]
async fn install_app(app: tauri::AppHandle) -> Result<(), String> {
    // URL de exemplo (substituir pela URL oficial do MyDuolingo Setup)
    let url = "https://github.com/miguelsantos/myduolingo/releases/latest/download/MyDuolingo_Setup.exe";
    let temp_path = std::env::temp_dir().join("MyDuolingo_Setup.exe");

    // 1. Iniciar Download
    app.emit("install-progress", ProgressPayload { 
        percentage: 0, 
        message_key: "extracting".to_string() 
    }).map_err(|e| e.to_string())?;

    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let total_size = response.content_length().unwrap_or(0);
    
    let mut file = File::create(&temp_path).map_err(|e| e.to_string())?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        
        downloaded += chunk.len() as u64;
        
        if total_size > 0 {
            let percentage = (downloaded as f64 / total_size as f64 * 100.0) as u8;
            // Só enviamos progresso se houver mudança para não sobrecarregar a UI
            if percentage % 2 == 0 {
                app.emit("install-progress", ProgressPayload { 
                    percentage: percentage.clamp(0, 95), // Deixamos 5% para a execução
                    message_key: "extracting".to_string() 
                }).map_err(|e| e.to_string())?;
            }
        }
    }

    // 2. Executar o Instalador
    app.emit("install-progress", ProgressPayload { 
        percentage: 95, 
        message_key: "finishing".to_string() 
    }).map_err(|e| e.to_string())?;

    // Executa silenciosamente no Windows (/S é o padrão NSIS)
    #[cfg(target_os = "windows")]
    {
        Command::new(temp_path)
            .arg("/S") // Flag para instalação silenciosa
            .spawn()
            .map_err(|e| e.to_string())?;
    }

    // Finalizar
    app.emit("install-progress", ProgressPayload { 
        percentage: 100, 
        message_key: "finishing".to_string() 
    }).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn launch_app(app: tauri::AppHandle) {
    // Tenta abrir a app instalada ou apenas fecha o instalador
    let _ = app.get_webview_window("main").map(|w| w.close());
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
            close_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
