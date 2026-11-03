#!/usr/bin/env node
/**
 * Build the Apple Music "Replay" data used by the portfolio.
 *
 * Apple's public Music API needs a paid developer program, but a public
 * playlist page ships its whole track list as JSON in the HTML, so we can
 * read the same thing for free.
 *
 * The Replay playlist is ordered by play count (most played first), so the
 * track order doubles as a play-frequency signal: we count how many tracks
 * each artist has and weight that by how early those tracks appear.
 *
 * Usage: node scripts/fetch-apple-music.mjs [playlist-url]
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PLAYLIST_URL =
  process.argv[2] ??
  "https://music.apple.com/id/playlist/replay-2026/pl.rp-DbXXh1zAN0VV";

const TOP_ARTISTS = 8;
const TOP_TRACKS = 6;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "src/data/apple-music.json");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

/** Turn an Apple artwork template into a concrete square image URL. */
function artwork(template, size = 200) {
  if (!template) return null;
  return template
    .replace("{w}", String(size))
    .replace("{h}", String(size))
    .replace("{f}", "jpg");
}

/** Apple packs "Album | Subtitle" into one link title; keep the album name. */
function albumName(title) {
  if (!title) return null;
  return title.split(" | ")[0].trim();
}

function readSerializedData(html) {
  const match = html.match(
    /<script type="application\/json" id="serialized-server-data">([\s\S]*?)<\/script>/,
  );
  if (!match) {
    throw new Error(
      "Could not find serialized-server-data. Apple may have changed the page.",
    );
  }
  return JSON.parse(match[1]);
}

function sectionsOf(payload) {
  return payload?.data?.[0]?.data?.sections ?? [];
}

function findTrackSection(sections) {
  const section = sections.find(
    (s) => s.itemKind === "trackLockup" || /^track-list\b/.test(s.id ?? ""),
  );
  if (!section) throw new Error("Could not find the playlist track list.");
  return section;
}

function parseTrack(item, position) {
  const artists = (item.subtitleLinks ?? [])
    .map((link) => ({
      name: link.title,
      url: link.segue?.destination?.contentDescriptor?.url ?? null,
    }))
    .filter((a) => Boolean(a.name));

  return {
    position,
    title: item.title,
    album: albumName(item.tertiaryLinks?.[0]?.title),
    artists,
    artworkTemplate: item.artwork?.dictionary?.url ?? null,
    url: item.contentDescriptor?.url ?? null,
    durationMs: item.duration ?? null,
  };
}

function rankArtists(tracks, artistPhoto) {
  const stats = new Map();

  for (const track of tracks) {
    // A collab counts once per artist, not once per artist slot.
    const seen = new Set();
    for (const artist of track.artists) {
      if (seen.has(artist.name)) continue;
      seen.add(artist.name);

      const entry = stats.get(artist.name) ?? {
        name: artist.name,
        url: artist.url,
        tracks: 0,
        score: 0,
        bestPosition: Infinity,
        bestTrack: null,
      };

      entry.tracks += 1;
      // Earlier in the playlist == played more often.
      entry.score += 102 - track.position;
      if (track.position < entry.bestPosition) {
        entry.bestPosition = track.position;
        entry.bestTrack = { title: track.title, album: track.album };
      }
      if (!entry.url && artist.url) entry.url = artist.url;

      stats.set(artist.name, entry);
    }
  }

  return [...stats.values()]
    .sort(
      (a, b) =>
        b.tracks - a.tracks ||
        b.score - a.score ||
        a.bestPosition - b.bestPosition,
    )
    .slice(0, TOP_ARTISTS)
    .map((entry) => {
      const photo = artistPhoto.get(entry.name);
      const fallbackTemplate = tracks.find(
        (t) => t.position === entry.bestPosition,
      )?.artworkTemplate;
      return {
        name: entry.name,
        url: entry.url,
        tracks: entry.tracks,
        bestPosition: entry.bestPosition,
        image: artwork(photo, 320) ?? artwork(fallbackTemplate, 320),
        topTrack: entry.bestTrack,
      };
    });
}

function collectArtistPhotos(sections) {
  const photos = new Map();
  for (const section of sections) {
    if (section.itemKind !== "bubbleLockup") continue;
    for (const item of section.items ?? []) {
      const template = item.artwork?.dictionary?.url;
      if (item.title && template) photos.set(item.title, template);
    }
  }
  return photos;
}

async function main() {
  const response = await fetch(PLAYLIST_URL, {
    headers: { "user-agent": UA, accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(`Playlist request failed: ${response.status}`);
  }

  const html = await response.text();
  const sections = sectionsOf(readSerializedData(html));
  const trackSection = findTrackSection(sections);
  const tracks = (trackSection.items ?? []).map((item, index) =>
    parseTrack(item, index + 1),
  );

  const photos = collectArtistPhotos(sections);
  const embedUrl = PLAYLIST_URL.replace(
    "music.apple.com",
    "embed.music.apple.com",
  );

  const payload = {
    generatedAt: new Date().toISOString(),
    playlist: {
      title: "Replay 2026",
      url: PLAYLIST_URL,
      embedUrl,
      trackCount: tracks.length,
    },
    topArtists: rankArtists(tracks, photos),
    topTracks: tracks.slice(0, TOP_TRACKS).map((track) => ({
      title: track.title,
      artist: track.artists[0]?.name ?? null,
      album: track.album,
      artwork: artwork(track.artworkTemplate, 300),
      url: track.url,
    })),
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(
    `Saved ${payload.topArtists.length} artists and ${payload.topTracks.length} tracks ` +
      `from ${tracks.length} playlist entries -> ${OUT}`,
  );
  for (const artist of payload.topArtists) {
    console.log(`  ${String(artist.tracks).padStart(2)} tracks  ${artist.name}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
