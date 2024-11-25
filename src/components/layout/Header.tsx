import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthNav from '../auth/AuthNav';

const Header: React.FC = () => {
  const location = useLocation();

  const hideHeaderTextRoutes = ['/search', '/collections/create'];
  const shouldShowHeaderText = !hideHeaderTextRoutes.includes(location.pathname);

  return (
    <header>
      <div className="header-container">
        <nav>
          <ul className='nav-container'>
            <div className="nav-left">
              <li className='header-logo'>mutūn</li>
            </div>
            <div className="nav-center">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/metadata">Metadata Browser</Link></li>
              <li><Link to="/search">Search</Link></li>
              <li><Link to="/collections">Collection</Link></li>
              <li><Link to="/about">About</Link></li>
            </div>
            <div className="nav-right">
              <li><AuthNav /></li>
            </div>
          </ul>
        </nav>
        {shouldShowHeaderText && <div className="header-text">mutūn</div>}
      </div>
    </header>
  );
};

export default Header;