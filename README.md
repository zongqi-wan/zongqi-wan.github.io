# Zongqi Wan — academic homepage

A millennium-inspired personal website with blue-and-silver browser chrome, pixel icons, and a responsive directory sidebar.

A static website for [zongqiwan.com](https://zongqiwan.com/), hosted by GitHub Pages.

## Files

- `index.html`: profile, recent news, and expandable news archive.
- `research.html`: all publications by year, followed by preprints.
- `teaching.html`: courses by semester and previous teaching assistant experience.
- `collaborators.html`: research collaborators.
- `blog.html` and `blog/*.html`: generated blog index and articles. The former Resources URL redirects here.
- `_blog/`: Markdown article sources and the shared blog template.
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

Update publications in `research.html` and, where applicable, news in `index.html`. The navigation and footer are shared across the main pages and the blog template.

External web links use `target="_blank" rel="noopener noreferrer"` to open in a new tab and keep the homepage and its music playing. Keep these attributes on new external links. Internal navigation, section anchors, and email links retain their native behavior.

## Local preview

From this directory, run:

```sh
python3 scripts/preview.py
```

Open <http://127.0.0.1:8765/>. Add audio directly to `assets/music/`; the local player discovers changes within a few seconds. The player starts collapsed and never autoplays on page load. Playback, seeking, volume, muting, repeat, and previous/next track controls use native browser audio. Minimizing or following links between the five site pages keeps playback running, including browser Back/Forward and links to research sections. The track, position, volume, repeat setting, and player window remain unchanged. URLs, page titles, metadata, and navigation highlighting update with the content; history navigation restores scroll position. A full browser refresh, opening another tab, or leaving the site creates a new document and does not resume playback automatically. Volume is remembered locally.

The music player and continuous navigation use JavaScript. Each HTML page remains directly accessible, and the website remains usable without JavaScript or external font services. Failed page fetches fall back to ordinary navigation (which interrupts playback). See `assets/music/README.md` for file formats and playlist maintenance.

## Writing a blog post

Create a Markdown file such as `_blog/my-first-post.md`. Use a lowercase filename with hyphens between words. The filename becomes the article URL.

```markdown
+++
title = "A sum of integers"
date = 2026-11-27
summary = "A short optional description."
+++

Let $S_n$ be the sum of the first $n$ positive integers.

$$
S_n = \sum_{k=1}^{n} k = \frac{n(n+1)}{2}.
$$
```

Put inline formulas between single dollar signs and display formulas between double dollar signs. Posts are listed newest first by `date`. To set the language of a Chinese post, add `lang = "zh-CN"` to its header.

Run `python3 scripts/build_blog.py` with Python 3.11 or newer and Pandoc installed. The script generates the blog index and each article, with formulas already rendered as MathML. Preview at <http://127.0.0.1:8765/blog.html>. Commit the Markdown and generated HTML together when publishing.

## Hosting

The repository remains compatible with the existing GitHub Pages setup. `CNAME` preserves the custom domain `zongqiwan.com`. Changes become public through the repository's existing publishing process after they are pushed.

To update the music on GitHub Pages, add or remove audio files in `assets/music/`, then run `python3 scripts/music_library.py` and publish the audio changes with the updated `assets/music/playlist.json`. GitHub Pages reads this static playlist.

## Design notes

The visual style recalls personal websites around the millennium. All navigation, mail links, paper links, and the news archive use native HTML; no JavaScript or third-party font dependency is required. Decorative browser chrome is not presented as interactive controls. Collaborators remain in a single column at all viewport sizes.
