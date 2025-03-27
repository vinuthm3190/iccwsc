document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real application, you would collect the form data and send it to the server
            // const formData = new FormData(contactForm);
            
            // Show success message
            alert('Thank you for contacting us! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
});