import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthNav from '../auth/AuthNav';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hideHeaderTextRoutes = ['/search', '/collections/create'];
  const shouldShowHeaderText = !hideHeaderTextRoutes.includes(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <div className="header-container">
        <nav className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-left">
            <li className="header-logo">mutūn</li>
          </div>
          <div
            className={`hamburger-button ${isMenuOpen ? 'hidden' : ''}`}
            onClick={toggleMenu}
          >
            &#9776;
          </div>
          <div className="nav-center">
            <li>
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/metadata" onClick={closeMenu}>
                Metadata Browser
              </Link>
            </li>
            <li>
              <Link to="/search" onClick={closeMenu}>
                Search
              </Link>
            </li>
            <li>
              <Link to="/collections" onClick={closeMenu}>
                Collection
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMenu}>
                About
              </Link>
            </li>
            {isMenuOpen && (
              <li className="close-button" onClick={closeMenu}>
                Close &#10005;
              </li>
            )}
          </div>
          <div className="nav-right">
            <li>
              <AuthNav />
            </li>
          </div>
        </nav>
        {shouldShowHeaderText && <div className="header-text">mutūn</div>}
      </div>
    </header>
  );
};

export default Header;
