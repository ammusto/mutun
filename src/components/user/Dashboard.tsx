import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLinks from './DashboardLinks';
import SearchHistory from './SearchHistory';
import { userDataService } from '../services/userDataService';
import LoadingGif from '../utils/LoadingGif';
import CollectionsList from '../pages/CollectionsList';
import { UserData } from '../../types';
import '../../styles/auth.css';
import './User.css';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  const loadUserData = useCallback(async () => {
    if (isAuthenticated && user?.sub) {
      try {
        const data = await userDataService.getUserData(user.sub);
        if (!data) {
          await userDataService.createUserData(user.sub, user.email ?? '');
        }
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setDataLoading(false);
      }
    }
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  if (isLoading || dataLoading) {
    return <LoadingGif />;
  }

  return (
    <div className="container">
      <div className='main'>
        <div className="dashboard-stats">
          <div className="dashboard-left">
            <DashboardLinks />
          </div>
          <div className="dashboard-right">
            <div className="stat-card">
              <h3>Account Information</h3>
              <p>Last login: {new Date(user?.updated_at ?? '').toLocaleDateString()}</p>
              <p>Email: {user!.email}</p>
            </div>
            <CollectionsList
              collections={userData?._source.saved_corpora || []}
              showActions={false}
            />
            <SearchHistory
              searchHistory={userData?._source.search_history || []}
              savedSearches={userData?._source.saved_searches || []}
              onUpdate={loadUserData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
