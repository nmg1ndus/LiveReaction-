# LiveReaction 🔥

A real-time meme collection and sharing platform for **Nondescript MG** live streams. Users can submit meme links during the live window (6:30 PM - 8:30 PM) and view them instantly on a shared board.

## Overview

LiveReaction is a lightweight web application that displays user-submitted meme links during specific time windows. It integrates with Google Forms for submissions and Google Sheets for data storage, creating a seamless live engagement experience.

### Key Features

- **Live Status Tracking** - Real-time indicator showing when the broadcast is live
- **YouTube Thumbnails** - Automatic thumbnail preview for YouTube links
- **Content Safety** - Blocklist for inappropriate content
- **Easy Submissions** - Embedded Google Form for meme submissions
- **Auto-Refresh** - Live list updates every 10 seconds during broadcast window
- **Responsive Design** - Works seamlessly on all devices

## Project Structure

```
LiveReaction-/
├── index.html         # Main page displaying meme list
├── index.js          # Logic for loading and filtering memes
├── submit.html       # Submission page with embedded form
├── submit.js         # Submission page logic
├── style.css         # Shared styles for all pages
├── qr.html           # QR code page (for stream overlay)
└── README.md         # This file
```

## How It Works

### Data Flow

1. **Submissions** → Users fill Google Form on `submit.html`
2. **Storage** → Responses saved to Google Sheet
3. **Display** → `index.js` fetches CSV export and displays memes
4. **Filtering** → Only memes within the live window (6:30 PM - 8:30 PM) are shown

### Pages

#### `index.html` - Meme Viewer
- Displays all memes submitted during the current live window
- Shows live/offline status badge
- Lists memes in reverse chronological order (newest first)
- YouTube links show thumbnail previews
- Tracks clicked memes to avoid duplicates

#### `submit.html` - Meme Submission
- Embedded Google Form for easy link submission
- Only accessible during live window (6:30 PM - 8:30 PM)
- Users provide: meme link + email address (optional)
- Automatically syncs with Google Sheet

#### `qr.html` - QR Code Page
- Display during live streams for easy access
- Viewers can scan to submit memes or view the list

## Technical Details

### CSV Source
The application reads from a published Google Sheet CSV export:
```
https://docs.google.com/spreadsheets/d/.../pub?output=csv
```

### Time Window
- **Live Hours**: 6:30 PM to 8:30 PM
- **Timezone**: Local system time
- **Auto-Check**: Every 30 seconds for state changes

### Safety Features

**Blocked Keywords/Domains:**
- Adult content domains (porn, xvideos, onlyfans, etc.)
- Known phishing/malware links
- Suspicious shortened URLs
- NSFW content indicators

### Data Parsing

- CSV parsing handles quoted fields with commas
- Email masking for privacy (shows first 2 chars only)
- URL validation (HTTP/HTTPS only)
- Timestamp validation (today's date required)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nmg1ndus/LiveReaction-.git
   cd LiveReaction-
   ```

2. **Set up Google Form & Sheet**
   - Create a Google Form with fields: "Meme Link" and "Email"
   - Collect responses in a Google Sheet
   - Publish sheet as CSV

3. **Update CSV URL**
   - Replace `CSV_URL` in `index.js` and `submit.html` with your published sheet URL

4. **Update Form Embed**
   - Replace iframe `src` in `submit.html` with your Google Form embed URL

5. **Deploy**
   - Push to GitHub and enable GitHub Pages
   - Or deploy to any static hosting (Netlify, Vercel, etc.)

## Configuration

### Environment Variables
Currently hardcoded in the JavaScript files:

```javascript
// CSV export link
const CSV_URL = "https://docs.google.com/spreadsheets/d/.../pub?output=csv";

// Live window (in minutes from midnight)
const WINDOW_START = 18 * 60 + 30;  // 6:30 PM
const WINDOW_END   = 20 * 60 + 30;  // 8:30 PM
```

### Safety Blocklist
Edit `BLOCKED_PATTERNS` array in `index.js` to customize blocked content.

## Browser Compatibility

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Responsive styling with CSS variables
- **JavaScript (Vanilla)** - No dependencies
- **Google Forms & Sheets** - Data backend
- **localStorage** - Client-side click tracking

## Performance

- **Data Refresh**: 10 seconds during live window
- **State Check**: 30 seconds
- **CSV Caching**: Cache-busting with timestamp parameter
- **Bundle Size**: ~11 KB (all files combined)

## Future Enhancements

- [ ] Admin dashboard to moderate submissions
- [ ] Dislike/report functionality
- [ ] Category filters for memes
- [ ] Reaction counts/voting system
- [ ] Backend API instead of Google Sheets
- [ ] Discord bot integration for notifications
- [ ] Multi-language support

## License

This project is created for **Nondescript MG** community engagement.

## Support

For issues or feature requests, please [open an issue](https://github.com/nmg1ndus/LiveReaction-/issues) on GitHub.

---

**Made with ❤️ for Nondescript MG**
