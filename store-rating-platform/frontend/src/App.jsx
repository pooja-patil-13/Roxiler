import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminStores from './pages/AdminStores';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        'http://localhost:3000/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || 'Login failed',
        );
        return;
      }

      localStorage.setItem(
        'accessToken',
        data.accessToken,
      );

      const payload = JSON.parse(
        atob(data.accessToken.split('.')[1]),
      );

      localStorage.setItem(
        'userRole',
        payload.role,
      );

      console.log('Logged in role:', payload.role);

      if (payload.role === 'SYSTEM_ADMIN') {
        window.location.href = '/admin';
      } else if (
        payload.role === 'NORMAL_USER'
      ) {
        window.location.href = '/user';
      } else if (
        payload.role === 'STORE_OWNER'
      ) {
        window.location.href = '/owner';
      } else {
        setMessage('Unknown user role');
      }
    } catch (error) {
      console.error(error);
      setMessage(
        'Unable to connect to the backend',
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Roxiler</h1>

        <p className="subtitle">
          Store Rating Platform
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>
        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const token =
    localStorage.getItem('accessToken');

  const userRole =
    localStorage.getItem('userRole');

  console.log(
    'ProtectedRoute:',
    {
      tokenExists: !!token,
      userRole,
      requiredRole: role,
    },
  );

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="SYSTEM_ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN USERS */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="SYSTEM_ADMIN">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* ADMIN STORES */}
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute role="SYSTEM_ADMIN">
              <AdminStores />
            </ProtectedRoute>
          }
        />

        {/* NORMAL USER */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="NORMAL_USER">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* STORE OWNER */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute role="STORE_OWNER">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;