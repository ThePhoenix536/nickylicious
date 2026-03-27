/* ============================================
   NICKYLICIOUS — Interactive Behaviors
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- DOM Elements ----
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const navAnchors = navLinks.querySelectorAll('a:not(.nav-cta)');
  const galleryFilters = document.querySelectorAll('.gallery-filter');
  const galleryItems   = document.querySelectorAll('.gallery-item');
  const quoteForm = document.getElementById('quoteForm');

  // ============================================
  // 0. PRELOADER (Video Logo Animation at x2)
  // ============================================
  const preloader = document.getElementById('preloader');
  const preloaderVideo = document.getElementById('preloaderVideo');
  
  if (preloader && preloaderVideo) {
    // Set video to 4x speed as requested
    preloaderVideo.playbackRate = 4.0;
    
    // Hide preloader when video finishes
    function hidePreloader() {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.style.display = 'none', 800); // Wait for transition
    }

    preloaderVideo.addEventListener('ended', hidePreloader);

    // Fallback: If browser blocks autoplay or video fails to load,
    // remove preloader after a max timeout (2 seconds for 4x speed)
    let fallbackTimeout = setTimeout(hidePreloader, 2000);

    preloaderVideo.addEventListener('play', () => {
      // clear the strict 2s fallback and extend it just in case video stalls
      clearTimeout(fallbackTimeout);
      fallbackTimeout = setTimeout(hidePreloader, 3500); 
    });
  }

  // ============================================
  // 1. NAVBAR — Scroll Effect & Active Link
  // ============================================
  let lastScroll = 0;

  function handleNavbarScroll() {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);
    lastScroll = scrollY;
  }

  // Highlight active section in nav
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = navLinks.querySelector(`a[href="#${id}"]`);

      if (link && !link.classList.contains('nav-cta')) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }

  window.addEventListener('scroll', () => {
    handleNavbarScroll();
    updateActiveNav();
  }, { passive: true });

  // ============================================
  // 2. HAMBURGER MENU
  // ============================================
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navAnchors.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Close mobile menu on clicking CTA in nav
  const navCta = navLinks.querySelector('.nav-cta');
  if (navCta) {
    navCta.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  }

  // ============================================
  // 3. GALLERY FILTERS
  // ============================================
  galleryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      galleryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          // Re-trigger reveal animation
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'translateY(0)';
              item.style.transition = 'opacity .4s ease, transform .4s ease';
            });
          });
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // ============================================
  // 4. SCROLL-REVEAL ANIMATIONS
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // 4b. ANIMATED TESTIMONIALS CAROUSEL
  // ============================================
  const atImages = document.querySelectorAll('.at-img');
  const atSlides = document.querySelectorAll('.at-slide');
  const atDots   = document.querySelectorAll('.at-dot');
  const atPrev   = document.getElementById('atPrev');
  const atNext   = document.getElementById('atNext');
  let atCurrent  = 0;
  let atTotal    = atSlides.length;
  let atAutoTimer;

  function goToSlide(index, direction) {
    if (index === atCurrent || !atTotal) return;

    // Exit current image with direction
    const currentImg = document.querySelector('.at-img.active');
    if (currentImg) {
      currentImg.classList.remove('active');
      currentImg.classList.add(direction === 'next' ? 'exit-left' : 'exit-right');
      setTimeout(() => {
        currentImg.classList.remove('exit-left', 'exit-right');
      }, 600);
    }

    // Exit current text
    atSlides[atCurrent].classList.remove('active');

    // Enter new
    atCurrent = index;
    atImages[atCurrent].classList.add('active');
    atSlides[atCurrent].classList.add('active');

    // Update dots
    atDots.forEach(d => d.classList.remove('active'));
    if (atDots[atCurrent]) atDots[atCurrent].classList.add('active');
  }

  function nextSlide() {
    goToSlide((atCurrent + 1) % atTotal, 'next');
  }

  function prevSlide() {
    goToSlide((atCurrent - 1 + atTotal) % atTotal, 'prev');
  }

  function startAutoplay() {
    atAutoTimer = setInterval(nextSlide, 5000);
  }

  function resetAutoplay() {
    clearInterval(atAutoTimer);
    startAutoplay();
  }

  if (atNext) atNext.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (atPrev) atPrev.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
  atDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index);
      const dir = idx > atCurrent ? 'next' : 'prev';
      goToSlide(idx, dir);
      resetAutoplay();
    });
  });

  if (atTotal > 0) startAutoplay();

  // ============================================
  // 5. FORM VALIDATION & SUBMISSION
  // ============================================
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset previous errors
    quoteForm.querySelectorAll('.form-group').forEach(g => {
      g.style.outline = 'none';
    });

    const name      = quoteForm.querySelector('#name');
    const phone     = quoteForm.querySelector('#phone');
    const email     = quoteForm.querySelector('#email');
    const eventType = quoteForm.querySelector('#eventType');
    const guests    = quoteForm.querySelector('#guests');
    const eventDate = quoteForm.querySelector('#eventDate');

    let isValid = true;
    const required = [name, phone, email, eventType, guests, eventDate];

    required.forEach(field => {
      if (!field.value.trim()) {
        field.closest('.form-group').style.outline = '2px solid #FF4500';
        isValid = false;
      }
    });

    // Email validation
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.closest('.form-group').style.outline = '2px solid #FF4500';
      isValid = false;
    }

    if (!isValid) {
      // Scroll to first error
      const firstError = quoteForm.querySelector('.form-group[style*="outline"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 48-hour date block check
    if (dateBlocked) {
      alert('⚠️ La fecha del evento debe ser al menos 48 horas a partir de ahora.');
      eventDateInput.focus();
      return;
    }

    // Build budget cart summary for WhatsApp
    let cartSummary = '';
    let cartTotalVal = 0;
    if (budgetCart.length > 0) {
      cartSummary = budgetCart.map(item => {
        const p = parseInt(item.price.replace(/[^0-9]/g, ''));
        cartTotalVal += (p * item.qty);
        return `  • ${item.name} x${item.qty} ($${(p * item.qty).toLocaleString()})`;
      }).join('\n');
    }

    const formData = {
      name: name.value,
      phone: phone.value,
      email: email.value,
      eventType: eventType.value,
      guests: guests.value,
      eventDate: eventDate.value,
      message: quoteForm.querySelector('#message').value
    };

    // Build WhatsApp message
    const whatsappMessage = encodeURIComponent(
      `* Nueva Solicitud de Cotizacion - Nickylicious *\n\n` +
      `- *Nombre:* ${formData.name}\n` +
      `- *Telefono:* ${formData.phone}\n` +
      `- *Email:* ${formData.email}\n` +
      `- *Tipo de Evento:* ${formData.eventType}\n` +
      `- *Invitados:* ${formData.guests}\n` +
      `- *Fecha:* ${formData.eventDate}\n` +
      (cartSummary ? `- *Presupuesto Seleccionado:*\n${cartSummary}\n\n*Subtotal Estimado:* $${cartTotalVal.toLocaleString()}\n` : '') +
      `- *Mensaje:* ${formData.message || 'Sin mensaje adicional'}`
    );

    const whatsappUrl = `https://wa.me/13477362494?text=${whatsappMessage}`;

    // Show policies modal instead of redirecting directly
    const modal = document.getElementById('policiesModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Accept button — redirect to WhatsApp
    const acceptBtn = document.getElementById('policiesAccept');
    const declineBtn = document.getElementById('policiesDecline');
    const closeBtn = document.getElementById('policiesModalClose');

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function handleAccept() {
      closeModal();
      window.open(whatsappUrl, '_blank');
      quoteForm.reset();
      cleanup();
    }

    function handleDecline() {
      closeModal();
      cleanup();
    }

    function cleanup() {
      acceptBtn.removeEventListener('click', handleAccept);
      declineBtn.removeEventListener('click', handleDecline);
      closeBtn.removeEventListener('click', handleDecline);
      modal.removeEventListener('click', handleOverlayClick);
    }

    function handleOverlayClick(e) {
      if (e.target === modal) handleDecline();
    }

    acceptBtn.addEventListener('click', handleAccept);
    declineBtn.addEventListener('click', handleDecline);
    closeBtn.addEventListener('click', handleDecline);
    modal.addEventListener('click', handleOverlayClick);
  });

  // Clear error outline on input
  quoteForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.closest('.form-group').style.outline = 'none';
    });
  });

  // ============================================
  // 6. SMOOTH SCROLL for anchors
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ============================================
  // 7. PARALLAX on Hero bg (subtle)
  // ============================================
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
      }
    }, { passive: true });
  }

  // ============================================
  // 8. COUNTER ANIMATION (for numbers if present)
  // ============================================
  // Future enhancement

  // ============================================
  // 9. WhatsApp button visibility
  // ============================================
  const whatsapp = document.getElementById('whatsappFloat');
  if (whatsapp) {
    // Hide initially, show after scroll
    whatsapp.style.opacity = '0';
    whatsapp.style.pointerEvents = 'none';
    whatsapp.style.transition = 'opacity .4s ease, transform .3s ease';

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        whatsapp.style.opacity = '1';
        whatsapp.style.pointerEvents = 'auto';
      } else {
        whatsapp.style.opacity = '0';
        whatsapp.style.pointerEvents = 'none';
      }
    }, { passive: true });
  }

  // ============================================
  // 10. DATE BLOCKING: 48-hour minimum
  // ============================================
  const eventDateInput = document.getElementById('eventDate');
  const dateWarning = document.getElementById('dateWarning');
  let dateBlocked = false;

  function get48hMinDate() {
    const min48 = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const yyyy = min48.getFullYear();
    const mm   = String(min48.getMonth() + 1).padStart(2, '0');
    const dd   = String(min48.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  if (eventDateInput) {
    eventDateInput.setAttribute('min', get48hMinDate());

    eventDateInput.addEventListener('change', () => {
      const selectedDate = new Date(eventDateInput.value + 'T23:59:59');
      const minAllowed   = new Date(Date.now() + 48 * 60 * 60 * 1000);

      if (selectedDate < minAllowed) {
        dateBlocked = true;
        if (dateWarning) dateWarning.style.display = 'block';
        eventDateInput.closest('.form-group').style.outline = '2px solid #ff4444';
      } else {
        dateBlocked = false;
        if (dateWarning) dateWarning.style.display = 'none';
        eventDateInput.closest('.form-group').style.outline = '';
      }
    });
  }

  // ============================================
  // 10b. BUDGET CART SYSTEM (with Quantities & Toggle)
  // ============================================
  const budgetCart = [];
  const budgetFloat = document.getElementById('budgetFloat');
  const budgetCount = document.getElementById('budgetCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartBody = document.getElementById('cartBody');
  const cartTotal = document.getElementById('cartTotal');
  const cartClose = document.getElementById('cartClose');
  const cartClear = document.getElementById('cartClear');
  const cartQuoteBtn = document.getElementById('cartQuote');
  const orderSubtotalDisplay = document.getElementById('orderSubtotalDisplay');

  function updateCartUI() {
    // Calculate total item count (sums up quantities)
    const totalItems = budgetCart.reduce((sum, item) => sum + item.qty, 0);

    // Update floating badge
    if (budgetFloat) {
      budgetFloat.style.display = budgetCart.length > 0 ? 'flex' : 'none';
      if (budgetCount) budgetCount.textContent = totalItems;
    }

    // Calculate total price
    const total = budgetCart.reduce((sum, item) => {
      const p = parseInt(item.price.replace(/[^0-9]/g, ''));
      return sum + (p * item.qty);
    }, 0);

    // Update drawer body
    if (cartBody) {
      if (budgetCart.length === 0) {
        cartBody.innerHTML = '<p class="cart-empty">No has añadido productos aún.</p>';
      } else {
        cartBody.innerHTML = budgetCart.map((item, i) => `
          <div class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name} (x${item.qty})</div>
              <div class="cart-item-price">$${(parseInt(item.price.replace(/[^0-9]/g, '')) * item.qty).toLocaleString()}</div>
            </div>
            <button class="cart-item-remove" data-index="${i}" title="Eliminar">&times;</button>
          </div>
        `).join('');

        // Remove buttons
        cartBody.querySelectorAll('.cart-item-remove').forEach(btn => {
          btn.addEventListener('click', () => {
             const idx = parseInt(btn.dataset.index);
             budgetCart.splice(idx, 1);
             updateCartUI();
             updateAddButtons();
          });
        });
      }
    }

    // Update form subtotal display
    if (orderSubtotalDisplay) {
      if (budgetCart.length === 0) {
        orderSubtotalDisplay.innerHTML = '<p class="empty-subtotal">Aún no has añadido productos al carrito.</p>';
      } else {
        const itemsHtml = budgetCart.map(item => `
          <div class="subtotal-item">
            <span>${item.name} <strong>x${item.qty}</strong></span>
            <span>$${(parseInt(item.price.replace(/[^0-9]/g, '')) * item.qty).toLocaleString()}</span>
          </div>
        `).join('');
        
        orderSubtotalDisplay.innerHTML = `
          ${itemsHtml}
          <div class="subtotal-divider"></div>
          <div class="subtotal-total">
            <span>Subtotal Estimado:</span>
            <span>$${total.toLocaleString()}</span>
          </div>
        `;
      }
    }

    // Update total text in drawer
    if (cartTotal) {
      cartTotal.textContent = `$${total.toLocaleString()}`;
    }
  }

  function updateAddButtons() {
    document.querySelectorAll('.btn-cart').forEach(btn => {
      const productName = btn.dataset.product;
      const inCart = budgetCart.some(item => item.name === productName);
      if (inCart) {
        btn.classList.add('added');
        btn.innerHTML = '❌ Quitar';
      } else {
        btn.classList.remove('added');
        btn.innerHTML = '➕ Añadir';
      }
    });
  }

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Handle +/- quantity buttons on catalog cards
  document.querySelectorAll('.qty-wrapper').forEach(wrapper => {
    const minusBtn = wrapper.querySelector('.minus');
    const plusBtn = wrapper.querySelector('.plus');
    const input = wrapper.querySelector('.qty-input');
    const productName = input.dataset.product;

    function _updateQty(newVal) {
      if (newVal < 1) newVal = 1;
      if (newVal > 1000) newVal = 1000;
      input.value = newVal;
      
      // If already in cart, dynamically update cart
      const cartItem = budgetCart.find(item => item.name === productName);
      if (cartItem) {
        cartItem.qty = newVal;
        updateCartUI();
      }
    }

    if (minusBtn) minusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _updateQty(parseInt(input.value || 1) - 1);
    });

    if (plusBtn) plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _updateQty(parseInt(input.value || 1) + 1);
    });

    if (input) input.addEventListener('change', (e) => {
      _updateQty(parseInt(e.target.value || 1));
    });
  });

  // Add-to-cart (Toggle) buttons on catalog cards
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const productName = btn.dataset.product;
      const productPrice = btn.dataset.price;
      
      // Find the associated quantity input
      const wrapper = btn.closest('.cart-controls');
      let qty = 1;
      if (wrapper) {
        const input = wrapper.querySelector('.qty-input');
        if (input) qty = parseInt(input.value || 1);
      }

      const existingIndex = budgetCart.findIndex(item => item.name === productName);

      if (existingIndex >= 0) {
        // Toggle OFF (Remove from cart)
        budgetCart.splice(existingIndex, 1);
      } else {
        // Toggle ON (Add to cart)
        budgetCart.push({ name: productName, price: productPrice, qty: qty });
      }
      
      updateCartUI();
      updateAddButtons();
    });
  });

  // Float badge & Overlay bindings
  if (budgetFloat) budgetFloat.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Clear cart
  if (cartClear) {
    cartClear.addEventListener('click', () => {
      budgetCart.length = 0;
      updateCartUI();
      updateAddButtons();
    });
  }

  // "Request Quote" from cart drawer → scroll to form + close
  if (cartQuoteBtn) {
    cartQuoteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeCart();

      // Scroll to the form
      const quoteSection = document.getElementById('quote');
      if (quoteSection) {
        setTimeout(() => {
          quoteSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    });
  }

  // Initial setup for the form Subtotal empty state
  updateCartUI();

  // Initial calls
  handleNavbarScroll();

  // ============================================
  // 11. CUSTOM LANGUAGE SWITCHER
  // ============================================
  const customLangSwitcher = document.getElementById('customLangSwitcher');
  const langSwitcherBtn    = document.getElementById('langSwitcherBtn');
  const langCurrent        = document.getElementById('langCurrent');
  const langOptions        = document.querySelectorAll('.lang-option');
  
  let currentLang = 'es';

  // Translation dictionary
  const translations = {
    en: {
      // Navbar
      'nav.nosotros': 'About Us',
      'nav.catalogo': 'Catalog',
      'nav.proceso': 'Process',
      'nav.galeria': 'Gallery',
      'nav.resenas': 'Reviews',
      'nav.contacto': 'Contact',
      'nav.cotizar': 'Get Quote',
      // Footer Links
      'footer.nav1': 'About Us',
      'footer.nav2': 'Catalog',
      'footer.nav3': 'Process',
      'footer.nav4': 'Gallery',
      'footer.nav5': 'Reviews',
      'footer.serv1': 'Hot & Cold Appetizers',
      'footer.serv2': 'Charcuterie',
      'footer.serv3': 'Desserts',
      'footer.serv4': 'Catering',
      'footer.serv5': 'Special Menus',
      // Hero
      'hero.badge': '🔥 Premium Artisan Catering',
      'hero.subtitle': 'Every bite tells a story. We create artisan culinary experiences for your most important moments — with the warmth of homemade and the quality of professional service.',
      'hero.cta1': 'View Catalog 🍽️',
      'hero.cta2': 'Request Quote',
      'hero.scroll': 'Discover',
      'hero.title.tagline': 'Flavor that Brings People Together',
      // About
      'about.title': 'About Us',
      'about.tagline': 'Home Cooked Meals <span>&</span> Sweet Treats',
      'about.p1': 'Nickylicious brings delicious finger food, Dominican sweet treats and global cuisine service to the New York area homes and venues. We create delicious and inspired dishes using only the freshest ingredients, emphasizing taste and exemplary style.',
      'about.p2': 'Talk to us about your next event. We are here to cater to your every need, making your life easier and more delicious all at once.',
      'about.cta': 'Get a Quote',
      // Catalog
      'catalog.title': 'Our Catalog',
      'catalog.subtitle': 'From countless to unforgettable — explore our artisan creations',
      'catalog.picaderas.title': 'Hot & Cold Appetizers',
      'catalog.picaderas.desc': 'Artisan starters and bites that open any event with flavor. Mini empanadas, bruschettas, croquettes, and more — all made with fresh ingredients daily.',
      'catalog.charcuteria.title': 'Cheese & Charcuterie Boards',
      'catalog.charcuteria.desc': 'Handcrafted gourmet boards with artisan cheeses, premium cold cuts, fresh fruits, nuts, and select accompaniments. Perfect for sharing at any gathering.',
      'catalog.postres.title': 'Custom Desserts & Sweets',
      'catalog.postres.desc': 'Decorated cakes, themed cupcakes, shot desserts in crystal glasses, macarons, and signature sweets. Each creation is a sweet canvas designed for your celebration.',
      'catalog.catering.title': 'Large-Scale Event Catering',
      'catalog.catering.desc': 'Full catering service for weddings, galas, corporate events, and large-format celebrations. Includes setup, service, tableware, and total menu coordination.',
      'catalog.menus.title': 'Special & Themed Menus',
      'catalog.menus.desc': 'Vegan, gluten-free, healthy options and custom themed menus. Because every guest deserves to enjoy worry-free — with the same artisan flavor of Nickylicious.',
      'catalog.cotizar': 'Quote',
      'catalog.payment': '💳 Accepted payments: <span>Cash</span> or <span>card</span> on delivery. No hassles.',
      'badge.express': '⚡ 24-48h Delivery',
      'badge.quote': '📋 Quote 1-2 weeks',
      // Process
      'process.title': 'How Does It Work?',
      'process.subtitle': 'Your perfect event in 4 simple steps',
      'process.s1.title': 'Choose Your Product',
      'process.s1.desc': 'Browse our catalog and select what you need for your event.',
      'process.s2.title': 'Request a Quote',
      'process.s2.desc': 'Fill out the form or text us on WhatsApp with the details.',
      'process.s3.title': 'We Confirm & Coordinate',
      'process.s3.desc': 'We confirm your order, agree on details, and prepare everything with love.',
      'process.s4.title': 'Enjoy Your Event!',
      'process.s4.desc': 'We deliver on time and you just enjoy the moment.',
      // Gallery
      'gallery.title': 'Our Portfolio',
      'gallery.subtitle': 'Moments we cook with love — events that speak for us',
      'gallery.all': 'All',
      'gallery.corporativo': 'Corporate',
      'gallery.social': 'Social',
      'gallery.postres': 'Desserts',
      'gallery.catering': 'Full Catering',
      // Testimonials
      'testimonials.title': 'What Our Clients Say',
      'testimonials.subtitle': 'Real stories from memorable events',
      'testimonial1.text': '"Nickylicious transformed our wedding into something magical. Guests couldn\'t stop talking about the food — the charcuterie board was a total hit. You can tell every dish is made with real love."',
      'testimonial1.event': 'Wedding — 150 guests',
      'testimonial2.text': '"We hired Nickylicious for our product launch and they exceeded all expectations. Punctual service, impeccable presentation, and a flavor that left the whole team impressed."',
      'testimonial2.event': 'Corporate Event — TechCorp',
      'testimonial3.text': '"The custom cupcakes for my daughter\'s baptism were a work of art. Nicky understood exactly what I wanted and even surprised me with extra details. 100% recommended!"',
      'testimonial3.event': 'Baptism — Dessert table',
      // Policies
      'policies.title': 'Order Policies',
      'policies.subtitle': 'Please read before placing your order',
      'policy.1.title': 'Advance Notice',
      'policy.1.desc': 'Orders must be placed at least <strong>1.5 weeks</strong> in advance.',
      'policy.2.title': 'Deposit Required',
      'policy.2.desc': 'A <strong>$10 NON-REFUNDABLE</strong> deposit is required to confirm your order.',
      'policy.3.title': 'Full Payment',
      'policy.3.desc': 'Orders must be paid in full <strong>before the delivery date</strong>. If payment is not received, the order will not be valid.',
      'policy.4.title': 'Content Not Accepted',
      'policy.4.desc': 'We DO NOT accept orders with sexually explicit or drug-related content.',
      'policy.5.title': 'Post-Delivery Responsibility',
      'policy.5.desc': 'Once your order is received, we are no longer responsible for it.',
      'policy.6.title': 'No Refunds',
      'policy.6.desc': 'No refunds are issued once the order is confirmed.',
      'policy.7.title': 'Order Details',
      'policy.7.desc': 'When placing an order, please be as detailed as possible or send reference photos.',
      'policies.decline': 'Cancel',
      'policies.accept': 'Accept, Continue to WhatsApp',
      // Announcement
      'announce.title': 'Important! Read before ordering',
      'announce.text': 'Remember: orders require <strong>1.5 weeks</strong> advance notice and a <strong>$10 deposit</strong> (non-refundable). Full payment must be made before the delivery date. No refunds accepted. <a href="#policies">View all policies →</a>',
      // Quote Form
      'quote.title': 'Request Your Quote',
      'quote.subtitle': 'Tell us about your event and we\'ll create the perfect proposal for you',
      'form.name': 'Full Name *',
      'form.name.ph': 'Your full name',
      'form.phone': 'Phone / WhatsApp *',
      'form.phone.ph': '(809) 000-0000',
      'form.email': 'Email *',
      'form.email.ph': 'your@email.com',
      'form.eventType': 'Event Type *',
      'form.eventType.ph': 'Select event type',
      'form.eventType.boda': 'Wedding',
      'form.eventType.corporativo': 'Corporate Event',
      'form.eventType.bautizo': 'Baptism',
      'form.eventType.cumple': 'Birthday',
      'form.eventType.fiesta': 'Party / Celebration',
      'form.eventType.reunion': 'Meeting / Brunch',
      'form.eventType.otro': 'Other',
      'form.guests': 'Estimated Number of Guests *',
      'form.guests.ph': 'e.g: 50',
      'form.date': 'Event Date *',
      'form.services': 'Products or Services of Interest',
      'form.service1': 'Hot & Cold Appetizers',
      'form.service2': 'Cheese & Charcuterie Boards',
      'form.service3': 'Custom Desserts & Sweets',
      'form.service4': 'Large-Scale Catering',
      'form.service5': 'Special & Themed Menus',
      'form.message': 'Additional Message / Special Needs',
      'form.message.ph': 'Tell us more about your event, food allergies, special preferences, theme, etc.',
      'form.submit': '🔥 I Want My Quote',
      // Contact
      'contact.title': 'Contact Us',
      'contact.subtitle': 'We\'re one message away from making your event unforgettable',
      'contact.phone': 'Phone',
      'contact.whatsapp': 'WhatsApp',
      'contact.whatsapp.link': '+1 (347) 736-2494 — Text us directly',
      'contact.email': 'Email',
      'contact.location': 'Location',
      'contact.hours': 'Business Hours',
      'contact.hours.week': 'Monday to Friday: 8:00 AM — 6:00 PM',
      'contact.hours.sat': 'Saturdays: 9:00 AM — 3:00 PM',
      // Footer
      'footer.desc': 'Artisan flavor that brings people together. Premium catering for your most special moments, with the warmth of homemade.',
      'footer.nav': 'NAVIGATION',
      'footer.services': 'SERVICES',
      'footer.contact': 'CONTACT',
      'footer.copyright': '© 2026 Nickylicious. All rights reserved. Made with 🔥 and lots of love.',
      'footer.payment': '💳 Payments: Cash or card on delivery.',
    },
    es: {
      'nav.nosotros': 'Nosotros',
      'nav.catalogo': 'Catálogo',
      'nav.proceso': 'Proceso',
      'nav.galeria': 'Galería',
      'nav.resenas': 'Reseñas',
      'nav.contacto': 'Contacto',
      'nav.cotizar': 'Cotizar',
      // Footer Links
      'footer.nav1': 'Nosotros',
      'footer.nav2': 'Catálogo',
      'footer.nav3': 'Proceso',
      'footer.nav4': 'Galería',
      'footer.nav5': 'Reseñas',
      'footer.serv1': 'Picaderas',
      'footer.serv2': 'Charcutería',
      'footer.serv3': 'Postres',
      'footer.serv4': 'Catering',
      'footer.serv5': 'Menús Especiales',
      'hero.badge': '🔥 Catering Artesanal Premium',
      'hero.subtitle': 'Cada bocado cuenta una historia. Creamos experiencias gastronómicas artesanales para tus momentos más importantes — con el calor de lo hecho en casa y la calidad de un servicio profesional.',
      'hero.cta1': 'Ver Catálogo 🍽️',
      'hero.cta2': 'Solicitar Cotización',
      'hero.scroll': 'Descubre',
      'hero.title.tagline': 'Sabor que Reúne Personas',
      'about.title': 'Sobre Nosotros',
      'about.tagline': 'Comida Casera <span>&</span> Dulces Artesanales',
      'about.p1': 'Nickylicious trae deliciosos bocadillos, dulces dominicanos y cocina global a hogares y venues del área de Nueva York. Creamos platos deliciosos e inspirados usando solo los ingredientes más frescos, enfatizando el sabor y un estilo ejemplar.',
      'about.p2': 'Hablemos de tu próximo evento. Estamos aquí para atender cada necesidad, haciendo tu vida más fácil y más deliciosa al mismo tiempo.',
      'about.cta': 'Solicitar Cotización',
      'catalog.title': 'Nuestro Catálogo',
      'catalog.subtitle': 'Del incontable al inolvidable — explora nuestras creaciones artesanales',
      'catalog.picaderas.title': 'Picaderas Frías y Calientes',
      'catalog.picaderas.desc': 'Entrantes y bocadillos artesanales que abren cualquier evento con sabor. Mini empanadas, bruschettas, croquetas, y más — todos hechos con ingredientes frescos del día.',
      'catalog.charcuteria.title': 'Tablas de Quesos y Charcutería',
      'catalog.charcuteria.desc': 'Tablas gourmet armadas a mano con quesos artesanales, embutidos premium, frutas frescas, frutos secos y acompañamientos selectos. Perfectas para compartir en cualquier reunión.',
      'catalog.postres.title': 'Postres y Dulces Personalizados',
      'catalog.postres.desc': 'Cakes decorados, cupcakes temáticos, shot desserts en vasitos de cristal, macarons y dulces de autor. Cada creación es un lienzo dulce diseñado para tu celebración.',
      'catalog.catering.title': 'Catering para Eventos a Gran Escala',
      'catalog.catering.desc': 'Servicio completo de catering para bodas, galas, eventos corporativos y celebraciones de gran formato. Incluye montaje, servicio, vajilla y coordinación total del menú.',
      'catalog.menus.title': 'Menús Especiales y Temáticos',
      'catalog.menus.desc': 'Opciones veganas, sin gluten, saludables y menús temáticos personalizados. Porque cada invitado merece disfrutar sin preocuparse — con el mismo sabor artesanal de Nickylicious.',
      'catalog.cotizar': 'Cotizar',
      'catalog.payment': '💳 Pagos aceptados: <span>Efectivo</span> o <span>tarjeta</span> contra entrega. Sin complicaciones.',
      'badge.express': '⚡ Entrega 24-48h',
      'badge.quote': '📋 Cotización 1-2 semanas',
      'process.title': '¿Cómo Funciona?',
      'process.subtitle': 'Tu evento perfecto en 4 simples pasos',
      'process.s1.title': 'Elige tu Producto',
      'process.s1.desc': 'Explora nuestro catálogo y selecciona lo que necesitas para tu evento.',
      'process.s2.title': 'Solicita Cotización',
      'process.s2.desc': 'Completa el formulario o escríbenos por WhatsApp con los detalles.',
      'process.s3.title': 'Confirmamos y Coordinamos',
      'process.s3.desc': 'Confirmamos tu pedido, acordamos detalles y preparamos todo con cariño.',
      'process.s4.title': '¡Disfruta tu Evento!',
      'process.s4.desc': 'Entregamos puntualmente y tú solo te dedicas a disfrutar el momento.',
      'gallery.title': 'Nuestro Portafolio',
      'gallery.subtitle': 'Momentos que cocinamos con amor — eventos que hablan por nosotros',
      'gallery.all': 'Todos',
      'gallery.corporativo': 'Corporativo',
      'gallery.social': 'Social',
      'gallery.postres': 'Postres',
      'gallery.catering': 'Catering Completo',
      'testimonials.title': 'Lo que Dicen Nuestros Clientes',
      'testimonials.subtitle': 'Historias reales de eventos memorables',
      'testimonial1.text': '"Nickylicious transformó nuestra boda en algo mágico. Los invitados no paraban de hablar de la comida — la tabla de charcutería fue un éxito total. Se nota que cada plato está hecho con amor real."',
      'testimonial1.event': 'Boda — 150 invitados',
      'testimonial2.text': '"Contratamos a Nickylicious para el lanzamiento de nuestro producto y superaron todas las expectativas. Servicio puntual, presentación impecable y un sabor que dejó a todo el equipo impresionado."',
      'testimonial2.event': 'Evento Corporativo — TechCorp',
      'testimonial3.text': '"Los cupcakes personalizados para el bautizo de mi hija fueron una obra de arte. Nicky entendió exactamente lo que quería y hasta me sorprendió con detalles extra. ¡100% recomendados!"',
      'testimonial3.event': 'Bautizo — Mesa de dulces',
      'policies.title': 'Políticas de Pedido',
      'policies.subtitle': 'Por favor lee antes de realizar tu orden',
      'policy.1.title': 'Tiempo de Anticipación',
      'policy.1.desc': 'Los pedidos deben realizarse con al menos <strong>1.5 semanas</strong> de anticipación.',
      'policy.2.title': 'Depósito Requerido',
      'policy.2.desc': 'Se requiere un depósito de <strong>$10 NO REEMBOLSABLE</strong> para confirmar tu orden.',
      'policy.3.title': 'Pago Completo',
      'policy.3.desc': 'Los pedidos deben pagarse en su totalidad <strong>antes de la fecha de entrega</strong>. Si no se recibe el pago, la orden no será válida.',
      'policy.4.title': 'Contenido No Aceptado',
      'policy.4.desc': 'NO aceptamos pedidos con contenido sexual explícito o relacionado con drogas.',
      'policy.5.title': 'Responsabilidad Post-Entrega',
      'policy.5.desc': 'Una vez recibida tu orden, no somos responsables por la misma.',
      'policy.6.title': 'Sin Reembolsos',
      'policy.6.desc': 'No se realizan reembolsos una vez confirmada la orden.',
      'policy.7.title': 'Detalles del Pedido',
      'policy.7.desc': 'Al realizar un pedido, sé lo más detallado/a posible o envía fotos de referencia.',
      'policies.decline': 'Cancelar',
      'policies.accept': 'Acepto, Continuar a WhatsApp',
      'announce.title': '¡Importante! Lee antes de ordenar',
      'announce.text': 'Recuerda: los pedidos requieren <strong>1.5 semanas</strong> de anticipación y un <strong>depósito de $10</strong> (no reembolsable). El pago completo debe realizarse antes de la fecha de entrega. No se aceptan reembolsos. <a href="#policies">Ver todas las políticas →</a>',
      'quote.title': 'Solicita tu Cotización',
      'quote.subtitle': 'Cuéntanos sobre tu evento y creamos la propuesta perfecta para ti',
      'form.name': 'Nombre Completo *',
      'form.name.ph': 'Tu nombre completo',
      'form.phone': 'Teléfono / WhatsApp *',
      'form.phone.ph': '(809) 000-0000',
      'form.email': 'Correo Electrónico *',
      'form.email.ph': 'tu@email.com',
      'form.eventType': 'Tipo de Evento *',
      'form.eventType.ph': 'Selecciona el tipo de evento',
      'form.eventType.boda': 'Boda',
      'form.eventType.corporativo': 'Evento Corporativo',
      'form.eventType.bautizo': 'Bautizo',
      'form.eventType.cumple': 'Cumpleaños',
      'form.eventType.fiesta': 'Fiesta / Celebración',
      'form.eventType.reunion': 'Reunión / Brunch',
      'form.eventType.otro': 'Otro',
      'form.guests': 'Número de Personas Estimado *',
      'form.guests.ph': 'Ej: 50',
      'form.date': 'Fecha del Evento *',
      'form.services': 'Productos o Servicios de Interés',
      'form.service1': 'Picaderas Frías y Calientes',
      'form.service2': 'Tablas de Quesos y Charcutería',
      'form.service3': 'Postres y Dulces Personalizados',
      'form.service4': 'Catering a Gran Escala',
      'form.service5': 'Menús Especiales y Temáticos',
      'form.message': 'Mensaje Adicional / Necesidades Especiales',
      'form.message.ph': 'Cuéntanos más sobre tu evento, alergias alimentarias, preferencias especiales, temática, etc.',
      'form.submit': '🔥 Quiero mi Cotización',
      'contact.title': 'Contáctanos',
      'contact.subtitle': 'Estamos a un mensaje de hacer tu evento inolvidable',
      'contact.phone': 'Teléfono',
      'contact.whatsapp': 'WhatsApp',
      'contact.whatsapp.link': '+1 (347) 736-2494 — Escríbenos directo',
      'contact.email': 'Correo Electrónico',
      'contact.location': 'Ubicación',
      'contact.hours': 'Horario de Atención',
      'contact.hours.week': 'Lunes a Viernes: 8:00 AM — 6:00 PM',
      'contact.hours.sat': 'Sábados: 9:00 AM — 3:00 PM',
      'footer.desc': 'Sabor artesanal que reúne personas. Catering premium para tus momentos más especiales, con la calidez de lo hecho en casa.',
      'footer.nav': 'NAVEGACIÓN',
      'footer.services': 'SERVICIOS',
      'footer.contact': 'CONTACTO',
      'footer.copyright': '© 2026 Nickylicious. Todos los derechos reservados. Hecho con 🔥 y mucho amor.',
      'footer.payment': '💳 Pagos: Efectivo o tarjeta contra entrega.'
    }
  };

  // Map of data-i18n keys to their DOM elements
  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = translations[lang]?.[key];
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else if (el.tagName === 'OPTION') {
          el.textContent = text;
        } else if (text.includes('<span>') || text.includes('<strong>') || text.includes('<a ')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';
  }

  // Add data-i18n attributes to all translatable elements
  function addI18nAttributes() {
    // Navbar links
    const navLinksList = navLinks.querySelectorAll('a:not(.nav-cta)');
    const navKeys = ['nav.nosotros','nav.catalogo','nav.proceso','nav.galeria','nav.resenas','nav.contacto'];
    navLinksList.forEach((a, i) => { if (navKeys[i]) a.setAttribute('data-i18n', navKeys[i]); });
    const ctaBtn = navLinks.querySelector('.nav-cta');
    if (ctaBtn) ctaBtn.setAttribute('data-i18n', 'nav.cotizar');

    // Hero
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) heroBadge.setAttribute('data-i18n', 'hero.badge');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.setAttribute('data-i18n', 'hero.subtitle');
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    if (heroButtons[0]) heroButtons[0].setAttribute('data-i18n', 'hero.cta1');
    if (heroButtons[1]) heroButtons[1].setAttribute('data-i18n', 'hero.cta2');
    const scrollText = document.querySelector('.scroll-indicator span');
    if (scrollText) scrollText.setAttribute('data-i18n', 'hero.scroll');
    // Hero tagline (second text node in h1)
    const heroH1 = document.querySelector('.hero-title');
    if (heroH1) {
      const textNodes = [...heroH1.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
      if (textNodes.length) {
        const span = document.createElement('span');
        span.setAttribute('data-i18n', 'hero.title.tagline');
        span.textContent = textNodes[textNodes.length - 1].textContent.trim();
        heroH1.replaceChild(span, textNodes[textNodes.length - 1]);
      }
    }

    // About
    document.querySelector('.about-title')?.setAttribute('data-i18n', 'about.title');
    document.querySelector('.about-tagline')?.setAttribute('data-i18n', 'about.tagline');
    const aboutDescs = document.querySelectorAll('.about-desc');
    if (aboutDescs[0]) aboutDescs[0].setAttribute('data-i18n', 'about.p1');
    if (aboutDescs[1]) aboutDescs[1].setAttribute('data-i18n', 'about.p2');
    document.querySelector('.about-cta')?.setAttribute('data-i18n', 'about.cta');

    // Catalog
    document.querySelector('#catalog .section-title')?.setAttribute('data-i18n', 'catalog.title');
    document.querySelector('#catalog .section-subtitle')?.setAttribute('data-i18n', 'catalog.subtitle');
    const cards = document.querySelectorAll('.product-card');
    const cardKeys = ['picaderas','charcuteria','postres','catering','menus'];
    cards.forEach((card, i) => {
      const k = cardKeys[i];
      if (k) {
        card.querySelector('h3')?.setAttribute('data-i18n', `catalog.${k}.title`);
        card.querySelector('.product-card-body > p')?.setAttribute('data-i18n', `catalog.${k}.desc`);
        card.querySelector('.btn')?.setAttribute('data-i18n', 'catalog.cotizar');
        const badge = card.querySelector('.product-badge');
        if (badge) badge.setAttribute('data-i18n', badge.classList.contains('badge-express') ? 'badge.express' : 'badge.quote');
      }
    });
    document.querySelector('.payment-note')?.setAttribute('data-i18n', 'catalog.payment');

    // Process
    document.querySelector('#process .section-title')?.setAttribute('data-i18n', 'process.title');
    document.querySelector('#process .section-subtitle')?.setAttribute('data-i18n', 'process.subtitle');
    const steps = document.querySelectorAll('.step');
    for (let i = 0; i < steps.length; i++) {
      steps[i].querySelector('h3')?.setAttribute('data-i18n', `process.s${i+1}.title`);
      steps[i].querySelector('p')?.setAttribute('data-i18n', `process.s${i+1}.desc`);
    }

    // Gallery
    document.querySelector('#gallery .section-title')?.setAttribute('data-i18n', 'gallery.title');
    document.querySelector('#gallery .section-subtitle')?.setAttribute('data-i18n', 'gallery.subtitle');
    const filters = document.querySelectorAll('.gallery-filter');
    const fKeys = ['gallery.all','gallery.corporativo','gallery.social','gallery.postres','gallery.catering'];
    filters.forEach((f, i) => { if (fKeys[i]) f.setAttribute('data-i18n', fKeys[i]); });

    // Testimonials
    document.querySelector('#testimonials .section-title')?.setAttribute('data-i18n', 'testimonials.title');
    document.querySelector('#testimonials .section-subtitle')?.setAttribute('data-i18n', 'testimonials.subtitle');
    const tCards = document.querySelectorAll('.testimonial-card');
    tCards.forEach((t, i) => {
      t.querySelector('blockquote')?.setAttribute('data-i18n', `testimonial${i+1}.text`);
      t.querySelector('.testimonial-author p')?.setAttribute('data-i18n', `testimonial${i+1}.event`);
    });

    // Policies (Modal)
    document.querySelector('.policies-modal-title')?.setAttribute('data-i18n', 'policies.title');
    document.querySelector('.policies-modal-subtitle')?.setAttribute('data-i18n', 'policies.subtitle');
    const policyItems = document.querySelectorAll('.pm-item');
    policyItems.forEach((item, i) => {
      // The modal doesn't have an h4 for titles anymore, just a p tag containing the description
      item.querySelector('p')?.setAttribute('data-i18n', `policy.${i+1}.desc`);
    });
    document.querySelector('#policiesDecline')?.setAttribute('data-i18n', 'policies.decline');
    document.querySelector('#policiesAccept')?.setAttribute('data-i18n', 'policies.accept');

    // Announcement (Old banner - keeping it safe in case it's used elsewhere, but maybe removed from DOM)
    document.querySelector('.announcement-content h4')?.setAttribute('data-i18n', 'announce.title');
    document.querySelector('.announcement-content p')?.setAttribute('data-i18n', 'announce.text');

    // Quote form
    document.querySelector('#quote .section-title')?.setAttribute('data-i18n', 'quote.title');
    document.querySelector('#quote .section-subtitle')?.setAttribute('data-i18n', 'quote.subtitle');
    document.querySelector('label[for="name"]')?.setAttribute('data-i18n', 'form.name');
    document.querySelector('#name')?.setAttribute('data-i18n', 'form.name.ph');
    document.querySelector('label[for="phone"]')?.setAttribute('data-i18n', 'form.phone');
    document.querySelector('#phone')?.setAttribute('data-i18n', 'form.phone.ph');
    document.querySelector('label[for="email"]')?.setAttribute('data-i18n', 'form.email');
    document.querySelector('#email')?.setAttribute('data-i18n', 'form.email.ph');
    document.querySelector('label[for="eventType"]')?.setAttribute('data-i18n', 'form.eventType');
    const options = document.querySelectorAll('#eventType option');
    const optKeys = ['form.eventType.ph','form.eventType.boda','form.eventType.corporativo','form.eventType.bautizo','form.eventType.cumple','form.eventType.fiesta','form.eventType.reunion','form.eventType.otro'];
    options.forEach((o, i) => { if (optKeys[i]) o.setAttribute('data-i18n', optKeys[i]); });
    document.querySelector('label[for="guests"]')?.setAttribute('data-i18n', 'form.guests');
    document.querySelector('#guests')?.setAttribute('data-i18n', 'form.guests.ph');
    document.querySelector('label[for="eventDate"]')?.setAttribute('data-i18n', 'form.date');
    const servicesLabel = document.querySelector('.checkbox-group')?.previousElementSibling;
    if (servicesLabel?.tagName === 'LABEL') servicesLabel.setAttribute('data-i18n', 'form.services');
    const cbLabels = document.querySelectorAll('.checkbox-label');
    for (let i = 0; i < cbLabels.length; i++) {
      // Set data-i18n on the text content wrapper
      const txt = cbLabels[i].childNodes;
      for (const n of txt) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          const sp = document.createElement('span');
          sp.setAttribute('data-i18n', `form.service${i+1}`);
          sp.textContent = n.textContent.trim();
          cbLabels[i].replaceChild(sp, n);
          break;
        }
      }
    }
    document.querySelector('label[for="message"]')?.setAttribute('data-i18n', 'form.message');
    document.querySelector('#message')?.setAttribute('data-i18n', 'form.message.ph');
    document.querySelector('.form-submit .btn')?.setAttribute('data-i18n', 'form.submit');

    // Contact
    document.querySelector('#contact .section-title')?.setAttribute('data-i18n', 'contact.title');
    document.querySelector('#contact .section-subtitle')?.setAttribute('data-i18n', 'contact.subtitle');
    const contactH4s = document.querySelectorAll('.contact-item h4');
    const contactKeys = ['contact.phone','contact.whatsapp','contact.email','contact.location','contact.hours'];
    contactH4s.forEach((h, i) => { if (contactKeys[i]) h.setAttribute('data-i18n', contactKeys[i]); });
    const waLink = document.querySelector('.contact-item a[href*="wa.me"]');
    if (waLink) waLink.setAttribute('data-i18n', 'contact.whatsapp.link');
    const hourPs = document.querySelectorAll('.contact-item:last-child p');
    if (hourPs[0]) hourPs[0].setAttribute('data-i18n', 'contact.hours.week');
    if (hourPs[1]) hourPs[1].setAttribute('data-i18n', 'contact.hours.sat');

    // Footer
    document.querySelector('.footer-brand p')?.setAttribute('data-i18n', 'footer.desc');
    const footerCols = document.querySelectorAll('.footer-col h4');
    const fColKeys = ['footer.nav','footer.services','footer.contact'];
    footerCols.forEach((h, i) => { if (fColKeys[i]) h.setAttribute('data-i18n', fColKeys[i]); });
    
    if (footerCols.length >= 2) {
      const navColLinks = footerCols[0].parentElement.querySelectorAll('a');
      const fNavKeys = ['footer.nav1','footer.nav2','footer.nav3','footer.nav4','footer.nav5'];
      navColLinks.forEach((a, i) => { if (fNavKeys[i]) a.setAttribute('data-i18n', fNavKeys[i]); });

      const servColLinks = footerCols[1].parentElement.querySelectorAll('a');
      const fServKeys = ['footer.serv1','footer.serv2','footer.serv3','footer.serv4','footer.serv5'];
      servColLinks.forEach((a, i) => { if (fServKeys[i]) a.setAttribute('data-i18n', fServKeys[i]); });
    }

    const footerCopy = document.querySelector('.footer-bottom p:first-child');
    if (footerCopy) footerCopy.setAttribute('data-i18n', 'footer.copyright');
    const footerPay = document.querySelector('.footer-bottom .payment-info');
    if (footerPay) footerPay.setAttribute('data-i18n', 'footer.payment');
  }

  // Initialize i18n attributes
  addI18nAttributes();

  // Custom Language dropdown toggle
  if (langSwitcherBtn && customLangSwitcher) {
    langSwitcherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      customLangSwitcher.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!customLangSwitcher.contains(e.target)) {
        customLangSwitcher.classList.remove('active');
      }
    });
  }

  // Handle Option Selection
  if (langOptions.length > 0) {
    langOptions.forEach(option => {
      option.addEventListener('click', () => {
        const selectedLang = option.getAttribute('data-value');
        currentLang = selectedLang;
        if (langCurrent) langCurrent.textContent = selectedLang.toUpperCase();
        applyTranslations(currentLang);
        if (customLangSwitcher) customLangSwitcher.classList.remove('active');
      });
    });
  }

});
