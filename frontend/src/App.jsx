import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import FlyerEditorPage from './pages/FlyerEditorPage';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import PreviewPage from './pages/PreviewPage';
import PublishPage from './pages/PublishPage';
import ReelEditorPage from './pages/ReelEditorPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/generate"
        element={
          <ProtectedRoute>
            <GeneratePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/editor/flyer"
        element={
          <ProtectedRoute>
            <FlyerEditorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/editor/reel"
        element={
          <ProtectedRoute>
            <ReelEditorPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/preview"
        element={
          <ProtectedRoute>
            <PreviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/publish"
        element={
          <ProtectedRoute>
            <PublishPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={token ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}