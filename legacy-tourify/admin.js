const demoBookings = [
  { id: "TRF-24108", name: "Nadia Putri", email: "nadia.putri@email.com", destination: "Dufan", visitDate: "05 Nov 2026", tickets: 3, total: 450000, status: "Menunggu" },
  { id: "TRF-24107", name: "Bima Pratama", email: "bima.pratama@email.com", destination: "Ocean Park", visitDate: "06 Nov 2026", tickets: 2, total: 300000, status: "Terkonfirmasi" },
  { id: "TRF-24106", name: "Citra Lestari", email: "citra.lestari@email.com", destination: "Waterbom Jakarta", visitDate: "07 Nov 2026", tickets: 4, total: 500000, status: "Terkonfirmasi" },
  { id: "TRF-24105", name: "Andre Saputra", email: "andre.saputra@email.com", destination: "Trans Studio", visitDate: "08 Nov 2026", tickets: 2, total: 360000, status: "Selesai" },
  { id: "TRF-24104", name: "Intan Puspita", email: "intan.puspita@email.com", destination: "Dufan", visitDate: "09 Nov 2026", tickets: 5, total: 750000, status: "Selesai" },
  { id: "TRF-24103", name: "Fajar Ramadhan", email: "fajar.ramadhan@email.com", destination: "Ocean Park", visitDate: "10 Nov 2026", tickets: 2, total: 300000, status: "Menunggu" },
  { id: "TRF-24102", name: "Maya Kartika", email: "maya.kartika@email.com", destination: "Waterbom Jakarta", visitDate: "11 Nov 2026", tickets: 3, total: 375000, status: "Terkonfirmasi" },
  { id: "TRF-24101", name: "Rizky Mahendra", email: "rizky.mahendra@email.com", destination: "Trans Studio", visitDate: "12 Nov 2026", tickets: 4, total: 720000, status: "Selesai" }
];

const defaultDestinations = [
  { id: "ocean", name: "Ocean Park", city: "Jakarta Selatan", price: 100000, orders: 86, active: true, image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=180&q=80" },
  { id: "dufan", name: "Dufan", city: "Jakarta Utara", price: 150000, orders: 72, active: true, image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=180&q=80" },
  { id: "waterbom", name: "Waterbom Jakarta", city: "Jakarta Barat", price: 125000, orders: 58, active: true, image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=180&q=80" },
  { id: "trans-studio", name: "Trans Studio", city: "Bandung", price: 180000, orders: 32, active: true, image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=180&q=80" }
];

function readLocal(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    showToast("Perubahan hanya tersimpan selama halaman ini dibuka.");
  }
}

let bookings = readLocal("tourify-admin-bookings", demoBookings);
let destinations = readLocal("tourify-admin-destinations", defaultDestinations);
let activeView = "overview";
let activeBookingFilter = "Semua";
let searchTerm = "";
let toastTimer;

const money = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const initials = (name) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

function showToast(message) {
  const toast = document.getElementById("adminToast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function renderStats() {
  const pending = bookings.filter((booking) => booking.status === "Menunggu").length;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("allBookingCount").textContent = bookings.length;
  document.getElementById("waitingBookingCount").textContent = pending;
  document.getElementById("activeDestinationValue").textContent = destinations.filter((destination) => destination.active).length;
  document.getElementById("revenueValue").textContent = "Rp58.450.000";
  document.getElementById("bookingValue").textContent = "248";
  document.getElementById("reportBookingValue").textContent = "248";
  document.getElementById("destinationCountLabel").textContent = `${destinations.length} destinasi terdaftar`;
}

function bookingRow(booking, compact = false) {
  const statusClass = booking.status.toLowerCase().replace(/\s+/g, "-");
  const nextAction = booking.status === "Menunggu" ? "Konfirmasi" : booking.status === "Terkonfirmasi" ? "Selesaikan" : "Selesai";
  const actionDisabled = booking.status === "Selesai" ? "disabled" : "";
  return `<tr data-search="${escapeHtml(`${booking.id} ${booking.name} ${booking.email} ${booking.destination} ${booking.status}`.toLowerCase())}">
    <td><strong class="admin-order-id">${escapeHtml(booking.id)}</strong><small class="admin-mobile-only">${escapeHtml(booking.visitDate)}</small></td>
    <td><div class="admin-customer-cell"><span class="admin-customer-avatar">${escapeHtml(initials(booking.name))}</span><span><strong>${escapeHtml(booking.name)}</strong><small>${escapeHtml(booking.email)}</small></span></div></td>
    <td><span class="admin-destination-name">${escapeHtml(booking.destination)}</span></td>
    ${compact ? `<td>${escapeHtml(booking.visitDate)}</td>` : `<td>${escapeHtml(booking.visitDate)}</td><td>${booking.tickets} tiket</td>`}
    <td><strong>${money(booking.total)}</strong></td>
    <td><span class="admin-status-badge is-${statusClass}"><i></i>${escapeHtml(booking.status)}</span></td>
    <td><button class="admin-row-action" type="button" data-booking-action="${escapeHtml(booking.id)}" ${actionDisabled} aria-label="${compact ? "Lihat" : nextAction} pesanan ${escapeHtml(booking.id)}">${compact ? "Lihat" : nextAction}</button></td>
  </tr>`;
}

function renderBookingRows() {
  const recent = bookings.slice(0, 5);
  document.getElementById("recentBookingsBody").innerHTML = recent.map((booking) => bookingRow(booking, true)).join("");

  const filtered = bookings.filter((booking) => {
    const matchesFilter = activeBookingFilter === "Semua" || booking.status === activeBookingFilter;
    const haystack = `${booking.id} ${booking.name} ${booking.email} ${booking.destination} ${booking.status}`.toLowerCase();
    return matchesFilter && haystack.includes(searchTerm);
  });
  document.getElementById("bookingsBody").innerHTML = filtered.length
    ? filtered.map((booking) => bookingRow(booking)).join("")
    : `<tr><td class="admin-empty-state" colspan="8">Tidak ada pesanan yang cocok dengan pencarian.</td></tr>`;
  document.getElementById("bookingResultsLabel").textContent = `Menampilkan ${filtered.length} dari ${bookings.length} pesanan`;
}

function renderPopularDestinations() {
  const sorted = [...destinations].sort((a, b) => b.orders - a.orders).slice(0, 4);
  document.getElementById("popularDestinationList").innerHTML = sorted.map((destination, index) => `
    <div class="admin-popular-row">
      <span class="admin-popular-rank">0${index + 1}</span>
      <img src="${escapeHtml(destination.image)}" alt="" loading="lazy">
      <span class="admin-popular-copy"><strong>${escapeHtml(destination.name)}</strong><small>${escapeHtml(destination.city)}</small></span>
      <span class="admin-popular-orders">${destination.orders}<small>pesanan</small></span>
    </div>`).join("");
}

function renderDestinations() {
  document.getElementById("destinationsBody").innerHTML = destinations.length
    ? destinations.map((destination) => `
      <tr data-search="${escapeHtml(`${destination.name} ${destination.city}`.toLowerCase())}">
        <td><div class="admin-managed-destination"><img src="${escapeHtml(destination.image)}" alt="" loading="lazy"><strong>${escapeHtml(destination.name)}</strong></div></td>
        <td>${escapeHtml(destination.city)}</td>
        <td><strong>${money(destination.price)}</strong></td>
        <td>${destination.orders}</td>
        <td><button type="button" class="admin-status-toggle ${destination.active ? "is-active" : ""}" data-destination-toggle="${escapeHtml(destination.id)}" aria-pressed="${destination.active}"><i></i>${destination.active ? "Aktif" : "Nonaktif"}</button></td>
        <td><div class="admin-destination-actions"><button type="button" class="admin-row-action" data-edit-destination="${escapeHtml(destination.id)}" aria-label="Edit ${escapeHtml(destination.name)}">Edit</button><button type="button" class="admin-row-action" data-delete-destination="${escapeHtml(destination.id)}" aria-label="Hapus ${escapeHtml(destination.name)}">Hapus</button></div></td>
      </tr>`).join("")
    : `<tr><td class="admin-empty-state" colspan="6">Belum ada destinasi. Tambahkan wahana pertama.</td></tr>`;
}

function renderAll() {
  renderStats();
  renderBookingRows();
  renderDestinations();
  renderPopularDestinations();
  applySearch(searchTerm);
}

function changeView(view) {
  const viewPanel = document.querySelector(`[data-view-panel="${view}"]`);
  if (!viewPanel) return;
  activeView = view;
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel !== viewPanel;
    panel.classList.toggle("is-visible", panel === viewPanel);
  });
  document.querySelectorAll(".admin-nav-link").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
  document.querySelectorAll("[data-view]").forEach((button) => {
    if (button.classList.contains("admin-profile-button")) return;
    button.setAttribute("aria-current", button.dataset.view === view ? "page" : "false");
  });
  const labels = { overview: "Ringkasan", bookings: "Pesanan", destinations: "Wahana", reports: "Laporan", settings: "Pengaturan" };
  document.getElementById("currentViewLabel").textContent = labels[view];
  document.getElementById("adminSearch").value = "";
  document.getElementById("bookingSearch").value = "";
  document.getElementById("destinationSearch").value = "";
  searchTerm = "";
  closeSidebar();
}

function closeSidebar() {
  document.body.classList.remove("admin-sidebar-open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
}

function applySearch(value) {
  searchTerm = value.trim().toLowerCase();
  renderBookingRows();
  document.querySelectorAll("#recentBookingsBody tr[data-search]").forEach((row) => { row.hidden = !row.dataset.search.includes(searchTerm); });
  const destinationRows = [...document.querySelectorAll("#destinationsBody tr[data-search]")];
  destinationRows.forEach((row) => { row.hidden = !row.dataset.search.includes(searchTerm); });
}

function setBookingFilter(filter) {
  activeBookingFilter = filter;
  document.querySelectorAll("[data-booking-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.bookingFilter === filter));
  renderBookingRows();
}

function persistData() {
  saveLocal("tourify-admin-bookings", bookings);
  saveLocal("tourify-admin-destinations", destinations);
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "wahana";
}

function openDestinationDialog(destination = null) {
  const dialog = document.getElementById("destinationDialog");
  document.getElementById("destinationDialogTitle").textContent = destination ? "Edit wahana" : "Tambah wahana";
  document.getElementById("destinationId").value = destination?.id || "";
  document.getElementById("destinationName").value = destination?.name || "";
  document.getElementById("destinationCity").value = destination?.city || "";
  document.getElementById("destinationPrice").value = destination?.price ?? "";
  dialog.showModal();
  document.getElementById("destinationName").focus();
}

function exportBookings() {
  const columns = ["ID pesanan", "Pelanggan", "Email", "Destinasi", "Tanggal kunjungan", "Jumlah tiket", "Total", "Status"];
  const rows = bookings.map((booking) => [booking.id, booking.name, booking.email, booking.destination, booking.visitDate, booking.tickets, booking.total, booking.status]);
  const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
  link.download = "tourify-pesanan.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  showToast("Data pesanan berhasil diunduh.");
}

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => changeView(button.dataset.view)));
document.querySelectorAll("[data-open-destination]").forEach((button) => button.addEventListener("click", () => openDestinationDialog()));
document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => document.getElementById("destinationDialog").close()));
document.querySelectorAll("[data-booking-filter]").forEach((button) => button.addEventListener("click", () => setBookingFilter(button.dataset.bookingFilter)));
document.querySelectorAll("[data-export-bookings]").forEach((button) => button.addEventListener("click", exportBookings));

document.getElementById("bookingsBody").addEventListener("click", (event) => {
  const action = event.target.closest("[data-booking-action]");
  if (!action) return;
  const booking = bookings.find((item) => item.id === action.dataset.bookingAction);
  if (!booking || booking.status === "Selesai") return;
  booking.status = booking.status === "Menunggu" ? "Terkonfirmasi" : "Selesai";
  persistData();
  renderAll();
  showToast(`Status ${booking.id} diperbarui menjadi ${booking.status.toLowerCase()}.`);
});

document.getElementById("recentBookingsBody").addEventListener("click", (event) => {
  const action = event.target.closest("[data-booking-action]");
  if (!action) return;
  changeView("bookings");
  const booking = bookings.find((item) => item.id === action.dataset.bookingAction);
  if (booking) setBookingFilter(booking.status);
});

document.getElementById("destinationsBody").addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-destination-toggle]");
  const edit = event.target.closest("[data-edit-destination]");
  const remove = event.target.closest("[data-delete-destination]");
  if (toggle) {
    const destination = destinations.find((item) => item.id === toggle.dataset.destinationToggle);
    if (!destination) return;
    destination.active = !destination.active;
    persistData();
    renderAll();
    showToast(`${destination.name} sekarang ${destination.active ? "aktif" : "nonaktif"}.`);
  }
  if (edit) {
    const destination = destinations.find((item) => item.id === edit.dataset.editDestination);
    if (destination) openDestinationDialog(destination);
  }
  if (remove) {
    const destination = destinations.find((item) => item.id === remove.dataset.deleteDestination);
    if (!destination || !window.confirm(`Hapus ${destination.name} dari katalog?`)) return;
    destinations = destinations.filter((item) => item.id !== destination.id);
    persistData();
    renderAll();
    showToast(`${destination.name} dihapus dari katalog.`);
  }
});

document.getElementById("destinationForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const idInput = document.getElementById("destinationId").value;
  const name = document.getElementById("destinationName").value.trim();
  const city = document.getElementById("destinationCity").value.trim();
  const price = Number(document.getElementById("destinationPrice").value);
  const existing = destinations.find((destination) => destination.id === idInput);
  const duplicateId = slugify(name);
  if (destinations.some((destination) => destination.id !== idInput && destination.name.trim().toLowerCase() === name.toLowerCase())) {
    showToast("Nama wahana tersebut sudah ada di katalog.");
    return;
  }
  if (existing) {
    existing.name = name;
    existing.city = city;
    existing.price = price;
  } else {
    destinations.unshift({ id: duplicateId, name, city, price, orders: 0, active: true, image: "assets/coast-hero.png" });
  }
  persistData();
  renderAll();
  document.getElementById("destinationDialog").close();
  event.currentTarget.reset();
  document.getElementById("destinationId").value = "";
  showToast(existing ? "Informasi wahana berhasil diperbarui." : "Wahana baru berhasil ditambahkan.");
});

document.getElementById("adminSearch").addEventListener("input", (event) => {
  if (activeView === "bookings") document.getElementById("bookingSearch").value = event.target.value;
  if (activeView === "destinations") document.getElementById("destinationSearch").value = event.target.value;
  applySearch(event.target.value);
});
document.getElementById("bookingSearch").addEventListener("input", (event) => {
  document.getElementById("adminSearch").value = event.target.value;
  applySearch(event.target.value);
});
document.getElementById("destinationSearch").addEventListener("input", (event) => {
  const value = event.target.value;
  document.getElementById("adminSearch").value = event.target.value;
  applySearch(value);
});

document.getElementById("menuToggle").addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("admin-sidebar-open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", String(isOpen));
});
document.getElementById("sidebarBackdrop").addEventListener("click", closeSidebar);
document.querySelector(".admin-notification-button").addEventListener("click", () => showToast("Belum ada notifikasi baru."));
window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("adminSearch").focus();
  }
});

document.getElementById("profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("profileName").value.trim();
  const email = document.getElementById("profileEmail").value.trim();
  saveLocal("tourify-admin-profile", { name, email });
  document.getElementById("topbarName").textContent = name;
  document.getElementById("topbarAvatar").textContent = initials(name).slice(0, 1);
  document.getElementById("welcomeName").textContent = name.split(/\s+/)[0];
  document.getElementById("profileSaveMessage").textContent = "Tersimpan";
  showToast("Profil administrator berhasil diperbarui.");
});

const savedProfile = readLocal("tourify-admin-profile", null);
if (savedProfile) {
  document.getElementById("profileName").value = savedProfile.name;
  document.getElementById("profileEmail").value = savedProfile.email;
  document.getElementById("topbarName").textContent = savedProfile.name;
  document.getElementById("topbarAvatar").textContent = initials(savedProfile.name).slice(0, 1);
  document.getElementById("welcomeName").textContent = savedProfile.name.split(/\s+/)[0];
}

const notificationSettings = readLocal("tourify-admin-notifications", { newBooking: true, weeklySummary: true });
document.getElementById("newBookingNotifications").checked = notificationSettings.newBooking;
document.getElementById("weeklySummaryNotifications").checked = notificationSettings.weeklySummary;
document.querySelectorAll(".admin-toggle-row input").forEach((input) => input.addEventListener("change", () => {
  saveLocal("tourify-admin-notifications", {
    newBooking: document.getElementById("newBookingNotifications").checked,
    weeklySummary: document.getElementById("weeklySummaryNotifications").checked
  });
  showToast("Preferensi notifikasi disimpan.");
}));

const date = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
document.getElementById("currentDate").textContent = date.toLocaleUpperCase("id-ID");

renderAll();
