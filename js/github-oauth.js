// GitHub OAuth Implementation

/**
 * This file contains the implementation for GitHub OAuth 
 * to be used with the ICCWSC web application.
 * 
 * Since we're using GitHub Pages (with no server-side component),
 * we'll use a proxy service for the OAuth token exchange.
 */

// GitHub OAuth Configuration
const GitHubOAuth = {
    // Replace these with your own values
    clientId: '', // You'll need to add your GitHub OAuth App client ID
    proxyUrl: 'https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token',
    redirectUri: window.location.origin + window.location.pathname,
    scope: 'repo',
    
    // Initialize OAuth configuration
    init: function(clientId) {
      this.clientId = clientId;
      console.log('GitHub OAuth initialized with client ID:', clientId);
    },
    
    // Start the OAuth flow by redirecting to GitHub
    login: function() {
      if (!this.clientId) {
        console.error('GitHub OAuth client ID not set');
        return;
      }
      
      // Generate a random state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('github_oauth_state', state);
      
      // Construct the authorization URL
      const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `scope=${encodeURIComponent(this.scope)}&` +
        `state=${state}`;
      
      // Redirect the user to GitHub for authorization
      window.location.href = authUrl;
    },
    
    // Handle the callback from GitHub
    handleCallback: async function() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const savedState = localStorage.getItem('github_oauth_state');
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verify state to prevent CSRF attacks
      if (!code || state !== savedState) {
        console.error('Invalid OAuth callback or state mismatch');
        return { success: false, error: 'Invalid OAuth state' };
      }
      
      localStorage.removeItem('github_oauth_state');
      
      try {
        // Important: In a production app, this exchange should happen server-side
        // We're using a CORS proxy for demo purposes
        const response = await fetch(this.proxyUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          body: JSON.stringify({
            client_id: this.clientId,
            code: code,
            redirect_uri: this.redirectUri
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error_description || data.error);
        }
        
        // Store the access token securely
        localStorage.setItem('github_access_token', data.access_token);
        
        return { 
          success: true, 
          token: data.access_token,
          tokenType: data.token_type,
          scope: data.scope
        };
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Get the current access token
    getToken: function() {
      return localStorage.getItem('github_access_token');
    },
    
    // Check if the user is authenticated
    isAuthenticated: function() {
      return !!this.getToken();
    },
    
    // Log the user out
    logout: function() {
      localStorage.removeItem('github_access_token');
      localStorage.removeItem('github_user');
    },
    
    // Fetch the authenticated user's information
    fetchUserInfo: async function() {
      const token = this.getToken();
      
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const user = await response.json();
        
        // Store the user info
        localStorage.setItem('github_user', JSON.stringify({
          id: user.id,
          login: user.login,
          name: user.name || user.login,
          avatar_url: user.avatar_url
        }));
        
        return { success: true, user };
      } catch (error) {
        console.error('Error fetching user info:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Get the stored user info
    getUser: function() {
      const userJson = localStorage.getItem('github_user');
      return userJson ? JSON.parse(userJson) : null;
    }
  };
  
  // Export the GitHubOAuth object
  window.GitHubOAuth = GitHubOAuth;