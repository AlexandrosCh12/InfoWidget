//! Tauri application entry: registers native plugins, configures the main window (transparent WebView2),
//! builds the system tray, and exposes a `minimize_to_tray` command the frontend calls to hide the window.

use std::sync::Mutex;

use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
  AppHandle, Manager, Runtime,
};

/// Holds the tray icon handle so we can show/hide it when minimizing to tray vs restoring the window.
struct TrayState {
  tray: Mutex<Option<tauri::tray::TrayIcon>>,
}

/// Brings the main webview to front and hides the tray icon again (tray is only visible while minimized).
fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
  if let Some(window) = app.get_webview_window("main") {
    let _ = window.show();
    let _ = window.set_focus();
  }
  if let Some(state) = app.try_state::<TrayState>() {
    if let Ok(guard) = state.tray.lock() {
      if let Some(tray) = guard.as_ref() {
        let _ = tray.set_visible(false);
      }
    }
  }
}

/// Invoked from the UI: shows the tray icon, hides the main window (widget stays running in background).
#[tauri::command]
fn minimize_to_tray(app: AppHandle) -> Result<(), String> {
  let state = app.state::<TrayState>();
  if let Ok(guard) = state.tray.lock() {
    if let Some(tray) = guard.as_ref() {
      let _ = tray.set_visible(true);
    }
  }
  let window = app
    .get_webview_window("main")
    .ok_or_else(|| "main window not found".to_string())?;
  window.hide().map_err(|e| e.to_string())?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    // opener: shell open URLs; http: allow frontend to use `@tauri-apps/plugin-http` for API calls.
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_http::init())
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();
      // WebView2: only alpha 0 is treated as transparent; anything else becomes opaque and
      // shows as dark rectangles behind rounded CSS corners. Force both window + webview clear.
      let _ = window.set_background_color(Some(tauri::utils::config::Color(0, 0, 0, 0)));

      // Dev-only: structured logging to the console for debugging the native shell.
      #[cfg(debug_assertions)]
      {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Tray uses the same image as the window icon; context menu: Open / Quit; left click restores the app.
      let icon = app
        .default_window_icon()
        .cloned()
        .expect("default window icon must be present for tray");

      let open = MenuItem::with_id(app, "open", "Open InfoWidget", true, None::<&str>)?;
      let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&open, &quit])?;

      let tray = TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("InfoWidget")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| {
          match event.id.as_ref() {
            "open" => show_main_window(app),
            "quit" => app.exit(0),
            _ => {}
          }
        })
        .on_tray_icon_event(|tray, event| {
          let app = tray.app_handle();
          match event {
            TrayIconEvent::Click {
              button,
              button_state,
              ..
            } => {
              if button == MouseButton::Left && button_state == MouseButtonState::Up {
                show_main_window(app);
              }
            }
            TrayIconEvent::DoubleClick { button, .. } => {
              if button == MouseButton::Left {
                show_main_window(app);
              }
            }
            _ => {}
          }
        })
        .build(app)?;

      tray.set_visible(false)?;

      app.manage(TrayState {
        tray: Mutex::new(Some(tray)),
      });

      let _ = window;
      Ok(())
    })
    // Registers Rust commands callable from the frontend via `@tauri-apps/api` invoke.
    .invoke_handler(tauri::generate_handler![minimize_to_tray])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
