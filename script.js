const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzG4sqCdeQ8-99EkoPIiT5raW4ABXKMM1mhPj4Piv6d3Yf7KfPNuyvIQ6EN14p4bXIbmQ/exec;

// Fungsi untuk berpindah halaman (Navigasi Peran)
function switchPage(pageId) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');

    if (pageId === 'waliPage') {
        muatLaporanWali();
    }
}

// Memuat data awal untuk dropdown saat aplikasi dibuka
document.addEventListener("DOMContentLoaded", function () {
    fetch(WEB_APP_URL + "?action=getData")
        .then(response => response.json())
        .then(data => {
            populateDropdown("namaGuru", data.guru);
            populateDropdown("kelas", data.kelas);
            populateDropdown("sekolah", data.sekolah);
            populateDropdown("filterKelasWali", data.kelas);
        })
        .catch(error => console.error("Gagal memuat data dropdown:", error));
});

function populateDropdown(elementId, items) {
    const select = document.getElementById(elementId);
    if (!select) return;
    
    items.forEach(item => {
        let option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

// Mengirim data form laporan dari Guru
document.getElementById("laporanForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const btnSimpan = document.getElementById("btnSimpan");
    btnSimpan.textContent = "Mengirim...";
    btnSimpan.disabled = true;

    const formData = {
        namaGuru: document.getElementById("namaGuru").value,
        kelas: document.getElementById("kelas").value,
        sekolah: document.getElementById("sekolah").value,
        catatan: document.getElementById("catatan").value
    };

    fetch(WEB_APP_URL, {
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(result => {
        alert("Laporan berhasil disimpan!");
        document.getElementById("laporanForm").reset();
        btnSimpan.textContent = "Kirim Laporan";
        btnSimpan.disabled = false;
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat menyimpan.");
        btnSimpan.textContent = "Kirim Laporan";
        btnSimpan.disabled = false;
    });
});

// Fungsi untuk Wali Murid melihat laporan yang tersimpan
function muatLaporanWali() {
    const container = document.getElementById("daftarLaporanWali");
    container.innerHTML = "<p style='text-align:center;'>Memuat data laporan...</p>";

    fetch(WEB_APP_URL + "?action=getLaporan")
        .then(response => response.json())
        .then(data => {
            container.innerHTML = "";
            const filterKelas = document.getElementById("filterKelasWali").value;

            const filteredData = filterKelas === "semua" 
                ? data 
                : data.filter(item => item.kelas === filterKelas);

            if (filteredData.length === 0) {
                container.innerHTML = "<p style='text-align:center; color:#777;'>Belum ada laporan untuk kelas ini.</p>";
                return;
            }

            filteredData.forEach(item => {
                const card = document.createElement("div");
                card.className = "laporan-card";
                card.innerHTML = `
                    <div class="laporan-header">
                        <span>${item.namaGuru} (${item.kelas})</span>
                        <span class="laporan-date">${item.tanggal}</span>
                    </div>
                    <div style="font-size: 12px; color: #666;">Sekolah: ${item.sekolah}</div>
                    <div class="laporan-body">${item.catatan}</div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            container.innerHTML = "<p style='text-align:center; color:red;'>Gagal mengambil laporan.</p>";
        });
}