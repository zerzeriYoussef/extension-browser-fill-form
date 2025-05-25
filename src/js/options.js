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

// Save options to chrome.storage
function saveOptions() {
	const settings = {
		useCustomData: $("optUseCustomData").checked,
		fillAllFields: $("optFillAllFields").checked,
		fillStrategy: $("optFillStrategy").value,
		personalInfo: {
			fullName: $("optFullName").value,
			email: $("optEmail").value,
			phone: $("optPhone").value
		},
		addressInfo: {
			streetAddress: $("optStreetAddress").value,
			city: $("optCity").value,
			state: $("optState").value,
			zipCode: $("optZipCode").value,
			country: $("optCountry").value
		}
	};

	chrome.storage.sync.set({ settings }, () => {
		// Update status to let user know options were saved
		const status = $("status");
		status.textContent = 'Options saved.';
		setTimeout(() => {
			status.textContent = '';
		}, 1500);
	});
}

// Restore options from chrome.storage
function restoreOptions() {
	chrome.storage.sync.get({ settings: defaultSettings }, (data) => {
		const { settings } = data;

		// Restore form preferences
		$("optUseCustomData").checked = settings.useCustomData;
		$("optFillAllFields").checked = settings.fillAllFields;
		$("optFillStrategy").value = settings.fillStrategy;

		// Restore personal info
		$("optFullName").value = settings.personalInfo.fullName;
		$("optEmail").value = settings.personalInfo.email;
		$("optPhone").value = settings.personalInfo.phone;

		// Restore address info
		$("optStreetAddress").value = settings.addressInfo.streetAddress;
		$("optCity").value = settings.addressInfo.city;
		$("optState").value = settings.addressInfo.state;
		$("optZipCode").value = settings.addressInfo.zipCode;
		$("optCountry").value = settings.addressInfo.country;
	});
}

// Reset options to default values
function resetOptions() {
	// Use custom data should be unchecked
	$("optUseCustomData").checked = defaultSettings.useCustomData;
	$("optFillAllFields").checked = defaultSettings.fillAllFields;
	$("optFillStrategy").value = defaultSettings.fillStrategy;

	// Clear personal info
	$("optFullName").value = '';
	$("optEmail").value = '';
	$("optPhone").value = '';

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