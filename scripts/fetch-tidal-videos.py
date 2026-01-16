#!/usr/bin/env python3
"""
Fetch music videos from Tidal for artists in your library.
Requires: pip install tidalapi

First run will open browser for OAuth login.
Session is saved to .pool/.tidal-session.json for reuse.
"""

import json
import os
from pathlib import Path
from datetime import datetime

try:
    import tidalapi
except ImportError:
    print("Please install tidalapi: pip install tidalapi")
    exit(1)

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
POOL_DIR = PROJECT_DIR / ".pool"
SESSION_FILE = POOL_DIR / ".tidal-session.json"
MUSIC_FILE = PROJECT_DIR / "music.json"
OUTPUT_FILE = POOL_DIR / "tidal-videos.json"


def save_session(session: tidalapi.Session):
    """Save OAuth session for reuse."""
    data = {
        "token_type": session.token_type,
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "expiry_time": session.expiry_time.isoformat() if session.expiry_time else None,
    }
    SESSION_FILE.write_text(json.dumps(data, indent=2))
    print(f"Session saved to {SESSION_FILE}")


def load_session(session: tidalapi.Session) -> bool:
    """Load saved session if available."""
    if not SESSION_FILE.exists():
        return False

    try:
        data = json.loads(SESSION_FILE.read_text())
        expiry = datetime.fromisoformat(data["expiry_time"]) if data.get("expiry_time") else None

        session.load_oauth_session(
            token_type=data["token_type"],
            access_token=data["access_token"],
            refresh_token=data.get("refresh_token"),
            expiry_time=expiry,
        )

        if session.check_login():
            print("Loaded existing session")
            return True
    except Exception as e:
        print(f"Failed to load session: {e}")

    return False


def login(session: tidalapi.Session):
    """Login via OAuth device code flow."""
    import webbrowser

    login_info, future = session.login_oauth()
    url = f"https://link.tidal.com/{login_info.user_code}"

    print(f"\n{'='*50}")
    print(f"Opening browser for Tidal login...")
    print(f"URL: {url}")
    print(f"{'='*50}\n")

    webbrowser.open(url)

    print(f"Waiting for login (expires in {login_info.expires_in} seconds)...")

    future.result()  # Wait for login to complete

    if session.check_login():
        save_session(session)
        print("Login successful!")
    else:
        print("Login failed")
        exit(1)


def get_favorited_tracks(music_data: dict) -> list:
    """Extract all favorited tracks from music.json releases."""
    tracks = []

    for release in music_data.get("releases", []):
        artist_name = release.get("artist", "Unknown")
        for track in release.get("favorited_tracks", []):
            tracks.append({
                "title": track.get("title"),
                "artist": artist_name,
                "track_id": track.get("track_id"),
            })

    return tracks


def get_unique_artists(music_data: dict) -> dict:
    """Extract unique artists from music.json releases."""
    artists = {}

    for release in music_data.get("releases", []):
        artist_name = release.get("artist")
        if artist_name and artist_name not in artists:
            artists[artist_name] = None

    return artists


def search_video_for_track(session: tidalapi.Session, title: str, artist: str) -> list:
    """Search for a video matching a track."""
    try:
        # Search for videos with track title + artist
        query = f"{title} {artist}"
        results = session.search(query, models=[tidalapi.media.Video], limit=5)
        videos = results.get("videos", [])

        # Filter for videos that match the artist
        matching = []
        for video in videos:
            video_artist = video.artist.name.lower() if video.artist else ""
            if artist.lower() in video_artist or video_artist in artist.lower():
                matching.append(video)

        return matching if matching else videos[:1]  # Return first result as fallback
    except Exception as e:
        return []


def fetch_artist_videos(session: tidalapi.Session, artist_name: str) -> list:
    """Fetch all videos for an artist by name."""
    try:
        # Search for artist
        results = session.search(artist_name, models=[tidalapi.Artist], limit=5)
        artists = results.get("artists", [])

        if not artists:
            return []

        # Find best match
        artist = None
        for a in artists:
            if a.name.lower() == artist_name.lower():
                artist = a
                break
        if not artist:
            artist = artists[0]

        # Get their videos
        return artist.get_videos(limit=30)
    except Exception as e:
        return []


def video_to_dict(video: tidalapi.media.Video) -> dict:
    """Convert Video object to serializable dict."""
    # Try to get image URL, fallback to None
    image_url = None
    if hasattr(video, 'image'):
        try:
            image_url = video.image(640)  # Use valid resolution
        except (ValueError, Exception):
            try:
                image_url = video.image(320)
            except (ValueError, Exception):
                pass

    return {
        "id": f"tidal-video-{video.id}",
        "video_id": video.id,
        "type": "tidal-video",
        "title": video.name or video.title,
        "artist": video.artist.name if video.artist else "Unknown",
        "artist_id": video.artist.id if video.artist else None,
        "duration": video.duration,
        "tidalUrl": f"https://tidal.com/browse/video/{video.id}",
        "imageUrl": image_url,
        "explicit": video.explicit,
        "popularity": video.popularity,
        "source": "Tidal Video",
    }


def main():
    print("Tidal Music Video Fetcher\n")

    # Ensure pool directory exists
    POOL_DIR.mkdir(exist_ok=True)

    # Load music library
    if not MUSIC_FILE.exists():
        print(f"music.json not found at {MUSIC_FILE}")
        exit(1)

    music_data = json.loads(MUSIC_FILE.read_text())
    tracks = get_favorited_tracks(music_data)
    artists = get_unique_artists(music_data)
    print(f"Found {len(tracks)} favorited tracks from {len(artists)} artists\n")

    # Setup session
    session = tidalapi.Session()

    if not load_session(session):
        login(session)

    all_videos = []
    seen_ids = set()

    # Phase 1: Search for videos matching each favorited track
    print("=== Phase 1: Searching for videos matching favorited tracks ===\n")
    track_matches = 0
    for i, track in enumerate(tracks, 1):
        title = track["title"]
        artist = track["artist"]
        print(f"[{i}/{len(tracks)}] {artist} - {title}...", end=" ", flush=True)

        videos = search_video_for_track(session, title, artist)
        new_count = 0

        for video in videos:
            if video.id not in seen_ids:
                seen_ids.add(video.id)
                all_videos.append(video_to_dict(video))
                new_count += 1

        if new_count > 0:
            print(f"found {new_count}")
            track_matches += 1
        else:
            print("no match")

    print(f"\nFound videos for {track_matches}/{len(tracks)} tracks\n")

    # Phase 2: Fetch all videos from each artist
    print("=== Phase 2: Fetching all videos from artists ===\n")
    for i, artist_name in enumerate(artists.keys(), 1):
        print(f"[{i}/{len(artists)}] {artist_name}...")

        videos = fetch_artist_videos(session, artist_name)
        new_count = 0

        for video in videos:
            if video.id not in seen_ids:
                seen_ids.add(video.id)
                all_videos.append(video_to_dict(video))
                new_count += 1

        print(f"  Found {len(videos)} videos ({new_count} new)")

    # Save results
    output_data = {
        "generated_at": datetime.now().isoformat(),
        "track_count": len(tracks),
        "artist_count": len(artists),
        "video_count": len(all_videos),
        "videos": all_videos,
    }

    OUTPUT_FILE.write_text(json.dumps(output_data, indent=2))
    print(f"\nSaved {len(all_videos)} videos to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
