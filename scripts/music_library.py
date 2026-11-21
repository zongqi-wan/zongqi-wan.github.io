"""Discover owner-managed audio files for the static site and local preview."""

import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
MUSIC_DIR = ROOT / 'assets' / 'music'
PLAYLIST_FILE = MUSIC_DIR / 'playlist.json'
AUDIO_EXTENSIONS = {'.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.opus', '.webm'}


def playlist():
    tracks = [
        {'src': quote(path.name), 'title': path.stem.replace('_', ' ')}
        for path in sorted(MUSIC_DIR.iterdir(), key=lambda p: p.name.casefold())
        if path.is_file() and not path.is_symlink()
        and not path.name.startswith('.') and path.suffix.lower() in AUDIO_EXTENSIONS
    ]
    try:
        saved = json.loads(PLAYLIST_FILE.read_text(encoding='utf-8'))
        order = {track['src']: index for index, track in enumerate(saved['tracks'])}
    except (OSError, ValueError, KeyError, TypeError):
        order = {}
    # Stable sorting leaves newly discovered tracks in filename order.
    tracks.sort(key=lambda track: order.get(track['src'], float('inf')))
    return {'tracks': tracks}


if __name__ == '__main__':
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    result = playlist()
    PLAYLIST_FILE.write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    print(f'Updated playlist: {len(result["tracks"])} track(s).')
