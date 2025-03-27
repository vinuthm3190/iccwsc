document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer copyright
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
});