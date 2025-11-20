/**
 * Form AutoFiller - Options Page Script
 * Handles user preferences for form autofilling
 */

//================================================
/*

Browser extension starter template
The development ready template for beginner
Copyright (C) 2022 Stefan vd
www.stefanvd.net

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.


To view a copy of this license, visit http://creativecommons.org/licenses/GPL/2.0/

*/
//================================================

function $(id) { return document.getElementById(id); }

// Default form data settings
const defaultSettings = {
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

// Save options to chrome.storage.local (privacy-focused)
function saveOptions() {
	const settings = {
		autoFillOnLoad: $("optAutoFillOnLoad").checked,
		fillAllFields: $("optFillAllFields").checked,
		fillStrategy: $("optFillStrategy").value,
		profile: {
			firstName: $("optFirstName").value.trim(),
			lastName: $("optLastName").value.trim(),
			email: $("optEmail").value.trim(),
			phone: $("optPhone").value.trim(),
			linkedIn: $("optLinkedIn").value.trim()
		},
		addressInfo: {
			streetAddress: $("optStreetAddress").value.trim(),
			city: $("optCity").value.trim(),
			state: $("optState").value.trim(),
			zipCode: $("optZipCode").value.trim(),
			country: $("optCountry").value.trim()
		}
	};

	// Use chrome.storage.local for privacy (data stays on device)
	chrome.storage.local.set({ settings }, () => {
		// Update status to let user know options were saved
		const status = $("status");
		status.textContent = 'Options saved.';
		setTimeout(() => {
			status.textContent = '';
		}, 1500);
	});
}

// Restore options from chrome.storage.local
function restoreOptions() {
	chrome.storage.local.get({ settings: defaultSettings }, (data) => {
		const { settings } = data;

		// Restore form preferences
		$("optAutoFillOnLoad").checked = settings.autoFillOnLoad || false;
		$("optFillAllFields").checked = settings.fillAllFields !== undefined ? settings.fillAllFields : true;
		$("optFillStrategy").value = settings.fillStrategy || 'random';

		// Restore profile info (handle migration from old format)
		if (settings.profile) {
			$("optFirstName").value = settings.profile.firstName || '';
			$("optLastName").value = settings.profile.lastName || '';
			$("optEmail").value = settings.profile.email || '';
			$("optPhone").value = settings.profile.phone || '';
			$("optLinkedIn").value = settings.profile.linkedIn || '';
		} else if (settings.personalInfo) {
			// Migrate from old format (fullName to firstName/lastName)
			const fullName = settings.personalInfo.fullName || '';
			const nameParts = fullName.split(' ');
			$("optFirstName").value = nameParts[0] || '';
			$("optLastName").value = nameParts.slice(1).join(' ') || '';
			$("optEmail").value = settings.personalInfo.email || '';
			$("optPhone").value = settings.personalInfo.phone || '';
			$("optLinkedIn").value = '';
		}

		// Restore address info
		$("optStreetAddress").value = settings.addressInfo?.streetAddress || '';
		$("optCity").value = settings.addressInfo?.city || '';
		$("optState").value = settings.addressInfo?.state || '';
		$("optZipCode").value = settings.addressInfo?.zipCode || '';
		$("optCountry").value = settings.addressInfo?.country || '';
	});
}

// Reset options to default values
function resetOptions() {
	// Reset preferences
	$("optAutoFillOnLoad").checked = defaultSettings.autoFillOnLoad;
	$("optFillAllFields").checked = defaultSettings.fillAllFields;
	$("optFillStrategy").value = defaultSettings.fillStrategy;

	// Clear profile info
	$("optFirstName").value = '';
	$("optLastName").value = '';
	$("optEmail").value = '';
	$("optPhone").value = '';
	$("optLinkedIn").value = '';

	// Clear address info
	$("optStreetAddress").value = '';
	$("optCity").value = '';
	$("optState").value = '';
	$("optZipCode").value = '';
	$("optCountry").value = '';

	// Save the cleared options
	saveOptions();

	// Show confirmation
	const status = $("status");
	status.textContent = 'Options reset to default.';
	setTimeout(() => {
		status.textContent = '';
	}, 1500);
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
	// Load saved options
	restoreOptions();

	// Add event listeners
	$("save").addEventListener('click', saveOptions);
	$("reset").addEventListener('click', resetOptions);
});