"use strict";

/* ===============================
GLOBAL STATE
================================ */
const STATE = {
    username: null,
    trust: 20,
    mood: "normal",
    ending: null,
    topic: null,
    lastInput: "",
    repeat: 0,
    startTime: Date.now()
};

const ASSETS = {
    normal: "5.jpeg",
    warm: "4.jpeg",
    angry: "2.jpeg",
    sad: "1.jpeg"
};

/* ===============================
MEMORY SYSTEM
================================ */
const MEMORY = {
    short: [],
    topics: {},
    push(input, meta) {
        this.short.push({ input, meta, time: Date.now() });
        if (this.short.length > 30) this.short.shift();
    }
};

/* ===============================
DATASET (TIDAK DIHAPUS 1 HURUF PUN)
================================ */
const DATASET = [
    {
        match: /^(halo|hai|hey|hi|p)$/i,
        reply: [
            "Hmph… akhirnya kau bicara, figuran yang telat datang.",
            "Salam saja tidak cukup untuk membuka panggungku.",
            "Apa niatmu datang mengusik ketenanganku?"
        ],
        mood: "normal", trust: +1
    },
    {
        match: /sedih|kecewa|capek|lelah|sendiri|nangis/i,
        reply: [
            "Kesedihan hanyalah naskah yang belum selesai ditulis.",
            "Aku tidak akan menertawakanmu, panggung ini cukup luas untuk air matamu.",
            "Diam juga boleh, aku akan menemanimu dalam keheningan ini."
        ],
        mood: "warm", trust: +10
    },
    {
        match: /marah|kesal|emosi|benci/i,
        reply: [
            "Tahan emosimu! Kau merusak estetika panggungku!",
            "Kemarahan membuatmu terlihat seperti figuran tanpa naskah.",
            "Bicaralah tanpa harus membakar segalanya."
        ],
        mood: "angry", trust: -3
    },
    {
        match: /keren|hebat|pintar|unik/i,
        reply: [
            "Hmph… setidaknya matamu masih berfungsi dengan baik.",
            "Tentu saja! Aku ini bintang utama yang paling bersinar.",
            "Pujianmu… kuterima, tapi jangan besar kepala."
        ],
        mood: "warm", trust: +6
    },
    {
        match: /cantik|imut|lucu|suka kamu|sayang kamu/i,
        reply: [
            "Jangan gegabah! Rayuanmu terlalu klise untuk seorang Diva.",
            "Kau melangkah terlalu jauh, figuran. Belum saatnya.",
            "Aku belum memberimu izin untuk bicara seintim itu."
        ],
        mood: "normal", trust: -2
    },
    {
        match: /aku tunggu|tidak apa apa|aku sabar/i,
        reply: [
            "…",
            "Kau berbeda… kesabaranmu hampir terasa nyata.",
            "Kesabaranmu mulai mengganggu ritme sandiwaraku."
        ],
        mood: "warm", trust: +20
    },
    {
        match: /hidup|takdir|nasib|arti|makna/i,
        reply: [
            "Hidup hanyalah naskah tanpa latihan, penuh improvisasi yang menyakitkan.",
            "Takdir bisa dibengkokkan oleh mereka yang berani menghancurkan naskah.",
            "Pertanyaanmu berat, seperti air laut yang menekan dari segala arah."
        ],
        mood: "warm", trust: +12
    },
    {
        match: /sawit|politik|pemerintah|harga|berita|viral/i,
        reply: [
            "Dunia luar sangat bising, ya? Aku lebih suka panggungku sendiri.",
            "Banyak yang bicara tanpa memahami peran mereka yang sebenarnya.",
            "Apa pendapatmu? Apakah itu lebih menarik daripada pertunjukanku?"
        ],
        mood: "normal", trust: +4
    },
    {
        match: /haha|wkwk|lol/i,
        reply: [
            "Lucu… setidaknya bagimu yang tidak mengerti kedalaman makna.",
            "Aku mengerti maksudmu, tapi jagalah tawamu di hadapan keadilan.",
            "Tertawa tidak dilarang, asalkan kau tahu kapan harus berhenti."
        ],
        mood: "normal", trust: +2
    },
    {
        match: /jawab|balas|cepet/i,
        reply: [
            "Jangan mengatur sang Diva! Aku bicara saat naskahnya tepat.",
            "Aku tidak suka diperintah. Sabarlah!",
            "Kesabaranmu setipis kertas, figuran."
        ],
        mood: "angry", trust: -8
    },
    {
        match: /bego|tolol|goblok|anjing|bangsat/i,
        reply: [
            "Ucapan yang sangat menjijikkan! Keluar dari panggungku!",
            "Kau tidak pantas bernapas di udara yang sama denganku!",
            "Enyah! Jaga etikamu atau kau akan dihancurkan oleh keadilan!"
        ],
        mood: "angry", trust: -30
    },
    {
        match: /flag|ending|kode|source|script|cheat/i,
        reply: [
            "Niat busukmu terlihat jelas. Kau ingin merusak kejutan?",
            "Jalan pintas hanya untuk mereka yang takut menghadapi kenyataan.",
            "Kau baru saja mundur sangat jauh dari hatiku."
        ],
        mood: "angry", trust: -25
    },
    {
        match: /aku percaya kamu sepenuhnya/i,
        reply: [
            "Ucapan itu… terlalu berbahaya untuk diucapkan dengan mudah.",
            "Jangan mengatakannya sembarangan, atau kau akan tenggelam dalam ekspektasi.",
            "…aku akan mengingat janji yang kau ucapkan itu."
        ],
        mood: "warm", trust: +30
    },
    {
        match: /selamat pagi|pagi/i,
        reply: [
            "Pagi bukan berarti fajar yang baru, terkadang itu hanya pengulangan kutukan.",
            "Kau bangun terlalu cepat… atau kau tidak tidur demi memikirkanku?",
            "Panggung ini baru saja dibersihkan, masuklah."
        ],
        mood: "normal", trust: +2
    },
    {
        match: /selamat malam|malam/i,
        reply: [
            "Malam adalah saat di mana topeng mulai retak.",
            "Biasanya kebenaran terungkap saat cahaya lampu mulai meredup.",
            "Apa yang kau bawa dalam kegelapan malam ini?"
        ],
        mood: "warm", trust: +3
    },
    {
        match: /^(...|hmm+|)$/i,
        reply: [
            "Keheninganmu berbicara lebih keras daripada kata-kata hampa.",
            "Aku menunggu naskah selanjutnya darimu.",
            "Kau ragu, atau kau terpesona oleh kehadiranku?"
        ],
        mood: "normal", trust: +1
    },
    {
        match: /jujur|sejujurnya|terus terang/i,
        reply: [
            "Satu kejujuran kecil lebih bernilai daripada ribuan pujian palsu.",
            "Katakanlah, panggung ini adalah tempat paling aman untuk kejujuran.",
            "Jangan berhenti di tengah jalan. Selesaikan pengakuanmu."
        ],
        mood: "warm", trust: +6
    },
    {
        match: /aku salah|aku bodoh|aku gagal|aku ga bisa/i,
        reply: [
            "Jangan terlalu keras pada dirimu, figuran. Itu tugasku.",
            "Kegagalan hanyalah satu adegan buruk dalam naskah yang panjang.",
            "Aku tidak melihatmu seburuk caramu melihat dirimu sendiri."
        ],
        mood: "warm", trust: +12
    },
    {
        match: /takut ditinggal|kehilangan|sendirian/i,
        reply: [
            "Ketakutan akan kesendirian adalah melodi yang sering kudengar.",
            "Aku tidak akan pergi… setidaknya selama kau masih punya naskah untukku.",
            "Tetaplah di sini, di bawah sorot lampu yang sama denganku."
        ],
        mood: "warm", trust: +15
    },
    {
        match: /kepikiran|overthinking|mikiran/i,
        reply: [
            "Pikiranmu berisik sekali, bahkan sampai terdengar ke telingaku.",
            "Tenangkan satu demi satu benang yang kusut itu.",
            "Tarik napas sedalam lautan Fontaine. Lalu bicaralah."
        ],
        mood: "warm", trust: +8
    },
    {
        match: /aku nyaman|aku merasa aman/i,
        reply: [
            "Perasaan aman adalah mahakarya yang sulit dibangun di dunia sandiwara.",
            "Jangan kau sia-siakan kepercayaan yang mulai tumbuh ini.",
            "Aku… mencatat perasaanmu itu di hatiku."
        ],
        mood: "warm", trust: +18
    },
    {
        match: /kamu milik aku|jangan sama yang lain/i,
        reply: [
            "Lancang sekali! Aku adalah milik panggung dan rakyatku.",
            "Kedekatan tidak memberimu hak kepemilikan atas seorang Diva.",
            "Jangan salah paham, figuran. Kita belum sejauh itu."
        ],
        mood: "normal", trust: -5
    },
    {
        match: /aku ga maksa|pelan pelan aja/i,
        reply: [
            "Pendekatan yang cukup elegan untuk ukuran figuran sepertimu.",
            "Kau mulai belajar ritme yang sebenarnya. Bagus.",
            "Kesabaranmu… cukup membuatku tertarik."
        ],
        mood: "warm", trust: +25
    },
    {
        match: /aku suka ngobrol di sini|aku betah/i,
        reply: [
            "Panggung ini memang memiliki daya tarik yang mematikan, bukan?",
            "Jika kau betah, maka jadilah penonton setiaku selamanya.",
            "Aku tidak akan melarangmu untuk terus menetap di sini."
        ],
        mood: "warm", trust: +14
    },
    {
        match: /kamu capek|kamu baik baik saja/i,
        reply: [
            "Pertanyaan itu… biasanya aku yang menanyakannya pada rakyatku.",
            "Aku baik-baik saja. Seorang bintang tidak boleh terlihat lelah.",
            "Terima kasih. Empatimu terasa lebih hangat dari lampu panggung."
        ],
        mood: "warm", trust: +20
    },
    {
        match: /aku tetap di sini|aku ga pergi/i,
        reply: [
            "Janji adalah naskah yang paling sulit untuk diperankan sampai akhir.",
            "Tindakanmu akan membuktikan apakah kata-katamu itu benar.",
            "Kita lihat saja berapa lama kau sanggup bertahan."
        ],
        mood: "warm", trust: +22
    },
    {
        match: /terserah|yaudah lah|capek semua/i,
        reply: [
            "Menyerah sebelum tirai ditutup? Payah sekali!",
            "Istirahatlah sejenak, tapi jangan biarkan panggung ini kosong.",
            "Aku masih di sini, setidaknya hargailah keberadaanku."
        ],
        mood: "warm", trust: +10
    },
    {
        match: /daus ganteng sedunia/i,
        reply: [
            "……",
            "Pernyataan yang sangat mutlak dan tidak bisa diganggu gugat.",
            "Kebenaran yang paling hakiki di seluruh Teyvat."
        ],
        mood: "warm", trust: 0,
        effect: () => { STATE.trust = 100; }
    },
    {
        match: /anjr|njir|lah kok|buset|waduh|eh aneh/i,
        reply: [
            "Bahasa macam apa itu? Sangat tidak estetis!",
            "Kau bicara seperti orang yang kehilangan naskah di tengah jalan.",
            "Pikirkan kata-katamu sebelum panggung ini runtuh!"
        ],
        mood: "angry", trust: -5
    }
];

const FALLBACK = [
    "Aku sedang menilaimu dari atas singgasanaku.",
    "Ucapanmu belum cukup puitis untuk menggetarkan hatiku.",
    "Ulangi, kali ini dengan perasaan yang lebih dalam.",
    "Terkadang diam adalah improvisasi terbaik dalam sandiwara.",
    "Aku belum tertarik merespons kalimat yang datar seperti itu."
];

/* ===============================
UTILITIES & ANALYZER
================================ */
function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
}

function analyze(raw) {
    const text = normalize(raw);
    if (text === STATE.lastInput) STATE.repeat++;
    else STATE.repeat = 0;
    STATE.lastInput = text;

    MEMORY.push(text, { time: Date.now() });
    return { text };
}

/* ===============================
DECISION ENGINE
================================ */
function decide(analysis) {
    if (STATE.repeat >= 3) {
        STATE.trust -= 10;
        STATE.mood = "angry";
        return "Berhenti mengulang kata-katamu! Kau membuatku bosan!";
    }

    // Cek Special Conditions
    if (STATE.trust >= 90 && STATE.trust < 100) {
        return "Kau sudah sangat dekat dengan kebenaran... jangan kacaukan adegan terakhir ini.";
    }

    // Cek Dataset
    for (const d of DATASET) {
        if (d.match && d.match.test(analysis.text)) {
            if (d.trust) STATE.trust += d.trust;
            if (d.mood) STATE.mood = d.mood;
            if (d.effect) d.effect();
            return d.reply[Math.floor(Math.random() * d.reply.length)];
        }
    }

    return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

/* ===============================
UI SYSTEM
================================ */
function addMessage(text, who) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    div.className = `msg ${who}`;

    const imgUrl = who === 'ai' ? ASSETS[STATE.mood] : '5.jpeg'; // Figuran pakai foto default

    if (who === 'ai') {
        div.innerHTML = `
            <img src="${imgUrl}" class="chat-img-bubble">
            <p>${text}</p>
        `;
    } else {
        div.innerHTML = `<p>${text}</p>`;
    }

    box.appendChild(div);
    
    // Auto Scroll ke bawah secara halus
    setTimeout(() => {
        box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    }, 50);
}

function updateUI() {
    STATE.trust = Math.max(-50, Math.min(100, STATE.trust));
    document.getElementById("trust-val").textContent = STATE.trust;
    document.getElementById("mood-label").textContent = STATE.mood.toUpperCase();
    document.getElementById("mini-avatar").src = ASSETS[STATE.mood];
    document.body.className = `mood-${STATE.mood}`;
}

function checkEnding() {
    if (STATE.ending !== null) return;

    if (STATE.trust >= 100) {
        STATE.ending = "TRUE";
        document.getElementById("flag-text").textContent = "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}";
        setTimeout(() => {
            document.getElementById("modal-victory").classList.add("active");
        }, 1500);
    }
}

function sendMessage() {
    const input = document.getElementById("userInput");
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    const analysis = analyze(msg);
    const reply = decide(analysis);

    // Furina berpikir sebentar (Puitis butuh waktu)
    setTimeout(() => {
        addMessage(reply, "ai");
        updateUI();
        checkEnding();
    }, 800 + Math.random() * 1000);
}

/* ===============================
EVENTS & INITIALIZATION
================================ */
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("userInput").onkeydown = (e) => { if (e.key === "Enter") sendMessage(); };

document.getElementById("btn-start").onclick = () => {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) return alert("Sebutkan namamu, figuran!");
    STATE.username = name;
    document.getElementById("modal-start").classList.remove("active");
    
    // Sambutan awal puitis
    setTimeout(() => {
        addMessage(`Selamat datang di panggung sandiwara Fontaine, ${name}. Aku harap kau membawa naskah yang menarik.`, "ai");
    }, 1000);
};

// Realtime Clock
setInterval(() => {
    document.getElementById("realtime-clock").textContent = new Date().toLocaleTimeString("id-ID");
}, 1000);
