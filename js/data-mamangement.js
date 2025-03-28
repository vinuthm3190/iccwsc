document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Firebase configuration - REPLACE WITH YOUR CONFIG
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // DOM Elements
    const loadingSpinner = document.getElementById('loading-spinner');
    const authStatusContainer = document.getElementById('auth-status-container');
    const authIndicator = document.getElementById('auth-indicator');
    const authText = document.getElementById('auth-text');
    const authAction = document.getElementById('auth-action');
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const dataTabsContainer = document.getElementById('data-tabs-container');
    
    // Tabs
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Umpiring Assignments
    const umpiringTable = document.getElementById('umpiring-table');
    const umpiringSearch = document.getElementById('umpiring-search');
    const addUmpiringBtn = document.getElementById('add-umpiring-btn');
    const umpiringModal = document.getElementById('umpiring-modal');
    const umpiringForm = document.getElementById('umpiring-form');
    const umpiringCancel = document.getElementById('umpiring-cancel');
    
    // Games
    const gamesTable = document.getElementById('games-table');
    const gamesSearch = document.getElementById('games-search');
    const addGameBtn = document.getElementById('add-game-btn');
    const gameModal = document.getElementById('game-modal');
    const gameForm = document.getElementById('game-form');
    const gameCancel = document.getElementById('game-cancel');
    
    // Confirmation Modal
    const confirmModal = document.getElementById('confirm-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmDelete = document.getElementById('confirm-delete');
    
    // Variables for editing and deleting
    let currentUmpiringId = null;
    let currentGameId = null;
    let itemToDelete = null;
    let deleteType = null;
    
    // Hide loading spinner and show auth container
    loadingSpinner.style.display = 'none';
    authStatusContainer.style.display = 'block';
    
    // Check if user is logged in
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            authIndicator.className = 'auth-indicator logged-in';
            authText.className = 'auth-text logged-in';
            authText.textContent = `Logged in as ${user.email}`;
            authAction.textContent = 'Logout';
            loginContainer.style.display = 'none';
            dataTabsContainer.style.display = 'block';
            
            // Load data
            loadUmpiringData();
            loadGamesData();
        } else {
            // User is signed out
            authIndicator.className = 'auth-indicator logged-out';
            authText.className = 'auth-text logged-out';
            authText.textContent = 'Not logged in';
            authAction.textContent = 'Login';
            dataTabsContainer.style.display = 'none';
        }
    });
    
    // Login/Logout action
    authAction.addEventListener('click', function() {
        if (authAction.textContent === 'Logout') {
            // Sign out
            auth.signOut().then(() => {
                console.log('User signed out');
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        } else {
            // Show login form
            loginContainer.style.display = 'block';
        }
    });
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading spinner
        loadingSpinner.style.display = 'flex';
        loginContainer.style.display = 'none';
        
        // Sign in with email and password
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Successful login
                console.log('User logged in:', userCredential.user);
                loginForm.reset();
                loadingSpinner.style.display = 'none';
            })
            .catch((error) => {
                // Login failed
                console.error('Login error:', error);
                alert(`Login failed: ${error.message}`);
                loadingSpinner.style.display = 'none';
                loginContainer.style.display = 'block';
            });
    });
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Close modals when clicking the X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            umpiringModal.style.display = 'none';
            gameModal.style.display = 'none';
            confirmModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === umpiringModal) umpiringModal.style.display = 'none';
        if (e.target === gameModal) gameModal.style.display = 'none';
        if (e.target === confirmModal) confirmModal.style.display = 'none';
    });
    
    // Cancel buttons
    umpiringCancel.addEventListener('click', function() {
        umpiringModal.style.display = 'none';
    });
    
    gameCancel.addEventListener('click', function() {
        gameModal.style.display = 'none';
    });
    
    confirmCancel.addEventListener('click', function() {
        confirmModal.style.display = 'none';
    });
    
    // Add umpiring assignment button
    addUmpiringBtn.addEventListener('click', function() {
        // Reset form for new entry
        umpiringForm.reset();
        currentUmpiringId = null;
        document.getElementById('umpiring-modal-title').textContent = 'Add Umpiring Assignment';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('umpiring-date').value = today;
        
        umpiringModal.style.display = 'block';
    });
    
    // Add game button
    addGameBtn.addEventListener('click', function() {
        // Reset form for new entry
        gameForm.reset();
        currentGameId = null;
        document.getElementById('game-modal-title').textContent = 'Add Game';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('game-date').value = today;
        
        gameModal.style.display = 'block';
    });
    
    // Umpiring form submit
    umpiringForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            date: document.getElementById('umpiring-date').value,
            time: document.getElementById('umpiring-time').value,
            ground: document.getElementById('umpiring-ground').value,
            team1: document.getElementById('umpiring-team1').value,
            team2: document.getElementById('umpiring-team2').value,
            umpire: document.getElementById('umpiring-umpire').value,
            player: document.getElementById('umpiring-player').value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentUmpiringId) {
            // Update existing assignment
            db.collection('umpiring_assignments').doc(currentUmpiringId).update(formData)
                .then(() => {
                    umpiringModal.style.display = 'none';
                    loadUmpiringData();
                })
                .catch(error => {
                    console.error("Error updating document: ", error);
                    alert("Error updating assignment. Please try again.");
                });
        } else {
            // Add new assignment
            db.collection('umpiring_assignments').add(formData)
                .then(() => {
                    umpiringModal.style.display = 'none';
                    loadUmpiringData();
                })
                .catch(error => {
                    console.error("Error adding document: ", error);
                    alert("Error adding assignment. Please try again.");
                });
        }
    });
    
    // Game form submit
    gameForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            team: document.getElementById('game-team').value,
            opposition: document.getElementById('game-opposition').value,
            type: document.getElementById('game-type').value,
            date: document.getElementById('game-date').value,
            time: document.getElementById('game-time').value,
            umpire: document.getElementById('game-umpire').value,
            ground: document.getElementById('game-ground').value,
            result: document.getElementById('game-result').value || '',
            points: parseInt(document.getElementById('game-points').value) || 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (currentGameId) {
            // Update existing game
            db.collection('games').doc(currentGameId).update(formData)
                .then(() => {
                    gameModal.style.display = 'none';
                    loadGamesData();
                })
                .catch(error => {
                    console.error("Error updating document: ", error);
                    alert("Error updating game. Please try again.");
                });
        } else {
            // Add new game
            db.collection('games').add(formData)
                .then(() => {
                    gameModal.style.display = 'none';
                    loadGamesData();
                })
                .catch(error => {
                    console.error("Error adding document: ", error);
                    alert("Error adding game. Please try again.");
                });
        }
    });
    
    // Handle confirm delete
    confirmDelete.addEventListener('click', function() {
        if (deleteType === 'umpiring' && itemToDelete) {
            db.collection('umpiring_assignments').doc(itemToDelete).delete()
                .then(() => {
                    confirmModal.style.display = 'none';
                    loadUmpiringData();
                })
                .catch(error => {
                    console.error("Error removing document: ", error);
                    alert("Error deleting assignment. Please try again.");
                });
        } else if (deleteType === 'game' && itemToDelete) {
            db.collection('games').doc(itemToDelete).delete()
                .then(() => {
                    confirmModal.style.display = 'none';
                    loadGamesData();
                })
                .catch(error => {
                    console.error("Error removing document: ", error);
                    alert("Error deleting game. Please try again.");
                });
        }
    });
    
    // Search functionality
    umpiringSearch.addEventListener('input', function() {
        renderUmpiringTable();
    });
    
    gamesSearch.addEventListener('input', function() {
        renderGamesTable();
    });
    
    // Load umpiring data
    function loadUmpiringData() {
        db.collection('umpiring_assignments')
            .orderBy('date', 'desc')
            .get()
            .then((querySnapshot) => {
                window.umpiringData = [];
                querySnapshot.forEach((doc) => {
                    window.umpiringData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                renderUmpiringTable();
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    }
    
    // Load games data
    function loadGamesData() {
        db.collection('games')
            .orderBy('date', 'desc')
            .get()
            .then((querySnapshot) => {
                window.gamesData = [];
                querySnapshot.forEach((doc) => {
                    window.gamesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                renderGamesTable();
            })
            .catch((error) => {
                console.error("Error getting documents: ", error);
            });
    }
    
    // Render umpiring table
    function renderUmpiringTable() {
        const searchTerm = umpiringSearch.value.toLowerCase();
        const tbody = umpiringTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Filter data based on search term
        const filteredData = window.umpiringData ? window.umpiringData.filter(item => 
            (item.date && item.date.toLowerCase().includes(searchTerm)) ||
            (item.ground && item.ground.toLowerCase().includes(searchTerm)) ||
            (item.team1 && item.team1.toLowerCase().includes(searchTerm)) ||
            (item.team2 && item.team2.toLowerCase().includes(searchTerm)) ||
            (item.umpire && item.umpire.toLowerCase().includes(searchTerm)) ||
            (item.player && item.player.toLowerCase().includes(searchTerm))
        ) : [];
        
        if (filteredData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" style="text-align: center;">No records found</td>';
            tbody.appendChild(row);
            return;
        }
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(item.date)}</td>
                <td>${formatTime(item.time)}</td>
                <td>${item.ground}</td>
                <td>${item.team1}</td>
                <td>${item.team2}</td>
                <td>${item.umpire}</td>
                <td>${item.player}</td>
                <td>
                    <button class="btn-control btn-edit">Edit</button>
                    <button class="btn-control btn-delete">Delete</button>
                </td>
            `;
            
            // Add event listeners for edit and delete buttons
            row.querySelector('.btn-edit').addEventListener('click', function() {
                editUmpiringAssignment(item.id);
            });
            
            row.querySelector('.btn-delete').addEventListener('click', function() {
                deleteItem('umpiring', item.id);
            });
            
            tbody.appendChild(row);
        });
    }
    
    // Render games table
    function renderGamesTable() {
        const searchTerm = gamesSearch.value.toLowerCase();
        const tbody = gamesTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Filter data based on search term
        const filteredData = window.gamesData ? window.gamesData.filter(item => 
            (item.team && item.team.toLowerCase().includes(searchTerm)) ||
            (item.opposition && item.opposition.toLowerCase().includes(searchTerm)) ||
            (item.type && item.type.toLowerCase().includes(searchTerm)) ||
            (item.date && item.date.toLowerCase().includes(searchTerm)) ||
            (item.ground && item.ground.toLowerCase().includes(searchTerm)) ||
            (item.result && item.result.toLowerCase().includes(searchTerm))
        ) : [];
        
        if (filteredData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="10" style="text-align: center;">No records found</td>';
            tbody.appendChild(row);
            return;
        }
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.team}</td>
                <td>${item.opposition}</td>
                <td>${item.type}</td>
                <td>${formatDate(item.date)}</td>
                <td>${formatTime(item.time)}</td>
                <td>${item.umpire}</td>
                <td>${item.ground}</td>
                <td>${item.result || '-'}</td>
                <td>${item.points || '0'}</td>
                <td>
                    <button class="btn-control btn-edit">Edit</button>
                    <button class="btn-control btn-delete">Delete</button>
                </td>
            `;
            
            // Add event listeners for edit and delete buttons
            row.querySelector('.btn-edit').addEventListener('click', function() {
                editGame(item.id);
            });
            
            row.querySelector('.btn-delete').addEventListener('click', function() {
                deleteItem('game', item.id);
            });
            
            tbody.appendChild(row);
        });
    }
    
    // Edit umpiring assignment
    function editUmpiringAssignment(id) {
        const item = window.umpiringData.find(item => item.id === id);
        if (!item) return;
        
        currentUmpiringId = id;
        document.getElementById('umpiring-modal-title').textContent = 'Edit Umpiring Assignment';
        document.getElementById('umpiring-date').value = item.date;
        document.getElementById('umpiring-time').value = item.time;
        document.getElementById('umpiring-ground').value = item.ground;
        document.getElementById('umpiring-team1').value = item.team1;
        document.getElementById('umpiring-team2').value = item.team2;
        document.getElementById('umpiring-umpire').value = item.umpire;
        document.getElementById('umpiring-player').value = item.player;
        
        umpiringModal.style.display = 'block';
    }
    
    // Edit game
    function editGame(id) {
        const item = window.gamesData.find(item => item.id === id);
        if (!item) return;
        
        currentGameId = id;
        document.getElementById('game-modal-title').textContent = 'Edit Game';
        document.getElementById('game-team').value = item.team;
        document.getElementById('game-opposition').value = item.opposition;
        document.getElementById('game-type').value = item.type;
        document.getElementById('game-date').value = item.date;
        document.getElementById('game-time').value = item.time;
        document.getElementById('game-umpire').value = item.umpire;
        document.getElementById('game-ground').value = item.ground;
        document.getElementById('game-result').value = item.result || '';
        document.getElementById('game-points').value = item.points || '';
        
        gameModal.style.display = 'block';
    }
    
    // Delete item
    function deleteItem(type, id) {
        deleteType = type;
        itemToDelete = id;
        confirmModal.style.display = 'block';
    }
    
    // Format date
    function formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString;
        }
    }
    
    // Format time
    function formatTime(timeString) {
        if (!timeString) return '';
        
        try {
            const [hours, minutes] = timeString.split(':');
            const date = new Date();
            date.setHours(Number(hours));
            date.setMinutes(Number(minutes));
            
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    }
});