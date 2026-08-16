import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem('accessToken');

        const response = await fetch(
          'http://localhost:3000/admin/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        console.log(
          'ADMIN DASHBOARD:',
          data,
        );

        if (!response.ok) {
          setError(
            data.message ||
              'Unable to load dashboard',
          );
          return;
        }

        setDashboard(data);
      } catch (err) {
        console.error(err);

        setError(
          'Unable to connect to backend',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');

    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="admin-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <div className="brand">
          <div className="brand-icon">
            R
          </div>

          <div className="brand-text">
            <h2>Roxiler</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/admin"
            className="nav-link active"
          >
            <span className="nav-icon">
              ▣
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          <Link
            to="/admin/users"
            className="nav-link"
          >
            <span className="nav-icon">
              👥
            </span>

            <span>
              Users
            </span>
          </Link>

          <Link
            to="/admin/stores"
            className="nav-link"
          >
            <span className="nav-icon">
              🏪
            </span>

            <span>
              Stores
            </span>
          </Link>

        </nav>

        <button
          className="sidebar-logout"
          onClick={logout}
        >
          <span>↪</span>
          Logout
        </button>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="admin-main">

        {/* TOP BAR */}

        <header className="admin-topbar">

          <div>
            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, Administrator
            </p>
          </div>

          <div className="admin-profile">

            <div className="profile-avatar">
              A
            </div>

            <div className="profile-info">
              <strong>
                System Admin
              </strong>

              <span>
                Administrator
              </span>
            </div>

          </div>

        </header>

        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          {/* USERS */}

          <div className="stat-card">

            <div className="stat-icon users-icon">
              👥
            </div>

            <div className="stat-content">

              <span>
                Total Users
              </span>

              <h2>
                {dashboard?.totalUsers ?? 0}
              </h2>

            </div>

          </div>

          {/* STORES */}

          <div className="stat-card">

            <div className="stat-icon stores-icon">
              🏪
            </div>

            <div className="stat-content">

              <span>
                Total Stores
              </span>

              <h2>
                {dashboard?.totalStores ?? 0}
              </h2>

            </div>

          </div>

          {/* RATINGS */}

          <div className="stat-card">

            <div className="stat-icon ratings-icon">
              ⭐
            </div>

            <div className="stat-content">

              <span>
                Total Ratings
              </span>

              <h2>
                {dashboard?.totalRatings ?? 0}
              </h2>

            </div>

          </div>

        </section>

        {/* ================= WELCOME CARD ================= */}

        <section className="welcome-card">

          <div className="welcome-content">

            <span className="welcome-label">
              ROXILER STORE RATING
            </span>

            <h2>
              Manage your platform
              efficiently.
            </h2>

            <p>
              Monitor users, stores and
              ratings from one place.
            </p>

          </div>

          <div className="welcome-icon">
            📊
          </div>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="quick-section">

          <h2>
            Quick Actions
          </h2>

          <div className="quick-grid">

            <Link
              to="/admin/users"
              className="quick-card"
            >

              <div className="quick-icon">
                👥
              </div>

              <div>
                <h3>
                  Manage Users
                </h3>

                <p>
                  View and search users
                </p>
              </div>

              <span className="arrow">
                →
              </span>

            </Link>

            <Link
              to="/admin/stores"
              className="quick-card"
            >

              <div className="quick-icon">
                🏪
              </div>

              <div>
                <h3>
                  Manage Stores
                </h3>

                <p>
                  View registered stores
                </p>
              </div>

              <span className="arrow">
                →
              </span>

            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;