import React, { useState, FormEvent } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLinks from './DashboardLinks';

interface ChangePasswordProps {}

const ChangePassword: React.FC<ChangePasswordProps> = () => {
  const { user } = useAuth0();
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validatePassword = (password: string): string | null => {
    const minLength = 8;
    const upperCasePattern = /[A-Z]/;
    const numberPattern = /[0-9]/;
    const specialCharPattern = /[!@#$%^&*]/;

    if (password.length < minLength) return 'Password must be at least 8 characters long';
    if (!upperCasePattern.test(password)) return 'Password must contain at least one uppercase letter';
    if (!numberPattern.test(password)) return 'Password must contain at least one number';
    if (!specialCharPattern.test(password)) return 'Password must contain at least one special character';
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Check for environment variables
      const auth0Domain = process.env.REACT_APP_AUTH0_DOMAIN;
      const auth0ClientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
      if (!auth0Domain || !auth0ClientId) {
        throw new Error('Auth0 configuration is missing.');
      }

      const response = await fetch(`https://${auth0Domain}/dbconnections/change_password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: auth0ClientId,
          email: user?.email,
          connection: 'Username-Password-Authentication',
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setMessage('Password changed successfully');
      // Clear form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError((err as Error).message || 'An error occurred while changing the password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>User not authenticated</div>;
  }

  return (
    <div className="container">
      <div className="dashboard-stats">
        <div className="dashboard-left">
          <DashboardLinks />
        </div>
        <div className="dashboard-right">
          <h3>Change Password</h3>
          <div className="stat-card">
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="old-password">Current Password</label>
                <input
                  id="old-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="password-requirements">
                <h4>Password Requirements:</h4>
                <ul>
                  <li>At least 8 characters long</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character (!@#$%^&*)</li>
                </ul>
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
