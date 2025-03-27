# ICCWSC Cricket Club Website

A modern, responsive website for the International Cricket Club (ICCWSC) featuring information about the club, leagues, facility availability, and contact details.

## Project Structure

```
iccwsc-website/
│
├── index.html                 # Home page
├── leagues.html               # Leagues page
├── availability.html          # Availability page
├── contact.html               # Contact page
│
├── css/
│   ├── style.css              # Main styles
│   ├── header.css             # Header styles
│   ├── footer.css             # Footer styles
│   ├── home.css               # Home page specific styles
│   ├── leagues.css            # Leagues page specific styles
│   ├── availability.css       # Availability page specific styles
│   └── contact.css            # Contact page specific styles
│
├── js/
│   ├── main.js                # Main JavaScript file
│   ├── navigation.js          # Navigation functionality
│   ├── calendar.js            # Calendar functionality
│   └── contact-form.js        # Contact form functionality
│
├── assets/
│   ├── images/
│   │   ├── logo.png           # Club logo
│   │   ├── hero-bg.jpg        # Hero background
│   │   ├── coaching.jpg       # Coaching image
│   │   ├── facilities.jpg     # Facilities image
│   │   └── community.jpg      # Community image
│   │
│   └── icons/
│       ├── address.svg        # Address icon
│       ├── phone.svg          # Phone icon
│       ├── email.svg          # Email icon
│       └── social/            # Social media icons
│           ├── facebook.svg
│           ├── twitter.svg
│           ├── instagram.svg
│           └── linkedin.svg
│
└── README.md                  # This file
```

## Features

- **Responsive Design**: Optimized for all device sizes (mobile, tablet, desktop)
- **Modern UI**: Clean, professional design with smooth animations
- **Four Main Pages**:
  - **Home**: Club introduction, features, and upcoming events
  - **Leagues**: Information about cricket leagues organized by the club
  - **Availability**: Calendar showing facility availability and booking options
  - **Contact**: Contact form and club information

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/iccwsc-website.git
   cd iccwsc-website
   ```

2. **Development**:
   - Open the `index.html` file in your browser to view the website locally
   - Edit the HTML, CSS, and JavaScript files as needed

3. **Deployment**:
   - Upload all files to your web server via FTP, or
   - Deploy to GitHub Pages:
     1. Create a GitHub repository
     2. Push your code to the repository
     3. Go to repository Settings → Pages
     4. Select the main branch as the source and click Save

## Required Resources

Before deploying, make sure to add the following resources:

1. **Images**:
   - Replace placeholder images in the `assets/images/` directory with actual cricket-related images
   - Create or source a club logo for `logo.png`

2. **Icons**:
   - Add SVG icons to the `assets/icons/` directory
   - Either create your own or download free SVG icons from sources like [Feather Icons](https://feathericons.com/) or [Heroicons](https://heroicons.com/)

## Credits

- **Google Maps**: The contact page uses Google Maps Embed API
- **Google Fonts**: The site uses web-safe system fonts (Segoe UI, Tahoma, Geneva, Verdana, sans-serif)

## Future Enhancements

- Add a News & Blog section
- Implement user accounts for members
- Create an online booking system for facilities
- Add a photo gallery section
- Integrate with social media platforms

## License

This project is released under the MIT License.