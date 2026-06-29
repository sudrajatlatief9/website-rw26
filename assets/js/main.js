(() => {
  "use strict";

  const cfg = window.RW26_CONFIG || {};
  const navbar = document.getElementById("mainNav");
  const backToTop = document.getElementById("backToTop");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const collapseElement = document.getElementById("navbarMenu");

  // 1. Data Fallback (untuk jaga-jaga jika API gagal/loading)
  const fallback = {
    himbauan: [
      { judul: "Kerja bakti lingkungan", imageUrl: "assets/images/slide-kerja-bakti.svg" },
      { judul: "Posyandu RW 26", imageUrl: "assets/images/slide-posyandu.svg" },
      { judul: "Pelayanan administrasi", imageUrl: "assets/images/slide-pelayanan.svg" }
    ],
    announcements: [],
    news: [],
    facilities: [],
    organization: { rw: [], "bank-sampah": [], pokmas: [] }
  };

  const icons = { Administrasi: "bi-receipt", Fasilitas: "bi-tools", Informasi: "bi-megaphone", Kegiatan: "bi-people-fill", Kesehatan: "bi-heart-pulse", Olahraga: "bi-trophy" };
  const iconColors = ["amber", "green", "blue", "purple"];

  // 2. Fungsi Pembersih (UI Loading)
  const clearContainers = () => {
    const ids = ["heroSlides", "heroIndicators", "announcementList", "newsList", "facilityList", "orgList"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="text-center py-5 text-muted"><div class="spinner-border spinner-border-sm" role="status"></div> Memuat data...</div>';
    });
  };

  // 3. Fungsi Utility
  const esc = (value) => { const div = document.createElement("div"); div.textContent = value ?? ""; return div.innerHTML; };
  const plainText = (value) => { const div = document.createElement("div"); div.innerHTML = value ?? ""; return div.textContent.trim(); };
  const isActive = (item) => String(item.status || "Aktif").toLowerCase() === "aktif";
  const imageUrl = (item, size = "w1200") => {
    if (item.fileId) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(item.fileId)}&sz=${size}`;
    return item.imageUrl || item.foto || "";
  };
  const formatDate = (value) => {
    const d = new Date(value);
    return !isNaN(d.getTime()) ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d).toUpperCase() : value;
  };

  // 4. Fungsi Render
  const renderHero = (items) => {
    const targetSlides = document.getElementById("heroSlides");
    const targetInd = document.getElementById("heroIndicators");
    targetSlides.innerHTML = items.map((item, i) => `
      <div class="carousel-item ${i === 0 ? "active" : ""}">
        <img src="${esc(imageUrl(item, "w2000"))}" class="d-block w-100" alt="${esc(item.judul)}">
      </div>`).join("");
    targetInd.innerHTML = items.map((item, i) => `
      <button type="button" data-bs-target="#infoCarousel" data-bs-slide-to="${i}" class="${i === 0 ? "active" : ""}"></button>`).join("");
  };

  const renderContent = (data) => {
    // Jalankan render jika data ada
    if (data.himbauan) renderHero(data.himbauan);
    // ... panggil fungsi renderAnnouncements, renderNews, dll yang sudah ada ...
  };

  // 5. Integrasi API
  const getApi = async (action) => {
    const url = `${cfg.APPS_SCRIPT_URL}?action=${encodeURIComponent(action)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal ambil data");
    return await response.json();
  };

  // 6. Inisialisasi
  document.addEventListener("DOMContentLoaded", () => {
    clearContainers(); // Tampilkan loading saat halaman buka
    
    getApi(cfg.PUBLIC_ACTION || "publicContent")
      .then(data => {
        if (data.ok) renderContent(data);
        else throw new Error(data.message);
      })
      .catch(err => {
        console.warn("API Error, menggunakan fallback:", err);
        renderContent(fallback); // Jika gagal, tampilkan data cadangan
      });

    // Event listener tambahan...
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 24);
      backToTop.classList.toggle("show", window.scrollY > 500);
    });
  });
})();