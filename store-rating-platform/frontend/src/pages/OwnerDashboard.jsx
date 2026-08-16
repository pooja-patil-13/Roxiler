import { useEffect, useState } from 'react';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          localStorage.getItem('accessToken');

        const response = await fetch(
          'http://localhost:3000/stores/owner/dashboard',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log(
          'OWNER DASHBOARD DATA:',
          data
        );

        if (!response.ok) {
          setError(
            data.message ||
              'Unable to load dashboard'
          );
          return;
        }

        setDashboard(data);
      } catch (err) {
        console.error(err);

        setError(
          'Unable to connect to backend'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const logout = () => {
    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'userRole'
    );

    window.location.href = '/';
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="owner-loading">
        <div className="owner-spinner"></div>

        <p>
          Loading Owner Dashboard...
        </p>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return (
      <div className="owner-error">
        <div className="owner-error-card">

          <div className="error-icon">
            !
          </div>

          <h2>
            Something went wrong
          </h2>

          <p>
            {error}
          </p>

          <button onClick={logout}>
            Logout
          </button>

        </div>
      </div>
    );
  }

  /* =========================
     NO STORE
  ========================= */

  if (
    !dashboard ||
    !dashboard.store
  ) {
    return (
      <div className="owner-error">
        <div className="owner-error-card">

          <div className="error-icon">
            🏪
          </div>

          <h2>
            No Store Found
          </h2>

          <p>
            No store is associated
            with this account.
          </p>

          <button onClick={logout}>
            Logout
          </button>

        </div>
      </div>
    );
  }

  const averageRating =
    Number(
      dashboard.summary?.averageRating || 0
    );

  const totalRatings =
    dashboard.summary?.totalRatings || 0;

  const ratings =
    dashboard.ratings || [];

  return (
    <div className="owner-layout">

      {/* =========================
          HEADER
      ========================= */}

      <header className="owner-header">

        <div className="owner-brand">

          <div className="owner-brand-icon">
            R
          </div>

          <div>
            <h2>
              Roxiler
            </h2>

            <span>
              Store Owner Panel
            </span>
          </div>

        </div>

        <div className="owner-header-right">

          <span className="owner-role">
            Store Owner
          </span>

          <button
            className="owner-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="owner-main">

        {/* TITLE */}

        <section className="owner-title">

          <div>

            <span className="owner-label">
              STORE OWNER DASHBOARD
            </span>

            <h1>
              My Store
            </h1>

            <p>
              Monitor your store performance
              and customer ratings.
            </p>

          </div>

        </section>

        {/* =========================
            STORE INFORMATION
        ========================= */}

        <section className="owner-store-card">

          <div className="store-profile">

            <div className="store-profile-icon">
              🏪
            </div>

            <div>

              <h2>
                {dashboard.store.name}
              </h2>

              <p>
                Your registered store
              </p>

            </div>

          </div>

          <div className="store-details">

            <div className="detail-item">

              <span>
                Email
              </span>

              <strong>
                {dashboard.store.email}
              </strong>

            </div>

            <div className="detail-item">

              <span>
                Address
              </span>

              <strong>
                {dashboard.store.address}
              </strong>

            </div>

          </div>

        </section>

        {/* =========================
            STATISTICS
        ========================= */}

        <section className="owner-stats">

          <div className="owner-stat-card">

            <div className="owner-stat-icon rating-icon">
              ⭐
            </div>

            <div>

              <span>
                Average Rating
              </span>

              <h2>
                {averageRating.toFixed(1)}
              </h2>

            </div>

          </div>

          <div className="owner-stat-card">

            <div className="owner-stat-icon total-icon">
              👥
            </div>

            <div>

              <span>
                Total Ratings
              </span>

              <h2>
                {totalRatings}
              </h2>

            </div>

          </div>

        </section>

        {/* =========================
            CUSTOMER RATINGS
        ========================= */}

        <section className="customer-section">

          <div className="section-heading">

            <div>

              <h2>
                Customer Ratings
              </h2>

              <p>
                Reviews submitted by your
                customers.
              </p>

            </div>

            <div className="rating-summary">

              <span>
                ⭐
              </span>

              <strong>
                {averageRating.toFixed(1)}
              </strong>

            </div>

          </div>

          {ratings.length === 0 ? (

            <div className="no-ratings">

              <div className="no-rating-icon">
                ⭐
              </div>

              <h3>
                No ratings yet
              </h3>

              <p>
                Customer ratings will
                appear here.
              </p>

            </div>

          ) : (

            <div className="ratings-list">

              {ratings.map(
                (rating) => (

                  <div
                    className="customer-rating-card"
                    key={rating.id}
                  >

                    <div className="customer-avatar">
                      {rating.user?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        'U'}
                    </div>

                    <div className="customer-info">

                      <div className="customer-top">

                        <div>

                          <h3>
                            {rating.user?.name ||
                              'Unknown User'}
                          </h3>

                          <span>
                            {rating.user?.email ||
                              'No email'}
                          </span>

                        </div>

                        <div className="customer-stars">

                          {'★'.repeat(
                            Number(
                              rating.rating
                            )
                          )}

                          <span className="rating-number">
                            {rating.rating}/5
                          </span>

                        </div>

                      </div>

                      <div className="rating-date">
                        Rated on{' '}
                        {new Date(
                          rating.createdAt
                        ).toLocaleString()}
                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default OwnerDashboard;