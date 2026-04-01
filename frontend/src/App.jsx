import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import Chat from './pages/chat/Chat';
import Learn from './pages/learn/Learn';
import Exam from './pages/exam/Exam';
import Career from './pages/career/Career';
import AuthCallback from './pages/auth/AuthCallback';
import Admin from './pages/admin/Admin';
import TestEval from './pages/test/TestEval';
import Settings from './pages/settings/Settings';

// ✅ Protected Route
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

// ✅ Admin Route (NEW)
const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route 
  path="/login" 
  element={
    !user 
      ? <Login /> 
      : user.role === 'admin' 
        ? <Navigate to="/admin" /> 
        : <Navigate to="/dashboard" />
  } 
/>

<Route 
  path="/signup" 
  element={
    !user 
      ? <Signup /> 
      : user.role === 'admin' 
        ? <Navigate to="/admin" /> 
        : <Navigate to="/dashboard" />
  } 
/>

        {/* ✅ Dashboard Route FIXED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'admin'
                ? <Navigate to="/admin" />
                : <Dashboard />}
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin Route FIXED */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/exam" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/career" element={<ProtectedRoute><Career /></ProtectedRoute>} />
        <Route path="/test" element={<ProtectedRoute><TestEval /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;