/* ═══════════════════════════════════════════════
   INNOVATIA — Client-Side Logic
   Passcode-Protected Admin + Live Sync
   ═══════════════════════════════════════════════ */

const API_URL = '/api/teams';
const ADMIN_PASSCODE = '2106';
const SYNC_INTERVAL = 2000; // 2 seconds

// ─── State ──────────────────────────────────────
let teams = [];
let currentRound = 'total';
let sortAsc = false;
let isAdminMode = false;
let syncTimer = null;
let lastDataHash = '';

// ─── DOM References ─────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const teamList = $('#teamList');
const searchInput = $('#searchInput');
const searchClear = $('#searchClear');
const roundFilters = $('#roundFilters');
const sortToggle = $('#sortToggle');
const sortLabel = $('#sortLabel');
const addTeamBtn = $('#addTeamBtn');
const teamCount = $('#teamCount');
const loadingState = $('#loadingState');
const emptyState = $('#emptyState');
const adminToggleBtn = $('#adminToggleBtn');
const adminIcon = $('#adminIcon');

// Modal
const modalOverlay = $('#modalOverlay');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');
const modalClose = $('#modalClose');

// Confirm
const confirmOverlay = $('#confirmOverlay');
const confirmTitle = $('#confirmTitle');
const confirmMessage = $('#confirmMessage');
const confirmOk = $('#confirmOk');
const confirmCancel = $('#confirmCancel');

// Toast
const toastContainer = $('#toastContainer');

// ─── Utility ────────────────────────────────────
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getScore(team, round) {
    if (round === 'total') {
        return (team.round1 || 0) + (team.round2 || 0) + (team.round3 || 0);
    }
    return team[`round${round}`];
}

function formatScore(val) {
    if (val === null || val === undefined) return '—';
    return val.toString();
}

function getRankClass(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
}

// Simple hash to detect data changes for sync
function hashData(data) {
    return JSON.stringify(data);
}

// ─── Toast Notifications ────────────────────────
function showToast(message, type = 'success') {
    const icons = {
        success: 'check-circle-2',
        error: 'alert-circle',
        info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${icons[type]}"></i><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);
    lucide.createIcons({ nodes: [toast] });

    setTimeout(() => toast.remove(), 3000);
}

// ─── Confirm Dialog ─────────────────────────────
function showConfirm(title, message) {
    return new Promise((resolve) => {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmOverlay.classList.add('show');

        function cleanup() {
            confirmOverlay.classList.remove('show');
            confirmOk.removeEventListener('click', onOk);
            confirmCancel.removeEventListener('click', onCancel);
        }

        function onOk() { cleanup(); resolve(true); }
        function onCancel() { cleanup(); resolve(false); }

        confirmOk.addEventListener('click', onOk);
        confirmCancel.addEventListener('click', onCancel);
    });
}

// ─── Modal ──────────────────────────────────────
function openModal(title, bodyHTML) {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modalOverlay.classList.add('show');
    lucide.createIcons({ nodes: [modalBody] });

    const firstInput = modalBody.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 300);
}

function closeModal() {
    modalOverlay.classList.remove('show');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ─── Passcode System ────────────────────────────
function openPasscodeModal() {
    openModal('Admin Access', `
        <div style="text-align:center;">
            <i data-lucide="lock" style="width:40px;height:40px;color:var(--primary);margin-bottom:0.75rem;"></i>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem;">Enter 4-digit passcode to access admin mode</p>
            <div class="passcode-wrapper" id="passcodeWrapper">
                <input type="number" class="passcode-input" maxlength="1" data-index="0" inputmode="numeric" autocomplete="off">
                <input type="number" class="passcode-input" maxlength="1" data-index="1" inputmode="numeric" autocomplete="off">
                <input type="number" class="passcode-input" maxlength="1" data-index="2" inputmode="numeric" autocomplete="off">
                <input type="number" class="passcode-input" maxlength="1" data-index="3" inputmode="numeric" autocomplete="off">
            </div>
            <p class="passcode-error" id="passcodeError"></p>
            <button class="btn btn-primary" id="passcodeSubmit">Unlock</button>
        </div>
    `);

    const inputs = modalBody.querySelectorAll('.passcode-input');
    const errorEl = $('#passcodeError');
    const submitBtn = $('#passcodeSubmit');

    // Auto-focus and auto-jump between inputs
    inputs.forEach((input, i) => {
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            // Keep only last digit
            if (val.length > 1) e.target.value = val.slice(-1);
            // Move to next
            if (val && i < 3) inputs[i + 1].focus();
            // Clear error state
            errorEl.textContent = '';
            inputs.forEach(inp => inp.classList.remove('error'));
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && i > 0) {
                inputs[i - 1].focus();
            }
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });

        // Handle paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
            pasted.split('').forEach((ch, j) => {
                if (inputs[j]) inputs[j].value = ch;
            });
            if (pasted.length === 4) submitBtn.click();
        });
    });

    submitBtn.addEventListener('click', () => {
        const entered = Array.from(inputs).map(i => i.value).join('');

        if (entered.length < 4) {
            errorEl.textContent = 'Please enter all 4 digits';
            inputs.forEach(inp => inp.classList.add('error'));
            return;
        }

        if (entered === ADMIN_PASSCODE) {
            isAdminMode = true;
            adminToggleBtn.classList.add('active');
            adminIcon.setAttribute('data-lucide', 'shield-check');
            lucide.createIcons({ nodes: [adminToggleBtn] });
            addTeamBtn.style.display = 'flex';
            closeModal();
            showToast('Admin mode unlocked!', 'success');
            renderTeams();
        } else {
            errorEl.textContent = 'Wrong passcode';
            inputs.forEach(inp => {
                inp.classList.add('error');
                inp.value = '';
            });
            inputs[0].focus();
        }
    });
}

function disableAdminMode() {
    isAdminMode = false;
    adminToggleBtn.classList.remove('active');
    adminIcon.setAttribute('data-lucide', 'shield');
    lucide.createIcons({ nodes: [adminToggleBtn] });
    addTeamBtn.style.display = 'none';
    showToast('Admin mode locked', 'info');
    renderTeams();
}

// ─── API Calls ──────────────────────────────────
async function fetchTeams(isInitial = false) {
    if (isInitial) {
        loadingState.style.display = 'flex';
        emptyState.style.display = 'none';
        teamList.innerHTML = '';
        teamList.appendChild(loadingState);
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Server error');
        const newTeams = await response.json();
        const newHash = hashData(newTeams);

        // Only re-render if data actually changed
        if (newHash !== lastDataHash) {
            teams = newTeams;
            lastDataHash = newHash;
            if (isInitial) loadingState.style.display = 'none';
            renderTeams();
        } else if (isInitial) {
            loadingState.style.display = 'none';
            renderTeams();
        }
    } catch (err) {
        console.error('Fetch error:', err);
        if (isInitial) {
            showToast('Failed to load teams. Is the server running?', 'error');
            loadingState.style.display = 'none';
        }
        teams = [];
    }
}

async function addTeam(name) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() })
        });

        if (!res.ok) {
            const data = await res.json();
            showToast(data.message || 'Failed to add team', 'error');
            return false;
        }

        lastDataHash = ''; // Force refresh
        await fetchTeams();
        showToast(`Team "${name}" added!`, 'success');
        return true;
    } catch (err) {
        showToast('Network error', 'error');
        return false;
    }
}

async function updateTeamMarks(id, updates) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (!res.ok) {
            const data = await res.json();
            showToast(data.message || 'Update failed', 'error');
            return false;
        }

        lastDataHash = ''; // Force refresh
        await fetchTeams();
        showToast('Marks updated!', 'success');
        return true;
    } catch (err) {
        showToast('Network error', 'error');
        return false;
    }
}

async function deleteTeam(id, name) {
    const confirmed = await showConfirm(
        'Delete Team?',
        `This will permanently remove "${name}" and all their scores.`
    );
    if (!confirmed) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        lastDataHash = ''; // Force refresh
        await fetchTeams();
        showToast(`"${name}" deleted`, 'info');
    } catch {
        showToast('Failed to delete team', 'error');
    }
}

// ─── Render ─────────────────────────────────────
function renderTeams() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    let filtered = teams.filter(t => t.name.toLowerCase().includes(searchTerm));

    // Sort
    filtered.sort((a, b) => {
        const valA = getScore(a, currentRound) || 0;
        const valB = getScore(b, currentRound) || 0;
        return sortAsc ? valA - valB : valB - valA;
    });

    teamList.innerHTML = '';

    // Team count
    teamCount.textContent = `${filtered.length} Team${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0 && teams.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    if (filtered.length === 0) {
        teamList.innerHTML = `
            <div style="text-align:center; padding:2rem; color:var(--text-muted); font-size:0.85rem;">
                No teams match "<strong>${escapeHtml(searchTerm)}</strong>"
            </div>`;
        return;
    }

    filtered.forEach((team, index) => {
        const rank = index + 1;
        const mainScore = getScore(team, currentRound);
        const card = document.createElement('div');
        card.className = 'team-card';
        card.style.animationDelay = `${index * 0.03}s`;

        const roundChips = [1, 2, 3].map(r => {
            const val = team[`round${r}`];
            const isActive = currentRound === String(r);
            return `<span class="score-chip ${isActive ? 'highlight' : ''}">R${r}: ${formatScore(val)}</span>`;
        }).join('');

        // Action buttons only in admin mode
        const actionBtns = isAdminMode ? `
            <div class="card-actions">
                <button class="btn-icon edit" data-id="${team._id}" data-name="${escapeHtml(team.name)}" title="Edit marks">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="btn-icon delete" data-id="${team._id}" data-name="${escapeHtml(team.name)}" title="Delete team">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>` : '';

        card.innerHTML = `
            <div class="rank-badge ${getRankClass(rank)}">${rank}</div>
            <div class="team-info">
                <div class="team-name">${escapeHtml(team.name)}</div>
                <div class="team-scores">${roundChips}</div>
            </div>
            <div class="main-score ${mainScore === null || mainScore === undefined ? 'null-score' : ''}">${currentRound === 'total' ? (mainScore || 0) : formatScore(mainScore)}</div>
            ${actionBtns}
        `;

        teamList.appendChild(card);
    });

    // Init icons
    lucide.createIcons({ nodes: teamList.querySelectorAll('.team-card') });

    // Edit & Delete — admin only
    if (isAdminMode) {
        teamList.querySelectorAll('.btn-icon.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditModal(btn.dataset.id, btn.dataset.name);
            });
        });

        teamList.querySelectorAll('.btn-icon.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTeam(btn.dataset.id, btn.dataset.name);
            });
        });
    }
}

// ─── Add Team Modal ─────────────────────────────
function openAddTeamModal() {
    openModal('Add New Team', `
        <form id="addTeamForm">
            <div class="form-group">
                <label class="form-label">Team Name</label>
                <input type="text" class="form-input" id="newTeamName" placeholder="Enter team name..." required autocomplete="off">
            </div>
            <button type="submit" class="btn btn-primary">Add Team</button>
        </form>
    `);

    $('#addTeamForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = $('#newTeamName').value.trim();
        if (!name) return;

        const btn = $('#addTeamForm').querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Adding...';

        const success = await addTeam(name);
        if (success) closeModal();
        else {
            btn.disabled = false;
            btn.textContent = 'Add Team';
        }
    });
}

// ─── Edit Marks Modal ───────────────────────────
function openEditModal(id, name) {
    const team = teams.find(t => t._id === id);
    if (!team) return;

    openModal(`Update — ${name}`, `
        <form id="editMarksForm">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Round 1</label>
                    <input type="number" class="form-input" id="editR1" value="${team.round1 ?? ''}" placeholder="—" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Round 2</label>
                    <input type="number" class="form-input" id="editR2" value="${team.round2 ?? ''}" placeholder="—" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Round 3</label>
                    <input type="number" class="form-input" id="editR3" value="${team.round3 ?? ''}" placeholder="—" min="0">
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Save Marks</button>
        </form>
    `);

    $('#editMarksForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const r1 = $('#editR1').value;
        const r2 = $('#editR2').value;
        const r3 = $('#editR3').value;

        const updates = {};
        updates.round1 = r1 !== '' ? parseInt(r1) : null;
        updates.round2 = r2 !== '' ? parseInt(r2) : null;
        updates.round3 = r3 !== '' ? parseInt(r3) : null;

        const btn = $('#editMarksForm').querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Saving...';

        const success = await updateTeamMarks(id, updates);
        if (success) closeModal();
        else {
            btn.disabled = false;
            btn.textContent = 'Save Marks';
        }
    });
}

// ─── Live Sync ──────────────────────────────────
function startSync() {
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = setInterval(() => {
        // Only sync if no modal is open (avoid conflicts during editing)
        if (!modalOverlay.classList.contains('show') && !confirmOverlay.classList.contains('show')) {
            fetchTeams(false);
        }
    }, SYNC_INTERVAL);
}

function stopSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}

// Pause sync when tab is hidden, resume when visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopSync();
    } else {
        fetchTeams(false); // Immediate fetch on return
        startSync();
    }
});

// ─── Event Listeners ────────────────────────────

// Search
searchInput.addEventListener('input', () => {
    searchClear.style.display = searchInput.value ? 'flex' : 'none';
    renderTeams();
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    searchInput.focus();
    renderTeams();
});

// Round Filter
roundFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentRound = btn.dataset.round;
    renderTeams();
});

// Sort
sortToggle.addEventListener('click', () => {
    sortAsc = !sortAsc;
    sortLabel.textContent = sortAsc ? 'Lowest First' : 'Highest First';
    sortToggle.classList.toggle('active', sortAsc);

    const icon = sortToggle.querySelector('i');
    icon.setAttribute('data-lucide', sortAsc ? 'arrow-up-narrow-wide' : 'arrow-down-wide-narrow');
    lucide.createIcons({ nodes: [sortToggle] });

    renderTeams();
});

// Admin Toggle (shield button)
adminToggleBtn.addEventListener('click', () => {
    if (isAdminMode) {
        disableAdminMode();
    } else {
        openPasscodeModal();
    }
});

// FAB Add
addTeamBtn.addEventListener('click', openAddTeamModal);

// ─── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchTeams(true);
    startSync();
});
