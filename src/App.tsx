import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WebhooksList from './pages/WebhooksList'
import WebhookForm from './pages/WebhookForm'
import WebhookDetails from './pages/WebhookDetails'
import Settings from './pages/Settings'
import { WebhookProvider } from './contexts/WebhookContext'
import { KontentProvider } from './contexts/KontentContext'

function App() {
  return (
    <KontentProvider>
      <WebhookProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/webhooks" element={<WebhooksList />} />
              <Route path="/webhooks/new" element={<WebhookForm />} />
              <Route path="/webhooks/:id" element={<WebhookDetails />} />
              <Route path="/webhooks/:id/edit" element={<WebhookForm />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </WebhookProvider>
    </KontentProvider>
  )
}

export default App
