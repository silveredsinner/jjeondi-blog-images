(() => {
  const CATS = ["all", "food", "travel", "culture"];
  const $ = (id) => document.getElementById(id);

  const state = {
    lang: pickInitialLang(),
    region: null,
    cat: "all",
    q: "",
    show: "all", // "all" | "none"(유튜버 영상) | SHOWS key
    infoOpen: true,
  };
  readUrlState();

  // ---------- 언어 ----------
  function pickInitialLang() {
    const saved = safeGet("kt.lang");
    if (saved && I18N[saved]) return saved;
    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("zh")) return /tw|hk|hant/.test(nav) ? "zh-Hant" : "zh-Hans";
    const short = nav.split("-")[0];
    return I18N[short] ? short : "en";
  }
  function t(key, vars) {
    let s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
    if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }
  // region 은 "busan" 처럼 하나 또는 ["seoul", "gangwon"] 처럼 여러 개
  const matchShow = (v, show) => show === "all" || (show === "none" ? !v.show : v.show === show);
  const regionsOf = (v) => (Array.isArray(v.region) ? v.region : [v.region]);
  function showName(v) {
    const s = v.show && window.SHOWS && SHOWS[v.show];
    return s ? (state.lang === "ko" ? s.ko : s.en) : "";
  }
  function regionName(r) {
    return state.lang === "ko" ? r.ko : r.en;
  }
  function langLabel(code) {
    return (LANGS.find((l) => l.code === code) || {}).label || code;
  }

  // ---------- URL / 저장 ----------
  function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch {} }
  function readUrlState() {
    const p = new URLSearchParams(location.search);
    if (p.get("lang") && I18N[p.get("lang")]) state.lang = p.get("lang");
    if (REGIONS.some((r) => r.key === p.get("region"))) state.region = p.get("region");
    if (CATS.includes(p.get("cat"))) state.cat = p.get("cat");
    if (p.get("show") === "none" || (window.SHOWS && SHOWS[p.get("show")])) state.show = p.get("show");
  }
  function writeUrlState() {
    const p = new URLSearchParams();
    p.set("lang", state.lang);
    if (state.region) p.set("region", state.region);
    if (state.cat !== "all") p.set("cat", state.cat);
    if (state.show !== "all") p.set("show", state.show);
    history.replaceState(null, "", `${location.pathname}?${p}`);
  }

  // ---------- 지도 ----------
  // Leaflet 이 로드되지 않으면(차단·오프라인) 지도 없이 지역 칩만으로 동작
  const hasMap = typeof window.L !== "undefined";
  const KOREA = [[33.0, 125.0], [38.6, 130.0]];
  const markers = {};
  let map = null;
  if (hasMap) {
    map = L.map("map", { scrollWheelZoom: false }).fitBounds(KOREA);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 12, minZoom: 6,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    for (const r of REGIONS) {
      markers[r.key] = L.circleMarker([r.lat, r.lng], { radius: 14, weight: 2 })
        .addTo(map)
        .on("click", () => selectRegion(state.region === r.key ? null : r.key));
    }
  } else {
    $("map").hidden = true;
  }

  function countFor(regionKey) {
    return VIDEOS.filter((v) => regionsOf(v).includes(regionKey) && (state.cat === "all" || v.cats.includes(state.cat)) && matchShow(v, state.show)).length;
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderMap() {
    if (!hasMap) return;
    const accent = cssVar("--accent"), strong = cssVar("--accent-strong");
    for (const r of REGIONS) {
      const m = markers[r.key];
      const n = countFor(r.key);
      const active = state.region === r.key;
      m.setStyle({
        radius: active ? 18 : 10 + Math.min(n, 8),
        color: active ? strong : accent,
        fillColor: active ? strong : accent,
        fillOpacity: n ? (active ? 0.85 : 0.55) : 0.15,
      });
      m.unbindTooltip();
      m.bindTooltip(`${regionName(r)} · ${n}`, {
        permanent: true, direction: "top", offset: [0, -10],
        className: "region-label" + (active ? " active" : ""),
      });
    }
  }

  // ---------- 필터 UI ----------
  function renderChips() {
    const el = $("regionChips");
    el.innerHTML = "";
    el.appendChild(chip(t("allRegions"), state.region === null, () => selectRegion(null)));
    for (const r of REGIONS) {
      el.appendChild(chip(`${regionName(r)} ${countFor(r.key)}`, state.region === r.key, () => selectRegion(r.key)));
    }
    // 모바일에서 가로 스크롤되는 칩 줄에서 선택된 칩이 보이도록
    const active = el.querySelector(".chip.active");
    if (active) el.scrollLeft = active.offsetLeft - el.clientWidth / 2 + active.offsetWidth / 2;
  }
  function chip(label, active, onClick) {
    const b = document.createElement("button");
    b.className = "chip" + (active ? " active" : "");
    b.textContent = label;
    b.setAttribute("aria-pressed", active);
    b.onclick = onClick;
    return b;
  }
  function renderTabs() {
    const el = $("catTabs");
    el.innerHTML = "";
    for (const c of CATS) {
      const b = document.createElement("button");
      b.className = "tab" + (state.cat === c ? " active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", state.cat === c);
      b.textContent = t(c);
      b.onclick = () => { state.cat = c; renderAll(); };
      el.appendChild(b);
    }
  }

  function selectRegion(key) {
    state.region = key;
    if (map && key) {
      const r = REGIONS.find((x) => x.key === key);
      map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 7), { duration: 0.6 });
    } else if (map) {
      map.flyToBounds(KOREA, { duration: 0.6 });
    }
    renderAll();
  }

  // ---------- 영상 목록 ----------
  function filtered() {
    const q = state.q.trim().toLowerCase();
    return VIDEOS.filter((v) =>
      (!state.region || regionsOf(v).includes(state.region)) &&
      (state.cat === "all" || v.cats.includes(state.cat)) &&
      matchShow(v, state.show) &&
      (!q || `${v.title} ${showName(v)}`.toLowerCase().includes(q))
    );
  }

  function renderGrid() {
    const list = filtered();
    $("resultInfo").textContent = list.length ? t("results", { n: list.length }) : t("empty");
    const grid = $("grid");
    grid.innerHTML = "";
    for (const v of list) {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `
        <div class="thumb"><img loading="lazy" alt="" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg"><span class="play">▶</span></div>
        <div class="meta">
          <div class="title"></div>
          <div class="show"></div>
          <div class="tags">${regionsOf(v).map(() => '<span class="tag region"></span>').join("")}${v.cats.map((c) => `<span class="tag">${t(c)}</span>`).join("")}</div>
        </div>`;
      card.querySelector(".title").textContent = v.title;
      card.querySelector(".show").textContent = showName(v);
      card.querySelectorAll(".tag.region").forEach((el, i) => {
        el.textContent = regionName(REGIONS.find((x) => x.key === regionsOf(v)[i]));
      });
      card.onclick = () => openPlayer(v);
      grid.appendChild(card);
    }
  }

  // ---------- 지역 여행 정보 ----------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function linkBtn(href, text, cls = "info-btn") {
    const a = el("a", cls, text);
    a.href = href; a.target = "_blank"; a.rel = "noopener sponsored";
    return a;
  }
  const mapLinks = (q) => ({
    naver: `https://map.naver.com/p/search/${encodeURIComponent(q)}`,
    google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
  });

  function renderRegionInfo() {
    const box = $("regionInfo");
    const r = REGIONS.find((x) => x.key === state.region);
    const info = r && window.REGION_INFO && REGION_INFO[r.key];
    box.hidden = !info;
    box.innerHTML = "";
    if (!info) return;
    const L = state.lang === "ko" ? info.ko : info.en;
    const ko = state.lang === "ko";

    const head = el("div", "info-head");
    head.appendChild(el("h2", null, t("travelInfo", { r: regionName(r) })));
    const toggle = el("button", "info-toggle", state.infoOpen ? t("hideInfo") : t("showInfo"));
    toggle.onclick = () => { state.infoOpen = !state.infoOpen; renderRegionInfo(); };
    head.appendChild(toggle);
    box.appendChild(head);
    if (!state.infoOpen) return;

    box.appendChild(el("p", "info-intro", L.intro));

    const cols = el("div", "info-cols");
    for (const [key, items, linkable] of [["foods", L.foods, false], ["spots", L.spots, true]]) {
      const col = el("div", "info-col");
      col.appendChild(el("h3", null, t(key)));
      const list = el("div", "info-tags");
      for (const it of items) {
        if (linkable) {
          list.appendChild(linkBtn(mapLinks(`${it} ${r.en}`).google, it, "info-tag link"));
        } else {
          list.appendChild(el("span", "info-tag", it));
        }
      }
      col.appendChild(list);
      cols.appendChild(col);
    }
    box.appendChild(cols);

    // 영상에 나온 맛집·장소
    const places = (window.PLACES || []).filter((p) => p.region === r.key);
    if (places.length) {
      box.appendChild(el("h3", null, t("places")));
      const list = el("div", "place-list");
      for (const p of places) {
        const item = el("div", "place");
        const top = el("div", "place-top");
        top.appendChild(el("span", `place-type ${p.type}`, t(`t_${p.type}`)));
        top.appendChild(el("strong", null, ko ? p.ko : p.en));
        item.appendChild(top);
        item.appendChild(el("div", "place-menu", ko ? p.menu_ko : p.menu_en));
        const btns = el("div", "place-btns");
        const vids = p.videos.map((id) => VIDEOS.find((v) => v.id === id)).filter(Boolean);
        if (vids.length) {
          const b = el("button", "info-btn primary", `▶ ${t("watch")}${vids.length > 1 ? ` (${vids.length})` : ""}`);
          b.onclick = () => openPlayer(vids[0]);
          btns.appendChild(b);
        }
        const m = mapLinks(p.q);
        btns.appendChild(linkBtn(m.naver, t("naverMap")));
        btns.appendChild(linkBtn(m.google, t("googleMap")));
        item.appendChild(btns);
        list.appendChild(item);
      }
      box.appendChild(list);
      box.appendChild(el("p", "info-note", t("placeNote")));
    }

    // 여행 예약 (제휴)
    const affs = window.AFFILIATES || [];
    if (affs.length) {
      box.appendChild(el("h3", null, t("book")));
      const row = el("div", "aff-row");
      const q = encodeURIComponent(`${r.en.split("·")[0]}, Korea`);
      for (const a of affs) {
        const link = linkBtn(a.url.replace("{q}", q), "", "aff-btn");
        link.appendChild(el("strong", null, a.name));
        link.appendChild(el("span", null, ko ? a.kind_ko : a.kind_en));
        row.appendChild(link);
      }
      box.appendChild(row);
      if (affs.some((a) => a.tracked)) box.appendChild(el("p", "info-note", t("affNote")));
    }
  }

  function renderStatic() {
    document.documentElement.lang = state.lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $("search").placeholder = t("search");
  }

  function renderAll() {
    renderStatic();
    renderTabs();
    renderChips();
    renderShowChips();
    renderMap();
    renderRegionInfo();
    renderGrid();
    writeUrlState();
  }

  // ---------- 언어 선택 ----------
  const sel = $("langSelect");
  for (const l of LANGS) {
    const o = document.createElement("option");
    o.value = l.code; o.textContent = l.label;
    sel.appendChild(o);
  }
  sel.value = state.lang;
  sel.onchange = () => {
    state.lang = sel.value;
    safeSet("kt.lang", state.lang);
    renderAll();
    if (player) applyCaptions(true);
  };
  // 프로그램 카테고리: SHOWS 에 프로그램을 추가하면 버튼이 자동으로 생김
  function renderShowChips() {
    const el = $("showChips");
    const base = VIDEOS.filter((v) =>
      (!state.region || regionsOf(v).includes(state.region)) &&
      (state.cat === "all" || v.cats.includes(state.cat)));
    const opts = [["all", t("allShows")], ...Object.keys(SHOWS).map((k) => [k, state.lang === "ko" ? SHOWS[k].ko : SHOWS[k].en]), ["none", t("creators")]];
    el.innerHTML = "";
    for (const [key, label] of opts) {
      const n = base.filter((v) => matchShow(v, key)).length;
      const b = chip(`${label} ${n}`, state.show === key, () => { state.show = key; renderAll(); });
      if (key !== "all" && key !== "none") b.classList.add("program");
      el.appendChild(b);
    }
  }
  $("search").oninput = (e) => { state.q = e.target.value; renderGrid(); };

  // ---------- 플레이어 + 자동 자막 ----------
  let player = null;
  let apiReady = false;
  let pending = null;
  let capTimer = null;
  const dialog = $("playerDialog");

  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    if (pending) { openPlayer(pending); pending = null; }
  };

  function openPlayer(v) {
    $("playerTitle").textContent = v.title;
    setCapStatus("");
    if (!dialog.open) dialog.showModal();
    if (!apiReady) { pending = v; return; }

    const vars = {
      autoplay: 1,
      playsinline: 1,
      rel: 0,
      cc_load_policy: 1,        // 자막 강제 표시
      cc_lang_pref: state.lang, // 선호 자막 언어
      hl: state.lang,           // 플레이어 UI 언어
    };
    if (player) {
      player.destroy();
      player = null;
    }
    $("player").replaceWith(Object.assign(document.createElement("div"), { id: "player" }));
    player = new YT.Player("player", {
      videoId: v.id,
      playerVars: vars,
      events: {
        onReady: () => applyCaptions(),
        onApiChange: () => applyCaptions(),
        onStateChange: (e) => { if (e.data === YT.PlayerState.PLAYING) applyCaptions(); },
      },
    });
  }

  // 유튜브 자막 트랙 중 선택 언어가 있으면 그대로, 없으면 원본 트랙을 선택 언어로 자동번역.
  function applyCaptions(retry = true) {
    clearTimeout(capTimer);
    if (!player || typeof player.getOption !== "function") return;
    try {
      player.loadModule("captions");
      const tracks = player.getOption("captions", "tracklist") || [];
      if (!tracks.length) {
        // 트랙 목록은 재생이 시작된 뒤 조금 늦게 채워지므로 몇 번 재시도
        if (retry) {
          let tries = 0;
          const tick = () => {
            if (!player) return;
            const list = player.getOption("captions", "tracklist") || [];
            if (list.length) return applyCaptions(false);
            if (++tries < 8) capTimer = setTimeout(tick, 700);
            else if (player.getPlayerState && player.getPlayerState() === YT.PlayerState.PLAYING) setCapStatus(t("capNone"));
          };
          capTimer = setTimeout(tick, 700);
        }
        return;
      }
      const lang = state.lang;
      const base = (code) => code.toLowerCase().split("-")[0];
      const exact = tracks.find((tr) => tr.languageCode === lang) ||
        (lang.startsWith("zh") ? null : tracks.find((tr) => base(tr.languageCode) === base(lang)));
      if (exact) {
        player.setOption("captions", "track", exact);
      } else {
        // 사람이 만든 자막 > 자동 생성(asr) 순으로 원본 선택 후 번역
        const source = tracks.find((tr) => tr.kind !== "asr") || tracks[0];
        player.setOption("captions", "track", { ...source, translationLanguage: { languageCode: lang } });
      }
      setCapStatus(t("capOn", { lang: langLabel(lang) }));
    } catch (err) {
      console.warn("caption setup failed", err);
    }
  }

  function setCapStatus(msg) { $("captionStatus").textContent = msg; }

  function closePlayer() {
    clearTimeout(capTimer);
    if (player) { player.destroy(); player = null; }
    if (dialog.open) dialog.close();
  }
  $("closeBtn").onclick = closePlayer;
  dialog.addEventListener("cancel", (e) => { e.preventDefault(); closePlayer(); });
  dialog.addEventListener("click", (e) => { if (e.target === dialog) closePlayer(); });

  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", renderMap);
  renderAll();
})();
