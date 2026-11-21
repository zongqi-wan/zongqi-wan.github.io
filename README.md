# Zongqi Wan — academic homepage

A millennium-inspired personal website with blue-and-silver browser chrome, pixel icons, and a responsive directory sidebar.

A static website for [zongqiwan.com](https://zongqiwan.com/), hosted by GitHub Pages. No build step or package installation is required.

## Files

- `index.html`: profile, recent news, and expandable news archive.
- `research.html`: all publications by year, followed by preprints.
- `teaching.html`: courses by semester and previous teaching assistant experience.
- `collaborators.html`: research collaborators.
- `links.html`: research resources, linked from the directory and footer.
- `assets/site.css`: shared retro theme, responsive layout, typography, and print styles.
- `assets/icons.svg` and `assets/mobius.svg`: local vector icons and the wireframe Möbius strip in the masthead.
- `assets/gbu-logo.png`: original university logo beside the homepage profile, with outer transparent margins trimmed.
- `assets/music-player.js` and `assets/music-player.css`: the collapsible retro music player.
- `assets/navigation.js`: updates internal pages without reloading the document, preserving music playback.
- `assets/music/`: owner-managed audio files and the playlist. Visitors have no upload control.
- `scripts/preview.py`: local preview with automatic music-folder discovery.
- `scripts/music_library.py`: updates the playlist served by GitHub Pages.
- `files/portrait-2026.jpg`: current profile photograph, cropped and adjusted for the homepage. The previous `files/Open Day2.png` remains available.
- `files/`: existing photographs and paper downloads.
- `legacy/jemdoc/`: archived sources and styles from the previous site; these are not part of the current build.

The root HTML files are the source of truth. Update publications in `research.html` and, where applicable, news in `index.html`. The navigation and footer are shared visually across all five HTML pages; keep them consistent when editing.

External web links use `target="_blank" rel="noopener noreferrer"` to open in a new tab and keep the homepage and its music playing. Keep these attributes on new external links. Internal navigation, section anchors, and email links retain their native behavior.

## Local preview

From this directory, run:

```sh
python3 scripts/preview.py
```

Open <http://127.0.0.1:8765/>. Add audio directly to `assets/music/`; the local player discovers changes within a few seconds. The player starts collapsed and never autoplays on page load. Playback, seeking, volume, muting, repeat, and previous/next track controls use native browser audio. Minimizing or following links between the five site pages keeps playback running, including browser Back/Forward and links to research sections. The track, position, volume, repeat setting, and player window remain unchanged. URLs, page titles, metadata, and navigation highlighting update with the content; history navigation restores scroll position. A full browser refresh, opening another tab, or leaving the site creates a new document and does not resume playback automatically. Volume is remembered locally.

The music player and continuous navigation use JavaScript. Each HTML page remains directly accessible, and the website remains usable without JavaScript or external font services. Failed page fetches fall back to ordinary navigation (which interrupts playback). See `assets/music/README.md` for file formats and playlist maintenance.

## Hosting

The repository remains compatible with the existing GitHub Pages setup. `CNAME` preserves the custom domain `zongqiwan.com`. Changes become public through the repository's existing publishing process after they are pushed.

To update the music on GitHub Pages, add or remove audio files in `assets/music/`, then run `python3 scripts/music_library.py` and publish the audio changes with the updated `assets/music/playlist.json`. GitHub Pages reads this static playlist.

## Design notes

The visual style recalls personal websites around the millennium. All navigation, mail links, paper links, and the news archive use native HTML; no JavaScript or third-party font dependency is required. Decorative browser chrome is not presented as interactive controls. Collaborators remain in a single column at all viewport sizes.
