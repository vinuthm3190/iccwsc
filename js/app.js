// Sample user data (in a real app, this would come from a backend)
const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', password: 'password123', bio: '' }
];

// Sample events
let events = [
    { id: 1, title: 'Club Meeting', date: '2025-03-15', time: '18:00', description: 'Regular weekly meeting' },
    { id: 2, title: 'Workshop', date: '2025-03-20', time: '14:00', description: 'Skills development workshop' },
    { id: 3, title: 'Social Event', date: '2025-03-25', time: '19:00', description: 'Networking and social gathering' }
];

// Current logged in user
let currentUser = null;

// GitHub integration settings
let useGitHubStorage = false;

// Current view month and year
let currentViewMonth = new Date().getMonth();
let currentViewYear = new Date().getFullYear();

// Document ready
$(document).ready(function() {
    // Check if user is already logged in (from localStorage in a real app)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }

    // Navigation
    $('.nav-menu a').click(function(e) {
        e.preventDefault();
        const target = $(this).data('target');
        if (target) {
            navigateTo(target);
        }
        });
    });

    // Switch between login and register forms
    $('#register-link').click(function(e) {
        e.preventDefault();
        $('#login-form').hide();
        $('#register-form').show();
    });

    $('#login-link').click(function(e) {
        e.preventDefault();
        $('#register-form').hide();
        $('#login-form').show();
    });

    // Login form submission
    $('#login').submit(function(e) {
        e.preventDefault();
        const email = $('#login-email').val();
        const password = $('#login-password').val();
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            // Save to localStorage in a real app
            localStorage.setItem('currentUser', JSON.stringify(user));
            showDashboard();
        } else {
            alert('Invalid email or password.');
        }
    });

    // Register form submission
    $('#register').submit(function(e) {
        e.preventDefault();
        const name = $('#reg-name').val();
        const email = $('#reg-email').val();
        const password = $('#reg-password').val();
        const confirmPassword = $('#reg-confirm-password').val();
        
        // Validation
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            alert('Email already exists.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            bio: ''
        };
        
        users.push(newUser);
        currentUser = newUser;
        
        // Save to localStorage in a real app
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showDashboard();
    });

    // Logout
    $('#logout-btn').click(function(e) {
        e.preventDefault();
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLoginForm();
    });

    // Add event button
    $('#add-event-btn').click(function() {
        // Reset form
        $('#event-form')[0].reset();
        $('#event-date').val(formatDate(new Date()));
        $('#modal-title').text('Add New Event');
        $('#event-modal').css('display', 'flex');
    });

    // Close modal
    $('#close-modal, #event-cancel').click(function() {
        $('#event-modal').hide();
    });

    // Month navigation
    $('#prev-month').click(function() {
        currentViewMonth--;
        if (currentViewMonth < 0) {
            currentViewMonth = 11;
            currentViewYear--;
        }
        renderCalendar(currentViewMonth, currentViewYear);
    });

    $('#next-month').click(function() {
        currentViewMonth++;
        if (currentViewMonth > 11) {
            currentViewMonth = 0;
            currentViewYear++;
        }
        renderCalendar(currentViewMonth, currentViewYear);
    });

    // Save profile
    $('#save-profile').click(function() {
        if (currentUser) {
            currentUser.name = $('#profile-name').val();
            currentUser.bio = $('#profile-bio').val();
            
            // Update in users array
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
            }
            
            // Save to localStorage in a real app
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            $('#user-name').text(currentUser.name);
            alert('Profile updated successfully.');
        }
    });
    
    // Save event with GitHub integration
    $('#event-save').click(async function() {
        const title = $('#event-title').val();
        const date = $('#event-date').val();
        const time = $('#event-time').val();
        const description = $('#event-description').val();
        
        if (!title || !date || !time) {
            alert('Please fill in required fields.');
            return;
        }
        
        const newEvent = {
            id: Date.now(), // Use timestamp as ID for uniqueness
            title: title,
            date: date,
            time: time,
            description: description,
            created_at: new Date().toISOString()
        };
        
        // Save to GitHub if authenticated
        if (useGitHubStorage && GitHubOAuth.isAuthenticated()) {
            try {
                const eventId = `${newEvent.id}`;
                console.log(`Saving event ${eventId} to GitHub...`);
                
                const saveResult = await GitHubContentStorage.saveData('event', eventId, newEvent);
                
                if (saveResult.success) {
                    console.log(`Event saved to GitHub successfully: ${eventId}`);
                } else {
                    console.error(`Failed to save event to GitHub: ${saveResult.error}`);
                }
            } catch (error) {
                console.error('Error saving event to GitHub:', error);
            }
        }
        
        // Add to local events array
        events.push(newEvent);
        
        // Close modal and update UI
        $('#event-modal').hide();
        renderCalendar(currentViewMonth, currentViewYear);
        updateUpcomingEvents();
    });