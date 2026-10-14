// letsvisitkorea.com 트래픽 관리자 페이지 (Cloudflare Worker)
// - Cloudflare Web Analytics 데이터를 GraphQL API 로 서버에서 조회해 대시보드로 보여 준다. API 토큰은 브라우저로 나가지 않는다.
// - Cloudflare Access(로그인)로 보호한다. Access 가 붙인 JWT 를 이 Worker 가 다시 검증하고,
//   ACCESS_TEAM_DOMAIN·ACCESS_AUD 가 설정되지 않았으면 아무것도 보여 주지 않는다 (fail closed).
// 환경 변수: CF_ACCOUNT_ID, SITE_HOST (vars) / CF_ANALYTICS_TOKEN (secret) / ACCESS_TEAM_DOMAIN, ACCESS_AUD (vars)
import DASHBOARD from "./dashboard.html";

const DAY = 864e5;
const RANGES = { 1: "1d", 7: "7d", 30: "30d", 90: "90d" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const auth = await checkAccess(request, env);
    if (!auth.ok) return new Response(auth.message, { status: auth.status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });

    if (url.pathname === "/api/stats") {
      const days = RANGES[url.searchParams.get("days")] ? Number(url.searchParams.get("days")) : 7;
      try {
        return json(await stats(env, days));
      } catch (e) {
        return json({ error: String(e.message || e).slice(0, 500) }, 502);
      }
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(DASHBOARD, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex", "x-frame-options": "DENY", "referrer-policy": "no-referrer" } });
    }
    return new Response("Not found", { status: 404 });
  },
};

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// ---------- Cloudflare Access JWT 검증 ----------
let certsCache = { at: 0, keys: [] };
const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

async function checkAccess(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const aud = env.ACCESS_AUD || "";
  if (!team || !aud || team === "unset" || aud === "unset") return { ok: false, status: 503, message: "관리자 페이지 보호(Cloudflare Access)가 아직 설정되지 않았어요. ACCESS_TEAM_DOMAIN, ACCESS_AUD 를 설정하세요." };
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return { ok: false, status: 403, message: "Forbidden" };
  try {
    const [h, p, s] = token.split(".");
    const header = JSON.parse(new TextDecoder().decode(b64url(h)));
    const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
    if (Date.now() - certsCache.at > 3600e3 || !certsCache.keys.some((k) => k.kid === header.kid)) {
      const res = await fetch(`https://${team}/cdn-cgi/access/certs`);
      certsCache = { at: Date.now(), keys: (await res.json()).keys || [] };
    }
    const jwk = certsCache.keys.find((k) => k.kid === header.kid);
    if (!jwk) throw new Error("unknown key");
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64url(s), new TextEncoder().encode(`${h}.${p}`));
    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!valid || !auds.includes(aud) || payload.iss !== `https://${team}` || payload.exp * 1000 < Date.now()) throw new Error("invalid token");
    return { ok: true, email: payload.email };
  } catch {
    return { ok: false, status: 403, message: "Forbidden" };
  }
}

// ---------- Web Analytics 조회 ----------
async function gql(env, query, variables) {
  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) throw new Error(body.errors?.map((e) => e.message).join("; ") || `HTTP ${res.status}`);
  return body.data.viewer.accounts[0] || {};
}

const group = (alias, dims, limit, order) =>
  `${alias}: rumPageloadEventsAdaptiveGroups(filter: $f, limit: ${limit}, orderBy: [${order}]) { count sum { visits } dimensions { ${dims} } }`;

async function stats(env, days) {
  if (!env.CF_ACCOUNT_ID || !env.CF_ANALYTICS_TOKEN) throw new Error("CF_ACCOUNT_ID / CF_ANALYTICS_TOKEN 이 설정되지 않았어요");
  const host = env.SITE_HOST || "letsvisitkorea.com";
  const end = new Date();
  const start = new Date(end - days * DAY);
  const prevStart = new Date(start - days * DAY);
  const filter = (a, b) => ({ AND: [{ datetime_geq: a.toISOString(), datetime_lt: b.toISOString() }, { requestHost: host }, { bot: 0 }] });
  const timeDim = days === 1 ? "datetimeHour" : "date";
  const query = `query ($account: String!, $f: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject, $p: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject) {
    viewer { accounts(filter: { accountTag: $account }) {
      total: rumPageloadEventsAdaptiveGroups(filter: $f, limit: 1) { count sum { visits } }
      prev: rumPageloadEventsAdaptiveGroups(filter: $p, limit: 1) { count sum { visits } }
      ${group("series", timeDim, 5000, `${timeDim}_ASC`)}
      ${group("pages", "requestPath", 1000, "sum_visits_DESC")}
      ${group("countries", "countryName", 20, "sum_visits_DESC")}
      ${group("referers", "refererHost", 20, "sum_visits_DESC")}
      ${group("devices", "deviceType", 10, "sum_visits_DESC")}
    } }
  }`;
  const d = await gql(env, query, { account: env.CF_ACCOUNT_ID, f: filter(start, end), p: filter(prevStart, start) });
  const row = (r, key) => ({ key: r.dimensions?.[key] ?? "", visits: r.sum?.visits ?? 0, views: r.count ?? 0 });
  return {
    host, days, from: start.toISOString(), to: end.toISOString(), hourly: days === 1,
    total: { visits: d.total?.[0]?.sum?.visits ?? 0, views: d.total?.[0]?.count ?? 0 },
    prev: { visits: d.prev?.[0]?.sum?.visits ?? 0, views: d.prev?.[0]?.count ?? 0 },
    series: (d.series || []).map((r) => row(r, timeDim)),
    pages: (d.pages || []).map((r) => row(r, "requestPath")),
    countries: (d.countries || []).map((r) => row(r, "countryName")),
    referers: (d.referers || []).map((r) => row(r, "refererHost")),
    devices: (d.devices || []).map((r) => row(r, "deviceType")),
  };
}
