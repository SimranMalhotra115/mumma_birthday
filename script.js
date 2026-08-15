const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* =====================================================
   RADIO MAA FM — FINAL JS
   - station-specific real MP3 audi
   - corrected 1987 / 2005 / 2006 / 2008 / 2026 story
   - memory popup audio
   - fixed timeline 3D tilt selector
   - cinematic final surprise
===================================================== */

const stations = [
  ['87.0', '1987', '“एक कहानी शुरू हुई…”', 'शुरुआत', '1987'],
  ['92.5', '2005', '“एक नया अध्याय…”', 'शादी / नया घर', '2005'],
  ['96.5', '2006', '“फिर मैं आई…”', 'मेरी कहानी', '2006'],
  ['100.1', '2008', '“घर पूरा हुआ…”', 'छोटा भाई', '2008'],
  ['103.9', '2026', '“दूरी बस रास्तों में है…”', 'आज की बेटी', '2026'],
  ['108.0', 'FOREVER', '“माँ का प्यार कभी off-air नहीं”', 'Final Broadcast', 'forever']
];

const stationStories = {

  '1987': `
    16 अगस्त 1987...
    एक छोटी सी बच्ची इस दुनिया में आई।
    उस दिन किसी को क्या पता था कि एक दिन
    यही बच्ची किसी की सबसे प्यारी माँ बनेगी।
  `,

  '2005': `
    2005 में आपकी जिंदगी ने एक नया मोड़ लिया।
    एक रिश्ता जुड़ा, एक नया घर बना,
    और आपकी जिंदगी में एक खूबसूरत नया अध्याय शुरू हुआ।
  `,

  '2006': `
    2006 में आपकी जिंदगी में मैं आई।
    शायद उस वक्त मुझे कुछ समझ नहीं था...
    लेकिन आज समझती हूँ कि मेरी सबसे सुरक्षित जगह
    हमेशा आपकी बाहों में रही।
  `,

  '2008': `
    2008 में छोटा भाई आया।
    अब आपकी दुनिया में हम दोनों थे।
    दो अलग-अलग बच्चे, दो अलग-अलग शरारतें...
    लेकिन माँ एक ही।
  `,

  '2026': `
    आज हम दोनों बड़े हो गए हैं।
    रास्ते अलग हैं, दूरियाँ भी हैं...
    लेकिन माँ से दूर होकर ही समझ आया
    कि घर आखिर होता क्या है।
  `,

  'forever': `
    साल बदलेंगे, हम बड़े होते जाएंगे,
    जिंदगी हमें अलग-अलग रास्तों पर ले जाएगी...
    लेकिन आपके बच्चे होने की उम्र
    हमारी कभी खत्म नहीं होगी।
    माँ का प्यार कभी off-air नहीं होता।
  `
};

const stationAudio = {
  '1987': 'audio/1987.mp3',
  '2005': 'audio/2005.mp3',
  '2006': 'audio/2006.mp3',
  '2008': 'audio/2008.mp3',
  '2026': 'audio/2026.mp3',
  'forever': 'audio/forever.mp3'
};

let current = 0;
let playing = false;
let stationPlayer = null;
let currentMemoryAudio = null;


/* =====================================================
   PAGE LOAD
===================================================== */

window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = $('#loader');
    if (loader) loader.style.opacity = '0';
  }, 700);

  setTimeout(() => {
    const loader = $('#loader');
    if (loader) loader.remove();
  }, 1500);

  makePetals();
  makeWave();
  makeMemories();
  makeStations();
  tune(0);
  initReveal();
  initTimelineTilt();
  initTimelineParticles();
      initTimelineArchive();
});


/* =====================================================
   STATIONS
===================================================== */

function makeStations() {
  const box = $('#stations');
  if (!box) return;

  box.innerHTML = '';

  stations.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'station' + (i === 0 ? ' active' : '');

    el.innerHTML = `
      <span class="f">${s[0]}</span>
      <div>
        <b>${s[1]}</b>
        <small>${s[2]}</small>
      </div>
      <span>↗</span>
    `;

    el.onclick = () => tune(i);
    box.appendChild(el);
  });
}
function tune(i) {
  current = i;
  const s = stations[i];

  if ($('#freq')) $('#freq').textContent = s[0];
  if ($('#station')) $('#station').textContent = s[1];
  if ($('#track')) $('#track').textContent = s[2];

  const dial = $('#dialKnob');
  if (dial) dial.style.transform = `rotate(${i * 52 - 20}deg)`;

  $$('.station').forEach((x, j) => {
    x.classList.toggle('active', j === i);
  });

  /* Show the story/transcript for the selected station */
  const story = stationStories[s[4]];

  if (story) {
    showLiveStory(story);
  }

  /* Stop old station audio whenever frequency changes. */
  stopStationAudio();

  /* If radio was already playing, continue with the newly tuned station. */
  if (playing) {
    playCurrentStation();
  }

  if (i === stations.length - 1) burst(110);
}

function showLiveStory(text) {

  let liveText = $('#liveText');

  if (!liveText) {

    liveText = document.createElement('div');
    liveText.id = 'liveText';

    const wave = $('#wave');

    if (wave) {
      wave.insertAdjacentElement('afterend', liveText);
    } else {
      const playButton = $('#play');

      if (playButton) {
        playButton.insertAdjacentElement('afterend', liveText);
      } else {
        document.body.appendChild(liveText);
      }
    }
  }

  liveText.innerHTML = `
    <div class="live-story-label">
      🎙️ NOW PLAYING
    </div>

    <div class="live-story-text" id="liveStoryText"></div>

    <div class="live-story-hint">
      आवाज़ के साथ-साथ पढ़ते जाइए ❤️
    </div>
  `;

  liveText.classList.remove('story-change');

  void liveText.offsetWidth;

  liveText.classList.add('story-change');
}

function startTranscriptAudio(text, audio) {

  const textBox = $('#liveStoryText');

  if (!textBox) return;

  /*
    Text को words में divide करेंगे.
    इससे पूरा paragraph एक साथ नहीं आएगा.
  */

  const words = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ');

  textBox.innerHTML = '';

  const spans = words.map(word => {

    const span = document.createElement('span');

    span.textContent = word + ' ';

    span.style.opacity = '0';

    span.style.display = 'inline';

    span.style.transition =
      'opacity .18s ease, transform .18s ease';

    span.style.transform =
      'translateY(4px)';

    textBox.appendChild(span);

    return span;
  });


  function updateTranscript() {

    if (!audio.duration || !isFinite(audio.duration)) {
      return;
    }

    const progress =
      audio.currentTime / audio.duration;

    const visibleWords =
      Math.floor(progress * words.length);

    spans.forEach((span, index) => {

      if (index < visibleWords) {

        span.style.opacity = '1';

        span.style.transform =
          'translateY(0)';

      } else {

        span.style.opacity = '0';

        span.style.transform =
          'translateY(4px)';
      }

    });
  }


  audio.addEventListener(
    'timeupdate',
    updateTranscript
  );

  audio.addEventListener(
    'loadedmetadata',
    updateTranscript
  );

  audio.addEventListener(
    'ended',
    () => {

      spans.forEach(span => {

        span.style.opacity = '1';

        span.style.transform =
          'translateY(0)';
      });

    }
  );

  /*
    Store the listener so it can be cleaned
    when another station is selected.
  */

  audio._transcriptUpdate =
    updateTranscript;
}


function next(d = 1) {
  tune((current + d + stations.length) % stations.length);
}


/* =====================================================
   RADIO PLAY / PAUSE
===================================================== */

function playCurrentStation() {
  const key = stations[current][4];
  const src = stationAudio[key];

  if (!src) return;

   if (bgMusic && !bgMusic.paused) {
    bgMusic.pause();

    if (soundBtn) {
      soundBtn.innerHTML = '🔊 <span>Music</span>';
    }
  }


  stopStationAudio();
  
  stationPlayer = new Audio(src);

  stationPlayer = new Audio(src);
  stationPlayer.playbackRate = 0.95;
  stationPlayer.volume = 1;
  stationPlayer.preload = 'auto';
  const story = stationStories[key];

if (story) {
  startTranscriptAudio(story, stationPlayer);
}

  stationPlayer.onplay = () => {
    playing = true;
    if ($('#play')) $('#play').textContent = '❚❚';

    if ($('#track')) {
      $('#track').textContent = stations[current][2];
    }
  };

  stationPlayer.onended = () => {
    playing = false;
    if ($('#play')) $('#play').textContent = '▶';
  };

  stationPlayer.onerror = () => {
    playing = false;
    if ($('#play')) $('#play').textContent = '▶';
    console.warn('Station audio could not be loaded:', src);
  };

  stationPlayer.play().catch(err => {
    playing = false;
    if ($('#play')) $('#play').textContent = '▶';
    console.warn('Station audio play blocked:', err);
  });
}

function stopStationAudio() {
  if (stationPlayer) {
    stationPlayer.pause();
    stationPlayer.currentTime = 0;
    stationPlayer = null;
  }
}

const prev = $('#prev');
const nextBtn = $('#next');
const playBtn = $('#play');

if (prev) prev.onclick = () => next(-1);
if (nextBtn) nextBtn.onclick = () => next(1);

if (playBtn) {
  playBtn.onclick = () => {
    if (playing) {
      stopStationAudio();
      playing = false;
      playBtn.textContent = '▶';
      return;
    }

    playCurrentStation();
  };
}


/* =====================================================
   BACKGROUND MUSIC BUTTON
   This is separate from Radio Maa's spoken stations.
===================================================== */
const soundBtn = $('#soundBtn');
const bgMusic = $('#bgMusic');

if (soundBtn && bgMusic) {

  // Background song settings
  bgMusic.volume = 0.16;
  bgMusic.playbackRate = 1;
  bgMusic.loop = true;

  soundBtn.onclick = () => {

    if (!bgMusic.paused) {

      // PAUSE background music
      bgMusic.pause();

      soundBtn.innerHTML = '🔊 <span>Music</span>';

    } else {

      // PLAY background music
      bgMusic.play().then(() => {

        soundBtn.innerHTML = '🔊 <span>Playing</span>';

      }).catch(err => {

        console.warn('Background music could not play:', err);

      });

    }

  };
}

/* =====================================================
   AUTO START BACKGROUND MUSIC AFTER FIRST USER INTERACTION
===================================================== */

let bgMusicStarted = false;

function startBackgroundMusic() {
  if (!bgMusic || bgMusicStarted) return;

  bgMusic.volume = 0.06;
  bgMusic.playbackRate = 1;
  bgMusic.loop = true;

  bgMusic.play()
    .then(() => {
      bgMusicStarted = true;

      if (soundBtn) {
        soundBtn.innerHTML = '🔊 <span>Playing</span>';
      }
    })
    .catch(err => {
      console.log('Background music waiting for interaction:', err);
    });
}

/* First click anywhere on the website */
document.addEventListener('click', startBackgroundMusic, {
  once: true
});


/* =====================================================
   SCROLL BUTTONS
===================================================== */

$$('[data-scroll]').forEach(b => {
  b.onclick = () => {
    const target = $(b.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };
});


/* =====================================================
   SCROLL REVEAL
===================================================== */

function initReveal() {
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('show');
    });
  }, { threshold: .12 });

  $$('.reveal').forEach(x => io.observe(x));
}


/* =====================================================
   WAVEFORM
===================================================== */

function makeWave() {
  const wave = $('#wave');
  if (!wave) return;

  wave.innerHTML = '';

  for (let i = 0; i < 34; i++) {
    const x = document.createElement('i');
    x.style.animationDelay = (i * .03) + 's';
    wave.appendChild(x);
  }
}


/* =====================================================
   FLOATING PETALS
===================================================== */

function makePetals() {
  const container = $('#petals');
  if (!container) return;

  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = ['✦', '❀', '♥', '·'][Math.floor(Math.random() * 4)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--x', (Math.random() * 240 - 120) + 'px');
      p.style.animationDuration = (6 + Math.random() * 7) + 's';
      p.style.fontSize = (8 + Math.random() * 13) + 'px';
      container.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }, i * 350);
  }
}


/* =====================================================
   PHOTO MEMORIES
===================================================== */

function makeMemories() {
  const box = $('#memoryWall');
  if (!box) return;

  box.innerHTML = '';

  for (let i = 1; i <= 8; i++) {
    const d = document.createElement('div');
    d.className = 'memory';

    d.innerHTML = `
      <img
        src="photos/mumma${i}.jpg"
        onload="this.parentElement.classList.add('has-image')"
        onerror="this.style.display='none'"
      >
      <small>MEMORY ${String(i).padStart(2, '0')}</small>
    `;

    box.appendChild(d);
  }
}


/* =====================================================
   LETTER
===================================================== */

const letter = `माँ,

शायद मैं आपको रोज़ नहीं बता पाती कि आप मेरे लिए कितनी important हैं। लेकिन सच ये है कि मेरी जिंदगी की बहुत-सी अच्छी चीज़ों के पीछे कहीं न कहीं आपका प्यार, आपकी मेहनत और आपकी दुआ है।

आपने मुझे सिर्फ बड़ा नहीं किया — आपने मुझे अपने पैरों पर खड़ा होना, गिरकर फिर उठना और मुश्किल समय में मुस्कुराना सिखाया।

आज आपके birthday पर मेरी बस एक wish है: आपकी जिंदगी में उतनी ही खुशियाँ हों, जितनी आपने मेरी जिंदगी में भरी हैं।

दूरी चाहे कितनी भी हो… मैं हमेशा आपकी बेटी रहूँगी।

Happy Birthday Mumma. ❤️`;

let typed = false;

const openLetter = $('#openLetter');
const envelope = $('#envelope');

if (openLetter) {
  openLetter.onclick = e => {
    if (e) e.stopPropagation();

    if (envelope) envelope.classList.add('open');

    if (!typed) {
      typed = true;
      const typedLetter = $('#typedLetter');
      if (typedLetter) typeText(typedLetter, letter, 18);
    }
  };
}

if (envelope) {
  envelope.onclick = () => {
    if (openLetter) openLetter.click();
  };
}

function typeText(el, text, speed) {
  let i = 0;

  function go() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(go, text[i - 1] === '\n' ? 150 : speed);
    }
  }

  go();
}


/* =====================================================
   TIMELINE 3D TILT
   FIX: actual HTML uses .time-card, not .timeline-card
===================================================== */

function initTimelineParticles() {
  const timeline = $('#timeline');
  if (!timeline) return;

  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (5 + Math.random() * 90) + '%';
    p.style.animationDuration = (11 + Math.random() * 9) + 's';
    p.style.animationDelay = (-Math.random() * 10) + 's';
    timeline.appendChild(p);
  }
}

/* =====================================================
   TIMELINE — YEAR NAVIGATION
   1987 / 2005 / 2006 / 2008
===================================================== */

const timelineMemories = [
  {
    year: '1987',
    freq: '87.0',
    label: 'MEMORY 01',
    title: 'एक शुरुआत…',
    text: '16 अगस्त 1987... एक छोटी-सी बच्ची इस दुनिया में आई। उस दिन किसी को क्या पता था कि यही बच्ची एक दिन किसी की सबसे प्यारी माँ बनेगी।',
    date: '16 AUGUST · 1987'
  },
  {
    year: '2005',
    freq: '92.5',
    label: 'MEMORY 02',
    title: 'एक नया अध्याय…',
    text: '2005 में आपकी जिंदगी ने एक नया मोड़ लिया। एक रिश्ता जुड़ा, एक नया घर बना और आपकी जिंदगी में एक खूबसूरत नया अध्याय शुरू हुआ।',
    date: '2005 · A NEW CHAPTER'
  },
  {
    year: '2006',
    freq: '96.5',
    label: 'MEMORY 03',
    title: 'फिर मैं आई…',
    text: '2006 में आपकी जिंदगी में मैं आई। शायद उस वक्त मुझे कुछ समझ नहीं था... लेकिन आज समझती हूँ कि मेरी सबसे सुरक्षित जगह हमेशा आपकी बाहों में रही।',
    date: '2006 · YOUR DAUGHTER'
  },
  {
    year: '2008',
    freq: '100.1',
    label: 'MEMORY 04',
    title: 'घर पूरा हुआ…',
    text: '2008 में छोटा भाई आया। अब आपकी दुनिया में हम दोनों थे। दो अलग-अलग बच्चे, दो अलग-अलग शरारतें... लेकिन माँ एक ही।',
    date: '2008 · HOME COMPLETE'
  }
];

let timelineIndex = 0;

function initTimelineArchive() {

  const timeline = document.querySelector('#timeline');

  if (!timeline) return;

  const cards = timeline.querySelectorAll('.time-card');

  if (!cards.length) return;

  /*
     Existing HTML cards ko clickable banate hain
  */

  cards.forEach((card, index) => {

    card.style.cursor = 'pointer';

    card.addEventListener('click', () => {
      setTimelineMemory(index);
    });

  });

  /*
     Existing arrow buttons
  */

  const buttons = timeline.querySelectorAll('button');

  buttons.forEach(button => {

    const text = button.textContent.trim();

    if (text === '←') {
      button.addEventListener('click', (e) => {
        e.stopPropagation();

        setTimelineMemory(
          (timelineIndex - 1 + timelineMemories.length)
          % timelineMemories.length
        );
      });
    }

    if (text === '→') {
      button.addEventListener('click', (e) => {
        e.stopPropagation();

        setTimelineMemory(
          (timelineIndex + 1)
          % timelineMemories.length
        );
      });
    }

  });

  setTimelineMemory(0);
}


function setTimelineMemory(index) {

  if (!timelineMemories[index]) return;

  timelineIndex = index;

  const item = timelineMemories[index];

  const timeline = document.querySelector('#timeline');

  if (!timeline) return;

  const cards = timeline.querySelectorAll('.time-card');

  /*
     Active card
  */

  cards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });


  /*
     Update visible memory content
  */

  const title = timeline.querySelector('.memory-frequency-copy h3')
    || timeline.querySelector('.story-text h3')
    || timeline.querySelector('.memory-title');

  const text = timeline.querySelector('.memory-frequency-copy p')
    || timeline.querySelector('.story-text p')
    || timeline.querySelector('.memory-description');

  const year = timeline.querySelector('.frequency-core span')
    || timeline.querySelector('.memory-year');

  const freq = timeline.querySelector('.frequency-core strong')
    || timeline.querySelector('.memory-frequency strong');

  const label = timeline.querySelector('.memory-index');

  const date = timeline.querySelector('.memory-frequency-copy small')
    || timeline.querySelector('.memory-date');


  if (title) {
    title.classList.remove('memory-switch');

    void title.offsetWidth;

    title.textContent = item.title;

    title.classList.add('memory-switch');
  }


  if (text) {
    text.classList.remove('memory-switch');

    void text.offsetWidth;

    text.textContent = item.text;

    text.classList.add('memory-switch');
  }


  if (year) {
    year.textContent = item.year;
  }


  if (freq) {
    freq.textContent = item.freq;
  }


  if (label) {
    label.textContent = item.label;
  }


  if (date) {
    date.textContent = item.date;
  }

}


/* =====================================================
   MEMORY DATA
===================================================== */

const memoryData = {
  '1987': {
    title: '16 अगस्त 1987',
    text: '16 अगस्त 1987... एक छोटी सी बच्ची इस दुनिया में आई थी। उस दिन किसी को क्या पता था कि यही बच्ची एक दिन किसी की सबसे प्यारी माँ बनेगी।'
  },

  '2005': {
    title: '2005 — एक नया अध्याय',
    text: '2005 में आपकी जिंदगी ने एक नया मोड़ लिया। एक रिश्ता जुड़ा, एक नया घर बना और आपकी जिंदगी में एक खूबसूरत नया अध्याय शुरू हुआ।'
  },

  '2006': {
    title: '2006 — फिर मैं आई',
    text: '2006 में आपकी जिंदगी में मैं आई। शायद उस वक्त मुझे कुछ समझ नहीं था... लेकिन आज समझती हूँ कि मेरी सबसे सुरक्षित जगह हमेशा आपकी बाहों में रही।'
  },

  '2008': {
    title: '2008 — घर पूरा हुआ',
    text: '2008 में छोटा भाई आया। अब आपकी दुनिया में हम दोनों थे। दो अलग-अलग बच्चे, दो अलग-अलग शरारतें... लेकिन माँ एक ही।'
  },

  '2026': {
    title: '2026 — आज',
    text: 'आज हम दोनों बड़े हो गए हैं। रास्ते अलग हैं, दूरियाँ भी हैं... लेकिन सच ये है कि माँ से दूर होकर ही समझ आया कि घर आखिर होता क्या है।'
  },

  'forever': {
    title: '∞ — हमेशा',
    text: 'साल बदलेंगे, हम बड़े होते जाएंगे, जिंदगी हमें अलग-अलग रास्तों पर ले जाएगी... लेकिन आपके बच्चे होने की उम्र हमारी कभी खत्म नहीं होगी।'
  }
};


/* =====================================================
   MEMORY POPUP
===================================================== */

function openMemory(year) {
  const memory = memoryData[year];
  if (!memory) return;

  stopMemoryAudio();

  document.querySelectorAll('.memory-popup').forEach(p => p.remove());

  const popup = document.createElement('div');
  popup.className = 'memory-popup';

  popup.innerHTML = `
    <div class="memory-overlay"></div>

    <div class="memory-box">
      <button class="memory-close" type="button" aria-label="Close">×</button>

      <div class="memory-radio">
        <span></span>
        RADIO MAA FM
      </div>

      <div class="memory-frequency">
        <small>MEMORY BROADCAST</small>
        <strong>${memory.title}</strong>
      </div>

      <div class="memory-line"></div>

      <p>${memory.text}</p>

      <button class="listen-memory" type="button">
        🎙️ &nbsp; सुनें
      </button>

      <span class="voice-status">
        आपकी कहानी... आवाज़ में सुनें
      </span>
    </div>
  `;

  document.body.appendChild(popup);

  const close = () => {
    stopMemoryAudio();
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 350);
  };

  popup.querySelector('.memory-close').addEventListener('click', close);
  popup.querySelector('.memory-overlay').addEventListener('click', close);

  const button = popup.querySelector('.listen-memory');
  const status = popup.querySelector('.voice-status');

  button.addEventListener('click', () => {
    playMemoryAudio(year, button, status);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => popup.classList.add('show'));
  });
}


/* =====================================================
   MEMORY AUDIO — REAL MP3
===================================================== */

function playMemoryAudio(year, button, status) {
  const src = stationAudio[year];

  if (!src) {
    status.textContent = 'Audio file नहीं मिला।';
    return;
  }

  /* Clicking while playing = pause */
  if (currentMemoryAudio && !currentMemoryAudio.paused) {
    currentMemoryAudio.pause();
    button.classList.remove('playing');
    button.innerHTML = '🎙️ &nbsp; फिर से सुनें';
    status.textContent = 'फिर से सुनने के लिए दबाएँ';
    return;
  }

  stopMemoryAudio();

  currentMemoryAudio = new Audio(src);
  currentMemoryAudio.playbackRate = 0.85;
currentMemoryAudio.volume = 1;
  currentMemoryAudio.preload = 'auto';

  button.classList.add('playing');
  button.innerHTML = '⏸️ &nbsp; रोकें';
  status.textContent = '🎙️ Radio Maa पर आपकी कहानी चल रही है…';

  currentMemoryAudio.onended = () => {
    button.classList.remove('playing');
    button.innerHTML = '🎙️ &nbsp; फिर से सुनें';
    status.textContent = '❤️ कहानी पूरी हुई';
    currentMemoryAudio = null;
  };

  currentMemoryAudio.onerror = () => {
    button.classList.remove('playing');
    button.innerHTML = '🎙️ &nbsp; फिर से सुनें';
    status.textContent = 'Audio नहीं मिला — audio folder check करें।';
    currentMemoryAudio = null;
  };

  currentMemoryAudio.play().catch(err => {
    console.error('Memory audio error:', err);
    button.classList.remove('playing');
    button.innerHTML = '🎙️ &nbsp; फिर से सुनें';
    status.textContent = 'Audio play नहीं हो पाया।';
  });
}

function stopMemoryAudio() {
  if (currentMemoryAudio) {
    currentMemoryAudio.pause();
    currentMemoryAudio.currentTime = 0;
    currentMemoryAudio = null;
  }
}


/* =====================================================
   FINAL CINEMATIC SURPRISE
===================================================== */

/* =====================================================
   FINAL STORY — ONE BY ONE
===================================================== */
/* =====================================================
   FINAL — INCOMING CALL FLOW
   3 → 2 → 1 → STORY → INCOMING CALL → VOICE MESSAGE
===================================================== */

/* =====================================================
   FINAL CALL FLOW
   3 → 2 → 1 → INCOMING CALL → VOICE MESSAGE → ENDED
===================================================== */

const celebrate = $('#celebrate');
const callScreen = $('#callScreen');
const acceptCall = $('#acceptCall');
const declineCall = $('#declineCall');
const voiceMessage = $('#voiceMessage');
const voiceClose = $('#voiceClose');
const callEnded = $('#callEnded');

const voiceTime = $('#voiceTime');
const voiceCaption = $('#voiceCaption');
const voiceTranscript = $('#voiceTranscript');

let finalCallAudio = null;
let finalCallTimer = null;
let finalCallStarted = false;


/* -----------------------------------------------------
   INITIAL STATE
----------------------------------------------------- */

if (callScreen) callScreen.style.display = 'none';
if (voiceMessage) voiceMessage.style.display = 'none';
if (callEnded) callEnded.style.display = 'none';


/* -----------------------------------------------------
   START FINAL SURPRISE
----------------------------------------------------- */

if (celebrate) {

  celebrate.onclick = () => {

    if (finalCallStarted) return;

    finalCallStarted = true;

    burst(180);

    stopStationAudio();

    if (typeof stopMemoryAudio === 'function') {
      stopMemoryAudio();
    }

    celebrate.style.display = 'none';

    const note = document.querySelector('.call-note');
    if (note) note.style.display = 'none';

    startFinalCountdown();

  };

}


/* -----------------------------------------------------
   3 → 2 → 1
----------------------------------------------------- */

function startFinalCountdown() {

  const intro = document.querySelector('.call-intro');

  if (!intro) {
    showIncomingCall();
    return;
  }

  const original = intro.innerHTML;

  intro.innerHTML = `
    <div class="final-countdown" id="finalCountdown">
      <span>3</span>
    </div>
  `;

  const counter = document.querySelector('#finalCountdown span');

  let number = 3;

  const timer = setInterval(() => {

    number--;

    if (number <= 0) {

      clearInterval(timer);

      intro.innerHTML = `
        <div class="call-transition">
          <span>RADIO MAA FM</span>
          <strong>ONE LAST CALL</strong>
        </div>
      `;

      setTimeout(() => {
        showIncomingCall();
      }, 900);

      return;
    }

    counter.textContent = number;

    counter.animate(
      [
        {
          transform: 'scale(1.5)',
          opacity: 0
        },
        {
          transform: 'scale(1)',
          opacity: 1
        }
      ],
      {
        duration: 500,
        easing: 'ease-out'
      }
    );

  }, 900);

}


/* -----------------------------------------------------
   INCOMING CALL
----------------------------------------------------- */

function showIncomingCall() {

  if (!callScreen) return;

  callScreen.style.display = 'flex';

  callScreen.classList.remove('show');

  requestAnimationFrame(() => {
    callScreen.classList.add('show');
  });

  if (callEnded) {
    callEnded.style.display = 'none';
  }

  if (voiceMessage) {
    voiceMessage.style.display = 'none';
  }

  /* Ringing effect */
  callScreen.classList.add('ringing');

}


/* -----------------------------------------------------
   ACCEPT CALL
----------------------------------------------------- */

if (acceptCall) {

  acceptCall.onclick = () => {

    if (callScreen) {

      callScreen.classList.remove('ringing');

      callScreen.style.display = 'none';

    }

    startVoiceMessage();

  };

}


/* -----------------------------------------------------
   DECLINE CALL
----------------------------------------------------- */

if (declineCall) {

  declineCall.onclick = () => {

    if (callScreen) {
      callScreen.style.display = 'none';
    }

    showCallEnded();

  };

}


/* -----------------------------------------------------
   VOICE MESSAGE
----------------------------------------------------- */

function startVoiceMessage() {

  if (!voiceMessage) return;

  voiceMessage.style.display = 'block';

  voiceMessage.classList.remove('show');

  requestAnimationFrame(() => {
    voiceMessage.classList.add('show');
  });


  if (voiceCaption) {
    voiceCaption.textContent = 'माँ... पहले ये सुनो।';
  }
if (voiceTranscript) {

  voiceTranscript.innerHTML = `
    माँ...

    <br><br>

    पता है, दूर रहकर सबसे ज़्यादा क्या समझ आता है?

    <br>

    कि घर सिर्फ़ एक जगह नहीं होता...

    <br>

    घर वो होता है जहाँ माँ होती है। ❤️

    <br><br>

    मैं शायद हर दिन ये नहीं कह पाती,

    <br>

    लेकिन मेरी दुनिया में आपकी जगह हमेशा सबसे ऊपर रहेगी।

    <br><br>

    <strong>
      Happy Birthday, Mumma. ❤️
    </strong>
  `;

}


  /* Start final audio */

  if (finalCallAudio) {

    try {
      finalCallAudio.pause();
      finalCallAudio.currentTime = 0;
    } catch (e) {}

  }


  finalCallAudio = new Audio('audio/forever.mp3');

  finalCallAudio.volume = 1;
  finalCallAudio.playbackRate = 0.85;


  /* Timer */

  let seconds = 0;

  if (finalCallTimer) {
    clearInterval(finalCallTimer);
  }

  if (voiceTime) {
    voiceTime.textContent = '00:00';
  }


  finalCallTimer = setInterval(() => {

    seconds++;

    const min = String(
      Math.floor(seconds / 60)
    ).padStart(2, '0');

    const sec = String(
      seconds % 60
    ).padStart(2, '0');

    if (voiceTime) {
      voiceTime.textContent = `${min}:${sec}`;
    }

  }, 1000);


  finalCallAudio.play().catch(err => {

    console.warn(
      'Final voice message could not play:',
      err
    );

  });


  /* When audio finishes */

  finalCallAudio.onended = () => {

    if (finalCallTimer) {
      clearInterval(finalCallTimer);
      finalCallTimer = null;
    }

    if (voiceTime) {
      voiceTime.textContent = '00:00';
    }

    showCallEnded();

  };

}


/* -----------------------------------------------------
   CALL ENDED
----------------------------------------------------- */

function showCallEnded() {

  if (finalCallTimer) {
    clearInterval(finalCallTimer);
    finalCallTimer = null;
  }


  if (finalCallAudio) {

    try {
      finalCallAudio.pause();
      finalCallAudio.currentTime = 0;
    } catch (e) {}

    finalCallAudio = null;

  }


  if (callScreen) {
    callScreen.style.display = 'none';
  }


  if (voiceMessage) {

    voiceMessage.classList.remove('show');

    setTimeout(() => {
      voiceMessage.style.display = 'none';
    }, 400);

  }


  if (!callEnded) return;


  callEnded.style.display = 'block';

  callEnded.classList.remove('show');

  requestAnimationFrame(() => {

    callEnded.classList.add('show');

    burst(180);

  });

}
/* =====================================================
   STORY → INCOMING CALL
===================================================== */

function playFinalCallStory(lines, story, incoming) {

  let index = 0;

  function nextLine() {

    if (index >= lines.length) {

      setTimeout(() => {

        story.classList.remove('show');

        setTimeout(() => {

          incoming.classList.add('show');

        }, 500);

      }, 900);

      return;
    }

    story.textContent = lines[index++];

    story.classList.remove('show');

    requestAnimationFrame(() => {

      story.classList.add('show');

    });

    setTimeout(nextLine, 2100);

  }

  nextLine();

}


/* =====================================================
   VOICE MESSAGE
===================================================== */

function playFinalVoice(voiceBox) {

  stopMemoryAudio();

  const status = document.querySelector('#finalVoiceStatus');
  const time = document.querySelector('#finalVoiceTime');
  const wave = document.querySelector('#finalVoiceWave');

  currentMemoryAudio =
    new Audio('audio/forever.mp3');

  currentMemoryAudio.preload = 'auto';
  currentMemoryAudio.volume = 1;
  currentMemoryAudio.playbackRate = 0.85;

  wave.classList.add('playing');

  status.textContent =
    '🎙️ आपकी बेटी की आवाज़...';

  currentMemoryAudio.ontimeupdate = () => {

    if (!currentMemoryAudio) return;

    const seconds =
      Math.floor(currentMemoryAudio.currentTime);

    const min =
      String(Math.floor(seconds / 60)).padStart(2, '0');

    const sec =
      String(seconds % 60).padStart(2, '0');

    time.textContent =
      `${min}:${sec}`;

  };


  currentMemoryAudio.onended = () => {

    wave.classList.remove('playing');

    status.textContent =
      '❤️ Message पूरा हुआ';

    setTimeout(() => {

      voiceBox.classList.remove('show');

      setTimeout(() => {

        const ended =
          document.querySelector('#finalEnded');

        if (ended) {

          ended.classList.add('show');

          burst(220);

        }

      }, 500);

    }, 900);

    currentMemoryAudio = null;

  };


  currentMemoryAudio.onerror = () => {

    wave.classList.remove('playing');

    status.textContent =
      'Audio नहीं चल पाया।';

  };


  currentMemoryAudio.play().catch(err => {

    console.warn(
      'Final voice error:',
      err
    );

    status.textContent =
      '🎙️ सुनने के लिए फिर से खोलें।';

  });

}

/* =====================================================
   HEART / CONFETTI BURST
===================================================== */

function burst(n = 80) {
  const container = $('#confetti');
  if (!container) return;

  for (let i = 0; i < n; i++) {
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = ['♥', '✦', '❀', '❤️'][Math.floor(Math.random() * 4)];
    h.style.left = (20 + Math.random() * 60) + 'vw';
    h.style.setProperty('--dx', (Math.random() * 400 - 200) + 'px');
    h.style.animationDuration = (2 + Math.random() * 2) + 's';
    container.appendChild(h);
    setTimeout(() => h.remove(), 4000);
  }
}

/* =====================================================
   EMERGENCY TIMELINE CLICK FIX
===================================================== */

(function () {

  function fixTimelineClicks() {

    const timeline = document.querySelector('#timeline');
    if (!timeline) return;

    const cards = timeline.querySelectorAll('.time-card');

    const memories = [
      {
        year: '1987',
        freq: '87.0',
        title: 'एक शुरुआत…',
        text: '16 अगस्त 1987... एक छोटी-सी बच्ची इस दुनिया में आई। उस दिन किसी को क्या पता था कि यही बच्ची एक दिन किसी की सबसे प्यारी माँ बनेगी।',
        date: '16 AUGUST · 1987'
      },
      {
        year: '2005',
        freq: '92.5',
        title: 'एक नया अध्याय…',
        text: '2005 में आपकी जिंदगी ने एक नया मोड़ लिया। एक रिश्ता जुड़ा, एक नया घर बना और आपकी जिंदगी में एक खूबसूरत नया अध्याय शुरू हुआ।',
        date: '2005 · A NEW CHAPTER'
      },
      {
        year: '2006',
        freq: '96.5',
        title: 'फिर मैं आई…',
        text: '2006 में आपकी जिंदगी में मैं आई। शायद उस वक्त मुझे कुछ समझ नहीं था... लेकिन आज समझती हूँ कि मेरी सबसे सुरक्षित जगह हमेशा आपकी बाहों में रही।',
        date: '2006 · YOUR DAUGHTER'
      },
      {
        year: '2008',
        freq: '100.1',
        title: 'घर पूरा हुआ…',
        text: '2008 में छोटा भाई आया। अब आपकी दुनिया में हम दोनों थे। दो अलग-अलग बच्चे, दो अलग-अलग शरारतें... लेकिन माँ एक ही।',
        date: '2008 · HOME COMPLETE'
      }
    ];

    let current = 0;

    function showMemory(index) {

      current = (index + memories.length) % memories.length;

      const m = memories[current];

      /* main heading */
      const title = document.querySelector('#memoryTitle');
      const text = document.querySelector('#memoryText');
      const year = document.querySelector('#memoryYear');
      const freq = document.querySelector('#memoryFreq');
      const label = document.querySelector('#memoryIndex');
      const date = document.querySelector('#memoryDate');

      if (title) title.textContent = m.title;
      if (text) text.textContent = m.text;
      if (year) year.textContent = m.year;
      if (freq) freq.textContent = m.freq;
      if (label) label.textContent = 'MEMORY 0' + (current + 1);
      if (date) date.textContent = m.date;

      /* cards */
      cards.forEach((card, i) => {
        card.classList.toggle('active', i === current);
      });

      /* frequency dial */
      const knob = document.querySelector('#dialKnob');
      if (knob) {
        knob.style.transform =
          `rotate(${current * 52 - 20}deg)`;
      }
    }


    /* CARD CLICK */
    cards.forEach((card, index) => {

      card.style.cursor = 'pointer';

      card.addEventListener('click', function () {
        showMemory(index);
      });

    });


    /* ARROW BUTTONS — find every button containing arrow */
    const allButtons = timeline.querySelectorAll('button');

    allButtons.forEach(button => {

      const value = button.textContent.trim();

      if (value === '←') {

        button.style.cursor = 'pointer';

        button.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          showMemory(current - 1);
        });

      }

      if (value === '→') {

        button.style.cursor = 'pointer';

        button.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();

          showMemory(current + 1);
        });

      }

    });


    /* YEAR TEXT CLICK — extra safety */
    timeline.querySelectorAll('.freq-year').forEach((el, index) => {

      el.style.cursor = 'pointer';

      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        showMemory(index);
      });

    });


    showMemory(0);

    console.log('✅ RADIO MAA TIMELINE FIXED');

  }


  /* Wait until everything is loaded */
  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(fixTimelineClicks, 500);
    });

  } else {

    setTimeout(fixTimelineClicks, 500);

  }

})();

/* =========================================================
   FINAL FIX — TIMELINE ARROWS CHANGE FULL MEMORY
========================================================= */

(function () {

  const memories = [
    {
      year: "1987",
      label: "MEMORY 01",
      title: "एक शुरुआत...",
      text: "16 अगस्त 1987... एक छोटी-सी बच्ची इस दुनिया में आई।",
      date: "16 AUGUST · 1987"
    },
    {
      year: "2005",
      label: "MEMORY 02",
      title: "एक नया अध्याय...",
      text: "2005 में आपकी जिंदगी ने एक नया मोड़ लिया। एक रिश्ता जुड़ा, एक नया घर बना और आपकी जिंदगी में एक खूबसूरत नया अध्याय शुरू हुआ।",
      date: "2005 · A NEW CHAPTER"
    },
    {
      year: "2006",
      label: "MEMORY 03",
      title: "फिर मैं आई...",
      text: "2006 में आपकी जिंदगी में मैं आई। शायद उस वक्त मुझे कुछ समझ नहीं था... लेकिन आज समझती हूँ कि मेरी सबसे सुरक्षित जगह हमेशा आपकी बाहों में रही।",
      date: "2006 · YOUR DAUGHTER"
    },
    {
      year: "2008",
      label: "MEMORY 04",
      title: "घर पूरा हुआ...",
      text: "2008 में छोटा भाई आया। अब आपकी दुनिया में हम दोनों थे। दो अलग-अलग बच्चे, दो अलग-अलग शरारतें... लेकिन माँ एक ही।",
      date: "2008 · HOME COMPLETE"
    }
  ];

  let memoryIndex = 0;

  function updateMemory(i) {

    memoryIndex = (i + memories.length) % memories.length;

    const m = memories[memoryIndex];

    const timeline = document.querySelector("#timeline");
    if (!timeline) return;

    /* -----------------------------
       RIGHT SIDE MAIN CONTENT
    ----------------------------- */

    const head = timeline.querySelector(".section-head");

    if (head) {

      /* MEMORY 01 / 02 / 03 / 04 */
      const label = head.querySelector(":scope > span");
      if (label) {
        label.textContent = m.label;
      }

      /* BIG HINDI HEADING */
      const heading = head.querySelector("h2");
      if (heading) {
        heading.innerHTML = m.title;
      }

      /* STORY TEXT */
      const paragraph = head.querySelector("p");
      if (paragraph) {
        paragraph.textContent = m.text;
      }

      /* DATE / YEAR TEXT */
      const smalls = head.querySelectorAll("small");
      smalls.forEach(s => {
        s.textContent = m.date;
      });

      const dateElements = head.querySelectorAll(
        ".date, .memory-date, .timeline-date, .year-date"
      );

      dateElements.forEach(el => {
        el.textContent = m.date;
      });
    }


    /* -----------------------------
       BOTTOM MEMORY CARDS
    ----------------------------- */

    const cards = timeline.querySelectorAll(".time-card");

    cards.forEach((card, index) => {

      card.classList.toggle(
        "active",
        index === memoryIndex
      );

      card.style.borderColor =
        index === memoryIndex
          ? "rgba(216,169,76,.65)"
          : "rgba(216,169,76,.16)";

      card.style.transform =
        index === memoryIndex
          ? "translateY(-8px)"
          : "";

    });


    /* -----------------------------
       RADIO RING / DIAL
    ----------------------------- */

    const dial = document.querySelector("#dialKnob");

    if (dial) {
      dial.style.transform =
        `rotate(${memoryIndex * 52 - 20}deg)`;
    }


    /* -----------------------------
       SMALL YEAR INSIDE RING
    ----------------------------- */

    const ringYears =
      document.querySelectorAll(
        "#timeline .freq-year, #timeline .dial-year, #timeline .year"
      );

    ringYears.forEach((el, index) => {

      el.classList.toggle(
        "active",
        index === memoryIndex
      );

    });

  }


  /* =====================================================
     ARROWS
     ===================================================== */

  const prev = document.querySelector("#prev");
  const next = document.querySelector("#next");

  if (prev) {

    prev.onclick = function (e) {

      e.preventDefault();
      e.stopPropagation();

      updateMemory(memoryIndex - 1);

    };

  }


  if (next) {

    next.onclick = function (e) {

      e.preventDefault();
      e.stopPropagation();

      updateMemory(memoryIndex + 1);

    };

  }


  /* =====================================================
     BOTTOM CARDS CLICK
  ===================================================== */

  const cards =
    document.querySelectorAll("#timeline .time-card");

  cards.forEach((card, index) => {

    card.style.cursor = "pointer";

    card.onclick = function () {
      updateMemory(index);
    };

  });


  /* START AT 1987 */
  updateMemory(0);

})();

/* =========================================================
   RADIO MAA FM — TIMELINE / MEMORY FREQUENCY FIX
   Paste this at the VERY END of script.js
========================================================= */

(function () {
  function initMemoryTimeline() {

    const memories = [
      {
        year: "1987",
        number: "01",
        heading: "एक शुरुआत...",
        description: "16 अगस्त 1987... एक छोटी-सी बच्ची इस दुनिया में आई।",
        meta: "16 AUGUST · 1987",
        symbol: "✦",
        frequency: "87.0"
      },

      {
        year: "2005",
        number: "02",
        heading: "एक नया अध्याय...",
        description: "एक दिन आपकी ज़िंदगी में एक नया रिश्ता आया... और आपकी दुनिया पहले जैसी नहीं रही।",
        meta: "THE YEARS · 2005",
        symbol: "♥",
        frequency: "105.0"
      },

      {
        year: "2006",
        number: "03",
        heading: "एक बेटी...",
        description: "फिर आपकी दुनिया में मैं आई... और माँ बनने के साथ आपकी दुनिया में एक नई कहानी शुरू हुई।",
        meta: "A NEW CHAPTER · 2006",
        symbol: "♡",
        frequency: "106.0"
      },

      {
        year: "2008",
        number: "04",
        heading: "एक बेटा...",
        description: "और फिर परिवार पूरा-सा लगने लगा... एक और रिश्ता, एक और मुस्कान, एक और याद।",
        meta: "ONE MORE SMILE · 2008",
        symbol: "✦",
        frequency: "108.0"
      }
    ];

    let current = 0;

    const frequency =
      document.getElementById("memoryFrequency");

    const memoryYear =
      document.getElementById("memoryYear");

    const memoryNumber =
      document.getElementById("memoryNumber");

    const memorySymbol =
      document.getElementById("memorySymbol");

    const memoryHeading =
      document.getElementById("memoryHeading");

    const memoryDescription =
      document.getElementById("memoryDescription");

    const memoryMeta =
      document.getElementById("memoryMeta");

    const prev =
      document.getElementById("memoryPrev");

    const next =
      document.getElementById("memoryNext");

    const cards =
      document.querySelectorAll(".frequency-year");

    const ticks = {
      0: document.querySelector(".tick-1987"),
      1: document.querySelector(".tick-2005"),
      2: document.querySelector(".tick-2006"),
      3: document.querySelector(".tick-2008")
    };

    /* -----------------------------------------
       Remove OLD click listeners safely
    ----------------------------------------- */

    function replaceButton(button) {
      if (!button) return null;

      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      return newButton;
    }

    const cleanPrev = replaceButton(prev);
    const cleanNext = replaceButton(next);

    /* -----------------------------------------
       UPDATE EVERYTHING
    ----------------------------------------- */

    function updateMemory(index) {

      if (index < 0) index = memories.length - 1;
      if (index >= memories.length) index = 0;

      current = index;

      const data = memories[current];

      /* RIGHT SIDE */

      if (frequency)
        frequency.textContent = data.frequency;

      if (memoryYear)
        memoryYear.textContent = data.year;

      if (memoryNumber)
        memoryNumber.textContent = data.number;

      if (memorySymbol)
        memorySymbol.textContent = data.symbol;

      if (memoryHeading)
        memoryHeading.textContent = data.heading;

      if (memoryDescription)
        memoryDescription.textContent = data.description;

      if (memoryMeta)
        memoryMeta.textContent = data.meta;


      /* YEAR CARDS */

      cards.forEach((card, i) => {

        card.classList.toggle(
          "active",
          i === current
        );

        card.setAttribute(
          "aria-selected",
          i === current ? "true" : "false"
        );

      });


      /* DIAL YEAR TICKS */

      Object.keys(ticks).forEach(key => {

        const tick = ticks[key];

        if (!tick) return;

        tick.classList.toggle(
          "active",
          Number(key) === current
        );

      });


      /* DIAL VISUAL ROTATION */

      const dial =
        document.getElementById("memoryDial");

      if (dial) {

        const rotations = [
          -18,
          28,
          74,
          118
        ];

        dial.style.setProperty(
          "--memory-rotation",
          rotations[current] + "deg"
        );

      }

      /* SMALL MEMORY LABEL */

      const caption =
        document.querySelector(".memory-dial-area .dial-caption");

      if (caption) {

        const small =
          caption.querySelector("small");

        if (small)
          small.textContent =
            "MEMORY FREQUENCY · " + data.year;

      }

      /* ACCESSIBILITY */

      if (memoryHeading) {
        memoryHeading.setAttribute(
          "data-year",
          data.year
        );
      }
    }


    /* -----------------------------------------
       CARD CLICK
    ----------------------------------------- */

    cards.forEach((card, index) => {

      const cleanCard =
        card.cloneNode(true);

      card.parentNode.replaceChild(
        cleanCard,
        card
      );

      cleanCard.addEventListener(
        "click",
        function () {
          updateMemory(index);
        }
      );

      cleanCard.style.cursor = "pointer";

    });


    /* Re-select cards after cloning */

    const newCards =
      document.querySelectorAll(".frequency-year");


    newCards.forEach((card, index) => {

      card.addEventListener(
        "click",
        function (e) {

          e.preventDefault();
          e.stopPropagation();

          updateMemory(index);

        }
      );

    });


    /* -----------------------------------------
       PREVIOUS
    ----------------------------------------- */

    if (cleanPrev) {

      cleanPrev.addEventListener(
        "click",
        function (e) {

          e.preventDefault();
          e.stopPropagation();

          updateMemory(
            current - 1
          );

        }
      );

    }


    /* -----------------------------------------
       NEXT
    ----------------------------------------- */

    if (cleanNext) {

      cleanNext.addEventListener(
        "click",
        function (e) {

          e.preventDefault();
          e.stopPropagation();

          updateMemory(
            current + 1
          );

        }
      );

    }


    /* -----------------------------------------
       CLICK ON DIAL YEARS
    ----------------------------------------- */

    Object.keys(ticks).forEach(key => {

      const tick = ticks[key];

      if (!tick) return;

      const newTick =
        tick.cloneNode(true);

      tick.parentNode.replaceChild(
        newTick,
        tick
      );

      newTick.style.cursor = "pointer";

      newTick.addEventListener(
        "click",
        function (e) {

          e.preventDefault();
          e.stopPropagation();

          updateMemory(
            Number(key)
          );

        }
      );

    });


    /* -----------------------------------------
       KEYBOARD SUPPORT
       ← → arrows
    ----------------------------------------- */

    document.addEventListener(
      "keydown",
      function (e) {

        const timeline =
          document.getElementById("timeline");

        if (!timeline) return;

        const rect =
          timeline.getBoundingClientRect();

        const visible =
          rect.top < window.innerHeight &&
          rect.bottom > 0;

        if (!visible) return;

        if (e.key === "ArrowLeft") {

          updateMemory(
            current - 1
          );

        }

        if (e.key === "ArrowRight") {

          updateMemory(
            current + 1
          );

        }

      }
    );


    /* -----------------------------------------
       INITIAL STATE
    ----------------------------------------- */

    updateMemory(0);

    console.log(
      "❤️ Radio Maa FM Timeline Fixed"
    );

  }


  /* -----------------------------------------
     WAIT FOR PAGE
  ----------------------------------------- */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      initMemoryTimeline
    );

  } else {

    initMemoryTimeline();

  }
})();

/* =========================================
   CLOSE VOICE MESSAGE
========================================= */

if (voiceClose) {
  voiceClose.addEventListener('click', () => {

    // Stop the actual final call audio
    if (finalCallAudio) {
      finalCallAudio.pause();
      finalCallAudio.currentTime = 0;
    }

    // Stop timer
    if (finalCallTimer) {
      clearInterval(finalCallTimer);
      finalCallTimer = null;
    }

    // Hide voice message
    voiceMessage.style.display = 'none';

    // Clear transcript
    if (voiceTranscript) {
      voiceTranscript.innerHTML = '';
    }

    // Reset timer text
    if (voiceTime) {
      voiceTime.textContent = '00:00';
    }

    // Show incoming call screen again
    if (callScreen) {
      callScreen.style.display = 'flex';
    }

  });
}
