/* ========================================================
   RED'S ACADEMY — shared front-end behavior
   ======================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* mobile nav toggle */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* highlight current page in nav */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if(a.getAttribute('href') === here) a.classList.add('active');
  });

  /* wait for the shared database before rendering any data-driven content */
  await raReady;

  /* ---------- register modal ---------- */
  const settings = raGet('settings');
  const backdrop = document.getElementById('register-modal');
  const openers = document.querySelectorAll('[data-open-register]');
  const closer = document.getElementById('modal-close');
  const headshotLink = document.getElementById('path-headshot');
  const esportsLink = document.getElementById('path-esports');

  if(headshotLink) headshotLink.href = normalizeUrl(settings.telegramHeadshot);
  if(esportsLink) esportsLink.href = normalizeUrl(settings.telegramEsports);

  function openModal(){
    if(backdrop){ backdrop.classList.add('open'); document.body.style.overflow='hidden'; }
  }
  function closeModal(){
    if(backdrop){ backdrop.classList.remove('open'); document.body.style.overflow=''; }
  }
  openers.forEach(btn => btn.addEventListener('click', openModal));
  if(closer) closer.addEventListener('click', closeModal);
  if(backdrop) backdrop.addEventListener('click', e => { if(e.target === backdrop) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

  /* ---------- contact page: pull settings + telegram links ---------- */
  document.querySelectorAll('[data-fill="contactEmail"]').forEach(el => el.textContent = settings.contactEmail);
  document.querySelectorAll('[data-fill="contactEmail-href"]').forEach(el => el.href = 'mailto:' + settings.contactEmail);
  document.querySelectorAll('[data-fill="contactLocation"]').forEach(el => el.textContent = settings.contactLocation);
  document.querySelectorAll('[data-fill="telegramHeadshot"]').forEach(el => { el.href = normalizeUrl(settings.telegramHeadshot); el.textContent = settings.telegramHeadshot.replace('https://',''); });
  document.querySelectorAll('[data-fill="telegramEsports"]').forEach(el => { el.href = normalizeUrl(settings.telegramEsports); el.textContent = settings.telegramEsports.replace('https://',''); });

  /* ---------- about page ---------- */
  document.querySelectorAll('[data-fill="aboutIntro"]').forEach(el => el.textContent = settings.aboutIntro);
  document.querySelectorAll('[data-fill="aboutBody"]').forEach(el => el.textContent = settings.aboutBody);

  /* ---------- training page ---------- */
  const weekList = document.getElementById('week-list');
  if(weekList){
    const training = raGet('training').slice().sort((a,b) => a.week - b.week);
    weekList.innerHTML = training.map(w => `
      <div class="week">
        <div class="num">${String(w.week).padStart(2,'0')}</div>
        <div>
          <b>Week ${w.week} — ${escapeHtml(w.title)}</b>
          <p>${escapeHtml(w.desc)}</p>
          <div class="focus">${w.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
  }

  /* ---------- leaderboard page ---------- */
  const lbBody = document.getElementById('leaderboard-body');
  if(lbBody){
    const lb = raGet('leaderboard').slice().sort((a,b) => a.rank - b.rank);
    lbBody.innerHTML = lb.length ? lb.map(p => `
      <tr>
        <td class="rank-cell ${p.rank<=3 ? 'rank-'+p.rank : ''}">#${p.rank}</td>
        <td>${escapeHtml(p.name)}</td>
        <td><span class="badge ${p.track==='Headshot' ? 'badge-headshot':'badge-esports'}">${escapeHtml(p.track)}</span></td>
        <td>${p.wins}</td>
        <td>${p.points.toLocaleString()}</td>
      </tr>
    `).join('') : `<tr><td colspan="5"><div class="empty"><b>No rankings yet</b>Check back once the current batch starts competing.</div></td></tr>`;
  }

  /* ---------- graduates page ---------- */
  const gradGrid = document.getElementById('grad-grid');
  if(gradGrid){
    const grads = raGet('graduates');
    gradGrid.innerHTML = grads.length ? grads.map(g => `
      <div class="grad-card">
        <div class="avatar">${escapeHtml(initials(g.name))}</div>
        <b>${escapeHtml(g.name)}</b>
        <div class="batch">${escapeHtml(g.batch)}</div>
        <div class="achieve">${escapeHtml(g.achievement)}</div>
      </div>
    `).join('') : `<div class="empty"><b>No graduates listed yet</b>The first batch is still in training.</div>`;
  }

  /* ---------- announcements page ---------- */
  const annList = document.getElementById('ann-list');
  if(annList){
    const anns = raGet('announcements').slice().sort((a,b) => new Date(b.date) - new Date(a.date));
    annList.innerHTML = anns.length ? anns.map(a => `
      <div class="ann-item">
        <div class="date">${formatDate(a.date)}</div>
        <div>
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.body)}</p>
        </div>
      </div>
    `).join('') : `<div class="empty"><b>No announcements yet</b>Nothing posted so far — check back soon.</div>`;
  }

});

function normalizeUrl(url){
  const trimmed = String(url ?? '').trim();
  if(!trimmed) return '#';
  if(/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed.replace(/^\/+/, '');
}
function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function initials(name){
  return String(name).trim().split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase();
}
function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
