import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Lazy load components
const Layout = lazy(() => import('./components/layout/Layout'));
const LoadingGif = lazy(() => import('./components/utils/LoadingGif'));
const MetadataProvider = lazy(() =>
  import('./components/contexts/metadataContext').then(mod => ({ default: mod.MetadataProvider }))
);
const SearchProvider = lazy(() =>
  import('./components/contexts/SearchContext').then(mod => ({ default: mod.SearchProvider }))
);
const SearchFormProvider = lazy(() =>
  import('./components/contexts/SearchFormContext').then(mod => ({ default: mod.SearchFormProvider }))
);
const Auth0ProviderWrapper = lazy(() =>
  import('./components/providers/Auth0ProviderWrapper').then(mod => ({ default: mod.Auth0ProviderWrapper }))
);

const PrivateRoute = lazy(() => import('./components/auth/PrivateRoute'));

// Public Pages
const HomePage = lazy(() => import('./components/pages/HomePage'));
const AboutPage = lazy(() => import('./components/pages/About'));
const MetadataBrowser = lazy(() => import('./components/pages/MetadataBrowser'));
const TextPage = lazy(() => import('./components/pages/TextPage'));
const AuthorPage = lazy(() => import('./components/pages/AuthorPage'));
const SearchPage = lazy(() => import('./components/pages/SearchPage'));
const Reader = lazy(() => import('./components/pages/Reader'));
const CollectionCreation = lazy(() => import('./components/pages/CollectionCreation'));
const Collections = lazy(() => import('./components/pages/Collections'));

// User Pages (Protected)
const Settings = lazy(() => import('./components/user/Settings'));
const ChangePassword = lazy(() => import('./components/user/ChangePassword'));
const UserDashboard = lazy(() => import('./components/user/Dashboard'));

const NotFound: React.FC = () => (
  <div className="container">
    <div className="main">
      <div className="text-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingGif />}>
      <MetadataProvider>
        <Router>
          <Auth0ProviderWrapper>
            <Suspense fallback={<LoadingGif />}>
              <Layout>
                <Suspense fallback={<LoadingGif />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/metadata" element={<MetadataBrowser />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/text/:textId" element={<TextPage />} />
                    <Route path="/author/:authorId" element={<AuthorPage />} />
                    <Route
                      path="/search"
                      element={
                        <Suspense fallback={<LoadingGif />}>
                          <SearchProvider>
                            <SearchFormProvider>
                              <SearchPage />
                            </SearchFormProvider>
                          </SearchProvider>
                        </Suspense>
                      }
                    />
                    <Route path="/reader/:textId/:vol/:pageNum?" element={<Reader />} />
                    <Route path="/collections/" element={<Collections />} />

                    {/* Protected User Routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/dashboard" element={<UserDashboard />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/change-password" element={<ChangePassword />} />
                      <Route
                        path="/collections/create"
                        element={
                          <Suspense fallback={<LoadingGif />}>
                            <SearchProvider>
                              <CollectionCreation />
                            </SearchProvider>
                          </Suspense>
                        }
                      />
                      <Route
                        path="/collections/edit/:collectionId"
                        element={
                          <Suspense fallback={<LoadingGif />}>
                            <SearchProvider>
                              <CollectionCreation />
                            </SearchProvider>
                          </Suspense>
                        }
                      />
                    </Route>

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </Suspense>
          </Auth0ProviderWrapper>
        </Router>
      </MetadataProvider>
    </Suspense>
  );
};

export default App;
