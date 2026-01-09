# YouTube Videos Configuration

This project supports two modes for managing the homepage video grid:

1. **Manual Mode (Default)**: Videos are curated manually in a config file
2. **Auto Mode**: Videos are automatically fetched from YouTube API

## Manual Mode (Recommended)

The default mode uses a config file for manual video curation. No API key needed!

### Configuration File

Edit `config/youtube-videos.json` to add, remove, or reorder videos:

```json
{
  "mode": "manual",
  "manualVideos": [
    {
      "id": "eGmSdMjI8UE",
      "title": "$100M YouTube Exit"
    },
    {
      "id": "sdRd5LbnTt0",
      "title": "YouTube Channels Are Getting Deleted Overnight"
    }
  ]
}
```

**To add a video:**
1. Get the video ID from the YouTube URL (e.g., `youtube.com/watch?v=VIDEO_ID`)
2. Add a new entry to the `manualVideos` array
3. Run `npm run build:youtube` to update the homepage

**To reorder videos:**
- Simply reorder the entries in the `manualVideos` array

**To remove a video:**
- Remove the entry from the `manualVideos` array

## Auto Mode (Optional)

For automatic fetching, you'll need a YouTube Data API v3 key.

### Enabling Auto Mode

1. Set `"mode": "auto"` in `config/youtube-videos.json`
2. Configure `autoConfig` settings
3. Set up API key (see below)

Example config:
```json
{
  "mode": "auto",
  "autoConfig": {
    "enabled": true,
    "order": "date",
    "maxVideos": 6,
    "dateFilter": {
      "enabled": false,
      "years": 1
    }
  }
}
```

### Getting Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the "YouTube Data API v3":
   - Navigate to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

## Security (Recommended)

Restrict your API key for better security:
1. Click on your API key in the Credentials page
2. Under "API restrictions", select "Restrict key"
3. Choose "YouTube Data API v3"
4. Under "Application restrictions", you can restrict by:
   - HTTP referrers (for web apps)
   - IP addresses (for server-side)
   - Or leave unrestricted for build-time usage

## Setting Up Environment Variables

### Local Development

Create a `.env` file in the project root:

```bash
YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_VIDEO_ORDER=date  # Options: 'date' (latest), 'viewCount' (most popular), 'rating' (highest rated)
```

### Netlify Deployment

1. Go to your Netlify site dashboard
2. Navigate to "Site settings" > "Environment variables"
3. Add:
   - Key: `YOUTUBE_API_KEY`
   - Value: Your API key
   - (Optional) Key: `YOUTUBE_VIDEO_ORDER` (defaults to 'date' if not set)

## Video Sort Options

- `date` - Latest videos (default)
- `viewCount` - Most popular videos (by view count)
- `rating` - Highest rated videos

Set via `YOUTUBE_VIDEO_ORDER` environment variable.

## Usage

The script runs automatically during `npm run build`. It will:
1. Fetch videos from your YouTube channel
2. Generate HTML for the video grid
3. Update `index.html` with the latest videos

If the API key is not set, the script will skip the update and use existing hardcoded videos.

## API Quota

- Free tier: 10,000 units per day
- Search request: 100 units
- Each build: 1 search request = 100 units
- Even 100 builds/day = 10,000 units (at the limit, but unlikely)

The quota resets daily at midnight Pacific Time.

