// letsvisitkorea.com 트래픽 관리자 페이지 (Cloudflare Worker)
// - Cloudflare Web Analytics 데이터를 GraphQL API 로 서버에서 조회해 대시보드로 보여 준다. API 토큰은 브라우저로 나가지 않는다.
// - 전용 이메일/비밀번호와 HttpOnly 서명 쿠키로 보호한다. 비밀번호 미설정 시 차단한다.
import DASHBOARD from "./dashboard.html";
import {checkSession, authRoute, loginPage} from './auth.js';

const DAY = 864e5;
const RANGES = { 1: "1d", 7: "7d", 30: "30d", 90: "90d" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const authResponse = await authRoute(request, env);
    if (authResponse) return authResponse;
    const auth = await checkSession(request, env);
    if (!auth.ok) {
      if (url.pathname.startsWith('/api/')) return json({error:auth.message},auth.status);
      return new Response(loginPage(auth.status===503 ? auth.message : ''), {status:auth.status===503?503:200,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex','x-frame-options':'DENY'}});
    }

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
