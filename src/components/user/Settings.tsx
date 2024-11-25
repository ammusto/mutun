import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import DashboardLinks from './DashboardLinks';
import '../../styles/auth.css';

interface SettingsState {
  message: string;
  error: string;
  isLoading: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth0();
  const [{ message, error }] = useState<SettingsState>({
    message: '',
    error: '',
    isLoading: false
  });

  if (!user) {
    return (
      <div className="container">
        <div className="main">
          <div className="text-content">Please log in to access settings.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className='main'>
        <div className="dashboard-stats">
          <div className="dashboard-left">
            <DashboardLinks />
          </div>
          <div className="dashboard-right">
            <h3>Account Settings</h3>
            
            <div className="stat-card">
              <h4>Password Management</h4>
              <p><Link to="/change-password">Change Password</Link></p>
            </div>

            <div className="stat-card">
              <h4>Account Information</h4>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Last Updated:</strong> {new Date(user.updated_at || '').toLocaleDateString()}</p>
            </div>

            <div className="stat-card">
              <h4>Email Preferences</h4>
              <p>Coming soon...</p>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;