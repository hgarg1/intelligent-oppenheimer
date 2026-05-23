/* ==========================================================================
   ELYSIUM RESIDENCES - CLIENT LOGIC & INTERACTIONS
   ========================================================================== */

function initElysium() {

  const preloader = document.getElementById('luxury-preloader');
  const heroTitle = document.querySelector('.hero-title');
  
  // If the essential luxury elements are not yet rendered by Vaadin, defer initialization
  if (!preloader || !heroTitle) {
    setTimeout(initElysium, 50);
    return;
  }

  // Clear body loaded class first to ensure that CSS animations re-trigger cleanly on route changes
  document.body.classList.remove('loaded');

  // Cleanup previously registered global event listeners to prevent duplicate execution & memory leaks on route changes
  if (window.elysiumListeners) {
    window.elysiumListeners.forEach(item => {
      item.target.removeEventListener(item.type, item.listener, item.options);
    });
  }
  window.elysiumListeners = [];

  function addGlobalListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    window.elysiumListeners.push({ target, type, listener, options });
  }

  // ==========================================================================
  // 0. LUXURY PRELOADER COORDINATOR
  // ==========================================================================
  
  // Safe fallback to ensure the site reveals if the window load event has already fired
  let preloaderRevealed = false;
  
  // Smart SPA navigation preloader handling: if this is a route re-entry, bypass long load animations for immediate response
  const isSpaTransition = window.ElysiumColdStartCompleted === true;
  const revealDelay = isSpaTransition ? 150 : 3500;
  const completeDelay = isSpaTransition ? 100 : 3200;

  function revealSite() {
    if (preloaderRevealed) return;
    preloaderRevealed = true;
    
    if (preloader) {
      if (isSpaTransition) {
        preloader.classList.add('spa-transition');
        preloader.classList.add('fade-out');
        // Snappy transition reveal
        setTimeout(() => {
          document.body.classList.add('loaded');
          preloader.remove();
        }, 300);
      } else {
        preloader.classList.add('fade-out');
        // Wait for the full 1.2s fade-out to finish before triggering page loaded reveals to prevent overlapping visual blur!
        setTimeout(() => {
          document.body.classList.add('loaded');
          preloader.remove();
        }, 1200);
      }
    } else {
      document.body.classList.add('loaded');
    }
    
    // Set cold start completed flag for subsequent transitions
    window.ElysiumColdStartCompleted = true;
  }

  // Bind to window load event with smart immediate-loaded check for single-page applications
  if (document.readyState === 'complete') {
    // Page is already fully loaded, run the deliberate luxury aesthetic reveal delay immediately
    setTimeout(revealSite, completeDelay);
  } else {
    addGlobalListener(window, 'load', () => {
      // Deliberate luxury delay to let the majestic self-drawing gold crest animation complete its initial loop
      setTimeout(revealSite, revealDelay);
    });
  }

  // Strict safety fallback: reveal site after 5.0 seconds regardless of loaded assets
  setTimeout(revealSite, isSpaTransition ? 300 : 5000);


  // ==========================================================================
  // 0.5. CINEMATIC BACKGROUND VIDEO TRANSITION
  // ==========================================================================
  const heroVideo = document.getElementById('hero-video');
  const heroImg = document.getElementById('hero-image');
  
  if (heroVideo && heroImg) {
    // Reset video state on route re-entry or SPA navigation
    heroVideo.classList.remove('active');
    heroVideo.pause();
    heroVideo.currentTime = 0;
    heroImg.style.opacity = ''; // Reset static twilight image opacity
    heroImg.style.transition = '';
    
    // Clear any previous scheduled background video timeouts
    if (window.heroVideoTimeout) {
      clearTimeout(window.heroVideoTimeout);
    }
    
    // Schedule the transition to AI generated city traffic video after 15 seconds
    window.heroVideoTimeout = setTimeout(() => {
      // Warm up and play the video in the background before fading it in
      heroVideo.play().then(() => {
        heroVideo.classList.add('active');
        heroImg.style.transition = 'opacity 2.5s cubic-bezier(0.16, 1, 0.3, 1)';
        heroImg.style.opacity = '0'; // Smoothly crossfade and hide the static image
      }).catch(err => {
        console.warn("Hero background video playback blocked or deferred:", err);
      });
    }, 15000); // 15 seconds delay
  }


  // ==========================================================================
  // 1. PREMIUM CUSTOM CURSOR
  // ==========================================================================
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  if (cursor && cursorDot) {
    addGlobalListener(document, 'mousemove', (e) => {
      // Use requestAnimationFrame for performance
      window.requestAnimationFrame(() => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        cursorDot.style.left = `${e.clientX}px`;
        cursorDot.style.top = `${e.clientY}px`;
      });
    });

    // Add hover states for interactive elements
    const hoverables = document.querySelectorAll('a, button, select, input, textarea, .floor-btn, .gallery-item, .suite-room-path');
    hoverables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        cursor.classList.add('hovered');
      });
      item.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovered');
      });
    });
  }

  // ==========================================================================
  // 2. SCROLL MECHANICS (HEADER & HERO PARALLAX)
  // ==========================================================================
  const header = document.getElementById('main-header');
  const heroImage = document.getElementById('hero-image');
  const scrollIndicator = document.querySelector('.scroll-indicator');
  
  addGlobalListener(window, 'scroll', () => {
    const scrollPos = window.scrollY;
    
    // Header state transformation
    if (scrollPos > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Parallax hero background scaling
    if (heroImage && scrollPos < window.innerHeight) {
      heroImage.style.transform = `scale(${1.05 + scrollPos * 0.00015}) translateY(${scrollPos * 0.1}px)`;
    }
    
    // Fade out scroll indicator on scroll
    if (scrollIndicator) {
      if (scrollPos > 100) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }
  });

  // ==========================================================================
  // 3. MOBILE MENU TOGGLE
  // ==========================================================================
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mainHeader = document.getElementById('main-header');
  
  if (mobileToggle && mainHeader) {
    mobileToggle.addEventListener('click', () => {
      mainHeader.classList.toggle('mobile-nav-active');
      
      // Lock background page scroll while the luxury overlay drawer is open
      if (mainHeader.classList.contains('mobile-nav-active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close mobile menu drawer smoothly when clicking navigation links
    const links = mainHeader.querySelectorAll('.nav-links a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        mainHeader.classList.remove('mobile-nav-active');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================================================
  // 3.5. CUSTOM DROPDOWN INTERACTIVES
  // ==========================================================================
  const customSelects = document.querySelectorAll('.custom-select-container');
  
  customSelects.forEach(selectContainer => {
    const trigger = selectContainer.querySelector('.custom-select-trigger');
    const options = selectContainer.querySelectorAll('.custom-select-option');
    const hiddenInput = selectContainer.querySelector('input[type="hidden"]');
    const triggerLabel = selectContainer.querySelector('.custom-select-trigger span');
    
    // Toggle active state on trigger click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close other selectors
      customSelects.forEach(other => {
        if (other !== selectContainer) {
          other.classList.remove('open');
        }
      });
      
      selectContainer.classList.toggle('open');
    });
    
    // Handle option click selection
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const val = option.getAttribute('data-value');
        const text = option.innerText;
        
        // Update active class
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Update values
        if (hiddenInput) {
          hiddenInput.value = val;
          hiddenInput.dispatchEvent(new Event('change'));
        }
        
        if (triggerLabel) {
          triggerLabel.innerText = text;
        }
        
        selectContainer.classList.remove('open');
      });
    });
  });
  
  // ==========================================================================
  // 3.6. BESPOKE LUXURY CALENDAR SELECTOR
  // ==========================================================================
  const dateContainer = document.getElementById('custom-date-container');
  const dateTrigger = document.getElementById('custom-date-trigger');
  const dateTriggerLabel = document.getElementById('custom-date-trigger-label');
  const dateDropdown = document.getElementById('custom-calendar-dropdown');
  const calendarPrevBtn = document.getElementById('calendar-prev-month');
  const calendarNextBtn = document.getElementById('calendar-next-month');
  const calendarDaysContainer = document.getElementById('calendar-days');
  const bookingDateInput = document.getElementById('booking-date');

  // Month & Year Selector Elements
  const monthSelectContainer = document.getElementById('calendar-month-select');
  const monthSelectTrigger = document.getElementById('calendar-month-trigger');
  const monthSelectLabel = document.getElementById('calendar-month-label');
  const monthSelectOptionsContainer = document.getElementById('calendar-month-options');

  const yearSelectContainer = document.getElementById('calendar-year-select');
  const yearSelectTrigger = document.getElementById('calendar-year-trigger');
  const yearSelectLabel = document.getElementById('calendar-year-label');
  const yearSelectOptionsContainer = document.getElementById('calendar-year-options');

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
  let selectedDateObj = null;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Dynamically populate month options in the header dropdown
  function populateMonthSelectOptions(activeYear, activeMonth) {
    if (!monthSelectOptionsContainer) return;
    monthSelectOptionsContainer.innerHTML = '';
    
    const today = new Date();
    const isCurrentYear = (activeYear === today.getFullYear());
    const currentRealMonth = today.getMonth();

    monthNames.forEach((name, index) => {
      const opt = document.createElement('div');
      opt.classList.add('calendar-select-option');
      opt.innerText = name.substring(0, 3);
      opt.setAttribute('data-month', index);
      
      if (isCurrentYear && index < currentRealMonth) {
        opt.classList.add('disabled');
      } else {
        if (index === activeMonth) {
          opt.classList.add('selected');
        }
        
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          currentMonth = index;
          renderCalendar(currentYear, currentMonth);
          if (monthSelectContainer) {
            monthSelectContainer.classList.remove('open');
          }
        });
      }
      monthSelectOptionsContainer.appendChild(opt);
    });
  }

  // Dynamically populate year options in the header dropdown (current year + 5 years)
  function populateYearSelectOptions(activeYear) {
    if (!yearSelectOptionsContainer) return;
    yearSelectOptionsContainer.innerHTML = '';
    
    const startYear = new Date().getFullYear();
    for (let y = startYear; y <= startYear + 5; y++) {
      const opt = document.createElement('div');
      opt.classList.add('calendar-select-option');
      opt.innerText = y;
      opt.setAttribute('data-year', y);
      
      if (y === activeYear) {
        opt.classList.add('selected');
      }
      
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        currentYear = y;
        
        // If switched to the current year and currentMonth is in the past, default to current month
        const today = new Date();
        if (currentYear === today.getFullYear() && currentMonth < today.getMonth()) {
          currentMonth = today.getMonth();
        }
        
        renderCalendar(currentYear, currentMonth);
        if (yearSelectContainer) {
          yearSelectContainer.classList.remove('open');
        }
      });
      
      yearSelectOptionsContainer.appendChild(opt);
    }
  }

  function renderCalendar(year, month) {
    if (!calendarDaysContainer) return;

    calendarDaysContainer.innerHTML = '';
    
    // Update Header Trigger Labels
    if (monthSelectLabel) {
      monthSelectLabel.innerText = monthNames[month].substring(0, 3);
    }
    if (yearSelectLabel) {
      yearSelectLabel.innerText = year;
    }

    // Populate dropdown selection lists
    populateMonthSelectOptions(year, month);
    populateYearSelectOptions(year);

    const firstDayIndex = new Date(year, month, 1).getDay();
    const numberOfDays = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding for empty space in the beginning of month
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyDiv = document.createElement('div');
      emptyDiv.classList.add('calendar-day', 'empty');
      calendarDaysContainer.appendChild(emptyDiv);
    }

    // Days in Month
    for (let day = 1; day <= numberOfDays; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.classList.add('calendar-day');
      dayDiv.innerText = day;

      const thisDate = new Date(year, month, day);
      thisDate.setHours(0, 0, 0, 0);

      // Past date check
      if (thisDate < today) {
        dayDiv.classList.add('disabled');
      } else {
        // Highlight Today
        if (thisDate.getTime() === today.getTime()) {
          dayDiv.classList.add('today');
        }

        // Highlight Selected Date
        if (selectedDateObj && thisDate.getTime() === selectedDateObj.getTime()) {
          dayDiv.classList.add('selected');
        }

        // Event listener for active days
        dayDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedDateObj = new Date(year, month, day);
          
          // Format value for input (YYYY-MM-DD)
          const formattedMonth = String(month + 1).padStart(2, '0');
          const formattedDay = String(day).padStart(2, '0');
          const finalVal = `${year}-${formattedMonth}-${formattedDay}`;
          
          if (bookingDateInput) {
            bookingDateInput.value = finalVal;
            bookingDateInput.dispatchEvent(new Event('change'));
          }

          // Format label text for trigger
          const displayMonthStr = monthNames[month].substring(0, 3);
          if (dateTriggerLabel) {
            dateTriggerLabel.innerText = `${displayMonthStr} ${day}, ${year}`;
          }

          // Close dropdown
          if (dateContainer) {
            dateContainer.classList.remove('open');
          }

          // Re-render to update selected styling
          renderCalendar(year, month);
        });
      }

      calendarDaysContainer.appendChild(dayDiv);
    }

    // Prevent prev month button navigation if showing current month
    const currentRealDate = new Date();
    if (year === currentRealDate.getFullYear() && month === currentRealDate.getMonth()) {
      if (calendarPrevBtn) {
        calendarPrevBtn.style.opacity = '0.3';
        calendarPrevBtn.style.pointerEvents = 'none';
      }
    } else {
      if (calendarPrevBtn) {
        calendarPrevBtn.style.opacity = '1';
        calendarPrevBtn.style.pointerEvents = 'auto';
      }
    }
  }

  // Toggle calendar trigger
  if (dateTrigger) {
    dateTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Close other custom selects and calendar sub-dropdowns
      customSelects.forEach(select => select.classList.remove('open'));
      if (monthSelectContainer) monthSelectContainer.classList.remove('open');
      if (yearSelectContainer) yearSelectContainer.classList.remove('open');
      
      if (dateContainer) {
        dateContainer.classList.toggle('open');
      }
    });
  }

  // Toggle calendar month selector
  if (monthSelectTrigger) {
    monthSelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (yearSelectContainer) yearSelectContainer.classList.remove('open');
      if (monthSelectContainer) monthSelectContainer.classList.toggle('open');
    });
  }

  // Toggle calendar year selector
  if (yearSelectTrigger) {
    yearSelectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (monthSelectContainer) monthSelectContainer.classList.remove('open');
      if (yearSelectContainer) yearSelectContainer.classList.toggle('open');
    });
  }

  // Prevent dropdown closing when clicking inside it
  if (dateDropdown) {
    dateDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Prev Month click
  if (calendarPrevBtn) {
    calendarPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentYear, currentMonth);
    });
  }

  // Next Month click
  if (calendarNextBtn) {
    calendarNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentYear, currentMonth);
    });
  }

  // Exposed helper to reset custom calendar from external closures
  window.resetCustomCalendar = function() {
    selectedDateObj = null;
    if (bookingDateInput) {
      bookingDateInput.value = '';
    }
    if (dateTriggerLabel) {
      dateTriggerLabel.innerText = 'Select Date';
    }
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
    renderCalendar(currentYear, currentMonth);
  };

  // Initialize Calendar
  renderCalendar(currentYear, currentMonth);
  
  // Universal click away to close open dropdowns
  addGlobalListener(document, 'click', () => {
    customSelects.forEach(select => select.classList.remove('open'));
    if (dateContainer) {
      dateContainer.classList.remove('open');
    }
    if (monthSelectContainer) {
      monthSelectContainer.classList.remove('open');
    }
    if (yearSelectContainer) {
      yearSelectContainer.classList.remove('open');
    }
  });

  // ==========================================================================
  // 4. INTERACTIVE FLOORPLAN & SUITE DATA
  // ==========================================================================
  const suitesData = {
    penthouse: {
      name: "Grand Penthouse",
      price: "$28,500,000",
      area: "9,240 SQ FT",
      beds: "5 Master Suites",
      baths: "6.5 Marble Baths",
      aspect: "360° Skyline/Ocean",
      description: "Occupying the absolute crown levels of Elysium, the Grand Penthouse represents the peak of high-altitude architecture. Features double-height ceilings, a private glass elevator, a private 15-meter heated sky pool, and custom bronze accents.",
      amenities: ["Private Sky Pool", "24-bottle Sommelier Humidor", "Double-Wing Layout", "Wellness Steam Chamber"],
      floorplanSvg: `
        <svg viewBox="0 0 300 300">
          <!-- Outer border -->
          <rect x="10" y="10" width="280" height="280" stroke="rgba(255,255,255,0.05)" fill="none" stroke-width="1"/>
          <!-- Sky deck -->
          <path d="M 10 10 L 290 10 L 290 60 L 10 60 Z" class="suite-room-path highlight" data-room="Infinity Pool Deck"/>
          <!-- Master Wing -->
          <path d="M 10 60 L 140 60 L 140 180 L 10 180 Z" class="suite-room-path" data-room="Grand Master Suite"/>
          <!-- Dining & Kitchen -->
          <path d="M 140 60 L 290 60 L 290 180 L 140 180 Z" class="suite-room-path" data-room="Salon & Dining Hall"/>
          <!-- Secondary suites -->
          <path d="M 10 180 L 140 180 L 140 290 L 10 290 Z" class="suite-room-path" data-room="Bespoke VIP Guest Wing"/>
          <!-- Butler Lobby -->
          <path d="M 140 180 L 290 180 L 290 290 L 140 290 Z" class="suite-room-path" data-room="Private Butler Foyer"/>
          
          <!-- Inner room divisions lines -->
          <line x1="10" y1="60" x2="290" y2="60" stroke="rgba(255,255,255,0.2)"/>
          <line x1="140" y1="60" x2="140" y2="290" stroke="rgba(255,255,255,0.2)"/>
          <line x1="10" y1="180" x2="290" y2="180" stroke="rgba(255,255,255,0.2)"/>
          
          <!-- Text labels -->
          <text x="150" y="35" text-anchor="middle" dominant-baseline="middle">INFINITY POOL DECK</text>
          <text x="75" y="120" text-anchor="middle" dominant-baseline="middle">MASTER SUITE</text>
          <text x="215" y="120" text-anchor="middle" dominant-baseline="middle">GRAND SALON</text>
          <text x="75" y="235" text-anchor="middle" dominant-baseline="middle">VIP WING</text>
          <text x="215" y="235" text-anchor="middle" dominant-baseline="middle">BUTLER FOYER</text>
        </svg>
      `
    },
    skyvilla: {
      name: "Aether Sky Villa",
      price: "$16,200,000",
      area: "5,820 SQ FT",
      beds: "3 Master Suites",
      baths: "4.5 Travertine Baths",
      aspect: "270° Sunset/River",
      description: "Situated in our cloud-tier, the Sky Villa features floating glass terraces and double-aspect exposures. Tailored for family comfort and grand scale hosting, incorporating a bespoke state-of-the-art chef's kitchen.",
      amenities: ["Panoramic Lounge", "Private Chef Kitchen", "Dual Sunset Terraces", "Wellness Spa Cavern"],
      floorplanSvg: `
        <svg viewBox="0 0 300 300">
          <rect x="10" y="10" width="280" height="280" stroke="rgba(255,255,255,0.05)" fill="none" stroke-width="1"/>
          <!-- Balcony wrap -->
          <path d="M 10 10 L 290 10 L 290 40 L 260 40 L 260 260 L 290 260 L 290 290 L 10 290 Z" class="suite-room-path highlight" data-room="Glass Sunset Balcony"/>
          <!-- Master salon -->
          <path d="M 30 y 40 L 150 y 40 L 150 y 160 L 30 y 160 Z" class="suite-room-path" data-room="Sunset Lounge & Salon"/>
          <!-- Secondary bedrooms -->
          <path d="M 150 y 40 L 260 y 40 L 260 y 160 L 150 y 160 Z" class="suite-room-path" data-room="VIP Dual Bedroom Hub"/>
          <!-- Kitchen and dining -->
          <path d="M 30 y 160 L 150 y 160 L 150 y 260 L 30 y 260 Z" class="suite-room-path" data-room="Culinary Chef Kitchen"/>
          <!-- Private Lift lobby -->
          <path d="M 150 y 160 L 260 y 160 L 260 y 260 L 150 y 260 Z" class="suite-room-path" data-room="Secure Transit Vestibule"/>
          
          <line x1="30" y1="40" x2="260" y2="40" stroke="rgba(255,255,255,0.2)"/>
          <line x1="150" y1="40" x2="150" y2="260" stroke="rgba(255,255,255,0.2)"/>
          <line x1="30" y1="160" x2="260" y2="160" stroke="rgba(255,255,255,0.2)"/>
          <line x1="30" y1="260" x2="260" y2="260" stroke="rgba(255,255,255,0.2)"/>
          
          <text x="150" y="25" text-anchor="middle" dominant-baseline="middle">SUNSET DECK</text>
          <text x="90" y="100" text-anchor="middle" dominant-baseline="middle">SUNSET SALON</text>
          <text x="205" y="100" text-anchor="middle" dominant-baseline="middle">VIP SUITES</text>
          <text x="90" y="210" text-anchor="middle" dominant-baseline="middle">CHEF KITCHEN</text>
          <text x="205" y="210" text-anchor="middle" dominant-baseline="middle">TRANSIT LIFT</text>
        </svg>
      `
    },
    signature: {
      name: "Signature Suite",
      price: "$8,950,000",
      area: "3,450 SQ FT",
      beds: "2 Master Suites",
      baths: "3 Onyx Bathrooms",
      aspect: "180° Skyline/Sunrise",
      description: "Masterfully proportioned, the Signature Suite provides visual warmth and efficient layout spacing. Includes linear terraces, walnut cabinets, integrated home theater automation, and sleek ambient LED setups.",
      amenities: ["Integrated Smart Home", "Walk-in Dressing Closet", "Walnut Panel Accents", "Bespoke Breakfast Deck"],
      floorplanSvg: `
        <svg viewBox="0 0 300 300">
          <rect x="10" y="10" width="280" height="280" stroke="rgba(255,255,255,0.05)" fill="none" stroke-width="1"/>
          <!-- Front Terrace -->
          <path d="M 10 10 L 290 10 L 290 35 L 10 35 Z" class="suite-room-path highlight" data-room="Sunrise Deck"/>
          <!-- Suite Bedroom 1 -->
          <path d="M 10 35 L 140 35 L 140 150 L 10 150 Z" class="suite-room-path" data-room="Owner's Master Bedroom"/>
          <!-- Living center -->
          <path d="M 140 35 L 290 35 L 290 150 L 140 150 Z" class="suite-room-path" data-room="Central Day Salon"/>
          <!-- Bedroom 2 -->
          <path d="M 10 150 L 140 150 L 140 290 L 10 290 Z" class="suite-room-path" data-room="Guest Master suite"/>
          <!-- Dining area -->
          <path d="M 140 150 L 290 150 L 290 290 L 140 290 Z" class="suite-room-path" data-room="Compact Gourmet Kitchen"/>
          
          <line x1="10" y1="35" x2="290" y2="35" stroke="rgba(255,255,255,0.2)"/>
          <line x1="140" y1="35" x2="140" y2="290" stroke="rgba(255,255,255,0.2)"/>
          <line x1="10" y1="150" x2="290" y2="150" stroke="rgba(255,255,255,0.2)"/>
          
          <text x="150" y="22" text-anchor="middle" dominant-baseline="middle">SUNRISE TERRACE</text>
          <text x="75" y="92" text-anchor="middle" dominant-baseline="middle">PRIMARY SUITE</text>
          <text x="215" y="92" text-anchor="middle" dominant-baseline="middle">DAY SALON</text>
          <text x="75" y="220" text-anchor="middle" dominant-baseline="middle">GUEST WING</text>
          <text x="215" y="220" text-anchor="middle" dominant-baseline="middle">GOURMET ROOM</text>
        </svg>
      `
    }
  };

  const floorButtons = document.querySelectorAll('.floor-btn');
  const suiteDetailsPanel = document.getElementById('suite-details-panel');
  const floorplanContainer = document.getElementById('floorplan-container');
  
  function updateSuiteDisplay(suiteKey) {
    const data = suitesData[suiteKey];
    if (!data) return;
    
    // Add micro-animation effect
    suiteDetailsPanel.classList.remove('suite-display-anim');
    void suiteDetailsPanel.offsetWidth; // Trigger reflow
    suiteDetailsPanel.classList.add('suite-display-anim');
    
    // Update textual properties
    document.getElementById('suite-name').innerText = data.name;
    document.getElementById('suite-price').innerText = data.price;
    document.getElementById('suite-area').innerText = data.area;
    document.getElementById('suite-beds').innerText = data.beds;
    document.getElementById('suite-baths').innerText = data.baths;
    document.getElementById('suite-aspect').innerText = data.aspect;
    document.getElementById('suite-description').innerText = data.description;
    
    // Update amenity tags
    const tagsContainer = document.getElementById('suite-tags');
    tagsContainer.innerHTML = '';
    data.amenities.forEach(tagText => {
      const span = document.createElement('span');
      span.className = 'suite-amenity-tag';
      span.innerText = tagText;
      tagsContainer.appendChild(span);
    });
    
    // Inject SVG Markup
    floorplanContainer.innerHTML = data.floorplanSvg;
    
    // Enable SVG path highlight click handlers
    setupFloorplanHighlights();
  }

  function setupFloorplanHighlights() {
    const paths = floorplanContainer.querySelectorAll('.suite-room-path');
    paths.forEach(path => {
      // Hover effects
      path.addEventListener('mouseenter', () => {
        paths.forEach(p => p.classList.remove('highlight'));
        path.classList.add('highlight');
        
        // Custom cursor indicator helper
        if (cursor) {
          cursor.classList.add('hovered');
        }
      });
      
      path.addEventListener('mouseleave', () => {
        // Leave the path highlighted if it's the primary room or reset
        if (cursor) {
          cursor.classList.remove('hovered');
        }
      });
      
      // Click shows detailed message on screen description
      path.addEventListener('click', () => {
        const roomName = path.getAttribute('data-room');
        const descElement = document.getElementById('suite-description');
        const origText = descElement.innerHTML;
        
        descElement.innerHTML = `<strong style="color: var(--accent-gold); text-transform: uppercase;">Selected Space: ${roomName}</strong><br>Features high-density acoustics, private digital dimming, integrated smart thermostat ventilation, and direct elevator linkage to core hubs.`;
        
        // Revert to original description after 4.5 seconds of inactivity
        if (window.descTimeout) clearTimeout(window.descTimeout);
        window.descTimeout = setTimeout(() => {
          descElement.innerHTML = suitesData[getCurrentActiveSuite()].description;
        }, 5500);
      });
    });
  }

  function getCurrentActiveSuite() {
    let activeKey = 'penthouse';
    floorButtons.forEach(btn => {
      if (btn.classList.contains('active')) {
        activeKey = btn.getAttribute('data-suite');
      }
    });
    return activeKey;
  }

  // ==========================================================================
  // 4.5. INTERACTIVE SCROLL TRACKER LOGIC
  // ==========================================================================
  let isManualScrolling = false;
  let manualScrollTimeout = null;
  let currentActiveSuiteKey = 'penthouse';

  function scrollToSuiteProgress(progress) {
    const grid = document.querySelector('.selector-grid');
    const navigator = document.querySelector('.tower-navigator');
    if (!grid || !navigator) return;
    
    // Set manual scrolling flag to avoid scroll events overriding current view
    isManualScrolling = true;
    if (manualScrollTimeout) clearTimeout(manualScrollTimeout);
    
    const gridRect = grid.getBoundingClientRect();
    const navHeight = navigator.offsetHeight;
    const stickyTop = 130;
    
    // Total distance the grid scrolls while the navigator is sticky
    const totalDistance = gridRect.height - navHeight;
    
    // Calculate exact absolute scroll Y coordinate for desired progress
    const gridPageTop = window.scrollY + gridRect.top;
    const targetScrollY = gridPageTop - stickyTop + progress * totalDistance;
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
    
    // Reset manual scrolling flag after smooth scroll finishes
    manualScrollTimeout = setTimeout(() => {
      isManualScrolling = false;
    }, 850);
  }

  function updateScrollTracker() {
    const grid = document.querySelector('.selector-grid');
    const navigator = document.querySelector('.tower-navigator');
    const firstBtn = document.querySelector('.floor-btn:first-of-type');
    const lastBtn = document.querySelector('.floor-btn:last-of-type');
    const track = document.querySelector('.navigator-scroll-track');
    const dot = document.getElementById('navigator-scroll-dot');
    
    if (!grid || !navigator || !firstBtn || !lastBtn || !track || !dot) return;
    
    // Hide tracker on mobile/tablet screens since layout is static and horizontal
    if (window.innerWidth <= 991) {
      track.style.display = 'none';
      return;
    } else {
      track.style.display = 'block';
    }
    
    // Calculate exact button centers relative to parent container using bulletproof viewport geometry
    const navRect = navigator.getBoundingClientRect();
    const firstCenter = (firstBtn.getBoundingClientRect().top - navRect.top) + firstBtn.offsetHeight / 2;
    const lastCenter = (lastBtn.getBoundingClientRect().top - navRect.top) + lastBtn.offsetHeight / 2;
    
    // Position and size the vertical track to align with buttons
    track.style.top = `${firstCenter}px`;
    track.style.height = `${lastCenter - firstCenter}px`;
    
    // Calculate scroll progress within the sticky range
    const gridRect = grid.getBoundingClientRect();
    const navHeight = navigator.offsetHeight;
    const stickyTop = 130;
    
    const totalDistance = gridRect.height - navHeight;
    const scrolledDistance = stickyTop - gridRect.top;
    
    let progress = scrolledDistance / totalDistance;
    progress = Math.max(0, Math.min(1, progress));
    
    // Position the dot along the track
    dot.style.top = `${progress * 100}%`;
    
    // Update active suite state on scroll only if not manually scrolling via clicks
    if (!isManualScrolling) {
      let targetSuiteKey = 'penthouse';
      if (progress > 0.35 && progress <= 0.7) {
        targetSuiteKey = 'skyvilla';
      } else if (progress > 0.7) {
        targetSuiteKey = 'signature';
      }
      
      if (targetSuiteKey !== currentActiveSuiteKey) {
        currentActiveSuiteKey = targetSuiteKey;
        
        // Update active class on floor buttons
        floorButtons.forEach(btn => {
          if (btn.getAttribute('data-suite') === targetSuiteKey) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        
        // Update details panel content
        updateSuiteDisplay(targetSuiteKey);
      }
    }
  }

  // Bind Level Select Click Buttons with smooth scroll sync
  floorButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      let targetProgress = 0;
      if (index === 1) targetProgress = 0.5;
      else if (index === 2) targetProgress = 1.0;
      
      const suiteKey = btn.getAttribute('data-suite');
      currentActiveSuiteKey = suiteKey;
      
      // Update visual active classes immediately
      floorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateSuiteDisplay(suiteKey);
      
      // Perform smooth scroll transition to sync scroll state
      scrollToSuiteProgress(targetProgress);
    });
  });

  // Attach global scroll/resize listeners for interactive scroll tracking
  addGlobalListener(window, 'scroll', updateScrollTracker);
  addGlobalListener(window, 'resize', updateScrollTracker);

  // Initialize display with Penthouse
  updateSuiteDisplay('penthouse');
  updateScrollTracker();

  // ==========================================================================
  // 5. INTERSECTION OBSERVER REVEAL LOGIC
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  if (window.elysiumRevealObserver) {
    window.elysiumRevealObserver.disconnect();
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, observerOptions);
  window.elysiumRevealObserver = revealObserver;

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // 6. HIGH-END LIGHTBOX SLIDER GALLERY
  // ==========================================================================
  const lightbox = document.getElementById('media-lightbox');
  const lightboxImg = document.getElementById('lightbox-img-source');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const lightboxClose = document.getElementById('btn-lightbox-close');
  const lightboxPrev = document.getElementById('btn-lightbox-prev');
  const lightboxNext = document.getElementById('btn-lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  let currentGalleryIndex = 0;
  const galleryImages = [];
  
  // Populate images catalog
  galleryItems.forEach((item, index) => {
    galleryImages.push({
      src: item.getAttribute('data-image'),
      caption: item.getAttribute('data-caption')
    });
    
    item.addEventListener('click', () => {
      currentGalleryIndex = index;
      openLightbox();
    });
  });

  function openLightbox() {
    const data = galleryImages[currentGalleryIndex];
    if (!data) return;
    
    lightboxImg.src = data.src;
    lightboxCaption.innerText = data.caption;
    lightbox.classList.add('active');
    
    // Hide main page scrollbar to lock viewport
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  function navigateGallery(direction) {
    currentGalleryIndex = (currentGalleryIndex + direction + galleryImages.length) % galleryImages.length;
    
    // Add crossfade flash effect to image source
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      const data = galleryImages[currentGalleryIndex];
      lightboxImg.src = data.src;
      lightboxCaption.innerText = data.caption;
      lightboxImg.style.opacity = '1';
    }, 200);
  }

  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateGallery(-1));
    lightboxNext.addEventListener('click', () => navigateGallery(1));
    
    // Click outside image closes lightbox
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard bindings
    addGlobalListener(document, 'keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateGallery(-1);
      if (e.key === 'ArrowRight') navigateGallery(1);
    });
  }

  // ==========================================================================
  // 7. VIRTUAL CONCIERGE TOURS MODAL FLOW
  // ==========================================================================
  const tourModal = document.getElementById('tour-modal');
  const modalClose = document.getElementById('btn-modal-close');
  const modalSuccessClose = document.getElementById('btn-success-close');
  const triggerButtons = [
    document.getElementById('cta-schedule-nav'),
    document.getElementById('btn-book-hero'),
    document.getElementById('btn-inquire-suite')
  ];
  
  const bookingFormState = document.getElementById('booking-form-state');
  const bookingSuccessState = document.getElementById('booking-success-state');
  const conciergeForm = document.getElementById('concierge-booking-form');
  const suiteSelectionControl = document.getElementById('booking-suite');
  
  function openBookingModal(defaultSuite = 'penthouse') {
    // Sync default select option if clicked from dynamic details inquiry
    if (suiteSelectionControl) {
      suiteSelectionControl.value = defaultSuite;
      
      // Also update custom select visuals!
      const suiteContainer = document.getElementById('custom-select-suite-container');
      if (suiteContainer) {
        const triggerLabel = document.getElementById('custom-select-suite-trigger-label');
        const options = suiteContainer.querySelectorAll('.custom-select-option');
        options.forEach(opt => {
          if (opt.getAttribute('data-value') === defaultSuite) {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            if (triggerLabel) {
              triggerLabel.innerText = opt.innerText;
            }
          }
        });
      }
    }
    
    // Reset modal states
    bookingFormState.style.display = 'block';
    bookingSuccessState.style.display = 'none';
    
    // Reset bespoke custom calendar state
    if (typeof window.resetCustomCalendar === 'function') {
      window.resetCustomCalendar();
    }
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    tourModal.classList.add('active');
  }

  function closeBookingModal() {
    tourModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Set minimum date picker to today
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Bind open actions
  triggerButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        const suiteVal = getCurrentActiveSuite();
        openBookingModal(suiteVal);
      });
    }
  });

  if (tourModal) {
    modalClose.addEventListener('click', closeBookingModal);
    modalSuccessClose.addEventListener('click', closeBookingModal);
    
    tourModal.addEventListener('click', (e) => {
      if (e.target === tourModal) {
        closeBookingModal();
      }
    });

    // Form submit verification server bridge
    conciergeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const clientName = document.getElementById('booking-name').value;
      const clientEmail = document.getElementById('booking-email').value;
      const clientPhone = document.getElementById('booking-phone').value;
      const suiteInput = document.getElementById('booking-suite').value;
      const selectedDate = document.getElementById('booking-date').value;
      const selectedTime = document.getElementById('booking-time').value;
      const specialRequests = document.getElementById('booking-notes').value;

      if (window.VaadinView && window.VaadinView.$server) {
        window.VaadinView.$server.submitBooking(clientName, clientEmail, clientPhone, suiteInput, selectedDate, selectedTime, specialRequests)
          .then(response => {
            if (response === 'SUCCESS') {
              // Get display text from selected custom option
              let selectedSuiteText = 'The Grand Penthouse';
              const suiteContainer = document.getElementById('custom-select-suite-container');
              if (suiteContainer) {
                const selectedOpt = suiteContainer.querySelector('.custom-select-option.selected');
                if (selectedOpt) {
                  selectedSuiteText = selectedOpt.innerText.split('(')[0].trim();
                }
              }
              
              // Format the showing date beautifully for the luxury VIP registry card
              let formattedShowingDate = selectedDate;
              if (selectedDate) {
                const dateParts = selectedDate.split('-');
                if (dateParts.length === 3) {
                  const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                  formattedShowingDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                }
              }
              
              // Structure dynamic luxury greeting text
              const successMessage = document.getElementById('success-message');
              successMessage.innerHTML = `Welcome to the registry, <strong>${clientName}</strong>. Your showing of <strong>${selectedSuiteText}</strong> has been secured for <strong>${formattedShowingDate}</strong>. Our Chief Butler will make contact to deliver flight coordinate clearances and customized entourage services.`;
              
              // Animate transition between form and success cards
              bookingFormState.style.display = 'none';
              bookingSuccessState.style.display = 'block';
            } else {
              // Luxury alert style
              const errorBanner = document.createElement('div');
              errorBanner.className = 'error-banner';
              errorBanner.style.cssText = 'background: rgba(220,53,69,0.15); border: 1px solid #dc3545; color: #ff6b6b; padding: 12px; margin-bottom: 20px; border-radius: 8px; font-family: Outfit, sans-serif; font-size: 14px; text-align: center; box-shadow: 0 0 15px rgba(220,53,69,0.25);';
              errorBanner.innerText = response.replace('ERROR: ', '');
              
              // Remove previous error banner if exists
              const oldBanner = conciergeForm.querySelector('.error-banner');
              if (oldBanner) oldBanner.remove();
              
              conciergeForm.insertBefore(errorBanner, conciergeForm.firstChild);
              errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          })
          .catch(err => {
            console.error(err);
            alert("An error occurred. Please try again.");
          });
      } else {
        // Fallback for standalone/mock mode
        let selectedSuiteText = 'The Grand Penthouse';
        const suiteContainer = document.getElementById('custom-select-suite-container');
        if (suiteContainer) {
          const selectedOpt = suiteContainer.querySelector('.custom-select-option.selected');
          if (selectedOpt) {
            selectedSuiteText = selectedOpt.innerText.split('(')[0].trim();
          }
        }
        
        let formattedShowingDate = selectedDate;
        if (selectedDate) {
          const dateParts = selectedDate.split('-');
          if (dateParts.length === 3) {
            const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            formattedShowingDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }
        }
        
        const successMessage = document.getElementById('success-message');
        successMessage.innerHTML = `Welcome to the registry, <strong>${clientName}</strong>. Your showing of <strong>${selectedSuiteText}</strong> has been secured for <strong>${formattedShowingDate}</strong>. (Simulation Mode)`;
        
        bookingFormState.style.display = 'none';
        bookingSuccessState.style.display = 'block';
      }
    });
  }
}

window.initElysiumApp = initElysium;
window.ElysiumScriptLoaded = true;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initElysiumApp);
} else {
  setTimeout(window.initElysiumApp, 150);
}

