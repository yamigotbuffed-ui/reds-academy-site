/* ========================================================
   RED'S ACADEMY — admin dashboard
   ======================================================== */

const SESSION_KEY = 'ra_admin_session';

document.addEventListener('DOMContentLoaded', async () => {

  await raReady;

  const loginScreen = document.getElementById('admin-login');
  const dashboard = document.getElementById('admin-dashboard');
  const passInput = document.getElementById('admin-pass');
  const loginBtn = document.getElementById('admin-login-btn');
  const loginError = document.getElementById('admin-login-error');

  function showDashboard(){
    loginScreen.style.display = 'none';
    dashboard.style.display = 'grid';
    goTo('overview');
  }
  function tryLogin(){
    const settings = raGet('settings');
    if(passInput.value === settings.adminPassword){
      sessionStorage.setItem(SESSION_KEY, 'ok');
      loginError.classList.remove('show');
      showDashboard();
    }else{
      loginError.classList.add('show');
    }
  }
  loginBtn.addEventListener('click', tryLogin);
  passInput.addEventListener('keydown', e => { if(e.key === 'Enter') tryLogin(); });

  if(sessionStorage.getItem(SESSION_KEY) === 'ok') showDashboard();

  document.getElementById('admin-logout').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });
  document.getElementById('admin-view-site').addEventListener('click', () => window.open('index.html','_blank'));

  document.getElementById('admin-nav').addEventListener('click', e => {
    const btn = e.target.closest('button[data-section]');
    if(!btn) return;
    document.querySelectorAll('#admin-nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    goTo(btn.dataset.section);
  });

  function goTo(section){
    const main = document.getElementById('admin-main');
    const renderers = {
      overview: renderOverview,
      leaderboard: renderLeaderboardAdmin,
      graduates: renderGraduatesAdmin,
      announcements: renderAnnouncementsAdmin,
      training: renderTrainingAdmin,
      settings: renderSettingsAdmin,
    };
    main.innerHTML = renderers[section] ? renderers[section]() : '';
    wireSection(section);
  }

  /* ---------- overview ---------- */
  function renderOverview(){
    const lb = raGet('leaderboard'), gr = raGet('graduates'), an = raGet('announcements');
    return `
      <div class="admin-head">
        <div><h1>Overview</h1><p>Everything below feeds the public site instantly — no rebuild needed.</p></div>
      </div>
      <div class="stat-row">
        <div class="stat-card"><b>${lb.length}</b><span>Leaderboard entries</span></div>
        <div class="stat-card"><b>${gr.length}</b><span>Graduates listed</span></div>
        <div class="stat-card"><b>${an.length}</b><span>Announcements posted</span></div>
        <div class="stat-card"><b>4</b><span>Training weeks</span></div>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-head"><h3>Where to go</h3></div>
        <div style="padding:20px;color:var(--ash);font-size:14.5px;line-height:1.8;">
          Use <b style="color:var(--bone);">Leaderboard</b> and <b style="color:var(--bone);">Graduates</b> to update rankings and completed batches.
          <b style="color:var(--bone);">Announcements</b> posts to the public Announcements page. <b style="color:var(--bone);">Training</b> edits the four-week program text.
          <b style="color:var(--bone);">Settings</b> holds your Telegram links, contact info, About page copy, and this dashboard's password.
        </div>
      </div>
    `;
  }

  /* ---------- leaderboard ---------- */
  function renderLeaderboardAdmin(){
    const lb = raGet('leaderboard').slice().sort((a,b)=>a.rank-b.rank);
    return `
      <div class="admin-head">
        <div><h1>Leaderboard</h1><p>Shown publicly, sorted by rank.</p></div>
        <button class="btn btn-primary btn-sm" id="add-leaderboard">+ Add entry</button>
      </div>
      <div class="admin-table-wrap">
        <table>
          <thead><tr><th>Rank</th><th>Name</th><th>Track</th><th>Wins</th><th>Points</th><th></th></tr></thead>
          <tbody>
            ${lb.length ? lb.map(p => `
              <tr>
                <td class="rank-cell">#${p.rank}</td>
                <td>${escapeHtml(p.name)}</td>
                <td><span class="badge ${p.track==='Headshot'?'badge-headshot':'badge-esports'}">${escapeHtml(p.track)}</span></td>
                <td>${p.wins}</td>
                <td>${p.points}</td>
                <td><div class="row-actions">
                  <button class="icon-btn" data-edit="${p.id}">Edit</button>
                  <button class="icon-btn danger" data-del="${p.id}">Delete</button>
                </div></td>
              </tr>
            `).join('') : `<tr><td colspan="6"><div class="empty"><b>Nothing here yet</b>Add your first entry.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------- graduates ---------- */
  function renderGraduatesAdmin(){
    const gr = raGet('graduates');
    return `
      <div class="admin-head">
        <div><h1>Graduates</h1><p>Shown publicly on the Graduates page.</p></div>
        <button class="btn btn-primary btn-sm" id="add-graduates">+ Add graduate</button>
      </div>
      <div class="admin-table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Batch</th><th>Achievement</th><th></th></tr></thead>
          <tbody>
            ${gr.length ? gr.map(g => `
              <tr>
                <td>${escapeHtml(g.name)}</td>
                <td>${escapeHtml(g.batch)}</td>
                <td>${escapeHtml(g.achievement)}</td>
                <td><div class="row-actions">
                  <button class="icon-btn" data-edit="${g.id}">Edit</button>
                  <button class="icon-btn danger" data-del="${g.id}">Delete</button>
                </div></td>
              </tr>
            `).join('') : `<tr><td colspan="4"><div class="empty"><b>No graduates yet</b>Add the first one.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------- announcements ---------- */
  function renderAnnouncementsAdmin(){
    const an = raGet('announcements').slice().sort((a,b)=> new Date(b.date)-new Date(a.date));
    return `
      <div class="admin-head">
        <div><h1>Announcements</h1><p>Newest posts first on the public page.</p></div>
        <button class="btn btn-primary btn-sm" id="add-announcements">+ New announcement</button>
      </div>
      <div class="admin-table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Title</th><th></th></tr></thead>
          <tbody>
            ${an.length ? an.map(a => `
              <tr>
                <td>${formatDate(a.date)}</td>
                <td>${escapeHtml(a.title)}</td>
                <td><div class="row-actions">
                  <button class="icon-btn" data-edit="${a.id}">Edit</button>
                  <button class="icon-btn danger" data-del="${a.id}">Delete</button>
                </div></td>
              </tr>
            `).join('') : `<tr><td colspan="3"><div class="empty"><b>Nothing posted yet</b>Write your first announcement.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------- training ---------- */
  function renderTrainingAdmin(){
    const tr = raGet('training').slice().sort((a,b)=>a.week-b.week);
    return `
      <div class="admin-head">
        <div><h1>Training</h1><p>The program is fixed at four weeks — edit what each week covers.</p></div>
      </div>
      <div class="admin-table-wrap">
        <table>
          <thead><tr><th>Week</th><th>Title</th><th>Focus tags</th><th></th></tr></thead>
          <tbody>
            ${tr.map(w => `
              <tr>
                <td class="rank-cell">${String(w.week).padStart(2,'0')}</td>
                <td>${escapeHtml(w.title)}</td>
                <td>${w.tags.map(t=>`<span class="badge" style="margin-right:4px;">${escapeHtml(t)}</span>`).join('')}</td>
                <td><div class="row-actions"><button class="icon-btn" data-edit="${w.week}">Edit</button></div></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ---------- settings ---------- */
  function renderSettingsAdmin(){
    const s = raGet('settings');
    return `
      <div class="admin-head"><div><h1>Settings</h1><p>Telegram links, contact info, About page copy, and dashboard password.</p></div></div>
      <div class="settings-grid">
        <div class="settings-card">
          <h3>Registration — Telegram links</h3>
          <div class="form-field"><label>Headshot track link</label><input id="s-telegramHeadshot" value="${escAttr(s.telegramHeadshot)}"></div>
          <div class="form-field"><label>Esports track link</label><input id="s-telegramEsports" value="${escAttr(s.telegramEsports)}"></div>
        </div>
        <div class="settings-card">
          <h3>Contact page</h3>
          <div class="form-field"><label>Contact email</label><input id="s-contactEmail" value="${escAttr(s.contactEmail)}"></div>
          <div class="form-field"><label>Location line</label><input id="s-contactLocation" value="${escAttr(s.contactLocation)}"></div>
        </div>
        <div class="settings-card" style="grid-column:1/-1;">
          <h3>About page</h3>
          <div class="form-field"><label>Intro (under the heading)</label><textarea id="s-aboutIntro">${escapeHtml(s.aboutIntro)}</textarea></div>
          <div class="form-field"><label>Main paragraph</label><textarea id="s-aboutBody">${escapeHtml(s.aboutBody)}</textarea></div>
        </div>
        <div class="settings-card">
          <h3>Dashboard password</h3>
          <div class="form-field"><label>New password (leave blank to keep current)</label><input id="s-adminPassword" type="text" placeholder="••••••••"></div>
        </div>
        <div class="settings-card">
          <h3>About this dashboard</h3>
          <p style="color:var(--ash);font-size:13.5px;">Edits here save to a shared database — every visitor, on any device, sees the same up-to-date information.</p>
        </div>
      </div>
      <div class="save-bar"><button class="btn btn-primary" id="save-settings">Save changes</button></div>
    `;
  }

  /* ---------- wiring per section ---------- */
  function wireSection(section){
    if(section === 'leaderboard') wireCrud('leaderboard', leaderboardFields, {rank:1,name:'',track:'Headshot',wins:0,points:0});
    if(section === 'graduates') wireCrud('graduates', graduateFields, {name:'',batch:'',achievement:''});
    if(section === 'announcements') wireCrud('announcements', announcementFields, {date:new Date().toISOString().slice(0,10),title:'',body:''});
    if(section === 'training') wireTraining();
    if(section === 'settings') wireSettings();
  }

  /* ---------- generic CRUD wiring (leaderboard / graduates / announcements) ---------- */
  const leaderboardFields = [
    {key:'rank', label:'Rank', type:'number'},
    {key:'name', label:'Player / team name', type:'text'},
    {key:'track', label:'Track', type:'select', options:['Headshot','Esports']},
    {key:'wins', label:'Wins', type:'number'},
    {key:'points', label:'Points', type:'number'},
  ];
  const graduateFields = [
    {key:'name', label:'Name', type:'text'},
    {key:'batch', label:'Batch / track', type:'text'},
    {key:'achievement', label:'Achievement', type:'text'},
  ];
  const announcementFields = [
    {key:'date', label:'Date', type:'date'},
    {key:'title', label:'Title', type:'text'},
    {key:'body', label:'Body', type:'textarea'},
  ];

  function wireCrud(storeName, fields, blankItem){
    const main = document.getElementById('admin-main');
    main.querySelector(`#add-${storeName}`)?.addEventListener('click', () => {
      openFormModal(`Add ${singular(storeName)}`, fields, blankItem, (values) => {
        const list = raGet(storeName);
        values.id = raNextId(list);
        coerceNumbers(values, fields);
        list.push(values);
        raSet(storeName, list);
        toast('Added.');
        goTo(storeName);
      });
    });
    main.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.edit);
        const list = raGet(storeName);
        const item = list.find(i => i.id === id);
        openFormModal(`Edit ${singular(storeName)}`, fields, item, (values) => {
          coerceNumbers(values, fields);
          Object.assign(item, values);
          raSet(storeName, list);
          toast('Saved.');
          goTo(storeName);
        });
      });
    });
    main.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        if(!confirm('Delete this entry? This can\'t be undone.')) return;
        const id = Number(btn.dataset.del);
        const list = raGet(storeName).filter(i => i.id !== id);
        raSet(storeName, list);
        toast('Deleted.');
        goTo(storeName);
      });
    });
  }
  function coerceNumbers(values, fields){
    fields.forEach(f => { if(f.type === 'number') values[f.key] = Number(values[f.key]) || 0; });
  }
  function singular(name){
    return {leaderboard:'leaderboard entry', graduates:'graduate', announcements:'announcement'}[name] || name;
  }

  /* ---------- training wiring (fixed 4 rows, edit only) ---------- */
  const trainingFields = [
    {key:'title', label:'Week title', type:'text'},
    {key:'desc', label:'Description', type:'textarea'},
    {key:'tags', label:'Focus tags (comma-separated)', type:'text'},
  ];
  function wireTraining(){
    const main = document.getElementById('admin-main');
    main.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const week = Number(btn.dataset.edit);
        const list = raGet('training');
        const item = list.find(w => w.week === week);
        const formValues = {title:item.title, desc:item.desc, tags:item.tags.join(', ')};
        openFormModal(`Edit week ${week}`, trainingFields, formValues, (values) => {
          item.title = values.title;
          item.desc = values.desc;
          item.tags = values.tags.split(',').map(t=>t.trim()).filter(Boolean);
          raSet('training', list);
          toast('Saved.');
          goTo('training');
        });
      });
    });
  }

  /* ---------- settings wiring ---------- */
  function wireSettings(){
    document.getElementById('save-settings').addEventListener('click', () => {
      const s = raGet('settings');
      s.telegramHeadshot = document.getElementById('s-telegramHeadshot').value.trim();
      s.telegramEsports = document.getElementById('s-telegramEsports').value.trim();
      s.contactEmail = document.getElementById('s-contactEmail').value.trim();
      s.contactLocation = document.getElementById('s-contactLocation').value.trim();
      s.aboutIntro = document.getElementById('s-aboutIntro').value.trim();
      s.aboutBody = document.getElementById('s-aboutBody').value.trim();
      const newPass = document.getElementById('s-adminPassword').value.trim();
      if(newPass) s.adminPassword = newPass;
      raSet('settings', s);
      toast('Settings saved.');
      goTo('settings');
    });
  }

  /* ---------- generic form modal ---------- */
  const formBackdrop = document.getElementById('form-modal');
  const formTitle = document.getElementById('form-modal-title');
  const formBody = document.getElementById('form-modal-body');
  document.getElementById('form-modal-close').addEventListener('click', closeFormModal);
  document.getElementById('form-modal-cancel').addEventListener('click', closeFormModal);
  formBackdrop.addEventListener('click', e => { if(e.target === formBackdrop) closeFormModal(); });

  function openFormModal(title, fields, values, onSave){
    formTitle.textContent = title;
    formBody.innerHTML = fields.map(f => {
      const val = escAttr(values[f.key] ?? '');
      if(f.type === 'textarea') return `<div class="form-field"><label>${f.label}</label><textarea id="ff-${f.key}">${escapeHtml(values[f.key] ?? '')}</textarea></div>`;
      if(f.type === 'select') return `<div class="form-field"><label>${f.label}</label><select id="ff-${f.key}" style="width:100%;padding:12px 14px;background:var(--black);border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--bone);">${f.options.map(o=>`<option value="${o}" ${o===values[f.key]?'selected':''}>${o}</option>`).join('')}</select></div>`;
      return `<div class="form-field"><label>${f.label}</label><input id="ff-${f.key}" type="${f.type}" value="${val}"></div>`;
    }).join('');
    formBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    formBody.onsubmit = (e) => {
      e.preventDefault();
      const out = {};
      fields.forEach(f => out[f.key] = document.getElementById(`ff-${f.key}`).value);
      onSave(out);
      closeFormModal();
    };
  }
  function closeFormModal(){
    formBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

});

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function escAttr(str){ return escapeHtml(str); }
function formatDate(iso){
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
