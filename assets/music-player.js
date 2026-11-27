(() => {
  'use strict';
  if (document.querySelector('.music-player')) return;

  const paths = {
    note: 'M6 2h8v10h-2V6H8v8H6v2H2v-4h4V2zm2 2v2h4V4H8z',
    play: 'M4 2h2v2h3v2h3v4H9v2H6v2H4V2z',
    pause: 'M3 2h4v12H3V2zm6 0h4v12H9V2z',
    stop: 'M3 3h10v10H3V3z',
    volume: 'M2 6h3l4-4v12l-4-4H2V6zm9-2h2v2h-2V4zm2 2h2v4h-2V6zm-2 4h2v2h-2v-2z',
    mute: 'M2 6h3l4-4v12l-4-4H2V6zm9-1h2v2h2v2h-2v2h-2V9h2V7h-2V5z',
    previous: 'M2 2h2v12H2V2zm10 0v12h-2v-2H7v-2H5V6h2V4h3V2h2z',
    next: 'M12 2h2v12h-2V2zM4 2h2v2h3v2h2v4H9v2H6v2H4V2z',
    minimize: 'M3 11h10v2H3v-2z'
  };
  const icon = name => `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" fill="currentColor"><path d="${paths[name]}"/></svg>`;
  const player = document.createElement('div');
  player.className = 'music-player';
  player.dataset.playing = 'false';
  player.innerHTML = `
    <button class="music-launcher" type="button" aria-expanded="false" aria-controls="music-window" aria-label="Open music player">
      ${icon('note')}<span class="music-launcher-name">MUSIC.EXE</span>
      <span class="music-launcher-state"><span class="music-light" aria-hidden="true"></span><span class="music-mini-status">OPEN</span></span>
    </button>
    <section class="music-window" id="music-window" aria-labelledby="music-title" tabindex="-1" hidden>
      <div class="music-titlebar">
        <h2 id="music-title">${icon('note')} MUSIC.EXE</h2>
        <button class="music-minimize" type="button" aria-label="Minimize music player" title="Minimize">${icon('minimize')}</button>
      </div>
      <div class="music-body">
        <div class="music-display">
          <div class="music-display-top">
            <span class="music-time" aria-hidden="true">00:00</span>
            <span class="music-spectrum" aria-hidden="true">${'<i></i>'.repeat(16)}</span>
          </div>
          <p class="music-track">NO TRACKS YET</p>
          <p class="music-track-detail">A LITTLE QUIET BETWEEN THE NOTES</p>
        </div>
        <div class="music-seek-row">
          <input class="music-range music-seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Playback position" aria-valuetext="No track loaded" disabled>
          <span class="music-duration" aria-hidden="true">--:--</span>
        </div>
        <div class="music-controls">
          <button class="music-button music-previous" type="button" aria-label="Previous track" title="Previous track" disabled>${icon('previous')}</button>
          <button class="music-button music-play" type="button" aria-label="Play" disabled>${icon('play')}<span>Play</span></button>
          <button class="music-button music-stop" type="button" aria-label="Stop and rewind" title="Stop" disabled>${icon('stop')}</button>
          <button class="music-button music-next" type="button" aria-label="Next track" title="Next track" disabled>${icon('next')}</button>
          <span class="music-track-count" aria-label="Playlist is empty">00 / 00</span>
        </div>
        <div class="music-volume-row">
          <button class="music-button music-mute" type="button" aria-label="Mute" aria-pressed="false" title="Mute">${icon('volume')}</button>
          <input class="music-range music-volume" type="range" min="0" max="100" value="35" aria-label="Volume">
          <span class="music-volume-value" aria-hidden="true">35%</span>
          <button class="music-button music-loop" type="button" aria-label="Repeat track" aria-pressed="false" title="Repeat track">LOOP</button>
        </div>
        <p class="music-status" role="status" aria-live="polite">The playlist is empty for now.</p>
      </div>
    </section>`;
  document.body.append(player);
  document.body.classList.add('has-music-player');

  const $ = selector => player.querySelector(selector);
  const launcher = $('.music-launcher');
  const panel = $('.music-window');
  const playButton = $('.music-play');
  const stopButton = $('.music-stop');
  const previousButton = $('.music-previous');
  const nextButton = $('.music-next');
  const seek = $('.music-seek');
  const volume = $('.music-volume');
  const muteButton = $('.music-mute');
  const status = $('.music-status');
  const audio = new Audio();
  audio.preload = 'metadata';
  const musicBase = new URL('music/', document.currentScript.src);
  let tracks = [];
  let trackIndex = -1;
  let playlistSignature = '';
  let pendingPlay = false;
  let fetching = false;
  let ready = false;
  let audioContext;
  let analyser;
  let bins;
  let frame;
  const bars = [...player.querySelectorAll('.music-spectrum i')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const time = seconds => {
    if (!Number.isFinite(seconds)) return '--:--';
    const total = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };
  const message = (text, error = false) => {
    status.textContent = text;
    status.dataset.error = String(error);
  };
  const updateTime = () => {
    $('.music-time').textContent = time(audio.currentTime);
    $('.music-duration').textContent = time(audio.duration);
    seek.disabled = !ready || !Number.isFinite(audio.duration) || audio.duration <= 0;
    seek.max = Number.isFinite(audio.duration) ? String(audio.duration) : '100';
    seek.value = String(audio.currentTime);
    seek.setAttribute('aria-valuetext', ready ? `${time(audio.currentTime)} of ${time(audio.duration)}` : 'No track loaded');
  };
  const draw = () => {
    cancelAnimationFrame(frame);
    if (!analyser || audio.paused || panel.hidden || reducedMotion.matches) {
      bars.forEach(bar => { bar.style.height = '2px'; });
      return;
    }
    analyser.getByteFrequencyData(bins);
    bars.forEach((bar, i) => { bar.style.height = `${Math.max(2, Math.round(bins[i * 2] / 255 * 26))}px`; });
    frame = requestAnimationFrame(draw);
  };
  const updatePlayback = () => {
    const playing = !audio.paused;
    player.dataset.playing = String(playing);
    playButton.innerHTML = `${icon(playing ? 'pause' : 'play')}<span>${playing ? 'Pause' : 'Play'}</span>`;
    playButton.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    $('.music-mini-status').textContent = playing ? 'PLAYING' : ready ? 'READY' : 'OPEN';
    draw();
  };
  const setOpen = open => {
    panel.hidden = !open;
    launcher.hidden = open;
    launcher.setAttribute('aria-expanded', String(open));
    (open ? (ready ? playButton : panel) : launcher).focus();
    draw();
    if (open) refreshPlaylist();
  };
  const updateVolume = () => {
    audio.volume = Number(volume.value) / 100;
    $('.music-volume-value').textContent = `${volume.value}%`;
    muteButton.innerHTML = icon(audio.muted || audio.volume === 0 ? 'mute' : 'volume');
    muteButton.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
    muteButton.setAttribute('title', audio.muted ? 'Unmute' : 'Mute');
    muteButton.setAttribute('aria-pressed', String(audio.muted));
    try { localStorage.setItem('homepage-music-volume', volume.value); } catch (_) { /* Storage is optional. */ }
  };
  try {
    const saved = localStorage.getItem('homepage-music-volume');
    if (saved !== null && Number.isFinite(Number(saved))) volume.value = String(Math.min(100, Math.max(0, Number(saved))));
  } catch (_) { /* Use the initial volume when storage is unavailable. */ }
  updateVolume();

  launcher.addEventListener('click', () => setOpen(true));
  $('.music-minimize').addEventListener('click', () => setOpen(false));
  player.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); setOpen(false); }
  });
  const startPlayback = async () => {
    if (!ready) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!audioContext && Context) {
        audioContext = new Context();
        const source = audioContext.createMediaElementSource(audio);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        bins = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      if (audioContext?.state === 'suspended') await audioContext.resume();
      if (audio.ended) audio.currentTime = 0;
      await audio.play();
    } catch (_) { message('Playback could not start. Press Play to try again.', true); }
  };
  const updateTrackCount = () => {
    const count = $('.music-track-count');
    count.textContent = `${String(trackIndex + 1).padStart(2, '0')} / ${String(tracks.length).padStart(2, '0')}`;
    count.setAttribute('aria-label', tracks.length ? `Track ${trackIndex + 1} of ${tracks.length}` : 'Playlist is empty');
    previousButton.disabled = nextButton.disabled = tracks.length < 2;
  };
  const loadTrack = (index, shouldPlay = false) => {
    ready = false;
    pendingPlay = shouldPlay;
    audio.pause();
    trackIndex = index;
    playButton.disabled = stopButton.disabled = true;
    audio.src = new URL(tracks[index].src, musicBase).href;
    audio.load();
    $('.music-track').textContent = tracks[index].title;
    $('.music-track').title = tracks[index].title;
    $('.music-track-detail').textContent = 'THE HOMEPAGE SOUNDTRACK';
    updateTrackCount();
    updateTime();
    updatePlayback();
    message('Loading track…');
  };
  const clearPlaylist = () => {
    ready = pendingPlay = false;
    trackIndex = -1;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    playButton.disabled = stopButton.disabled = true;
    $('.music-track').textContent = 'NO TRACKS YET';
    $('.music-track').removeAttribute('title');
    $('.music-track-detail').textContent = 'A LITTLE QUIET BETWEEN THE NOTES';
    updateTrackCount();
    updateTime();
    updatePlayback();
    message('The playlist is empty for now.');
  };
  async function refreshPlaylist() {
    if (fetching) return;
    fetching = true;
    try {
      const response = await fetch(new URL('playlist.json', musicBase), { cache: 'no-store' });
      if (!response.ok) throw new Error('Playlist unavailable');
      const data = await response.json();
      if (!Array.isArray(data.tracks)) throw new Error('Invalid playlist');
      const nextTracks = data.tracks.filter(track => {
        if (typeof track.src !== 'string' || typeof track.title !== 'string') return false;
        const url = new URL(track.src, musicBase);
        return url.origin === musicBase.origin && url.pathname.startsWith(musicBase.pathname)
          && /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(url.pathname);
      });
      const signature = JSON.stringify(nextTracks);
      if (signature === playlistSignature) return;
      const current = tracks[trackIndex]?.src;
      playlistSignature = signature;
      tracks = nextTracks;
      const sameTrack = tracks.findIndex(track => track.src === current);
      if (!tracks.length) clearPlaylist();
      else if (sameTrack >= 0) {
        trackIndex = sameTrack;
        $('.music-track').textContent = tracks[trackIndex].title;
        $('.music-track').title = tracks[trackIndex].title;
        updateTrackCount();
      } else loadTrack(0);
    } catch (_) {
      if (!tracks.length) message('The playlist is unavailable. Please try again later.', true);
    } finally { fetching = false; }
  }
  playButton.addEventListener('click', () => {
    if (audio.paused) startPlayback();
    else audio.pause();
  });
  previousButton.addEventListener('click', () => {
    if (tracks.length > 1) loadTrack((trackIndex - 1 + tracks.length) % tracks.length, !audio.paused);
  });
  nextButton.addEventListener('click', () => {
    if (tracks.length > 1) loadTrack((trackIndex + 1) % tracks.length, !audio.paused);
  });
  stopButton.addEventListener('click', () => {
    pendingPlay = false;
    audio.pause();
    audio.currentTime = 0;
    updateTime();
    message('Stopped · ready when you are.');
  });
  seek.addEventListener('input', () => {
    if (!seek.disabled) { audio.currentTime = Number(seek.value); updateTime(); }
  });
  volume.addEventListener('input', () => { audio.muted = false; updateVolume(); });
  muteButton.addEventListener('click', () => { audio.muted = !audio.muted; updateVolume(); });
  $('.music-loop').addEventListener('click', () => {
    audio.loop = !audio.loop;
    $('.music-loop').setAttribute('aria-pressed', String(audio.loop));
  });
  audio.addEventListener('loadedmetadata', () => {
    ready = true;
    playButton.disabled = stopButton.disabled = false;
    updateTime();
    updatePlayback();
    message('Ready · press Play to listen.');
    if (pendingPlay) { pendingPlay = false; startPlayback(); }
  });
  audio.addEventListener('play', () => { updatePlayback(); message('Playing · enjoy your stay.'); });
  audio.addEventListener('pause', () => { updatePlayback(); if (ready) message('Paused · press Play to continue.'); });
  audio.addEventListener('ended', () => {
    if (trackIndex + 1 < tracks.length) loadTrack(trackIndex + 1, true);
    else { updatePlayback(); message('Finished · play it again?'); }
  });
  audio.addEventListener('timeupdate', updateTime);
  audio.addEventListener('durationchange', updateTime);
  audio.addEventListener('error', () => {
    ready = pendingPlay = false;
    playButton.disabled = stopButton.disabled = seek.disabled = true;
    updatePlayback();
    message('This track could not be played. Try another track.', true);
  });
  reducedMotion.addEventListener('change', draw);
  window.addEventListener('pagehide', () => { audio.pause(); cancelAnimationFrame(frame); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshPlaylist(); });
  refreshPlaylist();
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
    setInterval(() => { if (!document.hidden) refreshPlaylist(); }, 3000);
  }
})();
