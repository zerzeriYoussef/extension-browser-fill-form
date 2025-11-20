# Form AutoFiller Extension

A browser extension that allows users to automatically fill forms with a single click. Save time by pre-configuring your form data and applying it instantly to any web form.

## Features

- **One-Click Form Filling**: Fill entire forms with a single click
- **Context Menu Integration**: Right-click on form fields for quick filling
- **Keyboard Shortcut**: Use Ctrl+Shift+F (or MacCtrl+Shift+F on Mac) to activate
- **Customizable Fields**: Configure your personal data in the options page
- **Privacy-Focused**: All your data is stored locally in your browser
- **Cross-Browser Support**: Works with Chrome, Firefox, Edge, Opera, and other Chromium-based browsers

## Installation

### From Web Store
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Firefox: `about:addons`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `src` folder from this repository

## Usage

1. Click the Form AutoFiller icon in your browser toolbar, or use the keyboard shortcut (Ctrl+Shift+F)
2. Alternatively, right-click on any form field and select "Remplir la form" from the context menu
3. The form will be automatically filled with your pre-configured data

## Configuration

1. Right-click on the extension icon and select "Options"
2. Enter your personal information that you want to use for form filling
3. Save your settings
4. Your data is stored locally in your browser and is never sent to any server

## Development

### Prerequisites
- Node.js and npm

### Setup
1. Clone the repository:
```
git clone https://github.com/zerzeriYoussef/extension-browser-fill-form.git
```
2. Install dependencies:
```
npm install
```

### Build
Run `npm run dist` to create a zipped, production-ready extension for each browser.

## Privacy

This extension stores all your data locally in your browser. No data is sent to any external servers.

## License

This project is licensed under the GNU General Public License v2.0 - see the [LICENSE](LICENSE) file for details.

## Author

Created by youssef zerzeri

## Support

For support, please visit https://github.com/zerzeriYoussef