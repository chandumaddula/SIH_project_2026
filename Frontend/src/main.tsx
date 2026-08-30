import React from 'react'
import { createRoot } from 'react-dom/client'
import { UserStoreProvider } from './store'
import App from './App'
import './styles/globals.css'
import './styles/citizen.css'

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <UserStoreProvider>
      <App />
    </UserStoreProvider>
  </React.StrictMode>
)