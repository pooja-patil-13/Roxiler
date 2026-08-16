import { useEffect, useState } from 'react';
import './UserDashboard.css';

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRatings, setSelectedRatings] = useState({});

  // ============================
  // GET STORES
  // ============================

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('accessToken');

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(
        `http://localhost:3000/stores?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log('STORES RESPONSE:', data);

      if (!response.ok) {
        setError(
          data.message || 'Unable to load stores'
        );
        return;
      }

      // Backend may return an array directly
      // or { data: [...] }
      const storeList = Array.isArray(data)
        ? data
        : data.data || [];

      setStores(storeList);
    } catch (err) {
      console.error('Store error:', err);

      setError(
        'Unable to connect to backend'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // LOAD STORES
  // ============================

  useEffect(() => {
    fetchStores();
  }, []);

  // ============================
  // SEARCH
  // ============================

  const handleSearch = (event) => {
    event.preventDefault();
    fetchStores();
  };

  // ============================
  // SELECT RATING
  // ============================

  const handleRatingChange = (
    storeId,
    rating
  ) => {
    setSelectedRatings((previous) => ({
      ...previous,
      [storeId]: rating,
    }));
  };

  // ============================
  // SUBMIT / UPDATE RATING
  // ============================

  const submitRating = async (storeId) => {
    const rating = selectedRatings[storeId];

    if (!rating) {
      alert(
        'Please select a rating from 1 to 5.'
      );
      return;
    }

    try {
      const token =
        localStorage.getItem('accessToken');

      const store = stores.find(
        (item) => item.id === storeId
      );

      const userRating =
        store?.userRating ??
        store?.myRating ??
        store?.userSubmittedRating ??
        null;

      const method = userRating
        ? 'PATCH'
        : 'POST';

      const response = await fetch(
        `http://localhost:3000/rating/${storeId}`,
        {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: Number(rating),
          }),
        }
      );

      const data = await response.json();

      console.log(
        'RATING RESPONSE:',
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            'Unable to submit rating'
        );
        return;
      }

      alert(
        userRating
          ? 'Rating updated successfully!'
          : 'Rating submitted successfully!'
      );

      // Refresh store data
      await fetchStores();

    } catch (err) {
      console.error(
        'Rating error:',
        err
      );

      alert(
        'Unable to connect to backend'
      );
    }
  };

  // ============================
  // LOGOUT
  // ============================

  const logout = () => {
    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'userRole'
    );

    window.location.href = '/';
  };

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className="user-message">
        <h2>Loading stores...</h2>
      </div>
    );
  }

  // ============================
  // PAGE
  // ============================

  return (
    <div className="user-layout">

      {/* =========================
          HEADER
      ========================= */}

      <header className="user-header">

        <div className="user-brand">

          <div className="user-brand-icon">
            R
          </div>

          <div>
            <h2>Roxiler</h2>

            <span>
              Store Rating Platform
            </span>
          </div>

        </div>

        <div className="user-header-right">

          <span className="user-role">
            Normal User
          </span>

          <button
            className="user-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="user-main">

        {/* TITLE */}

        <section className="user-title">

          <h1>
            Find a Store
          </h1>

          <p>
            Search stores and share
            your experience.
          </p>

        </section>

        {/* =========================
            SEARCH
        ========================= */}

        <section className="user-search">

          <form
            onSubmit={handleSearch}
          >

            <input
              type="text"
              placeholder="Search by store name or address..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            <button type="submit">
              Search
            </button>

          </form>

        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="user-error">
            {error}
          </div>
        )}

        {/* =========================
            EMPTY
        ========================= */}

        {!error &&
          stores.length === 0 && (
            <div className="user-empty">
              No stores found.
            </div>
          )}

        {/* =========================
            STORE CARDS
        ========================= */}

        {!error &&
          stores.length > 0 && (

            <section className="store-grid">

              {stores.map((store) => {

                const storeId = store.id;

                const averageRating =
                  store.averageRating ??
                  store.rating ??
                  0;

                const userRating =
                  store.userRating ??
                  store.myRating ??
                  store.userSubmittedRating ??
                  null;

                const selectedRating =
                  selectedRatings[storeId] ??
                  userRating ??
                  0;

                return (

                  <article
                    className="store-card"
                    key={storeId}
                  >

                    {/* STORE INFO */}

                    <div className="store-card-header">

                      <div className="store-icon">
                        🏪
                      </div>

                      <div>

                        <h2>
                          {store.name}
                        </h2>

                        <p>
                          {store.address ||
                            'Address not available'}
                        </p>

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div className="store-email">
                      ✉️ {store.email}
                    </div>

                    {/* RATINGS */}

                    <div className="rating-section">

                      <div className="rating-row">

                        <span>
                          Overall Rating
                        </span>

                        <strong>
                          ⭐{' '}
                          {Number(
                            averageRating
                          ).toFixed(1)}
                        </strong>

                      </div>

                      <div className="rating-row">

                        <span>
                          Your Rating
                        </span>

                        <strong>
                          {userRating
                            ? `⭐ ${userRating}`
                            : 'Not rated yet'}
                        </strong>

                      </div>

                    </div>

                    {/* RATING INPUT */}

                    <div className="rating-input">

                      <p>
                        {userRating
                          ? 'Modify your rating'
                          : 'Give your rating'}
                      </p>

                      <div className="stars">

                        {[1, 2, 3, 4, 5].map(
                          (star) => (

                            <button
                              type="button"
                              key={star}
                              className={
                                star <=
                                selectedRating
                                  ? 'star selected'
                                  : 'star'
                              }
                              onClick={() =>
                                handleRatingChange(
                                  storeId,
                                  star
                                )
                              }
                            >
                              ★
                            </button>

                          )
                        )}

                      </div>

                      <button
                        type="button"
                        className="submit-rating"
                        onClick={() =>
                          submitRating(
                            storeId
                          )
                        }
                      >
                        {userRating
                          ? 'Update Rating'
                          : 'Submit Rating'}
                      </button>

                    </div>

                  </article>

                );
              })}

            </section>

          )}

      </main>

    </div>
  );
}

export default UserDashboard;