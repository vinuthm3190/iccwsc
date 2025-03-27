// League tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    // League tabs
    const leagueTabs = document.querySelectorAll('.league-tab');
    const leagueContents = document.querySelectorAll('.league-content');
    
    leagueTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            leagueTabs.forEach(t => t.classList.remove('active'));
            // Add active class to current tab
            this.classList.add('active');
            
            // Hide all league contents
            leagueContents.forEach(content => content.classList.remove('active'));
            
            // Show current league content
            const leagueId = this.getAttribute('data-league');
            document.getElementById(`${leagueId}-content`).classList.add('active');
            
            // Hide all team contents
            document.querySelectorAll('.team-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the first team in this league
            const firstTeamCard = document.querySelector(`#${leagueId}-content .team-card`);
            if (firstTeamCard) {
                // Remove active class from all team cards
                document.querySelectorAll('.team-card').forEach(card => {
                    card.classList.remove('active');
                });
                
                // Add active class to first team card
                firstTeamCard.classList.add('active');
                
                // Show the content for the first team
                const teamId = firstTeamCard.getAttribute('data-team');
                document.getElementById(`${teamId}-content`).classList.add('active');
            }
        });
    });
    
    // Team cards functionality
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards in the same league
            const parentLeague = this.closest('.league-content');
            parentLeague.querySelectorAll('.team-card').forEach(c => {
                c.classList.remove('active');
            });
            
            // Add active class to current card
            this.classList.add('active');
            
            // Hide all team contents
            document.querySelectorAll('.team-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show current team content
            const teamId = this.getAttribute('data-team');
            document.getElementById(`${teamId}-content`).classList.add('active');
        });
    });
});