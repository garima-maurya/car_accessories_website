# AutoGear Pro

A car accessories e-commerce front end built with plain HTML, CSS, and JavaScript — no frameworks, no build tools. Four pages, a shared design system, working product search and filtering, and a live contact form powered by EmailJS.

**Live demo:** 

---

## Features

- **Home, Products, About, Contact** — four fully responsive pages sharing one design system
- **Product catalog** with category filtering (Interior / Exterior / Electronics / Safety)
- **Live search** — matches product name, description, *and* category, combinable with the category filter
- **Dark / light mode toggle**, persisted across visits via `localStorage`, applied before first paint to avoid a flash of the wrong theme
- **Working contact form** — real validation (required fields, email format, min lengths) plus a live email send via [EmailJS](https://www.emailjs.com/), with loading, success, and error states
- **Newsletter signup** in the footer with its own validation
- **Scroll-reveal animations** and animated statistics counters, both via `IntersectionObserver`
- **Accessible by default** — semantic HTML, ARIA attributes on interactive widgets (menu, accordion, filters), visible focus states, `prefers-reduced-motion` respected throughout
- **Fully responsive** — three breakpoints (1024px / 768px / 480px)

## Tech Stack

- HTML5, CSS3 (custom properties, Grid, Flexbox), vanilla JavaScript (ES6+)
- [EmailJS](https://www.emailjs.com/) for client-side email sending (no backend required)
- Google Fonts: Oswald, Inter, JetBrains Mono
- No build step, no package manager required to run it

## Folder Structure

```
car_accessories/
├── index.html          Home page
├── products.html        Product catalog + filter/search
├── about.html            Company story, mission, timeline, team
├── contact.html          Contact form + FAQ
├── css/
│   ├── style.css         Base styles, design tokens, all components
│   └── responsive.css    Breakpoint overrides (loaded after style.css)
└── js/
    └── script.js         All site interactivity (single shared file)
```

## Running Locally

No install needed — it's static HTML/CSS/JS.

1. Download or clone the project folder.
2. Open `index.html` directly in a browser, **or** serve it locally for the best experience (some browsers restrict certain features on `file://` URLs):
   ```bash
   # Python 3
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

## Setting Up the Contact Form (EmailJS)

The contact form is wired to EmailJS but needs your own account credentials to actually send email:

1. Create a free account at [emailjs.com](https://www.emailjs.com/).
2. Add an **Email Service** (e.g. connect your Gmail) → copy its **Service ID**.
3. Create an **Email Template** with these variables: `{{full_name}}`, `{{email}}`, `{{phone}}`, `{{subject}}`, `{{message}}` → copy its **Template ID**.
4. Go to **Account → General** → copy your **Public Key**.
5. Open `js/script.js`, find this block near the top of the contact form section, and fill in your three values:
   ```js
   const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
   const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
   const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
   ```

Until these are filled in, the form will show "Email service is not configured yet" instead of silently failing.

## Browser Support

Works in all current versions of Chrome, Firefox, Safari, and Edge. Uses modern CSS (`grid-template-rows` animation trick, standalone `translate` property) that requires reasonably recent browser versions (2023+).

## Known Limitations

- Product images are CSS/SVG placeholders — no real photography yet (see `PROJECT_DOCUMENTATION.md`)
- No backend — cart, orders, and newsletter signups are not persisted anywhere beyond the browser
- Product data is hardcoded into `products.html` rather than loaded from a JSON file or API

## Author

Garima Maurya — [github.com/garima-maurya](https://github.com/garima-maurya)
