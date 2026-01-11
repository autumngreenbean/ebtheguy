# Google Sheets Template Reference

This document shows the expected structure for your Google Sheets. Use this as a reference when setting up or modifying your sheets.

---

## Sheet Tab 1: "About"

This sheet manages the About/Contact windows on your website.

| Column A          | Column B                                                                                                   |
|-------------------|------------------------------------------------------------------------------------------------------------|
| **Window 1**      |                                                                                                            |
| Title             | Message box                                                                                                |
| Welcome Text      | Welcome!                                                                                                   |
| Message           | This is a short about section for ethan's audio production website. Who knows what will be written here? It could be long, or short - but not too long. |
|                   |                                                                                                            |
| **Window 2**      |                                                                                                            |
| Title             | Contact                                                                                                    |
| Email             | myemail@email.com                                                                                          |
| Contact           | another-contact-field                                                                                      |
|                   |                                                                                                            |
| **Buttons**       |                                                                                                            |
| Button Text       | Button URL                                                                                                 |
| Link here         | https://example.com/link1                                                                                  |
| Spotify           | https://open.spotify.com/artist/your-artist-id                                                             |

**Notes:**
- Row 1 headers are styled with green background (#d9ead3)
- Row 6 headers are styled with blue background (#c9daf8)
- Row 11 headers are styled with yellow background (#fff2cc)
- Add more button rows (13, 14, 15...) as needed

---

## Sheet Tab 2: "Blog"

This sheet manages your blog posts.

| Title        | Body                                                                                          | Year | Month | Date | Time  |
|--------------|-----------------------------------------------------------------------------------------------|------|-------|------|-------|
| First Post   | This is the body content of the first blog post. You can edit this from Google Sheets!        | 2026 | 01    | 11   | 12:00 |
| Second Post  | This is another blog post. Add more posts in the Google Sheet and they will appear here automatically! | 2026 | 01    | 10   | 15:30 |

**Notes:**
- Row 1 is the header row (styled with background #f3f3f3)
- Each row after the header is a blog post
- Posts appear in the order they're listed in the sheet
- Month and Date should be zero-padded (01, 02, etc.)
- Time format: HH:MM (24-hour format)

**To Add a New Post:**
1. Add a new row at the bottom (or insert between existing posts)
2. Fill in: Title, Body, Year, Month, Date, Time
3. Save - the website updates automatically!

**To Edit a Post:**
1. Find the post's row
2. Edit the content in any column
3. Save - updates appear on the website automatically!

**To Delete a Post:**
1. Select the entire row
2. Right-click → Delete row
3. Save - the post disappears from the website!

---

## Sheet Tab 3: "Music Players"

This sheet manages the album/CD icons that appear on your desktop.

| Artist          | Album Title                      | Display Name        | Icon   | Position Top | Position Right |
|-----------------|----------------------------------|---------------------|--------|--------------|----------------|
| Murdock Street  | Basement Candy - EP              | Basement-Candy.wav  | cd.png | 15%          | 90%            |
| Murdock Street  | Ode to You                       | Ode-to-You.wav      | cd.png | 75%          | 10%            |
| Lokadonna       | code:GRĖĖN (feat. Prod.eb) - EP  | code:GREEN.wav      | cd.png | 20%          | 20%            |
| tsunamë         | 99 Side A                        | 99 Side A.wav       | cd.png | 50%          | 50%            |

**Notes:**
- Row 1 is the header row (styled with background #f3f3f3)
- Each row creates one album icon on the website
- Albums by the same artist are automatically grouped together

**Column Definitions:**
- **Artist**: Artist name (used in the music player dropdown)
- **Album Title**: Full album name (exact match with Apple Music/iTunes API)
- **Display Name**: Text shown under the desktop icon
- **Icon**: Icon filename (usually "cd.png" from your icons folder)
- **Position Top**: Vertical position from top (e.g., "15%", "100px")
- **Position Right**: Horizontal position from right (e.g., "90%", "50px")

**Position Guidelines:**
- Use percentages for responsive positioning (e.g., "50%")
- Top: 0% = very top, 100% = very bottom
- Right: 0% = far right, 100% = far left
- Avoid overlapping icons by spacing them out

**To Add a New Album:**
1. Add a new row at the bottom
2. Fill in all columns
3. Make sure the **Album Title** matches exactly what's in Apple Music/iTunes
4. Choose a unique position (top/right) so it doesn't overlap other icons
5. Save - the new icon appears on the website!

**To Reposition an Album:**
1. Find the album's row
2. Change the **Position Top** and/or **Position Right** values
3. Save - the icon moves to the new position!

---

## Color Coding Reference

Use these background colors to match the template structure:

- **About Tab Headers**: 
  - Window 1: `#d9ead3` (light green)
  - Window 2: `#c9daf8` (light blue)
  - Buttons: `#fff2cc` (light yellow)

- **Blog Tab Headers**: `#f3f3f3` (light gray)

- **Music Players Tab Headers**: `#f3f3f3` (light gray)

---

## Data Flow

```
┌─────────────────┐
│  Google Sheets  │  ← You edit content here
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Apps Script    │  ← Automatically detects changes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub API     │  ← Pushes updates to repository
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ content.json    │  ← Static file in your repo
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Website      │  ← Loads content from JSON
└─────────────────┘
```

**Timeline:**
1. You edit the sheet and save (0 seconds)
2. Apps Script detects change and waits (5 seconds)
3. Script pushes to GitHub (5-10 seconds)
4. GitHub updates the file (instant)
5. Website cache refreshes (up to 5 minutes)
6. **Total time**: Changes appear in 2-3 minutes

---

## Tips & Best Practices

### Formatting Tips
- **Rich text doesn't transfer** - Only plain text is saved to JSON
- **Line breaks work** - Use Alt+Enter (Windows) or Cmd+Enter (Mac) in cells
- **Special characters work** - UTF-8 characters like ė, ë, etc. are supported
- **Links in text** - Include full URLs in the Body column (e.g., https://example.com)

### Content Guidelines
- **Blog posts**: Keep body content under 5000 characters for best performance
- **About message**: Keep under 500 characters for good display
- **Button text**: Keep under 20 characters so it fits in the button
- **Album titles**: Must match exactly with Apple Music for tracks to load

### Organization Tips
- **Sort blog posts** by date (newest first) for chronological display
- **Group albums** by artist for easier management
- **Use comments** in cells (Insert → Comment) to add notes without affecting the website
- **Freeze rows** (View → Freeze → 1 row) to keep headers visible while scrolling

### Backup Recommendation
- Regularly download a copy: **File → Download → Microsoft Excel (.xlsx)**
- GitHub automatically tracks all changes to content.json (version history)

---

## Testing Your Changes

### Before Going Live
1. Make changes in your sheet
2. Run `updateGitHubFile` manually (don't rely on auto-trigger yet)
3. Check the execution log for errors
4. Verify changes appear in GitHub: https://github.com/autumngreenbean/ebtheguy/blob/main/data/content.json
5. Test your website locally or on staging before pushing to production

### Quick Test Checklist
- [ ] About window displays correctly
- [ ] Contact info is correct
- [ ] Buttons link to the right URLs
- [ ] Blog posts appear in the menu
- [ ] Blog post content displays when clicked
- [ ] Album icons appear on desktop
- [ ] Music player loads tracks correctly

---

## Common Mistakes to Avoid

❌ **Don't** delete the header rows - they're required for the script to work  
✅ **Do** keep row 1 as headers in all sheets

❌ **Don't** leave blank rows between data rows - the script stops at the first blank row  
✅ **Do** keep all data rows consecutive (no gaps)

❌ **Don't** rename the sheet tabs - the script looks for exact names  
✅ **Do** keep tab names as: "About", "Blog", "Music Players"

❌ **Don't** use formulas in data cells - they may not export correctly  
✅ **Do** use plain text values

❌ **Don't** merge cells in data rows - it can break the data reading  
✅ **Do** keep cells unmerged (except the About biography section which is handled specially)

---

## Need Help?

Refer to the main **SETUP_GUIDE.md** for:
- Initial setup instructions
- Troubleshooting common issues
- Script configuration details
- GitHub token setup

For the code implementation, reference:
- **michaels-website** - Same architecture, different content structure
- **Code.gs** - Full Apps Script with inline comments
- **data-service.js** - Data fetching logic
