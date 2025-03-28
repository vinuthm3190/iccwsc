document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Firebase configuration - REPLACE WITH YOUR CONFIG
    const firebaseConfig = {
        apiKey: "AIzaSyAKpu8ZOspBdgvT0OuMQ3UjPOQFJNb30Qg",
        authDomain: "iccwsc.firebaseapp.com",
        projectId: "iccwsc",
        storageBucket: "iccwsc.firebasestorage.app",
        messagingSenderId: "493299224859",
        appId: "1:493299224859:web:c28433ada539187b3a03be"
      };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    // DOM Elements
    const loadingSpinner = document.getElementById('loading-spinner');
    const contentContainer = document.getElementById('content-container');
    const leagueTabs = document.getElementById('league-tabs');
    const leagueContentContainer = document.getElementById('league-content-container');
    const teamContentContainer = document.getElementById('team-content-container');
    
    // League and team data
    let leaguesData = [];
    let teamsData = [];
    let activeLeague = null;
    let activeTeam = null;
    
    // Load data from Firebase
    async function loadData() {
        try {
            // Load leagues
            const leaguesSnapshot = await db.collection('leagues').orderBy('name').get();
            leaguesData = [];
            leaguesSnapshot.forEach(doc => {
                leaguesData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // If no leagues in database, add sample leagues
            if (leaguesData.length === 0) {
                await addSampleLeagues();
                // Reload leagues
                const reloadedLeaguesSnapshot = await db.collection('leagues').orderBy('name').get();
                leaguesData = [];
                reloadedLeaguesSnapshot.forEach(doc => {
                    leaguesData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }
            
            // Load teams
            const teamsSnapshot = await db.collection('teams').orderBy('name').get();
            teamsData = [];
            teamsSnapshot.forEach(doc => {
                teamsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // If no teams in database, add sample teams
            if (teamsData.length === 0) {
                await addSampleTeams();
                // Reload teams
                const reloadedTeamsSnapshot = await db.collection('teams').orderBy('name').get();
                teamsData = [];
                reloadedTeamsSnapshot.forEach(doc => {
                    teamsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }
            
            // Render UI
            renderLeagueTabs();
            
            // Hide loading spinner and show content
            loadingSpinner.style.display = 'none';
            contentContainer.style.display = 'block';
            
        } catch (error) {
            console.error("Error loading data: ", error);
            alert("Error loading data. Please check your Firebase configuration.");
        }
    }
    
    // Add sample leagues if none exist
    async function addSampleLeagues() {
        const sampleLeagues = [
            {
                name: 'ARCL',
                fullName: 'Atlanta Recreational Cricket League',
                season: '2023',
                description: 'The premier cricket league in Atlanta area'
            },
            {
                name: 'NWCL',
                fullName: 'Northwest Cricket League',
                season: '2023',
                description: 'Competitive cricket league in the Northwest region'
            }
        ];
        
        const batch = db.batch();
        
        sampleLeagues.forEach(league => {
            const docRef = db.collection('leagues').doc();
            batch.set(docRef, league);
        });
        
        return batch.commit();
    }
    
    // Add sample teams if none exist
    async function addSampleTeams() {
        // First, get league IDs
        const leaguesSnapshot = await db.collection('leagues').get();
        const leagues = {};
        leaguesSnapshot.forEach(doc => {
            leagues[doc.data().name] = doc.id;
        });
        
        const sampleTeams = [
            {
                name: 'CerealKillers',
                leagueId: leagues['ARCL'] || '',
                position: 4,
                matches: 14,
                wins: 8,
                losses: 6,
                points: 16,
                netRunRate: '+1.234',
                logoUrl: 'assets/images/cereal-killers.jpg'
            },
            {
                name: 'Royal Strikers',
                leagueId: leagues['ARCL'] || '',
                position: 2,
                matches: 14,
                wins: 10,
                losses: 4,
                points: 20,
                netRunRate: '+1.876',
                logoUrl: 'assets/images/royal-strikers.jpg'
            },
            {
                name: 'Thunder Kings',
                leagueId: leagues['ARCL'] || '',
                position: 1,
                matches: 14,
                wins: 12,
                losses: 2,
                points: 24,
                netRunRate: '+2.345',
                logoUrl: 'assets/images/thunder-kings.jpg'
            },
            {
                name: 'Phoenix Flames',
                leagueId: leagues['NWCL'] || '',
                position: 3,
                matches: 12,
                wins: 7,
                losses: 5,
                points: 14,
                netRunRate: '+0.954',
                logoUrl: 'assets/images/phoenix-flames.jpg'
            },
            {
                name: 'Tigers XI',
                leagueId: leagues['NWCL'] || '',
                position: 5,
                matches: 12,
                wins: 5,
                losses: 7,
                points: 10,
                netRunRate: '+0.325',
                logoUrl: 'assets/images/tigers-xi.jpg'
            },
            {
                name: 'Super Kings',
                leagueId: leagues['NWCL'] || '',
                position: 6,
                matches: 12,
                wins: 4,
                losses: 8,
                points: 8,
                netRunRate: '-0.125',
                logoUrl: 'assets/images/super-kings.jpg'
            }
        ];
        
        const batch = db.batch();
        
        sampleTeams.forEach(team => {
            const docRef = db.collection('teams').doc();
            batch.set(docRef, team);
        });
        
        // Add some sample player stats for CerealKillers
        const batsmen = [
            {
                name: 'John Smith',
                teamId: '',  // Will be filled in
                matches: 14,
                innings: 14,
                runs: 487,
                average: 40.58,
                strikeRate: 135.27,
                highest: 89,
                fifties: 4,
                hundreds: 0
            },
            {
                name: 'Michael Johnson',
                teamId: '',  // Will be filled in
                matches: 12,
                innings: 12,
                runs: 354,
                average: 32.18,
                strikeRate: 128.94,
                highest: 76,
                fifties: 3,
                hundreds: 0
            }
        ];
        
        return batch.commit().then(async () => {
            // Get the CerealKillers team ID
            const cerealKillersSnapshot = await db.collection('teams')
                .where('name', '==', 'CerealKillers')
                .get();
            
            if (!cerealKillersSnapshot.empty) {
                const cerealKillersId = cerealKillersSnapshot.docs[0].id;
                
                // Add batting stats
                const statsBatch = db.batch();
                
                batsmen.forEach(batsman => {
                    batsman.teamId = cerealKillersId;
                    const docRef = db.collection('battingStats').doc();
                    statsBatch.set(docRef, batsman);
                });
                
                return statsBatch.commit();
            }
        });
    }
    
    // Render league tabs
    function renderLeagueTabs() {
        leagueTabs.innerHTML = '';
        leagueContentContainer.innerHTML = '';
        teamContentContainer.innerHTML = '';
        
        leaguesData.forEach((league, index) => {
            // Create league tab
            const leagueTab = document.createElement('div');
            leagueTab.className = `league-tab ${index === 0 ? 'active' : ''}`;
            leagueTab.dataset.leagueId = league.id;
            leagueTab.textContent = `${league.name} (${league.fullName})`;
            leagueTabs.appendChild(leagueTab);
            
            // Create league content container
            const leagueContent = document.createElement('div');
            leagueContent.className = `league-content ${index === 0 ? 'active' : ''}`;
            leagueContent.id = `league-${league.id}`;
            
            // Add league heading
            const leagueHeading = document.createElement('h3');
            leagueHeading.textContent = 'Select a Team';
            leagueContent.appendChild(leagueHeading);
            
            // Create team selector
            const teamSelector = document.createElement('div');
            teamSelector.className = 'team-selector';
            
            // Filter teams for this league
            const leagueTeams = teamsData.filter(team => team.leagueId === league.id);
            
            // Sort teams by position
            leagueTeams.sort((a, b) => a.position - b.position);
            
            leagueTeams.forEach((team, teamIndex) => {
                const teamCard = document.createElement('div');
                teamCard.className = `team-card ${index === 0 && teamIndex === 0 ? 'active' : ''}`;
                teamCard.dataset.teamId = team.id;
                
                teamCard.innerHTML = `
                    <img src="${team.logoUrl}" alt="${team.name} Logo" onerror="this.src='assets/images/team-placeholder.jpg'">
                    <h3>${team.name}</h3>
                    <p>Position: ${team.position}${getPositionSuffix(team.position)}</p>
                `;
                
                teamSelector.appendChild(teamCard);
                
                // Create team content section
                const teamContent = document.createElement('div');
                teamContent.className = `team-content ${index === 0 && teamIndex === 0 ? 'active' : ''}`;
                teamContent.id = `team-${team.id}`;
                
                // Add loading indicator initially
                teamContent.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
                
                teamContentContainer.appendChild(teamContent);
                
                // Only load the first team's data initially
                if (index === 0 && teamIndex === 0) {
                    activeLeague = league;
                    activeTeam = team;
                    loadTeamData(team.id);
                }
            });
            
            leagueContent.appendChild(teamSelector);
            leagueContentContainer.appendChild(leagueContent);
        });
        
        // Add click event listeners to league tabs
        document.querySelectorAll('.league-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const leagueId = this.dataset.leagueId;
                activeLeague = leaguesData.find(league => league.id === leagueId);
                
                // Update active tab
                document.querySelectorAll('.league-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Update active content
                document.querySelectorAll('.league-content').forEach(content => content.classList.remove('active'));
                document.getElementById(`league-${leagueId}`).classList.add('active');
                
                // Find the first team in this league
                const firstTeamCard = document.querySelector(`#league-${leagueId} .team-card`);
                if (firstTeamCard) {
                    const teamId = firstTeamCard.dataset.teamId;
                    activeTeam = teamsData.find(team => team.id === teamId);
                    
                    // Update active team card
                    document.querySelectorAll('.team-card').forEach(card => card.classList.remove('active'));
                    firstTeamCard.classList.add('active');
                    
                    // Update active team content
                    document.querySelectorAll('.team-content').forEach(content => content.classList.remove('active'));
                    const teamContent = document.getElementById(`team-${teamId}`);
                    teamContent.classList.add('active');
                    
                    // Load team data if not already loaded
                    if (teamContent.querySelector('.loading-spinner')) {
                        loadTeamData(teamId);
                    }
                }
            });
        });
        
        // Add click event listeners to team cards
        document.querySelectorAll('.team-card').forEach(card => {
            card.addEventListener('click', function() {
                const teamId = this.dataset.teamId;
                activeTeam = teamsData.find(team => team.id === teamId);
                
                // Update active team card
                document.querySelectorAll(`#league-${activeLeague.id} .team-card`).forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                // Update active team content
                document.querySelectorAll('.team-content').forEach(content => content.classList.remove('active'));
                const teamContent = document.getElementById(`team-${teamId}`);
                teamContent.classList.add('active');
                
                // Load team data if not already loaded
                if (teamContent.querySelector('.loading-spinner')) {
                    loadTeamData(teamId);
                }
            });
        });
    }
    
    // Load team data
    async function loadTeamData(teamId) {
        try {
            const teamContent = document.getElementById(`team-${teamId}`);
            if (!teamContent) return;
            
            const team = teamsData.find(t => t.id === teamId);
            if (!team) return;
            
            const league = leaguesData.find(l => l.id === team.leagueId);
            if (!league) return;
            
            // Get batting stats for the team
            const battingStatsSnapshot = await db.collection('battingStats')
                .where('teamId', '==', teamId)
                .get();
            
            const battingStats = [];
            battingStatsSnapshot.forEach(doc => {
                battingStats.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort batsmen by runs scored (descending)
            battingStats.sort((a, b) => b.runs - a.runs);
            
            // Get league standings
            const leagueTeams = teamsData.filter(t => t.leagueId === team.leagueId);
            
            // Sort teams by position
            leagueTeams.sort((a, b) => a.position - b.position);
            
            // Render team content
            teamContent.innerHTML = `
                <div class="team-header">
                    <img src="${team.logoUrl}" alt="${team.name} Logo" class="team-logo" onerror="this.src='assets/images/team-placeholder.jpg'">
                    <div class="team-info">
                        <h1>${team.name}</h1>
                        <p>${league.fullName} (${league.season})</p>
                    </div>
                </div>
                
                <!-- Team Summary -->
                <div class="stats-section">
                    <h2>Team Summary</h2>
                    <div class="match-card">
                        <div class="match-details">
                            <div class="match-detail-item">
                                <h4>League Position</h4>
                                <p>${team.position}${getPositionSuffix(team.position)} of ${leagueTeams.length} teams</p>
                            </div>
                            <div class="match-detail-item">
                                <h4>Matches</h4>
                                <p>${team.matches} (${team.wins} wins, ${team.losses} losses)</p>
                            </div>
                            <div class="match-detail-item">
                                <h4>Points</h4>
                                <p>${team.points}</p>
                            </div>
                            <div class="match-detail-item">
                                <h4>Net Run Rate</h4>
                                <p>${team.netRunRate}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Batting Stats -->
                ${battingStats.length > 0 ? `
                <div class="stats-section">
                    <h2>Batting Stats</h2>
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Player</th>
                                <th>Matches</th>
                                <th>Innings</th>
                                <th>Runs</th>
                                <th>Average</th>
                                <th>Strike Rate</th>
                                <th>Highest</th>
                                <th>50s</th>
                                <th>100s</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${battingStats.map(batsman => `
                            <tr>
                                <td>${batsman.name}</td>
                                <td>${batsman.matches}</td>
                                <td>${batsman.innings}</td>
                                <td>${batsman.runs}</td>
                                <td>${batsman.average.toFixed(2)}</td>
                                <td>${batsman.strikeRate.toFixed(2)}</td>
                                <td>${batsman.highest}</td>
                                <td>${batsman.fifties}</td>
                                <td>${batsman.hundreds}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}
                
                <!-- League Standings -->
                <div class="stats-section">
                    <h2>${league.name} League Standings</h2>
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th>Pos</th>
                                <th>Team</th>
                                <th>Played</th>
                                <th>Won</th>
                                <th>Lost</th>
                                <th>Points</th>
                                <th>NRR</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leagueTeams.map(t => `
                            <tr ${t.id === team.id ? 'class="highlight-row"' : ''}>
                                <td>
                                    ${t.position <= 3 ? `<div class="standings-position position-${t.position}">${t.position}</div>` : t.position}
                                </td>
                                <td class="team-name-cell">${t.name}</td>
                                <td>${t.matches}</td>
                                <td>${t.wins}</td>
                                <td>${t.losses}</td>
                                <td>${t.points}</td>
                                <td>${t.netRunRate}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            console.error("Error loading team data: ", error);
            
            const teamContent = document.getElementById(`team-${teamId}`);
            if (teamContent) {
                teamContent.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 2rem;">
                        <h3>Error Loading Data</h3>
                        <p>There was a problem loading the team data. Please try again later.</p>
                    </div>
                `;
            }
        }
    }
    
    // Helper function to get position suffix (1st, 2nd, 3rd, etc.)
    function getPositionSuffix(position) {
        if (position >= 11 && position <= 13) {
            return 'th';
        }
        
        switch (position % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
    
    // Load data on page load
    loadData();
});