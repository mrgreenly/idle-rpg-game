// Create admin panel HTML
export function createAdminPanel() {
  let panel = document.getElementById('admin-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'admin-panel';
    panel.style.position = 'fixed';
    panel.style.top = '60px';
    panel.style.right = '30px';
    panel.style.background = 'rgba(30,30,30,0.98)';
    panel.style.border = '2px solid #FFD700';
    panel.style.borderRadius = '10px';
    panel.style.padding = '18px 22px 18px 22px';
    panel.style.zIndex = 9999;
    panel.style.display = 'none';
    panel.style.color = '#fff';
    panel.style.minWidth = '220px';
    panel.innerHTML = `
      <h3 style="margin-top:0;margin-bottom:10px;color:#FFD700;">Admin Panel</h3>
      <div style="margin-bottom:10px;">
        <label>Give Levels: <input id="admin-levels" type="number" min="1" value="1" style="width:50px;"></label>
        <button id="admin-give-levels">Give</button>
      </div>
      <div style="margin-bottom:10px;">
        <label>Give Gold: <input id="admin-gold" type="number" min="1" value="1000" style="width:70px;"></label>
        <button id="admin-give-gold">Give</button>
      </div>
      <div style="margin-bottom:10px;">
        <label><input id="admin-guaranteed-drops" type="checkbox"> Guaranteed Drops</label>
      </div>
      <button id="admin-close">Close</button>
    `;
    document.body.appendChild(panel);
  }
  return panel;
}

export function showAdminPanel() {
  const panel = createAdminPanel();
  panel.style.display = 'block';
  return true;
}

export function hideAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.style.display = 'none';
  return false;
}