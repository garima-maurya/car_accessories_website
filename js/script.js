/* ==========================================================================
   AutoGear Pro — Shared Script
   Single source of truth for site-wide interactivity. Every block checks
   for its target element before running, so this same file can be safely
   loaded on every page even if a page doesn't contain that feature.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ---------- */
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    const hideLoader = () => pageLoader.classList.add('is-hidden');
    // Give the browser a beat to paint first content, then fade the loader out.
    window.addEventListener('load', () => setTimeout(hideLoader, 250));
    // Safety net in case the load event is delayed by slow external fonts/assets.
    setTimeout(hideLoader, 2500);
  }

  /* ---------- Dark mode toggle ---------- */
  const THEME_STORAGE_KEY = 'autogearpro_theme';
  const themeToggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (themeToggle) {
      const isLight = theme === 'light';
      themeToggle.setAttribute('aria-pressed', String(isLight));
      themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  if (themeToggle) {
    // Head script already applied the saved/preferred theme before paint;
    // this just syncs the button state and wires up the click.
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const nextTheme = isLight ? 'dark' : 'light';
      applyTheme(nextTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (e) { /* localStorage unavailable — theme just won't persist */ }
    });
  }

  /* ---------- Header search widget ---------- */
  const searchToggle = document.getElementById('searchToggle');
  const searchWidget = searchToggle ? searchToggle.closest('.search-widget') : null;
  const searchForm = document.getElementById('searchForm');
  const siteSearchInput = document.getElementById('siteSearchInput');

  if (searchToggle && searchWidget && searchForm && siteSearchInput) {
    searchToggle.addEventListener('click', () => {
      const isOpen = searchWidget.classList.toggle('is-open');
      searchToggle.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) siteSearchInput.focus();
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = siteSearchInput.value.trim();
      const onProductsPage = document.getElementById('productsGrid');

      if (onProductsPage) {
        activeSearchTerm = term.toLowerCase();
        applyFilters();
      } else {
        window.location.href = `products.html${term ? `?search=${encodeURIComponent(term)}` : ''}`;
      }
    });

    // Live-filter as the person types, but only when already on the Products page
    siteSearchInput.addEventListener('input', () => {
      if (!document.getElementById('productsGrid')) return;
      activeSearchTerm = siteSearchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  /* ---------- Mobile menu toggle ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navList = document.getElementById('primaryNav');

  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      navList.classList.toggle('is-open');
    });

    // Close the menu when a nav link is chosen (mobile UX)
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
      });
    });

    // Close the menu on outside click
    document.addEventListener('click', (e) => {
      const clickedInsideNav = navList.contains(e.target) || menuToggle.contains(e.target);
      if (!clickedInsideNav && navList.classList.contains('is-open')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
      }
    });
  }

  /* ---------- Header shrink-on-scroll ---------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    const shrinkClass = 'is-scrolled';
    const onScroll = () => {
      if (window.scrollY > 12) {
        header.classList.add(shrinkClass);
      } else {
        header.classList.remove(shrinkClass);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Dynamic footer year ---------- */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ---------- Product filtering + search (Products page) ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const resultsAnnouncer = document.getElementById('resultsAnnouncer');
  const noResults = document.getElementById('noResults');

  let activeCategory = 'all';
  let activeSearchTerm = '';

  function productMatches(card) {
    const categoryOk = activeCategory === 'all' || card.dataset.category === activeCategory;
    if (!categoryOk) return false;
    if (!activeSearchTerm) return true;

    const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
    const categoryValue = card.dataset.category?.toLowerCase() || '';
    const categoryLabel = card.querySelector('.product-category')?.textContent.toLowerCase() || '';

    return (
      name.includes(activeSearchTerm) ||
      desc.includes(activeSearchTerm) ||
      categoryValue.includes(activeSearchTerm) ||
      categoryLabel.includes(activeSearchTerm)
    );
  }

  function applyFilters() {
    let visibleCount = 0;

    productCards.forEach(card => {
      const isMatch = productMatches(card);
      card.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }

    if (resultsAnnouncer) {
      resultsAnnouncer.textContent = `Showing ${visibleCount} product${visibleCount === 1 ? '' : 's'}`;
    }
  }

  function setActiveFilterButton(activeBtn) {
    filterButtons.forEach(btn => {
      const isActive = btn === activeBtn;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  if (filterButtons.length && productCards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        setActiveFilterButton(btn);
        activeCategory = btn.dataset.category;
        applyFilters();
      });
    });

    // Respect a ?category= and/or ?search= param when arriving from a link elsewhere on the site
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get('category');
    const requestedSearch = params.get('search');

    const matchingButton = requestedCategory
      ? Array.from(filterButtons).find(btn => btn.dataset.category === requestedCategory)
      : null;

    if (matchingButton) {
      setActiveFilterButton(matchingButton);
      activeCategory = matchingButton.dataset.category;
    } else {
      applyFilters();
    }

    if (requestedSearch) {
      activeSearchTerm = requestedSearch.trim().toLowerCase();
      const pageSearchInput = document.getElementById('siteSearchInput');
      if (pageSearchInput) pageSearchInput.value = requestedSearch;
    }

    applyFilters();
  }

  /* ---------- Add to cart + toast (Products page) ---------- */
  const CART_STORAGE_KEY = 'autogearpro_cart_count';
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function getCartCount() {
    return parseInt(localStorage.getItem(CART_STORAGE_KEY) || '0', 10);
  }

  function setCartCount(count) {
    localStorage.setItem(CART_STORAGE_KEY, String(count));
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  document.addEventListener('click', (e) => {
    const addButton = e.target.closest('.add-to-cart');
    if (!addButton) return;

    const card = addButton.closest('.product-card');
    const productName = card ? card.querySelector('h3')?.textContent : 'Item';

    setCartCount(getCartCount() + 1);
    showToast(`${productName} added to cart`);
  });

  /* ---------- Scroll reveal (About page timeline, stats) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      revealEls.forEach(el => revealObserver.observe(el));
    }
  }

  /* ---------- Statistic counters (About page) ---------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (statNumbers.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      statNumbers.forEach(el => {
        const target = parseInt(el.dataset.target, 10) || 0;
        el.textContent = target.toLocaleString('en-IN') + (el.dataset.suffix || '');
      });
    } else {
      const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      statNumbers.forEach(el => statObserver.observe(el));
    }
  }

  /* ---------- Contact form validation ---------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const formStatus = document.getElementById('formStatus');
    const submitButton = contactForm.querySelector('.form-submit');
    const submitButtonDefaultText = submitButton ? submitButton.textContent : 'Send Message';

    // EmailJS configuration — replace these three placeholders with the
    // values from your EmailJS dashboard (https://dashboard.emailjs.com):
    // Email Services > your service > Service ID
    // Email Templates > your template > Template ID
    // Account > General > Public Key
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

    if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    const validators = {
      fullName: (value) => {
        if (!value.trim()) return 'Please enter your name.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      },
      email: (value) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return 'Please enter your email address.';
        if (!pattern.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      },
      phone: (value) => {
        if (!value.trim()) return '';
        const pattern = /^[\d\s+()-]{7,}$/;
        return pattern.test(value.trim()) ? '' : 'Please enter a valid phone number.';
      },
      subject: (value) => (value ? '' : 'Please select a subject.'),
      message: (value) => {
        if (!value.trim()) return 'Please enter a message.';
        if (value.trim().length < 10) return 'Message should be at least 10 characters.';
        return '';
      }
    };

    function validateField(field) {
      const validate = validators[field.name];
      if (!validate) return true;

      const errorEl = document.getElementById(`${field.id}Error`);
      const errorMessage = validate(field.value);

      if (errorEl) errorEl.textContent = errorMessage;
      field.setAttribute('aria-invalid', errorMessage ? 'true' : 'false');

      return !errorMessage;
    }

    // Validate on blur for immediate feedback
    Object.keys(validators).forEach(name => {
      const field = contactForm.elements[name];
      if (field) {
        field.addEventListener('blur', () => validateField(field));
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let firstInvalidField = null;
      let isFormValid = true;

      Object.keys(validators).forEach(name => {
        const field = contactForm.elements[name];
        if (!field) return;
        const fieldIsValid = validateField(field);
        if (!fieldIsValid) {
          isFormValid = false;
          if (!firstInvalidField) firstInvalidField = field;
        }
      });

      if (!isFormValid) {
        if (formStatus) {
          formStatus.textContent = 'Please fix the highlighted fields and try again.';
          formStatus.classList.remove('is-success');
        }
        if (firstInvalidField) firstInvalidField.focus();
        return;
      }

      // NOTE: replace EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID / EMAILJS_PUBLIC_KEY
      // above with your real EmailJS credentials for this to actually send.
      if (!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        if (formStatus) {
          formStatus.textContent = 'Email service is not configured yet. Please try again later.';
          formStatus.classList.remove('is-success');
        }
        showToast("Couldn't send your message — please try again.");
        return;
      }

      const templateParams = {
        full_name: contactForm.elements.fullName.value.trim(),
        email: contactForm.elements.email.value.trim(),
        phone: contactForm.elements.phone.value.trim() || 'Not provided',
        subject: contactForm.elements.subject.value,
        message: contactForm.elements.message.value.trim()
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }
      if (formStatus) {
        formStatus.textContent = 'Sending your message…';
        formStatus.classList.remove('is-success');
      }

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(() => {
          if (formStatus) {
            formStatus.textContent = "Thanks! Your message has been sent — we'll get back to you soon.";
            formStatus.classList.add('is-success');
          }
          showToast("Message sent — we'll be in touch soon.");
          contactForm.reset();
          Object.keys(validators).forEach(name => {
            const field = contactForm.elements[name];
            if (field) field.removeAttribute('aria-invalid');
          });
        })
        .catch((error) => {
          console.error('EmailJS send failed:', error);
          if (formStatus) {
            formStatus.textContent = 'Something went wrong sending your message. Please try again or email us directly.';
            formStatus.classList.remove('is-success');
          }
          showToast("Couldn't send your message — please try again.");
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = submitButtonDefaultText;
          }
        });
    });
  }

  /* ---------- FAQ accordion ---------- */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(button => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!isOpen));
      if (answer) {
        answer.classList.toggle('is-open', !isOpen);
        answer.setAttribute('aria-hidden', String(isOpen));
      }
    });
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');

  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------- Newsletter signup ---------- */
  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterError = document.getElementById('newsletterError');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = newsletterEmail ? newsletterEmail.value.trim() : '';

      if (!value || !emailPattern.test(value)) {
        if (newsletterError) newsletterError.textContent = 'Please enter a valid email address.';
        if (newsletterEmail) newsletterEmail.setAttribute('aria-invalid', 'true');
        return;
      }

      if (newsletterError) newsletterError.textContent = '';
      if (newsletterEmail) newsletterEmail.removeAttribute('aria-invalid');

      // NOTE: no backend is connected yet. Replace this block with a real
      // subscription API call (e.g. Mailchimp, Klaviyo, or a custom endpoint).
      showToast("You're subscribed! Watch your inbox for updates.");
      newsletterForm.reset();
    });
  }

});
