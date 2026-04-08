/**
 * MG Deep Cleaning - Admin Logic
 * Handles Dashboard stats, Media Uploads, Quote Management, and Review Moderation.
 */

// --- CONFIG ---
const API_BASE = window.API_BASE + '/api';

// --- CUSTOM NOTIFICATION SYSTEM (TOASTS) ---
function injectToastContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
}

function showToast(message, type = 'success') {
    injectToastContainer();
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-content">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 500);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 500);
        }
    }, 3000);
}

// --- CUSTOM CONFIRMATION SYSTEM ---
async function showConfirm(message = "Are you sure?") {
    return new Promise((resolve) => {
        const overlay = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-msg');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        const iconBg = document.getElementById('confirm-icon-bg');
        const titleSpan = document.getElementById('confirm-title');
        const icon = document.getElementById('confirm-icon');
        const glow = document.getElementById('confirm-glow');

        if (!overlay || !msgEl || !yesBtn || !noBtn) {
            resolve(confirm(message));
            return;
        }

        // Logic-based dynamic theming
        const isDanger = message.toLowerCase().includes('delete') || 
                         message.toLowerCase().includes('logout') || 
                         message.toLowerCase().includes('permanently') ||
                         message.toLowerCase().includes('remove');

        if (isDanger) {
            // RED THEME
            iconBg.className = "w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8 -rotate-3 shadow-inner border border-red-500/20";
            titleSpan.className = "text-red-500";
            titleSpan.innerText = "Warning";
            icon.className = "fas fa-trash-alt";
            yesBtn.className = "flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-500/20 order-2 sm:order-1";
            glow.className = "absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 blur-[80px] rounded-full";
        } else {
            // ORANGE THEME (Default)
            iconBg.className = "w-20 h-20 bg-orange/10 text-orange rounded-3xl flex items-center justify-center text-3xl mx-auto mb-8 rotate-3 shadow-inner border border-orange/20";
            titleSpan.className = "text-orange";
            titleSpan.innerText = "Confirm";
            icon.className = "fas fa-exclamation-triangle";
            yesBtn.className = "flex-1 bg-orange hover:bg-orange-light text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-orange/20 order-2 sm:order-1";
            glow.className = "absolute -top-24 -right-24 w-48 h-48 bg-orange/20 blur-[80px] rounded-full";
        }

        msgEl.innerText = message;
        overlay.classList.add('show');

        const onYes = () => { overlay.classList.remove('show'); resolve(true); cleanup(); };
        const onNo = () => { overlay.classList.remove('show'); resolve(false); cleanup(); };
        
        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        };

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    });
}

// --- THEME LOGIC ---
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    const currentTheme = localStorage.getItem('mg-theme');
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
        if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');
            if (themeIcon) {
                if (isLight) themeIcon.classList.replace('fa-sun', 'fa-moon');
                else themeIcon.classList.replace('fa-moon', 'fa-sun');
            }
            localStorage.setItem('mg-theme', isLight ? 'light' : 'dark');
        });
    }
}

// --- NAVIGATION & SPA ROUTING ---
function switchSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(s => s.classList.add('hidden'));
    
    // Show target section
    const target = document.getElementById(sectionId + '-section');
    if (target) target.classList.remove('hidden');
    
    // Update active nav highlight
    document.querySelectorAll('.admin-nav-item').forEach(nav => {
        nav.classList.remove('active');
        // If it's a programmatic call, find by text/onclick
        if (nav.getAttribute('onclick')?.includes(`'${sectionId}'`)) {
            nav.classList.add('active');
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('adminSidebar');
        if (sidebar) sidebar.classList.remove('open');
    }

    // Load data based on section
    if (sectionId === 'dashboard') loadDashboard();
    if (sectionId === 'quotes') loadQuotes();
    if (sectionId === 'library') loadLibrary();
    if (sectionId === 'pending') fetchPendingReviews();
}

function toggleSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
}

// --- DASHBOARD LOGIC ---
async function loadDashboard() {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE}/reviews/stats`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include' 
        });
        const stats = await res.json();
        
        if (res.status === 401) return window.location.href = 'login.html';

        document.getElementById('stat-total-reviews').innerText = stats.totalReviews || 0;
        document.getElementById('stat-total-quotes').innerText = stats.totalQuotes || 0;
        document.getElementById('stat-total-customers').innerText = stats.totalCustomers || 0;
        document.getElementById('stat-pending-reviews').innerText = stats.pendingReviews || 0;
    } catch (err) {
        console.error("Dashboard stats error:", err);
    }
}

// --- UPLOAD MEDIA LOGIC ---
let selectedMediaType = 'image';
let selectedRating = 5;

function setMediaType(type) {
    selectedMediaType = type;
    
    // Update UI buttons
    document.querySelectorAll('.type-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('onclick')?.includes(`'${type}'`)) {
            opt.classList.add('active');
        }
    });

    // Handle Field Visibility
    const imgField = document.getElementById('image-upload');
    const ytField = document.getElementById('youtube-link');
    const textField = document.getElementById('text-field-container');

    // Reset visibility
    imgField.classList.remove('active');
    ytField.classList.remove('active');
    
    // Logic for showing fields
    if (type === 'image') imgField.classList.add('active');
    if (type === 'youtube') ytField.classList.add('active');
    
    // Text field is always shown as optional content, but we could customize its label
    const textLabel = textField.querySelector('label');
    if (type === 'text') {
        textLabel.innerText = "Review Content (Required)";
        document.getElementById('reviewText').placeholder = "Enter the textual review here...";
    } else {
        textLabel.innerText = "Review Content (Optional)";
        document.getElementById('reviewText').placeholder = "Add some description...";
    }
}

function setFormStars(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('#star-input i');
    stars.forEach((s, idx) => {
        if (idx < rating) {
            s.classList.remove('far');
            s.classList.add('fas');
        } else {
            s.classList.remove('fas');
            s.classList.add('far');
        }
    });
}

function handleFileSelect(input) {
    const fileName = input.files[0] ? input.files[0].name : "Click to select or drag & drop high-res image";
    document.getElementById('file-name').innerText = fileName;
}

async function handleUpload(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    const customerName = document.getElementById('customerName').value;
    const category = document.getElementById('category').value;
    const reviewText = document.getElementById('reviewText').value;

    if (!customerName) return showToast("Customer name is required", "error");

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('type', selectedMediaType);
    formData.append('customerName', customerName);
    formData.append('category', category);
    formData.append('rating', selectedRating);
    formData.append('text', reviewText);

    if (selectedMediaType === 'image') {
        const file = document.getElementById('imageFile').files[0];
        if (!file) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            return showToast("Please select an image", "error");
        }
        formData.append('image', file);
    } else if (selectedMediaType === 'youtube') {
        formData.append('youtubeUrl', document.getElementById('youtubeUrl').value);
    }

    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE}/reviews`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
            credentials: 'include'
        });

        if (res.ok) {
            showToast("Successfully uploaded and published!");
            e.target.reset();
            document.getElementById('file-name').innerText = "Click to select or drag & drop high-res image";
            setFormStars(5);
            loadDashboard();
        } else {
            const err = await res.json();
            showToast(err.error || "Upload failed", "error");
        }
    } catch (err) {
        showToast("Server error during upload", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// --- QUOTE MANAGEMENT ---
async function loadQuotes() {
    const tableBody = document.getElementById('quotes-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500"><i class="fas fa-spinner animate-spin mr-2"></i> Loading quotes...</td></tr>';
    
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE}/quote`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include' 
        });
        const quotes = await res.json();
        
        if (res.status === 401) return window.location.href = 'login.html';
        
        if (quotes.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500">No quote requests found.</td></tr>';
            return;
        }

        tableBody.innerHTML = quotes.map(q => `
            <tr class="hover:bg-white/5 transition border-b border-white/5">
                <td class="p-6">
                    <div class="font-bold text-white">${q.name}</div>
                    <div class="text-xs text-gray-500">${q.phone}</div>
                </td>
                <td class="p-6 text-sm text-orange">${q.service}</td>
                <td class="p-6 text-sm text-gray-400 max-w-[200px] truncate">${q.address}</td>
                <td class="p-6 text-sm text-gray-400 max-w-[250px] truncate" title="${q.message || ''}">${q.message || '-'}</td>
                <td class="p-6 text-xs text-gray-500 whitespace-nowrap">${new Date(q.date).toLocaleDateString()}</td>
                <td class="p-6 text-right">
                    <button onclick="deleteQuote('${q._id}')" class="text-red-500 hover:text-red-400 transition p-2" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500">Failed to load quotes.</td></tr>';
    }
}

async function deleteQuote(id) {
    if (await showConfirm("Delete this quote request permanently?")) {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/quote/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            if (res.ok) {
                showToast("Quote deleted successfully");
                loadQuotes();
                loadDashboard();
            } else if (res.status === 401) {
                window.location.href = 'login.html';
            }
        } catch (err) { showToast("Failed to delete", "error"); }
    }
}

// --- LIBRARY MANAGEMENT ---
async function loadLibrary() {
    const grid = document.getElementById('library-grid');
    if (!grid) return;

    const filter = document.getElementById('library-filter')?.value || 'all';
    grid.innerHTML = '<div class="col-span-full p-20 text-center"><i class="fas fa-spinner animate-spin text-4xl text-orange"></i></div>';
    
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE}/reviews`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include' 
        });
        let reviews = await res.json();
        
        if (res.status === 401) return window.location.href = 'login.html';
        
        if (filter !== 'all') {
            reviews = reviews.filter(r => r.type === filter);
        }

        if (reviews.length === 0) {
            grid.innerHTML = '<div class="col-span-full p-20 text-center text-gray-500">No reviews found in this category.</div>';
            return;
        }

        grid.innerHTML = reviews.map(r => `
            <div class="admin-card p-0 flex flex-col h-full group relative overflow-hidden transition-all duration-300 hover:border-orange/30 hover:shadow-2xl hover:shadow-orange/5 bg-charcoal-light/30">
                <div class="h-40 sm:h-48 bg-black/40 relative overflow-hidden">
                    ${r.type === 'image' ? `<img src="${r.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">` : 
                      r.type === 'youtube' ? `<div class="w-full h-full flex flex-col items-center justify-center bg-red-900/10 text-red-500 gap-2">
                          <i class="fab fa-youtube text-4xl"></i>
                          <span class="text-[9px] font-bold uppercase tracking-widest opacity-60">Video Feed</span>
                      </div>` :
                      `<div class="w-full h-full flex flex-col items-center justify-center bg-blue-900/5 text-orange/30 gap-2">
                          <i class="fas fa-quote-left text-3xl"></i>
                          <span class="text-[9px] font-bold uppercase tracking-widest opacity-60">Testimonial</span>
                      </div>`
                    }
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4">
                        <div class="flex gap-1.5 sm:gap-2 w-full">
                            <button onclick="openEditModal('${r._id}')" class="flex-1 h-8 sm:h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-orange transition-colors">
                                <i class="fas fa-edit text-[10px] sm:mr-2"></i> <span class="hidden sm:inline text-[10px] font-bold">Edit</span>
                            </button>
                            <button onclick="handleDeleteReview('${r._id}')" class="flex-1 h-8 sm:h-9 bg-red-500/20 backdrop-blur-md rounded-lg border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                                <i class="fas fa-trash text-[10px]"></i>
                            </button>
                        </div>
                    </div>

                    <div class="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/5 text-[8px] font-black uppercase tracking-tighter text-gray-300">
                        ${r.type}
                    </div>
                </div>

                <div class="p-4 flex flex-col flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold text-white text-xs sm:text-sm truncate pr-2 group-hover:text-orange transition-colors">${r.customerName}</h4>
                        <div class="flex items-center text-orange text-[10px] bg-orange/10 px-1.5 py-0.5 rounded shadow-sm">
                            <i class="fas fa-star mr-1"></i>${r.rating}
                        </div>
                    </div>
                    <p class="text-[10px] text-gray-500 mb-2 font-medium">${r.category}</p>
                    ${r.text ? `<p class="text-[11px] text-gray-400 line-clamp-2 italic leading-relaxed">"${r.text}"</p>` : ''}
                    
                    <div class="mt-auto pt-3 flex items-center justify-between">
                         <span class="text-[9px] text-gray-600 font-bold uppercase tracking-widest">${new Date(r.dateAdded || Date.now()).toLocaleDateString()}</span>
                         <i class="fas fa-shield-check text-green-500/50 text-xs"></i>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<div class="col-span-full p-20 text-center text-red-500 font-bold">Failed to load library.</div>';
    }
}

async function handleDeleteReview(id) {
    if (await showConfirm("Permanently delete this review from the website?")) {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${API_BASE}/reviews/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            if (res.ok) {
                showToast("Review deleted successfully");
                loadLibrary();
                loadDashboard();
            } else if (res.status === 401) {
                window.location.href = 'login.html';
            }
        } catch (err) { showToast("Failed to delete", "error"); }
    }
}

// --- REVIEW EDITOR ---
let currentEditId = null;
let currentEditRating = 5;

async function openEditModal(id) {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_BASE}/reviews`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include' 
        }); 
        const all = await res.json();
        const r = all.find(item => item._id === id);
        
        if (!r) return;
        currentEditId = id;
        
        document.getElementById('edit-review-id').value = id;
        document.getElementById('edit-customer-name').value = r.customerName;
        document.getElementById('edit-category').value = r.category;
        document.getElementById('edit-text').value = r.text || "";
        
        renderEditStars(r.rating);
        document.getElementById('edit-review-modal').classList.add('show');
    } catch (err) { showToast("Error loading review", "error"); }
}

function renderEditStars(rating) {
    currentEditRating = rating;
    const container = document.getElementById('edit-star-input');
    if (!container) return;
    container.innerHTML = [1,2,3,4,5].map(s => `
        <i class="fas fa-star cursor-pointer ${s <= rating ? 'text-orange' : 'text-gray-600'}" onclick="renderEditStars(${s})"></i>
    `).join('');
}

function closeEditModal() {
    document.getElementById('edit-review-modal').classList.remove('show');
}

// --- PENDING REVIEWS ---
async function fetchPendingReviews() {
    const grid = document.getElementById('pending-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="col-span-full p-20 text-center text-gray-500">Loading inbox...</div>';

    try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE}/reviews/pending`, { 
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include' 
        });
        const pending = await response.json();
        
        if (response.status === 401) return window.location.href = 'login.html';
        
        if (pending.length === 0) {
            grid.innerHTML = '<div class="col-span-full p-20 text-center text-gray-500">Inbox is empty! No pending reviews to approve.</div>';
            return;
        }

        grid.innerHTML = pending.map(review => `
            <div class="admin-card">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-white">${review.customerName}</h4>
                        <p class="text-sm text-gray-500">${review.category}</p>
                    </div>
                    <div class="text-orange font-bold">${review.rating} ⭐</div>
                </div>
                ${review.type === 'image' ? `<img src="${review.url}" class="w-full h-40 object-cover rounded-lg mb-4">` : ''}
                <div class="bg-black/20 p-4 rounded-lg mb-6 border border-white/5">
                    <p class="text-gray-300 text-sm italic">"${review.text}"</p>
                </div>
                <div class="flex gap-4">
                    <button onclick="handleApprove('${review._id}')" class="bg-orange text-white flex-1 py-2 rounded-lg text-sm font-bold transition hover:bg-orange/80">Approve</button>
                    <button onclick="handleDeleteReview('${review._id}')" class="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white flex-1 py-2 rounded-lg text-sm transition">Decline</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        grid.innerHTML = '<div class="col-span-full p-20 text-center text-red-500">Error loading inbox.</div>';
    }
}

async function handleApprove(id) {
    if (await showConfirm("Approve this review for the live site?")) {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`${API_BASE}/reviews/${id}/approve`, { 
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });
            if (response.ok) {
                showToast("Review approved and published!");
                fetchPendingReviews();
                loadDashboard();
            } else if (response.status === 401) {
                window.location.href = 'login.html';
            }
        } catch (error) { showToast("Failed to approve", "error"); }
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadDashboard();
    
    // Form listeners
    const mainUploadForm = document.getElementById('upload-review-form');
    if (mainUploadForm) {
        mainUploadForm.addEventListener('submit', handleUpload);
    }

    const editReviewForm = document.getElementById('edit-review-form');
    if (editReviewForm) {
        editReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                customerName: document.getElementById('edit-customer-name').value,
                category: document.getElementById('edit-category').value,
                rating: currentEditRating,
                text: document.getElementById('edit-text').value
            };

            try {
                const token = localStorage.getItem('admin_token');
                const res = await fetch(`${API_BASE}/reviews/${currentEditId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data),
                    credentials: 'include'
                });
                
                if (res.ok) {
                    showToast("Review updated successfully!");
                    closeEditModal();
                    loadLibrary();
                    loadDashboard();
                } else {
                    showToast("Failed to update", "error");
                }
            } catch (err) { showToast("Save failed", "error"); }
        });
    }

    // Default view
    switchSection('dashboard');
});

// --- LOGOUT LOGIC ---
async function handleLogout() {
    if (await showConfirm("Are you sure you want to log out?")) {
        try {
            const token = localStorage.getItem('admin_token');
            await fetch(`${API_BASE}/auth/logout`, { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include' 
            });
            localStorage.removeItem('admin_token'); // Clear token
            window.location.href = 'login.html';
        } catch (err) {
            localStorage.removeItem('admin_token');
            window.location.href = 'login.html';
        }
    }
}

// --- GLOBAL EXPOSURE (For Inline HTML call) ---
window.switchSection = switchSection;
window.toggleSidebar = toggleSidebar;
window.setMediaType = setMediaType;
window.setFormStars = setFormStars;
window.handleFileSelect = handleFileSelect;
window.loadQuotes = loadQuotes;
window.deleteQuote = deleteQuote;
window.loadLibrary = loadLibrary;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.renderEditStars = renderEditStars;
window.handleDeleteReview = handleDeleteReview;
window.handleApprove = handleApprove;
window.fetchPendingReviews = fetchPendingReviews;
window.handleLogout = handleLogout;
