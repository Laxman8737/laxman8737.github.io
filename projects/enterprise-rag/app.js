const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
$('#theme').onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).getPropertyValue('--bg').trim()=='#060010';r.dataset.theme=d?'light':'dark'};
let LIVE=false;
(location.protocol=='file:'?Promise.reject():fetch('api/health')).then(r=>r.ok&&r.json()).then(j=>{LIVE=!!j&&j.status=='ok';ban()}).catch(ban);
function ban(){$('#banner').innerHTML=LIVE?'<div class="tag ok">● live API connected</div>':'<div class="banner">Recorded mode: showing real outputs captured from the pipeline. Run <code>docker compose up</code> (see GitHub) for the live API and free-text questions.</div>';if(!LIVE){$('#q').readOnly=true}}
DATA.demo.forEach((d,i)=>{const b=document.createElement('button');b.className='btn sm';b.textContent=d.label;b.onclick=()=>{$('#q').value=d.query;$('#role').value=d.roles[0];$('#mode').value=d.mode;show(d.result)};$('#presets').appendChild(b)});
function show(r){const u=r.usage||{};$('#out').innerHTML=`<div class="ans ${r.abstained?'warn':''}">${esc(r.answer)}</div>
<div>${r.cached?'<span class="tag">cached</span>':''}<span class="tag">${r.latency_ms} ms</span><span class="tag">${u.tokens_in||0}→${u.tokens_out||0} tokens</span><span class="tag">$${u.usd||0}</span><span class="tag">${esc(r.mode)}</span>${(r.flags||[]).map(f=>`<span class="tag bad">⚠ ${esc(f)}</span>`).join('')}</div>
${r.sources.map(s=>`<div class="src"><b>[${s.n}]</b> ${esc(s.title)} <span class="muted">· score ${s.score} · ${esc(s.chunk_id)}</span><div>${esc(s.text)}</div></div>`).join('')}`}
$('#ask').onclick=async()=>{const q=$('#q').value.trim();if(q.length<3)return;
 if(!LIVE){const m=DATA.demo.find(d=>d.query==q&&d.roles[0]==$('#role').value);return m?show(m.result):($('#out').innerHTML='<div class="banner">Recorded mode: pick one of the preset questions above.</div>')}
 try{const r=await fetch('api/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:q,roles:[$('#role').value],mode:$('#mode').value})});
 if(!r.ok)throw new Error((await r.json()).detail||r.status);show(await r.json())}catch(e){$('#out').innerHTML='<div class="banner">Error: '+esc(e.message)+'</div>'}};
