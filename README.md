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
- `files/portrait-2026.jpg`: current profile photograph, cropped and adjusted for the homepage. The previous `files/Open Day2.png` remains available.
- `files/`: existing photographs and paper downloads.
- `legacy/jemdoc/`: archived sources and styles from the previous site; these are not part of the current build.

The root HTML files are the source of truth. Update publications in `research.html` and, where applicable, news in `index.html`. The navigation and footer are shared visually across all five HTML pages; keep them consistent when editing.

## Local preview

From this directory, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/>. The website works without JavaScript or external font services.

## Hosting

The repository remains compatible with the existing GitHub Pages setup. `CNAME` preserves the custom domain `zongqiwan.com`. Changes become public through the repository's existing publishing process after they are pushed.

## Design notes

The visual style recalls personal websites around the millennium. All navigation, mail links, paper links, and the news archive use native HTML; no JavaScript or third-party font dependency is required. Decorative browser chrome is not presented as interactive controls. Collaborators remain in a single column at all viewport sizes.
