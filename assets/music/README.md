# Music folder

Place your audio files directly in this folder. Supported extensions: MP3, WAV, OGG, M4A, AAC, FLAC, OPUS and WEBM (playback support depends on the visitor's browser).

There is no visitor upload or file-picker feature. The website only plays files maintained by its owner here. Nothing plays automatically on page load.

For local preview, run `python3 scripts/preview.py` from the repository root. The player automatically notices added or removed songs within a few seconds. Titles come from filenames, with the extension removed. Rearrange the entries in `playlist.json` to set the playing order. Newly discovered songs are appended in filename order.

To update the live playlist, run `python3 scripts/music_library.py` and publish `playlist.json` along with the audio changes. GitHub Pages uses that file to find the tracks.

Following links between the five site pages keeps the same player running, including browser Back/Forward and section links. The track, playback position, volume, repeat setting, and open/minimized state are preserved. Minimizing also keeps music playing. Refreshing the browser, opening a new tab, or leaving the site starts a new document and does not automatically resume playback. If an internal page cannot be fetched, navigation falls back to a normal page load and interrupts playback.
