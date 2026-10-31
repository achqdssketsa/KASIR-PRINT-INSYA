/* =========================================================
   PRINT INSYA - Sistem Kasir POS
   ========================================================= */

/* ---------- KONFIGURASI LOGIN GOOGLE (Firebase) ----------
   Isi dari Firebase Console > Project settings > Your apps > Web app.
   Selama masih "ISI_...", layar login menampilkan petunjuk pengaturan. */
const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyBu4cyQ_hE3z6ZdMTqaQj4GAHrft0AIGSY',
    authDomain: 'kasir-81f9e.firebaseapp.com',
    projectId: 'kasir-81f9e',
    appId: '1:36507233313:web:68328fb86a2f13434d8760'
};
// Daftar email yang boleh masuk. Kosongkan [] jika semua akun Google yang login boleh mengakses.
// Contoh: ['achqds@gmail.com', 'ibnjury@gmail.com']
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

const CAPITAL_SOURCES = ['Modal Toko', 'Modal Pribadi', 'Pinjaman Bank / Koperasi', 'Pinjaman Keluarga / Teman', 'Investor / Patungan', 'Hibah / Bantuan', 'Dari Laba Usaha', 'Lainnya'];
const CAPITAL_USES = ['Beli Stok Barang', 'Beli Mesin / Peralatan', 'Sewa / Operasional', 'Listrik / Internet', 'Gaji / Upah', 'Prive (Ambil Pribadi)', 'Lainnya'];
// Pengeluaran yang dihitung sebagai BIAYA (mengurangi laba). Beli stok = persediaan (jadi HPP saat terjual), peralatan = aset, prive = ambil pribadi.
const EXPENSE_CATS = ['Sewa / Operasional', 'Listrik / Internet', 'Gaji / Upah', 'Lainnya'];

/* ---------- Helper ---------- */
function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function rupiah(n) {
    const v = Number(n) || 0;
    return (v < 0 ? '-' : '') + 'Rp ' + Math.abs(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}
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
function saveProducts() { return kvSet('products', products); }

/* ---------- Penyimpanan: IndexedDB (kapasitas besar), cadangan ke localStorage bila tidak tersedia ---------- */
let idb = null;
let storageMode = 'local';
let storageErrShown = false;

function openDB() {
    return new Promise(resolve => {
        if (!window.indexedDB) return resolve(null);
        try {
            const rq = indexedDB.open('insya_db', 1);
            rq.onupgradeneeded = () => { const d = rq.result; d.createObjectStore('kv'); d.createObjectStore('trx', { keyPath: 'id' }); };
            rq.onsuccess = () => resolve(rq.result);
            rq.onerror = () => resolve(null);
            rq.onblocked = () => resolve(null);
        } catch (e) { resolve(null); }
    });
}
function idbReq(store, mode, fn) {
    return new Promise((resolve, reject) => {
        const tx = idb.transaction(store, mode);
        let result;
        const r = fn(tx.objectStore(store));
        if (r) r.onsuccess = () => { result = r.result; };
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transaksi database dibatalkan'));
    });
}
function storageFail(e) {
    console.error(e);
    if (!storageErrShown) {
        storageErrShown = true;
        notify('Gagal menyimpan data ke browser. Segera unduh cadangan di menu Pengaturan.', { type: 'danger', title: 'Penyimpanan Bermasalah', duration: 12000 });
    }
}
function kvSet(key, val) {
    if (idb) return idbReq('kv', 'readwrite', s => s.put(val, key)).catch(storageFail);
    try { localStorage.setItem('insya_' + key, JSON.stringify(val)); } catch (e) { storageFail(e); }
    return Promise.resolve();
}
async function kvGet(key) {
    if (idb) return idbReq('kv', 'readonly', s => s.get(key));
    try { return JSON.parse(localStorage.getItem('insya_' + key)); } catch (e) { return undefined; }
}
function saveTrx(t) {
    if (idb) return idbReq('trx', 'readwrite', s => s.put(t)).catch(storageFail);
    return kvSet('transactions', transactions);
}
function removeTrx(id) {
    if (idb) return idbReq('trx', 'readwrite', s => s.delete(id)).catch(storageFail);
    return kvSet('transactions', transactions);
}
function legacyGet(key) {
    try { const v = JSON.parse(localStorage.getItem('insya_' + key)); return Array.isArray(v) ? v : undefined; } catch (e) { return undefined; }
}

async function initStorage() {
    idb = await openDB();
    storageMode = idb ? 'idb' : 'local';

    const loadKey = async (key, fallback) => {
        let v = await kvGet(key);
        if (!Array.isArray(v) && idb) {            // pindahkan data lama dari localStorage ke IndexedDB
            const old = legacyGet(key);
            if (old) {
                await kvSet(key, old);
                if (Array.isArray(await kvGet(key))) localStorage.removeItem('insya_' + key);
                v = old;
            }
        }
        return Array.isArray(v) ? v : fallback;
    };

    const savedProducts = await loadKey('products', null);
    products = savedProducts || JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    capital = await loadKey('capital', []);
    qrisFiles = await loadKey('qris_files', []);

    if (idb) {
        let list = await idbReq('trx', 'readonly', s => s.getAll());
        if (!list.length) {
            const old = legacyGet('transactions');
            if (old && old.length) {
                await idbReq('trx', 'readwrite', s => { old.forEach(t => s.put(t)); });
                const n = await idbReq('trx', 'readonly', s => s.count());
                if (n >= old.length) localStorage.removeItem('insya_transactions');
                list = old;
            }
        }
        transactions = list;
    } else {
        transactions = await loadKey('transactions', []);
    }
    transactions.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    normalizeProducts();
}

function normalizeProducts() {
    products.forEach(p => {
        p.price = Number(p.price) || 0;
        p.stock = Number(p.stock) || 0;
        p.minStock = Number(p.minStock) || 0;
        p.buyPrice = Number(p.buyPrice) || 0;
        p.buyQty = Number(p.buyQty) > 0 ? Number(p.buyQty) : 1;
        p.buyUnit = p.buyUnit || '';
        p.extraCost = Number(p.extraCost) || 0;
        p.materialId = p.materialId || '';
        p.materialQty = Number(p.materialQty) || 0;
    });
}

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
let products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
let transactions = [];
let capital = [];
let qrisFiles = [];
let activeQrisId = localStorage.getItem('insya_qris_active') || '';
let cart = [];
let paymentMethod = 'cash';
let waList = loadJSON('insya_wa_list', null);
let waSelectedId = localStorage.getItem('insya_wa_selected') || '';
let pendingDeleteTrx = null;
let appStarted = false;
let auth = null;
let historyLimit = 100;
let auditLimit = 200;

// Migrasi nomor WA lama (satu nomor) menjadi daftar nomor
if (!waList) {
    waList = [];
    const oldWa = localStorage.getItem('insya_wa_no');
    if (oldWa) waList.push({ id: 'w-' + Date.now(), label: 'Utama', number: oldWa });
    saveJSON('insya_wa_list', waList);
}

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
    if (!appStarted) {
        appStarted = true;
        initCloudDatabase();
        initApp().catch(e => { console.error(e); notify('Gagal memuat data: ' + e.message, { type: 'danger', duration: 0 }); });
    }
}

/* =========================================================
   INISIALISASI APLIKASI
   ========================================================= */
document.addEventListener('DOMContentLoaded', initAuth);

async function initApp() {
    await initStorage();
    updateClock();
    setInterval(updateClock, 1000);
    initPrintServicesSelect();
    renderPosCatalog();
    renderCart();
    await migrateOldQris();
    renderQrisCart();
    renderQrisManager();
    renderWaSaved();
    updateStockBadge();
    updateNotifPermStatus();
    setPayMethod('cash');
    renderStorageInfo();

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeProductModal(); closeCapitalModal(); closeDeleteTrxModal(); closeRestockModal(); closeQrisBill(); skipReceipt(true); }
        if ((e.key === 'p' || e.key === 'P') && !document.getElementById('receipt-modal').classList.contains('hidden')) { e.preventDefault(); printPendingReceipt(); }
    });
    ['product-modal', 'capital-modal', 'delete-trx-modal', 'restock-modal'].forEach(id => {
        document.getElementById(id).addEventListener('click', e => {
            if (e.target.id === id) e.target.classList.add('hidden');
        });
    });
    window.addEventListener('afterprint', () => { document.getElementById('print-area').innerHTML = ''; });

    const low = getLowStock();
    if (low.length) {
        notify(`${low.length} barang stok menipis/habis. Klik lonceng untuk melihat.`, { type: 'warn', title: 'Peringatan Stok', duration: 9000 });
    }
    checkBackupReminder();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(renderStorageInfo).catch(() => {});
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

    if (tabId === 'laporan-harian') { renderDailyReport(); fillWaSelects(); }
    if (tabId === 'laporan-audit') { auditLimit = 200; renderAuditReport(); fillWaSelects(); }
    if (tabId === 'riwayat') { historyLimit = 100; renderHistory(); }
    if (tabId === 'produk') renderProductsTable();
    if (tabId === 'modal') renderCapital();
    if (tabId === 'pengaturan') { fillReceiptMode(); renderQrisManager(); renderWaSaved(); updateNotifPermStatus(); renderStorageInfo(); }
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
        `<option value="${esc(p.id)}">${esc(p.name)} - ${rupiah(p.price)}/${esc(p.unit)} (Stok: ${availableStock(p)})</option>`
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
                <span class="text-[10px] ${st !== 'ok' ? 'text-amber-600 font-bold' : 'text-slate-500'}">${st === 'out' ? 'Habis' : 'Stok: ' + availableStock(item)}</span>
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
    if (availableStock(item) <= 0) return alert(`Maaf, stok "${item.name}" sudah habis!`);
    const existing = cart.find(c => c.id === item.id);
    const proposed = existing ? cart.map(c => c.id === item.id ? { ...c, qty: c.qty + qty } : c) : [...cart, { id: item.id, qty }];
    const sh = findShortage(proposed);
    if (sh) return alert(`Stok tidak mencukupi! "${sh.p.name}" tersisa ${sh.p.stock} ${sh.p.unit}, dibutuhkan ${sh.need}.`);
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
    const sh = findShortage(cart.map(c => c.id === id ? { ...c, qty } : c));
    if (sh) {
        alert(`Stok tidak mencukupi! "${sh.p.name}" tersisa ${sh.p.stock} ${sh.p.unit}.`);
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
        if (!p || availableStock(p) <= 0) return acc;
        acc.push({ ...ci, name: p.name, category: p.category, price: p.price, unit: p.unit, qty: Math.min(ci.qty, availableStock(p)) });
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
    label.innerHTML = paymentMethod === 'qris' ? `TAGIH QRIS · ${rupiah(total)}` : 'PROSES TRANSAKSI';
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
    kvSet('qris_files', qrisFiles);
    localStorage.setItem('insya_qris_active', activeQrisId || '');
    return true;
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
    const s = availableStock(p);
    if (s <= 0) return 'out';
    if (getMaterial(p)) return 'ok';          // layanan berbahan: peringatan ada di stok bahannya
    if (s <= p.minStock) return 'low';
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
    const low = getLowStock().sort((a, b) => availableStock(a) - availableStock(b));
    if (!low.length) {
        list.innerHTML = `<p class="p-5 text-center text-xs text-slate-400"><i class="fa-solid fa-circle-check text-emerald-500 text-2xl block mb-2"></i>Semua stok aman</p>`;
        return;
    }
    list.innerHTML = low.map(p => {
        const out = availableStock(p) <= 0;
        return `<div class="px-4 py-2.5 flex items-center justify-between gap-3 text-xs ${out ? 'bg-rose-50' : 'bg-amber-50/60'}">
            <div class="min-w-0"><p class="font-bold text-slate-800 truncate">${esc(p.name)}</p><p class="text-slate-500">${getMaterial(p) ? 'Bahan: ' + esc(getMaterial(p).name) : 'Batas peringatan: ' + p.minStock + ' ' + esc(p.unit)}</p></div>
            <span class="shrink-0 px-2 py-1 rounded-md font-extrabold ${out ? 'bg-rose-600 text-white' : 'bg-gold-500 text-navy-900'}">${out ? 'HABIS' : 'Sisa ' + availableStock(p)}</span>
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
        if (!products.find(x => x.id === ci.id)) return alert(`Item "${ci.name}" sudah tidak ada di katalog. Hapus dari keranjang.`);
    }
    const sh = findShortage(cart);
    if (sh) return alert(`Stok "${sh.p.name}" tidak mencukupi! Sisa: ${sh.p.stock} ${sh.p.unit}, dibutuhkan: ${sh.need}.`);

    const { subtotal, discount, total } = getTotals();
    let paid = total, change = 0;
    if (paymentMethod === 'cash') {
        paid = parseFloat(document.getElementById('cart-pay-amount').value) || 0;
        if (paid < total) return alert(`Nominal bayar kurang! Total yang harus dibayar ${rupiah(total)}.`);
        change = paid - total;
    }

    // Bekukan HPP (harga pokok) saat transaksi, supaya laba lama tidak berubah ketika harga beli berubah
    const items = cart.map(ci => {
        const p = products.find(x => x.id === ci.id);
        const m = getMaterial(p);
        return { ...ci, cost: unitCost(p), matId: m ? m.id : '', matQty: m ? p.materialQty : 0 };
    });

    const before = new Map(products.map(p => [p.id, stockStatus(p)]));
    consumptionOf(cart).forEach((amt, id) => {
        const p = products.find(x => x.id === id);
        if (p) p.stock = Math.max(0, p.stock - amt);
    });
    const stockAlerts = [];
    products.forEach(p => {
        const now = stockStatus(p);
        if (now !== before.get(p.id) && now !== 'ok' && !getMaterial(p)) stockAlerts.push({ name: p.name, unit: p.unit, stock: availableStock(p), status: now });
    });

    const trx = {
        id: newTrxId(),
        timestamp: new Date().toISOString(),
        customer: document.getElementById('cart-customer').value.trim(),
        items, subtotal, discount, total, paid, change,
        method: paymentMethod
    };
    transactions.unshift(trx);
    saveProducts();
    saveTrx(trx);

    cart = [];
    document.getElementById('cart-discount').value = 0;
    document.getElementById('cart-pay-amount').value = '';
    document.getElementById('cart-customer').value = '';
    renderCart();
    renderPosCatalog();
    initPrintServicesSelect();
    updateStockBadge();

    toast(`Transaksi ${trx.id} berhasil`);
    stockAlerts.forEach(a => {
        const msg = a.status === 'out' ? `${a.name} HABIS. Segera restok!` : `${a.name} menipis, sisa ${a.stock} ${a.unit}.`;
        notify(msg, { type: a.status === 'out' ? 'danger' : 'warn', title: 'Peringatan Stok', duration: 9000 });
        browserNotify('Peringatan Stok PRINT INSYA', msg);
    });
    afterCheckoutReceipt(trx);
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
    rows.forEach(({ i, rev, cogs, profit }) => {
        const cat = i.category || 'Lainnya';
        if (!result[cat]) result[cat] = { qty: 0, rev: 0, cogs: 0, profit: 0 };
        result[cat].qty += i.qty;
        result[cat].rev += rev;
        result[cat].cogs += cogs;
        result[cat].profit += profit;
    });
    return result;
}
function renderDailyReport() {
    const d = getTodayTransactions();
    const sum = list => list.reduce((s, t) => s + t.total, 0);
    const pl = calcPL(d, []);
    document.getElementById('daily-omset').innerText = rupiah(sum(d));
    document.getElementById('daily-count').innerText = `${d.length} Nota`;
    document.getElementById('daily-items').innerText = `${d.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0)} pcs`;
    document.getElementById('daily-cash').innerText = rupiah(sum(d.filter(t => t.method === 'cash')));
    document.getElementById('daily-qris').innerText = rupiah(sum(d.filter(t => t.method === 'qris')));
    const gp = document.getElementById('daily-profit');
    gp.innerText = rupiah(pl.gross);
    gp.className = 'text-2xl font-extrabold mt-1 ' + (pl.gross < 0 ? 'text-rose-600' : 'text-emerald-600');
}
/* ---- Audit: pencarian + tabel waktu ---- */
function getAuditRows() {
    const q = document.getElementById('audit-search').value.toLowerCase().trim();
    const { from, to } = parseRange();
    const rows = [];
    trxInRange(from, to).forEach(t => {
        const ratio = trxRatio(t);
        t.items.forEach(i => {
            const hay = [t.id, t.customer, i.name, i.category, t.method].join(' ').toLowerCase();
            if (q && !hay.includes(q)) return;
            const cost = Number(i.cost) || 0;
            const rev = i.price * i.qty * ratio;
            const cogs = cost * i.qty;
            rows.push({ t, i, rev, cogs, profit: rev - cogs, noCost: !(cost > 0) });
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
    const { from, to } = parseRange();
    renderPL(calcPL(trxInRange(from, to), opexInRange(from, to)), from, to);

    const rows = getAuditRows();
    const audit = aggregateRows(rows);
    const cats = Object.keys(audit);
    const tot = cats.reduce((a, c) => ({ qty: a.qty + audit[c].qty, rev: a.rev + audit[c].rev, cogs: a.cogs + audit[c].cogs, profit: a.profit + audit[c].profit }), { qty: 0, rev: 0, cogs: 0, profit: 0 });
    const colorOf = v => v < 0 ? 'text-rose-600' : 'text-emerald-600';
    const mg = (p, r) => r > 0 ? (p / r * 100).toFixed(1) + '%' : '-';
    document.getElementById('audit-info').innerText = rows.length ? `${rows.length} baris` : '';

    document.getElementById('audit-category-table').innerHTML = cats.length ? cats.map(cat => `
        <tr>
            <td class="py-3 font-semibold text-slate-800">${catBadge(cat)}</td>
            <td class="py-3 text-center font-semibold text-slate-600">${audit[cat].qty} pcs</td>
            <td class="py-3 text-right">${rupiah(audit[cat].rev)}</td>
            <td class="py-3 text-right text-slate-500">${rupiah(audit[cat].cogs)}</td>
            <td class="py-3 text-right font-bold ${colorOf(audit[cat].profit)}">${rupiah(audit[cat].profit)}</td>
            <td class="py-3 text-right text-xs font-semibold ${colorOf(audit[cat].profit)}">${mg(audit[cat].profit, audit[cat].rev)}</td>
        </tr>`).join('') + `
        <tr class="bg-slate-50 font-extrabold">
            <td class="py-3 px-1">TOTAL</td><td class="py-3 text-center">${tot.qty} pcs</td>
            <td class="py-3 text-right">${rupiah(tot.rev)}</td><td class="py-3 text-right text-slate-500">${rupiah(tot.cogs)}</td>
            <td class="py-3 text-right ${colorOf(tot.profit)}">${rupiah(tot.profit)}</td><td class="py-3 text-right text-xs ${colorOf(tot.profit)}">${mg(tot.profit, tot.rev)}</td>
        </tr>`
        : `<tr><td colspan="6" class="py-4 text-center text-slate-400">Tidak ada data yang cocok.</td></tr>`;

    const shown = rows.slice(0, auditLimit);
    let html = shown.map(({ t, i, rev, cogs, profit, noCost }) => `
        <tr class="hover:bg-slate-50">
            <td class="py-2.5 px-4 text-xs text-slate-600 whitespace-nowrap">${fmtDateTime(t.timestamp)}</td>
            <td class="py-2.5 px-4 text-xs font-bold text-navy-900 whitespace-nowrap">#${esc(t.id)}</td>
            <td class="py-2.5 px-4 text-xs">${esc(t.customer) || '-'}</td>
            <td class="py-2.5 px-4 font-semibold">${esc(i.name)}</td>
            <td class="py-2.5 px-4">${catBadge(i.category)}</td>
            <td class="py-2.5 px-4 text-center">${i.qty}</td>
            <td class="py-2.5 px-4 text-right">${rupiah(rev)}</td>
            <td class="py-2.5 px-4 text-right text-slate-500">${noCost ? '<span title="HPP belum diisi" class="text-amber-500">?</span> ' : ''}${rupiah(cogs)}</td>
            <td class="py-2.5 px-4 text-right font-bold ${profit < 0 ? 'text-rose-600' : 'text-emerald-600'}">${rupiah(profit)}</td>
        </tr>`).join('');
    if (rows.length > shown.length) {
        html += `<tr><td colspan="9" class="py-3 text-center"><button onclick="auditLimit+=300;renderAuditReport()" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-navy-900">Tampilkan lebih banyak (${shown.length} dari ${rows.length})</button></td></tr>`;
    }
    document.getElementById('audit-detail-table').innerHTML = rows.length ? html
        : `<tr><td colspan="9" class="py-6 text-center text-slate-400">${transactions.length ? 'Tidak ada data yang cocok dengan pencarian.' : 'Belum ada data transaksi untuk diaudit.'}</td></tr>`;
}
/* ---- WhatsApp ---- */
function openWhatsApp(msg, number) { window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank'); }

function sendDailyReportToWA() {
    const num = getSelectedWaNumber();
    if (!num) return alert('Belum ada nomor WhatsApp tersimpan. Tambahkan di menu Pengaturan.');
    const d = getTodayTransactions();
    const pl = calcPL(d, []);
    const items = d.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0);
    openWhatsApp(`*LAPORAN HARIAN PRINT INSYA*\nTanggal: ${new Date().toLocaleDateString('id-ID')}\nTotal Omset: ${rupiah(pl.revenue)}\nHPP (modal barang terjual): ${rupiah(pl.cogs)}\n*Laba Kotor: ${rupiah(pl.gross)}*\nTotal Transaksi: ${d.length} Nota\nItem Terjual: ${items} pcs`, num);
}
function sendAuditReportToWA() {
    const num = getSelectedWaNumber();
    if (!num) return alert('Belum ada nomor WhatsApp tersimpan. Tambahkan di menu Pengaturan.');
    const { from, to } = parseRange();
    const pl = calcPL(trxInRange(from, to), opexInRange(from, to));
    if (!pl.count && !pl.opexTotal) return alert('Belum ada data audit untuk dikirim!');
    const audit = aggregateRows(getAuditRows());
    const details = Object.keys(audit).map(c => `• *${c}*: ${audit[c].qty} pcs, omset ${rupiah(audit[c].rev)}, laba ${rupiah(audit[c].profit)}`).join('\n');
    const periode = (from || to) ? `Periode: ${from || '...'} s/d ${to || '...'}\n` : 'Periode: Semua waktu\n';
    const hasil = pl.net > 0 ? 'LABA BERSIH' : pl.net < 0 ? 'RUGI BERSIH' : 'IMPAS';
    openWhatsApp(`*LAPORAN LABA RUGI PRINT INSYA*\n${periode}\nPendapatan: ${rupiah(pl.revenue)}\nHPP: ${rupiah(pl.cogs)}\nLaba Kotor: ${rupiah(pl.gross)} (${pl.margin.toFixed(1)}%)\nBiaya Operasional: ${rupiah(pl.opexTotal)}\n*${hasil}: ${rupiah(pl.net)}*\n\n*Rincian Per Kategori:*\n${details}`, num);
}
/* ---- Pengaturan WA ---- */
function formatWa(num) {
    if (!num) return '';
    return '+' + num.replace(/^(\d{2})(\d{3,4})(\d{3,4})(\d*)$/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));
}
function saveWaList() { saveJSON('insya_wa_list', waList); localStorage.setItem('insya_wa_selected', waSelectedId || ''); }
function getSelectedWaNumber() {
    const w = waList.find(x => x.id === waSelectedId) || waList[0];
    return w ? w.number : '';
}
function onWaSelectChange(sel) {
    waSelectedId = sel.value;
    saveWaList();
    fillWaSelects();
}
function fillWaSelects() {
    ['wa-select-harian', 'wa-select-audit'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!waList.length) {
            el.innerHTML = '<option value="">Belum ada nomor tersimpan</option>';
            el.disabled = true;
            return;
        }
        el.disabled = false;
        const cur = waList.find(x => x.id === waSelectedId) || waList[0];
        el.innerHTML = waList.map(w => `<option value="${esc(w.id)}" ${w.id === cur.id ? 'selected' : ''}>${esc(w.label)} · ${esc(formatWa(w.number))}</option>`).join('');
    });
}
function renderWaSaved() {
    const box = document.getElementById('wa-list');
    if (!box) return;
    box.innerHTML = waList.length ? waList.map(w => `
        <div class="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <div class="text-sm min-w-0"><p class="font-extrabold text-slate-800 truncate">${esc(w.label)}</p><p class="text-xs text-slate-600">${esc(formatWa(w.number))}</p></div>
            <button onclick="deleteWaNumber('${esc(w.id)}')" class="shrink-0 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"><i class="fa-solid fa-trash-can"></i> Hapus</button>
        </div>`).join('')
        : '<p class="text-xs text-slate-400">Belum ada nomor tersimpan.</p>';
    fillWaSelects();
}
function saveWaNumber() {
    const label = document.getElementById('setting-wa-name').value.trim();
    let num = document.getElementById('setting-wa-no').value.replace(/\D/g, '');
    if (num.startsWith('0')) num = '62' + num.slice(1);
    if (num.length < 9) return alert('Nomor WhatsApp tidak valid.');
    if (waList.some(w => w.number === num)) return alert('Nomor ini sudah tersimpan.');
    const w = { id: 'w-' + Date.now(), label: label || 'Nomor ' + (waList.length + 1), number: num };
    waList.push(w);
    waSelectedId = w.id;
    saveWaList();
    document.getElementById('setting-wa-name').value = '';
    document.getElementById('setting-wa-no').value = '';
    renderWaSaved();
    toast('Nomor WhatsApp tersimpan');
}
function deleteWaNumber(id) {
    const w = waList.find(x => x.id === id);
    if (!w || !confirm(`Hapus nomor "${w.label}"?`)) return;
    waList = waList.filter(x => x.id !== id);
    if (waSelectedId === id) waSelectedId = waList[0] ? waList[0].id : '';
    saveWaList();
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
    const shown = transactions.slice(0, historyLimit);
    let html = shown.map(t => `
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
    if (transactions.length > shown.length) {
        html += `<tr><td colspan="6" class="py-3 text-center"><button onclick="historyLimit+=200;renderHistory()" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-navy-900">Tampilkan lebih banyak (${shown.length} dari ${transactions.length})</button></td></tr>`;
    }
    tbody.innerHTML = html;
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
            if (i.matId) {
                const m = products.find(x => x.id === i.matId);
                if (m) m.stock += i.qty * (i.matQty || 1);
            } else {
                const p = products.find(x => x.id === i.id);
                if (p) p.stock += i.qty;
            }
        });
        saveProducts();
    }
    transactions = transactions.filter(x => x.id !== t.id);
    removeTrx(t.id);
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
    // Ringkasan nilai
    const inv = products.reduce((s, p) => getMaterial(p) ? s : s + Math.max(0, p.stock) * ownUnitCost(p), 0);
    const sale = products.reduce((s, p) => isService(p) ? s : s + Math.max(0, p.stock) * p.price, 0);
    const noCost = products.filter(p => !(unitCost(p) > 0) && !isService(p)).length;
    document.getElementById('prod-inv-value').innerText = rupiah(inv);
    document.getElementById('prod-sale-value').innerText = rupiah(sale);
    document.getElementById('prod-nocost').innerText = `${noCost} item`;

    const tbody = document.getElementById('products-table-body');
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-slate-400 text-xs">Katalog kosong. Klik "+ Tambah Item".</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map(item => {
        const st = stockStatus(item);
        const m = getMaterial(item);
        const cost = unitCost(item);
        const profit = item.price - cost;
        const margin = item.price > 0 ? profit / item.price * 100 : 0;
        const profitHtml = cost > 0
            ? `<span class="font-bold ${profit < 0 ? 'text-rose-600' : 'text-emerald-600'}">${rupiah(profit)}</span> <span class="text-[10px] text-slate-400">(${margin.toFixed(0)}%)</span>${profit < 0 ? ' <span class="text-[10px] font-extrabold text-rose-600">RUGI</span>' : ''}`
            : '<span class="text-[11px] text-amber-600 font-semibold">isi HPP</span>';
        return `
        <tr class="hover:bg-slate-50 ${st === 'out' ? 'bg-rose-50/60' : st === 'low' ? 'bg-amber-50/60' : ''}">
            <td class="py-3 px-4 font-bold text-slate-800">
                ${esc(item.name)}
                ${st === 'low' ? '<span class="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded font-semibold"><i class="fa-solid fa-triangle-exclamation"></i> Menipis</span>' : ''}
                ${st === 'out' ? '<span class="ml-2 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded font-semibold">HABIS</span>' : ''}
                ${m ? `<span class="block text-[10px] font-medium text-slate-400">memakai ${item.materialQty} ${esc(m.unit)} ${esc(m.name)}</span>` : ''}
            </td>
            <td class="py-3 px-4">${catBadge(item.category)}</td>
            <td class="py-3 px-4 font-bold text-navy-900">${rupiah(item.price)}</td>
            <td class="py-3 px-4 text-slate-600">${cost > 0 ? rupiah(cost) : '-'}</td>
            <td class="py-3 px-4 text-xs">${profitHtml}</td>
            <td class="py-3 px-4 text-center font-bold ${st !== 'ok' ? 'text-amber-600' : 'text-slate-700'}">${availableStock(item)} ${esc(item.unit)}</td>
            <td class="py-3 px-4 text-center text-xs text-slate-500">${m ? '-' : item.minStock + ' ' + esc(item.unit)}</td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
                ${m ? '' : `<button onclick="openRestockModal('${esc(item.id)}')" title="Beli / tambah stok" class="p-1 text-emerald-700 hover:bg-emerald-50 rounded"><i class="fa-solid fa-cart-plus"></i></button>`}
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

function fillMaterialOptions(selfId, selected) {
    const sel = document.getElementById('prod-material');
    const goods = products.filter(p => !isService(p) && p.id !== selfId && !getMaterial(p));
    sel.innerHTML = '<option value="">- Tidak memakai bahan -</option>' +
        goods.map(p => `<option value="${esc(p.id)}" ${p.id === selected ? 'selected' : ''}>${esc(p.name)} (${esc(p.unit)})</option>`).join('');
}

function openProductModal(id) {
    document.getElementById('product-form').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-product-title').innerText = 'Tambah Item Baru';
    const p = id ? products.find(x => x.id === id) : null;
    fillMaterialOptions(p ? p.id : '', p ? p.materialId : '');
    if (p) {
        document.getElementById('modal-product-title').innerText = 'Edit Item';
        document.getElementById('prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-category').value = p.category;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-unit').value = p.unit;
        document.getElementById('prod-stock').value = p.stock;
        document.getElementById('prod-min-stock').value = p.minStock;
        document.getElementById('prod-buy-price').value = p.buyPrice || '';
        document.getElementById('prod-buy-unit').value = p.buyUnit || '';
        document.getElementById('prod-buy-qty').value = p.buyQty || 1;
        document.getElementById('prod-extra-cost').value = p.extraCost || 0;
        document.getElementById('prod-material-qty').value = p.materialQty || 1;
    }
    updateProductPreview();
    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('prod-name').focus();
}
function closeProductModal() { document.getElementById('product-modal').classList.add('hidden'); }

function readProductForm() {
    const num = (id, def = 0) => { const v = parseFloat(document.getElementById(id).value); return isNaN(v) ? def : v; };
    return {
        name: document.getElementById('prod-name').value.trim(),
        category: document.getElementById('prod-category').value,
        price: Math.max(0, num('prod-price')),
        unit: document.getElementById('prod-unit').value.trim(),
        stock: Math.max(0, Math.round(num('prod-stock'))),
        minStock: Math.max(0, Math.round(num('prod-min-stock'))),
        buyPrice: Math.max(0, num('prod-buy-price')),
        buyUnit: document.getElementById('prod-buy-unit').value.trim(),
        buyQty: Math.max(1, num('prod-buy-qty', 1)),
        extraCost: Math.max(0, num('prod-extra-cost')),
        materialId: document.getElementById('prod-material').value,
        materialQty: Math.max(0, num('prod-material-qty', 1))
    };
}

function updateProductPreview() {
    const d = readProductForm();
    const el = document.getElementById('prod-preview');
    const own = d.buyPrice > 0 ? d.buyPrice / d.buyQty : 0;
    const mat = d.materialId ? products.find(p => p.id === d.materialId) : null;
    const matCost = mat && d.materialQty > 0 ? ownUnitCost(mat) * d.materialQty : 0;
    const cost = own + d.extraCost + matCost;
    const unit = d.unit || 'satuan';
    document.getElementById('prod-unit-hint').innerText = unit;

    if (!(cost > 0)) {
        el.innerHTML = '<span class="text-slate-500">Isi harga beli agar modal &amp; laba per satuan terhitung otomatis.</span>';
    } else {
        const profit = d.price - cost;
        const margin = d.price > 0 ? profit / d.price * 100 : 0;
        const parts = [];
        if (own > 0) parts.push(`beli ${rupiah(own)}`);
        if (matCost > 0) parts.push(`bahan ${rupiah(matCost)}`);
        if (d.extraCost > 0) parts.push(`tambahan ${rupiah(d.extraCost)}`);
        el.innerHTML = `<p>Modal (HPP) per ${esc(unit)}: <b>${rupiah(cost)}</b> <span class="text-slate-400">(${parts.join(' + ')})</span></p>
            <p>Laba per ${esc(unit)}: <b class="${profit < 0 ? 'text-rose-600' : 'text-emerald-600'}">${rupiah(profit)} (${margin.toFixed(1)}%)</b>${profit < 0 ? ' <b class="text-rose-600">- RUGI, harga jual di bawah modal!</b>' : ''}</p>`;
    }

    // Opsi catat stok awal sebagai pembelian (hanya item baru)
    const isNew = !document.getElementById('prod-id').value;
    const amount = Math.round(d.stock * own);
    const wrap = document.getElementById('prod-log-wrap');
    const show = isNew && amount > 0 && !mat;
    wrap.classList.toggle('hidden', !show);
    if (show) document.getElementById('prod-log-text').innerHTML = `Catat stok awal (<b>${rupiah(amount)}</b>) sebagai pembelian di menu <b>Modal</b>`;
}

function handleProductSubmit(e) {
    e.preventDefault();
    const data = readProductForm();
    if (!data.name || !data.unit) return alert('Nama dan satuan wajib diisi.');
    if (data.materialId && !(data.materialQty > 0)) return alert('Isi jumlah bahan yang terpakai per 1 satuan.');

    const editId = document.getElementById('prod-id').value;
    const existing = editId ? products.find(p => p.id === editId) : null;
    let item;
    if (existing) { Object.assign(existing, data); item = existing; }
    else {
        item = { id: 'p-' + Date.now(), ...data };
        products.push(item);
        const own = data.buyPrice > 0 ? data.buyPrice / data.buyQty : 0;
        const amount = Math.round(data.stock * own);
        if (document.getElementById('prod-log-purchase').checked && amount > 0 && !data.materialId) {
            capital.push({
                id: 'c-' + Date.now(), date: dateKey(new Date()), type: 'keluar', category: 'Beli Stok Barang',
                note: `Stok awal ${data.stock} ${data.unit} ${data.name}`, amount, auto: true, productId: item.id, createdAt: new Date().toISOString()
            });
            saveCapital();
        }
    }
    closeProductModal();
    refreshAfterProductChange();
    toast(existing ? 'Item diperbarui' : 'Item ditambahkan');
    if (stockStatus(item) !== 'ok') {
        notify(`${item.name}: stok ${availableStock(item) <= 0 ? 'habis' : 'menipis (' + availableStock(item) + ')'}.`, { type: 'warn', title: 'Peringatan Stok', duration: 6000 });
    }
}
/* =========================================================
   MODAL USAHA
   ========================================================= */
function saveCapital() { return kvSet('capital', capital); }

function renderCapital() {
    const masuk = capital.filter(c => c.type === 'masuk');
    const keluar = capital.filter(c => c.type === 'keluar');
    const sum = l => l.reduce((s, c) => s + c.amount, 0);
    const inT = sum(masuk), outT = sum(keluar);
    const sales = transactions.reduce((s, t) => s + t.total, 0);
    const cash = inT + sales - outT;
    const inventory = products.reduce((s, p) => getMaterial(p) ? s : s + Math.max(0, p.stock) * ownUnitCost(p), 0);
    const pl = calcPL(transactions, opexInRange('', ''));
    const payback = inT > 0 ? Math.max(0, pl.net) / inT * 100 : 0;

    document.getElementById('cap-in').innerText = rupiah(inT);
    document.getElementById('cap-sales').innerText = rupiah(sales);
    document.getElementById('cap-out').innerText = rupiah(outT);
    const cashEl = document.getElementById('cap-cash');
    cashEl.innerText = rupiah(cash);
    cashEl.className = 'text-3xl font-extrabold mt-1 ' + (cash < 0 ? 'text-rose-600' : 'text-navy-900');
    document.getElementById('cap-inv').innerText = rupiah(inventory);
    const netEl = document.getElementById('cap-net');
    netEl.innerText = rupiah(pl.net);
    netEl.className = 'text-2xl font-extrabold mt-1 ' + (pl.net < 0 ? 'text-rose-600' : 'text-emerald-600');
    document.getElementById('cap-payback-text').innerText = inT > 0 ? `Balik modal ${payback.toFixed(1)}% dari modal masuk` : 'Catat modal masuk untuk melihat balik modal';
    document.getElementById('cap-payback-bar').style.width = Math.min(100, payback) + '%';

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
            <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-md text-[11px] font-bold ${c.type === 'masuk' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">${c.type === 'masuk' ? 'Modal Masuk' : 'Pengeluaran'}</span></td>
            <td class="py-3 px-4 font-semibold">${esc(c.category)}${c.auto ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">dari Barang &amp; Stok</span>' : ''}</td>
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
    if (!c) return;
    const extra = c.auto ? '\n\nCatatan ini dibuat otomatis dari pembelian stok. Menghapusnya TIDAK mengurangi stok barang.' : '';
    if (!confirm(`Hapus catatan "${c.category}" sebesar ${rupiah(c.amount)}?${extra}`)) return;
    capital = capital.filter(x => x.id !== id);
    saveCapital();
    renderCapital();
}

/* =========================================================
   HPP, LABA RUGI, STOK BAHAN
   ========================================================= */
// Bahan yang dipakai layanan (mis. Print memakai Kertas A4 x1 per lembar)
function getMaterial(p) {
    if (!p || !p.materialId || !(p.materialQty > 0)) return null;
    return products.find(x => x.id === p.materialId && x.id !== p.id) || null;
}
// Stok yang bisa dijual: dari stok sendiri, atau dari stok bahan bila layanan berbahan
function availableStock(p) {
    const m = getMaterial(p);
    return m ? Math.floor(Math.max(0, m.stock) / p.materialQty) : p.stock;
}
// Harga beli per satuan jual (harga kemasan / isi kemasan)
function ownUnitCost(p) { return p.buyPrice > 0 && p.buyQty > 0 ? p.buyPrice / p.buyQty : 0; }
// HPP per satuan jual = harga beli + biaya tambahan + bahan terpakai
function unitCost(p) {
    const m = getMaterial(p);
    return ownUnitCost(p) + (Number(p.extraCost) || 0) + (m ? ownUnitCost(m) * p.materialQty : 0);
}
function consumptionOf(items) {
    const need = new Map();
    items.forEach(ci => {
        const p = products.find(x => x.id === ci.id);
        if (!p) return;
        const m = getMaterial(p);
        const target = m ? m.id : p.id;
        const amt = m ? ci.qty * p.materialQty : ci.qty;
        need.set(target, (need.get(target) || 0) + amt);
    });
    return need;
}
function findShortage(items) {
    for (const [id, amt] of consumptionOf(items)) {
        const p = products.find(x => x.id === id);
        if (p && p.stock < amt) return { p, need: amt };
    }
    return null;
}

function parseRange() { return { from: document.getElementById('audit-from').value, to: document.getElementById('audit-to').value }; }
function trxInRange(from, to) {
    return transactions.filter(t => { const dk = dateKey(t.timestamp); return !(from && dk < from) && !(to && dk > to); });
}
function opexInRange(from, to) {
    return capital.filter(c => c.type === 'keluar' && EXPENSE_CATS.includes(c.category) && !(from && c.date < from) && !(to && c.date > to));
}
// Diskon dibagi rata ke semua baris nota agar pendapatan per baris = setelah diskon
function trxRatio(t) {
    const sub = t.items.reduce((s, i) => s + i.price * i.qty, 0);
    return sub > 0 ? t.total / sub : 1;
}
function calcPL(trxList, opexList) {
    let revenue = 0, discount = 0, cogs = 0, noCost = 0;
    trxList.forEach(t => {
        revenue += t.total;
        discount += Number(t.discount) || 0;
        t.items.forEach(i => {
            const c = Number(i.cost) || 0;
            cogs += c * i.qty;
            if (!(c > 0)) noCost += 1;
        });
    });
    const gross = revenue - cogs;
    const byCat = {};
    let opexTotal = 0;
    opexList.forEach(c => { byCat[c.category] = (byCat[c.category] || 0) + c.amount; opexTotal += c.amount; });
    return { revenue, discount, cogs, gross, margin: revenue > 0 ? gross / revenue * 100 : 0, opexTotal, byCat, net: gross - opexTotal, noCost, count: trxList.length };
}

function renderPL(pl, from, to) {
    document.getElementById('pl-periode').innerText = (from || to) ? `${from || 'awal'} s/d ${to || 'sekarang'}` : 'Semua waktu';
    const status = document.getElementById('pl-status');
    const net = document.getElementById('pl-net');
    const empty = !pl.count && !pl.opexTotal;
    const kind = empty ? ['BELUM ADA DATA', 'bg-slate-500 text-white', 'text-white']
        : pl.net > 0 ? ['LABA', 'bg-emerald-500 text-white', 'text-emerald-300']
        : pl.net < 0 ? ['RUGI', 'bg-rose-600 text-white', 'text-rose-300']
        : ['IMPAS', 'bg-gold-500 text-navy-900', 'text-gold-400'];
    status.innerText = kind[0];
    status.className = 'inline-block px-3 py-1 rounded-lg text-xs font-extrabold ' + kind[1];
    net.innerText = rupiah(pl.net);
    net.className = 'wordmark normal-case text-5xl mt-1 ' + kind[2];

    const row = (label, val, cls = '', sub = '') => `<div class="flex justify-between items-baseline py-2 border-b border-slate-100 ${cls}"><span>${label}${sub ? `<span class="block text-[11px] font-normal text-slate-400">${sub}</span>` : ''}</span><span class="font-bold">${val}</span></div>`;
    const opexRows = Object.keys(pl.byCat).map(k => `<div class="flex justify-between py-1 pl-4 text-xs text-slate-500"><span>${esc(k)}</span><span>${rupiah(pl.byCat[k])}</span></div>`).join('');
    document.getElementById('pl-body').innerHTML = `
        ${row('Pendapatan Penjualan', rupiah(pl.revenue), '', pl.discount > 0 ? `sudah dikurangi diskon ${rupiah(pl.discount)}` : `${pl.count} nota`)}
        ${row('(−) HPP / Modal Barang Terjual', rupiah(pl.cogs), 'text-slate-600')}
        ${row('LABA KOTOR', `${rupiah(pl.gross)} <span class="text-xs font-semibold text-slate-400">(${pl.margin.toFixed(1)}%)</span>`, 'font-extrabold ' + (pl.gross < 0 ? 'text-rose-600' : 'text-emerald-600'))}
        ${row('(−) Biaya Operasional', rupiah(pl.opexTotal), 'text-slate-600', 'sewa, listrik, gaji, dan lain-lain dari menu Modal')}
        ${opexRows}
        <div class="flex justify-between items-baseline pt-3 text-base font-extrabold ${pl.net < 0 ? 'text-rose-600' : 'text-navy-900'}"><span>${pl.net < 0 ? 'RUGI BERSIH' : 'LABA BERSIH'}</span><span>${rupiah(pl.net)}</span></div>
        ${pl.noCost ? `<p class="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5"><i class="fa-solid fa-triangle-exclamation"></i> ${pl.noCost} baris penjualan belum punya HPP (dihitung Rp 0), jadi laba bisa terlalu besar. Isi harga beli di menu <b>Barang &amp; Jasa</b>.</p>` : ''}
        <p class="mt-3 text-[11px] text-slate-400">Pembelian stok tidak langsung dihitung biaya: baru menjadi HPP saat barangnya terjual. Pembelian peralatan dan prive tidak mengurangi laba.</p>`;
}

/* =========================================================
   BELI / TAMBAH STOK (restok)
   ========================================================= */
function openRestockModal(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('restock-form').reset();
    document.getElementById('rs-id').value = p.id;
    document.getElementById('rs-name').innerText = p.name;
    const pack = p.buyQty > 1 ? (p.buyUnit || 'kemasan') : p.unit;
    document.getElementById('rs-qty-label').innerText = `Jumlah dibeli (${pack})`;
    document.getElementById('rs-price-label').innerText = `Harga beli per ${pack} (Rp)`;
    document.getElementById('rs-qty').value = 1;
    document.getElementById('rs-price').value = p.buyPrice > 0 ? p.buyPrice : '';
    updateRestockPreview();
    document.getElementById('restock-modal').classList.remove('hidden');
    document.getElementById('rs-qty').focus();
}
function closeRestockModal() { document.getElementById('restock-modal').classList.add('hidden'); }

function calcRestock() {
    const p = products.find(x => x.id === document.getElementById('rs-id').value);
    if (!p) return null;
    const n = parseFloat(document.getElementById('rs-qty').value) || 0;
    const price = parseFloat(document.getElementById('rs-price').value) || 0;
    const units = Math.round(n * p.buyQty);
    const total = Math.round(n * price);
    const newUnit = p.buyQty > 0 ? price / p.buyQty : 0;
    const oldStock = Math.max(0, p.stock), oldOwn = ownUnitCost(p);
    // HPP rata-rata tertimbang antara stok lama dan pembelian baru
    const avg = (oldStock > 0 && oldOwn > 0) ? (oldStock * oldOwn + units * newUnit) / (oldStock + units) : newUnit;
    return { p, n, price, units, total, avg, oldOwn };
}
function updateRestockPreview() {
    const r = calcRestock();
    if (!r) return;
    document.getElementById('rs-preview').innerHTML = `
        <p>Total bayar: <b>${rupiah(r.total)}</b></p>
        <p>Stok bertambah: <b>+${r.units.toLocaleString('id-ID')} ${esc(r.p.unit)}</b> (jadi ${(r.p.stock + r.units).toLocaleString('id-ID')})</p>
        <p>HPP per ${esc(r.p.unit)}: <b>${rupiah(r.avg)}</b>${r.oldOwn > 0 ? ` <span class="text-slate-400">(rata-rata, sebelumnya ${rupiah(r.oldOwn)})</span>` : ''}</p>`;
}
function handleRestockSubmit(e) {
    e.preventDefault();
    const r = calcRestock();
    if (!r) return;
    if (!(r.n > 0) || !(r.units > 0)) return alert('Jumlah pembelian harus lebih dari 0.');
    if (!(r.price >= 0)) return alert('Harga beli tidak valid.');
    r.p.stock += r.units;
    r.p.buyPrice = Math.round(r.avg * r.p.buyQty * 100) / 100;
    if (document.getElementById('rs-log').checked && r.total > 0) {
        capital.push({
            id: 'c-' + Date.now(), date: dateKey(new Date()), type: 'keluar', category: 'Beli Stok Barang',
            note: `Beli ${r.n} ${r.p.buyQty > 1 ? (r.p.buyUnit || 'kemasan') : r.p.unit} ${r.p.name} @ ${rupiah(r.price)}`,
            amount: r.total, auto: true, productId: r.p.id, createdAt: new Date().toISOString()
        });
        saveCapital();
    }
    closeRestockModal();
    refreshAfterProductChange();
    notify(`${r.p.name} +${r.units} ${r.p.unit}. Pengeluaran ${rupiah(r.total)} tercatat di Modal.`, { type: 'success', duration: 5000 });
}

/* =========================================================
   PENYIMPANAN CLOUD REAL-TIME (FIRESTORE)
   ========================================================= */
let db = null;

function initCloudDatabase() {
    if (typeof firebase !== 'undefined' && firebase.apps.length) {
        db = firebase.firestore();
        // Mengaktifkan sinkronisasi real-time data dari cloud
        listenCloudData('insya_products', DEFAULT_PRODUCTS, data => { products = data; refreshAfterProductChange(); });
        listenCloudData('insya_transactions', [], data => { transactions = data; if(typeof renderHistory === 'function') renderHistory(); if(typeof renderDailyReport === 'function') renderDailyReport(); });
        listenCloudData('insya_capital', [], data => { capital = data; if(typeof renderCapital === 'function') renderCapital(); });
    }
}

function loadJSON(key, fallback) {
    // Fallback lokal sementara sebelum cloud siap
    try {
        const v = JSON.parse(localStorage.getItem(key));
        return Array.isArray(v) ? v : fallback;
    } catch (e) { return fallback; }
}

function saveJSON(key, val) {
    // Simpan ke localStorage sebagai cadangan offline
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    
    // Simpan secara real-time ke Firebase Firestore Cloud agar perangkat lain ikut update
    if (db) {
        db.collection('print_insya_store').doc(key).set({ content: JSON.stringify(val) })
          .catch(err => console.error("Gagal sinkron ke cloud:", err));
    }
    return true;
}

function listenCloudData(key, fallback, callback) {
    if (!db) return;
    db.collection('print_insya_store').doc(key).onSnapshot(doc => {
        if (doc.exists) {
            try {
                const parsed = JSON.parse(doc.data().content);
                if (Array.isArray(parsed)) callback(parsed);
            } catch (e) {}
        } else {
            // Jika data cloud belum ada, inisialisasi dengan data default
            saveJSON(key, fallback);
        }
    });
}

function saveProducts() { return saveJSON('insya_products', products); 
}

/* =========================================================
   STRUK SETELAH TRANSAKSI: Enter = Lewati, P = Cetak
   ========================================================= */
let receiptMode = localStorage.getItem('insya_receipt_mode') || 'ask';   // ask | auto | never
let pendingReceipt = null;
let receiptOpenedAt = 0;

function afterCheckoutReceipt(trx) {
    if (receiptMode === 'auto') return printReceipt(trx);
    if (receiptMode === 'never') return;
    pendingReceipt = trx;
    document.getElementById('rc-info').innerHTML = `
        <p class="text-xs text-slate-500">${esc(trx.id)}</p>
        <p class="wordmark normal-case text-5xl text-navy-900 mt-1">${rupiah(trx.total)}</p>
        ${trx.method === 'cash' ? `<p class="text-sm font-semibold text-slate-600 mt-1">Kembalian: <b class="text-navy-900">${rupiah(trx.change)}</b></p>` : '<p class="text-sm font-semibold text-slate-600 mt-1">Dibayar via QRIS</p>'}`;
    receiptOpenedAt = Date.now();
    document.getElementById('receipt-modal').classList.remove('hidden');
    setTimeout(() => { const b = document.getElementById('receipt-skip'); if (b) b.focus(); }, 80);
}
function skipReceipt(fromEsc) {
    const m = document.getElementById('receipt-modal');
    if (!m || m.classList.contains('hidden')) return;
    if (!fromEsc && Date.now() - receiptOpenedAt < 300) return;   // cegah Enter yang sama ikut menutup
    pendingReceipt = null;
    m.classList.add('hidden');
}
function printPendingReceipt() {
    if (Date.now() - receiptOpenedAt < 300) return;
    const t = pendingReceipt;
    pendingReceipt = null;
    document.getElementById('receipt-modal').classList.add('hidden');
    if (t) printReceipt(t);
}
function setReceiptMode(v) {
    receiptMode = v;
    localStorage.setItem('insya_receipt_mode', v);
    toast('Pengaturan struk disimpan');
}
function fillReceiptMode() {
    const el = document.getElementById('receipt-mode');
    if (el) el.value = receiptMode;
}
