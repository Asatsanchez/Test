// ========== DELOITTE WHT PLAYBOOK - MAIN JAVASCRIPT ==========

// Global variables
let countriesData = [];
let currentFilter = 'all';
let currentComplexity = 'all';

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initLanguageSelector();
    initSearch();
    initFilters();
    loadCountriesData();
    initFAQ();
    initTechTabs();
});

// ========== NAVIGATION ==========
function initNavigation() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
}

// ========== LANGUAGE SELECTOR ==========
function initLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    const dropdown = document.getElementById('languageDropdown');
    const currentLang = document.getElementById('currentLanguage');
    const options = document.querySelectorAll('.language-option');
    
    if (selector && dropdown) {
        selector.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                const lang = this.dataset.lang;
                const langText = this.textContent;
                currentLang.textContent = langText;
                
                options.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                dropdown.classList.remove('active');
            });
        });
        
        document.addEventListener('click', function() {
            dropdown.classList.remove('active');
        });
    }
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            filterCountries();
        }, 300));
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            filterCountries();
        });
    }
}

// ========== FILTERS ==========
function initFilters() {
    // Region filters
    const regionBtns = document.querySelectorAll('.region-btn[data-filter]');
    regionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            regionBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterCountries();
        });
    });
    
    // Complexity filters
    const complexityBtns = document.querySelectorAll('[data-complexity]');
    complexityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            complexityBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentComplexity = this.dataset.complexity;
            filterCountries();
        });
    });
}

// ========== LOAD COUNTRIES DATA ==========
async function loadCountriesData() {
    try {
        const response = await fetch('data/countries.json');
        countriesData = await response.json();
        console.log('Loaded countries:', countriesData.length);
    } catch (error) {
        console.error('Error loading countries data:', error);
        // Use fallback data if JSON file not found
        countriesData = getFallbackCountriesData();
    }
}

// ========== LOAD FEATURED COUNTRIES (Home Page) ==========
async function loadFeaturedCountries() {
    await loadCountriesData();
    const grid = document.getElementById('countryGrid');
    if (!grid) return;
    
    const featured = countriesData.slice(0, 6);
    grid.innerHTML = featured.map(country => createCountryCard(country)).join('');
    
    // Add click handlers
    document.querySelectorAll('.country-card').forEach(card => {
        card.addEventListener('click', function() {
            const countryCode = this.dataset.country;
            showCountryModal(countryCode);
        });
    });
}

// ========== LOAD ALL COUNTRIES (Countries Page) ==========
async function loadAllCountries() {
    await loadCountriesData();
    filterCountries();
}

// ========== FILTER COUNTRIES ==========
function filterCountries() {
    const grid = document.getElementById('countryGrid');
    if (!grid) return;
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    let filtered = countriesData;
    
    // Filter by region
    if (currentFilter !== 'all') {
        filtered = filtered.filter(c => c.region === currentFilter);
    }
    
    // Filter by complexity
    if (currentComplexity !== 'all') {
        filtered = filtered.filter(c => c.complexity.toLowerCase() === currentComplexity);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchTerm) ||
            c.region.toLowerCase().includes(searchTerm) ||
            c.taxTypes.some(t => t.toLowerCase().includes(searchTerm))
        );
    }
    
    grid.innerHTML = filtered.map(country => createCountryCard(country)).join('');
    
    // Add click handlers
    document.querySelectorAll('.country-card').forEach(card => {
        card.addEventListener('click', function() {
            const countryCode = this.dataset.country;
            showCountryModal(countryCode);
        });
    });
}

// ========== CREATE COUNTRY CARD ==========
function createCountryCard(country) {
    const complexityClass = `badge-${country.complexity.toLowerCase()}`;
    return `
        <div class="country-card" data-country="${country.code}">
            <div class="country-header">
                <div class="country-flag">${country.flag}</div>
                <div>
                    <div class="country-name">${country.name}</div>
                    <div class="country-region">${country.region}</div>
                </div>
            </div>
            <span class="badge ${complexityClass}">${country.complexity} Complexity</span>
            <div class="country-details">
                <div class="detail-row">
                    <span>Estimated Hours:</span>
                    <strong>${country.hours}</strong>
                </div>
                <div class="detail-row">
                    <span>Implementations:</span>
                    <strong>${country.implementations}</strong>
                </div>
            </div>
        </div>
    `;
}

// ========== SHOW COUNTRY MODAL ==========
function showCountryModal(countryCode) {
    const country = countriesData.find(c => c.code === countryCode);
    if (!country) return;
    
    // If on country detail page, populate that instead
    if (document.getElementById('countryName')) {
        populateCountryDetailPage(country);
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close" onclick="closeModal()">&times;</button>
                <div class="modal-flag">${country.flag}</div>
                <h2 class="modal-title">${country.name}</h2>
                <p class="modal-subtitle">${country.region} • ${country.complexity} Complexity</p>
            </div>
            <div class="modal-body">
                <div class="info-section">
                    <h3>Overview</h3>
                    <p>${country.overview}</p>
                </div>
                
                <div class="info-section">
                    <h3>Primary Withholding Tax Types</h3>
                    <div class="tax-types-grid">
                        ${country.taxTypes.map(type => `
                            <div class="tax-type-item">
                                <strong>${type}</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="info-section">
                    <h3>Key Implementation Considerations</h3>
                    <ul class="info-list">
                        ${country.considerations.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-top: 32px;">
                    <div class="stat-card">
                        <div class="stat-number" style="font-size: 32px;">${country.hours}</div>
                        <div class="stat-label">Estimated Hours</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="font-size: 32px;">${country.implementations}</div>
                        <div class="stat-label">Implementations</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" style="font-size: 32px;">✓</div>
                        <div class="stat-label">SME Available</div>
                    </div>
                </div>
                
                <div class="download-box" style="margin-top: 32px;">
                    <h3>📥 Download Country Implementation Pack</h3>
                    <p>Complete guide with configuration templates and test scripts</p>
                    <button class="btn btn-primary mt-20">Download Package</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// ========== CLOSE MODAL ==========
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// ========== POPULATE COUNTRY DETAIL PAGE ==========
function populateCountryDetailPage(country) {
    document.getElementById('countryFlag').textContent = country.flag;
    document.getElementById('countryName').textContent = country.name;
    document.getElementById('countryRegion').textContent = country.region;
    document.getElementById('countryComplexity').textContent = country.complexity;
    document.getElementById('countryHours').textContent = country.hours;
    document.getElementById('countryImplementations').textContent = country.implementations;
    document.getElementById('breadcrumbCountry').textContent = country.name;
    
    document.getElementById('countryOverview').textContent = country.overview;
    
    const taxTypesContainer = document.getElementById('taxTypes');
    taxTypesContainer.innerHTML = country.taxTypes.map(type => `
        <div class="tax-type-item"><strong>${type}</strong></div>
    `).join('');
    
    const considerationsContainer = document.getElementById('implementationConsiderations');
    considerationsContainer.innerHTML = country.considerations.map(item => `<li>${item}</li>`).join('');
}

// ========== LOAD COUNTRY DETAIL ==========
async function loadCountryDetail() {
    await loadCountriesData();
    const urlParams = new URLSearchParams(window.location.search);
    const countryCode = urlParams.get('country');
    
    if (countryCode) {
        const country = countriesData.find(c => c.code === countryCode);
        if (country) {
            populateCountryDetailPage(country);
        }
    }
}

// ========== FAQ FUNCTIONALITY ==========
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            item.classList.toggle('active');
        });
    });
}

// ========== TECH TABS ==========
function initTechTabs() {
    const tabs = document.querySelectorAll('.tech-tab');
    const contents = document.querySelectorAll('.tech-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(targetId)?.classList.add('active');
        });
    });
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== FALLBACK COUNTRIES DATA ==========
function getFallbackCountriesData() {
    return [
        {
            code: 'US',
            name: 'United States',
            flag: '🇺🇸',
            region: 'Americas',
            complexity: 'Medium',
            hours: '80-120',
            implementations: 12,
            taxTypes: ['Backup Withholding (24%)', 'FATCA', 'Form 1099 Reporting'],
            overview: 'US withholding tax system includes backup withholding for missing TINs, Form 1099 reporting for domestic contractors, and Form 1042-S for foreign persons. Treaty benefits available for qualified non-residents.',
            considerations: [
                'Certificate management (W-9, W-8BEN, W-8BEN-E)',
                'Annual 1099 and 1042-S filing requirements',
                'State-level withholding variations',
                'FATCA compliance for foreign accounts'
            ]
        },
        {
            code: 'IN',
            name: 'India',
            flag: '🇮🇳',
            region: 'APJ',
            complexity: 'High',
            hours: '120-160',
            implementations: 15,
            taxTypes: ['TDS Section 194J (10%)', 'TDS Section 194C (1-2%)', 'TDS Section 195 (20%)'],
            overview: 'India Tax Deducted at Source (TDS) system is highly complex with multiple sections for different payment types. Requires quarterly filing via TRACES portal with Form 26Q and 27Q.',
            considerations: [
                'Multiple TDS sections with varying rates',
                'Form 15CA/CB for foreign payments',
                'Lower deduction certificates (Form 197)',
                'Quarterly TDS return filing (26Q, 27Q, 24Q)',
                'PAN validation requirements'
            ]
        },
        {
            code: 'BR',
            name: 'Brazil',
            flag: '🇧🇷',
            region: 'LATAM',
            complexity: 'High',
            hours: '120-160',
            implementations: 8,
            taxTypes: ['IRRF - Income Tax (0.75-27.5%)', 'ISS - Service Tax (2-5%)', 'PIS/COFINS (9.25%)'],
            overview: 'Brazilian withholding system includes IRRF on various income types and ISS municipal service tax. Complex regulatory environment with frequent changes.',
            considerations: [
                'Multiple federal and municipal taxes',
                'DIRF annual declaration requirement',
                'Electronic invoicing (NF-e, NFS-e) integration',
                'SPED fiscal reporting',
                'eSocial compliance'
            ]
        },
        {
            code: 'GB',
            name: 'United Kingdom',
            flag: '🇬🇧',
            region: 'EMEA',
            complexity: 'Low',
            hours: '60-80',
            implementations: 10,
            taxTypes: ['CIS - Construction Industry Scheme (20/30%)', 'Interest Withholding (20%)'],
            overview: 'UK CIS for construction contractors and standard withholding on interest payments. Relatively straightforward with good HMRC systems integration.',
            considerations: [
                'CIS registration and gross payment status',
                'Monthly CIS returns to HMRC',
                'UTR (Unique Taxpayer Reference) validation',
                'Real-time reporting requirements'
            ]
        },
        {
            code: 'DE',
            name: 'Germany',
            flag: '🇩🇪',
            region: 'EMEA',
            complexity: 'Medium',
            hours: '80-120',
            implementations: 7,
            taxTypes: ['Withholding Tax on Services (0-25%)', 'Investment Income Tax (25%)'],
            overview: 'German withholding applies to certain service types and investment income. Exemption certificates (Freistellungsbescheinigung) reduce administrative burden.',
            considerations: [
                'Certificate of residence for treaty benefits',
                'Exemption certificate management',
                'Annual tax certificate (Steuerbescheinigung)',
                'Electronic filing requirements'
            ]
        },
        {
            code: 'CN',
            name: 'China',
            flag: '🇨🇳',
            region: 'APJ',
            complexity: 'High',
            hours: '120-160',
            implementations: 6,
            taxTypes: ['Business Tax (5-6%)', 'VAT (6-17%)', 'Income Tax (10-25%)'],
            overview: 'Chinese withholding system complex with VAT and business tax considerations. Fapiao (official invoices) critical for compliance.',
            considerations: [
                'Fapiao invoice requirements',
                'Multiple tax types and rates',
                'Local tax bureau registration',
                'Tax treaty documentation',
                'Monthly tax filing requirements'
            ]
        },
        {
            code: 'FR',
            name: 'France',
            flag: '🇫🇷',
            region: 'EMEA',
            complexity: 'Medium',
            hours: '80-120',
            implementations: 5,
            taxTypes: ['Withholding Tax on Services (0-33.33%)', 'Prélèvement à la Source'],
            overview: 'French withholding system modernized with Prélèvement à la Source. Treaty benefits available for non-residents with proper documentation.',
            considerations: [
                'Certificate of residence requirements',
                'Annual tax declaration (2561)',
                'Electronic filing via EDI',
                'Treaty benefit documentation'
            ]
        },
        {
            code: 'CA',
            name: 'Canada',
            flag: '🇨🇦',
            region: 'Americas',
            complexity: 'Low',
            hours: '60-80',
            implementations: 9,
            taxTypes: ['Non-Resident Withholding (25%)', 'Part XIII Tax'],
            overview: 'Canadian non-resident withholding straightforward with standard 25% rate, reduced by treaty. Good CRA online services.',
            considerations: [
                'Treaty benefit applications',
                'NR4 information return',
                'Waiver applications for exemptions',
                'Provincial tax considerations'
            ]
        },
        {
            code: 'AU',
            name: 'Australia',
            flag: '🇦🇺',
            region: 'APJ',
            complexity: 'Low',
            hours: '60-80',
            implementations: 8,
            taxTypes: ['PAYG Withholding (47%)', 'WHT on Services (5-30%)'],
            overview: 'Australian withholding system with PAYG for contractors and specific rates for non-residents. Well-structured ATO guidance.',
            considerations: [
                'ABN (Australian Business Number) validation',
                'TFN declaration forms',
                'Annual PAYG payment summary',
                'Activity statement reporting'
            ]
        },
        {
            code: 'MX',
            name: 'Mexico',
            flag: '🇲🇽',
            region: 'LATAM',
            complexity: 'Medium',
            hours: '80-120',
            implementations: 6,
            taxTypes: ['ISR - Income Tax (10-30%)', 'IVA - VAT (16%)', 'Retention Rates'],
            overview: 'Mexican retention system includes ISR and IVA with monthly filing requirements. CFDI electronic invoicing mandatory.',
            considerations: [
                'RFC (tax ID) validation',
                'CFDI electronic invoice compliance',
                'Monthly provisional payments',
                'Annual declaration requirements',
                'SAT portal integration'
            ]
        }
    ];
}
