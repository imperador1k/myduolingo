use tauri::{AppHandle, Emitter};
use std::fs::File;
use std::io::Write;
use std::process::Command;
use reqwest::Client;
use futures_util::StreamExt;
use serde_json::Value;

#[derive(Clone, serde::Serialize)]
struct ProgressPayload {
    progress: u64,
}

#[tauri::command]
async fn download_and_install_faro(app: AppHandle) -> Result<(), String> {
    let client = Client::builder()
        .user_agent("Faro-Installer")
        .build()
        .map_err(|e| e.to_string())?;

    let mut download_url = String::new();
    
    // Attempt to fetch the latest release from GitHub API
    let api_url = "https://api.github.com/repos/imperador1k/myduolingo/releases/latest";
    if let Ok(res) = client.get(api_url).send().await {
        if res.status().is_success() {
            if let Ok(release_info) = res.json::<Value>().await {
                if let Some(assets) = release_info["assets"].as_array() {
                    for asset in assets {
                        if let Some(name) = asset["name"].as_str() {
                            if name.ends_with("-setup.exe") {
                                if let Some(url) = asset["browser_download_url"].as_str() {
                                    download_url = url.to_string();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if download_url.is_empty() {
        // Fallback to a hardcoded URL if the GitHub API parsing fails or it's a pre-release
        download_url = "https://github.com/imperador1k/myduolingo/releases/download/MyDuolingo_v0.1.0/MyDuolingo_0.1.0_x64-setup.exe".to_string();
    }

    let temp_dir = std::env::temp_dir();
    let installer_path = temp_dir.join("faro_installer_temp.exe");

    let res = client.get(&download_url).send().await.map_err(|e| e.to_string())?;
    
    let total_size = res.content_length().unwrap_or(50_000_000); // fallback size
    let mut downloaded: u64 = 0;
    
    let mut file = File::create(&installer_path).map_err(|e| e.to_string())?;
    let mut stream = res.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        
        downloaded += chunk.len() as u64;
        
        // Calculate progress 0-100
        let progress = (downloaded as f64 / total_size as f64 * 100.0) as u64;
        // Cap progress at 99 during download, 100 means done
        let display_progress = std::cmp::min(progress, 99);
        
        app.emit("download-progress", ProgressPayload { progress: display_progress }).unwrap();
    }
    
    // CRITICAL: Close the file handle on Windows before trying to execute it!
    drop(file);
    
    // Execute silently AND WAIT for it to finish
    let status = Command::new(&installer_path)
        .arg("/S")
        .status()
        .map_err(|e| e.to_string())?;
        
    if !status.success() {
        return Err(format!("Installer failed with code: {:?}", status.code()));
    }

    Ok(())
}

#[tauri::command]
async fn launch_faro() -> Result<(), String> {
    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    let program_files = std::env::var("PROGRAMFILES").unwrap_or_default();
    
    let paths = vec![
        format!("{}\\myduolingo\\myduolingo.exe", local_app_data),
        format!("{}\\myduolingo\\MyDuolingo.exe", local_app_data),
        format!("{}\\myduolingo\\myduolingo.exe", program_files),
        format!("{}\\MyDuolingo\\MyDuolingo.exe", program_files),
    ];

    for path in paths {
        if std::path::Path::new(&path).exists() {
            Command::new(path).spawn().map_err(|e| e.to_string())?;
            return Ok(());
        }
    }
    
    Err("Não foi possível localizar o executável após a instalação.".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![download_and_install_faro, launch_faro])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
