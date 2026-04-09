import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

async function bootstrap() {
  try {
    const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
    await getCurrentWebviewWindow().setBackgroundColor([0, 0, 0, 0])
  } catch {
    /* dev server in a normal browser */
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
