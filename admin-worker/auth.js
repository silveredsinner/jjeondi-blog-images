const COOKIE = '__Host-lvk_admin';
const TTL = 8 * 60 * 60;
const enc = new TextEncoder();
const encode = bytes => btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const digest = async s => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const equal = (a,b) => { let d=a.length^b.length; for(let i=0;i<a.length;i++)d|=a[i]^(b[i]||0); return d===0; };
const headers = {'cache-control':'no-store','x-robots-tag':'noindex','x-frame-options':'DENY','referrer-policy':'same-origin','content-type':'text/html; charset=utf-8'};
const clear = `${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`;
const ready = env => typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 20 && !!env.ADMIN_EMAIL;
async function sign(payload,env) {
  const key=await crypto.subtle.importKey('raw',enc.encode('lvk-session-v1:'+env.ADMIN_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(payload))));
}
export async function checkSession(request,env) {
  if(!ready(env))return {ok:false,status:503,message:'관리자 비밀번호 설정을 기다리고 있습니다.'};
  const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='));
  if(!cookie)return {ok:false,status:401,message:'로그인이 필요합니다.'};
  try {
    const token=cookie.slice(COOKIE.length+1); const [payload,sig,...extra]=token.split('.');
    if(extra.length||!payload||!sig||token.length>2048)throw Error();
    if(!equal(enc.encode(sig),enc.encode(await sign(payload,env))))throw Error();
    const data=JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/')));
    const now=Math.floor(Date.now()/1000);
    if(data.email!==env.ADMIN_EMAIL.toLowerCase()||!Number.isInteger(data.exp)||data.exp<=now||data.exp>now+TTL)throw Error();
    return {ok:true,email:data.email};
  } catch {return {ok:false,status:401,message:'로그인이 만료되었습니다.'};}
}
export function loginPage(message='') {
  const safe=message.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Let's Visit Korea 관리자 로그인</title><style>body{margin:0;background:#f5f5f1;color:#172b34;font:16px/1.6 system-ui}main{max-width:380px;margin:12vh auto;padding:32px;background:white;border-radius:16px;box-shadow:0 12px 40px #172b3410}h1{font-size:24px}label{display:block;margin-top:18px}input,button{box-sizing:border-box;width:100%;font:inherit;padding:12px;border:1px solid #ccc;border-radius:8px}button{background:#15565a;color:white;margin-top:24px;cursor:pointer}.error{color:#a32924}small{color:#667}</style><main><small>LET'S VISIT KOREA</small><h1>방문 통계 관리자</h1><p>관리자 전용 이메일과 비밀번호로 로그인하세요.</p><p class="error" role="alert">${safe}</p><form method="post" action="/login"><label for="email">이메일</label><input id="email" name="email" type="email" autocomplete="username" required><label for="password">관리자 비밀번호</label><input id="password" name="password" type="password" autocomplete="current-password" required><button>로그인</button></form><p><small>8시간 후 자동 로그아웃됩니다.</small></p></main></html>`;
}
export async function authRoute(request,env) {
  const url=new URL(request.url);
  if(!['/login','/logout'].includes(url.pathname))return null;
  if(request.method==='GET'&&url.pathname==='/login')return new Response(loginPage(),{headers});
  if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'POST'}});
  if(request.headers.get('origin')!==url.origin)return new Response('Forbidden',{status:403,headers});
  if(url.pathname==='/logout')return new Response(null,{status:303,headers:{...headers,location:'/login','set-cookie':clear}});
  if(!ready(env))return new Response(loginPage('관리자 비밀번호 설정을 기다리고 있습니다.'),{status:503,headers});
  if(!env.LOGIN_LIMITER)return new Response('Login temporarily unavailable',{status:503,headers});
  const limit=await env.LOGIN_LIMITER.limit({key:request.headers.get('cf-connecting-ip')||'unknown'});
  if(!limit.success)return new Response(loginPage('로그인 시도가 많습니다. 1분 후 다시 시도해주세요.'),{status:429,headers:{...headers,'retry-after':'60'}});
  if(Number(request.headers.get('content-length')||0)>4096)return new Response('Request too large',{status:413,headers});
  const body=await request.text();if(body.length>4096)return new Response('Request too large',{status:413,headers});
  const form=new URLSearchParams(body);const email=(form.get('email')||'').trim().toLowerCase();
  const valid=equal(await digest(form.get('password')||''),await digest(env.ADMIN_PASSWORD));
  if(!valid||email!==env.ADMIN_EMAIL.toLowerCase())return new Response(loginPage('이메일 또는 비밀번호를 확인해주세요.'),{status:401,headers});
  const payload=encode(enc.encode(JSON.stringify({email,exp:Math.floor(Date.now()/1000)+TTL})));
  const token=payload+'.'+await sign(payload,env);
  return new Response(null,{status:303,headers:{...headers,location:'/','set-cookie':`${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${TTL}`}});
}
