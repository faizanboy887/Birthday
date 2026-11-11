
(() => {
  "use strict";

  const pages = [...document.querySelectorAll(".page")];
  const musicBtn = document.getElementById("musicBtn");
  const confettiLayer = document.getElementById("confettiLayer");

  let currentPage = 0;
  let changingPage = false;
  let audioContext = null;
  let masterGain = null;
  let musicOn = false;
  let melodyTimer = null;
  let melodyStep = 0;
  let lastSound = -1;
  let stickerSoundTimer = null;
  let stickerSoundNodes = [];

  const melody = [
    [523.25, .32], [659.25, .32], [783.99, .45],
    [659.25, .32], [587.33, .32], [659.25, .45],
    [523.25, .32], [587.33, .32], [659.25, .45],
    [392, .32], [523.25, .32], [659.25, .45],
    [440, .32], [523.25, .32], [659.25, .45],
    [587.33, .32], [523.25, .32], [392, .55],
    [440, .32], [523.25, .32], [587.33, .45],
    [523.25, .32], [440, .32], [392, .55]
  ];

  function setupAudio() {
    if (audioContext) return true;

    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return false;

    audioContext = new AudioClass();
    masterGain = audioContext.createGain();

    // Effects and music remain audible independently.
    masterGain.gain.value = 1;
    masterGain.connect(audioContext.destination);

    return true;
  }

  function playTone(freq, duration, volume, type, startAt) {
    if (!audioContext || !masterGain) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = startAt ?? audioContext.currentTime;

    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume), start + 0.018
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001, start + duration
    );

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  // Sparkly "tin-tidin" sound.
  function playTingTidin() {
    if (!setupAudio()) return;

    audioContext.resume().then(() => {
      const now = audioContext.currentTime;

      playTone(1046.5, 0.25, 0.8, "sine", now);
      playTone(1318.5, 0.30, 0.8, "sine", now + 0.12);
      playTone(1568, 0.34, 0.75, "sine", now + 0.24);
      playTone(2093, 0.42, 0.6, "triangle", now + 0.38);
    }).catch(() => {});
  }

  // Different button tap sounds.
  function playTapSound() {
    if (!setupAudio()) return;

    audioContext.resume().then(() => {
      let sound = Math.floor(Math.random() * 5);
      if (sound === lastSound) sound = (sound + 1) % 5;
      lastSound = sound;

      const now = audioContext.currentTime;

      if (sound === 0) {
        playTone(900, 0.10, 0.65, "sine", now);
        playTone(520, 0.13, 0.6, "sine", now + 0.05);
      } else if (sound === 1) {
        playTone(280, 0.19, 0.7, "triangle", now);
        playTone(660, 0.15, 0.65, "sine", now + 0.09);
      } else if (sound === 2) {
        playTone(880, 0.12, 0.7, "sine", now);
        playTone(1174.7, 0.18, 0.7, "sine", now + 0.10);
      } else if (sound === 3) {
        playTone(190, 0.14, 0.7, "triangle", now);
        playTone(470, 0.13, 0.6, "sine", now + 0.06);
      } else {
        playTone(660, 0.13, 0.7, "triangle", now);
        playTone(880, 0.15, 0.7, "triangle", now + 0.09);
        playTone(1174.7, 0.20, 0.6, "sine", now + 0.18);
      }
    }).catch(() => {});
  }

  // Six different funny cartoon sounds, each lasting about five seconds.
  function stopStickerSound() {
    if (stickerSoundTimer) {
      clearTimeout(stickerSoundTimer);
      stickerSoundTimer = null;
    }

    stickerSoundNodes.forEach(node => {
      try {
        node.stop();
      } catch (_) {}
    });

    stickerSoundNodes = [];
  }

  function funnyTone(freq, offset, duration, volume, wave, slide) {
    if (!audioContext || !masterGain || offset >= 5) return;

    const start = audioContext.currentTime + offset;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = wave || "sawtooth";
    oscillator.frequency.setValueAtTime(freq, start);

    if (slide) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(30, slide),
        start + Math.max(0.04, duration)
      );
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, volume), start + 0.025
    );
    gain.gain.setValueAtTime(
      Math.max(0.001, volume),
      start + Math.max(0.04, duration - 0.04)
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001, start + duration
    );

    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);

    stickerSoundNodes.push(oscillator);
  }

  function playFunnyStickerSound(type) {
    if (!setupAudio()) return;

    audioContext.resume().then(() => {
      stopStickerSound();

      // Repeating different patterns creates a five-second sound effect.
      for (let t = 0; t < 4.85; t += 0.32) {
        const r = Math.random();

        if (type === "teddy") {
          // Low, grumbly cartoon growl.
          funnyTone(115 + r * 100, t, 0.27, 0.8, "sawtooth", 55 + r * 90);
          funnyTone(190 + r * 80, t + 0.08, 0.14, 0.35, "triangle", 100);
        } else if (type === "pop") {
          // Bouncy cartoon popping.
          funnyTone(750 + r * 900, t, 0.13, 0.8, "sine", 140 + r * 160);
          funnyTone(350 + r * 300, t + 0.12, 0.12, 0.6, "triangle", 120);
        } else if (type === "sneeze") {
          // Silly sneeze-like electronic effect.
          funnyTone(350 + r * 400, t, 0.22, 0.75, "triangle", 100 + r * 100);
          funnyTone(950 + r * 500, t + 0.12, 0.11, 0.65, "square", 230);
        } else if (type === "goofy") {
          // Wobbly, fart-like cartoon raspberry.
          funnyTone(100 + r * 100, t, 0.30, 0.8, "sawtooth", 45 + r * 50);
          funnyTone(180 + r * 180, t + 0.10, 0.17, 0.45, "square", 70);
        } else if (type === "buzz") {
          // Funny buzzing and fluttering.
          funnyTone(180 + r * 250, t, 0.28, 0.7, "sawtooth", 350 + r * 300);
          funnyTone(500 + r * 400, t + 0.08, 0.12, 0.45, "square", 180);
        } else {
          // Sparkly, strange magic sound.
          funnyTone(650 + r * 1100, t, 0.21, 0.7, "sine", 250 + r * 600);
          funnyTone(1000 + r * 700, t + 0.11, 0.16, 0.45, "triangle", 500);
        }
      }

      stickerSoundTimer = setTimeout(stopStickerSound, 5000);
    }).catch(() => {});
  }

  // Find the six sticker cards using their visible labels.
  function connectStickerSounds() {
    const labels = [
      { text: "Teddy vibes", type: "teddy" },
      { text: "Pink world", type: "pop" },
      { text: "New beginnings", type: "sneeze" },
      { text: "Lots of wishes", type: "goofy" },
      { text: "Big dreams", type: "buzz" },
      { text: "Happy moments", type: "magic" }
    ];

    const stickerPage = pages.find(page =>
      page.textContent.includes("Teddy vibes") &&
      page.textContent.includes("Happy moments")
    );

    if (!stickerPage) return;

    labels.forEach(item => {
      const all = [...stickerPage.querySelectorAll("*")];

      // Find the smallest element containing the exact sticker label.
      const labelElement = all.find(el =>
        el.children.length === 0 &&
        el.textContent.trim() === item.text
      );

      if (!labelElement) return;

      // Move up to the card-sized container.
      let card = labelElement;
      while (card.parentElement &&
             card.parentElement !== stickerPage &&
             card.parentElement.textContent.length < 100) {
        card = card.parentElement;
      }

      if (card.dataset.funnySoundAttached === "yes") return;

      card.dataset.funnySoundAttached = "yes";
      card.style.cursor = "pointer";
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", item.text + " funny sound");

      card.addEventListener("click", event => {
        // Avoid playing the page's normal click sound for this sticker.
        event.stopPropagation();
        playFunnyStickerSound(item.type);
      });
    });
  }

  function playMelodyStep() {
    if (!musicOn || !audioContext) return;

    const note = melody[melodyStep % melody.length];
    const now = audioContext.currentTime;

    playTone(note[0], note[1], 0.38, "sine", now);

    if (melodyStep % 3 === 0) {
      playTone(note[0] / 2, note[1], 0.20, "triangle", now);
    }

    melodyStep++;
  }

  async function startMusic() {
    if (!setupAudio()) {
      musicBtn.textContent = "Music supported nahi";
      return;
    }

    try {
      await audioContext.resume();
      musicOn = true;

      if (melodyTimer) clearInterval(melodyTimer);

      playMelodyStep();
      melodyTimer = setInterval(playMelodyStep, 360);

      musicBtn.textContent = "♫ Music: ON";
      musicBtn.classList.add("playing");
    } catch (error) {
      musicOn = false;
      musicBtn.textContent = "♫ Music chalao";
    }
  }

  function stopMusic() {
    musicOn = false;

    if (melodyTimer) {
      clearInterval(melodyTimer);
      melodyTimer = null;
    }

    musicBtn.textContent = "♫ Music chalao";
    musicBtn.classList.remove("playing");
  }

  musicBtn.addEventListener("click", () => {
    if (musicOn) stopMusic();
    else startMusic();
  });

  // Mobile browsers require a user tap before audio can play.
  window.addEventListener("load", () => {
    setupAudio();
    connectStickerSounds();
  });

  document.addEventListener("pointerdown", () => {
    if (!musicOn) startMusic();
  }, { once: true });

  function celebrate(amount) {
    createConfetti(amount);
    playTingTidin();
  }

  function showPage(index) {
    if (changingPage || index < 0 || index >= pages.length) return;
    if (index === currentPage) return;

    changingPage = true;

    const oldPage = pages[currentPage];
    const newPage = pages[index];

    oldPage.classList.remove("active");
    oldPage.classList.add("leaving");

    setTimeout(() => {
      oldPage.classList.remove("leaving");
      newPage.classList.add("active");
      currentPage = index;
      changingPage = false;

      window.scrollTo({ top: 0, behavior: "smooth" });

      if (index === 4) connectStickerSounds();
      if (index === 6) celebrate(100);
    }, 170);
  }

  // Back and Next on every page.
  pages.forEach((page, index) => {
    const nav = document.createElement("div");
    nav.className = "page-navigation";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "page-nav-btn";
    back.textContent = "← Back";
    back.disabled = index === 0;

    const next = document.createElement("button");
    next.type = "button";
    next.className = "page-nav-btn";
    next.textContent = index === pages.length - 1 ? "The End 💗" : "Next →";
    next.disabled = index === pages.length - 1;

    back.addEventListener("click", () => {
      playTapSound();
      showPage(index - 1);
    });

    next.addEventListener("click", () => {
      playTapSound();
      showPage(index + 1);
    });

    nav.append(back, next);
    page.appendChild(nav);
  });

  document.querySelectorAll(".page .next").forEach(button => {
    button.addEventListener("click", () => {
      playTapSound();
      showPage(currentPage + 1);
    });
  });

  // Gift opening.
  const giftBox = document.getElementById("giftBox");
  const revealGift = document.getElementById("revealGift");
  const giftMessage = document.getElementById("giftMessage");

  function openGift() {
    if (!giftMessage.classList.contains("hidden")) return;

    giftMessage.classList.remove("hidden");
    giftBox.textContent = "🎉";
    revealGift.textContent = "Gift khul gaya! 💗";
    revealGift.disabled = true;

    celebrate(180);
  }

  revealGift.addEventListener("click", openGift);
  giftBox.addEventListener("click", openGift);

  // Birthday countdown.
  const birthdayTime = new Date("2026-11-11T00:00:00+05:30").getTime();

  function updateCountdown() {
    let remaining = birthdayTime - Date.now();

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const message = document.getElementById("countdownMessage");

    if (remaining <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      message.textContent = "Aaj tumhara birthday hai! Happy Birthday, Avdhesh! 🎂";
      return;
    }

    const days = Math.floor(remaining / 86400000);
    remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000);
    remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Quiz.
  const quizQuestions = [
    {
      question: "1. Birthday ko special kya banata hai?",
      options: ["🎁 Mehange gifts", "💗 Pyaar aur achhi wishes", "🍰 Sirf cake"],
      answer: 1,
      feedback: "Bilkul! Dil se mili wishes sabse khaas hoti hain. 💗"
    },
    {
      question: "2. Birthday par sabse achha kya laana chahiye?",
      options: ["😄 Ek pyari si smile", "😴 Neend", "📚 Homework"],
      answer: 0,
      feedback: "Sahi! Tumhari smile har moment ko special bana sakti hai. ✨"
    },
    {
      question: "3. Naye saal mein tumhe kya mile?",
      options: ["🌟 Khushiyan aur success", "😩 Sirf tension", "🙈 Bilkul masti nahi"],
      answer: 0,
      feedback: "Yahi wish hai! Tumhara aane wala saal zabardast ho. 🎂"
    }
  ];

  let quizIndex = 0;
  const quizQuestion = document.getElementById("quizQuestion");
  const quizOptions = document.getElementById("quizOptions");
  const quizFeedback = document.getElementById("quizFeedback");
  const quizContinue = document.getElementById("quizContinue");

  function renderQuiz() {
    const item = quizQuestions[quizIndex];

    quizQuestion.textContent = item.question;
    quizOptions.innerHTML = "";
    quizFeedback.textContent = "";
    quizContinue.classList.add("hidden");
    quizContinue.textContent =
      quizIndex === quizQuestions.length - 1
        ? "Secret surprise dekho →"
        : "Agla sawaal →";

    item.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = option;

      button.addEventListener("click", () => {
        if (quizOptions.dataset.answered === "yes") return;
        quizOptions.dataset.answered = "yes";

        [...quizOptions.children].forEach((choice, choiceIndex) => {
          choice.disabled = true;
          if (choiceIndex === item.answer) choice.classList.add("chosen");
        });

        quizFeedback.textContent =
          (index === item.answer ? "Sahi jawab! 🎉 " : "Achhi koshish! 💗 ") +
          item.feedback;

        playTapSound();
        celebrate(45);
        quizContinue.classList.remove("hidden");
      });

      quizOptions.appendChild(button);
    });

    quizOptions.dataset.answered = "no";
  }

  quizContinue.addEventListener("click", () => {
    if (quizOptions.dataset.answered !== "yes") return;

    playTapSound();

    if (quizIndex < quizQuestions.length - 1) {
      quizIndex++;
      renderQuiz();
    } else {
      showPage(6);
    }
  });

  // Secret message.
  const unlockSecret = document.getElementById("unlockSecret");
  const secretMessage = document.getElementById("secretMessage");
  const secretLock = document.getElementById("secretLock");
  const secretHint = document.getElementById("secretHint");
  const celebrateBtn = document.getElementById("celebrateBtn");
  const finalMessage = document.getElementById("finalMessage");

  unlockSecret.addEventListener("click", () => {
    secretMessage.classList.remove("hidden");
    secretLock.textContent = "🔓";
    secretHint.textContent = "Tumhara special message unlock ho gaya! 💗";
    unlockSecret.classList.add("hidden");
    celebrateBtn.classList.remove("hidden");

    celebrate(190);
  });

  celebrateBtn.addEventListener("click", () => {
    finalMessage.classList.remove("hidden");
    celebrateBtn.classList.add("hidden");

    celebrate(250);
  });

  document.getElementById("restartBtn").addEventListener("click", () => {
    finalMessage.classList.add("hidden");
    celebrateBtn.classList.add("hidden");
    secretMessage.classList.add("hidden");
    secretLock.textContent = "🔒";
    secretHint.textContent = "Tap below to unlock your message!";
    unlockSecret.classList.remove("hidden");

    giftMessage.classList.add("hidden");
    giftBox.textContent = "🎁";
    revealGift.textContent = "Open your gift 💝";
    revealGift.disabled = false;

    quizIndex = 0;
    renderQuiz();

    pages.forEach(page => page.classList.remove("active", "leaving"));
    currentPage = 0;
    pages[0].classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
    playTapSound();
  });

  function createConfetti(amount) {
    const symbols = [
      "🌸", "🌷", "💗", "🎀", "✨", "💖", "🎉",
      "🌺", "💕", "⭐", "🌼", "🩷", "💐"
    ];

    for (let i = 0; i < amount; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      piece.style.left = Math.random() * 100 + "%";
      piece.style.setProperty("--fall-time", (2.3 + Math.random() * 3) + "s");
      piece.style.setProperty("--drift", (Math.random() * 240 - 120) + "px");
      piece.style.setProperty("--piece-size", (17 + Math.random() * 18) + "px");
      piece.style.animationDelay = (Math.random() * 0.7) + "s";

      confettiLayer.appendChild(piece);
      piece.addEventListener("animationend", () => piece.remove());
    }

    while (confettiLayer.children.length > 300) {
      confettiLayer.firstElementChild.remove();
    }
  }

  renderQuiz();

  // Run again after the page has loaded, when sticker cards are available.
  if (document.readyState === "complete") {
    connectStickerSounds();
  } else {
    window.addEventListener("load", connectStickerSounds);
  }
})();
