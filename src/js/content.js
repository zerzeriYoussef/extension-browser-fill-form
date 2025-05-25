/**
 * Form AutoFiller - Content Script
 * Detects and autofills form fields
 */

// User settings and custom data (will be loaded from storage)
let userSettings = {
    useCustomData: false,
    fillAllFields: true,
    fillStrategy: 'random',
    personalInfo: {
        fullName: '',
        email: '',
        phone: ''
    },
    addressInfo: {
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
    }
};

// Load user settings from storage
function loadUserSettings() {
    chrome.storage.sync.get('settings', (data) => {
        if (data.settings) {
            userSettings = data.settings;
        }
    });
}

// Load settings when content script is first executed
loadUserSettings();

// Data generators for form filling
const dataGenerators = {
    // Random name generator
    generateName: () => {
        if (userSettings.useCustomData && userSettings.personalInfo.fullName) {
            return userSettings.personalInfo.fullName;
        }
        const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'William', 'Olivia', 'James', 'Sofia', 'Robert', 'Emily'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    },

    // Email generator
    generateEmail: () => {
        if (userSettings.useCustomData && userSettings.personalInfo.email) {
            return userSettings.personalInfo.email;
        }
        const usernames = ['john', 'jane', 'user', 'test', 'contact', 'info', 'support', 'admin'];
        const domains = ['example.com', 'test.com', 'mail.com', 'domain.com', 'company.net'];
        return `${usernames[Math.floor(Math.random() * usernames.length)]}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },

    // Phone number generator
    generatePhone: () => {
        if (userSettings.useCustomData && userSettings.personalInfo.phone) {
            return userSettings.personalInfo.phone;
        }
        return `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;
    },

    // Address generator
    generateAddress: () => {
        if (userSettings.useCustomData && userSettings.addressInfo.streetAddress) {
            return userSettings.addressInfo.streetAddress;
        }
        const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Park Blvd', 'Cedar Ln'];
        return `${Math.floor(Math.random() * 1000 + 1)} ${streets[Math.floor(Math.random() * streets.length)]}`;
    },

    // City generator
    generateCity: () => {
        if (userSettings.useCustomData && userSettings.addressInfo.city) {
            return userSettings.addressInfo.city;
        }
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        return cities[Math.floor(Math.random() * cities.length)];
    },

    // State generator
    generateState: () => {
        if (userSettings.useCustomData && userSettings.addressInfo.state) {
            return userSettings.addressInfo.state;
        }
        const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
        return states[Math.floor(Math.random() * states.length)];
    },

    // Zip code generator
    generateZip: () => {
        if (userSettings.useCustomData && userSettings.addressInfo.zipCode) {
            return userSettings.addressInfo.zipCode;
        }
        return `${Math.floor(Math.random() * 90000 + 10000)}`;
    },

    // Country generator
    generateCountry: () => {
        if (userSettings.useCustomData && userSettings.addressInfo.country) {
            return userSettings.addressInfo.country;
        }
        return 'United States';
    },

    // Password generator
    generatePassword: () => {
        return 'Password123!';
    }
};

// Function to determine the likely type of an input field based on its attributes
function identifyFieldType(field) {
    const name = field.name?.toLowerCase() || '';
    const id = field.id?.toLowerCase() || '';
    const placeholder = field.placeholder?.toLowerCase() || '';
    const type = field.type?.toLowerCase() || '';
    const label = document.querySelector(`label[for="${field.id}"]`)?.textContent.toLowerCase() || '';

    const allAttributes = `${name} ${id} ${placeholder} ${label}`;

    if (type === 'email' || allAttributes.includes('email')) {
        return 'email';
    } else if (type === 'tel' || allAttributes.includes('phone') || allAttributes.includes('mobile') || allAttributes.includes('telephone')) {
        return 'phone';
    } else if (allAttributes.includes('name')) {
        if (allAttributes.includes('first') || allAttributes.includes('given')) {
            return 'first_name';
        } else if (allAttributes.includes('last') || allAttributes.includes('family') || allAttributes.includes('surname')) {
            return 'last_name';
        } else {
            return 'full_name';
        }
    } else if (allAttributes.includes('address')) {
        if (allAttributes.includes('street')) {
            return 'street';
        } else {
            return 'address';
        }
    } else if (allAttributes.includes('city')) {
        return 'city';
    } else if (allAttributes.includes('state') || allAttributes.includes('province') || allAttributes.includes('region')) {
        return 'state';
    } else if ((allAttributes.includes('zip') || allAttributes.includes('postal')) && allAttributes.includes('code')) {
        return 'zip';
    } else if (allAttributes.includes('country')) {
        return 'country';
    } else if (type === 'password' || allAttributes.includes('password')) {
        return 'password';
    }

    return 'text';
}

// Function to fill a form field based on its type
function fillField(field) {
    if (!field || field.disabled || field.readOnly) return;

    const fieldType = identifyFieldType(field);

    switch (field.tagName.toLowerCase()) {
        case 'input':
            switch (field.type.toLowerCase()) {
                case 'text':
                case 'search':
                    switch (fieldType) {
                        case 'first_name':
                            field.value = dataGenerators.generateName().split(' ')[0];
                            break;
                        case 'last_name':
                            field.value = dataGenerators.generateName().split(' ')[1];
                            break;
                        case 'full_name':
                            field.value = dataGenerators.generateName();
                            break;
                        case 'email':
                            field.value = dataGenerators.generateEmail();
                            break;
                        case 'phone':
                            field.value = dataGenerators.generatePhone();
                            break;
                        case 'street':
                        case 'address':
                            field.value = dataGenerators.generateAddress();
                            break;
                        case 'city':
                            field.value = dataGenerators.generateCity();
                            break;
                        case 'state':
                            field.value = dataGenerators.generateState();
                            break;
                        case 'zip':
                            field.value = dataGenerators.generateZip();
                            break;
                        case 'country':
                            field.value = dataGenerators.generateCountry();
                            break;
                        default:
                            field.value = `Text for ${field.name || field.id || 'unknown field'}`;
                    }
                    break;
                case 'email':
                    field.value = dataGenerators.generateEmail();
                    break;
                case 'tel':
                    field.value = dataGenerators.generatePhone();
                    break;
                case 'password':
                    field.value = dataGenerators.generatePassword();
                    break;
                case 'checkbox':
                    field.checked = !field.checked;
                    break;
                case 'radio':
                    field.checked = true;
                    break;
                case 'date':
                    const today = new Date();
                    const dateString = today.toISOString().split('T')[0];
                    field.value = dateString;
                    break;
                case 'number':
                    field.value = Math.floor(Math.random() * 100);
                    break;
            }
            break;
        case 'textarea':
            field.value = `Sample text for ${field.name || field.id || 'textarea'} field. This is automatically generated content.`;
            break;
        case 'select':
            if (field.options.length) {
                const fillStrategy = userSettings.fillStrategy || 'random';
                let selectedIndex = 0;

                // Skip placeholder options
                if (field.options.length > 1 && (field.options[0].value === '' || field.options[0].text.includes('Select') || field.options[0].text.includes('Choose'))) {
                    selectedIndex = 1;
                }

                if (fillStrategy === 'first') {
                    // Use the first non-placeholder option
                    field.selectedIndex = selectedIndex;
                } else if (fillStrategy === 'random') {
                    // Choose a random option
                    const randomIndex = selectedIndex + Math.floor(Math.random() * (field.options.length - selectedIndex));
                    field.selectedIndex = randomIndex;
                } else if (fillStrategy === 'matching' && userSettings.useCustomData) {
                    // Try to find an option that matches user data (for common fields)
                    const fieldType = identifyFieldType(field);
                    let valueToMatch = '';

                    if (fieldType === 'country') {
                        valueToMatch = userSettings.addressInfo.country;
                    } else if (fieldType === 'state') {
                        valueToMatch = userSettings.addressInfo.state;
                    }

                    if (valueToMatch) {
                        // Try to find a matching option
                        for (let i = 0; i < field.options.length; i++) {
                            const option = field.options[i];
                            if (option.text.toLowerCase().includes(valueToMatch.toLowerCase())) {
                                field.selectedIndex = i;
                                break;
                            }
                        }
                    } else {
                        // Fall back to random selection
                        const randomIndex = selectedIndex + Math.floor(Math.random() * (field.options.length - selectedIndex));
                        field.selectedIndex = randomIndex;
                    }
                }
            }
            break;
    }

    // Trigger change event
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
}

// Function to find and fill all form fields
function fillForm(triggerElement = null) {
    console.log('Filling form fields...');

    // First, reload settings to ensure we have the most recent data
    loadUserSettings();

    // If a specific form element was triggered and we're not filling all fields
    if (triggerElement && triggerElement.form && !userSettings.fillAllFields) {
        const formElements = triggerElement.form.elements;
        Array.from(formElements).forEach(element => fillField(element));
        return;
    }

    // Fill all form fields on the page
    const inputFields = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), textarea, select');
    inputFields.forEach(field => fillField(field));
}

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
    if (namespace === 'sync' && changes.settings) {
        userSettings = changes.settings.newValue;
    }
}); 