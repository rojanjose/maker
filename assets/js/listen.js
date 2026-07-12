// "Listen to this article" — reads the article aloud with the browser's
// built-in speech synthesis. No audio files or external services; articles
// can instead supply a recorded file via `audio:` front matter, in which
// case the guide layout renders a plain <audio> player and this script
// never activates.
(function () {
  var bar = document.getElementById("mm-listen");
  if (!bar || !("speechSynthesis" in window)) return;

  var synth = window.speechSynthesis;
  var btn = document.getElementById("mm-listen-btn");
  var stopBtn = document.getElementById("mm-listen-stop");
  var status = document.getElementById("mm-listen-status");

  // Blocks worth hearing, in reading order. Skips figures/captions, the ToC
  // rail, the comparison table and the references list (URLs read aloud badly).
  var nodes = [];
  var h1 = document.querySelector(".article > h1");
  var subhead = document.querySelector(".article .subhead");
  if (h1) nodes.push(h1);
  if (subhead) nodes.push(subhead);
  document
    .querySelectorAll(".article-body h2, .article-body h3, .article-body p, .article-body li")
    .forEach(function (el) {
      if (el.closest("figure") || el.closest(".toc") || el.closest(".references")) return;
      if (el.id === "references" || (el.tagName === "H2" && el.id === "references")) return;
      nodes.push(el);
    });
  if (!nodes.length) return;

  var words = nodes
    .map(function (n) { return n.textContent; })
    .join(" ")
    .split(/\s+/).length;
  status.textContent = "~" + Math.max(1, Math.round(words / 170)) + " min listen";

  var state = "idle"; // idle | playing | paused
  var idx = 0;

  // Chrome loads voices asynchronously — an utterance spoken before the list
  // arrives can be silent. Pick an English voice once they're available.
  var voice = null;
  function pickVoice() {
    var voices = synth.getVoices();
    if (!voices.length) return;
    var en = voices.filter(function (v) { return v.lang.indexOf("en") === 0; });
    voice = en.filter(function (v) { return v.default; })[0] || en[0] || voices[0];
    console.debug("[listen] voice:", voice && voice.name);
  }
  pickVoice();
  if (typeof synth.onvoiceschanged !== "undefined") {
    synth.onvoiceschanged = pickVoice;
  }

  function clearHighlights() {
    nodes.forEach(function (n) { n.classList.remove("speaking"); });
  }

  function speakNext() {
    if (idx >= nodes.length) return stop();
    var el = nodes[idx];
    var u = new SpeechSynthesisUtterance(el.textContent);
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || document.documentElement.lang || "en";
    u.volume = 1;
    u.rate = 1;
    u.onstart = function () { el.classList.add("speaking"); };
    u.onend = function () {
      el.classList.remove("speaking");
      if (state !== "playing") return;
      idx++;
      speakNext(); // one utterance per block sidesteps Chrome's long-speech cutoff
    };
    u.onerror = function (ev) {
      console.warn("[listen] speech error:", ev.error);
      u.onend();
    };
    synth.speak(u);
  }

  function stop() {
    state = "idle";
    idx = 0;
    synth.cancel();
    clearHighlights();
    btn.textContent = "▶ Listen";
    stopBtn.hidden = true;
  }

  btn.addEventListener("click", function () {
    if (state === "idle") {
      synth.cancel(); // clear any stuck queue from an earlier page/session
      state = "playing";
      btn.textContent = "⏸ Pause";
      stopBtn.hidden = false;
      speakNext();
    } else if (state === "playing") {
      state = "paused";
      synth.pause();
      btn.textContent = "▶ Resume";
    } else {
      state = "playing";
      synth.resume();
      btn.textContent = "⏸ Pause";
    }
  });

  stopBtn.addEventListener("click", stop);

  // Chrome workaround: the engine sometimes stalls silently; nudging resume()
  // while we believe we're playing un-sticks it (no-op everywhere else).
  setInterval(function () {
    if (state === "playing" && synth.speaking && !synth.paused) synth.resume();
  }, 5000);

  // Speech keeps playing after leaving the page otherwise.
  window.addEventListener("pagehide", function () { synth.cancel(); });

  bar.hidden = false;
})();
