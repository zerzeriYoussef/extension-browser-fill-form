/**
 * Form AutoFiller - Content Script
 * Intelligent form detection and auto-fill functionality
 */

// Import field matcher (inline for browser extension)
// Field matching patterns
const FIELD_PATTERNS = {
    firstName: {
        patterns: ['firstname', 'first_name', 'fname', 'givenname', 'given_name', 'prenom', 'first', 'forename', 'fore_name'],
        autocomplete: ['given-name', 'fname'],
        labels: ['first name', 'firstname', 'given name', 'forename'],
        // Exclude patterns that would match lastName
        excludePatterns: ['last', 'family', 'surname']
    },
    lastName: {
        patterns: ['lastname', 'last_name', 'lname', 'familyname', 'family_name', 'nom', 'surname', 'family', 'sirname', 'secondname', 'second_name'],
        autocomplete: ['family-name', 'lname', 'surname'],
        labels: ['last name', 'lastname', 'family name', 'surname'],
        // Exclude patterns that would match firstName
        excludePatterns: ['first', 'given', 'forename']
    },
    email: {
        patterns: ['email', 'e-mail', 'mail', 'emailaddress', 'email_address', 'emailaddr', 'email_addr', 'e_mail', 'mailaddress', 'mail_address'],
        autocomplete: ['email'],
        labels: ['email', 'e-mail', 'email address'],
        type: 'email'
    },
    phone: {
        patterns: ['phone', 'telephone', 'tel', 'mobile', 'phonenumber', 'phone_number', 'cell', 'cellphone', 'cell_phone', 'mobilephone', 'mobile_phone', 'telephonenumber', 'telephone_number', 'contactnumber', 'contact_number'],
        autocomplete: ['tel', 'tel-national', 'tel-country-code'],
        labels: ['phone', 'telephone', 'mobile', 'cell'],
        type: 'tel'
    },
    linkedIn: {
        patterns: ['linkedin', 'linkedinurl', 'linkedin_url', 'socialprofile', 'profile_url', 'linkedinprofile', 'linkedin_profile', 'linkedinlink', 'linkedin_link', 'profilelink', 'profile_link', 'sociallink', 'social_link'],
        autocomplete: ['url'],
        labels: ['linkedin', 'linkedin url', 'linkedin profile', 'social profile']
    },
    streetAddress: {
        patterns: ['street', 'streetaddress', 'street_address', 'address', 'addressline1', 'address_line1', 'address1', 'addr', 'streetname', 'street_name'],
        autocomplete: ['street-address', 'address-line1'],
        labels: ['street address', 'address', 'street']
    },
    city: {
        patterns: ['city', 'town', 'locality'],
        autocomplete: ['address-level2'],
        labels: ['city', 'town']
    },
    state: {
        patterns: ['state', 'province', 'region', 'county'],
        autocomplete: ['address-level1'],
        labels: ['state', 'province', 'region']
    },
    zipCode: {
        patterns: ['zip', 'zipcode', 'zip_code', 'postal', 'postalcode', 'postal_code'],
        autocomplete: ['postal-code'],
        labels: ['zip code', 'postal code', 'zip', 'postal']
    },
    country: {
        patterns: ['country', 'nation'],
        autocomplete: ['country'],
        labels: ['country']
    }
};

// User settings and profile data
let userSettings = {
    autoFillOnLoad: false,
    fillAllFields: true,
    fillStrategy: 'random',
    profile: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedIn: ''
    },
    addressInfo: {
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    }
};

// Track if auto-fill has been performed on this page
let autoFilledOnLoad = false;

// Debounce timer for dynamic form detection
let debounceTimer = null;

// Random data generators (fallback when profile data not available or field doesn't match)
const dataGenerators = {
    generateName: () => {
        const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'William', 'Olivia', 'James', 'Sofia', 'Robert', 'Emily'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    },
    generateEmail: () => {
        const usernames = ['john', 'jane', 'user', 'test', 'contact', 'info', 'support', 'admin'];
        const domains = ['example.com', 'test.com', 'mail.com', 'domain.com', 'company.net'];
        return `${usernames[Math.floor(Math.random() * usernames.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
    generatePhone: () => {
        return `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;
    },
    generateAddress: () => {
        const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Park Blvd', 'Cedar Ln'];
        return `${Math.floor(Math.random() * 1000 + 1)} ${streets[Math.floor(Math.random() * streets.length)]}`;
    },
    generateCity: () => {
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        return cities[Math.floor(Math.random() * cities.length)];
    },
    generateState: () => {
        const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
        return states[Math.floor(Math.random() * states.length)];
    },
    generateZip: () => {
        return `${Math.floor(Math.random() * 90000 + 10000)}`;
    },
    generateCountry: () => {
        return 'United States';
    },
    generateText: (fieldName) => {
        return `Sample text for ${fieldName || 'field'}`;
    },
    generateLinkedIn: () => {
        return 'https://linkedin.com/in/example';
    }
};

/**
 * Get label text associated with a form field
 */
function getLabelText(field) {
    if (!field) return '';

    if (field.id) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) {
            return label.textContent.trim().toLowerCase();
        }
    }

    let parent = field.parentElement;
    while (parent && parent.tagName !== 'BODY') {
        if (parent.tagName === 'LABEL') {
            return parent.textContent.trim().toLowerCase();
        }
        parent = parent.parentElement;
    }

    if (field.getAttribute('aria-label')) {
        return field.getAttribute('aria-label').trim().toLowerCase();
    }

    if (field.placeholder) {
        return field.placeholder.trim().toLowerCase();
    }

    return '';
}

/**
 * Normalize a string for matching
 */
function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a field matches a specific pattern
 */
function matchesPattern(field, patternConfig) {
    if (!field || !patternConfig) return false;

    const name = normalizeString(field.name || '');
    const id = normalizeString(field.id || '');
    const placeholder = normalizeString(field.placeholder || '');
    const label = normalizeString(getLabelText(field));
    const autocomplete = normalizeString(field.getAttribute('autocomplete') || '');

    const allText = `${name} ${id} ${placeholder} ${label} ${autocomplete}`;

    // First check exclude patterns - if field contains excluded patterns, don't match
    if (patternConfig.excludePatterns) {
        for (const excludePattern of patternConfig.excludePatterns) {
            if (allText.includes(normalizeString(excludePattern))) {
                return false; // This field should not match this pattern
            }
        }
    }

    // Check patterns (more specific patterns should be checked first)
    for (const pattern of patternConfig.patterns) {
        const normalizedPattern = normalizeString(pattern);
        if (allText.includes(normalizedPattern)) {
            return true;
        }
    }

    if (autocomplete && patternConfig.autocomplete) {
        for (const ac of patternConfig.autocomplete) {
            if (autocomplete.includes(normalizeString(ac))) {
                return true;
            }
        }
    }

    if (patternConfig.type && field.type === patternConfig.type) {
        return true;
    }

    if (label && patternConfig.labels) {
        for (const labelPattern of patternConfig.labels) {
            if (label.includes(normalizeString(labelPattern))) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Identify the field type of a form element
 * Checks more specific patterns first to avoid conflicts
 */
function identifyFieldType(field) {
    if (!field) return null;

    // Check firstName and lastName first (most specific) to avoid conflicts
    const priorityFields = ['firstName', 'lastName'];
    for (const fieldType of priorityFields) {
        if (FIELD_PATTERNS[fieldType] && matchesPattern(field, FIELD_PATTERNS[fieldType])) {
            return fieldType;
        }
    }

    // Then check other fields
    for (const [fieldType, patternConfig] of Object.entries(FIELD_PATTERNS)) {
        if (!priorityFields.includes(fieldType) && matchesPattern(field, patternConfig)) {
            return fieldType;
        }
    }

    return null;
}

/**
 * Get the value to fill for a specific field type from user profile
 * @param {string} fieldType - The identified field type
 * @param {Object} userSettings - The full user settings object (contains profile and addressInfo)
 */
function getFieldValue(fieldType, userSettings) {
    if (!userSettings || !fieldType) return '';

    // Access profile data from userSettings.profile
    const profile = userSettings.profile || {};
    const addressInfo = userSettings.addressInfo || {};

    switch (fieldType) {
        case 'firstName':
            return profile.firstName || '';
        case 'lastName':
            return profile.lastName || '';
        case 'email':
            return profile.email || '';
        case 'phone':
            return profile.phone || '';
        case 'linkedIn':
            return profile.linkedIn || '';
        case 'streetAddress':
            return addressInfo.streetAddress || '';
        case 'city':
            return addressInfo.city || '';
        case 'state':
            return addressInfo.state || '';
        case 'zipCode':
            return addressInfo.zipCode || '';
        case 'country':
            return addressInfo.country || '';
        default:
            return '';
    }
}

/**
 * Show notification when fields are auto-filled
 */
function showNotification(message, duration = 3000) {
    // Wait for body to exist
    if (!document.body) {
        setTimeout(() => showNotification(message, duration), 100);
        return;
    }

    // Remove existing notification if any
    const existing = document.getElementById('autofill-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'autofill-notification';
    notification.textContent = message;
    notification.style.cssText = `
		position: fixed;
		top: 20px;
		right: 20px;
		background-color: #1a73e8;
		color: white;
		padding: 12px 20px;
		border-radius: 4px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		z-index: 100000;
		font-family: 'Segoe UI', Arial, sans-serif;
		font-size: 14px;
		font-weight: 500;
		animation: slideIn 0.3s ease-out;
		max-width: 300px;
		word-wrap: break-word;
	`;

    // Add animation
    if (!document.getElementById('autofill-notification-style')) {
        const style = document.createElement('style');
        style.id = 'autofill-notification-style';
        style.textContent = `
			@keyframes slideIn {
				from {
					transform: translateX(100%);
					opacity: 0;
				}
				to {
					transform: translateX(0);
					opacity: 1;
				}
			}
		`;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
}

/**
 * Fill a single form field intelligently
 * Uses profile data if matched, otherwise uses random data
 */
function fillField(field) {
    if (!field || field.disabled || field.readOnly) return false;

    // Don't fill if field already has a value
    if (field.value && field.value.trim() !== '') return false;

    const tagName = field.tagName.toLowerCase();
    const inputType = field.type ? field.type.toLowerCase() : '';
    let value = '';
    let filled = false;

    // Try to identify field type and get value from profile
    const fieldType = identifyFieldType(field);
    if (fieldType) {
        // Pass the full userSettings so getFieldValue can access both profile and addressInfo
        value = getFieldValue(fieldType, userSettings);
        // Debug: log when we find a match and have profile data
        if (value) {
            console.log(`[Form AutoFiller] Using profile data for ${fieldType}: ${value}`);
        }
    }

    // If no profile value, generate random data based on field type
    if (!value) {
        console.log(`[Form AutoFiller] No profile data for ${fieldType || 'unknown field'}, using random data`);
        if (fieldType === 'firstName') {
            value = dataGenerators.generateName().split(' ')[0];
        } else if (fieldType === 'lastName') {
            value = dataGenerators.generateName().split(' ')[1] || 'Smith';
        } else if (fieldType === 'email' || inputType === 'email') {
            value = dataGenerators.generateEmail();
        } else if (fieldType === 'phone' || inputType === 'tel') {
            value = dataGenerators.generatePhone();
        } else if (fieldType === 'linkedIn' || inputType === 'url') {
            value = dataGenerators.generateLinkedIn();
        } else if (fieldType === 'streetAddress') {
            value = dataGenerators.generateAddress();
        } else if (fieldType === 'city') {
            value = dataGenerators.generateCity();
        } else if (fieldType === 'state') {
            value = dataGenerators.generateState();
        } else if (fieldType === 'zipCode') {
            value = dataGenerators.generateZip();
        } else if (fieldType === 'country') {
            value = dataGenerators.generateCountry();
        } else {
            // Generic text field - use random data
            const fieldName = field.name || field.id || field.placeholder || 'field';
            if (inputType === 'email') {
                value = dataGenerators.generateEmail();
            } else if (inputType === 'tel') {
                value = dataGenerators.generatePhone();
            } else if (inputType === 'url') {
                value = dataGenerators.generateLinkedIn();
            } else {
                value = dataGenerators.generateText(fieldName);
            }
        }
    }

    // Fill the field based on its type
    if (tagName === 'input') {
        if (inputType === 'text' || inputType === 'email' || inputType === 'tel' || inputType === 'url' || inputType === 'search') {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            filled = true;
        } else if (inputType === 'checkbox') {
            field.checked = !field.checked;
            field.dispatchEvent(new Event('change', { bubbles: true }));
            filled = true;
        } else if (inputType === 'radio') {
            field.checked = true;
            field.dispatchEvent(new Event('change', { bubbles: true }));
            filled = true;
        } else if (inputType === 'date') {
            const today = new Date();
            field.value = today.toISOString().split('T')[0];
            field.dispatchEvent(new Event('change', { bubbles: true }));
            filled = true;
        } else if (inputType === 'number') {
            field.value = Math.floor(Math.random() * 100);
            field.dispatchEvent(new Event('change', { bubbles: true }));
            filled = true;
        }
    } else if (tagName === 'textarea') {
        field.value = value || dataGenerators.generateText(field.name || field.id || 'textarea');
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
        filled = true;
    } else if (tagName === 'select') {
        if (field.options.length > 0) {
            const fillStrategy = userSettings.fillStrategy || 'random';
            let matched = false;

            // Try to match profile value if we have one
            if (value && fillStrategy === 'matching') {
                for (let i = 0; i < field.options.length; i++) {
                    const option = field.options[i];
                    const optionText = option.text.toLowerCase();
                    const optionValue = option.value.toLowerCase();
                    const valueLower = value.toLowerCase();

                    if (optionText.includes(valueLower) || optionValue.includes(valueLower)) {
                        field.selectedIndex = i;
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                        matched = true;
                        filled = true;
                        break;
                    }
                }
            }

            if (!matched) {
                // Select random option
                let selectedIndex = 0;
                if (field.options.length > 1 && (field.options[0].value === '' || field.options[0].text.includes('Select') || field.options[0].text.includes('Choose'))) {
                    selectedIndex = 1;
                }
                if (fillStrategy === 'random' && field.options.length > selectedIndex) {
                    selectedIndex = selectedIndex + Math.floor(Math.random() * (field.options.length - selectedIndex));
                }
                field.selectedIndex = selectedIndex;
                field.dispatchEvent(new Event('change', { bubbles: true }));
                filled = true;
            }
        }
    }

    return filled;
}

/**
 * Find and fill all form fields
 * Uses profile data when matched, otherwise uses random data
 */
function fillForm(triggerElement = null) {
    // Reload settings to ensure we have the most recent data
    loadUserSettings().then(() => {
        let filledCount = 0;
        const fieldsToFill = [];

        // Determine which fields to fill
        if (triggerElement && triggerElement.form && !userSettings.fillAllFields) {
            // Fill only the form containing the trigger element
            const formElements = Array.from(triggerElement.form.elements);
            fieldsToFill.push(...formElements);
        } else {
            // Fill all form fields on the page (including checkboxes and radios)
            const allFields = document.querySelectorAll(
                'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select'
            );
            fieldsToFill.push(...allFields);
        }

        // Fill each field
        fieldsToFill.forEach(field => {
            if (fillField(field)) {
                filledCount++;
            }
        });

        // Show notification
        if (filledCount > 0) {
            showNotification(`✓ Auto-filled ${filledCount} field${filledCount !== 1 ? 's' : ''}`);
        } else if (fieldsToFill.length === 0) {
            showNotification('ℹ No form fields found on this page', 3000);
        }
    });
}

/**
 * Load user settings from chrome.storage.local
 */
function loadUserSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get({ settings: {} }, (data) => {
            if (data.settings && Object.keys(data.settings).length > 0) {
                userSettings = {
                    autoFillOnLoad: data.settings.autoFillOnLoad || false,
                    fillAllFields: data.settings.fillAllFields !== undefined ? data.settings.fillAllFields : true,
                    fillStrategy: data.settings.fillStrategy || 'random',
                    profile: data.settings.profile || {
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        linkedIn: ''
                    },
                    addressInfo: data.settings.addressInfo || {
                        streetAddress: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    }
                };
                console.log('[Form AutoFiller] Settings loaded:', userSettings);
            } else {
                console.log('[Form AutoFiller] No settings found, using defaults');
            }
            resolve();
        });
    });
}

/**
 * Auto-fill forms on page load (if enabled)
 */
function autoFillOnPageLoad() {
    if (autoFilledOnLoad) return;
    if (!userSettings.autoFillOnLoad) return;

    // Wait a bit for dynamic content to load
    setTimeout(() => {
        fillForm();
        autoFilledOnLoad = true;
    }, 1000);
}

/**
 * Detect and fill dynamically loaded forms (with debouncing)
 */
function detectDynamicForms() {
    // Clear existing timer
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    // Debounce form detection
    debounceTimer = setTimeout(() => {
        if (userSettings.autoFillOnLoad && !autoFilledOnLoad) {
            const forms = document.querySelectorAll('form');
            if (forms.length > 0) {
                autoFillOnPageLoad();
            }
        }
    }, 500);
}

// Initialize
function initializeExtension() {
    loadUserSettings().then(() => {
        // Auto-fill on page load if enabled
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                autoFillOnPageLoad();
                setupMutationObserver();
            });
        } else {
            autoFillOnPageLoad();
            setupMutationObserver();
        }
    });
}

// Setup MutationObserver for dynamic forms
function setupMutationObserver() {
    // Wait for body to exist
    if (!document.body) {
        setTimeout(setupMutationObserver, 100);
        return;
    }

    // Watch for dynamically added forms (for SPAs)
    const observer = new MutationObserver(() => {
        detectDynamicForms();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Start initialization
initializeExtension();

// Listen for the fillFormEvent from the background script
window.addEventListener('fillFormEvent', (event) => {
    fillForm(event.detail?.triggerElement);
});

// Listen for keyboard shortcut (Alt+F) to fill form
document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key === 'f') {
        fillForm(document.activeElement);
    }
});

// Listen for storage changes to update settings in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.settings) {
        userSettings = changes.settings.newValue;
        // Reset auto-fill flag when settings change
        autoFilledOnLoad = false;
    }
});
