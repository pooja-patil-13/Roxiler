import { useEffect, useState } from 'react';
import './AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const token =
        localStorage.getItem('accessToken');

      const params = new URLSearchParams();

      if (search) {
        params.append('search', search);
      }

      if (role) {
        params.append('role', role);
      }

      const response = await fetch(
        `http://localhost:3000/admin/users?${params.toString()}`,
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
            'Unable to load users',
        );
        return;
      }

      setUsers(data.data);
    } catch (error) {
      setError(
        'Unable to connect to backend',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');

    window.location.href = '/';
  };

  return (
    <div className="users-page">

      <header className="users-header">
        <div>
          <h1>Users</h1>
          <p>
            Manage registered users
          </p>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <section className="users-toolbar">

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search name, email or address..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
        >
          <option value="">
            All Roles
          </option>

          <option value="SYSTEM_ADMIN">
            System Admin
          </option>

          <option value="NORMAL_USER">
            Normal User
          </option>

          <option value="STORE_OWNER">
            Store Owner
          </option>
        </select>

      </section>

      {loading && (
        <p className="users-message">
          Loading users...
        </p>
      )}

      {error && (
        <p className="users-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="empty-users"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>
                      <strong>
                        {user.name}
                      </strong>
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      {user.address}
                    </td>

                    <td>
                      <span
                        className={`role-badge ${user.role.toLowerCase()}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.createdAt,
                      ).toLocaleDateString()}
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

export default AdminUsers;