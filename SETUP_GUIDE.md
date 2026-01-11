# ebtheguy Website - Google Sheets Integration Setup Guide

This guide will help you set up the Google Sheets integration for automatically updating your website content.

## Overview

Your website now uses a **static JSON file** (`data/content.json`) that is automatically updated whenever you edit a Google Sheet. This provides:

- ✅ **Fast loading** - No API calls during page load
- ✅ **Easy editing** - Manage all content in a familiar Google Sheets interface
- ✅ **Automatic updates** - Changes appear on your website in 2-3 minutes
- ✅ **Version control** - All updates are tracked in GitHub

## Architecture

1. **Google Sheets** → Contains your editable content (About, Blog, Music Players)
2. **Apps Script** → Automatically pushes changes to GitHub
3. **GitHub Repository** → Stores `data/content.json`
4. **Website** → Loads content from the static JSON file

---

## Setup Instructions

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **"ebtheguy Website Content"** (or any name you prefer)

### Step 2: Set Up Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `/ebtheguy/google-apps/Code.gs`
4. Paste it into the Apps Script editor
5. Click **💾 Save** (or Ctrl/Cmd+S)
6. Name your project: **"ebtheguy Content Manager"**

### Step 3: Initialize Sheet Structure

1. In the Apps Script editor, find the function dropdown (top toolbar)
2. Select **`initializeSheets`** from the dropdown
3. Click **▶️ Run**
4. You'll be asked to authorize the script:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to ebtheguy Content Manager (unsafe)**
   - Click **Allow**
5. A success message will appear
6. Go back to your Google Sheet and you'll see three tabs have been created:
   - **About** - Window content and buttons
   - **Blog** - Blog posts
   - **Music Players** - Artist and album data

### Step 4: Get a GitHub Personal Access Token

1. Go to GitHub: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a descriptive name: **"ebtheguy Google Sheets Integration"**
4. Set expiration: **No expiration** (or your preference)
5. Select scopes:
   - ✅ **repo** (Full control of private repositories)
6. Click **Generate token**
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)
   - It should look like: `ghp_abc123xyz789...`

### Step 5: Configure Script Properties

1. Go back to your Apps Script editor
2. Click the **⚙️ Project Settings** icon (left sidebar)
3. Scroll down to **Script Properties**
4. Click **Add script property**
5. Add the following properties:

   **Property 1:**
   - Property: `GITHUB_TOKEN`
   - Value: `[paste your GitHub token here]`

   **Property 2:**
   - Property: `GITHUB_REPO`
   - Value: `autumngreenbean/ebtheguy`

6. Click **Save script properties**

### Step 6: Install the Auto-Update Trigger

1. In the Apps Script editor, select **`installTrigger`** from the function dropdown
2. Click **▶️ Run**
3. A success message will appear
4. Now your website will automatically update whenever you edit the sheet!

### Step 7: Test Your Setup

1. Go back to your Google Sheet
2. In the **About** tab, change something (e.g., the welcome message)
3. In the Apps Script editor, select **`updateGitHubFile`** from the dropdown
4. Click **▶️ Run**
5. You should see a success message: **"Website content has been updated!"**
6. Check your GitHub repository:
   - Go to: https://github.com/autumngreenbean/ebtheguy/blob/main/data/content.json
   - You should see your changes reflected!

---

## How to Edit Your Website Content

### Editing About Section

1. Go to the **About** tab in your Google Sheet
2. Edit the following:
   - **Window 1**: Message box title, welcome text, and message
   - **Window 2**: Contact info and email
   - **Buttons**: Add/edit button text and URLs (rows 13+)

### Adding/Editing Blog Posts

1. Go to the **Blog** tab
2. Each row is a blog post with:
   - **Title**: Post title
   - **Body**: Full post content
   - **Year, Month, Date, Time**: Post metadata
3. To add a new post, add a new row below the existing posts
4. To delete a post, delete the entire row

### Managing Music Players

1. Go to the **Music Players** tab
2. Each row defines an album icon on your website:
   - **Artist**: Artist name (e.g., "Murdock Street")
   - **Album Title**: Full album name (e.g., "Basement Candy - EP")
   - **Display Name**: Text shown under the icon (e.g., "Basement-Candy.wav")
   - **Icon**: Icon filename (usually "cd.png")
   - **Position Top**: Vertical position (e.g., "15%")
   - **Position Right**: Horizontal position (e.g., "90%")

### Auto-Updates

After you save your changes in Google Sheets:
- Wait about 5 seconds
- The script automatically pushes changes to GitHub
- Changes appear on your live website in 2-3 minutes

---

## Troubleshooting

### Changes aren't appearing on the website

1. Check the Apps Script execution log:
   - Apps Script editor → **Executions** (left sidebar)
   - Look for errors in recent runs
2. Manually trigger an update:
   - Select `updateGitHubFile` → Click Run
3. Verify your GitHub token is still valid:
   - Go to: https://github.com/settings/tokens
   - Check if your token is still active

### "GitHub token not configured" error

- Go to **Project Settings** → **Script Properties**
- Make sure `GITHUB_TOKEN` property exists with your token

### "Failed to fetch file from GitHub" error

- Verify `GITHUB_REPO` is set to: `autumngreenbean/ebtheguy`
- Check that your token has **repo** permissions
- Make sure the file `data/content.json` exists in your repository

### Trigger not working automatically

- Re-run the `installTrigger` function
- Check Apps Script → **Triggers** (left sidebar) to see if trigger exists

---

## Content Structure Reference

### About Section JSON Format
```json
{
  "about": {
    "showWelcomeOnLoad": true,
    "window1": {
      "title": "Message box",
      "message": "Your message here...",
      "welcomeText": "Welcome!"
    },
    "window2": {
      "title": "Contact",
      "email": "your@email.com",
      "contact": "other contact info",
      "buttons": [
        { "text": "Link Text", "url": "https://example.com" }
      ]
    }
  }
}
```

### Blog Posts JSON Format
```json
{
  "blog": [
    {
      "title": "Post Title",
      "body": "Post content...",
      "year": "2026",
      "month": "01",
      "date": "11",
      "time": "12:00"
    }
  ]
}
```

### Music Players JSON Format
```json
{
  "musicPlayers": [
    {
      "artist": "Artist Name",
      "albums": [
        {
          "title": "Album Title",
          "displayName": "Display-Name.wav",
          "icon": "cd.png",
          "position": { "top": "15%", "right": "90%" }
        }
      ]
    }
  ]
}
```

---

## Files Modified

The following files were updated to implement this system:

1. **`/ebtheguy/google-apps/Code.gs`** - Complete rewrite with GitHub integration
2. **`/ebtheguy/data/content.json`** - Restructured to include blog and musicPlayers
3. **`/ebtheguy/modules/data-service.js`** - New file for fetching JSON data
4. **`/ebtheguy/modules/blog.js`** - Updated to use data-service instead of Google Sheets API
5. **`/ebtheguy/modules/about.js`** - Updated to use data-service for consistency
6. **`/ebtheguy/index.html`** - Added data-service.js import

---

## Next Steps

1. Complete the setup steps above
2. Edit your Google Sheet with your real content
3. Run `updateGitHubFile` to push changes to your website
4. Deploy your website and enjoy automatic updates!

---

## Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify your GitHub token permissions
3. Ensure the repository name is correct
4. Check that `data/content.json` exists in your repo

For questions about the implementation, refer to the michaels-website setup which uses the same architecture.
