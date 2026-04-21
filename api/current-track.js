// api/current-track.js
import fetch from 'node-fetch';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || '';

function basicAuth() {
  return Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
}

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Missing Spotify client configuration');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

function normalizePlayback(data) {
  const item = data?.item;
  return {
    ok: true,
    isPlaying: !!data?.is_playing,
    track: item?.name || null,
    artist: item?.artists?.map(a => a.name).join(', ') || null,
    imageUrl: item?.album?.images?.[0]?.url || null,
    trackId: item?.id || null,
    progressMs:
      typeof data?.progress_ms === 'number' ? data.progress_ms : 0,
    durationMs:
      typeof item?.duration_ms === 'number' ? item.duration_ms : 0,
    updatedAt: new Date().toISOString(),
    source: 'vercel-api',
    stale: false
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const token = await getAccessToken();

    const spotifyRes = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (spotifyRes.status === 204) {
      // Nothing playing
      res.status(200).json({
        ok: true,
        isPlaying: false,
        track: null,
        artist: null,
        imageUrl: null,
        trackId: null,
        progressMs: 0,
        durationMs: 0,
        updatedAt: new Date().toISOString(),
        source: 'vercel-api',
        stale: false
      });
      return;
    }

    if (!spotifyRes.ok) {
      const text = await spotifyRes.text();
      throw new Error(
        `Spotify playback fetch failed ${spotifyRes.status}: ${text}`
      );
    }

    const data = await spotifyRes.json();
    const payload = normalizePlayback(data);

    res.status(200).json(payload);
  } catch (err) {
    console.error('[api/current-track]', err.message);
    res.status(500).json({
      ok: false,
      error: 'backend_error',
      message: err.message,
      stale: true,
      source: 'vercel-api'
    });
  }
}
