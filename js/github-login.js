// GitHub Login Integration
// Add this to your main JavaScript after the page is loaded

/**
 * This file contains the code to integrate the GitHub OAuth
 * with the ICCWSC web application interface.
 */

// Initialize GitHub login integration
function initGitHubLogin() {
    // Set up GitHub OAuth
    const clientId = localStorage.getItem('github_client_id');
    if (clientId) {
      GitHubOAuth.init(clientId);
      console.log('GitHub OAuth initialized with saved client ID');
    }
    
    // Update UI based on authentication status
    updateGitHubUI();
    
    // Set up event listeners for GitHub login buttons
    document.getElementById('github-login-btn').addEventListener('click', function(e) {
      e.preventDefault();
      handleGitHubLogin();
    });
    
    document.getElementById('github-login-modal-btn').addEventListener('click', function(e) {
      e.preventDefault();
      handleGitHubLogin();
    });
    
    // GitHub logout button
    document.getElementById('github-logout-btn').addEventListener('click', function(e) {
      e.preventDefault();
      GitHubOAuth.logout();
      updateGitHubUI();
      alert('Logged out from GitHub successfully');
    });
    
    // GitHub setup modal
    document.getElementById('github-connect-btn').addEventListener('click', function(e) {
      e.preventDefault();
      
      if (GitHubOAuth.isAuthenticated()) {
        const user = GitHubOAuth.getUser();
        alert(`Already connected as ${user.name}`);
      } else if (clientId) {
        handleGitHubLogin();
      } else {
        document.getElementById('github-setup-modal').style.display = 'flex';
      }
    });
    
    // Close setup modal
    document.getElementById('close-github-modal').addEventListener('click', function() {
      document.getElementById('github-setup-modal').style.display = 'none';
    });
    
    // Save GitHub settings
    document.getElementById('save-github-settings').addEventListener('click', function() {
      const newClientId = document.getElementById('github-client-id').value.trim();
      const username = document.getElementById('github-username').value.trim();
      const repo = document.getElementById('github-repo').value.trim();
      
      if (!newClientId || !username || !repo) {
        alert('Please fill in all fields');
        return;
      }
      
      // Save settings
      localStorage.setItem('github_client_id', newClientId);
      localStorage.setItem('github_username', username);
      localStorage.setItem('github_repo', repo);
      
      // Initialize OAuth with new client ID
      GitHubOAuth.init(newClientId);
      
      // Close modal
      document.getElementById('github-setup-modal').style.display = 'none';
      
      alert('GitHub settings saved. You can now login with GitHub.');
    });
    
    // Check for OAuth callback
    checkForOAuthCallback();
  }
  
  // Handle GitHub login
  function handleGitHubLogin() {
    const clientId = localStorage.getItem('github_client_id');
    
    if (!clientId) {
      alert('Please configure GitHub integration first');
      document.getElementById('github-setup-modal').style.display = 'flex';
      return;
    }
    
    // Start OAuth flow
    GitHubOAuth.login();
  }
  
  // Update UI based on GitHub authentication status
  function updateGitHubUI() {
    const isAuthenticated = GitHubOAuth.isAuthenticated();
    
    // Show/hide login and logout buttons
    document.getElementById('github-login-btn').style.display = isAuthenticated ? 'none' : 'block';
    document.getElementById('github-logout-btn').style.display = isAuthenticated ? 'block' : 'none';
    
    // Update user info display
    if (isAuthenticated) {
      const user = GitHubOAuth.getUser();
      
      if (user) {
        document.getElementById('github-user-name').textContent = user.name;
        document.getElementById('github-user-avatar').src = user.avatar_url;
        document.getElementById('github-user-info').style.display = 'flex';
        
        // Update GitHub connection status
        document.getElementById('github-disconnected').style.display = 'none';
        document.getElementById('github-connected').style.display = 'block';
        document.getElementById('github-connect-btn').textContent = 'GitHub Settings';
      }
    } else {
      document.getElementById('github-user-info').style.display = 'none';
      document.getElementById('github-disconnected').style.display = 'block';
      document.getElementById('github-connected').style.display = 'none';
      document.getElementById('github-connect-btn').textContent = 'Connect with GitHub';
    }
  }
  
  // Check for OAuth callback
  async function checkForOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      console.log('Detected OAuth callback, processing...');
      
      // Process OAuth callback
      const result = await GitHubOAuth.handleCallback();
      
      if (result.success) {
        console.log('Successfully authenticated with GitHub');
        
        // Fetch user info
        const userResult = await GitHubOAuth.fetchUserInfo();
        
        if (userResult.success) {
          console.log('Fetched GitHub user info:', userResult.user);
          updateGitHubUI();
          
          // Initialize GitHub Content API
          initGitHubStorage();
        }
      } else {
        console.error('GitHub authentication failed:', result.error);
        alert(`GitHub login failed: ${result.error}`);
      }
    }
  }
  
  // Initialize GitHub storage after successful authentication
  async function initGitHubStorage() {
    if (!GitHubOAuth.isAuthenticated()) {
      return false;
    }
    
    const token = GitHubOAuth.getToken();
    const username = localStorage.getItem('github_username');
    const repo = localStorage.getItem('github_repo');
    
    if (!token || !username || !repo) {
      return false;
    }
    
    console.log('Initializing GitHub storage...');
    
    try {
      // Initialize storage
      await GitHubContentStorage.init(token, username, repo);
      
      // Load events from GitHub
      const eventsResult = await GitHubContentStorage.getAllData('event');
      
      if (eventsResult.success && eventsResult.data.length > 0) {
        // Update events
        events = eventsResult.data;
        
        // Refresh calendar
        renderCalendar(currentViewMonth, currentViewYear);
        updateUpcomingEvents();
        
        console.log('Loaded events from GitHub:', events);
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing GitHub storage:', error);
      return false;
    }
  }
  
  // Call this function when the DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initGitHubLogin();
  });