// Client-side search over window.MM_SEARCH_INDEX (see search-index.js).
// No backend, no external services — filters the index as you type and
// renders a dropdown under the masthead search box.
(function () {
  var root = window.MM_ROOT || "";
  var input = document.getElementById("mm-search");
  var panel = document.getElementById("mm-search-results");
  if (!input || !panel || !window.MM_SEARCH_INDEX) return;

  var selected = -1;

  function score(entry, terms) {
    var title = entry.title.toLowerCase();
    var haystack = (entry.title + " " + entry.section + " " + entry.keywords).toLowerCase();
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (title.indexOf(t) !== -1) total += 3;
      else if (haystack.indexOf(t) !== -1) total += 1;
      else return 0; // every term must match somewhere
    }
    return total;
  }

  function highlight(title, terms) {
    var safe = title.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
    terms.forEach(function (t) {
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      safe = safe.replace(re, "<mark>$1</mark>");
    });
    return safe;
  }

  function render(results, terms) {
    selected = -1;
    if (!results.length) {
      panel.innerHTML = '<div class="r-empty">No results. Try “fdm”, “resin” or “how we test”.</div>';
      panel.classList.add("open");
      return;
    }
    panel.innerHTML = results
      .map(function (e) {
        return (
          '<a href="' + root + e.url + '">' +
          '<div class="r-title">' + highlight(e.title, terms) + "</div>" +
          '<div class="r-meta">' + e.section + "</div>" +
          "</a>"
        );
      })
      .join("");
    panel.classList.add("open");
  }

  function close() {
    panel.classList.remove("open");
    panel.innerHTML = "";
    selected = -1;
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    if (q.length < 2) return close();
    var terms = q.split(/\s+/);
    var results = window.MM_SEARCH_INDEX
      .map(function (e) { return { entry: e, s: score(e, terms) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 8)
      .map(function (r) { return r.entry; });
    render(results, terms);
  });

  input.addEventListener("keydown", function (ev) {
    var links = panel.querySelectorAll("a");
    if (ev.key === "Escape") return close();
    if (!links.length) return;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      selected = ev.key === "ArrowDown"
        ? Math.min(selected + 1, links.length - 1)
        : Math.max(selected - 1, 0);
      links.forEach(function (a, i) { a.classList.toggle("selected", i === selected); });
    } else if (ev.key === "Enter") {
      var target = links[selected >= 0 ? selected : 0];
      if (target) window.location.href = target.href;
    }
  });

  document.addEventListener("click", function (ev) {
    if (!ev.target.closest(".search")) close();
  });

  // Masthead date, NYT-style.
  var dateEl = document.getElementById("mm-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }
})();
