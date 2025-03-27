document.addEventListener('DOMContentLoaded', function() {
    // Calendar navigation buttons
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const currentMonthBtn = document.getElementById('current-month');
    const calendarTitle = document.querySelector('.calendar-title');
    
    if (prevMonthBtn && nextMonthBtn && currentMonthBtn && calendarTitle) {
        // Month names for calendar
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Current date tracking
        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        
        // Update calendar title
        function updateCalendarTitle() {
            calendarTitle.textContent = `${months[currentMonth]} ${currentYear}`;
        }
        
        // Initialize calendar title
        updateCalendarTitle();
        
        // Previous month button
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendarTitle();
            alert(`Calendar would show ${months[currentMonth]} ${currentYear}. Feature not fully implemented in demo.`);
        });
        
        // Next month button
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendarTitle();
            alert(`Calendar would show ${months[currentMonth]} ${currentYear}. Feature not fully implemented in demo.`);
        });
        
        // Current month (today) button
        currentMonthBtn.addEventListener('click', function() {
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            updateCalendarTitle();
            alert(`Calendar reset to current month: ${months[currentMonth]} ${currentYear}.`);
        });
    }
    
    // Booking button functionality
    const bookingButton = document.querySelector('.booking-button .btn');
    if (bookingButton) {
        bookingButton.addEventListener('click', function() {
            alert('You would be redirected to the booking system. This is a demo only.');
        });
    }
});