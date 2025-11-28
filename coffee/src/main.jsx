import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import './serviceWorker.js'


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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
