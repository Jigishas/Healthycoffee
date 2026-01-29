import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import './serviceWorker.js'
import { startPinging } from './pingBackend.js'


const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#d97706', // amber-600
    },
    secondary: {
      main: '#059669', // emerald-600
    },
  },
})

// Start backend pinger immediately on app load
startPinging();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
