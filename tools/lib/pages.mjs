import { allActivities } from './all-activities.mjs';
import { allSequences } from './sequences.mjs';
import { classDiagram } from './classes.mjs';
import { usecaseDiagram } from './usecase.mjs';
import { customerActivities } from './content-activities.mjs';
import { adminActivities } from './content-admin.mjs';
import { firstSequences } from './content-sequences.mjs';
import { lastSequences } from './content-more-sequences.mjs';
import { usecaseRows } from './content-usecase.mjs';
import { usecaseScenarios } from './content-usecase-scenarios.mjs';
import { classRecords, relationRows } from './content-class.mjs';
import { h, page, section, figure, table, scenarios, steps, codeFor } from './html.mjs';

export function buildPages() {
    const activities = { ...customerActivities, ...adminActivities };
    const workflows = allActivities();
    const sequenceScenes = allSequences();
    const sequenceContent = { ...firstSequences, ...lastSequences };
    const actSections = workflows.map((s) => {
        const content = activities[s.id.toLowerCase()];
        return section(`a-${s.id.slice(1)}`, s.id, s.title, `<p class="lead">${h(content.intro)}</p>${figure(s)}<h3>Cara mengikuti alur</h3>${steps(content.steps)}<h3>Situasi yang mungkin terjadi</h3>${scenarios(content.situations)}`);
    });
    const activityPage = page({
        title: 'Diagram aktivitas — Cara kerja layanan', active: 'activity',
        subtitle: 'Tujuh alur kerja yang menjelaskan pendaftaran, masuk, pemeriksaan motor, pengelolaan data bengkel, aturan pemeriksaan, dan akun pelanggan.',
        toc: workflows.map((s) => [`a-${s.id.slice(1)}`, s.title]), sections: actSections,
    });
    const seqSections = sequenceScenes.map((s) => {
        const content = sequenceContent[s.id];
        const messageSteps = s.messages.map((m) => m.condition ? `${m.condition}: ${m.label}` : m.label);
        return section(`s-${s.id.slice(1)}`, codeFor(s), s.title, `<p class="lead">${h(content.intro)}</p><div class="notice"><p>Baca pesan dari atas ke bawah. Keterangan yang diawali <strong>Jika</strong> menunjukkan pilihan atau syarat pada pesan tersebut. Balasan ditampilkan dengan garis putus-putus; tidak ada bingkai khusus untuk pilihan atau pengulangan.</p></div>${figure(s)}<h3>Urutan yang dijelaskan gambar</h3>${steps(messageSteps)}<h3>Situasi yang mungkin terjadi</h3>${scenarios(content.situations)}`);
    });
    const sequencePage = page({
        title: 'Diagram urutan — Urutan pesan layanan', active: 'sequence',
        subtitle: 'Tujuh urutan pesan yang menjelaskan siapa melakukan apa, kapan data disimpan, dan apa yang terjadi ketika pilihan atau kesalahan muncul.',
        toc: sequenceScenes.map((s) => [`s-${s.id.slice(1)}`, s.title]), sections: seqSections,
    });
    if (usecaseScenarios.length !== usecaseRows.length) {
        throw new Error('Jumlah skenario tidak sama dengan jumlah layanan pada diagram kasus penggunaan.');
    }
    const scenarioCode = (i) => `UC${String(i + 1).padStart(2, '0')}`;
    const scenarioSections = usecaseScenarios.map((content, i) => {
        const code = scenarioCode(i);
        const facts = [
            ['Tujuan', content.goal], ['Pelaku', content.actor],
            ['Kondisi awal', content.before], ['Hasil akhir', content.after],
        ].map(([label, value]) => `<article class="fact-card"><h3>${h(label)}</h3><p>${h(value)}</p></article>`).join('');
        return section(`skenario-${code.toLowerCase()}`, code, usecaseRows[i][0],
            `<div class="two-columns scenario-facts">${facts}</div><h3>Skenario utama</h3>${steps(content.steps)}<h3>Skenario alternatif dan pengecualian</h3>${scenarios(content.alternatives)}`);
    });
    const usecase = usecaseDiagram()[0];
    const usecaseSection = section('uc-diagram', 'D-01', 'Layanan bagi pengunjung, pelanggan, dan admin', `<p class="lead">Diagram ini menunjukkan layanan yang tersedia bagi setiap jenis pengguna. Admin juga memiliki kemampuan pelanggan, tetapi hanya admin yang dapat mengelola data bengkel dan laporan.</p>${figure(usecase)}<ul class="key-list"><li><strong>Elips</strong> menunjukkan satu layanan yang dapat dilakukan.</li><li><strong>Garis putus-putus</strong> menunjukkan langkah lanjutan atau pilihan tambahan.</li><li><strong>Panah menuju Pelanggan</strong> menunjukkan bahwa admin mendapat kemampuan pelanggan juga.</li></ul><h3>Penjelasan semua layanan</h3><p>Kode UC01–UC19 menghubungkan ringkasan berikut dengan skenario lengkap pada bagian selanjutnya.</p>${table(['Layanan', 'Pengguna', 'Kegunaan'], usecaseRows.map((row, i) => [`${row[0]} (${scenarioCode(i)})`, row[1], row[2]]))}`);
    const usecaseToc = [['uc-diagram', 'D-01 · Diagram utama'], ...usecaseScenarios.map((_, i) => [`skenario-${scenarioCode(i).toLowerCase()}`, `${scenarioCode(i)} · ${usecaseRows[i][0]}`])];
    const usecasePage = page({ title: 'Diagram kasus penggunaan — Layanan AKC Workshop', active: 'usecase', subtitle: 'Sembilan belas layanan untuk pengunjung, pelanggan, dan admin, lengkap dengan skenario utama, pilihan, dan pengecualiannya.', toc: usecaseToc, sections: [usecaseSection, ...scenarioSections] });
    const klass = classDiagram()[0];
    const classCards = classRecords.map(([id, name, fields, use]) => {
        const shape = klass.shapes.find((item) => item.id === id);
        if (!shape) throw new Error(`Kelas ${id} belum memiliki penjelasan.`);
        const methods = shape.operations || [];
        const methodList = methods.length
            ? `<h4>Method yang tersedia</h4><ul class="class-methods">${methods.map((operation) => `<li><code>${h(operation)}</code></li>`).join('')}</ul>`
            : '<p class="muted"><strong>Tabel penghubung:</strong> tidak memiliki kelas model maupun method sendiri.</p>';
        return `<article class="card"><h3>${h(name)}</h3><p>${h(fields)}</p><p class="muted" style="margin-top:10px">${h(use)}</p>${methodList}</article>`;
    }).join('');
    const classSection = section('class-diagram', 'C-01', 'Kelas, atribut, method, dan hubungannya', `<p class="lead">Setiap model menyimpan data sekaligus menyediakan operasi untuk mengelolanya. Garis pemisah pada kotak membedakan atribut dari method.</p>${figure(klass)}<div class="notice"><p><strong>Enam model dan dua tabel penghubung.</strong> Model mewarisi operasi umum seperti <code>create()</code>, <code>update()</code>, dan <code>delete()</code> dari kelas abstrak <code>Model</code>. Diagram menampilkan method utama dan sebagian operasi warisan yang digunakan. Parameter dengan nilai bawaan tidak diuraikan. <code>rule_premis</code> dan <code>kerusakan_sparepart</code> adalah tabel penghubung, bukan model PHP yang memiliki method sendiri.</p></div><ul class="key-list"><li><span class="relation-symbol">+ dan −</span> Method publik (+) dapat dipakai pemanggil; method privat (−) hanya dipakai di dalam model. Semuanya bergaris bawah karena merupakan method statis, sehingga dipanggil dengan <code>NamaModel::method()</code>.</li><li><span class="relation-symbol">1 → 0..*</span> Satu objek dapat berhubungan dengan nol atau lebih objek lain.</li><li><span class="relation-symbol">0..1</span> Hubungan bersifat pilihan dan boleh belum diisi.</li><li>Garis tidak menunjukkan urutan kerja. Rincian hubungan tersedia pada tabel di bawah.</li></ul><h3>Atribut dan method setiap kelas</h3><div class="cards">${classCards}</div><h3>Arti hubungan antarobjek</h3>${table(['Hubungan', 'Jumlah kaitan', 'Penjelasan'], relationRows)}`);
    const classPage = page({ title: 'Diagram kelas — Model dan operasi AKC Workshop', active: 'class-diagram', subtitle: 'Enam model PHP, atribut, method yang dipakai aplikasi, dua tabel penghubung, dan hubungan datanya.', toc: [['class-diagram', 'Kelas, atribut, method, dan hubungannya']], sections: [classSection] });
    return { 'activity-diagram.html': activityPage, 'sequence-diagram.html': sequencePage, 'usecase-diagram.html': usecasePage, 'class-diagram.html': classPage };
}
