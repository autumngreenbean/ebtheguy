/**
 * Google Apps Script for Ethan Blake (ebtheguy) Website
 * 
 * SETUP INSTRUCTIONS:
 * 1. In Google Sheets, go to Extensions > Apps Script
 * 2. Delete any existing code and paste this entire file
 * 3. Save the script
 * 4. Click "Run" > "initializeSheets" to set up the sheet structure automatically
 * 5. Go to Project Settings (gear icon) > Script Properties
 * 6. Add property: GITHUB_TOKEN = [Your GitHub Personal Access Token]
 * 7. Add property: GITHUB_REPO = autumngreenbean/ebtheguy
 * 8. Click "Deploy" > "New deployment"
 * 9. Select type: "Web app"
 * 10. Execute as: "Me"
 * 11. Who has access: "Anyone"
 * 12. Click "Deploy" and copy the Web App URL
 * 
 * AUTOMATIC UPDATES:
 * - Whenever you edit the sheet, it waits 30 seconds before updating the website
 * - Multiple edits within 30 seconds are batched into a single update
 * - This prevents excessive GitHub API calls during editing sessions
 * - To change the delay, modify the sleep time in the onSheetEdit function (default: 30000ms = 30 seconds)
 * - Install an onEdit trigger (Run > installTrigger) to enable automatic updates
 */

/**
 * Configuration - uses Script Properties for security
 */
function getConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return {
    githubToken: scriptProperties.getProperty('GITHUB_TOKEN'),
    githubRepo: scriptProperties.getProperty('GITHUB_REPO') || 'autumngreenbean/ebtheguy',
    githubBranch: 'main',
    githubFilePath: 'data/content.json'
  };
}

/**
 * Install trigger to auto-update GitHub on sheet edit
 * Run this function once: Run > installTrigger
 */
function installTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Install new trigger for future edits only
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  
  SpreadsheetApp.getUi().alert(
    'Trigger Installed!',
    'The website will now automatically update 30 seconds after you finish editing the sheet.\n\n' +
    'Multiple edits within 30 seconds will be batched into a single update.\n\n' +
    'Run "updateGitHubFile" manually to push the current data to the website immediately.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Called automatically when sheet is edited (with debouncing)
 */
function onSheetEdit(e) {
  // Store the timestamp of this edit
  const scriptProperties = PropertiesService.getScriptProperties();
  const now = new Date().getTime();
  scriptProperties.setProperty('LAST_EDIT_TIME', now.toString());
  
  // Schedule a delayed update check (30 seconds from now)
  // This allows multiple edits to accumulate before pushing to GitHub
  Utilities.sleep(30000); // 30 second delay
  
  // Check if any newer edits happened while we were sleeping
  const lastEditTime = parseInt(scriptProperties.getProperty('LAST_EDIT_TIME') || '0');
  const timeSinceEdit = new Date().getTime() - lastEditTime;
  
  // Only update if no edits happened in the last 30 seconds
  // (i.e., this is the last edit in the batch)
  if (timeSinceEdit >= 29000) { // Allow 1 second tolerance
    try {
      console.log('Updating GitHub after batch edit...');
      updateGitHubFile();
    } catch (error) {
      console.error('Auto-update failed:', error);
      // Don't show error to user during auto-update
    }
  } else {
    console.log('Skipping update - newer edit detected');
  }
}

/**
 * Update the JSON file on GitHub with current sheet data
 * Can also be run manually: Run > updateGitHubFile
 */
function updateGitHubFile() {
  const config = getConfig();
  
  if (!config.githubToken) {
    const message = 'GitHub token not configured. Add GITHUB_TOKEN to Script Properties.';
    console.error(message);
    SpreadsheetApp.getUi().alert('Configuration Error', message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw new Error(message);
  }
  
  console.log('Starting GitHub update...');
  console.log('Repo:', config.githubRepo);
  console.log('File path:', config.githubFilePath);
  
  // Get all data from sheets
  const data = getAllData();
  console.log('Data collected from sheets');
  
  // Get current file from GitHub to get its SHA
  const getUrl = `https://api.github.com/repos/${config.githubRepo}/contents/${config.githubFilePath}`;
  const getOptions = {
    method: 'get',
    headers: {
      'Authorization': 'token ' + config.githubToken,
      'Accept': 'application/vnd.github.v3+json'
    },
    muteHttpExceptions: true
  };
  
  console.log('Fetching current file from GitHub...');
  const getResponse = UrlFetchApp.fetch(getUrl, getOptions);
  const getResponseCode = getResponse.getResponseCode();
  console.log('GitHub GET response code:', getResponseCode);
  
  if (getResponseCode !== 200) {
    const errorText = getResponse.getContentText();
    console.error('GitHub GET failed:', errorText);
    const message = 'Failed to fetch file from GitHub. Check repo name and token permissions.\n\nError: ' + errorText;
    SpreadsheetApp.getUi().alert('GitHub Error', message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw new Error(message);
  }
  
  const getResult = JSON.parse(getResponse.getContentText());
  console.log('Current file SHA:', getResult.sha);
  
  // Update file on GitHub
  const putUrl = `https://api.github.com/repos/${config.githubRepo}/contents/${config.githubFilePath}`;
  const content = Utilities.base64Encode(JSON.stringify(data, null, 2));
  
  const putPayload = {
    message: 'Auto-update content from Google Sheets',
    content: content,
    branch: config.githubBranch,
    sha: getResult.sha
  };
  
  const putOptions = {
    method: 'put',
    headers: {
      'Authorization': 'token ' + config.githubToken,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(putPayload),
    muteHttpExceptions: true
  };
  
  console.log('Updating file on GitHub...');
  const putResponse = UrlFetchApp.fetch(putUrl, putOptions);
  const putResponseCode = putResponse.getResponseCode();
  console.log('GitHub PUT response code:', putResponseCode);
  
  if (putResponseCode === 200) {
    console.log('✅ GitHub file updated successfully!');
    SpreadsheetApp.getUi().alert(
      'Success!',
      'Website content has been updated!\n\nChanges will appear on the live site in 2-3 minutes.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return { success: true, message: 'Content updated on website' };
  } else {
    const putResult = JSON.parse(putResponse.getContentText());
    console.error('GitHub PUT failed:', putResult);
    const message = 'Failed to update GitHub.\n\nError: ' + (putResult.message || 'Unknown error');
    SpreadsheetApp.getUi().alert('GitHub Error', message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw new Error('Failed to update GitHub: ' + putResult.message);
  }
}

/**
 * Run this function ONCE to automatically set up your sheet structure
 * Go to: Run > initializeSheets
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get Tab 1: About
  let tab1 = ss.getSheetByName('About');
  if (!tab1) {
    // Create new sheet or rename first sheet
    const sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getName() === 'Sheet1') {
      tab1 = sheets[0].setName('About');
    } else {
      tab1 = ss.insertSheet('About');
    }
  }
  
  // Set up Tab 1 structure
  setupAboutSheet(tab1);
  
  // Create or get Tab 2: Blog
  let tab2 = ss.getSheetByName('Blog');
  if (!tab2) {
    tab2 = ss.insertSheet('Blog');
  }
  
  // Set up Tab 2 structure
  setupBlogSheet(tab2);
  
  // Create or get Tab 3: Music Players
  let tab3 = ss.getSheetByName('Music Players');
  if (!tab3) {
    tab3 = ss.insertSheet('Music Players');
  }
  
  // Set up Tab 3 structure
  setupMusicPlayersSheet(tab3);
  
  // Success message
  SpreadsheetApp.getUi().alert(
    'Sheet Setup Complete!',
    'Your sheet structure has been created with:\n\n' +
    '✅ About (window1 & window2 content)\n' +
    '✅ Blog (blog posts)\n' +
    '✅ Music Players (artist/album data)\n\n' +
    'You can now add your content and deploy the web app!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Set up Tab 1: About
 */
function setupAboutSheet(sheet) {
  // Clear existing content
  sheet.clear();
  
  // Set column widths
  sheet.setColumnWidth(1, 150);  // Column A
  sheet.setColumnWidth(2, 500);  // Column B
  
  // WINDOW 1 SECTION
  sheet.getRange('A1').setValue('Window 1').setFontWeight('bold').setBackground('#d9ead3');
  sheet.getRange('A2').setValue('Title').setFontWeight('bold');
  sheet.getRange('B2').setValue('Message box');
  sheet.getRange('A3').setValue('Welcome Text').setFontWeight('bold');
  sheet.getRange('B3').setValue('Welcome!');
  sheet.getRange('A4').setValue('Message').setFontWeight('bold');
  sheet.getRange('B4').setValue('This is a short about section for ethan\'s audio production website. Who knows what will be written here? It could be long, or short - but not too long.');
  
  // WINDOW 2 SECTION
  sheet.getRange('A6').setValue('Window 2').setFontWeight('bold').setBackground('#c9daf8');
  sheet.getRange('A7').setValue('Title').setFontWeight('bold');
  sheet.getRange('B7').setValue('Contact');
  sheet.getRange('A8').setValue('Email').setFontWeight('bold');
  sheet.getRange('B8').setValue('myemail@email.com');
  sheet.getRange('A9').setValue('Contact').setFontWeight('bold');
  sheet.getRange('B9').setValue('another-contact-field');
  
  // BUTTONS SECTION
  sheet.getRange('A11').setValue('Buttons').setFontWeight('bold').setBackground('#fff2cc');
  sheet.getRange('A12').setValue('Button Text').setFontWeight('bold');
  sheet.getRange('B12').setValue('Button URL').setFontWeight('bold');
  sheet.getRange('A13').setValue('Link here');
  sheet.getRange('B13').setValue('https://example.com/link1');
  sheet.getRange('A14').setValue('Spotify');
  sheet.getRange('B14').setValue('https://open.spotify.com/artist/your-artist-id');
  
  // Freeze first row
  sheet.setFrozenRows(1);
}

/**
 * Set up Tab 2: Blog
 */
function setupBlogSheet(sheet) {
  // Clear existing content
  sheet.clear();
  
  // Set column widths
  sheet.setColumnWidth(1, 200);  // Title
  sheet.setColumnWidth(2, 400);  // Body
  sheet.setColumnWidth(3, 80);   // Year
  sheet.setColumnWidth(4, 80);   // Month
  sheet.setColumnWidth(5, 80);   // Date
  sheet.setColumnWidth(6, 80);   // Time
  
  // Set headers
  const headers = [['Title', 'Body', 'Year', 'Month', 'Date', 'Time']];
  sheet.getRange('A1:F1').setValues(headers).setFontWeight('bold').setBackground('#f3f3f3');
  
  // Add sample blog posts
  const samplePosts = [
    ['First Post', 'This is the body content of the first blog post. You can edit this from Google Sheets!', '2026', '01', '11', '12:00'],
    ['Second Post', 'This is another blog post. Add more posts in the Google Sheet and they will appear here automatically!', '2026', '01', '10', '15:30']
  ];
  sheet.getRange(2, 1, samplePosts.length, 6).setValues(samplePosts);
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Set up Tab 3: Music Players
 */
function setupMusicPlayersSheet(sheet) {
  // Clear existing content
  sheet.clear();
  
  // Set column widths
  sheet.setColumnWidth(1, 150);  // Artist
  sheet.setColumnWidth(2, 250);  // Album Title
  sheet.setColumnWidth(3, 200);  // Display Name
  sheet.setColumnWidth(4, 100);  // Icon
  sheet.setColumnWidth(5, 100);  // Position Top
  sheet.setColumnWidth(6, 100);  // Position Right
  sheet.setColumnWidth(7, 120);  // Apple Album ID
  
  // Set headers
  const headers = [['Artist', 'Album Title', 'Display Name', 'Icon', 'Position Top', 'Position Right', 'Apple Album ID']];
  sheet.getRange('A1:G1').setValues(headers).setFontWeight('bold').setBackground('#f3f3f3');
  
  // Add sample music players
  const samplePlayers = [
    ['Murdock Street', 'Basement Candy - EP', 'Basement-Candy.wav', 'cd.png', '15%', '90%', ''],
    ['Murdock Street', 'Ode to You', 'Ode-to-You.wav', 'cd.png', '75%', '10%', ''],
    ['Lokadonna', 'code:GRĖĖN (feat. Prod.eb) - EP', 'code:GREEN.wav', 'cd.png', '20%', '20%', '1715533205'],
    ['tsunamë', '99 Side A', '99 Side A.wav', 'cd.png', '50%', '50%', '1527805750']
  ];
  sheet.getRange(2, 1, samplePlayers.length, 7).setValues(samplePlayers);
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Get all website data in one request
 */
function getAllData() {
  return {
    about: getAboutData(),
    blog: getBlogData(),
    musicPlayers: getMusicPlayersData(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Get about section data from the About sheet
 */
function getAboutData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('About');
  if (!sheet) {
    throw new Error('Sheet "About" not found');
  }
  
  // Get data from specific cells
  const window1Title = sheet.getRange('B2').getValue();
  const window1Welcome = sheet.getRange('B3').getValue();
  const window1Message = sheet.getRange('B4').getValue();
  const window2Title = sheet.getRange('B7').getValue();
  const window2Email = sheet.getRange('B8').getValue();
  const window2Contact = sheet.getRange('B9').getValue();
  
  // Get buttons (starting from row 13)
  const buttonsRange = sheet.getRange('A13:B50');
  const buttonsValues = buttonsRange.getValues();
  const buttons = [];
  
  for (let i = 0; i < buttonsValues.length; i++) {
    const [text, url] = buttonsValues[i];
    
    // Stop at first empty row
    if (!text && !url) {
      break;
    }
    
    if (text && url) {
      buttons.push({
        text: text.toString().trim(),
        url: url.toString().trim()
      });
    }
  }
  
  return {
    showWelcomeOnLoad: true,
    window1: {
      title: window1Title ? window1Title.toString().trim() : 'Message box',
      message: window1Message ? window1Message.toString().trim() : '',
      welcomeText: window1Welcome ? window1Welcome.toString().trim() : 'Welcome!'
    },
    window2: {
      title: window2Title ? window2Title.toString().trim() : 'Contact',
      email: window2Email ? window2Email.toString().trim() : '',
      contact: window2Contact ? window2Contact.toString().trim() : '',
      buttons: buttons
    }
  };
}

/**
 * Get blog posts from the Blog sheet
 */
function getBlogData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Blog');
  if (!sheet) {
    throw new Error('Sheet "Blog" not found');
  }
  
  // Get blog data starting from row 2 (row 1 has headers)
  const dataRange = sheet.getRange('A2:F100');
  const values = dataRange.getValues();
  
  const posts = [];
  
  for (let i = 0; i < values.length; i++) {
    const [title, body, year, month, date, time] = values[i];
    
    // Stop at first empty row
    if (!title && !body) {
      break;
    }
    
    // Only add if title is present
    if (title) {
      posts.push({
        title: title.toString().trim(),
        body: body ? body.toString().trim() : '',
        year: year ? year.toString().trim() : '',
        month: month ? month.toString().trim() : '',
        date: date ? date.toString().trim() : '',
        time: time ? time.toString().trim() : ''
      });
    }
  }
  
  return posts;
}

/**
 * Get music players from the Music Players sheet
 */
function getMusicPlayersData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Music Players');
  if (!sheet) {
    throw new Error('Sheet "Music Players" not found');
  }
  
  // Get data starting from row 2 (row 1 has headers)
  const dataRange = sheet.getRange('A2:G100');
  const values = dataRange.getValues();
  
  // Organize by artist
  const artistsMap = {};
  
  for (let i = 0; i < values.length; i++) {
    const [artist, albumTitle, displayName, icon, posTop, posRight, appleAlbumId] = values[i];
    
    // Stop at first empty row
    if (!artist && !albumTitle) {
      break;
    }
    
    if (artist && albumTitle) {
      const artistName = artist.toString().trim();
      
      if (!artistsMap[artistName]) {
        artistsMap[artistName] = {
          artist: artistName,
          albums: []
        };
      }
      
      const albumData = {
        title: albumTitle.toString().trim(),
        displayName: displayName ? displayName.toString().trim() : albumTitle.toString().trim(),
        icon: icon ? icon.toString().trim() : 'cd.png',
        position: {
          top: posTop ? posTop.toString().trim() : '50%',
          right: posRight ? posRight.toString().trim() : '50%'
        }
      };
      
      // Only add appleAlbumId if it exists and is not empty
      if (appleAlbumId && appleAlbumId.toString().trim()) {
        albumData.appleAlbumId = appleAlbumId.toString().trim();
      }
      
      artistsMap[artistName].albums.push(albumData);
    }
  }
  
  // Convert map to array
  return Object.values(artistsMap);
}

/**
 * Helper function to format dates consistently
 */
function formatDate(date) {
  if (!date) return '';
  
  // If already a string, return as is
  if (typeof date === 'string') {
    return date;
  }
  
  // If it's a Date object, format it
  if (date instanceof Date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  return date.toString();
}

