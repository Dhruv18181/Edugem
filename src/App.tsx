import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Interview from './pages/Interview';
import Learning from './pages/Learning';
import Progress from './pages/Progress';
import VoiceLearning from './pages/VoiceLearning';
import FlashcardSetup from './pages/FlashcardSetup';
import FlashcardStudy from './pages/FlashcardStudy';
import FlashcardSubjectSelection from './pages/FlashcardSubjectSelection';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <div className="min-h-screen bg-white">
              <LandingPage />
            </div>
          } />
          <Route path="/about" element={
            <div className="min-h-screen bg-white">
              <AboutPage />
            </div>
          } />
          
          {/* Auth routes */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          
          {/* Protected app routes with sidebar */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Sidebar>
                <Dashboard />
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Sidebar>
                <Chat />
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute>
              <Sidebar>
                <Interview />
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/learn/:subjectId" element={
            <ProtectedRoute>
              <Sidebar>
                <Learning />
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/flashcards/setup/:subjectId" element={
            <ProtectedRoute>
              <FlashcardSetup />
            </ProtectedRoute>
          } />
          <Route path="/flashcards/custom" element={
            <ProtectedRoute>
              <FlashcardSetup />
            </ProtectedRoute>
          } />
          <Route path="/flashcards/create" element={
            <ProtectedRoute>
              <FlashcardSubjectSelection />
            </ProtectedRoute>
          } />
          <Route path="/study/:setId" element={
            <ProtectedRoute>
              <FlashcardStudy />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Sidebar>
                <Progress />
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/voice-learning" element={
            <ProtectedRoute>
              <Sidebar>
                <VoiceLearning />
              </Sidebar>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;