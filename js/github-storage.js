// GitHub Content Storage API
// Handles data storage in GitHub repository files

/**
 * This file contains the implementation for storing data
 * in a GitHub repository using the GitHub Content API.
 */

const GitHubContentStorage = {
    // Configuration
    owner: '',
    repo: '',
    dataFolder: 'data',
    authToken: null,
    
    // API base URL
    baseUrl: 'https://api.github.com',
    
    // Initialize with authentication token and repository info
    init: async function(token, owner, repo) {
      this.authToken = token;
      this.owner = owner || localStorage.getItem('github_username');
      this.repo = repo || localStorage.getItem('github_repo');
      
      if (!this.authToken || !this.owner || !this.repo) {
        console.error('GitHub Content Storage initialization failed: Missing configuration');
        return false;
      }
      
      try {
        await this._ensureDataFolder();
        console.log('GitHub Content Storage initialized successfully');
        return true;
      } catch (error) {
        console.error('GitHub Content Storage initialization failed:', error);
        return false;
      }
    },
    
    // Get request headers with authentication
    getHeaders: function() {
      return {
        'Authorization': `token ${this.authToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      };
    },
    
    // Create the data folder if it doesn't exist
    _ensureDataFolder: async function() {
      try {
        // Check if the data folder exists
        const response = await fetch(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.dataFolder}`,
          { headers: this.getHeaders() }
        );
        
        // If it doesn't exist (404), create it with a README.md file
        if (response.status === 404) {
          console.log('Data folder not found, creating it...');
          
          const createResponse = await fetch(
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.dataFolder}/README.md`,
            {
              method: 'PUT',
              headers: this.getHeaders(),
              body: JSON.stringify({
                message: 'Create data folder for ICCWSC web app',
                content: btoa('# Data Folder\nThis folder contains data for the ICCWSC web application.')
              })
            }
          );
          
          if (!createResponse.ok) {
            const error = await createResponse.json();
            throw new Error(`Failed to create data folder: ${error.message || 'Unknown error'}`);
          }
          
          console.log('Data folder created successfully');
        } else if (!response.ok) {
          throw new Error(`Error checking data folder: ${response.status}`);
        } else {
          console.log('Data folder already exists');
        }
        
        return true;
      } catch (error) {
        console.error('Error ensuring data folder exists:', error);
        throw error;
      }
    },
    
    // Save data to a file in the repository
    saveData: async function(dataType, id, data) {
      if (!this.authToken) {
        return { success: false, error: 'Not authenticated' };
      }
      
      try {
        const fileName = `${this.dataFolder}/${dataType}-${id}.json`;
        const content = btoa(JSON.stringify(data, null, 2)); // Convert to base64
        
        // Check if the file already exists to get its SHA
        let sha;
        try {
          const fileResponse = await fetch(
            `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${fileName}`,
            { headers: this.getHeaders() }
          );
          
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            sha = fileData.sha;
          }
        } catch (error) {
          // File doesn't exist yet, which is fine
          console.log(`File ${fileName} doesn't exist yet, will create it`);
        }
        
        // Create or update the file
        const saveResponse = await fetch(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${fileName}`,
          {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify({
              message: `Update ${dataType} data for ID ${id}`,
              content: content,
              sha: sha // Include SHA if updating an existing file
            })
          }
        );
        
        if (!saveResponse.ok) {
          const error = await saveResponse.json();
          throw new Error(`Failed to save data: ${error.message || 'Unknown error'}`);
        }
        
        const result = await saveResponse.json();
        console.log(`Data saved successfully to ${fileName}`);
        
        return { success: true, data: result };
      } catch (error) {
        console.error('Error saving data:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Get a specific data file
    getData: async function(dataType, id) {
      if (!this.authToken) {
        return { success: false, error: 'Not authenticated' };
      }
      
      try {
        const fileName = `${this.dataFolder}/${dataType}-${id}.json`;
        
        const response = await fetch(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${fileName}`,
          { headers: this.getHeaders() }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to get data: ${response.status}`);
        }
        
        const fileData = await response.json();
        const content = JSON.parse(atob(fileData.content)); // Decode from base64
        
        return { 
          success: true, 
          data: content,
          meta: {
            sha: fileData.sha,
            path: fileData.path,
            url: fileData.html_url
          }
        };
      } catch (error) {
        console.error('Error getting data:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Get all data files of a specific type
    getAllData: async function(dataType) {
      if (!this.authToken) {
        return { success: false, error: 'Not authenticated' };
      }
      
      try {
        // Get list of files in the data folder
        const response = await fetch(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${this.dataFolder}`,
          { headers: this.getHeaders() }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to list data folder: ${response.status}`);
        }
        
        const files = await response.json();
        
        // Filter files by data type
        const dataFiles = files.filter(file => 
          file.type === 'file' && 
          file.name.startsWith(`${dataType}-`) && 
          file.name.endsWith('.json')
        );
        
        if (dataFiles.length === 0) {
          return { success: true, data: [] };
        }
        
        // Fetch content of each file
        const dataPromises = dataFiles.map(async file => {
          const contentResponse = await fetch(file.download_url);
          if (!contentResponse.ok) {
            throw new Error(`Failed to download ${file.path}: ${contentResponse.status}`);
          }
          return await contentResponse.json();
        });
        
        const dataItems = await Promise.all(dataPromises);
        return { success: true, data: dataItems };
      } catch (error) {
        console.error('Error getting all data:', error);
        return { success: false, error: error.message };
      }
    },
    
    // Delete a data file
    deleteData: async function(dataType, id) {
      if (!this.authToken) {
        return { success: false, error: 'Not authenticated' };
      }
      
      try {
        const fileName = `${this.dataFolder}/${dataType}-${id}.json`;
        
        // Get the file to get its SHA
        const fileResponse = await fetch(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${fileName}`,
          { headers: this.getHeaders() }
        );
        
        if (!fileResponse.ok) {
          throw new Error(`File not found: ${fileResponse.status}`);
        }
        
        const fileData = await fileResponse.json();
        
        // Delete the file
        const deleteResponse = await fetch(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${fileName}`,
          {
            method: 'DELETE',
            headers: this.getHeaders(),
            body: JSON.stringify({
              message: `Delete ${dataType} data for ID ${id}`,
              sha: fileData.sha
            })
          }
        );
        
        if (!deleteResponse.ok) {
          const error = await deleteResponse.json();
          throw new Error(`Failed to delete data: ${error.message || 'Unknown error'}`);
        }
        
        console.log(`Data deleted successfully from ${fileName}`);
        return { success: true };
      } catch (error) {
        console.error('Error deleting data:', error);
        return { success: false, error: error.message };
      }
    }
  };
  
  // Export to window for global access
  window.GitHubContentStorage = GitHubContentStorage;