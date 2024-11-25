import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { Auth0Context } from '../../types';
import './AuthNav.css';

export const AuthNav = () => {
  const { user, isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0<Auth0Context>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!isAuthenticated && !isLoading) {
    return (
      <button className="text-button" onClick={() => loginWithRedirect()}>
        Log In
      </button>
    );
  }

  // Check for admin role
  const isAdmin = user && user['https://example.com/roles']?.includes('admin');

  // Handle logout
  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="dropdown-container">
      {isLoading ? (
        <div className="skeleton-link" />
      ) : (
        <Link to="/dashboard">My Account</Link>
      )}
      <button
        className="avatar-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {isLoading ? (
          <div className="skeleton-avatar" />
        ) : user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User avatar'}
            className="avatar-image"
          />
        ) : (
          <div className="avatar-fallback">
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </button>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          <div className="user-info">
            {isLoading ? (
              <>
                <div className="skeleton-text skeleton-name" />
                <div className="skeleton-text skeleton-email" />
              </>
            ) : (
              <>
                <p className="user-name">{user?.name}</p>
                <p className="user-email">{user?.email}</p>
              </>
            )}
          </div>
          <div className="dropdown-divider"></div>

          <Link to="/dashboard" className="dropdown-item">Profile</Link>
          <Link to="/settings" className="dropdown-item">Settings</Link>

          {isAdmin && (
            <>
              <div className="dropdown-divider"></div>
              <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>
            </>
          )}

          <div className="dropdown-divider"></div>
          <button
            className="dropdown-item logout-button"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthNav;