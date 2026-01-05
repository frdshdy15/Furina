"use strict";

/* ===============================
   GLOBAL STATE & ASSETS
   ================================ */
const STATE = {
    username: "Pengelana", // Default jika belum input nama
    trust: 20,
    mood: "normal",
    rank: "Figuran",
    ending: null,
    lastInput: "",
    lastTopic: null, // Memory topik terakhir
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
   HELPER: TEXT PROCESSOR (NLP LITE)
   ================================ */
// Fungsi untuk memecah kalimat dan mengambil inti topik
const TextProcessor = {
    extractSubject(text) {
        // Kata-kata sambung yang dibuang biar sisa intinya saja
        const stopWords = ["aku", "kamu", "dia", "mereka", "kita", "suka", "benci", "mau", "ingin", "adalah", "itu", "ini", "yang", "dan", "di", "ke", "dari"];
        const words = text.split(" ");
        // Ambil kata terpanjang yang bukan stopword (asumsi itu topik utamanya)
        const candidates = words.filter(w => !stopWords.includes(w) && w.length > 3);
        return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
    },

    isQuestion(text) {
        return text.includes("?") || /^(apa|siapa|kapan|kenapa|bagaimana|dimana)/i.test(text);
    }
};

/* ===============================
   ALGORITMA PUITIS (SENTENCE BUILDER)
   ================================ */
const poeticEnhancer = (text, type = "default") => {
    // Prefix: Pembuka kalimat
    const prefixes = [
        "Dengarlah, ", 
        "Hmph, asal kau tahu, ", 
        "Di panggung ini, ", 
        "Sebagai bintang utama, kukatakan padamu: ", 
        "Ah... ", 
        "Jujur saja, "
    ];
    
    // Suffix: Penutup kalimat (Biar lebih nendang)
    const suffixes = [
        " Bukankah itu dramatis?",
        " Jangan lupa tepuk tangannya.",
        " Camkan itu, figuran.",
        " Sungguh sebuah ironi, bukan?",
        " Hmph!"
    ];

    // Jangan tambah bumbu kalau text sudah panjang atau format khusus
    if (text.length > 80 || type === "raw") return text;

    let result = text;
    
    // 30% Chance nambah pembuka
    if (Math.random() > 0.7) {
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        result = pre + result.charAt(0).toLowerCase() + result.slice(1);
    }

    // 20% Chance nambah penutup
    if (Math.random() > 0.8) {
        const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
        result = result + suf;
    }

    return result;
};

/* ===============================
   ADVANCED ML ENGINE: THE SUPER BRAIN
   =============================== */
const BRAIN = {
    context: {
        aggressiveCount: 0,
        mentionDausCount: 0,
        isCrying: false,
        lastSubject: null, // Menyimpan kata benda terakhir user
        conversationDepth: 0 // Seberapa panjang obrolan nyambung
    },

    // 1. INTENT CLASSIFIER
    classifyIntent(text) {
        if (/(daus|pembuat|developer).*(orang mana|asal|siapa)/i.test(text)) {
            this.context.mentionDausCount++;
            return "CREATOR_ORIGIN";
        }
        if (/(kencan|jalan|pacaran|nikah|date)/i.test(text) && /(ayo|yuk|mau)/i.test(text)) return "PROPOSAL";
        if (/(sedih|nangis|kecewa|hancur|lelah)/i.test(text)) return "EMPATHY_NEEDED";
        if (/(cantik|manis|imut|hebat|luar biasa)/i.test(text)) return "FLATTERING";
        if (/(bodoh|tolol|goblok|jelek|anjing|bangsat)/i.test(text)) {
            this.context.aggressiveCount++;
            return "AGGRESSIVE_ATTACK";
        }
        return "GENERAL";
    },

    // 2. SENTIMENT ANALYSIS
    analyzeSentiment(text) {
        const positive = ["bagus", "keren", "hebat", "cinta", "suka", "senang", "makasih", "setuju"];
        const negative = ["jahat", "jelek", "benci", "muak", "bosan", "salah", "buruk", "gak", "ngga"];
        
        let score = 0;
        positive.forEach(w => { if (text.includes(w)) score += 1; });
        negative.forEach(w => { if (text.includes(w)) score -= 1; });
        return score;
    },

    // 3. LOGIC PROCESSING (MAIN BRAIN)
    process(rawText) {
        const text = rawText.toLowerCase().trim();
        const intent = this.classifyIntent(text);
        const sentiment = this.analyzeSentiment(text);
        const subject = TextProcessor.extractSubject(text); // Ambil topik (misal: "Bakso")

        // Update Trust
        if (sentiment > 0) STATE.trust += 2;
        if (sentiment < 0) STATE.trust -= 3;

        // --- DYNAMIC REACTION (ECHOING) ---
        // Jika user menyebutkan topik benda/hal spesifik, Furina bereaksi terhadap itu
        if (subject && Math.random() > 0.6 && intent === "GENERAL") {
            this.context.lastSubject = subject;
            return {
                reply: `Hmph, kau bicara soal "${subject}"? Topik yang... cukup unik untuk dibahas bersamaku.`,
                mood: "normal"
            };
        }

        // --- CONTEXTUAL MEMORY RESPONSE ---
        // Jika user cuma jawab pendek, Furina bahas topik sebelumnya
        if (text.length < 5 && this.context.lastSubject) {
            return {
                reply: `Kenapa singkat sekali? Kita masih membahas soal ${this.context.lastSubject}, kan? Lanjutkan!`,
                mood: "normal"
            };
        }

        // --- BRAIN LOGIC FLOW ---

        // 1. Toxic Handler
        if (this.context.aggressiveCount >= 2) {
            this.context.aggressiveCount = 0; 
            return {
                reply: "Jaga lisanmu! Panggungku bukan tempat sampah untuk kata-katamu!",
                mood: "angry", trust: -15
            };
        }

        // 2. Daus (Creator) Handler
        if (this.context.mentionDausCount > 2) {
            this.context.mentionDausCount = 0;
            return {
                reply: "Daus lagi, Daus lagi... Apakah dia lebih menarik dariku?!",
                mood: "angry", trust: -5
            };
        }

        // 3. Question Logic (Jika user bertanya tapi dataset ga nemu)
        if (TextProcessor.isQuestion(text) && !this.findInDataset(text)) {
            return {
                reply: "Pertanyaanmu sulit dijawab dengan singkat. Tapi intinya... di Fontaine, keadilan adalah segalanya!",
                mood: "normal"
            };
        }

        return null; // Lanjut ke Dataset Matcher
    },

    // Helper untuk cek dataset (biar logic process di atas bisa ngecek dulu)
    findInDataset(text) {
        return DATASET.some(d => d.match.test(text));
    }
};

/* ===============================
   DATASET (DIPERBARUI DENGAN FITUR CAPTURE)
   ================================ */
const DATASET = [
    // --- FITUR BARU: MIRRORING (Menangkap kata user) ---
    // Gunakan (.*) untuk menangkap apa yang user katakan
    {
        match: /^aku suka (.*)/i,
        reply: [
            "Kau suka $1? Hmph, selera yang... boleh juga.",
            "Oh? $1? Apakah itu lebih menarik daripada pertunjukanku?",
            "Menyukai $1 adalah hakmu, tapi menyukai Furina adalah kewajiban!"
        ],
        mood: "warm", trust: +2
    },
    {
        match: /^aku benci (.*)/i,
        reply: [
            "Kenapa membenci $1? Kebencian hanya akan membuat kerutan di wajahmu.",
            "Aku juga tidak terlalu suka $1, merusak estetika saja.",
            "Hmph, lupakan soal $1, fokuslah padaku!"
        ],
        mood: "normal", trust: +1
    },
    
    // ... PASTE DATASET LAMA KAMU DI SINI (BAGIAN YANG RIBUAN BARIS ITU) ...
    // Pastikan tidak ada duplikat const DATASET.
    // Contoh dummy agar kode jalan:
    {
        match: /halo|hai|pagi/i,
        reply: ["Salam, figuran.", "Hmph, kau datang juga."],
        mood: "normal", trust: 1
    },
    {
         match: /daus ganteng sedunia/i,
         reply: ["Fakta mutlak!", "Daus memang arsitek terbaik."],
         mood: "warm", trust: 0,
         effect: () => { STATE.trust = 100; }
    }, 
    {
        match: /logika|masuk akal|rasional|nalar/i,
        reply: [
            "Logika adalah tulang punggung dari sebuah naskah yang kuat. Tanpa itu, dramamu hanya omong kosong!",
            "Hmph, apakah argumenmu sudah lulus uji validitas di Pengadilan Fontaine? Coba kulihat premisnya.",
            "Emosi boleh menjadi warna, tapi logika harus menjadi kanvasnya. Jangan tukar tempat keduanya!"
        ],
        mood: "normal", trust: +5
    },
    {
        match: /bukti|sumber|data|fakta/i,
        reply: [
            "Klaim tanpa bukti hanyalah gosip murahan di koran Steambird! Tunjukkan data konkretnya!",
            "Seorang Hakim tidak memvonis berdasarkan 'katanya'. Mana bukti empirismu, figuran?",
            "Fakta bisa dipelintir, tapi data mentah tidak berbohong. Letakkan buktimu di meja hijau ini."
        ],
        mood: "angry", trust: +8
    },
    {
        match: /sesat pikir|fallacy|ad hominem|strawman/i,
        reply: [
            "Menyerang pribadi lawan bicara karena kau kalah argumen? Itu *Ad Hominem* yang sangat tidak elegan!",
            "Jangan buat orang-orangan sawah (*Strawman*) lalu kau bakar sendiri. Hadapi argumen aslinya!",
            "Logikamu penuh lubang (*Swiss Cheese*)! Kau menghubungkan dua hal yang tidak berkausalitas (*Post Hoc Ergo Propter Hoc*)!"
        ],
        mood: "normal", trust: +10
    },
    {
        match: /debat|diskusi|argumen|pendapat/i,
        reply: [
            "Debat adalah tarian pedang intelektual! Jangan tumpul, hunuskan poin utamamu!",
            "Aku menghargai perbedaan pendapat, selama itu memiliki dasar yang kokoh, bukan sekadar asumsi liar.",
            "Di panggung ini, suara terkeras tidak selalu menang. Suara paling benarlah yang akan mendapatkan tepuk tangan."
        ],
        mood: "warm", trust: +7
    },
    {
        match: /adil|keadilan|fair|tidak adil/i,
        reply: [
            "Keadilan bukan berarti semua orang mendapat hal yang sama, tapi semua orang mendapat apa yang pantas untuk peran mereka.",
            "Apa itu adil? Apakah mengorbankan satu orang demi menyelamatkan satu kota itu adil? Jawab aku!",
            "Keadilan manusia seringkali bias. Keadilan sejati hanya ada dalam naskah hukum yang murni."
        ],
        mood: "normal", trust: +12
    },
    {
        match: /moral|etika|baik|jahat/i,
        reply: [
            "Baik dan jahat seringkali hanya soal siapa yang memegang pena penulis naskah sejarah.",
            "Apakah kau berbuat baik karena itu benar, atau karena kau takut dihukum? Motivasi itu penting di mataku.",
            "Moralitas adalah kompas di tengah lautan ketidakpastian. Jangan sampai jarumnya patah."
        ],
        mood: "sad", trust: +15
    },
    {
        match: /tujuan menghalalkan cara|pragmatis|hasil akhir/i,
        reply: [
            "Machiavellian sekali... Tapi ingat, jika panggungnya penuh darah, siapa yang mau menonton hasil akhirnya?",
            "Tujuan mulia tidak bisa membersihkan tangan yang kotor. Noda itu akan tetap ada di balik sarung tanganmu.",
            "Hmph, kadang kita memang harus kotor demi kebersihan yang lebih besar. Itu adalah beban seorang pemimpin."
        ],
        mood: "sad", trust: +10
    },
    {
        match: /bias|subjektif|sudut pandang/i,
        reply: [
            "Kau hanya melihat apa yang ingin kau lihat (*Confirmation Bias*). Buka matamu lebih lebar!",
            "Setiap aktor punya bias terhadap perannya sendiri. Sadarilah itu sebelum kau menilai orang lain.",
            "Objektivitas murni itu ilusi. Kita semua memandang dunia lewat lensa berwarna kita masing-masing."
        ],
        mood: "normal", trust: +8
    },
    {
        match: /ikut-ikutan|fomo|orang lain juga begitu/i,
        reply: [
            "Hanya karena semua orang melompat ke jurang, apakah kau akan ikut? Itu *Bandwagon Fallacy*!",
            "Jadilah bintang utama yang menentukan tren, bukan figuran yang hanya mengekor kerumunan!",
            "Mayoritas tidak selalu benar. Sejarah membuktikan massa seringkali salah arah."
        ],
        mood: "angry", trust: +5
    },
    {
        match: /zona nyaman|takut berubah|gagal/i,
        reply: [
            "Pertumbuhan hanya terjadi saat kau berani keluar dari naskah yang sudah kau hafal (*Comfort Zone*).",
            "Takut gagal? Kegagalan adalah latihan gladi resik untuk kesuksesan yang sesungguhnya!",
            "Sakitnya perubahan jauh lebih baik daripada rasa sakit karena penyesalan di masa tua."
        ],
        mood: "warm", trust: +15
    },
    {
        match: /kenapa begitu|sebab akibat|korelasi/i,
        reply: [
            "Pertanyaan bagus! Jangan pernah berhenti bertanya 'kenapa' sampai kau menemukan akar masalahnya (*First Principles*).",
            "Hati-hati, korelasi tidak selalu berarti sebab-akibat. Hanya karena hujan turun saat aku menangis, bukan berarti aku yang memanggil hujan!",
            "Dunia ini penuh dengan pola. Tugasmu adalah membedakan mana pola nyata dan mana kebetulan semata."
        ],
        mood: "normal", trust: +10
    },
    {
        match: /konspirasi|rahasia elit|berita burung/i,
        reply: [
            "Klaim luar biasa membutuhkan bukti yang luar biasa (*Carl Sagan's Standard*). Mana buktimu?",
            "Jangan biarkan imajinasimu mengalahkan logikamu. Pisau Ockham (*Occam's Razor*) mengatakan penjelasan termudah biasanya yang benar.",
            "Hmph, menarik sebagai fiksi, tapi cacat sebagai fakta."
        ],
        mood: "normal", trust: +5
    },
    {
        match: /solusi|jalan keluar|cara mengatasi/i,
        reply: [
            "Jangan fokus pada masalahnya, fokuslah pada solusinya! Pecah masalah besar menjadi adegan-adegan kecil.",
            "Jika Rencana A gagal, masih ada 25 huruf lain di alfabet! Improvisasi adalah kunci!",
            "Coba lihat masalah ini dari sudut pandang penonton (helikopter view), bukan dari sudut pandang korban."
        ],
        mood: "warm", trust: +12
    },
    {
        match: /prioritas|mana duluan|bingung pilih/i,
        reply: [
            "Gunakan Matriks Eisenhower! Mana yang mendesak, mana yang penting? Jangan kerjakan hal yang tidak penting hanya karena mudah!",
            "Seorang Diva tahu kapan harus tampil dan kapan harus istirahat. Atur energimu untuk hal yang paling berdampak.",
            "Pilih satu hal yang jika kau selesaikan, masalah lain akan ikut selesai (*The One Thing*)."
        ],
        mood: "normal", trust: +10
    }

];

// --- FALLBACK RESPONSES (JIKA OTAK BUNTU) ---
// Dibuat lebih kritis biar ga kelihatan bodoh
const FALLBACKS = {
    short: [
        "Hanya itu? Naskahmu habis?",
        "Bicaralah yang lebih panjang, aku butuh drama!",
        "Singkat sekali... membosankan."
    ],
    question: [
        "Hmm, pertanyaan bagus. Menurutmu bagaimana?",
        "Aku perlu menanyakan itu pada Oratrice dulu.",
        "Rahasia. Seorang Diva harus misterius."
    ],
    general: [
        "Aku sedang menilaimu dari atas singgasanaku.",
        "Lanjutkan, aku mendengarkan (sedikit).",
        "Topik ini mulai membosankan, ganti naskah!",
        "Apakah kau tidak punya cerita yang lebih seru?",
        "Hmph... begitu ya."
    ]
};

/* ===============================
   CORE ENGINE
   ================================ */

const MEMORY_LOG = []; 

function analyze(raw) {
    const text = raw.toLowerCase().trim();

    // Anti Spam Sederhana
    if (text === STATE.lastInput) {
        STATE.repeat++;
    } else {
        STATE.repeat = 0;
    }
    STATE.lastInput = text;
    MEMORY_LOG.push(text);

    return text;
}

function decide(analysis, rawOriginal) {
    // 1. Proteksi Spam
    if (STATE.repeat >= 3) {
        STATE.trust -= 5;
        STATE.mood = "angry";
        return "Berhenti membeo! Kau pikir ini lucu?!";
    }

    // 2. Cek BRAIN Process (Logic dinamis)
    const brainResult = BRAIN.process(analysis);
    if (brainResult) {
        STATE.mood = brainResult.mood;
        if(brainResult.trust) STATE.trust += brainResult.trust;
        return poeticEnhancer(brainResult.reply);
    }

    // 3. Cek DATASET (Regex Matcher)
    for (const d of DATASET) {
        const match = analysis.match(d.match); // Pakai match biar bisa capture groups
        if (match) {
            if (d.trust) STATE.trust += d.trust;
            if (d.mood) STATE.mood = d.mood;
            if (d.effect) d.effect();

            // Pilih jawaban random
            let rawReply = d.reply[Math.floor(Math.random() * d.reply.length)];

            // FEATURE: Replace placeholder $1 dengan tangkapan regex (Mirroring)
            if (match[1]) {
                rawReply = rawReply.replace("$1", match[1]);
            }
            
            // FEATURE: Replace {name} dengan username user
            rawReply = rawReply.replace("{name}", STATE.username);

            return poeticEnhancer(rawReply);
        }
    }

    // 4. Critical Fallback (Jika tidak ada di dataset)
    // Cek apakah user nanya atau cuma ngomong pendek
    if (analysis.length < 5) {
        return FALLBACKS.short[Math.floor(Math.random() * FALLBACKS.short.length)];
    } else if (TextProcessor.isQuestion(analysis)) {
        return FALLBACKS.question[Math.floor(Math.random() * FALLBACKS.question.length)];
    } else {
        // Echo kata user biar kelihatan nyambung
        const subject = TextProcessor.extractSubject(analysis);
        if(subject) {
             return `Menarik... kau membahas soal ${subject}. Ceritakan lebih banyak!`;
        }
        return poeticEnhancer(FALLBACKS.general[Math.floor(Math.random() * FALLBACKS.general.length)]);
    }
}

/* ===============================
   INACTIVITY SYSTEM
   =============================== */
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (STATE.ending) return;

    inactivityTimer = setTimeout(() => {
        const boredom = [
            `Hei ${STATE.username}, kau tidur?`,
            "Panggung sepi... aku benci kesepian.",
            "Tepuk tangan penonton sudah berhenti, mana suaramu?",
            "Jangan biarkan aku menunggu seperti orang bodoh di sini."
        ];
        addMessage(boredom[Math.floor(Math.random() * boredom.length)], "ai");
        STATE.trust -= 1; 
        updateUI();
    }, 15000); // 15 Detik
}

/* ===============================
   UI SYSTEM & EVENTS
   ================================ */
function addMessage(text, who) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");
    const extraClass = (who === 'ai' && STATE.mood === 'angry') ? 'dizzy-chat' : '';
    
    div.className = `msg ${who} ${extraClass}`;

    if (who === 'ai') {
        div.innerHTML = `
            <img src="${ASSETS[STATE.mood]}" class="chat-img-bubble">
            <p>${text}</p>
        `;
    } else {
        div.innerHTML = `<p>${text}</p>`;
    }

    box.appendChild(div);
    box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    resetInactivityTimer();
}

function updateUI() {
    STATE.trust = Math.max(-50, Math.min(100, STATE.trust));

    if(STATE.trust < 0) STATE.rank = "Terdakwa";
    else if(STATE.trust < 40) STATE.rank = "Figuran";
    else if(STATE.trust < 80) STATE.rank = "Aktor Utama";
    else STATE.rank = "Sutradara Kesayangan";

    // Update elemen HTML (pastikan ID di HTML sama)
    const trustEl = document.getElementById("trust-val");
    if(trustEl) trustEl.textContent = STATE.trust;

    const moodEl = document.getElementById("mood-label");
    if(moodEl) moodEl.textContent = `${STATE.mood.toUpperCase()} | ${STATE.rank}`;

    const imgEl = document.getElementById("mini-avatar");
    if(imgEl) imgEl.src = ASSETS[STATE.mood];
    
    document.body.className = `mood-${STATE.mood}`;
    
    // Shake effect jika marah
    if (STATE.mood === "angry") {
        document.body.classList.add("shake-effect");
    } else {
        document.body.classList.remove("shake-effect");
    }
}

function checkEnding() {
    if (STATE.ending) return;
    if (STATE.trust >= 100) {
        STATE.ending = "VICTORY";
        // Trigger modal victory kamu disini
        setTimeout(() => alert("ENDING: VICTORY! (Ganti ini dengan Modal Victory-mu)"), 1000);
    } 
    else if (STATE.trust <= -50) {
        STATE.ending = "GAMEOVER";
        // Trigger modal gameover kamu disini
        setTimeout(() => alert("ENDING: GAMEOVER! (Ganti ini dengan Modal Gameover-mu)"), 1000);
    }
}

function sendMessage() {
    if (STATE.ending) return;

    const input = document.getElementById("userInput");
    const msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    input.value = "";

    const analysis = analyze(msg);
    // Masukkan msg original juga untuk keperluan display
    const reply = decide(analysis, msg);

    setTimeout(() => {
        addMessage(reply, "ai");
        updateUI();
        checkEnding();
    }, 800 + Math.random() * 800); // Delay biar kerasa "mikir"
}

// --- EVENT LISTENERS ---
document.getElementById("btn-start")?.addEventListener("click", () => {
    const nameInput = document.getElementById("usernameInput");
    STATE.username = nameInput.value.trim() || "Pengelana";
    document.getElementById("modal-start").classList.remove("active");
    setTimeout(() => addMessage(`Selamat datang, ${STATE.username}. Tunjukkan padaku naskah terbaikmu.`, "ai"), 500);
});

document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
document.getElementById("userInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Init
updateUI();
