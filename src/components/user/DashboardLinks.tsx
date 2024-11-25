import React from 'react';
import { Link } from 'react-router-dom';

const DashboardLinks: React.FC = () => {
  return (
    <div className="stat-card">
      <h3>Links</h3>

      <ul>
        <li><Link to="/settings">Settings</Link></li>
        <li><Link to="/change-password">Change Password</Link></li>
      </ul>
    </div>
  );
};

export default DashboardLinks;
