// Susun ulang berkas halaman Activity & Sequence dari sumber PlantUML.
// Untuk setiap lembar (section id + angka), ganti seluruh <figure>…</figure> dengan
// <pre class="puml"> berisi sumber, dan ganti legend/titleblock sesuai data di bawah.
//
// Pakai: node tools/build-pages.mjs [activity|sequence]
import { readFileSync, writeFileSync } from 'node:fs';

const SKIN = `skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 13
skinparam ArrowColor #0F0E17
skinparam ArrowThickness 1.2
skinparam ActivityBorderColor #0F0E17
skinparam ActivityBackgroundColor #FFFFFE
skinparam ActivityBorderThickness 1.1
skinparam ActivityDiamondBackgroundColor #FFF1E0
skinparam ActivityDiamondBorderColor #0F0E17
skinparam SwimlaneTitleBackgroundColor #0F0E17
skinparam SwimlaneTitleFontColor #FFFFFE
skinparam SwimlaneTitleFontStyle bold
skinparam SwimlaneBorderColor #0F0E17
skinparam shadowing false
skinparam ActivityPadding 14
skinparam padding 2`;

const SEQ_SKIN = `skinparam defaultFontName "Segoe UI"
skinparam defaultFontSize 13
skinparam ArrowColor #0F0E17
skinparam ArrowThickness 1.2
skinparam LifeLineBorderColor #A7A9BE
skinparam SequenceGroupBorderColor #0F0E17
skinparam SequenceGroupBackgroundColor #FFF1E0
skinparam SequenceGroupBodyBackgroundColor #FFFFFE
skinparam SequenceGroupFontStyle bold
skinparam SequenceBoxBorderColor #0F0E17
skinparam ActorBorderColor #0F0E17
skinparam ActorBackgroundColor #FFFFFE
skinparam ParticipantBorderColor #0F0E17
skinparam ParticipantBackgroundColor #FFFFFE
skinparam NoteBorderColor #FF8906
skinparam NoteBackgroundColor #FFF1E0
skinparam shadowing false
skinparam padding 2
autonumber`;

export const PAGES = {
    activity: {
        file: 'activity-diagram.html',
        intro: `<p>Tujuh alur kerja digambar dengan notasi UML: setiap diagram dimulai dari bulatan penuh (<b>awal</b>) dan
           diakhiri bulatan bercincin (<b>selesai</b>). Kolom-kolom memisahkan pekerjaan <b>pengguna</b>, <b>admin</b>, dan
           <b>sistem</b>, sehingga terbaca siapa mengerjakan apa. Lembar A-02 memperbesar satu langkah penalaran karena
           di situlah metode <em>backward chaining</em> bekerja.</p>`,
        sheets: [
            {
                id: 'a01', no: 'A-01', title: 'Registrasi &amp; login', src: 'tools/puml/a01.puml',
                metaLabel: 'Halaman', meta: 'pendaftaran, masuk', uc: 'UC01, UC02',
                legend: [
                    '<b>●</b> awal &nbsp; <b>◉</b> selesai &nbsp; <b>◇</b> keputusan',
                    'Isian yang salah mengembalikan pengunjung ke formulir, bukan ke halaman kosong.',
                ],
            },
            {
                id: 'a02', no: 'A-02', title: 'Penalaran backward chaining', src: 'tools/puml/a02.puml',
                metaLabel: 'Bagian', meta: 'mesin penalaran', uc: 'UC06',
                legend: [
                    '<b>gugur</b> ada pertanyaan yang dijawab Tidak',
                    '<b>terbuka</b> masih ada pertanyaan yang belum dijawab',
                    '<b>terbukti</b> semua pertanyaan dijawab Ya',
                    '<b>gagal</b> tidak ada hipotesis yang tersisa',
                ],
            },
            {
                id: 'a03', no: 'A-03', title: 'Mulai konsultasi', src: 'tools/puml/a03.puml',
                metaLabel: 'Halaman', meta: 'konsultasi baru', uc: 'UC05',
                legend: [
                    '<b>Target</b> perkiraan kerusakan boleh diisi; bila diisi, mesin hanya menilai penyebab itu',
                    '<b>Kode konsultasi</b> dibuat otomatis dari tanggal dan nomor urut',
                ],
            },
            {
                id: 'a04', no: 'A-04', title: 'Menjawab pertanyaan', src: 'tools/puml/a04.puml',
                metaLabel: 'Halaman', meta: 'halaman pertanyaan', uc: 'UC06, UC07, UC08',
                legend: [
                    '<b>Ubah jawaban</b> hanya membuang satu jawaban terakhir',
                    '<b>Batalkan</b> menghentikan konsultasi, riwayat tetap tersimpan',
                ],
            },
            {
                id: 'a05', no: 'A-05', title: 'Menyelesaikan &amp; melihat hasil', src: 'tools/puml/a05.puml',
                metaLabel: 'Halaman', meta: 'hasil diagnosa', uc: 'UC09',
                legend: [
                    'Hasil dibekukan saat penalaran berhenti, jadi angka pada halaman hasil tidak berubah di kemudian hari.',
                ],
            },
            {
                id: 'a06', no: 'A-06', title: 'Unduh work order PDF', src: 'tools/puml/a06.puml',
                metaLabel: 'Halaman', meta: 'unduh work order', uc: 'UC10',
                legend: [
                    '<b>attachment</b> membuat peramban langsung menyimpan berkas',
                    'Berkas dibuat di server, jadi tidak bergantung pada peramban pengguna.',
                ],
            },
            {
                id: 'a07', no: 'A-07', title: 'Laporan PDF admin', src: 'tools/puml/a07.puml',
                metaLabel: 'Halaman', meta: 'menu laporan', uc: 'UC19',
                legend: [
                    '<b>Jenis laporan</b> ringkasan, konsultasi, aturan, gejala, kerusakan, sparepart, pengguna',
                    '<b>Orientasi kertas</b> mendatar hanya untuk laporan konsultasi',
                    '<b>Rentang tanggal</b> dipakai laporan ringkasan dan konsultasi',
                ],
            },
        ],
    },
    sequence: {
        file: 'sequence-diagram.html',
        intro: `<p>Tujuh percakapan antar bagian sistem, dari layar yang dipakai pengguna sampai penyimpanan data.
           Nomor urut menunjukkan urutan pesan; kotak <em>alt</em> memisahkan jalur berhasil dan jalur gagal.</p>`,
        sheets: [
            {
                id: 's01', no: 'S-01', title: 'Login', src: 'tools/puml/s01.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'halaman masuk', uc: 'UC02',
            },
            {
                id: 's02', no: 'S-02', title: 'Registrasi akun', src: 'tools/puml/s02.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'halaman daftar', uc: 'UC01',
            },
            {
                id: 's03', no: 'S-03', title: 'Mulai konsultasi', src: 'tools/puml/s03.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'formulir konsultasi', uc: 'UC05',
            },
            {
                id: 's04', no: 'S-04', title: 'Jawab pertanyaan &amp; penalaran', src: 'tools/puml/s04.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'halaman pertanyaan', uc: 'UC06',
            },
            {
                id: 's05', no: 'S-05', title: 'Lihat hasil diagnosa', src: 'tools/puml/s05.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'halaman hasil', uc: 'UC09',
            },
            {
                id: 's06', no: 'S-06', title: 'Unduh work order PDF', src: 'tools/puml/s06.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'halaman unduhan', uc: 'UC10',
            },
            {
                id: 's07', no: 'S-07', title: 'Laporan PDF admin', src: 'tools/puml/s07.puml', skin: SEQ_SKIN,
                metaLabel: 'Halaman', meta: 'menu laporan', uc: 'UC19',
            },
        ],
    },
};

/** Ganti isi <figure> milik section tertentu dengan blok PlantUML dari berkas sumber. */
function patchPage(page) {
    let html = readFileSync(page.file, 'utf8');
    for (const s of page.sheets) {
        const code = `${s.skin || SKIN}\n\n${readFileSync(s.src, 'utf8').trim()}\n`;
        const figure = `<figure class="drawing" data-puml>\n<pre class="puml">\n${code}</pre>\n            </figure>`;
        const legend = s.legend?.length
            ? `            <div class="legend">\n${s.legend.map((l) => `                <span>${l}</span>`).join('\n')}\n            </div>\n`
            : '';
        const title = `            <div class="titleblock">\n`
            + `                <div><span>Lembar</span><b>${s.no}</b></div>\n`
            + `                <div><span>Judul</span><b>${s.title}</b></div>\n`
            + `                <div><span>${s.metaLabel}</span><code>${s.meta}</code></div>\n`
            + `                <div><span>UC terkait</span><b>${s.uc}</b></div>\n`
            + `            </div>\n`;

        const start = html.indexOf(`<section class="sheet" id="${s.id}"`);
        if (start < 0) throw new Error(`${page.file}: section #${s.id} tidak ditemukan`);
        const figStart = html.indexOf('<figure', start);
        const figEnd = html.indexOf('</figure>', figStart) + '</figure>'.length;
        const secEnd = html.indexOf('</section>', figEnd);

        // head (sampai sebelum <figure>) + figure + legend + titleblock + penutup section
        const head = html.slice(start, figStart);
        const tail = html.slice(secEnd);
        html = html.slice(0, start) + head + figure + '\n' + legend + title + '        ' + tail;
    }
    writeFileSync(page.file, html, 'utf8');
    console.log(`${page.file}: ${page.sheets.length} lembar disusun ulang`);
}

const SKIN_SEQ = SEQ_SKIN;

const target = process.argv[2];
if (target) patchPage(PAGES[target]);
