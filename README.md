# browser-scripts

A collection of random browser scripts to enhance various websites.

# Tampermonkey Script (bblf-enhancer.js)

This is a tampermonkey script that will improve the experience on the Big Brother Live Feeds page.

## Features
* Auto-click the 'Click to watch' buttons when changing cameras
* Auto-switch to Quad cam at startup
* Add number hotkeys for switching cameras (1-5)
* Makes the fullscreen button fullscreen just the camera, and not the page
* Hide chat and video thumbs
* Watch for video error messages and reload page
* Extended Watch: Watch for 'Still watching' or 'Timeout' messages and click or reload page
* Hides P+ controls and show video scrubber

Any of these features are optional by changing the settings in the script.

** Warning: this will run custom javascript and modify the way some things work on the Paramount+ Live Feeds page temporarily, and may cause issues navigating or using the page. You can disable it in Tampermonkey by toggling the script off. A page refresh may be required. **

## Install instructions:

1. Install the [Tampermonkey extension](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) in your browser.

2. **You will need to allow User Scripts to run in the extension settings**. In your browser, find your Extension Settings, click on Details for Tampermonkey. Scroll to Allow User Scripts and toggle it on.

2. In the Tampermonkey dashboard, click Utilities, and copy the following url into the Import from URL box:

    `https://raw.githubusercontent.com/sammygcodes/browser-scripts/refs/heads/main/bblf-enhancer.js`

3. Click the Install button, then Install again.

4. With the script installed, visit the Live Feeds page, click the Tampermonkey button in your extensions bar (usually the top-right of the browser, accessed by clicking the puzzle piece icon) and toggle the BBLF Enhancer on.

5. Refresh the page. You must click the Start BBLF Enhancer button to begin using these features.

To disable the script at any time, toggle BBLF Enhancer script off in Tampermonkey, and refresh the page.

# Stylebot CSS (bblf-enhancer.css)

This is some custom CSS that cleans up the Big Brother Live feeds page (which is absolutely awful btw).

** Warning: this will modify the display of the Paramount+ Live Feeds page temporarily, and may cause issues navigating or using the page. You can disable it in Stylebot by toggling it off to return to normal. A page refresh may be required. **

## Features
* Adjust page to hide header/footer and make video fill the page
* (optional) hide the thumbs cam to have just the active camera video
* (optional) hide the sidebar/chat
* (optional) hide the loading spinner
* (optional) hide P+ video overlay and controls

## Install instructions:

1. Install the [Stylebot extension](https://chromewebstore.google.com/detail/stylebot/oiaejidbmkiecgbjeifoejpgmdaleoha) in your browser.

2. Go to the Live Feeds page.

3. Click the Stylebot icon in your browser extensions bar (usually the top-right of the browser, accessed by clicking the puzzle piece icon)

4. Click Open Stylebot

5. Click the Code button at the bottom and paste the css provided here:

    `https://raw.githubusercontent.com/liquid8d/browser-scripts/refs/heads/main/bblf-enhancer.css`

6. Click the X (close) button

7. Make sure the CSS is enabled for the page by clicking the Stylebot extension icon again and toggle the css for the live feeds page to on.

If you open Stylebot again, you can modify the css to adjust things how you want them. Comments explain what can be modified.



