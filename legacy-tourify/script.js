/* DATA TAMAN HIBURAN */
const destinations = {
  ocean: {
    name: "Ocean Park",
    location: "Jakarta Selatan",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1000&q=80",
    description: "Taman bermain air dengan banyak wahana seru untuk keluarga.",
    rides: [
      ["🌊", "Kolam Ombak", "Kolam dengan ombak buatan."],
      ["💦", "Water Slide", "Seluncuran air yang seru."],
      ["🛟", "Lazy River", "Santai menggunakan ban pelampung."],
      ["🐳", "Aqua Play", "Area bermain air untuk anak-anak."]
    ]
  },

  dufan: {
    name: "Dufan",
    location: "Jakarta Utara",
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1000&q=80",
    description: "Taman hiburan dengan permainan keluarga dan wahana menegangkan.",
    rides: [
      ["🎢", "Roller Coaster", "Wahana cepat untuk pencari adrenalin."],
      ["🎠", "Kora-Kora", "Ayunan kapal besar yang seru."],
      ["🏎️", "Bumper Car", "Mobil bertabrakan yang aman."],
      ["🚂", "Kereta Mini", "Keliling taman bersama keluarga."]
    ]
  },

  waterbom: {
    name: "Waterbom Jakarta",
    location: "Jakarta Barat",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=80",
    description: "Taman air modern dengan kolam dan seluncuran untuk semua usia.",
    rides: [
      ["⚡", "Speed Slide", "Seluncuran tinggi dan cepat."],
      ["🏊", "Kolam Arus", "Bersantai mengikuti aliran air."],
      ["🦈", "Kids Pool", "Kolam dangkal untuk anak-anak."],
      ["🌴", "Wave Pool", "Kolam ombak buatan."]
    ]
  },

  trans: {
    name: "Trans Studio",
    location: "Bandung",
    image: "https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1000&q=80",
    description: "Taman hiburan dalam ruangan dengan wahana dan pertunjukan.",
    rides: [
      ["🏍️", "Racing Coaster", "Permainan cepat dan menantang."],
      ["🎪", "Magic Show", "Pertunjukan sulap keluarga."],
      ["🕹️", "Arcade Zone", "Permainan digital."],
      ["🚠", "Sky Ride", "Melihat taman dari atas."]
    ]
  }
};

/* KARTU DESTINASI */
function createParkCard(id, park) {
  return `
    <a href="detail.html?id=${id}" class="park-card">
      <img src="${park.image}" alt="${park.name}">
      <div class="park-card-content">
        <h3>${park.name}</h3>
        <p class="location">${park.location}</p>
        <p class="description">${park.description}</p>
        <span class="park-link">Lihat wahana →</span>
      </div>
    </a>
  `;
}

function createFeaturedCard(id, park) {
  return `
    <a href="detail.html?id=${id}" class="destination-tile">
      <img src="${park.image}" alt="">
      <div class="destination-info">
        <h3>${park.name}</h3>
        <p>${park.location}</p>
      </div>
    </a>
  `;
}

/* BERANDA */
const popularList = document.getElementById("popularList");
if (popularList) {
  popularList.innerHTML = Object.entries(destinations)
    .map(([id, park]) => createFeaturedCard(id, park))
    .join("");

  // Repeat the destinations three times so the cards form a gentler ring around the viewer.
  // CSS stops the rotation for visitors who prefer reduced motion, while keeping
  // the curved layout in place.
  const originalCards = Array.from(popularList.children);
  for (let repeat = 1; repeat < 3; repeat += 1) {
    originalCards.forEach((card) => {
      const copy = card.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("tabindex", "-1");
      popularList.appendChild(copy);
    });
  }

  function positionDestinationCards() {
    const cards = Array.from(popularList.children);
    if (cards.length < 2) return;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const cardRadius = (cardWidth / 2 / Math.tan(Math.PI / cards.length)) * 1.05;
    const carouselWidth = popularList.parentElement.clientWidth;
    const radius = Math.ceil(Math.max(cardRadius, Math.min(carouselWidth * 0.32, cardRadius * 1.12)));

    popularList.style.setProperty("--ring-radius", radius + "px");
    cards.forEach((card, index) => {
      card.style.setProperty("--card-angle", (index * 360) / cards.length + "deg");
    });
  }

  positionDestinationCards();
  window.addEventListener("resize", positionDestinationCards);
}

/* NAVBAR HOME: MUNCUL SAAT POINTER NAIK, SEMBUNYI SAAT TURUN */
const homeNavbar = document.querySelector(".home-page .navbar");
if (homeNavbar) {
  let previousPointerY = null;
  let previousScrollY = window.scrollY;

  function showHomeNavbar() {
    homeNavbar.classList.remove("is-hidden");
  }

  function hideHomeNavbar() {
    if (!homeNavbar.contains(document.activeElement)) {
      homeNavbar.classList.add("is-hidden");
    }
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;

    if (event.clientY < 90 || (previousPointerY !== null && event.clientY < previousPointerY - 2)) {
      showHomeNavbar();
    } else if (previousPointerY !== null && event.clientY > previousPointerY + 2 && event.clientY > 120) {
      hideHomeNavbar();
    }

    previousPointerY = event.clientY;
  }, { passive: true });

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < previousScrollY - 1 || currentScrollY <= 10) {
      showHomeNavbar();
    } else if (currentScrollY > previousScrollY + 1) {
      hideHomeNavbar();
    }
    previousScrollY = currentScrollY;
  }, { passive: true });

  homeNavbar.addEventListener("focusin", showHomeNavbar);
}

/* PENCARIAN */
const headerSearchForm = document.getElementById("headerSearchForm");
if (headerSearchForm) {
  headerSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const keyword = document.getElementById("headerSearch").value.trim();
    window.location.href = "destinasi.html?q=" + encodeURIComponent(keyword);
  });
}

const destinationList = document.getElementById("destinationList");
if (destinationList) {
  const firstKeyword = new URLSearchParams(window.location.search).get("q") || "";
  const searchInput = document.getElementById("searchDestination");
  searchInput.value = firstKeyword;

  function renderDestinations(keyword) {
    const search = keyword.toLowerCase();
    const filtered = Object.entries(destinations).filter(([, park]) =>
      park.name.toLowerCase().includes(search) ||
      park.location.toLowerCase().includes(search)
    );
    destinationList.innerHTML = filtered.length
      ? filtered.map(([id, park]) => createParkCard(id, park)).join("")
      : "<p>Taman hiburan tidak ditemukan.</p>";
  }

  renderDestinations(firstKeyword);
  searchInput.addEventListener("input", () => renderDestinations(searchInput.value));
}

/* INFORMASI WAHANA */
const detailContent = document.getElementById("detailContent");
if (detailContent) {
  const id = new URLSearchParams(window.location.search).get("id");
  const park = destinations[id];

  if (!park) {
    detailContent.innerHTML = "<div class='container section'><h2>Taman tidak ditemukan.</h2><a href='destinasi.html'>Lihat semua wahana →</a></div>";
  } else {
    const rides = park.rides.map((ride) => `
      <article class="ride-card">
        <div>${ride[0]}</div>
        <h3>${ride[1]}</h3>
        <p>${ride[2]}</p>
      </article>
    `).join("");

    detailContent.innerHTML = `
      <section class="detail-banner">
        <img src="${park.image}" alt="${park.name}">
        <div class="detail-title">
          <p>📍 ${park.location}</p>
          <h1>${park.name}</h1>
        </div>
      </section>
      <section class="container detail-layout">
        <div>
          <a class="detail-back" href="destinasi.html">← Semua wahana</a>
          <h2>Tentang taman ini</h2>
          <p class="description">${park.description}</p>
          <h2>Wahana yang tersedia</h2>
          <div class="ride-grid">${rides}</div>
        </div>
      </section>
    `;
  }
}
