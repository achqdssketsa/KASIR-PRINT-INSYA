/* =========================================================
   PRINT INSYA - Sistem Kasir POS
   ========================================================= */

/* ---------- KONFIGURASI LOGIN GOOGLE (Firebase) ----------
   Isi dari Firebase Console > Project settings > Your apps > Web app.
   Selama masih "ISI_...", layar login menampilkan petunjuk pengaturan. */
const FIREBASE_CONFIG = {
    apiKey: 'ISI_API_KEY',
    authDomain: 'ISI_PROJECT_ID.firebaseapp.com',
    projectId: 'ISI_PROJECT_ID',
    appId: 'ISI_APP_ID'
};
// Daftar email yang boleh masuk. Kosongkan [] jika semua akun Google yang login boleh mengakses.
// Contoh: ['pemilik@gmail.com', 'kasir1@gmail.com']
const ALLOWED_EMAILS = [];

const DEFAULT_PRODUCTS = [
    { id: 'p1', name: 'Print Biasa (B&W)', category: 'Layanan Print & Fotocopy', price: 500, unit: 'lembar', stock: 1000, minStock: 50 },
    { id: 'p2', name: 'Print 2 Sisi / Buku', category: 'Layanan Print & Fotocopy', price: 800, unit: 'lembar', stock: 1000, minStock: 50 },
    { id: 'p3', name: 'Print Warna 50%', category: 'Layanan Print & Fotocopy', price: 1000, unit: 'lembar', stock: 500, minStock: 30 },
    { id: 'p4', name: 'Print Warna 100% (Full)', category: 'Layanan Print & Fotocopy', price: 2000, unit: 'lembar', stock: 500, minStock: 30 },
    { id: 'p5', name: 'Scan Dokumen', category: 'Layanan Print & Fotocopy', price: 1000, unit: 'lembar', stock: 9999, minStock: 0 },
    { id: 'p6', name: 'Fotocopy 1 Sisi', category: 'Layanan Print & Fotocopy', price: 300, unit: 'lembar', stock: 2000, minStock: 100 },
    { id: 'p7', name: 'Fotocopy 2 Sisi', category: 'Layanan Print & Fotocopy', price: 500, unit: 'lembar', stock: 2000, minStock: 100 },
    { id: 'p8', name: 'Jilid Dokumen', category: 'Layanan Print & Fotocopy', price: 5000, unit: 'buku', stock: 150, minStock: 10 },
    { id: 'p9', name: 'Ketik DOCX', category: 'Layanan Pengetikan', price: 3000, unit: 'halaman', stock: 999, minStock: 0 },
    { id: 'p10', name: 'Edit Layout DOCX', category: 'Layanan Pengetikan', price: 2000, unit: 'halaman', stock: 999, minStock: 0 },
    { id: 'p11', name: 'Ketik & Edit Layout DOCX', category: 'Layanan Pengetikan', price: 4000, unit: 'halaman', stock: 999, minStock: 0 },
    { id: 'p12', name: 'Kertas Folio Bergaris', category: 'Kertas & Amplop', price: 500, unit: 'lembar', stock: 450, minStock: 50 },
    { id: 'p13', name: 'Kertas Stiker', category: 'Kertas & Amplop', price: 3000, unit: 'lembar', stock: 120, minStock: 20 },
    { id: 'p14', name: 'Amplop Kecil', category: 'Kertas & Amplop', price: 1000, unit: 'pcs', stock: 80, minStock: 15 },
    { id: 'p15', name: 'Amplop Sedang', category: 'Kertas & Amplop', price: 2000, unit: 'pcs', stock: 65, minStock: 15 },
    { id: 'p16', name: 'Amplop Besar', category: 'Kertas & Amplop', price: 3000, unit: 'pcs', stock: 40, minStock: 10 },
    { id: 'p17', name: 'Pena / Pulpen', category: 'Alat Tulis & Perlengkapan', price: 3000, unit: 'pcs', stock: 35, minStock: 10 },
    { id: 'p18', name: 'Spidol', category: 'Alat Tulis & Perlengkapan', price: 8000, unit: 'pcs', stock: 18, minStock: 5 },
    { id: 'p19', name: 'Materai 10000', category: 'Alat Tulis & Perlengkapan', price: 12000, unit: 'pcs', stock: 25, minStock: 5 },
    { id: 'p20', name: 'Documen Binder (Map)', category: 'Alat Tulis & Perlengkapan', price: 5000, unit: 'pcs', stock: 22, minStock: 5 },
];

// Warna kategori mengikuti banner: navy / emas bergantian
const CAT_STYLE = {
    'Layanan Print & Fotocopy': { badge: 'bg-navy-900 text-white', bar: 'bg-navy-900' },
    'Layanan Pengetikan': { badge: 'bg-gold-500 text-navy-900', bar: 'bg-gold-500' },
    'Kertas & Amplop': { badge: 'bg-navy-900 text-white', bar: 'bg-navy-900' },
    'Alat Tulis & Perlengkapan': { badge: 'bg-gold-500 text-navy-900', bar: 'bg-gold-500' }
};

const CAPITAL_SOURCES = ['Modal Pribadi', 'Pinjaman Bank / Koperasi', 'Pinjaman Keluarga / Teman', 'Investor / Patungan', 'Hibah / Bantuan', 'Dari Laba Usaha', 'Lainnya'];
const CAPITAL_USES = ['Beli Stok Barang', 'Beli Mesin / Peralatan', 'Sewa / Operasional', 'Gaji / Upah', 'Lainnya'];

/* ---------- Helper ---------- */
function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function rupiah(n) { return 'Rp ' + (Number(n) || 0).toLocaleString('id-ID'); }
function pad(n) { return String(n).padStart(2, '0'); }
// Kunci tanggal LOKAL (bukan UTC)
function dateKey(d) {
    const x = new Date(d);
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
}
function isService(p) { return String(p.category || '').startsWith('Layanan'); }
function catBadge(cat) {
    const s = CAT_STYLE[cat];
    return `<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${s ? s.badge : 'bg-slate-200 text-slate-700'}">${esc(cat)}</span>`;
}
function fmtDateTime(iso) {
    const d = new Date(iso);
    return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function loadJSON(key, fallback) {
    try {
        const v = JSON.parse(localStorage.getItem(key));
        return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
}
function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { alert('Gagal menyimpan data (penyimpanan browser penuh atau diblokir).'); return false; }
}
function saveProducts() { return saveJSON('insya_products', products); }

/* ---------- Notifikasi layar ---------- */
function notify(msg, opts = {}) {
    const { type = 'info', title = '', duration = 4500 } = opts;
    const stack = document.getElementById('toast-stack');
    const colors = {
        info: 'bg-navy-900 text-white',
        success: 'bg-emerald-600 text-white',
        warn: 'bg-gold-500 text-navy-900',
        danger: 'bg-rose-600 text-white'
    };
    const icons = { info: 'fa-circle-info', success: 'fa-circle-check', warn: 'fa-triangle-exclamation', danger: 'fa-circle-exclamation' };
    const el = document.createElement('div');
    el.className = `pointer-events-auto rounded-xl shadow-2xl px-4 py-3 text-xs flex items-start gap-3 ${colors[type] || colors.info}`;
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info} text-base mt-0.5"></i>
        <div class="flex-1 min-w-0">${title ? `<p class="font-extrabold text-sm">${esc(title)}</p>` : ''}<p class="font-semibold">${esc(msg)}</p></div>
        <button class="opacity-70 hover:opacity-100"><i class="fa-solid fa-xmark"></i></button>`;
    el.querySelector('button').onclick = () => el.remove();
    stack.appendChild(el);
    if (duration > 0) setTimeout(() => el.remove(), duration);
}
function toast(msg) { notify(msg, { type: 'success', duration: 2800 }); }

/* ---------- State ---------- */
let products = loadJSON('insya_products', null) || JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
let transactions = loadJSON('insya_transactions', []);
let capital = loadJSON('insya_capital', []);
let qrisFiles = loadJSON('insya_qris_files', []);
let activeQrisId = localStorage.getItem('insya_qris_active') || '';
let cart = [];
let paymentMethod = 'cash';
let waNumber = localStorage.getItem('insya_wa_no') || '';
let pendingDeleteTrx = null;
let appStarted = false;
let auth = null;

/* =========================================================
   LOGIN GOOGLE
   ========================================================= */
function authConfigured() {
    return typeof firebase !== 'undefined' && FIREBASE_CONFIG.apiKey && !/^ISI_/.test(FIREBASE_CONFIG.apiKey);
}
function authMsg(text) {
    const el = document.getElementById('auth-msg');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
}
function isAllowed(user) {
    if (!ALLOWED_EMAILS.length) return true;
    return ALLOWED_EMAILS.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase());
}

function initAuth() {
    if (!authConfigured()) {
        document.getElementById('auth-setup').classList.remove('hidden');
        document.getElementById('btn-google').disabled = true;
        document.getElementById('btn-google').classList.add('opacity-40', 'cursor-not-allowed');
        return;
    }
    if (location.protocol === 'file:') {
        authMsg('Login Google tidak bisa dari file langsung. Buka lewat https:// atau http://localhost.');
    }
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
    } catch (e) {
        authMsg('Konfigurasi Firebase tidak valid: ' + e.message);
        return;
    }
    auth.getRedirectResult().catch(e => authMsg('Login gagal: ' + e.message));
    auth.onAuthStateChanged(user => {
        if (!user) return showLogin();
        if (!isAllowed(user)) {
            authMsg(`Akun ${user.email} tidak memiliki izin akses.`);
            auth.signOut();
            return;
        }
        startApp({ name: user.displayName, email: user.email, photo: user.photoURL });
    });
}

function loginGoogle() {
    if (!auth) return;
    authMsg('');
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    auth.signInWithPopup(provider).catch(e => {
        if (e.code === 'auth/popup-blocked') return auth.signInWithRedirect(provider);
        if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
        authMsg('Login gagal: ' + (e.message || e.code));
    });
}

function enterDemoMode() {
    startApp({ name: 'Mode Uji Coba', email: 'tanpa login', photo: '' });
}

function logout() {
    if (auth) auth.signOut().then(() => location.reload());
    else location.reload();
}

function showLogin() {
    document.getElementById('auth-screen').classList.remove('hidden');
    const app = document.getElementById('app');
    app.classList.add('hidden'); app.classList.remove('flex');
}

function startApp(user) {
    document.getElementById('auth-screen').classList.add('hidden');
    const app = document.getElementById('app');
    app.classList.remove('hidden'); app.classList.add('flex');
    document.getElementById('user-name').textContent = user.name || 'Pengguna';
    document.getElementById('user-email').textContent = user.email || '';
    const photo = document.getElementById('user-photo');
    if (user.photo) { photo.src = user.photo; photo.classList.remove('hidden'); }
    if (!appStarted) { appStarted = true; initApp(); }
}

/* =========================================================
   INISIALISASI APLIKASI
   ========================================================= */
document.addEventListener('DOMContentLoaded', initAuth);

function initApp() {
    updateClock();
    setInterval(updateClock, 1000);
    initPrintServicesSelect();
    renderPosCatalog();
    renderCart();
    migrateOldQris().then(() => { renderQrisCart(); renderQrisManager(); });
    renderQrisCart();
    renderQrisManager();
    renderWaSaved();
    updateStockBadge();
    updateNotifPermStatus();
    setPayMethod('cash');

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeProductModal(); closeCapitalModal(); closeDeleteTrxModal(); closeQrisBill(); }
    });
    ['product-modal', 'capital-modal', 'delete-trx-modal'].forEach(id => {
        document.getElementById(id).addEventListener('click', e => {
            if (e.target.id === id) e.target.classList.add('hidden');
        });
    });
    window.addEventListener('afterprint', () => { document.getElementById('print-area').innerHTML = ''; });

    const low = getLowStock();
    if (low.length) {
        notify(`${low.length} barang stok menipis/habis. Klik lonceng untuk melihat.`, { type: 'warn', title: 'Peringatan Stok', duration: 9000 });
    }
}

function updateClock() {
    const now = new Date();
    document.getElementById('current-date').innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('current-time').innerText = now.toLocaleTimeString('id-ID') + ' WIB';
}

/* ---------- Navigasi ---------- */
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('nav-active', btn.id === `nav-${tabId}`));

    if (tabId === 'laporan-harian') renderDailyReport();
    if (tabId === 'laporan-audit') renderAuditReport();
    if (tabId === 'riwayat') renderHistory();
    if (tabId === 'produk') renderProductsTable();
    if (tabId === 'modal') renderCapital();
    if (tabId === 'pengaturan') { renderQrisManager(); renderWaSaved(); updateNotifPermStatus(); }
}

function switchPosMode(mode) {
    const isPrint = mode === 'print';
    document.getElementById('pos-mode-print').classList.toggle('hidden', !isPrint);
    document.getElementById('pos-mode-beli').classList.toggle('hidden', isPrint);
    document.getElementById('mode-btn-print').classList.toggle('mode-active', isPrint);
    document.getElementById('mode-btn-beli').classList.toggle('mode-active', !isPrint);
    if (!isPrint) renderPosCatalog();
}

/* ---------- Mode Print / Layanan ---------- */
function initPrintServicesSelect() {
    const select = document.getElementById('print-service-select');
    const previous = select.value;
    const items = products.filter(isService);
    select.innerHTML = items.map(p =>
        `<option value="${esc(p.id)}">${esc(p.name)} - ${rupiah(p.price)}/${esc(p.unit)} (Stok: ${p.stock})</option>`
    ).join('');
    if (previous && items.some(p => p.id === previous)) select.value = previous;
    updatePrintPrice();
}

function getPrintQty() { return Math.max(1, parseInt(document.getElementById('print-qty').value) || 1); }

function updatePrintPrice() {
    const id = document.getElementById('print-service-select').value;
    const item = products.find(p => p.id === id);
    if (!item) {
        document.getElementById('print-unit-price').innerText = 'Rp 0';
        document.getElementById('print-total-price').innerText = 'Rp 0';
        return;
    }
    document.getElementById('print-unit-price').innerText = rupiah(item.price);
    document.getElementById('print-total-price').innerText = rupiah(item.price * getPrintQty());
}

function addPrintToCart() {
    const id = document.getElementById('print-service-select').value;
    const item = products.find(p => p.id === id);
    if (!item) return alert('Belum ada layanan yang dipilih.');
    addItemToCart(item, getPrintQty());
}

/* ---------- Mode Beli Barang ---------- */
function renderPosCatalog() {
    const search = document.getElementById('pos-search').value.toLowerCase().trim();
    const grid = document.getElementById('pos-catalog-grid');
    const goods = products.filter(p => !isService(p) && p.name.toLowerCase().includes(search));

    if (goods.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-slate-400">${search ? `Tidak ada barang yang cocok dengan "${esc(search)}"` : 'Belum ada barang di katalog'}</div>`;
        return;
    }
    grid.innerHTML = goods.map(item => {
        const st = stockStatus(item);
        const s = CAT_STYLE[item.category];
        return `
        <div onclick="addToCart('${esc(item.id)}')" class="relative overflow-hidden p-3 pt-4 bg-white border ${st === 'low' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'} ${st === 'out' ? 'opacity-50' : ''} hover:border-navy-800 hover:shadow-md rounded-xl cursor-pointer transition shadow-sm flex flex-col justify-between">
            <span class="absolute top-0 left-0 right-0 h-1.5 ${s ? s.bar : 'bg-slate-300'}"></span>
            <div>
                <span class="text-[10px] text-slate-400 block">${esc(item.category)}</span>
                <h4 class="font-bold text-slate-800 text-xs mt-1">${esc(item.name)}</h4>
            </div>
            <div class="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                <span class="text-xs font-extrabold text-navy-900">${rupiah(item.price)}</span>
                <span class="text-[10px] ${st !== 'ok' ? 'text-amber-600 font-bold' : 'text-slate-500'}">${st === 'out' ? 'Habis' : 'Stok: ' + item.stock}</span>
            </div>
        </div>`;
    }).join('');
}

function addToCart(id) {
    const item = products.find(p => p.id === id);
    if (item) addItemToCart(item, 1);
}

/* ---------- Keranjang ---------- */
function addItemToCart(item, qty) {
    if (item.stock <= 0) return alert(`Maaf, stok "${item.name}" sudah habis!`);
    const existing = cart.find(c => c.id === item.id);
    const inCart = existing ? existing.qty : 0;
    if (item.stock < inCart + qty) {
        return alert(`Stok tidak mencukupi! Sisa stok: ${item.stock}` + (inCart ? ` (sudah ${inCart} di keranjang)` : ''));
    }
    if (existing) existing.qty += qty;
    else cart.push({ id: item.id, name: item.name, category: item.category, price: item.price, unit: item.unit, qty });
    renderCart();
}

function changeQty(id, delta) {
    const ci = cart.find(c => c.id === id);
    if (ci) setQty(id, ci.qty + delta);
}

function setQty(id, value) {
    const ci = cart.find(c => c.id === id);
    if (!ci) return;
    const qty = parseInt(value);
    if (isNaN(qty) || qty <= 0) return removeFromCart(id);
    const prod = products.find(p => p.id === id);
    if (prod && qty > prod.stock) {
        alert(`Stok tidak mencukupi! Sisa stok: ${prod.stock}`);
        ci.qty = prod.stock;
    } else {
        ci.qty = qty;
    }
    renderCart();
}

function removeFromCart(id) { cart = cart.filter(c => c.id !== id); renderCart(); }

function clearCart() {
    if (cart.length && !confirm('Kosongkan semua isi keranjang?')) return;
    cart = [];
    renderCart();
}

function syncCartWithProducts() {
    cart = cart.reduce((acc, ci) => {
        const p = products.find(x => x.id === ci.id);
        if (!p || p.stock <= 0) return acc;
        acc.push({ ...ci, name: p.name, category: p.category, price: p.price, unit: p.unit, qty: Math.min(ci.qty, p.stock) });
        return acc;
    }, []);
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    document.getElementById('cart-count').innerText = `${cart.reduce((s, i) => s + i.qty, 0)} item`;
    if (cart.length === 0) {
        container.innerHTML = `<div class="h-full min-h-[120px] flex flex-col items-center justify-center text-slate-300 gap-2"><i class="fa-solid fa-cart-shopping text-4xl"></i><p class="text-sm font-semibold">Keranjang kosong</p></div>`;
    } else {
        container.innerHTML = cart.map(i => `
        <div class="py-3 flex items-center gap-3 text-sm">
            <div class="min-w-0 flex-1">
                <p class="font-bold text-slate-800 truncate">${esc(i.name)}</p>
                <p class="text-xs text-slate-500">${rupiah(i.price)} / ${esc(i.unit)}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button onclick="changeQty('${esc(i.id)}', -1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">−</button>
                <input type="number" min="1" value="${i.qty}" onchange="setQty('${esc(i.id)}', this.value)" class="w-16 text-center px-1 py-1.5 border border-slate-200 rounded-lg text-sm font-bold">
                <button onclick="changeQty('${esc(i.id)}', 1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">+</button>
            </div>
            <span class="w-28 text-right font-extrabold text-navy-900 shrink-0">${rupiah(i.qty * i.price)}</span>
            <button onclick="removeFromCart('${esc(i.id)}')" title="Hapus" class="w-8 h-8 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"><i class="fa-solid fa-xmark"></i></button>
        </div>`).join('');
    }
    calculateCartTotal();
}

function getTotals() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const rawDiscount = parseFloat(document.getElementById('cart-discount').value) || 0;
    const discount = Math.min(Math.max(0, rawDiscount), subtotal);
    return { subtotal, discount, total: subtotal - discount };
}

function calculateCartTotal() {
    const { subtotal, total } = getTotals();
    document.getElementById('cart-subtotal').innerText = rupiah(subtotal);
    document.getElementById('cart-total').innerText = rupiah(total);
    updateCheckoutButton();
    calculateChange();
}

function calculateChange() {
    const { total } = getTotals();
    const pay = parseFloat(document.getElementById('cart-pay-amount').value) || 0;
    document.getElementById('cart-change').innerText = rupiah(Math.max(0, pay - total));
}

function setPayMethod(method) {
    paymentMethod = method;
    const isQris = method === 'qris';
    document.getElementById('qris-display-area').classList.toggle('hidden', !isQris);
    document.getElementById('cash-payment-fields').classList.toggle('hidden', isQris);
    document.getElementById('pay-method-qris').classList.toggle('pay-active', isQris);
    document.getElementById('pay-method-cash').classList.toggle('pay-active', !isQris);
    updateCheckoutButton();
}

function updateCheckoutButton() {
    const label = document.getElementById('checkout-label');
    if (!label) return;
    const { total } = getTotals();
    label.innerHTML = paymentMethod === 'qris' ? `TAGIH QRIS · ${rupiah(total)}` : 'PROSES &amp; CETAK STRUK';
}

function onCheckoutClick() {
    if (paymentMethod === 'qris') openQrisBill();
    else processCheckout();
}

/* =========================================================
   QRIS: baca QR, ubah jadi dinamis (nominal), tampilkan besar
   ========================================================= */
function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function parseTLV(str) {
    const out = [];
    let i = 0;
    while (i < str.length) {
        const id = str.substr(i, 2);
        const len = parseInt(str.substr(i + 2, 2), 10);
        if (!/^\d{2}$/.test(id) || isNaN(len) || i + 4 + len > str.length) return null;
        out.push({ id, val: str.substr(i + 4, len) });
        i += 4 + len;
    }
    return out;
}

function isValidQris(payload) {
    if (!payload || !payload.startsWith('000201') || payload.length < 30) return false;
    if (payload.substr(payload.length - 8, 4) !== '6304') return false;
    if (!parseTLV(payload)) return false;
    return crc16(payload.slice(0, -4)) === payload.slice(-4).toUpperCase();
}

// Ubah QRIS statis menjadi QRIS dinamis dengan nominal tertentu
function makeDynamicPayload(payload, amount) {
    const tlv = parseTLV(payload);
    if (!tlv) return null;
    let list = tlv.filter(t => t.id !== '63' && t.id !== '54').map(t => t.id === '01' ? { id: '01', val: '12' } : t);
    const amt = { id: '54', val: String(Math.round(amount)) };
    let idx = list.findIndex(t => parseInt(t.id, 10) > 54);
    if (idx < 0) idx = list.length;
    list.splice(idx, 0, amt);
    const body = list.map(t => t.id + String(t.val.length).padStart(2, '0') + t.val).join('') + '6304';
    return body + crc16(body);
}

function qrDataUrl(text) {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    return qr.createDataURL(10, 4);
}

function readAsDataURL(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => rej(new Error('Gagal membaca file'));
        r.readAsDataURL(file);
    });
}
function loadImageEl(src) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error('File bukan gambar yang valid'));
        img.src = src;
    });
}

// Perkecil gambar + coba baca isi QR-nya
async function processQrisSource(dataUrl, name, size) {
    const img = await loadImageEl(dataUrl);
    const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    let payload = null;
    if (typeof jsQR === 'function') {
        try {
            const data = ctx.getImageData(0, 0, w, h);
            const r = jsQR(data.data, w, h, { inversionAttempts: 'attemptBoth' });
            if (r && r.data && isValidQris(r.data.trim())) payload = r.data.trim();
        } catch (e) { /* abaikan, pakai gambar statis */ }
    }
    return {
        id: 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        name: name || 'QRIS',
        dataUrl: canvas.toDataURL('image/jpeg', 0.9),
        payload,
        size: size || 0,
        addedAt: new Date().toISOString()
    };
}

function saveQrisState() {
    const ok = saveJSON('insya_qris_files', qrisFiles);
    localStorage.setItem('insya_qris_active', activeQrisId || '');
    return ok;
}

async function migrateOldQris() {
    const old = localStorage.getItem('insya_qris_img');
    if (!old) return;
    if (!qrisFiles.length) {
        try {
            const f = await processQrisSource(old, 'QRIS (file lama)', 0);
            qrisFiles.push(f);
            activeQrisId = f.id;
            saveQrisState();
        } catch (e) { return; }
    }
    localStorage.removeItem('insya_qris_img');
}

async function handleQrisUpload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    for (const file of files) {
        if (!file.type.startsWith('image/')) { alert(`"${file.name}" bukan file gambar.`); continue; }
        if (file.size > 8 * 1024 * 1024) { alert(`"${file.name}" terlalu besar (maks. 8 MB).`); continue; }
        try {
            const dataUrl = await readAsDataURL(file);
            const f = await processQrisSource(dataUrl, file.name, file.size);
            qrisFiles.push(f);
            if (!activeQrisId || !qrisFiles.some(q => q.id === activeQrisId)) activeQrisId = f.id;
            if (!saveQrisState()) { qrisFiles.pop(); break; }
            notify(f.payload ? `${file.name}: QR terbaca, nominal otomatis aktif.` : `${file.name}: tersimpan sebagai gambar (QR tidak terbaca, nominal tidak otomatis).`,
                { type: f.payload ? 'success' : 'warn', duration: 5000 });
        } catch (err) {
            alert(`Gagal memproses "${file.name}": ${err.message}`);
        }
    }
    renderQrisManager();
    renderQrisCart();
}

function getActiveQris() {
    return qrisFiles.find(q => q.id === activeQrisId) || qrisFiles[0] || null;
}

function setActiveQris(id) {
    activeQrisId = id;
    saveQrisState();
    renderQrisManager();
    renderQrisCart();
}

function deleteQrisFile(id) {
    const f = qrisFiles.find(q => q.id === id);
    if (!f || !confirm(`Hapus file QRIS "${f.name}"?`)) return;
    qrisFiles = qrisFiles.filter(q => q.id !== id);
    if (activeQrisId === id) activeQrisId = qrisFiles[0] ? qrisFiles[0].id : '';
    saveQrisState();
    renderQrisManager();
    renderQrisCart();
}

function renderQrisManager() {
    const list = document.getElementById('qris-files-list');
    if (!list) return;
    if (!qrisFiles.length) {
        list.innerHTML = `<div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">Belum ada file QRIS. Klik <b>Tambah File</b> untuk mengunggah.</div>`;
        return;
    }
    const act = getActiveQris();
    list.innerHTML = qrisFiles.map(f => {
        const isActive = act && act.id === f.id;
        return `
        <div class="rounded-2xl border-2 ${isActive ? 'border-gold-500 bg-amber-50/40' : 'border-slate-200'} p-3 flex gap-3">
            <img src="${f.dataUrl}" alt="QRIS" onclick="previewQris('${esc(f.id)}')" class="w-24 h-24 object-contain bg-white border border-slate-200 rounded-lg cursor-zoom-in shrink-0">
            <div class="flex-1 min-w-0 text-xs space-y-1.5">
                <p class="font-bold text-slate-800 truncate">${esc(f.name)}</p>
                <p class="text-slate-500">${f.size ? Math.round(f.size / 1024) + ' KB · ' : ''}${fmtDateTime(f.addedAt)}</p>
                <p>${f.payload
                    ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold"><i class="fa-solid fa-circle-check"></i> Nominal otomatis aktif</span>'
                    : '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold"><i class="fa-solid fa-image"></i> Gambar statis (nominal tidak otomatis)</span>'}</p>
                <div class="flex flex-wrap gap-2 pt-1">
                    ${isActive
                        ? '<span class="px-3 py-1 rounded-lg bg-gold-500 text-navy-900 font-extrabold">Dipakai di Kasir</span>'
                        : `<button onclick="setActiveQris('${esc(f.id)}')" class="px-3 py-1 rounded-lg bg-navy-900 text-white font-bold hover:bg-navy-800">Jadikan Aktif</button>`}
                    <button onclick="deleteQrisFile('${esc(f.id)}')" class="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 font-bold hover:bg-rose-50"><i class="fa-solid fa-trash-can"></i> Hapus</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderQrisCart() {
    const img = document.getElementById('qris-image-preview');
    const empty = document.getElementById('qris-image-empty');
    const status = document.getElementById('qris-status');
    if (!img) return;
    const f = getActiveQris();
    if (!f) {
        img.classList.add('hidden'); empty.classList.remove('hidden');
        status.textContent = 'Unggah QRIS di menu Pengaturan.';
        return;
    }
    img.src = f.dataUrl;
    img.classList.remove('hidden'); empty.classList.add('hidden');
    status.textContent = f.payload ? 'Siap menagih nominal otomatis.' : 'Gambar statis: pelanggan input nominal sendiri.';
}

/* ---- Layar tagihan QRIS ---- */
function showQrisOverlay({ amount, file, customer }) {
    const hasAmount = amount != null;
    let src = file.dataUrl, dynamic = false;
    if (hasAmount && file.payload && typeof qrcode === 'function') {
        try {
            const dyn = makeDynamicPayload(file.payload, amount);
            if (dyn) { src = qrDataUrl(dyn); dynamic = true; }
        } catch (e) { /* jatuh ke gambar statis */ }
    }
    const img = document.getElementById('qb-img');
    img.src = src;
    img.style.imageRendering = dynamic ? 'pixelated' : 'auto';
    document.getElementById('qb-label').innerText = hasAmount ? 'Total Tagihan' : 'Scan QRIS Untuk Membayar';
    document.getElementById('qb-amount').innerText = hasAmount ? rupiah(amount) : 'QRIS';
    document.getElementById('qb-cust').innerText = hasAmount && customer ? `a.n. ${customer}` : '';
    document.getElementById('qb-note').innerText = !hasAmount ? 'Pelanggan memasukkan nominal sendiri.'
        : dynamic ? 'QR sudah berisi nominal. Pelanggan cukup scan lalu konfirmasi pembayaran.'
        : 'QR ini statis: minta pelanggan mengetik nominal sesuai tagihan di atas.';
    document.getElementById('qb-actions').classList.toggle('hidden', !hasAmount);
    document.getElementById('qris-bill').classList.remove('hidden');
}

function noQrisAlert() {
    alert('Belum ada file QRIS. Unggah dulu di menu Pengaturan.');
    switchTab('pengaturan');
}

function openQrisBill() {
    if (cart.length === 0) return alert('Keranjang kosong!');
    const { total } = getTotals();
    if (total <= 0) return processCheckout();
    const f = getActiveQris();
    if (!f) return noQrisAlert();
    showQrisOverlay({ amount: total, file: f, customer: document.getElementById('cart-customer').value.trim() });
}

function openQrisBig() {
    const f = getActiveQris();
    if (!f) return noQrisAlert();
    showQrisOverlay({ amount: null, file: f });
}

function previewQris(id) {
    const f = qrisFiles.find(q => q.id === id);
    if (f) showQrisOverlay({ amount: null, file: f });
}

function closeQrisBill() { document.getElementById('qris-bill').classList.add('hidden'); }

function confirmQrisPaid() {
    closeQrisBill();
    processCheckout();
}

/* =========================================================
   STOK & PERINGATAN
   ========================================================= */
function stockStatus(p) {
    if (p.stock <= 0) return 'out';
    if (p.stock <= p.minStock) return 'low';
    return 'ok';
}
function getLowStock() { return products.filter(p => stockStatus(p) !== 'ok'); }

function updateStockBadge() {
    const n = getLowStock().length;
    const badge = document.getElementById('low-badge');
    badge.textContent = n;
    badge.classList.toggle('hidden', n === 0);
    const bell = document.getElementById('bell-btn');
    bell.classList.toggle('text-rose-600', n > 0);
    renderNotifPanel();
}

function renderNotifPanel() {
    const list = document.getElementById('notif-list');
    const low = getLowStock().sort((a, b) => a.stock - b.stock);
    if (!low.length) {
        list.innerHTML = `<p class="p-5 text-center text-xs text-slate-400"><i class="fa-solid fa-circle-check text-emerald-500 text-2xl block mb-2"></i>Semua stok aman</p>`;
        return;
    }
    list.innerHTML = low.map(p => {
        const out = p.stock <= 0;
        return `<div class="px-4 py-2.5 flex items-center justify-between gap-3 text-xs ${out ? 'bg-rose-50' : 'bg-amber-50/60'}">
            <div class="min-w-0"><p class="font-bold text-slate-800 truncate">${esc(p.name)}</p><p class="text-slate-500">Batas peringatan: ${p.minStock} ${esc(p.unit)}</p></div>
            <span class="shrink-0 px-2 py-1 rounded-md font-extrabold ${out ? 'bg-rose-600 text-white' : 'bg-gold-500 text-navy-900'}">${out ? 'HABIS' : 'Sisa ' + p.stock}</span>
        </div>`;
    }).join('');
}

function toggleNotifPanel() { document.getElementById('notif-panel').classList.toggle('hidden'); }

function updateNotifPermStatus() {
    const el = document.getElementById('notif-perm-status');
    if (!el) return;
    if (!('Notification' in window)) { el.textContent = 'Browser tidak mendukung.'; return; }
    el.textContent = { granted: '✓ Aktif', denied: 'Diblokir di browser', default: 'Belum diaktifkan' }[Notification.permission];
}

function requestNotifPermission() {
    if (!('Notification' in window)) return alert('Browser ini tidak mendukung notifikasi.');
    Notification.requestPermission().then(() => {
        updateNotifPermStatus();
        if (Notification.permission === 'granted') notify('Notifikasi browser aktif.', { type: 'success' });
    });
}

function browserNotify(title, body) {
    try {
        if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body });
    } catch (e) { /* abaikan */ }
}

/* =========================================================
   CHECKOUT & STRUK
   ========================================================= */
function newTrxId() {
    const d = new Date();
    const base = `TRX-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    let id = base, n = 1;
    while (transactions.some(t => t.id === id)) id = `${base}-${n++}`;
    return id;
}

function processCheckout() {
    if (cart.length === 0) return alert('Keranjang kosong!');

    for (const ci of cart) {
        const p = products.find(x => x.id === ci.id);
        if (!p) return alert(`Item "${ci.name}" sudah tidak ada di katalog. Hapus dari keranjang.`);
        if (p.stock < ci.qty) return alert(`Stok "${p.name}" tidak mencukupi! Sisa: ${p.stock}`);
    }

    const { subtotal, discount, total } = getTotals();
    let paid = total, change = 0;
    if (paymentMethod === 'cash') {
        paid = parseFloat(document.getElementById('cart-pay-amount').value) || 0;
        if (paid < total) return alert(`Nominal bayar kurang! Total yang harus dibayar ${rupiah(total)}.`);
        change = paid - total;
    }

    // Kurangi stok + catat item yang baru menipis / habis
    const stockAlerts = [];
    cart.forEach(ci => {
        const prod = products.find(p => p.id === ci.id);
        if (!prod) return;
        const before = stockStatus(prod);
        prod.stock = Math.max(0, prod.stock - ci.qty);
        const after = stockStatus(prod);
        if (after !== before && after !== 'ok') stockAlerts.push({ name: prod.name, unit: prod.unit, stock: prod.stock, status: after });
    });

    const trx = {
        id: newTrxId(),
        timestamp: new Date().toISOString(),
        customer: document.getElementById('cart-customer').value.trim(),
        items: cart.map(i => ({ ...i })),
        subtotal, discount, total, paid, change,
        method: paymentMethod
    };
    transactions.unshift(trx);
    const ok = saveProducts() && saveJSON('insya_transactions', transactions);

    cart = [];
    document.getElementById('cart-discount').value = 0;
    document.getElementById('cart-pay-amount').value = '';
    document.getElementById('cart-customer').value = '';
    renderCart();
    renderPosCatalog();
    initPrintServicesSelect();
    updateStockBadge();

    if (ok) toast(`Transaksi ${trx.id} berhasil`);
    stockAlerts.forEach(a => {
        const msg = a.status === 'out' ? `${a.name} HABIS. Segera restok!` : `${a.name} menipis, sisa ${a.stock} ${a.unit}.`;
        notify(msg, { type: a.status === 'out' ? 'danger' : 'warn', title: 'Peringatan Stok', duration: 9000 });
        browserNotify('Peringatan Stok PRINT INSYA', msg);
    });
    printReceipt(trx);
}

function buildReceipt(t) {
    const rows = t.items.map(i => `
        <div class="r-item">${esc(i.name)}</div>
        <div class="r-row"><span>${i.qty} x ${Number(i.price).toLocaleString('id-ID')}</span><span>${Number(i.qty * i.price).toLocaleString('id-ID')}</span></div>`).join('');
    const subtotal = t.subtotal ?? t.items.reduce((s, i) => s + i.price * i.qty, 0);
    const discount = t.discount ?? Math.max(0, subtotal - t.total);
    const methodLabel = t.method === 'qris' ? 'QRIS' : 'TUNAI';
    return `
    <div class="receipt">
        <div class="r-center r-bold r-title">PRINT INSYA</div>
        <div class="r-center">Cetak Mudah, Hasil Rapi</div>
        <div class="r-line"></div>
        <div class="r-row"><span>No</span><span>${esc(t.id)}</span></div>
        <div class="r-row"><span>Tgl</span><span>${new Date(t.timestamp).toLocaleString('id-ID')}</span></div>
        ${t.customer ? `<div class="r-row"><span>Pelanggan</span><span>${esc(t.customer)}</span></div>` : ''}
        <div class="r-line"></div>
        ${rows}
        <div class="r-line"></div>
        <div class="r-row"><span>Subtotal</span><span>${subtotal.toLocaleString('id-ID')}</span></div>
        ${discount > 0 ? `<div class="r-row"><span>Diskon</span><span>-${discount.toLocaleString('id-ID')}</span></div>` : ''}
        <div class="r-row r-bold"><span>TOTAL</span><span>${t.total.toLocaleString('id-ID')}</span></div>
        <div class="r-row"><span>Bayar (${methodLabel})</span><span>${Number(t.paid ?? t.total).toLocaleString('id-ID')}</span></div>
        ${t.method === 'cash' ? `<div class="r-row"><span>Kembali</span><span>${Number(t.change ?? 0).toLocaleString('id-ID')}</span></div>` : ''}
        <div class="r-line"></div>
        <div class="r-center">Terima kasih atas kunjungan Anda</div>
    </div>`;
}

function printReceipt(t) {
    document.getElementById('print-area').innerHTML = buildReceipt(t);
    setTimeout(() => window.print(), 150);
}
function reprintReceipt(id) {
    const t = transactions.find(x => x.id === id);
    if (t) printReceipt(t);
}

/* =========================================================
   LAPORAN
   ========================================================= */
function getTodayTransactions() {
    const today = dateKey(new Date());
    return transactions.filter(t => dateKey(t.timestamp) === today);
}

function aggregateRows(rows) {
    const result = {};
    rows.forEach(({ i }) => {
        const cat = i.category || 'Lainnya';
        if (!result[cat]) result[cat] = { qty: 0, revenue: 0 };
        result[cat].qty += i.qty;
        result[cat].revenue += i.price * i.qty;
    });
    return result;
}

function renderDailyReport() {
    const d = getTodayTransactions();
    const sum = list => list.reduce((s, t) => s + t.total, 0);
    document.getElementById('daily-omset').innerText = rupiah(sum(d));
    document.getElementById('daily-count').innerText = `${d.length} Nota`;
    document.getElementById('daily-items').innerText = `${d.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0)} pcs`;
    document.getElementById('daily-cash').innerText = rupiah(sum(d.filter(t => t.method === 'cash')));
    document.getElementById('daily-qris').innerText = rupiah(sum(d.filter(t => t.method === 'qris')));
}

/* ---- Audit: pencarian + tabel waktu ---- */
function getAuditRows() {
    const q = document.getElementById('audit-search').value.toLowerCase().trim();
    const from = document.getElementById('audit-from').value;
    const to = document.getElementById('audit-to').value;
    const rows = [];
    transactions.forEach(t => {
        const dk = dateKey(t.timestamp);
        if (from && dk < from) return;
        if (to && dk > to) return;
        t.items.forEach(i => {
            const hay = [t.id, t.customer, i.name, i.category, t.method].join(' ').toLowerCase();
            if (q && !hay.includes(q)) return;
            rows.push({ t, i });
        });
    });
    return rows;
}

function resetAuditFilter() {
    document.getElementById('audit-search').value = '';
    document.getElementById('audit-from').value = '';
    document.getElementById('audit-to').value = '';
    renderAuditReport();
}

function renderAuditReport() {
    const rows = getAuditRows();
    const audit = aggregateRows(rows);
    const cats = Object.keys(audit);
    const grand = cats.reduce((s, c) => s + audit[c].revenue, 0);
    document.getElementById('audit-info').innerText = rows.length ? `${rows.length} baris · ${rupiah(grand)}` : '';

    const tbody = document.getElementById('audit-category-table');
    tbody.innerHTML = cats.length ? cats.map(cat => `
        <tr>
            <td class="py-3 font-semibold text-slate-800">${catBadge(cat)}</td>
            <td class="py-3 text-center font-semibold text-slate-600">${audit[cat].qty} pcs</td>
            <td class="py-3 text-right font-bold text-navy-900">${rupiah(audit[cat].revenue)}</td>
        </tr>`).join('') + `
        <tr class="bg-slate-50"><td class="py-3 font-extrabold">TOTAL</td><td></td><td class="py-3 text-right font-extrabold text-navy-900">${rupiah(grand)}</td></tr>`
        : `<tr><td colspan="3" class="py-4 text-center text-slate-400">Tidak ada data yang cocok.</td></tr>`;

    const detail = document.getElementById('audit-detail-table');
    detail.innerHTML = rows.length ? rows.map(({ t, i }) => `
        <tr class="hover:bg-slate-50">
            <td class="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">${fmtDateTime(t.timestamp)}</td>
            <td class="py-2.5 px-4 text-xs font-bold text-navy-900 whitespace-nowrap">#${esc(t.id)}</td>
            <td class="py-2.5 px-4 text-xs">${esc(t.customer) || '-'}</td>
            <td class="py-2.5 px-4 font-semibold">${esc(i.name)}</td>
            <td class="py-2.5 px-4">${catBadge(i.category)}</td>
            <td class="py-2.5 px-4 text-center">${i.qty}</td>
            <td class="py-2.5 px-4 text-right">${rupiah(i.price)}</td>
            <td class="py-2.5 px-4 text-right font-bold">${rupiah(i.price * i.qty)}</td>
        </tr>`).join('')
        : `<tr><td colspan="8" class="py-6 text-center text-slate-400">${transactions.length ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada data transaksi untuk diaudit.'}</td></tr>`;
}

/* ---- WhatsApp ---- */
function openWhatsApp(msg) { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank'); }

function sendDailyReportToWA() {
    if (!waNumber) return alert('Silakan atur nomor WhatsApp di menu Pengaturan terlebih dahulu!');
    const d = getTodayTransactions();
    const omset = d.reduce((s, t) => s + t.total, 0);
    const items = d.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0);
    openWhatsApp(`*LAPORAN HARIAN PRINT INSYA*\nTanggal: ${new Date().toLocaleDateString('id-ID')}\nTotal Omset: ${rupiah(omset)}\nTotal Transaksi: ${d.length} Nota\nItem Terjual: ${items} pcs`);
}

function sendAuditReportToWA() {
    if (!waNumber) return alert('Silakan atur nomor WhatsApp di menu Pengaturan terlebih dahulu!');
    const rows = getAuditRows();
    const audit = aggregateRows(rows);
    const cats = Object.keys(audit);
    if (!cats.length) return alert('Belum ada data audit transaksi untuk dikirim!');
    const grand = cats.reduce((s, c) => s + audit[c].revenue, 0);
    const details = cats.map(c => `• *${c}*: ${audit[c].qty} pcs (${rupiah(audit[c].revenue)})`).join('\n');
    const from = document.getElementById('audit-from').value, to = document.getElementById('audit-to').value;
    const periode = (from || to) ? `\nPeriode: ${from || '...'} s/d ${to || '...'}` : '';
    openWhatsApp(`*LAPORAN AUDIT KATEGORI PRINT INSYA*${periode}\n\n*Rincian Penjualan Per Kategori:*\n${details}\n\n*TOTAL AKUMULASI OMSET:* ${rupiah(grand)}`);
}

/* ---- Pengaturan WA ---- */
function formatWa(num) {
    if (!num) return '';
    return '+' + num.replace(/^(\d{2})(\d{3,4})(\d{3,4})(\d*)$/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));
}
function renderWaSaved() {
    const box = document.getElementById('wa-saved');
    if (!box) return;
    box.classList.toggle('hidden', !waNumber);
    document.getElementById('wa-saved-number').innerText = formatWa(waNumber);
    document.getElementById('setting-wa-no').value = '';
    document.getElementById('setting-wa-no').placeholder = waNumber ? 'Ketik nomor baru untuk mengganti' : 'Contoh: 08123456789 atau 628123456789';
}
function saveWaNumber() {
    let num = document.getElementById('setting-wa-no').value.replace(/\D/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    if (num.length < 9) return alert('Nomor WhatsApp tidak valid.');
    waNumber = num;
    localStorage.setItem('insya_wa_no', waNumber);
    renderWaSaved();
    toast('Nomor WhatsApp tersimpan');
}
function deleteWaNumber() {
    if (!confirm('Hapus nomor WhatsApp tersimpan?')) return;
    waNumber = '';
    localStorage.removeItem('insya_wa_no');
    renderWaSaved();
}

/* =========================================================
   RIWAYAT + HAPUS TRANSAKSI
   ========================================================= */
function renderHistory() {
    const tbody = document.getElementById('history-table-body');
    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">Belum ada riwayat transaksi</td></tr>`;
        return;
    }
    tbody.innerHTML = transactions.map(t => `
        <tr class="hover:bg-slate-50">
            <td class="py-3 px-4 font-bold text-navy-900">#${esc(t.id)}</td>
            <td class="py-3 px-4 text-xs text-slate-500">${fmtDateTime(t.timestamp)}</td>
            <td class="py-3 px-4 text-xs text-slate-600">${esc(t.customer) || '-'}</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${t.method === 'qris' ? 'bg-gold-500 text-navy-900' : 'bg-navy-900 text-white'}">${esc(String(t.method).toUpperCase())}</span></td>
            <td class="py-3 px-4 text-right font-bold text-slate-800">${rupiah(t.total)}</td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
                <button onclick="reprintReceipt('${esc(t.id)}')" title="Cetak ulang struk" class="p-1.5 text-navy-800 hover:bg-slate-100 rounded"><i class="fa-solid fa-print"></i></button>
                <button onclick="askDeleteTransaction('${esc(t.id)}')" title="Hapus transaksi" class="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>`).join('');
}

function askDeleteTransaction(id) {
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    pendingDeleteTrx = id;
    document.getElementById('del-trx-info').innerHTML = `
        <p><b>#${esc(t.id)}</b> · ${fmtDateTime(t.timestamp)}</p>
        <p>${t.items.map(i => `${esc(i.name)} ×${i.qty}`).join(', ')}</p>
        <p class="font-extrabold text-navy-900">${rupiah(t.total)} (${esc(String(t.method).toUpperCase())})</p>`;
    document.getElementById('del-restore-stock').checked = true;
    document.getElementById('delete-trx-modal').classList.remove('hidden');
}
function closeDeleteTrxModal() {
    pendingDeleteTrx = null;
    document.getElementById('delete-trx-modal').classList.add('hidden');
}
function confirmDeleteTransaction() {
    const t = transactions.find(x => x.id === pendingDeleteTrx);
    if (!t) return closeDeleteTrxModal();
    if (document.getElementById('del-restore-stock').checked) {
        t.items.forEach(i => {
            const p = products.find(x => x.id === i.id);
            if (p) p.stock += i.qty;
        });
        saveProducts();
    }
    transactions = transactions.filter(x => x.id !== t.id);
    saveJSON('insya_transactions', transactions);
    closeDeleteTrxModal();
    renderHistory();
    renderPosCatalog();
    initPrintServicesSelect();
    updateStockBadge();
    toast(`Transaksi ${t.id} dihapus`);
}

/* =========================================================
   KELOLA PRODUK
   ========================================================= */
function renderProductsTable() {
    const tbody = document.getElementById('products-table-body');
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400 text-xs">Katalog kosong. Klik "+ Tambah Item".</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map(item => {
        const st = stockStatus(item);
        return `
        <tr class="hover:bg-slate-50 ${st === 'out' ? 'bg-rose-50/60' : st === 'low' ? 'bg-amber-50/60' : ''}">
            <td class="py-3 px-4 font-bold text-slate-800">
                ${esc(item.name)}
                ${st === 'low' ? '<span class="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-semibold"><i class="fa-solid fa-triangle-exclamation"></i> Stok Menipis</span>' : ''}
                ${st === 'out' ? '<span class="ml-2 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded font-semibold">HABIS</span>' : ''}
            </td>
            <td class="py-3 px-4">${catBadge(item.category)}</td>
            <td class="py-3 px-4 font-bold text-navy-900">${rupiah(item.price)}</td>
            <td class="py-3 px-4 text-center font-bold ${st !== 'ok' ? 'text-amber-600' : 'text-slate-700'}">${item.stock} ${esc(item.unit)}</td>
            <td class="py-3 px-4 text-center text-xs text-slate-500">${item.minStock} ${esc(item.unit)}</td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
                <button onclick="openProductModal('${esc(item.id)}')" title="Edit" class="p-1 text-navy-800 hover:bg-slate-100 rounded"><i class="fa-solid fa-pen-to-square"></i></button>
                <button onclick="deleteProduct('${esc(item.id)}')" title="Hapus" class="p-1 text-rose-600 hover:bg-rose-50 rounded"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function refreshAfterProductChange() {
    saveProducts();
    syncCartWithProducts();
    renderProductsTable();
    renderPosCatalog();
    initPrintServicesSelect();
    renderCart();
    updateStockBadge();
}

function deleteProduct(id) {
    const p = products.find(x => x.id === id);
    if (!p || !confirm(`Hapus "${p.name}" dari katalog?`)) return;
    products = products.filter(x => x.id !== id);
    refreshAfterProductChange();
}

function openProductModal(id) {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-product-title').innerText = 'Tambah Item Baru';
    const p = id ? products.find(x => x.id === id) : null;
    if (p) {
        document.getElementById('modal-product-title').innerText = 'Edit Item';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-unit').value = p.unit;
        document.getElementById('prod-stock').value = p.stock;
        document.getElementById('prod-min-stock').value = p.minStock;
    }
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('prod-name').focus();
}
function closeProductModal() { document.getElementById('product-modal').classList.add('hidden'); }

function handleProductSubmit(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('prod-name').value.trim(),
        category: document.getElementById('prod-category').value,
        price: Math.max(0, parseFloat(document.getElementById('prod-price').value) || 0),
        unit: document.getElementById('prod-unit').value.trim(),
        stock: Math.max(0, parseInt(document.getElementById('prod-stock').value) || 0),
        minStock: Math.max(0, parseInt(document.getElementById('prod-min-stock').value) || 0)
    };
    if (!data.name || !data.unit) return alert('Nama dan satuan wajib diisi.');

    const editId = document.getElementById('prod-id').value;
    const existing = editId ? products.find(p => p.id === editId) : null;
    if (existing) Object.assign(existing, data);
    else products.push({ id: 'p-' + Date.now(), ...data });

    closeProductModal();
    refreshAfterProductChange();
    toast(existing ? 'Item diperbarui' : 'Item ditambahkan');
    if (stockStatus(existing || products[products.length - 1]) !== 'ok') {
        const it = existing || products[products.length - 1];
        notify(`${it.name}: stok ${it.stock <= 0 ? 'habis' : 'menipis (' + it.stock + ')'}.`, { type: 'warn', title: 'Peringatan Stok', duration: 6000 });
    }
}

/* =========================================================
   MODAL USAHA
   ========================================================= */
function saveCapital() { return saveJSON('insya_capital', capital); }

function renderCapital() {
    const masuk = capital.filter(c => c.type === 'masuk');
    const keluar = capital.filter(c => c.type === 'keluar');
    const sum = l => l.reduce((s, c) => s + c.amount, 0);
    const inT = sum(masuk), outT = sum(keluar);
    document.getElementById('cap-in').innerText = rupiah(inT);
    document.getElementById('cap-out').innerText = rupiah(outT);
    document.getElementById('cap-left').innerText = rupiah(inT - outT);
    document.getElementById('cap-omset').innerText = rupiah(transactions.reduce((s, t) => s + t.total, 0));

    const breakdown = (list, total, color) => {
        const by = {};
        list.forEach(c => { by[c.category] = (by[c.category] || 0) + c.amount; });
        const keys = Object.keys(by).sort((a, b) => by[b] - by[a]);
        if (!keys.length) return '<p class="text-xs text-slate-400">Belum ada data.</p>';
        return keys.map(k => {
            const pct = total ? Math.round(by[k] / total * 100) : 0;
            return `<div><div class="flex justify-between"><span class="font-semibold text-slate-700">${esc(k)}</span><span class="font-bold text-navy-900">${rupiah(by[k])} <span class="text-xs text-slate-400">(${pct}%)</span></span></div>
                <div class="h-2 bg-slate-100 rounded-full mt-1 overflow-hidden"><div class="h-full ${color} rounded-full" style="width:${pct}%"></div></div></div>`;
        }).join('');
    };
    document.getElementById('cap-sources').innerHTML = breakdown(masuk, inT, 'bg-emerald-500');
    document.getElementById('cap-uses').innerHTML = breakdown(keluar, outT, 'bg-rose-500');

    const tbody = document.getElementById('cap-table-body');
    const sorted = [...capital].sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
    tbody.innerHTML = sorted.length ? sorted.map(c => `
        <tr class="hover:bg-slate-50">
            <td class="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">${new Date(c.date + 'T00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${c.type === 'masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${c.type === 'masuk' ? 'Modal Masuk' : 'Pemakaian'}</span></td>
            <td class="py-3 px-4 font-semibold">${esc(c.category)}</td>
            <td class="py-3 px-4 text-xs text-slate-600">${esc(c.note) || '-'}</td>
            <td class="py-3 px-4 text-right font-bold ${c.type === 'masuk' ? 'text-emerald-600' : 'text-rose-600'}">${c.type === 'masuk' ? '+' : '−'} ${rupiah(c.amount)}</td>
            <td class="py-3 px-4 text-center"><button onclick="deleteCapital('${esc(c.id)}')" title="Hapus" class="p-1 text-rose-600 hover:bg-rose-50 rounded"><i class="fa-solid fa-trash-can"></i></button></td>
        </tr>`).join('')
        : `<tr><td colspan="6" class="py-6 text-center text-slate-400">Belum ada catatan modal. Klik "+ Catat Modal".</td></tr>`;
}

function fillCapitalCategories() {
    const type = document.getElementById('cap-type').value;
    const list = type === 'masuk' ? CAPITAL_SOURCES : CAPITAL_USES;
    document.getElementById('cap-cat-label').innerText = type === 'masuk' ? 'Asal Modal' : 'Dipakai Untuk';
    document.getElementById('cap-category').innerHTML = list.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
}

function openCapitalModal() {
    document.getElementById('capital-form').reset();
    document.getElementById('cap-date').value = dateKey(new Date());
    fillCapitalCategories();
    document.getElementById('capital-modal').classList.remove('hidden');
}
function closeCapitalModal() { document.getElementById('capital-modal').classList.add('hidden'); }

function handleCapitalSubmit(e) {
    e.preventDefault();
    const amount = Math.round(parseFloat(document.getElementById('cap-amount').value) || 0);
    if (amount <= 0) return alert('Nominal harus lebih dari 0.');
    capital.push({
        id: 'c-' + Date.now(),
        date: document.getElementById('cap-date').value || dateKey(new Date()),
        type: document.getElementById('cap-type').value,
        category: document.getElementById('cap-category').value,
        note: document.getElementById('cap-note').value.trim(),
        amount,
        createdAt: new Date().toISOString()
    });
    saveCapital();
    closeCapitalModal();
    renderCapital();
    toast('Catatan modal tersimpan');
}

function deleteCapital(id) {
    const c = capital.find(x => x.id === id);
    if (!c || !confirm(`Hapus catatan "${c.category}" sebesar ${rupiah(c.amount)}?`)) return;
    capital = capital.filter(x => x.id !== id);
    saveCapital();
    renderCapital();
}
