/* ============================================================
   PORTFOLIO — Main Script
   Premium single-page portfolio: animations, interactions,
   and dynamic behaviours.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. UTILITIES
  ---------------------------------------------------------- */

  /**
   * Debounce helper – delays execution until calls stop for `wait` ms.
   */
  function debounce(fn, wait = 15) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Throttle helper – ensures fn fires at most once per `limit` ms.
   */
  function throttle(fn, limit = 100) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  }

  /**
   * Simple email‐format validation.
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ----------------------------------------------------------
     1. INTERSECTION OBSERVER — scroll‐triggered animations
  ---------------------------------------------------------- */

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = parseInt(el.dataset.delay, 10) || 0;

          // Apply the animation type as a data attribute so CSS can key off it
          // (the attribute is expected to already be in the markup)
          setTimeout(() => {
            el.classList.add('animated');
          }, delay);

          obs.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
     2. NAVIGATION
  ---------------------------------------------------------- */

  function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.hamburger');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    /* — Mobile hamburger toggle — */
    if (navToggle && navbar) {
      navToggle.addEventListener('click', () => {
        navbar.classList.toggle('nav-open');
      });
    }

    /* — Close mobile nav on link click — */
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (navbar) navbar.classList.remove('nav-open');
      });
    });

    /* — Navbar background opacity on scroll — */
    function updateNavbarOpacity() {
      if (!navbar) return;
      const scrollY = window.scrollY || window.pageYOffset;
      // Transition from transparent → solid over the first 300px
      const opacity = Math.min(scrollY / 300, 1);
      navbar.style.setProperty('--nav-scroll-opacity', opacity);
      // Fallback: direct background manipulation
      navbar.style.backgroundColor = `rgba(var(--nav-bg-rgb, 15,15,15), ${opacity})`;

      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    /* — Active link highlighting based on scroll position — */
    function highlightActiveLink() {
      const scrollY = window.scrollY || window.pageYOffset;
      const navHeight = navbar ? navbar.offsetHeight : 0;

      let currentSection = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href === '#' + currentSection) {
          link.classList.add('active');
        }
      });
    }

    const handleScroll = debounce(() => {
      updateNavbarOpacity();
      highlightActiveLink();
    }, 10);

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    updateNavbarOpacity();
    highlightActiveLink();
  }

  /* ----------------------------------------------------------
     3. HERO SECTION — staggered entrance animations
  ---------------------------------------------------------- */

  function initHeroAnimations() {
    const greeting     = document.querySelector('.hero-greeting');
    const name         = document.querySelector('.hero-name');
    const designations = document.querySelector('.hero-designations');
    const intro        = document.querySelector('.hero-intro');
    const ctaButtons   = document.querySelectorAll('.hero-cta-group .btn');
    const socialIcons  = document.querySelectorAll('.hero-social .social-icon');

    // Helper: add 'visible' / 'animated' class after delay
    function reveal(el, delay) {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.classList.add('animated');
      }, delay);
    }

    reveal(greeting, 0);
    reveal(name, 200);
    reveal(designations, 400);
    reveal(intro, 600);

    // CTA buttons — slide up + fade, staggered 100ms
    ctaButtons.forEach((btn, i) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(30px)';
      btn.style.transition = 'opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1)';
      setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
        btn.classList.add('animated');
      }, 800 + i * 100);
    });

    // Social icons — pop in with bounce
    socialIcons.forEach((icon, i) => {
      icon.style.opacity = '0';
      icon.style.transform = 'scale(0)';
      icon.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(.34,1.56,.64,1)';
      setTimeout(() => {
        icon.style.opacity = '1';
        icon.style.transform = 'scale(1)';
        icon.classList.add('animated');
      }, 1000 + i * 150);
    });
  }

  /* ----------------------------------------------------------
     4. ABOUT SECTION — flip cards & interactions
  ---------------------------------------------------------- */

  function initAboutSection() {
    const flipCards = document.querySelectorAll('.flip-card');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    flipCards.forEach((card) => {
      if (isTouchDevice) {
        // Mobile: toggle on click
        card.addEventListener('click', () => {
          card.classList.toggle('flipped');
        });
      } else {
        // Desktop: flip on hover
        card.addEventListener('mouseenter', () => {
          card.classList.add('flipped');
        });
        card.addEventListener('mouseleave', () => {
          card.classList.remove('flipped');
        });
      }
    });
  }

  /* ----------------------------------------------------------
     5. WORK EXPERIENCE — card animations & hover
  ---------------------------------------------------------- */

  function initWorkExperience() {
    // Bullet point stagger (observed via main observer, but we wire
    // per‐card bullet reveal here for finer control).
    const workCards = document.querySelectorAll('.work-card, .experience-card');

    const bulletObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target;
          const bullets = card.querySelectorAll('li, .bullet-point');

          bullets.forEach((bullet, i) => {
            bullet.style.opacity = '0';
            bullet.style.transform = 'translateX(-20px)';
            bullet.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            setTimeout(() => {
              bullet.style.opacity = '1';
              bullet.style.transform = 'translateX(0)';
            }, i * 150);
          });

          // Curtain‐open: dark left panel
          const darkPanel = card.querySelector('.experience-card-left');
          if (darkPanel) {
            darkPanel.style.maxWidth = '0';
            darkPanel.style.overflow = 'hidden';
            darkPanel.style.transition = 'max-width 0.8s cubic-bezier(.22,1,.36,1)';
            requestAnimationFrame(() => {
              darkPanel.style.maxWidth = '100%';
            });
          }

          obs.unobserve(card);
        });
      },
      { threshold: 0.15 }
    );

    workCards.forEach((card) => bulletObserver.observe(card));

    // Hover: card lift + badge pulse
    workCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
        const badge = card.querySelector('.experience-badge');
        if (badge) badge.classList.add('pulse-glow');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
        const badge = card.querySelector('.badge, .company-badge');
        if (badge) badge.classList.remove('pulse-glow');
      });
    });
  }

  /* ----------------------------------------------------------
     6. EDUCATION — card drop‐in, typewriter bullets, hover FX
  ---------------------------------------------------------- */

  function initEducation() {
    const eduCards = document.querySelectorAll('.education-card, .edu-card');

    const eduObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target;

          // Drop in with slight rotation
          card.style.opacity = '0';
          card.style.transform = 'translateY(-60px) rotate(-3deg)';
          card.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1)';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) rotate(0deg)';
          });

          // Typewriter‐like bullet reveal (left‐to‐right clip)
          const bullets = card.querySelectorAll('li, .edu-bullet');
          bullets.forEach((bullet, i) => {
            bullet.style.clipPath = 'inset(0 100% 0 0)';
            bullet.style.transition = 'clip-path 0.6s ease';
            setTimeout(() => {
              bullet.style.clipPath = 'inset(0 0 0 0)';
            }, 400 + i * 200);
          });

          obs.unobserve(card);
        });
      },
      { threshold: 0.15 }
    );

    eduCards.forEach((card) => eduObserver.observe(card));

    // Hover: cap icon toss
    eduCards.forEach((card) => {
      const capIcon = card.querySelector('.education-card-icon i');
      if (!capIcon) return;

      card.addEventListener('mouseenter', () => {
        capIcon.style.transition = 'transform 0.5s cubic-bezier(.34,1.56,.64,1)';
        capIcon.style.transform = 'translateY(-12px) rotate(-15deg)';
      });
      card.addEventListener('mouseleave', () => {
        capIcon.style.transition = 'transform 0.4s ease';
        capIcon.style.transform = 'translateY(0) rotate(0deg)';
      });
    });
  }

  /* ----------------------------------------------------------
     7. PROJECTS — panel, outcomes, tech tags
  ---------------------------------------------------------- */

  function initProjects() {
    const projectCards = document.querySelectorAll('.project-card, .project');

    const projectObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const card = entry.target;

          // Dark left panel — blur‐to‐sharp
          const leftPanel = card.querySelector('.project-card-left');
          if (leftPanel) {
            leftPanel.style.filter = 'blur(8px)';
            leftPanel.style.opacity = '0';
            leftPanel.style.transition = 'filter 0.8s ease, opacity 0.8s ease';
            requestAnimationFrame(() => {
              leftPanel.style.filter = 'blur(0)';
              leftPanel.style.opacity = '1';
            });
          }

          // Right content fades in with delay
          const rightPanel = card.querySelector('.project-card-right');
          if (rightPanel) {
            rightPanel.style.opacity = '0';
            rightPanel.style.transition = 'opacity 0.6s ease 0.3s';
            requestAnimationFrame(() => {
              rightPanel.style.opacity = '1';
            });
          }

          // Outcome boxes — pop in one by one
          const outcomes = card.querySelectorAll('.outcome-box, .outcome, .stat-box');
          outcomes.forEach((box, i) => {
            box.style.opacity = '0';
            box.style.transform = 'scale(0.5)';
            box.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(.34,1.56,.64,1)';
            setTimeout(() => {
              box.style.opacity = '1';
              box.style.transform = 'scale(1)';
            }, 500 + i * 150);
          });

          // Tech tag pills — rubber‐band bounce
          const techTags = card.querySelectorAll('.tech-tag, .tech-pill, .tag');
          techTags.forEach((tag, i) => {
            tag.style.opacity = '0';
            tag.style.transform = 'scale(0)';
            tag.style.transition = 'opacity 0.3s ease, transform 0.5s cubic-bezier(.34,1.56,.64,1)';
            setTimeout(() => {
              tag.style.opacity = '1';
              tag.style.transform = 'scale(1)';
            }, 700 + i * 100);
          });

          obs.unobserve(card);
        });
      },
      { threshold: 0.15 }
    );

    projectCards.forEach((card) => projectObserver.observe(card));

    // Hover effects (warm glow, shimmer) — toggle CSS classes
    projectCards.forEach((card) => {
      card.addEventListener('mouseenter', () => card.classList.add('project-hovered'));
      card.addEventListener('mouseleave', () => card.classList.remove('project-hovered'));
    });
  }

  /* ----------------------------------------------------------
     8. SKILLS — grid wave, progress bars, counters
  ---------------------------------------------------------- */

  /**
   * Animate a numeric counter from 0 → target using easeOutCubic.
   */
  function animateCounter(element, target, duration) {
    if (duration === undefined) duration = 1000;
    var startTime = performance.now();

    function update(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      var easeOut = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * easeOut) + '%';
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function initSkills() {
    const skillCards = document.querySelectorAll('.skill-category-card');

    // Grid‐wave entrance: delay increases by row + column position
    const skillObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const container = entry.target;
          const cards = container.querySelectorAll('.skill-category-card');

          // Determine approximate columns from container width
          const cols = Math.max(1, Math.round(container.offsetWidth / (cards[0] ? cards[0].offsetWidth + 16 : 300)));

          cards.forEach((card, idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            const delay = (row + col) * 100; // wave from top‐left

            card.style.opacity = '0';
            card.style.transform = 'scale(0.85) translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(.22,1,.36,1)';

            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1) translateY(0)';
            }, delay);
          });

          obs.unobserve(container);
        });
      },
      { threshold: 0.1 }
    );

    // Observe the skills grid container(s)
    const skillGrids = document.querySelectorAll('.skills-grid, .skills-container, #skills');
    skillGrids.forEach((grid) => skillObserver.observe(grid));

    // Progress bars + counters
    const progressObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const bar = entry.target;
          const fill = bar.querySelector('.skill-progress');
          const percent = fill ? parseInt(fill.dataset.percent, 10) || 0 : 0;
          const counter = bar.closest('.skill-item') ? bar.closest('.skill-item').querySelector('.skill-percent') : null;

          if (fill) {
            fill.style.width = '0%';
            fill.style.transition = 'width 1s cubic-bezier(.22,1,.36,1)';
            requestAnimationFrame(() => {
              fill.style.width = percent + '%';
            });
          }

          if (counter) {
            animateCounter(counter, percent, 1000);
          }

          obs.unobserve(bar);
        });
      },
      { threshold: 0.3 }
    );

    const progressBars = document.querySelectorAll('.progress-bar, .skill-bar');
    progressBars.forEach((bar) => progressObserver.observe(bar));

    // Hover: icon 360° spin
    skillCards.forEach((card) => {
      const icon = card.querySelector('.skill-category-header i');
      if (!icon) return;

      card.addEventListener('mouseenter', () => {
        icon.style.transition = 'transform 0.8s ease';
        icon.style.transform = 'rotate(360deg)';
      });
      card.addEventListener('mouseleave', () => {
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(0deg)';
      });
    });
  }

  /* ----------------------------------------------------------
     9. CERTIFICATIONS — waterfall, tilt, mouse‐follow
  ---------------------------------------------------------- */

  function initCertifications() {
    const certCards = document.querySelectorAll('.cert-card, .certification-card');

    // Waterfall entrance
    const certObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const container = entry.target;
          const cards = container.querySelectorAll('.cert-card, .certification-card');

          cards.forEach((card, i) => {
            // Random slight rotation
            const randomRot = (Math.random() * 4 - 2).toFixed(2); // –2° to +2°
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) rotate(' + randomRot + 'deg)';
            card.style.transition = 'opacity 0.5s ease, transform 0.6s cubic-bezier(.22,1,.36,1)';

            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) rotate(0deg)';
            }, i * 120);
          });

          obs.unobserve(container);
        });
      },
      { threshold: 0.1 }
    );

    const certContainers = document.querySelectorAll('.certifications-grid, .cert-container, #certifications');
    certContainers.forEach((c) => certObserver.observe(c));

    // Mouse‐follow tilt effect
    certCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Max tilt ±4°
        const rotateY = ((x - centerX) / centerX) * 4;
        const rotateX = ((centerY - y) / centerY) * 4;

        card.style.transform =
          'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg)';
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        card.style.transition = 'transform 0.4s ease';
      });
    });
  }

  /* ----------------------------------------------------------
     10. CONTACT — form panel, floating labels, validation
  ---------------------------------------------------------- */

  function initContact() {
    const contactSection = document.querySelector('#contact, .contact-section');
    const contactForm = document.querySelector('.contact-form, #contact-form');

    // Panel slide‐in animations (handled mostly by scroll observer,
    // but we wire the staggered field underlines here).
    if (contactSection) {
      const formObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            // Field underline draw — stagger 0.2s each
            const fields = contactSection.querySelectorAll(
              '.form-group, .form-field, .input-group'
            );
            fields.forEach((field, i) => {
              field.style.opacity = '0';
              field.style.transform = 'translateY(20px)';
              field.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
              setTimeout(() => {
                field.style.opacity = '1';
                field.style.transform = 'translateY(0)';
              }, i * 200);
            });

            // Send button pulse after form renders
            const sendBtn = contactSection.querySelector(
              'button[type="submit"], .send-btn, .submit-btn'
            );
            if (sendBtn) {
              setTimeout(() => {
                sendBtn.classList.add('pulse');
                setTimeout(() => sendBtn.classList.remove('pulse'), 600);
              }, fields.length * 200 + 300);
            }

            obs.unobserve(contactSection);
          });
        },
        { threshold: 0.15 }
      );

      formObserver.observe(contactSection);
    }

    // Floating labels: focus / blur
    const formInputs = document.querySelectorAll(
      '.contact-section input, .contact-section textarea, .contact-form input, .contact-form textarea'
    );

    formInputs.forEach((input) => {
      // Check initial state (e.g. browser autofill)
      if (input.value.trim() !== '') {
        input.classList.add('focused');
        const parent = input.closest('.form-group, .form-field, .input-group');
        if (parent) parent.classList.add('focused');
      }

      input.addEventListener('focus', () => {
        input.classList.add('focused');
        const parent = input.closest('.form-group, .form-field, .input-group');
        if (parent) parent.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
          input.classList.remove('focused');
          const parent = input.closest('.form-group, .form-field, .input-group');
          if (parent) parent.classList.remove('focused');
        }
      });
    });

    // Form submission
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameField    = contactForm.querySelector('#fullName');
        const emailField   = contactForm.querySelector('#emailAddress');
        const subjectField = contactForm.querySelector('#subject');
        const messageField = contactForm.querySelector('#message');

        // Collect values
        const name    = nameField   ? nameField.value.trim()    : '';
        const email   = emailField  ? emailField.value.trim()   : '';
        const subject = subjectField? subjectField.value.trim() : '';
        const message = messageField? messageField.value.trim() : '';

        // Validation
        let errors = [];
        if (!name)             errors.push('Name is required.');
        if (!email)            errors.push('Email is required.');
        else if (!isValidEmail(email)) errors.push('Please enter a valid email address.');
        if (!subject)          errors.push('Subject is required.');
        if (!message)          errors.push('Message is required.');

        // Remove previous error states
        contactForm.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
        const oldAlert = contactForm.querySelector('.form-alert');
        if (oldAlert) oldAlert.remove();

        if (errors.length) {
          // Mark empty fields
          [nameField, emailField, subjectField, messageField].forEach((f) => {
            if (f && !f.value.trim()) f.classList.add('error');
          });
          if (emailField && emailField.value.trim() && !isValidEmail(emailField.value.trim())) {
            emailField.classList.add('error');
          }

          const alertDiv = document.createElement('div');
          alertDiv.className = 'form-alert form-alert-error';
          alertDiv.textContent = errors[0];
          contactForm.prepend(alertDiv);
          setTimeout(() => alertDiv.remove(), 4000);
          return;
        }

        // Construct mailto link
        const mailtoBody = 'Name: ' + name + '%0D%0AEmail: ' + email + '%0D%0A%0D%0A' + encodeURIComponent(message);
        const mailtoLink =
          'mailto:mishradevansh749@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + mailtoBody;
        window.open(mailtoLink, '_self');

        // Success message
        const successDiv = document.createElement('div');
        successDiv.className = 'form-alert form-alert-success';
        successDiv.textContent = 'Opening your email client…';
        contactForm.prepend(successDiv);
        setTimeout(() => successDiv.remove(), 3000);

        // Reset
        contactForm.reset();
        formInputs.forEach((input) => {
          input.classList.remove('focused');
          const parent = input.closest('.form-group, .form-field, .input-group');
          if (parent) parent.classList.remove('focused');
        });
      });
    }
  }

  /* ----------------------------------------------------------
     11. SMOOTH SCROLL — anchor links
  ---------------------------------------------------------- */

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     12. SCROLL TO TOP — button
  ---------------------------------------------------------- */

  function initScrollToTop() {
    // Create the button if it doesn't exist in the DOM
    let btn = document.querySelector('.back-to-top, #backToTop, .scroll-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'scroll-to-top';
      btn.id = 'scroll-to-top';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      document.body.appendChild(btn);
    }

    function toggleVisibility() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', throttle(toggleVisibility, 150), { passive: true });
    toggleVisibility();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     13. TYPING EFFECT — hero designations
  ---------------------------------------------------------- */

  function initTypingEffect() {
    const el = document.querySelector('.hero-designations, .typed-text');
    if (!el) return;

    // If the element has child spans with individual titles, cycle them.
    // Otherwise, treat the text content as a list separated by ' | '.
    let titles = [];
    const spans = el.querySelectorAll('span[data-title]');
    if (spans.length) {
      spans.forEach((s) => titles.push(s.dataset.title));
    } else {
      const raw = el.dataset.titles || el.textContent;
      titles = raw.split('|').map((t) => t.trim()).filter(Boolean);
    }

    if (!titles.length) return;

    // Clear original content and prepare cursor
    el.textContent = '';
    el.classList.add('typing-cursor');

    let titleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseAfterType = 2000;
    const pauseAfterDelete = 500;

    function type() {
      const current = titles[titleIdx];

      if (!isDeleting) {
        el.textContent = current.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx === current.length) {
          isDeleting = true;
          setTimeout(type, pauseAfterType);
          return;
        }
        setTimeout(type, typeSpeed);
      } else {
        el.textContent = current.substring(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          titleIdx = (titleIdx + 1) % titles.length;
          setTimeout(type, pauseAfterDelete);
          return;
        }
        setTimeout(type, deleteSpeed);
      }
    }

    // Start after hero entrance completes
    setTimeout(type, 1200);
  }

  /* ----------------------------------------------------------
     14. PARALLAX — subtle hero background shift on scroll
  ---------------------------------------------------------- */

  function initParallax() {
    const hero = document.querySelector('.hero, #hero, .hero-section');
    if (!hero) return;

    const bg = hero.querySelector('.hero-bg, .hero-background') || hero;

    function onScroll() {
      const scrollY = window.scrollY || window.pageYOffset;
      // Move the background downward at 30% speed for parallax
      const offset = scrollY * 0.3;
      bg.style.transform = 'translate3d(0,' + offset + 'px,0)';
    }

    window.addEventListener('scroll', throttle(onScroll, 16), { passive: true });
  }

  /* ----------------------------------------------------------
     15. PRELOADER (optional graceful page entrance)
  ---------------------------------------------------------- */

  function hidePreloader() {
    const preloader = document.querySelector('.preloader, #preloader, .loader');
    if (!preloader) return;
    preloader.style.opacity = '0';
    preloader.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500);
  }

  /* ----------------------------------------------------------
     INITIALISE — wire everything on DOMContentLoaded
  ---------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', () => {
    hidePreloader();
    initScrollAnimations();
    initNavigation();
    initHeroAnimations();
    initAboutSection();
    initWorkExperience();
    initEducation();
    initProjects();
    initSkills();
    initCertifications();
    initContact();
    initSmoothScroll();
    initScrollToTop();
    // initTypingEffect(); // Disabled: keep all designations visible
    initParallax();
  });
})();
