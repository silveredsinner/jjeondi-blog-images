(() => {
  // 유튜브에서 삭제·비공개·퍼가기 금지된 영상은 처음부터 빼고 시작 (data/hidden-videos.js)
  const hiddenVideos = new Set(window.HIDDEN_VIDEOS || []);
  window.VIDEOS = window.VIDEOS.filter((v) => !hiddenVideos.has(v.id));

  const CATS = ["all", "food", "travel", "culture"];
  const $ = (id) => document.getElementById(id);

  const state = {
    lang: pickInitialLang(),
    region: null,
    cat: "all",
    q: "",
    show: "all", // "all" | "none"(유튜버 영상) | SHOWS key
    infoOpen: true,
    subsOnly: false,
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
    return s ? showLabel(v.show) : "";
  }
  // ko·en 은 원본 데이터, 그 밖의 언어는 data/i18n-content.js (없으면 영어)
  function showLabel(key) {
    const s = SHOWS[key];
    if (state.lang === "ko") return s.ko;
    return (window.SHOW_NAMES && SHOW_NAMES[key] && SHOW_NAMES[key][state.lang]) || s.en;
  }
  function regionName(r) {
    if (state.lang === "ko") return r.ko;
    return (window.REGION_NAMES && REGION_NAMES[r.key] && REGION_NAMES[r.key][state.lang]) || r.en;
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
  const KOREA = [[33.1, 125.9], [38.65, 129.6]];
  const areas = {};
  const labels = {};
  let hoverKey = null;
  // 라벨 위치: 작은 광역시와 겹치지 않게 조정한 곳만 지정 (없으면 REGIONS 의 좌표)
  const LABEL_POS = {
    gyeonggi: [37.2, 127.3], gangwon: [37.75, 128.3], chungcheong: [36.55, 127.35],
    gyeongbuk: [36.45, 128.75], gyeongnam: [35.35, 128.1], jeonnam: [34.95, 126.95],
    busan: [35.12, 129.22],
  };
  let map = null;
  if (hasMap) {
    map = L.map("map", { scrollWheelZoom: false, zoomSnap: 0.25 }).fitBounds(KOREA);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 12, minZoom: 6,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    // 시·도 경계를 지역별로 음영 표시 (data/korea-provinces.js). 경계 데이터가 없으면 동그라미로 대체
    const toggle = (key) => selectRegion(state.region === key ? null : key);
    if (window.KOREA_PROVINCES) {
      for (const r of REGIONS) {
        const layer = L.geoJSON(
          { type: "FeatureCollection", features: KOREA_PROVINCES.features.filter((f) => f.properties.region === r.key) },
          { style: { weight: 1.2 } },
        ).addTo(map);
        layer.on("click", () => toggle(r.key));
        layer.on("mouseover", () => { hoverKey = r.key; renderMap(); });
        layer.on("mouseout", () => { hoverKey = null; renderMap(); });
        areas[r.key] = layer;
      }
    } else {
      for (const r of REGIONS) {
        areas[r.key] = L.circleMarker([r.lat, r.lng], { radius: 14, weight: 2 }).addTo(map).on("click", () => toggle(r.key));
      }
    }
    // 지역 이름 라벨 (누르면 그 지역 선택)
    for (const r of REGIONS) {
      const [lat, lng] = LABEL_POS[r.key] || [r.lat, r.lng];
      labels[r.key] = L.tooltip({ permanent: true, direction: "center", className: "region-label", interactive: true })
        .setLatLng([lat, lng]).setContent("").addTo(map);
      labels[r.key].getElement()?.addEventListener("click", () => toggle(r.key));
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
    const max = Math.max(1, ...REGIONS.map((r) => countFor(r.key)));
    for (const r of REGIONS) {
      const n = countFor(r.key);
      const active = state.region === r.key;
      const hover = hoverKey === r.key;
      // 영상이 많을수록 진하게, 선택한 지역은 가장 진하게
      const base = n ? 0.12 + 0.38 * (n / max) : 0.04;
      areas[r.key].setStyle({
        color: active ? strong : accent,
        weight: active ? 2.5 : 1.2,
        fillColor: active ? strong : accent,
        fillOpacity: active ? 0.6 : hover ? Math.min(base + 0.15, 0.7) : base,
        ...(areas[r.key].setRadius ? { radius: active ? 18 : 10 + Math.min(n, 8) } : {}),
      });
      if (active && areas[r.key].bringToFront) areas[r.key].bringToFront();
      const el = labels[r.key].getElement();
      labels[r.key].setContent(`${regionName(r)} <b>${n}</b>`);
      if (el) el.classList.toggle("active", active);
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
      const b = areas[key].getBounds ? areas[key].getBounds() : null;
      if (b && b.isValid()) map.flyToBounds(b, { padding: [30, 30], maxZoom: 9, duration: 0.6 });
      else map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 7), { duration: 0.6 });
    } else if (map) {
      map.flyToBounds(KOREA, { duration: 0.6 });
    }
    renderAll();
  }

  // ---------- 영상 목록 ----------
  // 영상별 자막 언어 (data/video-subs.js). 확인 전이면 undefined
  const SUBS = window.VIDEO_SUBS || {};
  const hasSubsData = () => Object.keys(SUBS).length > 0;
  const hasMySubs = (v) => (SUBS[v.id] || []).some((c) => sameLang(c, state.lang));
  const subsFilterOn = () => state.subsOnly && state.lang !== "ko" && hasSubsData();

  function filtered() {
    const q = state.q.trim().toLowerCase();
    return VIDEOS.filter((v) =>
      (!state.region || regionsOf(v).includes(state.region)) &&
      (state.cat === "all" || v.cats.includes(state.cat)) &&
      matchShow(v, state.show) &&
      (!subsFilterOn() || hasMySubs(v)) &&
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
          <div class="tags">${state.lang !== "ko" && hasMySubs(v) ? '<span class="tag subs"></span>' : ""}${regionsOf(v).map(() => '<span class="tag region"></span>').join("")}${v.cats.map((c) => `<span class="tag">${t(c)}</span>`).join("")}</div>
        </div>`;
      card.querySelector(".title").textContent = v.title;
      card.querySelector(".show").textContent = showName(v);
      const subsTag = card.querySelector(".tag.subs");
      if (subsTag) subsTag.textContent = "CC " + t("subsBadge", { lang: langLabel(state.lang) });
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
  function linkBtn(href, text, cls = "info-btn", sponsored = false) {
    const a = el("a", cls, text);
    a.href = href; a.target = "_blank"; a.rel = sponsored ? "noopener sponsored" : "noopener";
    return a;
  }
  const mapLinks = (q) => ({
    naver: `https://map.naver.com/p/search/${encodeURIComponent(q)}`,
    google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
  });

  // KKday 상품 카드 위젯: #regionInfo 와 따로 두어서, 검색·필터로 다시 그릴 때 위젯이 새로 로딩되지 않게 한다.
  // 지역이 바뀔 때만 새로 만들고, 정보 접기/언어 변경은 숨김·제목만 바꾼다.
  let kkKey = null;
  function renderKkWidget() {
    const box = $("kkWidget");
    if (!box) return;
    const r = REGIONS.find((x) => x.key === state.region);
    const oid = r && (window.KKDAY_WIDGETS || {})[r.key];
    box.hidden = !oid || !state.infoOpen;
    if (!oid) { if (kkKey) { box.innerHTML = ""; kkKey = null; } return; }
    if (kkKey !== r.key) {
      kkKey = r.key;
      box.innerHTML = "";
      box.appendChild(el("h3", "kk-title"));
      const ins = document.createElement("ins");
      ins.className = "kkday-product-media";
      ins.dataset.oid = oid; ins.dataset.amount = "4"; ins.dataset.origin = "https://kkpartners.kkday.com";
      box.appendChild(ins);
      // 위젯 스크립트가 페이지의 <ins> 를 찾아 채운다 → 지역이 바뀔 때마다 새로 실행
      const sc = document.createElement("script");
      sc.src = window.KKDAY_WIDGET_JS; sc.async = true;
      box.appendChild(sc);
      box.appendChild(el("p", "info-note kk-note"));
    }
    box.querySelector(".kk-title").textContent = t("kkTours", { r: regionName(r) });
    box.querySelector(".kk-note").textContent = t("affNote");
  }

  function renderRegionInfo() {
    renderKkWidget();
    const box = $("regionInfo");
    const r = REGIONS.find((x) => x.key === state.region);
    const info = r && window.REGION_INFO && REGION_INFO[r.key];
    box.hidden = !info;
    box.innerHTML = "";
    if (!info) return;
    const extra = window.REGION_INFO_I18N && REGION_INFO_I18N[r.key] && REGION_INFO_I18N[r.key][state.lang];
    const L = state.lang === "ko" ? info.ko : { ...info.en, ...extra };
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
    const places = [...(window.PLACES || []), ...(window.PLACES_AUTO || [])].filter((p) => p.region === r.key);
    if (places.length) {
      box.appendChild(el("h3", null, t("places")));
      const list = el("div", "place-list");
      for (const p of places) {
        const item = el("div", "place");
        const top = el("div", "place-top");
        top.appendChild(el("span", `place-type ${p.type}`, t(`t_${p.type}`)));
        const tr = window.PLACE_I18N && PLACE_I18N[p.ko] && PLACE_I18N[p.ko][state.lang];
        top.appendChild(el("strong", null, ko ? p.ko : tr ? tr[0] : p.en));
        item.appendChild(top);
        // 외국인 방문자에게는 현지에서 보여주거나 검색할 수 있게 한국어 이름도 표시
        if (!ko) item.appendChild(el("div", "place-ko", p.ko));
        item.appendChild(el("div", "place-menu", ko ? p.menu_ko : tr ? tr[1] : p.menu_en));
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
      const city = r.en.split("·")[0];
      for (const a of affs) {
        // cityOnly: "Busan, Korea" 대신 "Busan" 으로 검색 (KKday 처럼 쉼표가 들어가면 결과가 줄어드는 사이트)
        const q = encodeURIComponent(a.cityOnly ? city : `${city}, Korea`);
        // site 가 있으면 제휴 리다이렉트 주소의 {site} 자리에 (검색어를 넣은) 목적지 주소를 인코딩해서 넣는다
        const href = a.site ? a.url.replace("{site}", encodeURIComponent(a.site.replace("{q}", q))) : a.url.replace("{q}", q);
        const link = linkBtn(href, "", "aff-btn", a.tracked);
        link.appendChild(el("strong", null, a.name));
        link.appendChild(el("span", null, t(a.kind)));
        row.appendChild(link);
      }
      box.appendChild(row);
    }

    if (affs.some((a) => a.tracked)) box.appendChild(el("p", "info-note", t("affNote")));
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
    const opts = [["all", t("allShows")], ...Object.keys(SHOWS).map((k) => [k, showLabel(k)]), ["none", t("creators")]];
    el.innerHTML = "";
    for (const [key, label] of opts) {
      const n = base.filter((v) => matchShow(v, key)).length;
      const b = chip(`${label} ${n}`, state.show === key, () => { state.show = key; renderAll(); });
      if (key !== "all" && key !== "none") b.classList.add("program");
      el.appendChild(b);
    }
    if (state.lang !== "ko" && hasSubsData()) {
      const b = chip("CC " + t("onlySubs", { lang: langLabel(state.lang) }), state.subsOnly, () => { state.subsOnly = !state.subsOnly; renderAll(); });
      b.classList.add("subs-chip");
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

  let currentVideo = null;
  function openPlayer(v) {
    currentVideo = v;
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
      const pick = pickTrack(tracks, lang);
      if (pick.track) player.setOption("captions", "track", pick.track);
      else if (lang === "ko") player.unloadModule?.("captions"); // 한국어 화면에서 한국어 자막이 없으면 끔
      showCaptionStatus(pick, tracks, lang);
    } catch (err) {
      console.warn("caption setup failed", err);
    }
  }

  // 유튜브 퍼가기 플레이어는 영상에 이미 있는 자막만 켤 수 있다 (자동 번역은 YouTube 사이트에서만 가능).
  // 선택한 언어 → 영어 순으로 고르고, 없으면 YouTube 자동 번역으로 보는 방법을 안내한다.
  function sameLang(code, lang) {
    const c = String(code || "").toLowerCase();
    if (lang === "zh-Hans") return /^zh(-(hans|cn|sg))?$/.test(c);
    if (lang === "zh-Hant") return /^zh-(hant|tw|hk|mo)$/.test(c);
    return c.split("-")[0] === lang.toLowerCase().split("-")[0];
  }
  function pickTrack(tracks, lang) {
    const human = (xs) => xs.find((tr) => tr.kind !== "asr") || xs[0];
    const mine = tracks.filter((tr) => sameLang(tr.languageCode, lang));
    if (mine.length) return { track: human(mine), exact: true };
    if (lang === "ko") return { track: null, exact: false };
    const en = tracks.filter((tr) => sameLang(tr.languageCode, "en"));
    return en.length ? { track: human(en), exact: false, fallback: "English" } : { track: null, exact: false };
  }
  function trackName(tr) {
    const name = tr.languageName || tr.displayName || tr.languageCode;
    return tr.kind === "asr" ? `${name} (auto)` : name;
  }
  function showCaptionStatus(pick, tracks, lang) {
    const box = $("captionStatus");
    box.innerHTML = "";
    const line = (text, cls) => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = text; box.appendChild(d); return d; };
    if (pick.exact) line(t("capOn", { lang: langLabel(lang) }));
    else if (pick.fallback) line(t("capFallback", { lang: langLabel(lang), fb: pick.fallback }), "cap-warn");
    else if (lang !== "ko") line(tracks.length ? t("capNoneLang", { lang: langLabel(lang) }) : t("capNone"), "cap-warn");
    if (tracks.length) line(t("capAvail", { list: tracks.map(trackName).join(", ") }), "cap-avail");
    if (!pick.exact && lang !== "ko" && tracks.length && currentVideo) {
      const a = document.createElement("a");
      a.href = `https://www.youtube.com/watch?v=${currentVideo.id}&hl=${lang}`;
      a.target = "_blank"; a.rel = "noopener"; a.className = "cap-yt";
      a.textContent = t("capYoutube", { lang: langLabel(lang) }) + " ↗";
      box.appendChild(a);
      line(t("capHow", { lang: langLabel(lang) }), "cap-how");
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
  // 블로그 글에서 ?v=영상ID 로 들어오면 그 영상을 바로 연다 (renderAll 이 주소를 다시 쓰기 전에 읽어 둠)
  const deepLink = new URLSearchParams(location.search).get("v");
  const deepVideo = deepLink && VIDEOS.find((v) => v.id === deepLink);

  renderAll();
  if (deepVideo) openPlayer(deepVideo);
})();
