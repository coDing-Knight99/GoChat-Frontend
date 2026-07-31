import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'

function App() {
  return <>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <ToastContainer position="top-right" theme="dark" autoClose={3500} />
  </>
}

export default App
