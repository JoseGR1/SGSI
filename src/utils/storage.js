// ── Storage keys ────────────────────────────────────────────────

export const HISTORY_KEY = 'sgsi_history_v1';
export const EDITOR_KEY = 'sgsi_policy_template_sticky_v1';

// ── History helpers ─────────────────────────────────────────────

/**
 * Loads the policy history list from localStorage.
 * Returns an empty array if nothing is stored.
 * @returns {Array}
 */
export const loadHistory = () => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
};

/**
 * Persists the policy history list to localStorage.
 * @param {Array} list
 */
export const saveHistory = (list) => {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (_) { }
};

// ── Editor document helpers ─────────────────────────────────────

/**
 * Loads the active editor document from localStorage.
 * @returns {object|null}
 */
export const loadEditorDoc = () => {
    try {
        const raw = localStorage.getItem(EDITOR_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
};

/**
 * Saves the active editor document to localStorage.
 * Pass `null` to clear it (new policy mode).
 * @param {object|null} data
 */
export const saveEditorDoc = (data) => {
    try {
        if (data === null) {
            localStorage.removeItem(EDITOR_KEY);
        } else {
            localStorage.setItem(EDITOR_KEY, JSON.stringify(data));
        }
    } catch (_) { }
};
