import { useEffect, useState } from 'react';
import './AdminStores.css';

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      const params = new URLSearchParams();

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(
        `http://localhost:3000/admin/stores?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            'Unable to load stores',
        );
        return;
      }

      setStores(data.data);
    } catch (error) {
      setError(
        'Unable to connect to backend',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');

    window.location.href = '/';
  };

  return (
    <div className="admin-stores-page">

      <header className="stores-header">
        <div>
          <h1>Stores</h1>
          <p>
            Manage registered stores
          </p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <section className="stores-toolbar">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search store name, email or address..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>
      </section>

      {loading && (
        <p className="stores-message">
          Loading stores...
        </p>
      )}

      {error && (
        <p className="stores-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="stores-table-wrapper">

          <table className="stores-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Store</th>
                <th>Email</th>
                <th>Address</th>
                <th>Owner</th>
                <th>Total Ratings</th>
                <th>Average Rating</th>
              </tr>
            </thead>

            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="empty-stores"
                  >
                    No stores found
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id}>

                    <td>
                      {store.id}
                    </td>

                    <td>
                      <strong>
                        {store.name}
                      </strong>
                    </td>

                    <td>
                      {store.email}
                    </td>

                    <td>
                      {store.address}
                    </td>

                    <td>
                      <div className="owner-info">
                        <strong>
                          {store.owner?.name ||
                            'No owner'}
                        </strong>

                        <span>
                          {store.owner?.email ||
                            '-'}
                        </span>
                      </div>
                    </td>

                    <td>
                      {store.totalRatings}
                    </td>

                    <td>
                      <span className="rating">
                        ⭐{' '}
                        {store.averageRating}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>
      )}

      <button
        className="back-button"
        onClick={() =>
          (window.location.href =
            '/admin')
        }
      >
        ← Back to Dashboard
      </button>

    </div>
  );
}

export default AdminStores;