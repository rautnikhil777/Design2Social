import { Navigate, Route, Routes } from 'react-router-dom';

import DashboardPage from './pages/DashboardPage';
import FlyerEditorPage from './pages/FlyerEditorPage';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import PreviewPage from './pages/PreviewPage';
import PublishPage from './pages/PublishPage';
import ReelEditorPage from './pages/ReelEditorPage';

export default function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/" element={token ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/generate" element={token ? <GeneratePage /> : <Navigate to="/login" replace />} />
      <Route path="/editor/flyer" element={token ? <FlyerEditorPage /> : <Navigate to="/login" replace />} />
      <Route path="/editor/reel" element={token ? <ReelEditorPage /> : <Navigate to="/login" replace />} />
      <Route path="/preview" element={token ? <PreviewPage /> : <Navigate to="/login" replace />} />
      <Route path="/publish" element={token ? <PublishPage /> : <Navigate to="/login" replace />} />
      <Route path="/history" element={token ? <HistoryPage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

