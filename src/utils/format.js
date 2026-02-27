// ── Formatting utilities ────────────────────────────────────────

/**
 * Formats an ISO date string (YYYY-MM-DD) to dd/mm/yyyy.
 * @param {string} value
 * @returns {string}
 */
export const fmtDate = (value) => {
    if (!value) return '—';
    const d = new Date(value + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * Returns the current datetime as a locale string.
 * @returns {string}
 */
export const nowStamp = () => new Date().toLocaleString('es-GT');

/**
 * Escapes HTML special characters in a string.
 * @param {*} str
 * @returns {string}
 */
export const escHtml = (str) =>
    (str ?? '').toString()
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

/**
 * Generates a simple unique ID string.
 * @returns {string}
 */
export const uid = () => `pol-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
