import './styles/editor.css';
import { fmtDate, nowStamp, escHtml, uid } from './utils/format.js';
import { loadEditorDoc, saveEditorDoc, loadHistory, saveHistory } from './utils/storage.js';

/* ── DOM helper ───────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

/* ── Toast ───────────────────────────────────────────────────── */
let toastTimer = null;
const showToast = (msg, duration = 2800) => {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), duration);
};

/* ── Formatting helpers ────────────────────────────────────────── */
const setTxt = (pvId, value) => {
    $(pvId).textContent = value && value.trim() ? value.trim() : '—';
};

/* ── Lineamientos ─────────────────────────────────────────────── */
const addLineamiento = (text = '') => {
    const box = $('lineamientosBox');
    const idx = box.children.length + 1;

    const item = document.createElement('div');
    item.className = 'lineamiento-item';

    const num = document.createElement('div');
    num.className = 'lineamiento-num';
    num.textContent = `#${idx}`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Ej.: Se aplicará MFA a todas las cuentas administrativas.';
    input.value = text;
    input.addEventListener('input', render);

    item.appendChild(num);
    item.appendChild(input);
    box.appendChild(item);
    render();
};

const clearLineamientos = () => {
    $('lineamientosBox').innerHTML = '';
    render();
};

/* ── Versiones ────────────────────────────────────────────────── */
const addVersionRow = (row = { v: '', f: '', d: '', r: '' }) => {
    const tbody = $('versionTable').querySelector('tbody');
    const tr = document.createElement('tr');

    const mkInput = (type, val, placeholder = '') => {
        const i = document.createElement('input');
        i.type = type;
        i.value = val || '';
        if (placeholder) i.placeholder = placeholder;
        i.addEventListener('input', render);
        return i;
    };

    const tdV = document.createElement('td'); tdV.appendChild(mkInput('text', row.v));
    const tdF = document.createElement('td'); tdF.appendChild(mkInput('date', row.f));
    const tdD = document.createElement('td'); tdD.appendChild(mkInput('text', row.d, 'Ej.: Emisión inicial'));
    const tdR = document.createElement('td'); tdR.appendChild(mkInput('text', row.r, 'Ej.: Responsable SGSI'));

    tr.appendChild(tdV); tr.appendChild(tdF); tr.appendChild(tdD); tr.appendChild(tdR);
    tbody.appendChild(tr);
    render();
};

const clearVersions = () => {
    $('versionTable').querySelector('tbody').innerHTML = '';
    render();
};

/* ── Render / Preview ─────────────────────────────────────────── */
const render = () => {
    const nombre = $('nombre').value.trim();
    const codigo = $('codigo').value.trim();
    const version = $('version').value.trim();
    const aprob = $('fechaAprob').value;
    const vigor = $('fechaVigor').value;
    const resp = $('responsable').value.trim();
    const clas = $('clasificacion').value.trim();

    $('pv_title').textContent = `POLÍTICA DE ${nombre ? nombre.toUpperCase() : '__________________'}`;
    $('pv_codigo').textContent = codigo || '—';
    $('pv_version').textContent = version || '—';
    $('pv_aprob').textContent = fmtDate(aprob);
    $('pv_vigor').textContent = fmtDate(vigor);
    $('pv_resp').textContent = resp || '—';
    $('pv_clas').textContent = clas || '—';

    setTxt('pv_proposito', $('proposito').value);
    setTxt('pv_alcance', $('alcance').value);
    setTxt('pv_marco', $('marco').value);
    setTxt('pv_defs', $('definiciones').value);
    setTxt('pv_roles', $('roles').value);
    setTxt('pv_cumpl', $('cumplimiento').value);
    setTxt('pv_rev', $('revision').value);

    // Lineamientos
    const ol = $('pv_lineamientos');
    ol.innerHTML = '';
    const items = Array.from($('lineamientosBox').querySelectorAll('input'))
        .map(i => i.value.trim()).filter(Boolean);

    if (items.length === 0) {
        const li = document.createElement('li');
        li.textContent = '—';
        ol.appendChild(li);
    } else {
        items.forEach(t => {
            const li = document.createElement('li');
            li.textContent = t;
            ol.appendChild(li);
        });
    }

    // Version table preview
    const tbody = $('versionTable').querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr')).map(tr => {
        const tds = tr.querySelectorAll('td');
        return {
            v: tds[0].querySelector('input').value.trim(),
            f: tds[1].querySelector('input').value,
            d: tds[2].querySelector('input').value.trim(),
            r: tds[3].querySelector('input').value.trim(),
        };
    }).filter(r => r.v || r.f || r.d || r.r);

    const pv = $('pv_versions');
    if (rows.length === 0) {
        pv.innerHTML = `<div class="txt">—</div>`;
    } else {
        pv.innerHTML = `
      <table class="table" style="border-color:#e5e7eb;">
        <thead>
          <tr>
            <th>Versión</th><th>Fecha</th><th>Descripción del cambio</th><th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${escHtml(r.v || '—')}</td>
              <td>${escHtml(fmtDate(r.f))}</td>
              <td>${escHtml(r.d || '—')}</td>
              <td>${escHtml(r.r || '—')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    }

    $('pv_stamp').textContent = `Generado: ${nowStamp()}`;
    saveLocal();
};

/* ── Storage ──────────────────────────────────────────────────── */
const getData = () => {
    const lineRows = Array.from($('lineamientosBox').querySelectorAll('input')).map(i => i.value);
    const tbody = $('versionTable').querySelector('tbody');
    const versions = Array.from(tbody.querySelectorAll('tr')).map(tr => {
        const tds = tr.querySelectorAll('td');
        return {
            v: tds[0].querySelector('input').value,
            f: tds[1].querySelector('input').value,
            d: tds[2].querySelector('input').value,
            r: tds[3].querySelector('input').value,
        };
    });

    return {
        nombre: $('nombre').value,
        codigo: $('codigo').value,
        version: $('version').value,
        fechaAprob: $('fechaAprob').value,
        fechaVigor: $('fechaVigor').value,
        responsable: $('responsable').value,
        clasificacion: $('clasificacion').value,
        proposito: $('proposito').value,
        alcance: $('alcance').value,
        marco: $('marco').value,
        definiciones: $('definiciones').value,
        roles: $('roles').value,
        cumplimiento: $('cumplimiento').value,
        revision: $('revision').value,
        lineamientos: lineRows,
        versiones: versions,
    };
};

const setData = (d) => {
    $('nombre').value = d.nombre ?? '';
    $('codigo').value = d.codigo ?? '';
    $('version').value = d.version ?? '';
    $('fechaAprob').value = d.fechaAprob ?? '';
    $('fechaVigor').value = d.fechaVigor ?? '';
    $('responsable').value = d.responsable ?? '';
    $('clasificacion').value = d.clasificacion ?? '';
    $('proposito').value = d.proposito ?? '';
    $('alcance').value = d.alcance ?? '';
    $('marco').value = d.marco ?? '';
    $('definiciones').value = d.definiciones ?? '';
    $('roles').value = d.roles ?? '';
    $('cumplimiento').value = d.cumplimiento ?? '';
    $('revision').value = d.revision ?? '';

    clearLineamientos();
    (d.lineamientos ?? []).forEach(t => addLineamiento(t));
    if ((d.lineamientos ?? []).length === 0) addLineamiento('');

    clearVersions();
    (d.versiones ?? []).forEach(r => addVersionRow(r));
    if ((d.versiones ?? []).length === 0) {
        addVersionRow({ v: '1.0', f: '', d: 'Emisión inicial de la política', r: 'Responsable SGSI' });
    }

    render();
};

const saveLocal = () => {
    try { saveEditorDoc(getData()); } catch (_) { }
};

const loadLocal = () => {
    const d = loadEditorDoc();
    if (!d) return false;
    setData(d);
    return true;
};

/* ── Save to history ──────────────────────────────────────────── */
const saveToHistory = () => {
    const data = getData();
    const history = loadHistory();

    const today = new Date().toISOString().slice(0, 10);
    const codigo = (data.codigo || '').trim();

    const existing = history.find(p => p.codigo === codigo && codigo !== '');

    if (existing) {
        // Update existing entry
        existing.nombre = data.nombre || existing.nombre;
        existing.version = data.version || existing.version;
        existing.fecha = today;
        existing.data = data;
        saveHistory(history);
        showToast('✓ Historial actualizado correctamente.');
    } else {
        // Insert new entry at top
        history.unshift({
            id: uid(),
            nombre: data.nombre || 'Sin nombre',
            codigo: codigo || '—',
            version: data.version || '1.0',
            fecha: today,
            estado: 'Borrador',
            jsonFile: null,
            data,
        });
        saveHistory(history);
        showToast('✓ Política guardada en historial.');
    }
};

/* ── PDF export ───────────────────────────────────────────────── */
const savePdf = async () => {
    const codigo = ($('codigo').value || '').trim() || 'POL-SEG-001';
    // In new layout the preview panel IS the scrollable container
    const element = document.getElementById('preview');
    const panel = document.querySelector('.preview-panel');

    // Temporarily remove overflow restriction so html2pdf captures full height
    const origOverflow = panel ? panel.style.overflow : null;
    if (panel) {
        panel.style.overflow = 'visible';
        panel.style.height = 'auto';
        panel.classList.add('is-exporting');
    }

    const opt = {
        margin: 10,
        filename: `${codigo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
    };

    await window.html2pdf().set(opt).from(element).save(opt.filename);

    if (panel) {
        panel.style.overflow = origOverflow;
        panel.style.height = '';
        panel.classList.remove('is-exporting');
    }
};

/* ── Export / Import JSON ─────────────────────────────────────── */
const exportJSON = () => {
    const data = getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ((data.codigo?.trim() || 'politica_sgsi')) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};

const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                setData(JSON.parse(reader.result));
                showToast('✓ JSON importado correctamente.');
            } catch (_) {
                showToast('✗ JSON inválido. Verifica el archivo.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

const resetAll = () => {
    if (!confirm('¿Seguro que quieres limpiar todos los campos?')) return;
    saveEditorDoc(null);
    setData({
        lineamientos: [''],
        versiones: [{ v: '1.0', f: '', d: 'Emisión inicial de la política', r: 'Responsable SGSI' }],
    });
    showToast('Editor limpiado.');
};

/* ── Sidebar navigation ──────────────────────────────────────── */
const setupSidebar = () => {
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const sections = Array.from(navItems).map(btn => $(btn.dataset.target)).filter(Boolean);
    const panel = $('editorPanel');

    // Click → scroll section into view
    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = $(btn.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Scroll spy → highlight active nav item
    if (!panel) return;
    panel.addEventListener('scroll', () => {
        const scrollTop = panel.scrollTop + 60;
        let activeIdx = 0;
        sections.forEach((sec, i) => {
            if (sec && sec.offsetTop <= scrollTop) activeIdx = i;
        });
        navItems.forEach((btn, i) => btn.classList.toggle('active', i === activeIdx));
    }, { passive: true });
};

const wireInputs = () => {
    const ids = [
        'nombre', 'codigo', 'version', 'fechaAprob', 'fechaVigor', 'responsable', 'clasificacion',
        'proposito', 'alcance', 'marco', 'definiciones', 'roles', 'cumplimiento', 'revision',
    ];
    ids.forEach(id => $(id).addEventListener('input', render));
};

const wireButtons = () => {
    $('btnPrint').addEventListener('click', savePdf);
    $('btnExport').addEventListener('click', exportJSON);
    $('btnImport').addEventListener('click', importJSON);
    $('btnReset').addEventListener('click', resetAll);
    $('btnSaveHistory').addEventListener('click', saveToHistory);

    $('btnAddLineamiento').addEventListener('click', () => addLineamiento(''));
    $('btnClearLineamientos').addEventListener('click', clearLineamientos);
    $('btnAddVersion').addEventListener('click', () => addVersionRow({ v: '', f: '', d: '', r: '' }));
    $('btnClearVersions').addEventListener('click', clearVersions);

    const mobileJump = $('btnMobileJump');
    if (mobileJump) {
        mobileJump.addEventListener('click', () => {
            $('preview').scrollIntoView({ behavior: 'smooth' });
        });
    }
};

/* ── Init ─────────────────────────────────────────────────────── */
const init = () => {
    wireInputs();
    wireButtons();
    setupSidebar();

    const loaded = loadLocal();
    if (!loaded) {
        addLineamiento('');
        addVersionRow({ v: '1.0', f: '', d: 'Emisión inicial de la política', r: 'Responsable SGSI' });
        render();
    }
};

document.addEventListener('DOMContentLoaded', init);
