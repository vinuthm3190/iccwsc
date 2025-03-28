// Data Management JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        // If not, should be initialized in firebase-config.js
        console.error("Firebase not initialized!");
        return;
    }

    // References
    const db = firebase.firestore();
    const auth = firebase.auth();

    // DOM Elements
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
    
    // Check auth state and update UI
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            updateAuthUI(true, user.email);
            
            // Load data
            loadUmpiringData();
            loadGamesData();
        } else {
            // User is signed out
            updateAuthUI(false);
        }
    });
    
    // Auth action click
    if (authAction) {
        authAction.addEventListener('click', function() {
            if (auth.currentUser) {
                // Logout
                auth.signOut().then(() => {
                    updateAuthUI(false);
                }).catch(error => {
                    console.error("Error signing out: ", error);
                    alert("Error signing out: " + error.message);
                });
            } else {
                // Show login form
                if (loginContainer) {
                    loginContainer.style.display = 'block';
                }
            }
        });
    }
    
    // Login form submit
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Successfully logged in
                    loginContainer.style.display = 'none';
                    loginForm.reset();
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                })
                .catch((error) => {
                    console.error("Login error:", error);
                    alert(`Login failed: ${error.message}`);
                    
                    // Reset button
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
        });
    }
    
    // Tab switching
    if (tabs && tabs.length > 0) {
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
    }
    
    // Close modals when clicking the X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            if (umpiringModal) umpiringModal.style.display = 'none';
            if (gameModal) gameModal.style.display = 'none';
            if (confirmModal) confirmModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (umpiringModal && e.target === umpiringModal) umpiringModal.style.display = 'none';
        if (gameModal && e.target === gameModal) gameModal.style.display = 'none';
        if (confirmModal && e.target === confirmModal) confirmModal.style.display = 'none';
    });
    
    // Cancel buttons
    if (umpiringCancel) {
        umpiringCancel.addEventListener('click', function() {
            umpiringModal.style.display = 'none';
        });
    }
    
    if (gameCancel) {
        gameCancel.addEventListener('click', function() {
            gameModal.style.display = 'none';
        });
    }
    
    if (confirmCancel) {
        confirmCancel.addEventListener('click', function() {
            confirmModal.style.display = 'none';
        });
    }
    
    // Add umpiring assignment button
    if (addUmpiringBtn) {
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
    }
    
    // Add game button
    if (addGameBtn) {
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
    }
    
    // Umpiring form submit
    if (umpiringForm) {
        umpiringForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = {
                date: document.getElementById('umpiring-date').value,
                time: document.getElementById('umpiring-time').value,
                ground: document.getElementById('umpiring-ground').value,
                team1: document.getElementById('umpiring-team1').value,
                team2: document.getElementById('umpiring-team2').value,
                umpire: document.getElementById('umpiring-umpire').value,
                player: document.getElementById('umpiring-player').value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Show loading state
            const submitBtn = umpiringForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            if (currentUmpiringId) {
                // Update existing assignment
                db.collection('umpiring_assignments').doc(currentUmpiringId).update(formData)
                    .then(() => {
                        umpiringModal.style.display = 'none';
                        loadUmpiringData();
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    })
                    .catch(error => {
                        console.error("Error updating document: ", error);
                        alert("Error updating assignment: " + error.message);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    });
            } else {
                // Add new assignment
                db.collection('umpiring_assignments').add(formData)
                    .then(() => {
                        umpiringModal.style.display = 'none';
                        loadUmpiringData();
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    })
                    .catch(error => {
                        console.error("Error adding document: ", error);
                        alert("Error adding assignment: " + error.message);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    });
            }
        });
    }
    
    // Game form submit
    if (gameForm) {
        gameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
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
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Show loading state
            const submitBtn = gameForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            if (currentGameId) {
                // Update existing game
                db.collection('games').doc(currentGameId).update(formData)
                    .then(() => {
                        gameModal.style.display = 'none';
                        loadGamesData();
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    })
                    .catch(error => {
                        console.error("Error updating document: ", error);
                        alert("Error updating game: " + error.message);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    });
            } else {
                // Add new game
                db.collection('games').add(formData)
                    .then(() => {
                        gameModal.style.display = 'none';
                        loadGamesData();
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    })
                    .catch(error => {
                        console.error("Error adding document: ", error);
                        alert("Error adding game: " + error.message);
                        
                        // Reset button
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    });
            }
        });
    }
    
    // Handle confirm delete
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            // Show loading state
            const originalText = confirmDelete.textContent;
            confirmDelete.disabled = true;
            confirmDelete.textContent = 'Deleting...';
            
            if (deleteType === 'umpiring' && itemToDelete) {
                db.collection('umpiring_assignments').doc(itemToDelete).delete()
                    .then(() => {
                        confirmModal.style.display = 'none';
                        loadUmpiringData();
                        
                        // Reset button
                        confirmDelete.disabled = false;
                        confirmDelete.textContent = originalText;
                    })
                    .catch(error => {
                        console.error("Error removing document: ", error);
                        alert("Error deleting assignment: " + error.message);
                        
                        // Reset button
                        confirmDelete.disabled = false;
                        confirmDelete.textContent = originalText;
                    });
            } else if (deleteType === 'game' && itemToDelete) {
                db.collection('games').doc(itemToDelete).delete()
                    .then(() => {
                        confirmModal.style.display = 'none';
                        loadGamesData();
                        
                        // Reset button
                        confirmDelete.disabled = false;
                        confirmDelete.textContent = originalText;
                    })
                    .catch(error => {
                        console.error("Error removing document: ", error);
                        alert("Error deleting game: " + error.message);
                        
                        // Reset button
                        confirmDelete.disabled = false;
                        confirmDelete.textContent = originalText;
                    });
            }
        });
    }
    
    // Search functionality
    if (umpiringSearch) {
        umpiringSearch.addEventListener('input', function() {
            renderUmpiringTable();
        });
    }
    
    if (gamesSearch) {
        gamesSearch.addEventListener('input', function() {
            renderGamesTable();
        });
    }
    
    // Functions
    function updateAuthUI(isLoggedIn, email = '') {
        if (!authIndicator || !authText || !authAction) return;
        
        if (isLoggedIn) {
            authIndicator.className = 'auth-indicator logged-in';
            authText.className = 'auth-text logged-in';
            authText.textContent = `Logged in as ${email}`;
            authAction.textContent = 'Logout';
            
            if (dataTabsContainer) {
                dataTabsContainer.style.display = 'block';
            }
            
            if (loginContainer) {
                loginContainer.style.display = 'none';
            }
        } else {
            authIndicator.className = 'auth-indicator logged-out';
            authText.className = 'auth-text logged-out';
            authText.textContent = 'Not logged in';
            authAction.textContent = 'Login';
            
            if (dataTabsContainer) {
                dataTabsContainer.style.display = 'none';
            }
        }
    }
    
    function loadUmpiringData() {
        if (!umpiringTable) return;
        
        // Add loading indicator
        umpiringTable.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                        <p>Loading data...</p>
                    </td>
                </tr>
            </tbody>
        `;
        
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
                
                // Show error message
                umpiringTable.innerHTML = `
                    <tbody>
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 2rem; color: var(--danger);">
                                <p>Error loading data: ${error.message}</p>
                                <button onclick="loadUmpiringData()" class="btn-control">Retry</button>
                            </td>
                        </tr>
                    </tbody>
                `;
            });
    }
    
    function loadGamesData() {
        if (!gamesTable) return;
        
        // Add loading indicator
        gamesTable.innerHTML = `
            <tbody>
                <tr>
                    <td colspan="10" style="text-align: center; padding: 2rem;">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                        </div>
                        <p>Loading data...</p>
                    </td>
                </tr>
            </tbody>
        `;
        
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
                
                // Show error message
                gamesTable.innerHTML = `
                    <tbody>
                        <tr>
                            <td colspan="10" style="text-align: center; padding: 2rem; color: var(--danger);">
                                <p>Error loading data: ${error.message}</p>
                                <button onclick="loadGamesData()" class="btn-control">Retry</button>
                            </td>
                        </tr>
                    </tbody>
                `;
            });
    }
    
    function renderUmpiringTable() {
        if (!umpiringTable || !window.umpiringData) return;
        
        const searchTerm = umpiringSearch ? umpiringSearch.value.toLowerCase() : '';
        
        // Filter data based on search term
        const filteredData = window.umpiringData.filter(item => 
            (item.date && item.date.toLowerCase().includes(searchTerm)) ||
            (item.ground && item.ground.toLowerCase().includes(searchTerm)) ||
            (item.team1 && item.team1.toLowerCase().includes(searchTerm)) ||
            (item.team2 && item.team2.toLowerCase().includes(searchTerm)) ||
            (item.umpire && item.umpire.toLowerCase().includes(searchTerm)) ||
            (item.player && item.player.toLowerCase().includes(searchTerm))
        );
        
        // Sort by date (newest first)
        filteredData.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return b.date.localeCompare(a.date);
        });
        
        // Create table HTML
        let tableHtml = '<tbody>';
        
        if (filteredData.length === 0) {
            tableHtml += `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 1rem;">
                        ${searchTerm ? 'No matching records found' : 'No records found. Add a new assignment.'}
                    </td>
                </tr>
            `;
        } else {
            filteredData.forEach(item => {
                tableHtml += `
                    <tr>
                        <td>${formatDate(item.date)}</td>
                        <td>${formatTime(item.time)}</td>
                        <td>${item.ground || '-'}</td>
                        <td>${item.team1 || '-'}</td>
                        <td>${item.team2 || '-'}</td>
                        <td>${item.umpire || '-'}</td>
                        <td>${item.player || '-'}</td>
                        <td>
                            <button class="btn-control btn-edit" data-id="${item.id}">Edit</button>
                            <button class="btn-control btn-delete" data-id="${item.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        tableHtml += '</tbody>';
        umpiringTable.innerHTML = tableHtml;
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('#umpiring-table .btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editUmpiringAssignment(id);
            });
        });
        
        document.querySelectorAll('#umpiring-table .btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteItem('umpiring', id);
            });
        });
    }
    
    function renderGamesTable() {
        if (!gamesTable || !window.gamesData) return;
        
        const searchTerm = gamesSearch ? gamesSearch.value.toLowerCase() : '';
        
        // Filter data based on search term
        const filteredData = window.gamesData.filter(item => 
            (item.team && item.team.toLowerCase().includes(searchTerm)) ||
            (item.opposition && item.opposition.toLowerCase().includes(searchTerm)) ||
            (item.type && item.type.toLowerCase().includes(searchTerm)) ||
            (item.date && item.date.toLowerCase().includes(searchTerm)) ||
            (item.ground && item.ground.toLowerCase().includes(searchTerm)) ||
            (item.result && item.result.toLowerCase().includes(searchTerm))
        );
        
        // Sort by date (newest first)
        filteredData.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return b.date.localeCompare(a.date);
        });
        
        // Create table HTML
        let tableHtml = '<tbody>';
        
        if (filteredData.length === 0) {
            tableHtml += `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 1rem;">
                        ${searchTerm ? 'No matching records found' : 'No records found. Add a new game.'}
                    </td>
                </tr>
            `;
        } else {
            filteredData.forEach(item => {
                tableHtml += `
                    <tr>
                        <td>${item.team || '-'}</td>
                        <td>${item.opposition || '-'}</td>
                        <td>${item.type || '-'}</td>
                        <td>${formatDate(item.date)}</td>
                        <td>${formatTime(item.time)}</td>
                        <td>${item.umpire || '-'}</td>
                        <td>${item.ground || '-'}</td>
                        <td>${item.result || '-'}</td>
                        <td>${item.points !== undefined ? item.points : '-'}</td>
                        <td>
                            <button class="btn-control btn-edit" data-id="${item.id}">Edit</button>
                            <button class="btn-control btn-delete" data-id="${item.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
        
        tableHtml += '</tbody>';
        gamesTable.innerHTML = tableHtml;
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('#games-table .btn-edit').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editGame(id);
            });
        });
        
        document.querySelectorAll('#games-table .btn-delete').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteItem('game', id);
            });
        });
    }
    
    function editUmpiringAssignment(id) {
        if (!umpiringModal || !umpiringForm) return;
        
        const item = window.umpiringData.find(item => item.id === id);
        if (!item) return;
        
        currentUmpiringId = id;
        document.getElementById('umpiring-modal-title').textContent = 'Edit Umpiring Assignment';
        document.getElementById('umpiring-date').value = item.date || '';
        document.getElementById('umpiring-time').value = item.time || '';
        document.getElementById('umpiring-ground').value = item.ground || '';
        document.getElementById('umpiring-team1').value = item.team1 || '';
        document.getElementById('umpiring-team2').value = item.team2 || '';
        document.getElementById('umpiring-umpire').value = item.umpire || '';
        document.getElementById('umpiring-player').value = item.player || '';
        
        umpiringModal.style.display = 'block';
    }
    
    function editGame(id) {
        if (!gameModal || !gameForm) return;
        
        const item = window.gamesData.find(item => item.id === id);
        if (!item) return;
        
        currentGameId = id;
        document.getElementById('game-modal-title').textContent = 'Edit Game';
        document.getElementById('game-team').value = item.team || '';
        document.getElementById('game-opposition').value = item.opposition || '';
        document.getElementById('game-type').value = item.type || 'League';
        document.getElementById('game-date').value = item.date || '';
        document.getElementById('game-time').value = item.time || '';
        document.getElementById('game-umpire').value = item.umpire || '';
        document.getElementById('game-ground').value = item.ground || '';
        document.getElementById('game-result').value = item.result || '';
        document.getElementById('game-points').value = item.points !== undefined ? item.points : '';
        
        gameModal.style.display = 'block';
    }
    
    function deleteItem(type, id) {
        if (!confirmModal) return;
        
        deleteType = type;
        itemToDelete = id;
        
        // Set message based on type
        const message = type === 'umpiring' 
            ? 'Are you sure you want to delete this umpiring assignment?' 
            : 'Are you sure you want to delete this game?';
            
        document.querySelector('#confirm-modal p').textContent = message + ' This action cannot be undone.';
        
        confirmModal.style.display = 'block';
    }
    
    function formatDate(dateString) {
        if (!dateString) return '-';
        
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString;
        }
    }
    
    function formatTime(timeString) {
        if (!timeString) return '-';
        
        try {
            // Handle different time formats
            let hours, minutes;
            
            if (timeString.includes(':')) {
                [hours, minutes] = timeString.split(':');
            } else if (timeString.length === 4) {
                hours = timeString.substring(0, 2);
                minutes = timeString.substring(2);
            } else {
                return timeString;
            }
            
            const date = new Date();
            date.setHours(Number(hours));
            date.setMinutes(Number(minutes));
            
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return timeString;
        }
    }
});