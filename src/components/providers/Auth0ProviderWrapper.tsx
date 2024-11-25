import React, { useEffect } from 'react';
import { 
  useAuth0, 
  Auth0Provider, 
  Auth0ProviderOptions 
} from '@auth0/auth0-react';
import { userDataService } from '../services/userDataService';

interface Auth0ProviderWrapperProps {
  children: React.ReactNode;
}

interface Auth0ContextUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  updated_at?: string;
}

interface Auth0ProviderConfigProps extends Auth0ProviderOptions {
  domain: string;
  clientId: string;
  authorizationParams: {
    redirect_uri: string;
  };
}

const InternalProvider: React.FC<Auth0ProviderWrapperProps> = ({ children }) => {
  const { 
    user, 
    isAuthenticated, 
    isLoading 
  } = useAuth0<Auth0ContextUser>();

  useEffect(() => {
    const initializeUserInOpenSearch = async () => {
      if (!user) {
        return;
      }

      try {
        const existingUser = await userDataService.getUserData(user.sub);

        if (existingUser) {
        } else {
          await userDataService.createUserData(user.sub, user.email);
        }
      } catch (error) {
      }
    };

    initializeUserInOpenSearch();
  }, [isAuthenticated, user, isLoading]);

  return <>{children}</>;
};

export const Auth0ProviderWrapper: React.FC<Auth0ProviderWrapperProps> = ({ children }) => {
  if (!process.env.REACT_APP_AUTH0_DOMAIN || !process.env.REACT_APP_AUTH0_CLIENT_ID) {
    throw new Error('Required Auth0 environment variables are not set');
  }

  const config: Auth0ProviderConfigProps = {
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
    authorizationParams: {
      redirect_uri: window.location.origin,
    }
  };

  return (
    <Auth0Provider {...config}>
      <InternalProvider>
        {children}
      </InternalProvider>
    </Auth0Provider>
  );
};
