import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { createActor } from '../../declarations/test_ireits_backend';

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navabar';
import HomePage from './pages/Homepage';
import FeaturePage from './pages/Feature';
import LoginPage from './pages/Login';
import Footer from './components/Footer';
import DashboardPage from './pages/Dashboard';
import TokenMarketplace from './pages/TokenMarketplace';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [backendActor, setBackendActor] = useState(null);
  const [authClient, setAuthClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userPrincipal, setUserPrincipal] = useState(null);

  const initializeAgent = async (identity) => {
    const agent = new HttpAgent({
      identity,
      host: process.env.DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app',
    });

    if (process.env.DFX_NETWORK === 'local') {
      try {
        await agent.fetchRootKey();
      } catch (err) {
        console.warn('Unable to fetch root key:', err);
      }
    }

    return createActor(process.env.CANISTER_ID_TEST_IREITS_BACKEND, { agent });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create({
          idleOptions: {
            disableIdle: true,
          }
        });
        setAuthClient(client);

        const isAuthenticated = await client.isAuthenticated();
        if (isAuthenticated) {
          const identity = client.getIdentity();
          const actor = await initializeAgent(identity);
          setBackendActor(actor);
          setLoggedIn(true);
          setUserPrincipal(identity.getPrincipal());
        }
      } catch (err) {
        console.error('Error initializing authentication:', err);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient || isLoading) return;

    try {
      setIsLoading(true);
      
      const identityProvider = process.env.DFX_NETWORK === 'local'
        ? `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`
        : 'https://identity.ic0.app';

      await new Promise((resolve, reject) => {
        authClient.login({
          identityProvider,
          windowOpenerFeatures: `
            left=${window.screen.width / 2 - 525 / 2},
            top=${window.screen.height / 2 - 705 / 2},
            toolbar=0,location=0,menubar=0,width=525,height=705
          `,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
          onSuccess: async () => {
            const identity = authClient.getIdentity();
            const actor = await initializeAgent(identity);
            setBackendActor(actor);
            setLoggedIn(true);
            setUserPrincipal(identity.getPrincipal());
            resolve();
          },
          onError: (err) => {
            console.error('Login error:', err);
            setIsLoading(false);
            reject(err);
          },
        });
      });
    } catch (err) {
      console.error('Error during login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) return;
    try {
      await authClient.logout();
      setLoggedIn(false);
      setBackendActor(null);
      setUserPrincipal(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  return (
    <main>
      <div>
        <Router>
          <Navbar 
            loggedIn={loggedIn} 
            onLogin={login}
            onLogout={logout}
            isLoading={isLoading}
            className="hover:text-pink-500 transition-colors" 
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturePage />} />
            <Route path="/login" element={
              <LoginPage 
                loggedIn={loggedIn}
                onLogin={login}
                isLoading={isLoading}
              />
            } />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route 
              path="/marketplace" 
              element={
                <TokenMarketplace 
                  actor={backendActor}
                  userPrincipal={userPrincipal}
                />
              } 
            />
          </Routes>
          <Footer />
        </Router>
      </div>
    </main>
  );
}

export default App;
