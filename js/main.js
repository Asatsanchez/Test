// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            this.setAttribute('aria-expanded', isActive);
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && !event.target.closest('.nav-menu') && !event.target.closest('.mobile-menu-btn')) {
            navMenu.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================

    const searchInput = document.getElementById('countrySearch');
    const countryGrid = document.querySelector('.country-grid');
    
    if (searchInput && countryGrid) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const countryCards = countryGrid.querySelectorAll('.country-card');
            
            countryCards.forEach(function(card) {
                const countryName = card.querySelector('h3').textContent.toLowerCase();
                const countryRegion = card.querySelector('.country-meta').textContent.toLowerCase();
                
                if (countryName.includes(searchTerm) || countryRegion.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // ============================================
    // FILTER FUNCTIONALITY
    // ============================================

    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            const countryCards = document.querySelectorAll('.country-card');
            
            countryCards.forEach(function(card) {
                if (filterValue === 'all') {
                    card.style.display = '';
                } else {
                    const cardRegion = card.getAttribute('data-region');
                    if (cardRegion === filterValue) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================

    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // ACCORDION FUNCTIONALITY
    // ============================================

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(function(header) {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Close all accordion items
            document.querySelectorAll('.accordion-item').forEach(function(item) {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });

    // ============================================
    // TAB FUNCTIONALITY
    // ============================================

    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            document.querySelectorAll('.tab-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(function(content) {
                content.classList.remove('active');
            });
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // ============================================
    // LOAD COUNTRY DATA (FOR COUNTRIES PAGE)
    // ============================================

    const countriesContainer = document.querySelector('.countries-container');
    
    if (countriesContainer) {
        loadCountries();
    }

    function loadCountries() {
        fetch('data/countries.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                displayCountries(data.countries);
            })
            .catch(function(error) {
                console.error('Error loading countries:', error);
                countriesContainer.innerHTML = '<p class="error-message">Error loading country data. Please refresh the page.</p>';
            });
    }

    function displayCountries(countries) {
        const countryGrid = document.querySelector('.country-grid');
        if (!countryGrid) return;
        
        countryGrid.innerHTML = '';
        
        countries.forEach(function(country) {
            const card = document.createElement('div');
            card.className = 'country-card';
            card.setAttribute('data-region', country.region.toLowerCase());
            
            const statusClass = getStatusClass(country.status);
            
            card.innerHTML = `
                <div class="country-header">
                    <h3>${country.name}</h3>
                    <span class="status-badge ${statusClass}">${country.status}</span>
                </div>
                <div class="country-meta">
                    <span class="region-tag">${country.region}</span>
                </div>
                <div class="country-details">
                    <p><strong>WHT Rate:</strong> ${country.whtRate}</p>
                    <p><strong>Compliance:</strong> ${country.compliance}</p>
                    <p><strong>Last Updated:</strong> ${country.lastUpdated}</p>
                </div>
                <a href="country-detail.html?country=${encodeURIComponent(country.name)}" class="btn btn-secondary">View Details</a>
            `;
            
            countryGrid.appendChild(card);
        });
    }

    function getStatusClass(status) {
        const statusMap = {
            'Active': 'status-active',
            'In Progress': 'status-progress',
            'Planned': 'status-planned',
            'On Hold': 'status-hold'
        };
        return statusMap[status] || 'status-planned';
    }

    // ============================================
    // LOAD COUNTRY DETAIL PAGE
    // ============================================

    const countryDetailContainer = document.querySelector('.country-detail-container');
    
    if (countryDetailContainer) {
        loadCountryDetail();
    }

    function loadCountryDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const countryName = urlParams.get('country');
        
        if (!countryName) {
            countryDetailContainer.innerHTML = '<p class="error-message">No country specified.</p>';
            return;
        }
        
        fetch('data/countries.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                const country = data.countries.find(function(c) {
                    return c.name === countryName;
                });
                
                if (country) {
                    displayCountryDetail(country);
                } else {
                    countryDetailContainer.innerHTML = '<p class="error-message">Country not found.</p>';
                }
            })
            .catch(function(error) {
                console.error('Error loading country details:', error);
                countryDetailContainer.innerHTML = '<p class="error-message">Error loading country data. Please refresh the page.</p>';
            });
    }

    function displayCountryDetail(country) {
        const statusClass = getStatusClass(country.status);
        
        countryDetailContainer.innerHTML = `
            <div class="country-detail-header">
                <div>
                    <h1>${country.name}</h1>
                    <div class="country-meta">
                        <span class="region-tag">${country.region}</span>
                        <span class="status-badge ${statusClass}">${country.status}</span>
                    </div>
                </div>
                <a href="countries.html" class="btn btn-secondary">← Back to Countries</a>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3>WHT Rate</h3>
                    <p class="stat-value">${country.whtRate}</p>
                </div>
                <div class="info-card">
                    <h3>Compliance Level</h3>
                    <p class="stat-value">${country.compliance}</p>
                </div>
                <div class="info-card">
                    <h3>Last Updated</h3>
                    <p class="stat-value">${country.lastUpdated}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h2>Implementation Details</h2>
                <div class="detail-content">
                    <p>${country.details || 'Detailed implementation information coming soon.'}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h2>Key Contacts</h2>
                <div class="detail-content">
                    <p>${country.contacts || 'Contact information will be added shortly.'}</p>
                </div>
            </div>
            
            <div class="detail-section">
                <h2>Resources</h2>
                <div class="detail-content">
                    <ul>
                        <li><a href="#">Country-specific documentation</a></li>
                        <li><a href="#">Tax forms and templates</a></li>
                        <li><a href="#">Local compliance guidelines</a></li>
                    </ul>
                </div>
            </div>
        `;
    }

    // ============================================
    // FORM VALIDATION (IF ANY FORMS EXIST)
    // ============================================

    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(function(field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });

    // ============================================
    // ANIMATION ON SCROLL
    // ============================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.feature-card, .country-card, .info-card, .tool-card');
    
    animatedElements.forEach(function(element) {
        observer.observe(element);
    });

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================

    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top';
    backToTopButton.innerHTML = '↑';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
