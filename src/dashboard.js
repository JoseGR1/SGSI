import './styles/dashboard.css';
import { fmtDate, escHtml, uid } from './utils/format.js';
import { loadHistory, saveHistory, saveEditorDoc, HISTORY_KEY } from './utils/storage.js';
import { SEED_POLICIES } from './data/seed.js';

/* ── Seed history if empty ───────────────────────────────────── */
const seedIfEmpty = () => {
    const existing = loadHistory();
    if (existing.length === 0) {
        saveHistory(SEED_POLICIES);
    }
};

/* ── State ────────────────────────────────────────────────────── */
let policies = [];
let sortAsc = false; // newest first by default

const load = () => {
    seedIfEmpty();
    policies = loadHistory();
};

/* ── DOM helpers ──────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);

let toastTimer = null;
export const showToast = (msg, duration = 2800) => {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), duration);
};

/* ── Stats ────────────────────────────────────────────────────── */
const updateStats = () => {
    $('statTotal').textContent = policies.length;
    $('statAprobadas').textContent = policies.filter(p => p.estado === 'Aprobada').length;
    $('statBorradores').textContent = policies.filter(p => p.estado === 'Borrador').length;
    $('statArchivadas').textContent = policies.filter(p => p.estado === 'Archivada').length;
};

/* ── Badge ────────────────────────────────────────────────────── */
const badgeClass = (estado) => {
    const map = { Aprobada: 'badge-aprobada', Borrador: 'badge-borrador', Archivada: 'badge-archivada' };
    return map[estado] ?? 'badge-borrador';
};

/* ── Render table ─────────────────────────────────────────────── */
const renderTable = () => {
    const query = $('searchInput').value.trim().toLowerCase();
    const status = $('filterStatus').value;

    let list = policies.filter(p => {
        const matchQ = !query || p.nombre.toLowerCase().includes(query) || p.codigo.toLowerCase().includes(query);
        const matchS = !status || p.estado === status;
        return matchQ && matchS;
    });

    list.sort((a, b) => {
        const diff = new Date(a.fecha) - new Date(b.fecha);
        return sortAsc ? diff : -diff;
    });

    const tbody = $('historyBody');
    const empty = $('emptyState');

    if (list.length === 0) {
        tbody.innerHTML = '';
        empty.hidden = false;
    } else {
        empty.hidden = true;
        tbody.innerHTML = list.map(p => `
      <tr data-id="${p.id}">
        <td>
          <div class="policy-name">${escHtml(p.nombre)}</div>
        </td>
        <td><span class="code-pill">${escHtml(p.codigo)}</span></td>
        <td style="color:var(--textMuted);font-size:13px;">${escHtml(p.version)}</td>
        <td style="color:var(--textMuted);font-size:13px;white-space:nowrap;">${fmtDate(p.fecha)}</td>
        <td><span class="badge ${badgeClass(p.estado)}">${escHtml(p.estado)}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn-row open" data-action="open" data-id="${p.id}" title="Abrir en editor">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Abrir
            </button>
            <button class="btn-row pdf" data-action="pdf" data-id="${p.id}" title="Abrir en editor para exportar PDF">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PDF
            </button>
            <button class="btn-row del" data-action="del" data-id="${p.id}" title="Eliminar">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    }

    $('recordCount').textContent = `${list.length} registro${list.length !== 1 ? 's' : ''}`;
    $('sortLabel').textContent = sortAsc ? 'Más antiguo' : 'Más reciente';
    updateStats();
};

/* ── Open policy in editor ────────────────────────────────────── */
const openPolicy = async (id) => {
    const p = policies.find(x => x.id === id);
    if (!p) return;

    if (p.jsonFile) {
        try {
            const res = await fetch(p.jsonFile);
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
            saveEditorDoc(data);
            window.location.href = './editor.html';
            return;
        } catch (_) { /* fall through to stored data */ }
    }

    // If the policy has inline data stored, use it
    if (p.data) {
        saveEditorDoc(p.data);
    }

    showToast('Abriendo editor…');
    setTimeout(() => { window.location.href = '/editor.html'; }, 500);
};

/* ── Delete modal ─────────────────────────────────────────────── */
let pendingDeleteId = null;

const openModal = (id) => {
    pendingDeleteId = id;
    const p = policies.find(x => x.id === id);
    $('modalMsg').textContent =
        `¿Estás seguro de que deseas eliminar "${p?.nombre ?? ''}"? Esta acción no se puede deshacer.`;
    $('modalOverlay').hidden = false;
};

const closeModal = () => {
    $('modalOverlay').hidden = true;
    pendingDeleteId = null;
};

const confirmDelete = () => {
    if (!pendingDeleteId) return;
    policies = policies.filter(p => p.id !== pendingDeleteId);
    saveHistory(policies);
    renderTable();
    closeModal();
    showToast('✓ Política eliminada correctamente.');
};

/* ── Import JSON ──────────────────────────────────────────────── */
const setupImport = () => {
    const fileInput = $('fileInput');

    $('btnImport').addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                saveEditorDoc(data);

                // Add to history if not already present by code
                const existing = policies.find(p => p.codigo === (data.codigo ?? '').trim());
                if (!existing) {
                    policies.unshift({
                        id: uid(),
                        nombre: data.nombre || 'Sin nombre',
                        codigo: data.codigo || '—',
                        version: data.version || '1.0',
                        fecha: new Date().toISOString().slice(0, 10),
                        estado: 'Borrador',
                        jsonFile: null,
                        data,
                    });
                    saveHistory(policies);
                }

                showToast('✓ Archivo importado. Abriendo editor…');
                setTimeout(() => { window.location.href = '/editor.html'; }, 900);
            } catch (_) {
                showToast('✗ JSON inválido. Verifica el archivo.');
            }
            fileInput.value = '';
        };
        reader.readAsText(file);
    });
};

/* ── Init ─────────────────────────────────────────────────────── */
const init = () => {
    load();
    renderTable();
    setupImport();

    // Quick action buttons
    $('btnCrear').addEventListener('click', (e) => {
        e.preventDefault();
        saveEditorDoc(null); // clear → new policy mode
        window.location.href = './editor.html';
    });


    $('btnSettings').addEventListener('click', () => {
        showToast('⚙ Ajustes próximamente disponibles.');
    });

    // Sort toggle
    $('btnSort').addEventListener('click', () => {
        sortAsc = !sortAsc;
        renderTable();
    });

    // Search & filter
    $('searchInput').addEventListener('input', renderTable);
    $('filterStatus').addEventListener('change', renderTable);

    // Table row actions (delegation)
    $('historyBody').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const { action, id } = btn.dataset;
        if (action === 'open') openPolicy(id);
        if (action === 'del') openModal(id);
        if (action === 'pdf') {
            const p = policies.find(x => x.id === id);
            showToast(`Abriendo "${p?.nombre ?? 'política'}" para exportar PDF…`);
            setTimeout(() => openPolicy(id), 700);
        }
    });

    // Modal
    $('modalCancel').addEventListener('click', closeModal);
    $('modalConfirm').addEventListener('click', confirmDelete);
    $('modalOverlay').addEventListener('click', (e) => { if (e.target === $('modalOverlay')) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // Refresh table when returning from editor (storage event)
    window.addEventListener('storage', (e) => {
        if (e.key === HISTORY_KEY) {
            policies = loadHistory();
            renderTable();
        }
    });
};

document.addEventListener('DOMContentLoaded', init);
