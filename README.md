# SpixelfyProd_v1

SpixelfyProd_v1 is a shared-session Spotify visualizer that turns the currently playing album art into a live pixel composition in the browser.

Live demo: https://spixelfy.vercel.app/SpixelfyProd_v1.html

---

## What it does

- Connects to a single Spotify account and exposes playback via a lightweight API.
- Renders the current album cover as a square or circular pixel grid on an HTML canvas.
- Animates subtle “twinkle” and track-change events so changes feel perceptible, not just data updates.
- Provides a clean, fullscreen visual layer suitable for a monitor/TV or shared room screen. [cite:603]

---

## Controls

On the visualizer page:

- `F` – toggle fullscreen.
- `C` – cycle pixel modes (square / circle, different grid sizes).
- `T` – toggle track text.
- `P` – toggle cover twinkle.
- `H` – toggle help overlay.
- Click the logo – open https://gaf.nyc.
- Click the pixels or mode label – cycle pixel modes. [cite:603]

---

## How it works

- **Frontend**: `SpixelfyProd_v1.html`  
  - Draws pixels on a full-window `<canvas>`.  
  - Polls a backend endpoint for the “currently playing” track and album art URL.  
  - Caches frames, handles idle state, and animates transitions. [cite:603]

- **Backend**: `api/current-track.js` (Vercel Serverless Function)  
  - Uses Spotify’s Web API to fetch the current playback for one authorized account.  
  - Exchanges a long‑lived refresh token for short‑lived access tokens on demand.  
  - Normalizes the response into `{ track, artist, imageUrl, trackId, isPlaying, progressMs, durationMs, updatedAt }`. [web:732][web:741]

The frontend and backend are deployed together on Vercel; the HTML calls `/api/current-track` on the same origin.

---

## Local development

1. Clone the repo:

   ```bash
   git clone https://github.com/TheGaf/Spixelfy.git
   cd Spixelfy
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a Spotify app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and obtain:

   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN` (see below). [web:741][web:740]

4. Set environment variables (for local dev you can use a `.env` or export them):

   ```bash
   export SPOTIFY_CLIENT_ID="your_client_id"
   export SPOTIFY_CLIENT_SECRET="your_client_secret"
   export SPOTIFY_REFRESH_TOKEN="your_refresh_token"
   ```

5. Run Vercel dev (or any Node dev server that respects the `api/` folder):

   ```bash
   npx vercel dev
   ```

6. Open the visualizer:

   ```text
   http://localhost:3000/SpixelfyProd_v1.html
   ```

---

## Getting a Spotify refresh token

You can generate a refresh token using the standard Authorization Code flow for Spotify’s Web API:

1. Register a redirect URI in your Spotify app, e.g.:

   ```text
   http://localhost:8787/auth/callback
   ```

2. Run a simple auth helper (or use your existing local Node server) to complete the OAuth flow once and log the refresh token.  
3. Copy the refresh token into `SPOTIFY_REFRESH_TOKEN` for local and Vercel environments. [web:732][web:741]

For this v1, the deployed Vercel backend uses a single long‑lived refresh token tied to one Spotify account.

---

## Deployment

This project is configured for Vercel:

- **Static files**: `SpixelfyProd_v1.html` (and any assets) are served as static content.
- **API**: `api/current-track.js` is deployed as a serverless function at `/api/current-track`.

To deploy:

1. Push to GitHub.
2. Create a new Vercel project pointing at the repo (preset: “Other”).
3. Add environment variables in Vercel:

   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`

4. Deploy. Your visualizer will be available at:

   ```text
   https://<project-name>.vercel.app/SpixelfyProd_v1.html
   ```

You can optionally rename `SpixelfyProd_v1.html` to `index.html` so the root URL works directly.

---

## Notes

- This v1 uses one shared Spotify session; everyone sees the same track and visual state.
- No data is stored in the browser; playback state lives in Spotify and the backend response.
- Idle mode is intentionally ambient; when nothing is playing, the grid animates a soft green pattern until playback resumes. [cite:603]
