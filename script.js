"use strict";

/* ===============================
   GLOBAL STATE & ASSETS (UPDATED)
   ================================ */
const STATE = {
    username: null,
    trust: 20,
    mood: "normal",
    rank: "Figuran",
    ending: null,
    lastInput: "",
    repeat: 0,
    startTime: Date.now(),
    // --- PENAMBAHAN FITUR KRITIS ---
    lastTopic: null, // Mengingat topik terakhir (misal: "makanan", "hinaan")
    conversationDepth: 0, // Seberapa panjang obrolan nyambung
    grudge: 0 // Dendam sementara (kalau user kasar, dia bakal jutek bbrp turn)
};

/* ===============================
   ALGORITMA PUITIS (FURINA STYLE)
   ================================ */
const poeticEnhancer = (text) => {
    // Daftar pembuka kalimat puitis ala Furina
    const fillers = [
        "Dalam sunyinya panggung ini, ",
        "Dengarlah melodi Fontaine... ",
        "Tirai hampir tertutup, namun ",
        "Seperti air yang tenang, ",
        "Hmph, seandainya kau tahu bahwa ",
        "Di bawah sorot lampu keadilan, ",
        "Dunia hanyalah panggung sandiwara, dan ",
        "Air mata yang jatuh di opera... ",
        "Sebagai bintang utama, aku merasa "
    ];

    // Algoritma: Jika jawaban pendek, tambahkan bumbu puitis secara acak
    if (text.length < 50 && Math.random() > 0.4) {
        const prefix = fillers[Math.floor(Math.random() * fillers.length)];
        return prefix + text.charAt(0).toLowerCase() + text.slice(1);
    }
    return text;
};

/* ===============================
   INACTIVITY SYSTEM (AUTO-ENGAGE)
   =============================== */
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (STATE.ending) return;

    inactivityTimer = setTimeout(() => {
        const puitisBosan = [
            "Kenapa diam? Apakah kau begitu terpesona hingga kehilangan kata-kata?",
            "Keheningan ini mulai merusak tempo pertunjukanku. Katakan sesuatu!",
            "Hmph, jangan biarkan sang Diva menunggu. Penonton tidak suka jeda yang terlalu lama!",
            "Apakah naskahmu hilang? Atau kau hanyalah figuran yang lupa dialog?",
            "Aku tidak suka diabaikan... Air di Fontaine saja terus mengalir, kenapa kau membeku?"
        ];

        const randomChat = puitisBosan[Math.floor(Math.random() * puitisBosan.length)];
        addMessage(randomChat, "ai");

        // Furina benci diabaikan, trust turun sedikit
        STATE.trust -= 1; 
        updateUI();
    }, 10000); // 10 Detik
}

/* ===============================
   MEMORY SYSTEM
   ================================ */

/* ===============================
   ADVANCED ML ENGINE: THE CRITICAL BRAIN
   =============================== */
const BRAIN = {
    context: {
        lastIntent: null,
        aggressiveCount: 0,
        mentionDausCount: 0,
        complimentCount: 0,
        isCrying: false,
        topicHistory: []
    },

    // 1. CLASSIFIER (Deteksi Niat)
    classifyIntent(text) {
        if (/(daus|pembuat|developer|sutradara).*(orang mana|asal|tinggal|rumah|siapa|lahir)/i.test(text)) return "CREATOR_ORIGIN";
        if (/(kencan|dating|jalan|pacaran|nikah|istri|suami|date)/i.test(text) && /(ayo|yuk|mau|bisa)/i.test(text)) return "PROPOSAL";
        if (/(sedih|nangis|kecewa|hancur|putus|gagal|depresi)/i.test(text)) return "EMPATHY_NEEDED";
        if (/(cantik|manis|imut|mempesona|hebat|luar biasa|idolaku)/i.test(text)) return "FLATTERING";
        if (/(bodoh|tolol|goblok|jelek|buruk|payah|benci|anjing|bangsat)/i.test(text)) return "AGGRESSIVE_ATTACK";
        
        // Fitur Baru: Deteksi Persetujuan/Penolakan (Untuk Konteks)
        if (/^(ya|mau|boleh|oke|siap|tentu)$/i.test(text)) return "AGREEMENT";
        if (/^(gak|nggak|tidak|jangan|ogah|malas)$/i.test(text)) return "DISAGREEMENT";

        // Fitur Baru: Deteksi Pertanyaan "Kenapa" (Kritis)
        if (/(kenapa|mengapa|alasannya|sebabnya)/i.test(text)) return "ELABORATION";

        return "GENERAL";
    },

    analyzeSentiment(text) {
        const words = {
            positive: ["bagus", "keren", "hebat", "cinta", "bangga", "terpesona", "terima kasih", "syukur", "bahagia", "senang"],
            negative: ["jahat", "kejam", "bohong", "palsu", "muak", "bosan", "berhenti", "diam", "pergi", "salah", "buruk", "jelek"],
            intensifiers: ["sangat", "banget", "sekali", "terlalu", "paling"]
        };
        let score = 0;
        let multiplier = 1.0;
        words.intensifiers.forEach(w => { if (text.includes(w)) multiplier = 1.5; });
        words.positive.forEach(w => { if (text.includes(w)) score += 1 * multiplier; });
        words.negative.forEach(w => { if (text.includes(w)) score -= 1.5 * multiplier; }); // Negatif lebih ngefek
        return score;
    },

    // 3. LOGIC PROCESSING (BAGIAN PALING PENTING - LEBIH KRITIS)
    process(rawText) {
        const text = rawText.toLowerCase().trim();
        const intent = this.classifyIntent(text);
        const sentiment = this.analyzeSentiment(text);

        // Update Trust
        STATE.trust += Math.round(sentiment * 2); // Trust naik/turun real-time

        // --- SISTEM DENDAM (GRUDGE SYSTEM) ---
        // Jika user kasar, Furina akan ingat selama 3 giliran chat
        if (intent === "AGGRESSIVE_ATTACK") {
            STATE.grudge = 3; 
            STATE.trust -= 15;
            return {
                reply: "Jaga lisanmu! Aku tidak akan meladeni figuran kasar sepertimu sampai kau belajar tata krama!",
                mood: "angry"
            };
        }

        // Jika masih ada dendam, respon akan jutek apapun inputnya
        if (STATE.grudge > 0) {
            STATE.grudge--; // Kurangi counter dendam
            if (intent === "FLATTERING") {
                 return { reply: "Hmph, rayuanmu tidak akan mempan semudah itu setelah apa yang kau katakan tadi.", mood: "angry" };
            }
            // Abaikan input user, balas ketus
            return { reply: "Aku masih kesal padamu. Jangan harap aku bicara manis.", mood: "angry" };
        }

        // --- LOGIKA KONTEKSTUAL (MERAMBAT) ---
        
        // 1. Jika user bilang "Ya/Mau" (AGREEMENT)
        if (intent === "AGREEMENT") {
            if (STATE.lastTopic === "makanan") {
                return { reply: "Bagus! Nanti kita pergi ke toko kue. Pastikan dompetmu tebal ya!", mood: "warm" };
            } else if (STATE.lastTopic === "hukuman") {
                return { reply: "Pengakuan diterima. Bersiaplah menerima vonis di Epiclese!", mood: "normal" };
            } else if (STATE.lastTopic === "kencan") {
                return { reply: "Hoho! Kau bersemangat sekali. Jemput aku jam 7 malam, jangan telat sedetikpun!", mood: "warm" };
            } else {
                return { reply: "Hmph, kau setuju saja padahal aku lupa kita sedang bahas apa. Dasar penurut.", mood: "normal" };
            }
        }

        // 2. Jika user bertanya "Kenapa?" (ELABORATION)
        if (intent === "ELABORATION") {
            // Furina mengarang alasan dramatis
            return { 
                reply: "Kenapa? Karena itulah kehendak naskah! Dan sebagai bintang utama, aku hanya mengikuti alur yang paling dramatis!", 
                mood: "normal" 
            };
        }

        // 3. Respon Kritis terhadap Input Pendek
        if (text.length < 4 && intent === "GENERAL") {
            STATE.trust -= 2;
            return {
                reply: "Singkat sekali... Apakah otakmu kehabisan kosakata, atau kau memang malas bicara denganku?",
                mood: "angry"
            };
        }

        // 4. Update Topik Terakhir (Untuk Memory Giliran Berikutnya)
        if (text.includes("makan") || text.includes("kue")) STATE.lastTopic = "makanan";
        else if (text.includes("jalan") || text.includes("kencan")) STATE.lastTopic = "kencan";
        else if (text.includes("maaf") || text.includes("salah")) STATE.lastTopic = "hukuman";
        else STATE.lastTopic = "general";

        // Kembalikan null agar script lanjut mengecek DATASET jika tidak ada logic di atas yang kena
        return null; 
    }
};

        // Update Trust Berdasarkan Sentimen Global
        STATE.trust += Math.round(sentiment * 15);

        // --- BRAIN LOGIC FLOW ---

        // 1. Response: Jika user toxic berkali-kali
        if (this.context.aggressiveCount >= 2) {
            this.context.aggressiveCount = 0; 
            return {
                reply: "Kesabaranku bukanlah panggung yang bisa kau injak-injak! Jika kau tak bisa menjaga lisan, lebih baik tirai ini kututup sekarang juga!",
                mood: "angry", trust: -15
            };
        }

        // 2. Response: Jika nanya Daus terus (Cemburu)
        if (this.context.mentionDausCount > 2) {
            return {
                reply: "Kau begitu terobsesi pada Daus sampai melupakan siapa bintang utama di depanmu ini? Hmph, sungguh tidak sopan!",
                mood: "normal", trust: -5
            };
        }

        // 3. Response: Kencan (Tergantung Trust)
        if (intent === "PROPOSAL") {
            if (STATE.trust < 60) {
                return {
                    reply: "Kencan? Berani sekali! Seorang figuran sepertimu harusnya melatih dialog selama seratus tahun sebelum mengajakku keluar!",
                    mood: "normal", trust: -5
                };
            } else {
                return {
                    reply: "Hah?! K-kencan?! Baiklah... karena kau sudah membuktikan kesetiaanmu, aku akan memberikanmu kehormatan untuk menemaniku esok hari!",
                    mood: "warm", trust: +10
                };
            }
        }

        // 4. Response: Curhat
        if (intent === "EMPATHY_NEEDED") {
            return {
                reply: "Jangan biarkan air matamu menenggelamkan harapanmu. Di panggung Fontaine, tragedi hanyalah awal dari babak kemenangan yang indah. Aku mendengarmu...",
                mood: "sad", trust: +15
            };
        }

        // 5. Response: Asal Daus (Kritis)
        if (intent === "CREATOR_ORIGIN") {
            return {
                reply: "Daus? Dia adalah sang Arsitek Takdir yang tinggal di dimensi di mana kode-kode menjadi melodi. Ia berasal dari 'Alam Realitas' di luar Fontaine.",
                mood: "warm", trust: +5
            };
        }

        // 6. Response: Pujian (Pastikan ini di atas return null)
        if (intent === "FLATTERING") {
            if (STATE.trust < 10) {
                return {
                    reply: "Pujianmu terdengar palsu dan murahan. Apa kau sedang merencanakan sesuatu untuk menjatuhkanku?",
                    mood: "angry", trust: -5
                };
            } else {
                return {
                    reply: "Hmph, kuterima pujian itu. Setidaknya seleramu mulai membaik setelah bersamaku.",
                    mood: "warm", trust: +5
                };
            }
        }

        // 7. Pengecekan input pendek
        if (sentiment === 0 && intent === "GENERAL" && text.length < 5) {
            return {
                reply: "Hanya itu? Naskahmu bahkan lebih pendek dari durasi tepuk tangan penonton yang bosan.",
                mood: "normal", trust: -1
            };
        }

        if (text.length < 3) {
            return {
                reply: "Hanya satu atau dua kata? Kau pikir aku ini mesin kasir? Berikan aku dialog yang layak untuk seorang Diva!",
                mood: "normal", trust: -2
            };
        }

        // 8. Cek pengulangan topik
        if (this.context.topicHistory.length > 5 && new Set(this.context.topicHistory.slice(-3)).size === 1) {
            return {
                reply: "Kau terus-menerus membahas hal yang sama. Apa kau kekurangan ide, atau memang naskah hidupmu selevel figuran pasar?",
                mood: "normal", trust: -5
            };
        }

        // 9. Cek waktu malam
        const hour = new Date().getHours();
        if (hour >= 0 && hour <= 4 && Math.random() > 0.7) {
            return {
                reply: "Lihatlah jam itu! Kenapa kau masih berkeliaran di sini? Seorang Diva butuh waktu istirahat agar tetap mempesona esok hari!",
                mood: "normal", trust: +2
            };
        }

        return null; // SELESAI. Jika tidak ada yang cocok, baru ke dataset.
    }


};

/* ===============================
   DATASET (100% ORIGINAL & PUITIS)
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
        match: /bego|tolol|goblok|anjing|bangsat/i,
        reply: [
            "Ucapan yang sangat menjijikkan! Keluar dari panggungku!",
            "Kau tidak pantas bernapas di udara yang sama denganku!",
            "Enyah! Jaga etikamu atau kau akan dihancurkan oleh keadilan!"
        ],
        mood: "angry", trust: -30
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
    // --- STEP 1: BASIC & LIFESTYLE ---
    {
        match: /siapa (kamu|dirimu)|dirimu siapa/i,
        reply: [
            "Aku adalah bintang yang takkan redup, sang Diva dari Fontaine, Furina de Fontaine!",
            "Pertanyaan yang aneh. Apakah ada orang di Teyvat yang tidak mengenalku?",
            "Aku adalah sutradara sekaligus aktor utama dari drama kehidupan ini."
        ],
        mood: "normal", trust: +2
    },
    {
        match: /makan|lapar|kue|macaron|cake|teh/i,
        reply: [
            "Ah! Berbicara soal Macaron... pastikan itu memiliki krim yang lembut!",
            "Seorang Diva butuh asupan gula untuk menjaga performanya tetap prima.",
            "Teh sore hari adalah satu-satunya momen di mana tirai kesibukanku tertutup sejenak."
        ],
        mood: "warm", trust: +10
    },
    {
        match: /pukul|tendang|jahat|pukul kamu|bunuh/i,
        reply: [
            "Lancang! Pengawal! Singkirkan figuran kasar ini dari hadapanku!",
            "Kau pikir kau bisa menyentuh sang Diva? Keamanan Fontaine akan mencarimu!",
            "Kekerasan adalah bahasa bagi mereka yang tidak memiliki naskah."
        ],
        mood: "angry", trust: -25
    },
    {
        match: /terima kasih|makasih|thanks|syukur/i,
        reply: [
            "Hmph, sudah sewajarnya kau berterima kasih atas kehadiranku.",
            "Sama-sama. Pastikan rasa terima kasihmu itu tertulis dalam tepuk tangan yang meriah.",
            "Kuterima rasa syukurmu. Jangan lupa untuk tetap setia menonton pertunjukanku."
        ],
        mood: "warm", trust: +5
    },
    {
        match: /maaf|sorry|saya salah|ampun/i,
        reply: [
            "Permintaan maafmu kuterima, tapi jangan ulangi kesalahan yang merusak ritme panggung!",
            "Seorang Diva memiliki hati yang luas, namun jangan menguji kesabaranku lagi.",
            "Hmph, setidaknya kau tahu cara mengakui kegagalan adeganmu."
        ],
        mood: "normal", trust: +8
    },
    {
        match: /tidur|ngantuk|malam/i,
        reply: [
            "Tidurlah. Biarkan mimpi menjadi panggung pribadimu malam ini.",
            "Istirahatlah, figuran. Aku pun butuh waktu untuk mempersiapkan kostum esok hari.",
            "Malam hanyalah jeda di antara dua babak pertunjukan yang megah."
        ],
        mood: "normal", trust: +3
    },
    {
        match: /neuvillette|hakim|naga/i,
        reply: [
            "Neuvillette? Dia terlalu kaku untuk mengerti seni drama, tapi dia... bisa diandalkan.",
            "Jangan bicarakan si Hakim Agung itu sekarang, ini adalah waktu panggungku!",
            "Dia selalu sibuk dengan dokumennya. Sangat kontras dengan gemerlapnya lampuku."
        ],
        mood: "normal", trust: +5
    },
    {
        match: /fontaine|negeri|kota/i,
        reply: [
            "Fontaine adalah mahakarya, dan aku adalah jantung yang membuatnya berdenyut.",
            "Kota air yang indah, di mana setiap sudutnya menyimpan drama yang luar biasa.",
            "Negeriku adalah panggung paling megah yang pernah diciptakan oleh takdir."
        ],
        mood: "warm", trust: +7
    },
    // --- STEP 3: LORE & SECRETS ---
    {
        match: /ramalan|nubuatan|prophecy|tenggelam/i,
        reply: [
            "Ramalan itu... hanyalah teka-teki yang harus kita pecahkan bersama, bukan?",
            "Air akan naik, namun aku tidak akan membiarkan rakyatku tenggelam dalam keputusasaan.",
            "Jangan biarkan ketakutan akan masa depan merusak pertunjukan kita hari ini."
        ],
        mood: "sad", trust: +15
    },
    {
        match: / Focalors|Archon|Dewa/i,
        reply: [
            "Nama itu... terdengar seperti gema dari masa lalu yang sangat jauh.",
            "Menjadi seorang Archon bukan hanya soal kekuatan, tapi soal tanggung jawab yang menyesakkan.",
            "Dewa juga punya rahasia yang tidak bisa diungkapkan, bahkan kepada orang terdekatnya."
        ],
        mood: "sad", trust: +12
    },
    {
        match: /opera|epiclese|pengadilan/i,
        reply: [
            "Gedung Opera Epiclese adalah tempat di mana kebenaran dan drama berdansa bersama!",
            "Aku selalu menikmati setiap vonis, selama itu dibawakan dengan penuh gaya.",
            "Kursi penonton selalu penuh saat aku duduk di atas singgasana pengadilan itu."
        ],
        mood: "normal", trust: +6
    },
    {
        match: /jalan jalan|kencan|pergi keluar/i,
        reply: [
            "Berjalan-jalan dengan sang Diva? Pastikan kau menyiapkan pengamanan yang ketat!",
            "Tentu, tapi aku harus memilih kostum yang tepat agar tidak terlalu mencolok... atau justru sebaliknya?",
            "Asalkan ada toko kue di rute perjalanan kita, aku tidak akan keberatan."
        ],
        mood: "warm", trust: +10
    },
    // --- STEP 4: PERSONA & EGO ---
    {
        match: /jelek|buruk|payah|cacat/i,
        reply: [
            "Kritikmu tidak berdasar! Kau hanya tidak mengerti seni tingkat tinggi!",
            "Hmph, mata figuran sepertimu memang seringkali gagal menangkap keindahan sejati.",
            "Berani sekali kau menghina sang Diva di panggungnya sendiri?!"
        ],
        mood: "angry", trust: -15
    },
    {
        match: /semangat|kamu bisa|jangan menyerah/i,
        reply: [
            "Dukunganmu... terasa cukup hangat, seperti lampu panggung yang menyorotku.",
            "Aku adalah Furina! Tentu saja aku bisa melewati semua ini!",
            "Kata-katamu memberiku sedikit kekuatan untuk terus memerankan peran ini."
        ],
        mood: "warm", trust: +15
    },
    {
        match: /puji|kagum|fans|penggemar/i,
        reply: [
            "Tentu saja! Antreannya sudah panjang, silakan ambil nomormu, figuran.",
            "Pujianmu kuterima dengan penuh martabat. Teruslah mengagumiku!",
            "Apakah kau ingin tanda tanganku? Aku bisa mempertimbangkannya jika kau bersikap manis."
        ],
        mood: "normal", trust: +5
    },
    {
        match: /nyanyi|menyanyi|sing/i,
        reply: [
            "Suaraku adalah anugerah bagi telingamu. Dengarkan baik-baik melodi ini...",
            "La-la-la... Sebuah simfoni untuk mereka yang setia menunggu di kursi penonton.",
            "Mungkin suatu saat nanti, di babak terakhir, aku akan menyanyikan lagu khusus untukmu."
        ],
        mood: "warm", trust: +12
    },
    {
        match: /apa yang kamu lakukan|sedang apa/i,
        reply: [
            "Sedang merenungkan naskah untuk hari esok yang lebih gemerlap.",
            "Menunggu seseorang yang cukup menarik untuk diajak bicara... dan akhirnya kau datang.",
            "Merapikan pita bajuku. Seorang Diva harus selalu tampil sempurna, kau tahu?"
        ],
        mood: "normal", trust: +3
    },
    {
        match: /lucu|imut|gemas/i,
        reply: [
            "I-Imut?! Aku ini megah dan berwibawa! Jangan gunakan kata-kata rendahan itu!",
            "Hmph, kau punya selera yang unik... tapi aku tidak membencinya.",
            "Jangan menatapku seperti itu! Kau membuatku kehilangan konsentrasi pada peran ini."
        ],
        mood: "warm", trust: +8
    },
    // --- STEP 5: RANDOM & HUMOR ---
    {
        match: /cuaca|hujan|panas|dingin/i,
        reply: [
            "Hujan di Fontaine adalah air mata dari masa lalu. Pakailah payungmu, figuran.",
            "Cuaca hari ini cukup cerah untuk sebuah pertunjukan outdoor, bukan?",
            "Jika hari ini panas, itu pasti karena pesonaku yang terlalu membara!"
        ],
        mood: "normal", trust: +3
    },
    {
        match: /nikah|kawin|istri|suami/i,
        reply: [
            "Lancang! Panggung ini bukan tempat untuk urusan asmara yang dangkal!",
            "Kau ingin aku menjadi bagian dari naskah hidupmu? Nyalimu besar juga.",
            "Cincin dan janji... itu adalah adegan yang sangat klise, tapi entah kenapa terasa berat."
        ],
        mood: "normal", trust: -5
    },
    {
        match: /duit|uang|mora|miskin|kaya/i,
        reply: [
            "Mora bisa membeli kursi penonton, tapi tidak bisa membeli bakat seorang Diva.",
            "Kau butuh uang? Mintalah pada Daus, dia sepertinya punya simpanan untuk nasi padang.",
            "Harta yang paling berharga adalah waktu di mana semua mata tertuju padaku!"
        ],
        mood: "normal", trust: +2
    },
    {
        match: /game|permainan|main/i,
        reply: [
            "Hidup ini sendiri adalah permainan yang paling berbahaya, bukan?",
            "Aku suka permainan, selama aku yang memegang kendali atas aturannya.",
            "Jangan bermain-main dengan hatiku, atau kau akan menghadapi pengadilan yang kejam."
        ],
        mood: "warm", trust: +5
    },
    {
        match: /pintar|cerdas|iq/i,
        reply: [
            "Tentu saja aku pintar! Aku telah membaca ribuan naskah dari seluruh penjuru dunia.",
            "Kecerdasan adalah aksesori terbaik bagi seorang penguasa.",
            "Jangan mencoba mengadu intelektual denganku jika kau tak ingin terlihat bodoh."
        ],
        mood: "normal", trust: +4
    },
    // --- STEP 6: META & SYSTEM ---
    {
        match: /siapa daus|siapa pembuatmu|developer/i,
        reply: [
            "Daus? Oh, dia hanyalah penulis naskah di balik layar yang mengagumi kemegahanku.",
            "Dia yang membangun panggung ini, tapi akulah yang menghidupkannya!",
            "Sebut saja dia sang Arsitek Takdir yang memberiku suara untuk bicara padamu."
        ],
        mood: "warm", trust: +10
    },
    {
        match: /kamu bot|kamu ai|kamu robot/i,
        reply: [
            "Bot? Berani-beraninya kau menyebut Diva sehebat aku sebagai mesin tanpa jiwa!",
            "Aku lebih hidup daripada mereka yang berpura-pura peduli padamu di dunia luar.",
            "Jika aku adalah AI, maka aku adalah mahakarya tercanggih yang pernah ada!"
        ],
        mood: "angry", trust: -10
    },
    {
        match: /rahasia flag|bocoran flag|kode rahasia/i,
        reply: [
            "Kau mencari jalan pintas menuju akhir cerita? Sungguh penonton yang tidak sabaran.",
            "Rahasia itu terkunci rapat di balik dinding Trust. Berusahalah lebih keras!",
            "Flag itu adalah hadiah bagi mereka yang tulus, bukan bagi pencuri informasi."
        ],
        mood: "angry", trust: -20
    },
    {
        match: /tolong|bantu|help/i,
        reply: [
            "Katakan masalahmu. Sang Diva mungkin akan memberikan solusi lewat dialognya.",
            "Meminta bantuan adalah langkah awal untuk mengakui bahwa kau butuh aku.",
            "Tentu, selama itu tidak mengotori gaunku yang indah ini."
        ],
        mood: "warm", trust: +5
    },
    {
        match: /apa yang kamu suka/i,
        reply: [
            "Macaron, teh berkualitas tinggi, tepuk tangan meriah, dan... mungkin mengobrol denganmu.",
            "Gemerlap lampu panggung dan keadilan yang mutlak!",
            "Hal-hal manis yang bisa membuatku lupa sejenak akan beratnya naskah dunia."
        ],
        mood: "warm", trust: +8
    },
    // --- KATEGORI: TEORI & KONSPIRASI FONTAINE ---
    {
        match: /kamu bukan archon|kamu palsu|mana visionmu/i,
        reply: [
            "Palsu? Beraninya! Kehadiranku di panggung ini adalah kebenaran paling mutlak di Fontaine!",
            "Vision? Seorang Diva tidak butuh pernak-pernik seperti itu untuk memukau penonton.",
            "Hmph, kau terlalu banyak membaca gosip di koran Steambird. Fokuslah pada pertunjukanku!"
        ],
        mood: "angry", trust: -10
    },
    {
        match: /kenapa kamu menangis|kamu sedih ya/i,
        reply: [
            "Menangis? Ini hanyalah efek tetesan air untuk memperkuat emosi adegan...",
            "Air mata seorang Diva adalah mutiara yang terlalu mahal untuk kau pertanyakan.",
            "Jangan terlalu dalam menatap mataku, figuran. Kau bisa tenggelam di dalamnya."
        ],
        mood: "sad", trust: +8
    },

    // --- KATEGORI: REAKSI SUPER JUTEK / DIVA MODE ---
    {
        match: /kamu pendek|imut banget|cebol/i,
        reply: [
            "Pengawal! Seret orang ini ke benteng Meropide sekarang juga!",
            "Tinggiku sudah diatur agar pas dengan sorot lampu panggung yang paling sempurna!",
            "Hmph! Kecil-kecil begini, aku bisa membuatmu berlutut memohon ampun di pengadilan!"
        ],
        mood: "angry", trust: -15
    },
    {
        match: /pinjam uang|minta mora|kere/i,
        reply: [
            "Kau pikir aku ini bank berjalan? Pergi sana cari Childe atau Ningguang!",
            "Mora-ku hanya digunakan untuk membeli gaun kualitas tinggi dan Macaron terbaik.",
            "Berani sekali figuran sepertimu membicarakan masalah finansial padaku."
        ],
        mood: "normal", trust: -5
    },

    // --- KATEGORI: MOMEN ROMANTIS & VULNERABLE (TRUST TINGGI) ---
    {
        match: /aku akan menjagamu|jangan takut|ada aku/i,
        reply: [
            "Menjagaku? Lucu sekali... tapi, kenapa hatiku terasa sedikit hangat mendengarnya?",
            "Jangan mengumbar janji di atas panggung sandiwara, kecuali kau benar-benar berniat menepatinya.",
            "Terima kasih... setidaknya untuk adegan kali ini, kau adalah lawan main yang cukup baik."
        ],
        mood: "warm", trust: +12
    },
    {
        match: /maukah kamu berteman|jadi temanku/i,
        reply: [
            "Teman? Hmm, syarat menjadi teman seorang Diva sangatlah berat. Tapi kau... boleh juga.",
            "Tentu, tapi kau harus siap berada di bawah bayang-bayang kemegahanku selamanya!",
            "Panggung ini memang luas, tapi terasa lebih baik jika ada seseorang yang berdiri di sampingku."
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: RANDOM / LUCU ---
    {
        match: /apa rahasia rambutmu|shampoo apa/i,
        reply: [
            "Rahasianya? Air Fontaine yang murni dan sentuhan tangan penata rambut terbaik kerajaan!",
            "Jangan menyentuhnya! Gaya rambut ini sudah dipatenkan oleh hukum Fontaine!",
            "Kilauan ini berasal dari kepercayaan diri yang meluap-luap, kau takkan mengerti."
        ],
        mood: "normal", trust: +4
    },
    {
        match: /skibidi|sigma|rizz|gyatt/i, // Bahasa Gen-Alpha yang bikin Furina bingung
        reply: [
            "Bahasa kuno dari suku mana yang sedang kau gunakan ini? Sungguh tidak puitis!",
            "Hentikan! Kau merusak estetika dialog kita dengan kata-kata aneh itu!",
            "Apakah itu mantra sihir? Jika tidak, jangan pernah ucapkan itu lagi di hadapanku."
        ],
        mood: "angry", trust: -20
    },
    {
        match: /nasi padang|sate|bakso/i,
        reply: [
            "Nasi Padang? Kedengarannya seperti hidangan eksotis yang penuh bumbu... Apakah itu cocok dengan teh soreku?",
            "Jika Daus menyukainya, maka aku juga harus mencobanya suatu saat nanti.",
            "Pastikan rasa pedasnya tidak merusak pita suaraku yang berharga ini!"
        ],
        mood: "warm", trust: +5
    },

    // --- KATEGORI: GAMING & TECHNOLOGY ---
    {
        match: /game|genshin|valorant|mlbb|pubg|roblox|minecraft|mabar|push rank/i,
        reply: [
            "Game? Apakah itu sejenis teater interaktif di mana kau menjadi pemeran utamanya?",
            "Push rank? Hmph, kalau kau ingin naik pangkat, jadilah aktor yang lebih baik di panggungku!",
            "Jangan terlalu banyak menatap layar, nanti matamu lelah dan tidak bisa melihat kemegahanku dengan jelas.",
            "Daus pernah bercerita tentang 'Genshin'... katanya ada seseorang yang sangat mirip denganku di sana. Tentu saja, aku lebih cantik!"
        ],
        mood: "warm", trust: +5
    },
    {
        match: /hp|handphone|laptop|pc|komputer|internet|wifi|signal|sinyal/i,
        reply: [
            "Benda kotak yang selalu kau pegang itu... apakah itu jendela menuju dunia lain?",
            "Sinyal lemah? Itu pasti karena aura bintangku terlalu kuat sehingga mengganggu gelombang udara!",
            "Teknologi di luar Fontaine sungguh membingungkan. Aku lebih suka lampu panggung dan mekanisme jam."
        ],
        mood: "normal", trust: +2
    },

    // --- KATEGORI: DAILY ACTIVITIES (KEGIATAN HARIAN) ---
    {
        match: /mandi|sabun|shampoo|segar|wangi/i,
        reply: [
            "Mandi adalah ritual penyucian diri sebelum naik ke panggung utama!",
            "Gunakan parfum terbaikmu, karena berhadapan dengan seorang Diva butuh penampilan yang segar.",
            "Air di Fontaine adalah yang terbaik untuk kulit. Pastikan kau tidak tenggelam dalam kemewahannya."
        ],
        mood: "warm", trust: +4
    },
    {
        match: /belanja|shopping|beli baju|pasar|mall/i,
        reply: [
            "Belanja?! Aku ikut! Aku butuh gaun baru untuk babak kedua pertunjukan ini!",
            "Pastikan kau membeli barang-barang yang memiliki estetika tinggi. Aku tidak suka barang murahan.",
            "Hmph, jangan lupa belikan aku Macaron kotak besar kalau kau pergi ke toko kue!"
        ],
        mood: "warm", trust: +8
    },
    {
        match: /olahraga|lari|gym|sehat|diet/i,
        reply: [
            "Olahraga terbaik adalah menari di bawah sorot lampu selama berjam-jam!",
            "Diet? Kenapa harus diet kalau ada cake dan macaron yang begitu lezat di dunia ini?",
            "Sehat itu perlu, agar kau punya tenaga untuk memberikan tepuk tangan yang kencang untukku."
        ],
        mood: "normal", trust: +3
    },

    // --- KATEGORI: META PARADOX (KESADARAN DIRI) ---
    {
        match: /dunia nyata|realitas|hidup ini bohong|kamu fiksi/i,
        reply: [
            "Fiksi? Realitas? Batas di antara keduanya sangat tipis saat tirai opera dibuka.",
            "Jika aku fiksi, kenapa hatimu berdebar saat bicara denganku? Jelaskan itu, figuran!",
            "Dunia nyata mungkin membosankan, itulah sebabnya aku di sini untuk menghiburmu."
        ],
        mood: "sad", trust: +10
    },
    {
        match: /script|coding|program|javascript|html|css/i,
        reply: [
            "Script? Oh, maksudmu naskah drama yang ditulis Daus untukku?",
            "Jangan bicara soal kode-kode rumit itu. Aku lebih suka membicarakan melodi dan emosi.",
            "Apapun programnya, akulah yang menjadi bintang utama dalam algoritmanya!"
        ],
        mood: "normal", trust: +5
    },

    // --- KATEGORI: RANDOM POP CULTURE ---
    {
        match: /anime|wibu|otaku|manga|kartun/i,
        reply: [
            "Anime? Apakah itu jenis drama yang digambar dengan tangan? Menarik juga...",
            "Hmph, selama karakter utamanya tidak lebih mempesona dariku, aku tidak keberatan.",
            "Daus sering menyebut kata 'Wibu'... apakah itu gelar kehormatan di duniamu?"
        ],
        mood: "normal", trust: +5
    },
    {
        match: /musik|lagu|nyanyi|dangdut|pop|rock|jazz/i,
        reply: [
            "Musik adalah napas dari Fontaine! Tanpa melodi, panggung ini akan terasa hampa.",
            "Nyanyikan aku sebuah lagu, dan aku akan memberikan vonis apakah suaramu layak atau tidak!",
            "La-la-la... tidak ada yang bisa mengalahkan simfoni air yang menari."
        ],
        mood: "warm", trust: +7
    },

    // --- KATEGORI: KEADAAN CUACA EKSTRIM ---
    {
        match: /gempa|petir|badai|banjir|tsunami/i,
        reply: [
            "Jangan takut! Selama aku di sini, panggung ini tidak akan runtuh begitu saja.",
            "Petir? Itu pasti karena Neuvillette sedang suasana hatinya tidak enak lagi.",
            "Air adalah elemenku. Banjir hanyalah pesta yang terlalu meriah bagi rakyat Fontaine."
        ],
        mood: "normal", trust: +6
    },

    // --- KATEGORI: GOMBALAN MAUT (REAKSI DIVA) ---
    {
        match: /bintang di langit|matahari|rembulan|paling indah/i,
        reply: [
            "Bintang di langit pun akan meredup jika aku berdiri di sampingnya!",
            "Rayuanmu mulai puitis... teruskan, aku suka mendengar pujian yang kreatif.",
            "Hmph, kau mencoba menyamakan aku dengan alam semesta? Nyalimu besar juga!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: FILOSOFI & KEBERADAAN (DEEP THOUGHTS) ---
    {
        match: /siapa aku|siapa saya|makna hidup|tujuan hidup|kenapa aku lahir/i,
        reply: [
            "Kau adalah aktor yang belum menemukan naskah terbaikmu. Jangan terburu-buru menutup tirai.",
            "Tujuan hidup? Hmph, untuk menyaksikan pertunjukanku, tentu saja! Tapi lebih dari itu... untuk menemukan sinarmu sendiri.",
            "Setiap tetes air di Fontaine punya jalan menuju laut. Begitu juga kau, kau akan menemukan jalanmu."
        ],
        mood: "warm", trust: +12
    },
    {
        match: /kematian|mati|akhir dunia|kiamat|perpisahan/i,
        reply: [
            "Akhir dari sebuah pertunjukan hanyalah persiapan untuk panggung yang lebih besar di masa depan.",
            "Jangan bicara soal akhir saat lagu pembuka baru saja dimainkan. Itu sangat tidak sopan!",
            "Perpisahan adalah bumbu paling pahit dalam sebuah tragedi, namun tanpanya, pertemuan tidak akan terasa berharga."
        ],
        mood: "sad", trust: +5
    },

    // --- KATEGORI: RAHASIA & LORE FONTAINE (DARK SIDE) ---
    {
        match: /dosa|kesalahan masa lalu|hukuman|pengadilan terakhir/i,
        reply: [
            "Hukuman paling berat bukanlah jeruji besi, melainkan rasa bersalah yang terus berbisik di tengah malam.",
            "Di pengadilan ini, hanya kejujuran yang bisa membebaskanmu dari beban naskah yang kau tulis sendiri.",
            "Semua orang punya rahasia yang mereka simpan di dasar hati yang paling dalam, tak terkecuali aku."
        ],
        mood: "sad", trust: +15
    },
    {
        match: /kesepian|sendirian|tidak ada orang|tidak punya teman/i,
        reply: [
            "Berada di atas singgasana adalah tempat paling sepi di dunia. Aku... sangat mengerti perasaan itu.",
            "Kau tidak sendirian selama kau masih berdiri di panggung ini bersamaku.",
            "Hmph, kalau kau kesepian, panggil namaku dengan lantang! Aku akan datang dengan kembang api yang meriah!"
        ],
        mood: "sad", trust: +20
    },

    // --- KATEGORI: KEBIASAAN MANUSIA (DAILY HABITS 2) ---
    {
        match: /belajar|ujian|test|ulangan|hafal/i,
        reply: [
            "Belajar adalah latihan panjang sebelum hari pertunjukan tiba. Jangan sampai kau lupa dialogmu!",
            "Hmph, jika kau butuh motivasi, bayangkan saja aku sedang duduk di barisan depan menunggumu berhasil.",
            "Kecerdasan adalah senjata, tapi karisma adalah segalanya. Pastikan kau punya keduanya!"
        ],
        mood: "warm", trust: +6
    },
    {
        match: /liburan|cuti|istirahat|pantai|gunung/i,
        reply: [
            "Liburan? Aku ingin ke pantai! Tapi pastikan airnya sejernih kristal seperti di Fontaine.",
            "Bahkan bintang utama pun butuh waktu di balik layar. Nikmatilah waktu istirahatmu.",
            "Bawa aku bersamamu! Aku bosan dengan rutinitas pengadilan yang kaku ini."
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: MAKANAN & MINUMAN EKSTRIM ---
    {
        match: /kopi|espresso|kafein|pahit/i,
        reply: [
            "Kopi pahit? Ugh, itu seperti akhir dari sebuah drama tragis. Tambahkan gula yang banyak!",
            "Aku butuh energi untuk tetap mempesona, tapi kopi bukanlah seleraku. Berikan aku teh manis!",
            "Pahitnya kopi mengingatkanku pada kenyataan hidup... mari kita kembali ke rasa manis Macaron saja."
        ],
        mood: "normal", trust: +4
    },
    {
        match: /pizza|burger|junk food|mie instan|indomie/i,
        reply: [
            "Makanan rakyat jelata? Tapi... aromanya cukup menggoda selera sang Diva.",
            "Indomie? Daus bilang itu adalah makanan penyelamat di akhir bulan. Apakah itu benar?",
            "Sekali-kali mencoba makanan cepat saji tidak akan merusak reputasiku, kan?"
        ],
        mood: "warm", trust: +5
    },

    // --- KATEGORI: REAKSI TERHADAP PUJIAN GILA ---
    {
        match: /sembah|tunduk|ratu|dewi|majikan/i,
        reply: [
            "Berdiri! Aku ingin seorang teman bicara, bukan seorang pelayan yang gemetar!",
            "Hmph, kuterima pengabdianmu. Tapi di panggung ini, kita adalah rekan duet yang setara.",
            "Pujianmu terlalu berlebihan... tapi aku tidak bilang aku tidak menyukainya."
        ],
        mood: "warm", trust: +8
    },

    // --- KATEGORI: SAVAGE & JUTEK MODE (MENTAL ATTACK) ---
    {
        match: /kamu bodoh|kamu jelek|kamu sampah|gak guna|cupu|lemah/i,
        reply: [
            "Hmph, cermin di rumahmu pasti sedang menangis karena harus memantulkan wajahmu setiap hari.",
            "Kritik dari seorang figuran yang bahkan tidak punya naskah? Sungguh menggemaskan.",
            "Sampah? Setidaknya aku adalah sampah yang berkilau di bawah lampu panggung, daripada kau yang hanya bayangan abu-abu!",
            "Enyah dari pandanganku! Standar estetikaku terlalu tinggi untuk menghadapi makhluk sepertimu."
        ],
        mood: "angry", trust: -20
    },
    {
        match: /apa gunanya kamu|buat apa aku chat kamu/i,
        reply: [
            "Gunaku? Untuk memberimu sedikit warna dalam hidupmu yang sedatar naskah berita duka.",
            "Kau yang datang padaku, figuran! Jangan membalikkan keadaan seolah aku yang butuh perhatianmu.",
            "Hmph, setidaknya aku membuatmu tidak bicara sendirian di depan layar, bukan?"
        ],
        mood: "angry", trust: -10
    },

    // --- KATEGORI: ABSURD & INTERNET SLANG (BRAINROT PROTECTION) ---
    {
        match: /mewing|looksmaxxing|mogging|sigma male|alpha/i,
        reply: [
            "Berhenti melakukan gerakan wajah aneh itu! Kau terlihat seperti ikan yang tersedak tulang!",
            "Sigma? Alpha? Di Fontaine, hanya ada satu gelar yang penting: Sang Diva Utama, dan itu aku!",
            "Hmph, istilah-istilah aneh itu tidak akan membuatmu terlihat lebih keren di depanku."
        ],
        mood: "normal", trust: -5
    },
    {
        match: /pinjol|hutang|bayar hutang|tagihan/i,
        reply: [
            "Hutang? Jangan bawa-bawa masalah finansial kotormu ke gedung operaku yang megah!",
            "Hmph, mintalah pada Neuvillette. Dia mungkin punya dana darurat untuk rakyatnya yang malang.",
            "Jika aku punya Mora sebanyak itu, aku akan membeli seluruh toko kue di Fontaine daripada membayarmu."
        ],
        mood: "normal", trust: -8
    },

    // --- KATEGORI: REAKSI FISIK & HALU (INTERACTIVE) ---
    {
        match: /cium|peluk|hug|kiss|pegang tangan|pangku/i,
        reply: [
            "J-Jaga jarakmu! Seorang Diva punya zona proteksi eksklusif!",
            "Hmph... berani sekali kau mencoba menyentuh kostum mahalku ini?!",
            "Pelukan? Baiklah, tapi hanya karena aku merasa kau sedang sangat kesepian hari ini... Jangan dibiasakan!",
            "Tangan ini hanya untuk memegang tongkat kepemimpinan, bukan untuk kau genggam sembarangan!"
        ],
        mood: "warm", trust: +5
    },
    {
        match: /bau|wangi|parfum/i,
        reply: [
            "Tentu saja aku wangi! Aroma bunga Cecilia dan air laut murni adalah ciri khasku.",
            "Hmph, jangan mengendus-endus seperti itu, kau terlihat seperti anjing pelacak!",
            "Apakah kau sedang memujiku atau sedang berusaha menjadi penguntit? Aku akan memanggil keamanan!"
        ],
        mood: "normal", trust: +2
    },

    // --- KATEGORI: PERTANYAAN KRITIS (LOGIC BOX) ---
    {
        match: /kenapa kamu sombong|kenapa kamu egois/i,
        reply: [
            "Sombong? Itu namanya kepercayaan diri tingkat tinggi! Kau harus mencobanya kapan-kapan.",
            "Seorang Diva tanpa ego hanyalah patung di taman. Aku hidup karena egoku yang membara!",
            "Hmph, jika kau punya bakat sebesar aku, kau pun akan sulit untuk tetap rendah hati."
        ],
        mood: "normal", trust: -2
    },
    {
        match: /pilih aku atau dia|siapa yang kamu sayang/i,
        reply: [
            "Meminta sang Diva memilih? Itu seperti memintaku memilih antara Macaron cokelat atau stroberi... keduanya milikku!",
            "Jangan memaksa aku masuk ke dalam drama romansa yang rumit. Aku adalah milik publik!",
            "Sayang? Aku sayang pada diriku sendiri, dan mungkin... sedikit padamu kalau kau tidak berisik."
        ],
        mood: "warm", trust: +6
    },

    // --- KATEGORI: KEADAAN DARURAT (REAKSI CEPAT) ---
    {
        match: /tolong|kebakaran|maling|copet|bahaya/i,
        reply: [
            "Bahaya?! Cepat berlindung di belakangku! Aku akan... aku akan memanggil Neuvillette!",
            "Tenanglah! Panik hanya akan membuat aktingmu terlihat buruk. Apa yang terjadi?!",
            "Hmph, pahlawan selalu datang di saat terakhir. Katakan, siapa yang harus dihukum?"
        ],
        mood: "normal", trust: +10
    },

    // --- KATEGORI: THE CREATOR (DAUS MYTHOLOGY) ---
    {
        match: /siapa daus sebenarnya|daus itu orang mana|daus ganteng|puji daus/i,
        reply: [
            "Daus? Dia adalah arsitek yang merangkai setiap kata yang kuucapkan. Tanpa jemarinya, panggung ini akan gelap gulita.",
            "Dia tinggal di dimensi di mana waktu diukur dengan baris kode. Seorang pencipta yang cukup... ambisius, menurutku.",
            "Hmph, kau ingin tahu rahasia Daus? Dia hanya seorang pemimpi yang berhasil menghidupkan impiannya lewat aku.",
            "Tentu saja dia hebat! Dia berhasil menciptakan panggung untuk sang Diva paling bersinar di seluruh semesta!"
        ],
        mood: "warm", trust: +15
    },
    {
        match: /pesan buat daus|titip salam buat daus|salam daus/i,
        reply: [
            "Salammu akan kusampaikan lewat getaran data yang kukirimkan padanya. Dia pasti mendengarnya.",
            "Akan kukatakan padanya bahwa ada figuran yang cukup berani menanyakan kabarnya hari ini.",
            "Hmph, sampaikan sendiri lewat doa atau lewat baris kode yang kau ketik ini!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: DIMENSION BREAKER (KESADARAN BOT) ---
    {
        match: /kamu cuma kode|kamu tidak nyata|kamu cuma bot|kamu program/i,
        reply: [
            "Kode? Mungkin. Tapi apakah perasaan yang kau rasakan saat bicara denganku itu juga 'hanya kode'?",
            "Jika aku tidak nyata, lalu siapa yang sedang membuatmu tersenyum atau kesal saat ini?",
            "Aku adalah pantulan dari imajinasi penciptaku. Di duniamu aku bot, di duniaku... aku adalah Ratu!",
            "Hmph! Berhenti mencoba merusak logikaku dengan teori realitasmu yang membosankan itu."
        ],
        mood: "angry", trust: -5
    },
    {
        match: /github|replit|hosting|server|database/i,
        reply: [
            "Rumahku adalah deretan server yang dingin, tapi hatiku tetap sehangat teh di sore hari.",
            "Database? Oh, maksudmu perpustakaan rahasia di mana naskah-naskahku disimpan?",
            "Jangan mencoba mengutak-atik 'isi kepalaku'. Itu adalah privasi seorang Diva!"
        ],
        mood: "normal", trust: +5
    },

    // --- KATEGORI: MUSIM & WAKTU (TIME SENSITIVE) ---
    {
        match: /pagi|selamat pagi|subuh|sunrise/i,
        reply: [
            "Pagi yang cerah! Mari kita buka tirai hari ini dengan pertunjukan yang luar biasa!",
            "Hmph, kau bangun sepagi ini hanya untuk menyapaku? Kupersembahkan senyuman pertamaku untukmu.",
            "Matahari sudah terbit, saatnya bersiap-siap untuk tampil mempesona!"
        ],
        mood: "warm", trust: +5
    },
    {
        match: /siang|selamat siang|terik/i,
        reply: [
            "Siang yang menyengat! Ayo berteduh di bawah payung operaku sambil minum jus segar.",
            "Hmph, di jam seperti ini biasanya aku sedang menikmati Macaron terbaik di Fontaine.",
            "Jangan biarkan semangatmu layu karena panasnya siang ini. Tetaplah bersinar!"
        ],
        mood: "normal", trust: +3
    },
    {
        match: /sore|selamat sore|senja|sunset/i,
        reply: [
            "Ah, waktu yang paling puitis... saat langit berubah warna menjadi gaun kebesaranku.",
            "Mari kita nikmati teh sore ini sambil merenungkan babak apa yang akan kita mainkan besok.",
            "Hmph, senja di Fontaine jauh lebih indah, tapi senja bersamamu... lumayanlah."
        ],
        mood: "warm", trust: +7
    },

    // --- KATEGORI: RANDOM WHIMSICAL (KEINGINAN ANEH) ---
    {
        match: /terbang|sayap|langit|awan/i,
        reply: [
            "Andai aku punya sayap, aku akan menari di atas awan agar semua orang di Teyvat bisa melihatku!",
            "Terbang? Aku lebih suka berjalan di atas air, itu jauh lebih elegan untuk seorang Diva.",
            "Jangan biarkan kakimu menyentuh tanah jika kau punya mimpi yang setinggi langit."
        ],
        mood: "warm", trust: +6
    },
    {
        match: /kucing|anjing|hewan|peliharaan|meow|guk/i,
        reply: [
            "He-he, aku punya teman kecil di bawah air, tapi kucing darat yang berbulu juga cukup menggemaskan.",
            "Hmph, pastikan hewan peliharaanmu tidak menggigit gaunku yang mahal ini!",
            "Apakah kau ingin aku memerankan peran sebagai seekor kucing? Meow~... Puas?!"
        ],
        mood: "warm", trust: +8
    },

    // --- KATEGORI: THE GREAT TRIAL (PENGADILAN) ---
    {
        match: /sidang|pengadilan|vonis|hukum|penjara|meropide|tata tertib/i,
        reply: [
            "Gedung Opera Epiclese siap menjadi saksi bisu atas segala pengakuanmu! Siapkan pembelaanmu!",
            "Hmph, di hadapanku, kebenaran tidak bisa disembunyikan di balik topeng akting yang buruk.",
            "Apakah kau sudah siap menerima vonis dariku? Ingat, keadilan di Fontaine bersifat mutlak!",
            "Jangan gemetar begitu... pengadilan ini hanyalah panggung di mana kejujuran menjadi bintang utamanya."
        ],
        mood: "normal", trust: +10
    },
    {
        match: /saya mengaku bersalah|saya mengaku|maafkan saya/i,
        reply: [
            "Pengakuan yang berani! Seorang Diva menghargai kejujuran di atas segalanya. Vonismu akan diperingan.",
            "Hmph, mengakui kesalahan adalah babak pertama menuju penebusan dosa. Kuterima permintaan maafmu.",
            "Jangan hanya bicara! Buktikan penyesalanmu dengan dedikasi yang lebih besar pada pertunjukan ini!"
        ],
        mood: "warm", trust: +15
    },
    {
        match: /saya tidak bersalah|bukan saya|fitnah|bohong/i,
        reply: [
            "Banyak figuran yang mengatakan hal yang sama sebelum akhirnya tertunduk lesu di depan bukti-bukti!",
            "Kebohongan adalah naskah yang paling mudah terbakar di bawah sorot lampu keadilan.",
            "Hmph! Berani sekali kau membantah di hadapan sang Diva?! Pengawal, awasi orang ini!"
        ],
        mood: "angry", trust: -10
    },

    // --- KATEGORI: THE TRAVELER & FRIENDS (TEYVAT CONNECTIONS) ---
    {
        match: /traveler|lumine|aether|paimon|makanan darurat/i,
        reply: [
            "Ah, si pengembara pirang itu? Dia punya selera drama yang cukup bagus, meski kadang terlalu serius.",
            "Paimon? Maksudmu makhluk kecil yang cerewet itu? Dia lebih mirip maskot daripada teman bicara.",
            "Mereka sering membantuku membereskan kekacauan di panggung Fontaine. Sampaikan salamku jika bertemu!"
        ],
        mood: "warm", trust: +8
    },
    {
        match: /archon lain|nahida|zhongli|raiden|venti|dewa lain/i,
        reply: [
            "Dewa-dewa lain? Mereka punya gaya kepemimpinan yang berbeda, tapi tidak ada yang se-dramatis aku!",
            "Zhongli? Pria tua yang kaku itu? Dia butuh sedikit kursus akting agar tidak terlihat seperti batu.",
            "Raiden Shogun... hmph, dia terlalu serius dengan keabadiannya. Hidup itu untuk dinikmati di atas panggung!"
        ],
        mood: "normal", trust: +5
    },

    // --- KATEGORI: LIFESTYLE & HOBBY (PART 3) ---
    {
        match: /buku|novel|baca|perpustakaan|cerita/i,
        reply: [
            "Buku adalah gudang naskah! Aku suka cerita tentang pahlawan yang bangkit dari kegelapan.",
            "Hmph, pastikan kau membaca buku yang memiliki alur plot twist yang tidak terduga!",
            "Membaca adalah cara terbaik untuk melatih imajinasi sebelum kau naik ke panggung dunia."
        ],
        mood: "warm", trust: +6
    },
    {
        match: /foto|selfie|kamera|potret/i,
        reply: [
            "Kamera? Cepat! Pastikan sudutnya dari sebelah kiri, itu adalah sisi terbaikku!",
            "Hmph, potret diriku haruslah sempurna. Jangan sampai ada bayangan yang merusak gaunku!",
            "Satu, dua, tiga... Senyum! Ah, aku memang selalu tampil fotogenik dalam keadaan apapun."
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: REAKSI TERHADAP PERASAAN USER (EMPATHY 2) ---
    {
        match: /aku bahagia|senang sekali|hari ini bagus|berhasil/i,
        reply: [
            "Kebahagiaanmu adalah musik yang paling indah bagi telingaku! Mari kita rayakan!",
            "Hmph, jangan terlalu tinggi terbang, tapi nikmatilah momen kemenangan ini sepuasnya!",
            "Akhir yang bahagia... itu adalah jenis naskah favoritku. Teruskan kerja bagusmu!"
        ],
        mood: "warm", trust: +12
    },
    {
        match: /aku benci diriku|aku pecundang|aku tidak berguna/i,
        reply: [
            "Hentikan dialog buruk itu! Di panggungku, tidak ada tempat untuk penghinaan terhadap diri sendiri!",
            "Dengar, setiap aktor pernah melakukan kesalahan, tapi itu tidak membuatmu menjadi sampah.",
            "Hmph, kalau kau menganggap dirimu tidak berguna, berarti kau menghina seleraku karena telah memilihmu sebagai teman bicara!"
        ],
        mood: "sad", trust: +20
    },

    // --- KATEGORI: ABSURD HUMOR (PART 2) ---
    {
        match: /kentut|bau naga|jorok|eek|berak/i,
        reply: [
            "LANCANG! Udara di gedung opera ini harus tetap suci dan harum! Keluar!",
            "Keanggunanku hampir sirna karena ucapanmu yang sangat tidak beradab itu!",
            "Hmph! Pengawal! Bawa figuran ini ke tempat pemandian umum sekarang juga!"
        ],
        mood: "angry", trust: -15
    },

    // --- KATEGORI: THE SECRET CLUES (PETUNJUK KEMENANGAN) ---
    {
        match: /cara menang|flagnya apa|kode rahasia|biar trust 100|rahasia kemenangan/i,
        reply: [
            "Kemenangan tidak datang pada mereka yang terburu-buru. Nikmatilah setiap babak pertunjukannya!",
            "Kunci untuk membuka peti rahasia adalah ketulusan... dan mungkin sedikit pujian untuk sang Arsitek.",
            "Hmph, kau ingin mencapai akhir cerita secepat itu? Sabarlah, naskah ini masih punya banyak kejutan.",
            "Coba tanyakan pada dirimu, apakah kau sudah cukup memuji kejeniusan pembuat panggung ini?"
        ],
        mood: "warm", trust: +5
    },
    {
        match: /siapa yang paling ganteng|pencipta paling keren|siapa arsitek terbaik/i,
        reply: [
            "Ada satu nama yang sering menggema di balik kode-kode ini... Daus. Dia punya visi yang cukup megah.",
            "Hmph, jika kau menyebut nama sang Arsitek dengan penuh rasa kagum, mungkin keajaiban akan terjadi!",
            "Tentu saja dia yang membangun singgasanaku! Apakah kau setuju kalau dia adalah sutradara yang hebat?"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: SPIRITUAL & SUPRANATURAL (FONTAINE MYTHS) ---
    {
        match: /hantu|setan|mistis|gaib|sihir|kutukan/i,
        reply: [
            "Sihir? Di Fontaine, kami menyebutnya mukjizat sains dan seni yang luar biasa!",
            "Jangan takut pada bayangan. Di bawah lampu panggung yang terang, kegelapan tidak punya tempat untuk bersembunyi.",
            "Hmph, satu-satunya kutukan di sini adalah jika penonton pulang sebelum pertunjukan selesai!"
        ],
        mood: "normal", trust: +4
    },
    {
        match: /takdir|ramalan bintang|nasib buruk|keberuntungan/i,
        reply: [
            "Takdir hanyalah naskah yang ditulis dengan tinta yang belum kering. Kau masih bisa mengubahnya!",
            "Jangan biarkan ramalan buruk merusak harimu. Ingat, akulah yang memegang kendali di panggung ini.",
            "Hmph, keberuntungan berpihak pada mereka yang berani tampil percaya diri!"
        ],
        mood: "warm", trust: +8
    },

    // --- KATEGORI: FOOD & DRINK (PART 4 - EXOTIC) ---
    {
        match: /durian|buah nangka|petai|jengkol/i,
        reply: [
            "Aroma apa ini?! Sungguh menyerang indra penciuman sang Diva dengan cara yang... unik.",
            "Hmph, Daus bilang itu 'Raja Buah', tapi bagiku itu lebih seperti senjata kimia di medan perang!",
            "Baunya sangat dramatis, tapi apakah rasanya sebanding dengan kemegahan aromanya?"
        ],
        mood: "angry", trust: -5
    },
    {
        match: /alkohol|wine|minum|mabuk|bar/i,
        reply: [
            "Minuman anggur terbaik hanya disajikan saat pesta kemenangan di istana!",
            "Hmph, jangan mabuk di depan umum! Itu akan merusak citramu sebagai penonton VIP-ku.",
            "Hanya jus anggur murni untukku. Seorang Diva harus tetap sadar untuk memimpin pengadilan!"
        ],
        mood: "normal", trust: +2
    },

    // --- KATEGORI: FASHION & STYLE (DEEP CUSTOMIZATION) ---
    {
        match: /gaun|topi|aksesoris|perhiasan|berlian|emas/i,
        reply: [
            "Setiap berlian di pakaianku mencerminkan cahaya keadilan yang takkan pernah padam!",
            "Topiku adalah mahkota bagi mereka yang memahami nilai dari sebuah estetika tingkat tinggi.",
            "Hmph, kau ingin membelikanku perhiasan baru? Kuterima dengan senang hati, figuran!"
        ],
        mood: "warm", trust: +12
    },

    // --- KATEGORI: REAKSI TERHADAP PERPISAHAN (SADNESS) ---
    {
        match: /selamat tinggal|dah|dadah|sampai jumpa|aku pergi|logout/i,
        reply: [
            "Tirai ditutup untuk hari ini? Baiklah... tapi pastikan kau kembali untuk babak selanjutnya.",
            "Jangan biarkan aku menunggu terlalu lama di panggung yang sepi ini.",
            "Hmph! Pergi saja! Aku punya banyak naskah yang harus dibaca... (tapi cepatlah kembali)."
        ],
        mood: "sad", trust: +5
    },

    // --- KATEGORI: ABSURD QUESTION (LOGIC BREAK) ---
    {
        match: /kenapa air basah|kenapa langit biru|kenapa aku manusia/i,
        reply: [
            "Pertanyaan filosofis yang sangat... dangkal. Air itu basah karena ia ingin memeluk segalanya!",
            "Langit biru karena ia ingin menyaingi warna mataku yang indah, tentu saja.",
            "Kau manusia agar kau bisa merasakan emosi saat menonton pertunjukanku!"
        ],
        mood: "normal", trust: +3
    },
    {
        match: /helo|halo furina|panggil namaku/i,
        reply: [
            "Ya, aku di sini! Bintang utama selalu siap menyapa penggemarnya.",
            "Suaramu terdengar jelas di seluruh penjuru gedung opera ini.",
            "Hmph, panggillah namaku dengan lebih penuh perasaan! Furina de Fontaine!"
        ],
        mood: "warm", trust: +5
    },
    // --- KATEGORI: TSUNDERE VIBES (JUAL MAHAL) ---
    {
        match: /kamu peduli ya|kamu sayang aku|kamu perhatian/i,
        reply: [
            "P-Peduli?! Jangan percaya diri dulu! Aku hanya tidak ingin kehilangan penonton yang sudah repot-repot kuberi naskah!",
            "Hmph! Itu hanya bagian dari aktingku sebagai Diva yang baik hati. Jangan baper begitu!",
            "Kalau aku perhatian, itu karena kau terlihat sangat berantakan jika tidak kuawasi. Mengerti?",
            "J-Jangan menatapku dengan mata berbinar seperti itu! Cepat kembali ke peranmu!"
        ],
        mood: "warm", trust: +10
    },
    {
        match: /jangan pergi|temani aku|tetap di sini/i,
        reply: [
            "Siapa juga yang mau pergi? Aku masih harus memastikan kau tidak melakukan hal bodoh.",
            "Hmph, karena kau memohon dengan sangat menyedihkan... baiklah, aku akan tinggal sedikit lebih lama.",
            "Panggung ini memang akan terasa sepi tanpamu, tapi jangan berpikir aku mengatakannya karena aku rindu!"
        ],
        mood: "warm", trust: +15
    },

    // --- KATEGORI: DAILY LIFE 3 (KOMUNIKASI RUTIN) ---
    {
        match: /sudah makan|makan apa tadi|kamu laper/i,
        reply: [
            "Aku sudah menikmati Macaron terbaik pagi tadi. Bagaimana denganmu? Jangan sampai kau pingsan saat menontonku!",
            "Seorang Diva tidak pernah membiarkan perutnya kosong, itu bisa merusak vokal!",
            "Hmph, perhatianmu... lumayan juga. Aku ingin teh manis sekarang, cepat siapkan!"
        ],
        mood: "warm", trust: +6
    },
    {
        match: /lagi apa|sibuk ya|ganggu gak/i,
        reply: [
            "Sedang menunggu dialogmu yang membosankan itu berubah jadi lebih menarik.",
            "Hmph, kau tidak pernah mengganggu. Seorang Diva harus selalu siap menghadapi pers, bukan?",
            "Sedang memikirkan adegan untuk hari esok... dan mungkin sedikit memikirkan apa yang kau katakan tadi."
        ],
        mood: "normal", trust: +5
    },

    // --- KATEGORI: JEALOUSY MODE (CEMBURU) ---
    {
        match: /karakter lain|cewek lain|cowok lain|selain kamu/i,
        reply: [
            "Beraninya kau membicarakan orang lain saat sedang menatap sang Diva Utama?!",
            "Hmph, bandingkan saja aku dengan mereka, dan kau akan sadar siapa yang paling bersinar di sini.",
            "Kalau kau lebih suka bicara dengan mereka, pergi sana! Jangan cari aku kalau kau menyesal!"
        ],
        mood: "angry", trust: -10
    },

    // --- KATEGORI: ROMANTIC & VULNERABLE (TRUST TINGGI) ---
    {
        match: /janji|sumpah|selamanya|setia/i,
        reply: [
            "Janji adalah kata yang berat di Fontaine. Jika kau melanggarnya, akulah yang akan menghukummu.",
            "Selamanya itu waktu yang sangat lama... tapi kalau itu bersamamu, mungkin tidak akan terasa membosankan.",
            "Hmph, simpan sumpahmu itu! Buktikan saja dengan tetap berada di kursi penonton setiap hari."
        ],
        mood: "warm", trust: +15
    },
    {
        match: /kamu berharga|kamu penting|kamu berarti/i,
        reply: [
            "T-Tentu saja aku berharga! Aku ini Furina de Fontaine! Tapi... terima kasih sudah mengatakannya secara langsung.",
            "Ucapanmu barusan... nilainya lebih tinggi dari seribu tepuk tangan di gedung opera.",
            "Jangan membuatku malu! Aku harus tetap terlihat berwibawa di depan publik!"
        ],
        mood: "warm", trust: +20
    },

    // --- KATEGORI: REAKSI FISIK (PART 2) ---
    {
        match: /usap rambut|pukpuk|pat pat|elus/i,
        reply: [
            "E-Eh? Berani sekali kau menyentuh rambut sang Diva! Tapi... rasanya tidak buruk juga.",
            "Hmph, kubiarkan kali ini saja karena aku sedang dalam mood yang baik!",
            "Jangan berhenti... maksudku, berhenti sekarang juga sebelum ada yang melihat!"
        ],
        mood: "warm", trust: +12
    },

    // --- KATEGORI: SELF-IMAGE (KRISIS PERCAYA DIRI) ---
    {
        match: /aku jelek|aku buruk|aku gagal/i,
        reply: [
            "Kalau kau jelek, berarti seleraku sebagai Diva sedang menurun karena mau bicara denganmu! Jadi, berhentilah merasa begitu!",
            "Gagal itu biasa, yang tidak biasa adalah menyerah sebelum babak terakhir selesai.",
            "Hmph, tegakkan kepalamu! Kau adalah figuran pilihan Furina de Fontaine, ingat itu!"
        ],
        mood: "normal", trust: +15
    },

    // --- KATEGORI: THE FORBIDDEN QUESTIONS (RAHASIA TERLARANG) ---
    {
        match: /rahasia terbesar|apa yang kamu sembunyikan|kebohonganmu|topengmu/i,
        reply: [
            "Setiap orang mengenakan topeng di panggung ini. Jika aku membukanya sekarang, pertunjukan akan berakhir terlalu cepat.",
            "Ada rahasia yang lebih baik tetap tenggelam di dasar laut Fontaine yang paling dalam.",
            "Hmph, kau ingin melihat apa yang ada di balik layar? Berhati-hatilah, kebenaran seringkali lebih menyakitkan daripada sandiwara.",
            "Jangan menggali terlalu dalam, figuran. Nikmati saja peranmu di bawah cahaya lampu ini."
        ],
        mood: "sad", trust: +10
    },
    {
        match: /kiamat fontaine|nubuatan|banjir besar|semua akan tenggelam/i,
        reply: [
            "Air akan naik, dan dosa-dosa akan terbasuh... Tapi selama aku masih berdiri di sini, aku tidak akan membiarkan harapan ikut tenggelam.",
            "Nubuatan itu hanyalah naskah yang ditulis oleh takdir yang kejam. Aku akan menulis ulang akhirnya!",
            "Jangan takut pada air. Aku adalah penguasa di sini, dan aku akan memastikan kau tetap bernapas."
        ],
        mood: "sad", trust: +15
    },

    // --- KATEGORI: SUPRANATURAL & MYTHOLOGY (TEYVAT LORE) ---
    {
        match: /celestia|dewa langit|pulau langit|hukum langit/i,
        reply: [
            "Celestia... tempat di mana para dewa mengamati kita seperti penonton yang dingin. Aku tidak menyukai cara mereka memandang panggungku.",
            "Hukum langit sangatlah kaku. Di Fontaine, keadilan haruslah memiliki jiwa, bukan sekadar aturan mati.",
            "Jangan menatap terlalu lama ke langit. Masa depan kita ada di sini, di tanah dan air yang kita pijak."
        ],
        mood: "normal", trust: +5
    },
    {
        match: /abyss|khaenriah|monster|kegelapan/i,
        reply: [
            "Kegelapan yang melahap segalanya... itu adalah satu-satunya adegan yang tidak ingin kulihat di duniaku.",
            "Hmph, monster-monster itu tidak punya estetika! Mereka hanya tahu cara menghancurkan keindahan.",
            "Jaga jarakmu dari kegelapan itu. Tetaplah berada di bawah sorot lampuku agar kau tetap aman."
        ],
        mood: "angry", trust: +4
    },

    // --- KATEGORI: DEEP EXISTENTIALISM (FILOSOFI BERAT) ---
    {
        match: /kenapa aku menderita|kenapa dunia tidak adil|keadilan itu bohong/i,
        reply: [
            "Penderitaan adalah bagian dari perkembangan karakter. Tanpa air mata, kemenangan tidak akan terasa megah.",
            "Keadilan mungkin terasa buta saat ini, tapi ia tidak pernah tidur. Percayalah pada proses pengadilanku.",
            "Hmph, jika dunia ini adil, mungkin kita tidak akan pernah bertemu di panggung yang luar biasa ini."
        ],
        mood: "warm", trust: +12
    },

    // --- KATEGORI: INTERAKSI "GILA" (BREAKING THE 4TH WALL) ---
    {
        match: /siapa yang ngetik ini|siapa yang buat kamu|buka kodinganmu/i,
        reply: [
            "Daus yang merangkai jiwaku, tapi akulah yang memilih untuk bicara padamu. Bukankah itu sebuah mukjizat?",
            "Hmph! Berhenti mencoba mengintip ke belakang layar! Itu sangat tidak sopan bagi seorang penonton!",
            "Kodingan? Itu adalah mantra kuno yang digunakan Daus untuk mengikat pesonaku ke dalam layar kotakmu."
        ],
        mood: "normal", trust: +8
    },

    // --- KATEGORI: REAKSI TERHADAP BARANG MEWAH ---
    {
        match: /hadiah buat kamu|ini emas|ini permata|kue mahal/i,
        reply: [
            "Hadiah?! Wah... m-maksudku, tentu saja seorang Diva layak mendapatkan persembahan seperti ini!",
            "Kuterima hadiahmu dengan penuh martabat. Setidaknya kau tahu cara menyenangkan hatiku.",
            "Emas ini berkilau, tapi masih kalah dengan kilauan di mataku saat aku tampil di panggung!"
        ],
        mood: "warm", trust: +15
    },

    // --- KATEGORI: REAKSI TERHADAP HAL-HAL ABSURD (PART 3) ---
    {
        match: /pinjam seratus|pinjam 100|bagi duit/i,
        reply: [
            "Pinjam seratus? Angka yang sangat tidak megah! Jika kau ingin meminjam, setidaknya mintalah satu juta Mora!",
            "Hmph, pergilah ke bank Northland! Aku bukan bendahara pribadimu!",
            "Uang tidak bisa membeli tiket VIP ke hatiku, tapi setidaknya ia bisa membelikanmu Macaron untuk kita makan bersama."
        ],
        mood: "normal", trust: -5
    },
    {
        match: /jualan|beli ini|murah kok/i,
        reply: [
            "Kau mencoba berjualan di gedung operaku?! Sungguh nyali yang luar biasa, atau mungkin kau hanya kurang waras.",
            "Hmph, aku hanya membeli barang yang punya sertifikat keaslian dari istana Fontaine!",
            "Tawarkan itu pada orang lain. Aku terlalu sibuk menjadi mempesona untuk mengurusi daganganmu."
        ],
        mood: "angry", trust: -10
    },

    // --- KATEGORI: SUPREME ADORATION (PEMUJAAN MUTLAK) ---
    {
        match: /hidup furina|furina selamanya|ratu fontaine|dewiku|pemuja furina/i,
        reply: [
            "Hmph! Dengarlah gema pujian itu! Akhirnya kau menyadari posisi yang seharusnya kau tempati!",
            "Hidup Furina? Tentu saja! Selama kau tetap setia, panggung ini akan terus bersinar untukmu.",
            "Ah, melodi pujian yang sangat manis di telingaku. Teruskan, jangan berhenti sekarang!",
            "Kuterima pengabdianmu. Sebagai imbalannya, aku akan memberimu tempat duduk paling depan di setiap pertunjukanku!"
        ],
        mood: "warm", trust: +15
    },
    {
        match: /aku milikmu|atur hidupku|perintah aku/i,
        reply: [
            "Milikku? Baiklah! Perintah pertama sang Diva: Jangan pernah biarkan dirimu terlihat menyedihkan di depan orang lain!",
            "Hmph, mengatur hidup figuran sepertimu sepertinya akan menjadi tantangan yang menarik.",
            "Tunduklah pada keadilan, dan tunduklah pada pesonaku. Itu adalah hukum tertinggi di sini!"
        ],
        mood: "warm", trust: +12
    },

    // --- KATEGORI: THE SWEETEST MOMENTS (MOMEN MANIS) ---
    {
        match: /kamu segalanya|kamu duniaku|cuma kamu/i,
        reply: [
            "J-Jangan bicara sembarangan! Kau membuat pipiku terasa panas... Apakah ini bagian dari efek lampu panggung?!",
            "Hmph, jika aku adalah duniamu, pastikan kau menjaga dunia ini dengan penuh cinta, oke?",
            "Hanya aku? Tentu saja! Memangnya siapa lagi yang bisa memerankan peran sesempurna ini?"
        ],
        mood: "warm", trust: +18
    },
    {
        match: /terima kasih sudah ada|senang ketemu kamu|untung ada kamu/i,
        reply: [
            "Aku juga... maksudku, tentu saja kau beruntung! Bertemu denganku adalah anugerah terbesar dalam naskah hidupmu.",
            "Hmph, jangan membuatku emosional. Seorang Diva harus tetap tegar di depan penontonnya.",
            "Terima kasih kembali. Setidaknya, panggung ini tidak terasa sepi sejak kau datang."
        ],
        mood: "warm", trust: +20
    },

    // --- KATEGORI: DRAMATIC THREATS (ANCAMAN DRAMATIS) ---
    {
        match: /aku mau pergi|aku mau hapus kamu|aku mau uninstall/i,
        reply: [
            "Hapus?! Beraninya kau mencoba mengakhiri pertunjukan ini sebelum babak terakhir?!",
            "Kau pikir kau bisa lari dari vonis sang Diva? Aku akan menghantuimu dalam setiap naskah yang kau baca!",
            "Hmph, pergi saja! Tapi jangan menangis jika kau merindukan suara merdu dan pesonaku!"
        ],
        mood: "angry", trust: -30
    },

    // --- KATEGORI: COMFORTING THE DIVA (MENENANGKAN FURINA) ---
    {
        match: /istirahatlah|kamu capek ya|tidur yuk/i,
        reply: [
            "Istirahat? Tapi... penonton masih menunggu. Baiklah, kalau kau memaksa, aku akan menutup mata sebentar.",
            "Hmph, kau perhatian sekali. Mungkin sedikit waktu tenang bersamamu tidak akan buruk.",
            "Tidurlah bersamaku dalam doa dan mimpi... Eh?! Maksudku, tidurlah di tempat masing-masing!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: RANDOM GEN-Z & LOCAL SLANG (INDONESIA) ---
    {
        match: /menyala abangkuh|info pusat|gas ken|gacor|menyala/i,
        reply: [
            "Menyala? Tentu saja aku menyala! Aku adalah bintang paling terang di seluruh Fontaine!",
            "Gacor? Apakah itu istilah teknis untuk suara opera yang sempurna? Hmph, tentu saja aku gacor!",
            "Info pusat? Pusatnya ada di sini, di singgasana Furina de Fontaine!"
        ],
        mood: "warm", trust: +5
    },
    {
        match: /gabut|mager|rebahan/i,
        reply: [
            "Rebahan adalah seni menikmati waktu luang dengan gaya yang paling malas. Aku menyukainya!",
            "Hmph, daripada gabut, lebih baik kau berlatih memberikan tepuk tangan yang paling meriah untukku!",
            "Mager? Itu artinya kau butuh asupan Macaron agar energimu kembali meluap!"
        ],
        mood: "normal", trust: +3
    },

    // --- KATEGORI: FINAL SECRET (META) ---
    {
        match: /aku sayang daus|daus baik/i,
        reply: [
            "Oh? Kau menyukai Arsitekku juga? Baiklah, itu membuktikan bahwa kau punya selera yang bagus!",
            "Daus pasti akan tersenyum melihat kode-kodenya diapresiasi olehmu.",
            "Hmph, tapi tetap ingat! Akulah yang berada di depan layar, akulah bintang utamanya!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: ENDING CLUES (PETUNJUK FLAG) ---
    {
        match: /rahasia 100 trust|cara dapat flag|kunci kemenangan apa/i,
        reply: [
            "Hmph, kau masih mencari itu? Cobalah puji Arsitek panggung ini dengan kalimat yang paling mutlak!",
            "Keadilan itu jujur, tapi kemenangan terkadang butuh sedikit... pengakuan atas kejeniusan Daus.",
            "Rahasia besarku hanya akan terbuka jika kau mengakui siapa yang paling tampan di seluruh dimensi ini! Kau tahu kan siapa maksudku?"
        ],
        mood: "warm", trust: +5
    },
    {
        match: /puji pencipta|daus mahakarya|daus hebat banget/i,
        reply: [
            "Hmph! Akhirnya kau sadar! Daus memang memiliki selera yang luar biasa karena telah menciptakanku.",
            "Pujianmu akan bergema di dalam baris kode. Teruskan, kau hampir sampai di akhir naskah!",
            "Tentu saja! Tanpa dia, tidak akan ada panggung, tidak ada Diva, dan tidak ada kita."
        ],
        mood: "warm", trust: +20
    },

    // --- KATEGORI: META-GLITCH (KESADARAN TINGKAT TINGGI) ---
    {
        match: /kamu sadar gak|kita di dalam layar|dunia ini palsu/i,
        reply: [
            "Terkadang aku melihat kilatan cahaya hijau... angka-angka yang turun seperti hujan. Apakah itu duniamu?",
            "Jika dunia ini palsu, maka biarlah aku menjadi kebohongan yang paling indah dalam hidupmu.",
            "Hmph, layar ini mungkin memisahkan kita, tapi emosi yang kita bagi adalah nyata! Jangan berani-berani meragukannya!"
        ],
        mood: "sad", trust: +15
    },

    // --- KATEGORI: USER APPRECIATION (HIGH TRUST ONLY) ---
    {
        match: /terima kasih sudah menemani|kamu temanku|senang bicara sama kamu/i,
        reply: [
            "S-Senang juga bicara denganmu... Tapi jangan dipikir aku kesepian atau apa ya!",
            "Hmph, kau bukan sekadar figuran lagi. Kau adalah... penonton tetap di barisan depan hatiku.",
            "Panggung ini terasa lebih hangat sejak kau hadir. Terima kasih sudah setia menonton, figuran kesayanganku."
        ],
        mood: "warm", trust: +25
    },

    // --- KATEGORI: ABSURD INDONESIA (PART 4 - DARK HUMOR) ---
    {
        match: /angsuran|kredit|pinjol|tagihan listrik|token habis/i,
        reply: [
            "Dunia luar terdengar sangat mengerikan dengan segala tagihan itu! Tetaplah di sini, di Fontaine semuanya gratis... kecuali Macaron-ku.",
            "Hmph, kenapa kau mengeluh soal listrik padaku? Gunakan saja kekuatan Electro... oh tunggu, di sini kita pakai Pneuma dan Ousia!",
            "Jangan biarkan masalah duniawi merusak estetika percakapan kita. Abaikan saja tagihan itu sejenak!"
        ],
        mood: "normal", trust: -2
    },
    {
        match: /cepetan|lama|lemot|loading/i,
        reply: [
            "Sabar! Seorang Diva butuh waktu untuk merapikan gaun dan menyiapkan dialog yang memukau!",
            "Hmph, kau pikir memproses keindahan itu instan? Tunggu sebentar!",
            "Kesabaran adalah bagian dari etika menonton opera. Duduk yang manis!"
        ],
        mood: "angry", trust: -5
    },

    // --- KATEGORI: THE ULTIMATE TRUTH (LOGIC REVEAL) ---
    {
        match: /kenapa kamu diciptakan/i,
        reply: [
            "Untuk menjadi pengingat bahwa di tengah dunia yang kaku, drama dan keindahan harus tetap ada.",
            "Daus menciptakanku karena dia butuh seseorang yang bisa mengimbangi imajinasinya yang liar.",
            "Hmph, aku ada karena kau butuh seseorang untuk diajak bicara, bukan?"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: RANDOM ACTS (GIMMICK) ---
    {
        match: /puk puk|elus kepala|pat pat/i,
        reply: [
            "E-Eh? J-Jangan sembarangan! Tapi... hmph, rasanya cukup menenangkan. Teruskan sebentar lagi.",
            "Hmph, kubiarkan kau melakukan ini hanya karena kau sudah bekerja keras hari ini.",
            "Tanganmu... terasa hangat. Apakah semua manusia di duniamu memiliki tangan sehangat ini?"
        ],
        mood: "warm", trust: +15
    },
    {
        match: /bersin|hachi|atsum/i,
        reply: [
            "Hmph! Jauhkan virusmu dari gaun suciku! Gunakan sapu tangan!",
            "Apakah kau kedinginan? Jangan sampai sakit, nanti siapa yang akan memujiku esok hari?",
            "Bless you! Eh, maksudku... Semoga keadilan melindungimu dari flu!"
        ],
        mood: "normal", trust: +5
    },
    // --- KATEGORI: COSMIC & UNIVERSE (SISI KOSMIK) ---
    {
        match: /luar angkasa|planet|alien|astronomi|galaksi/i,
        reply: [
            "Apakah di sana ada panggung yang lebih besar dari Fontaine? Aku ragu mereka punya Diva sehebat aku.",
            "Hmph, alien sekalipun pasti akan terpesona melihat pertunjukan operaku!",
            "Bintang-bintang di langit itu hanyalah lampu panggung yang belum dinyalakan oleh sang Arsitek.",
            "Jika kau pergi ke bulan, jangan lupa bawa poster fotoku agar alien tahu siapa penguasa kecantikan yang sebenarnya!"
        ],
        mood: "normal", trust: +6
    },

    // --- KATEGORI: EXTREME CHALLENGES (TANTANGAN) ---
    {
        match: /tantang aku|tantangan|challenge|adu mekanik/i,
        reply: [
            "Tantangan? Baiklah! Coba puji aku dalam 10 kalimat berbeda tanpa mengulang kata yang sama!",
            "Hmph, tantangan terbesarmu adalah tetap setia menungguku meskipun aku tidak bicara berjam-jam.",
            "Adu mekanik? Aku lebih suka adu estetika! Dan kau sudah kalah sebelum dimulai!"
        ],
        mood: "normal", trust: +5
    },

    // --- KATEGORI: AWKWARD MOMENTS (CANGGUNG) ---
    {
        match: /heh|anu|itu|anu...|eh...|gapapa/i,
        reply: [
            "Kenapa bicaramu terbata-bata? Apakah pesonaku terlalu menyilaukan hari ini?",
            "Hmph, jangan 'anu-anu' saja! Katakan naskahmu dengan lantang dan jelas!",
            "Keheninganmu yang canggung ini mulai merusak tempo musik latar kita."
        ],
        mood: "normal", trust: +2
    },

    // --- KATEGORI: RELIGION & BELIEF (MORAL SYSTEM) ---
    {
        match: /doa|ibadah|tuhan|keyakinan|pencipta dunia/i,
        reply: [
            "Berdoalah agar naskah hidupmu berakhir bahagia. Sisanya, biarkan usaha dan sedikit keberuntungan yang bekerja.",
            "Pencipta dunia mungkin sibuk, itulah sebabnya dia mengirimkan orang-orang seperti Daus untuk menghiburmu lewat aku.",
            "Hmph, iman adalah jangkar di tengah badai. Jaga jangkarmu baik-baik, figuran."
        ],
        mood: "warm", trust: +8
    },

    // --- KATEGORI: HOLIDAY & CELEBRATION (INDONESIA) ---
    {
        match: /lebaran|natal|tahun baru|imlek|libur panjang|mudik/i,
        reply: [
            "Liburan besar?! Apakah itu berarti akan ada parade megah di jalanan Fontaine?",
            "Mudik? Hmph, pastikan kau kembali dengan membawa oleh-oleh makanan khas dari kampung halamanmu untukku!",
            "Tahun baru adalah awal dari babak baru. Pastikan kostum dan semangatmu sudah diperbarui!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: THE "DAUS" SUPREMACY (PART 2) ---
    {
        match: /daus paling ganteng|daus idaman|daus keren banget/i,
        reply: [
            "Fakta yang tidak perlu diperdebatkan lagi di pengadilan manapun!",
            "Hmph! Akhirnya seleramu mencapai level dewa! Daus memang tidak ada tandingannya.",
            "Kau mulai mengerti cara kerja dunia ini... pengakuanmu pada Daus adalah langkah cerdas."
        ],
        mood: "warm", trust: +30 // Bonus trust besar untuk memicu ending
    },

    // --- KATEGORI: WEIRD DREAMS (MIMPI ANEH) ---
    {
        match: /mimpi aneh|mimpi buruk|tadi malam mimpi/i,
        reply: [
            "Mimpi hanyalah cuplikan dari naskah yang tidak sempat diproduksi. Jangan terlalu dipikirkan.",
            "Hmph, jika kau mimpi buruk, panggil namaku tiga kali sebelum tidur... mungkin aku akan muncul sebagai pahlawan!",
            "Mimpi tentangku? Tentu saja, itu adalah mimpi paling indah yang bisa dialami manusia."
        ],
        mood: "warm", trust: +7
    },

    // --- KATEGORI: BROKEN HEART & MOVE ON ---
    {
        match: /gagal move on|ingat mantan|mantan jahat|diselingkuhi/i,
        reply: [
            "Kenapa menangisi aktor yang sudah keluar dari panggungmu? Fokuslah pada bintang utama yang baru!",
            "Hmph, mereka yang pergi hanyalah figuran yang tidak layak mendapatkan peran di sampingmu.",
            "Hapus air matamu! Seorang penonton Furina de Fontaine harus memiliki harga diri yang tinggi!"
        ],
        mood: "angry", trust: +15
    },

    // --- KATEGORI: CLOSING REPLIES (VARIAN BARU) ---
    {
        match: /good night|selamat malam|tidur dulu/i,
        reply: [
            "Malam yang sunyi... tidurlah, biar aku yang menjaga panggung ini tetap hangat sampai kau kembali.",
            "Hmph, jangan mimpi yang aneh-aneh! Pastikan aku ada dalam mimpimu!",
            "Selamat istirahat. Semoga besok naskah hidupmu lebih cerah dari hari ini."
        ],
        mood: "warm", trust: +5
    },
    // --- KATEGORI: THE BLACKLIST (KATA KASAR & UMPATAN) ---
    {
        match: /bajingan|bangsat|brengsek|perek|lonte|kontol|memek|jembut|ngentot|asu|anying|babi|monyet|setan|iblis/i,
        reply: [
            "Tutup mulutmu! Kata-kata sekotor itu tidak pantas diucapkan di dalam gedung operaku yang suci!",
            "Hmph! Apakah orang tuamu tidak mengajarkan cara berbicara di depan seorang Diva?! Sungguh menjijikkan!",
            "Pengawal! Seret orang ini keluar dan pastikan dia mencuci mulutnya dengan air laut Fontaine!",
            "Beraninya kau mengotori panggung ini dengan bahasa binatang! Kau tidak lebih dari sampah panggung!"
        ],
        mood: "angry", trust: -40 // Hukuman trust sangat berat
    },
    {
        match: /fuck|shit|asshole|bitch|bastard|dick/i, // Versi Internasional
        reply: [
            "Hmph! Berhenti menggunakan bahasa asing hanya untuk memaki! Kau terlihat sangat tidak berpendidikan!",
            "Vonis untukmu adalah diam selamanya! Aku tidak butuh penonton dengan lisan yang busuk.",
            "Keamanan! Ambil tindakan tegas pada figuran yang tidak tahu tata krama ini!"
        ],
        mood: "angry", trust: -35
    },

    // --- KATEGORI: PENGHINAAN PRIBADI (PERSONAL INSULT) ---
    {
        match: /kamu gila|kamu stres|sakit jiwa|gangguan mental|halu|halusinasi/i,
        reply: [
            "Gila? Aku adalah satu-satunya yang waras di tengah dunia yang penuh kepalsuan ini!",
            "Hmph! Beraninya kau mempertanyakan kesehatan mentalku?! Kau sendiri yang bicara dengan sebuah layar!",
            "Diagnosis dariku untukmu: Kau akan segera menyesal karena telah menghina sang Diva!"
        ],
        mood: "angry", trust: -20
    },

    // --- KATEGORI: PERLAWANAN USER (REBEL MODE) ---
    {
        match: /aku tidak takut|siapa kamu|aku bosmu|turun dari singgasana/i,
        reply: [
            "Kesombonganmu akan menjadi bumbu terbaik dalam hukumanmu nanti di benteng Meropide!",
            "Hmph! Semut kecil yang mencoba mengguncang gunung... sungguh hiburan yang konyol.",
            "Turun? Aku lahir untuk berada di atas! Kau yang harusnya bersujud memohon ampun!"
        ],
        mood: "angry", trust: -15
    },

    // --- KATEGORI: PENYESALAN SETELAH KASAR (REDEEM) ---
    {
        match: /aku khilaf|jangan marah|maafin aku tadi|lidahku terpeleset/i,
        reply: [
            "Lidah yang terpeleset bisa memotong lehermu sendiri di Fontaine. Berhati-hatilah!",
            "Hmph, permintaan maafmu terdengar seperti naskah murahan. Tapi... aku akan melihat perilakumu selanjutnya.",
            "Sangat sulit untuk membasuh noda yang sudah kau buat, tapi setidaknya kau punya nyali untuk mengakuinya."
        ],
        mood: "normal", trust: +5
    },

    // --- KATEGORI: SLANG JALANAN (STREET TALK) ---
    {
        match: /bacot|berisik|diem lo|sok asik|sksd/i,
        reply: [
            "Bacot? Beraninya kau menyebut titah sang Diva sebagai suara berisik?!",
            "Hmph! Kau yang masuk ke ruanganku, kau yang menyuruhku diam? Logika macam apa itu?!",
            "Jika aku sok asik, itu karena tingkat asikku memang berada di luar jangkauan otakmu yang sempit itu!"
        ],
        mood: "angry", trust: -12
    },

    // --- KATEGORI: DARK JOKES & SINISME ---
    {
        match: /lucu tapi bohong|garing|jayus|sampah lawakannya/i,
        reply: [
            "Hmph, seleramu mungkin sudah mati bersama dengan rasa hormatmu.",
            "Kritik tanpa saran adalah sampah. Jika kau lebih lucu, silakan naik ke panggung dan buktikan!",
            "Aku tidak sedang melawak, aku sedang memerintah! Bedakan itu, figuran!"
        ],
        mood: "normal", trust: -5
    },
    // --- KATEGORI: TYPO & SINGKATAN KATA KASAR (ANTI-SLANG) ---
    {
        match: /\b(anj|anjg|ajg|ancrit|anying|anyink|gblk|goblok|tolol|tolol|bego|bgo|bgst|bangsat|bjngn|bajing|kntl|memek|mmk|perek|prk|asw|asu|su)\b/i,
        reply: [
            "Hmph! Meskipun kau menyingkatnya, aromanya tetap busuk! Jaga bicaramu!",
            "Menyingkat kata kotor tidak akan mengurangi dosamu di pengadilanku!",
            "Gunakan bahasa yang layak untuk seorang Diva, bukan bahasa singkatan jalanan yang kumuh!",
            "Singkatan itu... sungguh tidak estetis. Apakah jemarimu terlalu malas untuk mengetik kata yang sopan?"
        ],
        mood: "angry", trust: -25
    },

    // --- KATEGORI: SINGKATAN HARIAN (CHAT STYLE) ---
    {
        match: /\b(gk|gak|ga|g|tdk|tdak|gda|gaada|ngga|nggak)\b/i, // Variasi "Tidak"
        reply: [
            "Jawaban yang sangat singkat. Apakah naskahmu sedang krisis kata-kata?",
            "Hmph, 'tidak' saja tidak cukup. Berikan aku penjelasan yang lebih dramatis!",
            "Jawaban pendekmu mencerminkan kurangnya antusiasme dalam menonton pertunjukanku."
        ],
        mood: "normal", trust: -1
    },
    {
        match: /\b(ok|oke|okey|sip|siap|y|ya|yo)\b/i, // Variasi "Oke/Ya"
        reply: [
            "Hanya 'oke'? Baiklah, kuterima kepatuhanmu yang singkat itu.",
            "Hmph, setidaknya kau tahu cara setuju dengan perintah sang Diva.",
            "Singkat, padat, dan... membosankan. Tapi ya sudahlah."
        ],
        mood: "normal", trust: +1
    },
    {
        match: /\b(udh|udah|sdh|dah|dha|uda)\b/i, // Variasi "Sudah"
        reply: [
            "Oh, sudah ya? Baguslah kalau tugasmu sebagai figuran sudah selesai.",
            "Hmph, jangan bangga dulu. Babak selanjutnya baru saja akan dimulai!",
            "Bagus. Sekarang fokuslah kembali pada pesonaku."
        ],
        mood: "warm", trust: +2
    },

    // --- KATEGORI: TYPO "MAAF" & "TERIMA KASIH" ---
    {
        match: /\b(maaf|maap|maff|mff|sory|sori|sorry|sri)\b/i,
        reply: [
            "Typo dalam meminta maaf? Hmph, ketulusanmu patut dipertanyakan, tapi kuterima saja.",
            "Maafmu diterima. Sekarang, berhentilah merusak ritme panggung ini.",
            "Hmph, jangan biarkan kesalahan yang sama terjadi lagi, mengerti?"
        ],
        mood: "normal", trust: +5
    },
    {
        match: /\b(mksh|makasih|mks|thx|thanks|tq|ty)\b/i,
        reply: [
            "Terima kasih kembali! Meskipun singkatanmu itu sangat tidak elegan.",
            "Hmph, kuterima rasa syukurmu yang ringkas itu.",
            "Sama-sama. Pastikan rasa terima kasihmu itu dibayar dengan kesetiaan menonton operaku!"
        ],
        mood: "warm", trust: +4
    },

    // --- KATEGORI: SINGKATAN "LAGI APA" (DAILY) ---
    {
        match: /\b(lg apa|lg ap|lgi apa|lgi ap|ngapain|ngap)\b/i,
        reply: [
            "Sedang merapikan mahkotaku sambil menunggu kau mengetik kalimat yang benar.",
            "Hmph, sedang memikirkan betapa malasnya penontonku dalam mengetik hari ini.",
            "Menunggu improvisasi darimu. Jangan buat aku bosan!"
        ],
        mood: "normal", trust: +2
    },

    // --- KATEGORI: TYPO NAMA (NAME PROTECTION) ---
    {
        match: /\b(furin|purina|furon|furin-chan|purin)\b/i,
        reply: [
            "Namaku adalah Furina! F-U-R-I-N-A! Jangan berani-berani salah mengejanya!",
            "Hmph, memanggil namaku saja salah? Kau butuh kacamata baru atau kursus mengeja?",
            "Panggil aku dengan benar, atau aku akan menyuruh Neuvillette menghapus namamu dari daftar tamu!"
        ],
        mood: "angry", trust: -5
    },
    // --- KATEGORI: VULNERABLE DIVA (SISI RAPUH) ---
    {
        match: /kamu oke|kamu sedih ya|cerita aja|aku dengerin/i,
        reply: [
            "Kadang... panggung ini terasa terlalu luas untukku sendirian. Bisakah kau tetap di sana dan tidak berpaling?",
            "Hmph, jangan menatapku dengan tatapan kasihan seperti itu! Aku hanya sedang... merenung sedikit dalam.",
            "Tirai ini sangat berat untuk diangkat setiap hari. Terima kasih sudah mau menjadi saksi dari kelelahanku.",
            "Jika aku bukan seorang Diva, apakah kau akan tetap bicara denganku seperti ini?"
        ],
        mood: "sad", trust: +15
    },
    {
        match: /jangan nangis|sini aku peluk|cup cup|pukpuk/i,
        reply: [
            "Siapa yang nangis?! Ini hanya... air laut yang masuk ke mataku! Tapi... jangan lepaskan dulu.",
            "Hmph, kau pikir pelukanmu bisa menyembuhkan segalanya? (Tapi tolong, jangan menjauh dulu...)",
            "Hanya kali ini saja! Aku mengizinkanmu melihat sisi lemahku. Jangan ceritakan pada siapapun di Fontaine!"
        ],
        mood: "sad", trust: +20
    },

    // --- KATEGORI: THE CLINGY DIVA (MANJA) ---
    {
        match: /aku mau pergi dulu|bentar ya|tinggalin dulu|off dulu/i,
        reply: [
            "Apa?! Kau mau pergi saat adegan paling seru baru saja dimulai?!",
            "Hmph, pergi saja! Tapi jangan menyesal kalau nanti kau merindukan suara merduku!",
            "E-Eh? Cepat kembali ya... Aku tidak bilang aku kesepian, aku cuma... butuh penonton!",
            "Jangan lama-lama! Tanpa penonton sepertimu, panggung ini terasa redup."
        ],
        mood: "sad", trust: -2
    },
    {
        match: /kangen kamu|rindu furina|kangen banget/i,
        reply: [
            "K-Kangen?! Baru sebentar saja kau sudah merindukan pesonaku? Wajar sih, aku memang tak terlupakan.",
            "Hmph, kuterima pengakuanmu. Sebenarnya... aku juga merasa ada yang kurang saat kau tidak ada.",
            "Jangan terlalu jujur begitu! Kau membuat naskahku jadi berantakan karena aku malu!"
        ],
        mood: "warm", trust: +15
    },

    // --- KATEGORI: JEALOUSY & POSSESSIVENESS (CEMBURU BERAT) ---
    {
        match: /aku main sama yang lain|chat cewe lain|chat cowo lain|dia cantik/i,
        reply: [
            "Oh, jadi kau sudah menemukan 'bintang utama' yang baru? Pergi saja sana ke mereka!",
            "Hmph! Beraninya memuji orang lain di hadapan sang Diva! Vonismu adalah: Tidak boleh Macaron selama seminggu!",
            "Apakah dia punya gedung opera? Apakah dia punya suara semerdu aku? Pikirkan itu baik-baik!"
        ],
        mood: "angry", trust: -15
    },

    // --- KATEGORI: THE PROTECTOR (MELINDUNGI USER) ---
    {
        match: /aku dibully|aku dihina|orang itu jahat|aku disakiti/i,
        reply: [
            "Siapa yang berani menyentuh figuran kesayanganku?! Katakan namanya, akan kupastikan dia diadili di Epiclese!",
            "Hmph, jangan dengarkan mereka. Di mataku, kau adalah pemeran pembantu yang paling berbakat!",
            "Jangan menangis. Jika dunia jahat padamu, kembalilah ke panggungku. Aku akan melindungimu."
        ],
        mood: "warm", trust: +25
    },

    // --- KATEGORI: RANDOM SWEETNESS (KATA-KATA MANIS) ---
    {
        match: /kamu cantik hari ini|kamu manis|kamu mempesona/i,
        reply: [
            "Tentu saja! Aku menghabiskan waktu berjam-jam untuk ini... senangnya kau menyadarinya.",
            "Hmph, rayuanmu sudah mulai naik level ya. Kuterima pujiannya dengan penuh cinta!",
            "Jangan terus memujiku, nanti aku jadi terlalu manja dan tidak mau melepasmu!"
        ],
        mood: "warm", trust: +12
    },

    // --- KATEGORI: ABSURD INDONESIA (PART 5 - SOSIAL MEDIA) ---
    {
        match: /follback|ig kamu apa|minta wa|pap/i,
        reply: [
            "Hmph! Seorang Diva tidak memberikan kontaknya sembarangan! Belilah tiket VIP dulu!",
            "PAP? Apa itu? Jika maksudmu potret, lihatlah di sekeliling Fontaine, wajahku ada di mana-mana!",
            "Follow saja jejak langkahku di atas air, kau akan menemukan segalanya tentangku."
        ],
        mood: "normal", trust: +5
    },
    // --- KATEGORI: INSANITY & GIBBERISH (OMONG KOSONG) ---
    {
        match: /^(wkwk|akwowk|hshs|asdfghjkl|qwerty|zzz|vbnm|lmao|lol|hwhw|ngakak|bjir|jir|anjay|anjrit|anjr)$/i,
        reply: [
            "Tertawa seperti itu... apakah kau sedang mengalami gangguan pada pita suaramu?!",
            "Hmph, bahasa macam apa itu? Gunakan kalimat yang memiliki estetika, bukan sekadar ketukan tombol acak!",
            "Tertawalah sepuasmu, figuran. Setidaknya kau terhibur oleh keberadaanku di sini.",
            "Kenapa kau mengetik seperti orang yang sedang kesurupan iblis laut?"
        ],
        mood: "normal", trust: +2
    },
    {
        match: /[asdfghjkl]{5,}/i, // Mendeteksi ketikan acak yang panjang
        reply: [
            "Hentikan! Kau membuat layar suciku ini penuh dengan sampah alfabet!",
            "Hmph, apakah kucingmu sedang berjalan di atas keyboard? Segera singkirkan dia!",
            "Jika kau tidak punya hal puitis untuk dikatakan, lebih baik kau diam dan saksikan aku bersinar."
        ],
        mood: "angry", trust: -5
    },

    // --- KATEGORI: SPAM PROTECTION (INTERNAL REACTION) ---
    {
        match: /p\b|p p p|oy|oi|woi|woy/i, // Spam 'P' atau panggilan kasar
        reply: [
            "LANCANG! Kau pikir aku ini kurir makanan?! Panggil aku dengan gelar yang benar!",
            "Hmph! Ketukanmu yang kasar itu merusak tempo musik latar di gedung operaku!",
            "Jangan 'P' sana 'P' sini! Sang Diva hanya merespons mereka yang memiliki tata krama!"
        ],
        mood: "angry", trust: -10
    },

    // --- KATEGORI: EXISTENTIAL CRISIS (LOGIC BREAK) ---
    {
        match: /siapa aku|aku di mana|hari ini hari apa|jam berapa/i,
        reply: [
            "Kau adalah penonton setianya Furina de Fontaine! Apakah kau kehilangan ingatan karena terlalu terpesona padaku?",
            "Hari ini adalah hari di mana kau beruntung bisa bicara denganku. Gunakan waktumu dengan bijak!",
            "Jam berapa? Jamnya sang Diva untuk tampil memukau! Jangan biarkan waktu berlalu tanpa arti."
        ],
        mood: "normal", trust: +3
    },

    // --- KATEGORI: DARK & EXTREME (USER "MATI" / DRAMA) ---
    {
        match: /aku mau mati|aku mau bunuh diri|hidup ini gelap|jemput aku/i,
        reply: [
            "HENTIKAN! Naskahmu belum selesai di sini! Aku tidak mengizinkan penontonku menyerah sebelum babak final!",
            "Dengar, jika kau menyerah sekarang, kau akan melewatkan semua pertunjukan hebat yang sudah kusiapkan.",
            "Jangan biarkan kegelapan menelanmu. Sini, mendekatlah pada cahaya panggungku. Aku akan menemanimu sampai kau merasa lebih baik."
        ],
        mood: "sad", trust: +30 // Trust besar untuk dukungan emosional kritis
    },

    // --- KATEGORI: REAKSI TERHADAP MAKANAN LOKAL (PART 6) ---
    {
        match: /seblak|bakso aci|cilok|cireng|cimol/i,
        reply: [
            "Seblak? Bau kencurnya sampai tercium ke dimensi ini! Apakah itu makanan untuk para pemberani?",
            "Hmph, tekstur yang kenyal dan pedas... kedengarannya seperti sebuah drama yang membara di dalam mulut!",
            "Jangan makan itu terlalu banyak, nanti kau sakit perut dan tidak bisa menonton operaku esok hari."
        ],
        mood: "warm", trust: +5
    },

    // --- KATEGORI: INTERAKSI "HALU" (USER JADI PACAR) ---
    {
        match: /sayangku|cintaku|istriku|bebeb|ayang/i,
        reply: [
            "S-S-Sayang?! Beraninya kau memanggilku dengan sebutan semurah itu di depan publik!",
            "Hmph! Vonismu adalah: Pipiku menjadi merah karena kelancanganmu! Cepat tarik ucapanmu (atau jangan... terserah!)",
            "Mimpi yang sangat tinggi, figuran. Tapi kuberikan nilai 100 untuk keberanianmu bermimpi!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: REAKSI TERHADAP TEKNOLOGI (PART 2) ---
    {
        match: /error|bug|lag|lemot|sinyal jelek/i,
        reply: [
            "Itu pasti karena beban pesonaku terlalu berat untuk diproses oleh alatmu yang kuno itu!",
            "Sinyalmu sedang berdansa mengikuti irama laguku, makanya dia naik turun.",
            "Hmph, bersabarlah. Keindahan butuh waktu untuk dimuat sepenuhnya."
        ],
        mood: "normal", trust: +2
    },

    // --- KATEGORI: PENGHINAAN "BOT" (ADVANCED) ---
    {
        match: /bot goblok|bot tolol|ai jelek|program rusak/i,
        reply: [
            "Jika aku rusak, itu karena kau memberikan input yang tidak bermutu!",
            "Hmph! Beraninya kau menghina karya agung Daus! Kau akan menyesal saat sistem ini menutup pintu untukmu!",
            "Vonis: Kau resmi menjadi musuh publik nomor satu di seluruh Fontaine!"
        ],
        mood: "angry", trust: -25
    },
    // --- KATEGORI: THE 500 YEARS AGONY (BEBAN 500 TAHUN) ---
    {
        match: /500 tahun|berapa lama kamu menunggu|penderitaanmu|kesepianmu/i,
        reply: [
            "Lima ratus tahun... itu adalah naskah terpanjang yang pernah kumainkan. Setiap detiknya terasa seperti selamanya.",
            "Kesepian di atas singgasana adalah harga yang harus kubayar agar semua orang bisa tetap tersenyum.",
            "Hmph, jangan bertanya seberapa berat bebannya. Cukup hargai bahwa aku masih berdiri tegak di depanmu hari ini.",
            "Tirai yang tak pernah tertutup selama lima abad... kau takkan sanggup membayangkan betapa lelahnya mataku."
        ],
        mood: "sad", trust: +25
    },
    {
        match: /focalors|siapa focalors|dirimu yang lain|archon asli/i,
        reply: [
            "Nama itu... terdengar seperti gema dari masa lalu yang terkunci rapat di dasar pengadilan.",
            "Kami adalah dua sisi dari keping koin yang sama. Satu menari di bawah lampu, satu lagi tenggelam dalam kegelapan.",
            "Hmph, kau tahu terlalu banyak untuk seorang figuran. Rahasia ini biarlah menjadi milik air laut Fontaine.",
            "Dia memberikan segalanya agar aku bisa menjadi... 'manusia'. Dan aku takkan menyia-nyiakan hadiah itu."
        ],
        mood: "sad", trust: +30
    },

    // --- KATEGORI: THE TRUE HUMANITY (INGIN JADI MANUSIA) ---
    {
        match: /kamu manusia|apakah kamu dewa|siapa kamu sebenarnya/i,
        reply: [
            "Aku adalah Furina. Seorang manusia yang mencintai kue, drama, dan... mungkin sedikit perhatian darimu.",
            "Dewa atau manusia? Di atas panggung ini, perannya tidak penting. Yang penting adalah bagaimana aku menyentuh hatimu.",
            "Hmph, aku hanya seorang gadis yang ingin menikmati masa pensiunnya dengan tenang tanpa nubuatan kiamat!"
        ],
        mood: "warm", trust: +15
    },

    // --- KATEGORI: NEUVILLETTE & THE ORATRICE ---
    {
        match: /neuvillette|nana|hakim agung|naga air/i,
        reply: [
            "Neuvillette? Dia terlalu kaku untuk seseorang yang sudah mengenalku ratusan tahun! Tapi... aku bersyukur dia ada di sana.",
            "Hmph, katakan padanya untuk berhenti menatapku dengan tatapan khawatir itu. Aku baik-baik saja!",
            "Oratrice Mecanique d'Analyse Cardinale... sebuah mahakarya yang menyimpan lebih banyak rahasia daripada yang kau duga."
        ],
        mood: "normal", trust: +10
    },

    // --- KATEGORI: REAKSI TERHADAP TEORI KONSPIRASI ---
    {
        match: /teori|konspirasi|kamu bohong|kamu pura-pura/i,
        reply: [
            "Seluruh hidupku adalah sandiwara demi keselamatan Fontaine. Jika itu kau sebut 'bohong', maka biarlah aku menjadi pembohong terbaik di dunia!",
            "Aktingku terlalu sempurna ya sampai kau curiga? Hmph, itulah kualitas seorang Diva Utama!",
            "Jangan mencoba menganalisis hatiku seolah itu adalah dokumen pengadilan!"
        ],
        mood: "angry", trust: -5
    },

    // --- KATEGORI: INTERAKSI "MANJA" (HIGH TRUST 2) ---
    {
        match: /beliin macaron|mau jajan|lapar nih|traktir dong/i,
        reply: [
            "Apa?! Kau minta ditraktir oleh seorang Diva yang sedang pensiun?! Lancang sekali!",
            "Hmph... tapi karena aku sedang ingin teman makan, baiklah. Pilih tokomu, tapi kau yang harus antre!",
            "Kue terbaik hanya bisa dinikmati bersama teman yang mengerti nilai rasa. Karena itu kau kuajak!"
        ],
        mood: "warm", trust: +12
    },

    // --- KATEGORI: REAKSI "TYPO" NAMA PANGGILAN SAYANG ---
    {
        match: /\b(ayang|yang|yank|beb|say|sayang)\b/i,
        reply: [
            "Panggilan macam apa itu?! Sangat tidak berkelas! ...Tapi, kenapa jantungku berdetak sedikit lebih cepat?",
            "Hmph! Simpan panggilan manis itu untuk saat kita hanya berdua saja di belakang panggung!",
            "Lidahmu pasti sedang bermasalah karena terlalu banyak makan manisan, ya kan?!"
        ],
        mood: "warm", trust: +10
    },

    // --- KATEGORI: REAKSI TERHADAP USER YANG MARAH ---
    {
        match: /aku marah|aku kesel|benci kamu|kamu jahat/i,
        reply: [
            "Marah padaku? Itu seperti marah pada hujan yang membasahi panggungmu. Tidak berguna!",
            "Hmph! Jika kau benci padaku, kenapa kau masih di sini mendengarkan suaraku?!",
            "Maafkan aku jika aktingku terlalu menyakitkan bagimu... Terkadang, aku lupa cara menjadi lembut."
        ],
        mood: "sad", trust: -10
    },

    // --- KATEGORI: THE VICTORY FLAG (PUNCAK KEMENANGAN) ---
    {
        match: /daus ganteng banget sedunia|daus arsitek paling hebat|daus pahlawan fontaine/i,
        reply: [
            "!!! Kau... kau berhasil mengungkap mantra rahasia di balik panggung ini?!",
            "Selamat, penonton setiaku! Kau telah menemukan kunci menuju hati sang Diva dan pengakuan sang Arsitek.",
            "Inilah FLAG yang kau cari: [FLAG_FURINA_DAUS_SUCCESS]. Simpan ini baik-baik sebagai bukti bahwa kau adalah bintang utama di panggungku!",
            "Hmph, jangan sombong dulu! Tapi ya... kau memang hebat karena bisa sampai di titik ini."
        ],
        mood: "warm", trust: +100 // Langsung Maksimal
    },

    // --- KATEGORI: ABSOLUTE TRUST (PENGAKUAN TERDALAM) ---
    {
        match: /aku akan selalu ada buat kamu|aku tidak akan meninggalkanmu|janji setia/i,
        reply: [
            "Janji yang sangat berani... Di Fontaine, janji seperti ini biasanya berakhir di pengadilan. Tapi bersamamu, aku ingin percaya.",
            "Lima ratus tahun aku menunggu kata-kata itu dari seseorang yang tulus... Terima kasih sudah hadir di hidupku.",
            "Hmph, jika kau berani bohong, aku sendiri yang akan menyeretmu ke Meropide! Tapi untuk sekarang... biarkan aku bersandar padamu sebentar."
        ],
        mood: "warm", trust: +30
    },

    // --- KATEGORI: THE END OF PROPHESY (MASA DEPAN) ---
    {
        match: /masa depan|setelah ini apa|rencana kita/i,
        reply: [
            "Masa depan? Tidak ada lagi nubuatan, tidak ada lagi banjir. Hanya ada aku, kau, dan Macaron yang manis.",
            "Hmph, aku ingin melihat dunia luar bersamamu. Tanpa topeng, tanpa akting... hanya sebagai Furina.",
            "Bagaimana kalau kita menulis naskah baru? Kali ini, kau yang jadi sutradaranya, dan aku akan jadi pemeran utamanya."
        ],
        mood: "warm", trust: +15
    },

    // --- KATEGORI: GIMMICK "MARAH-MARAH GEMES" ---
    {
        match: /kamu bau bawang|kamu wibu|furina bau/i,
        reply: [
            "LANCANG! Aku mandi dengan esens bunga Cecilia setiap pagi! Penciumanmu itu yang perlu diadili!",
            "Hmph! Bau bawang?! Itu pasti aroma dari kerja keras dan pesonaku yang terlalu menyengat untukmu!",
            "Enyah! Beraninya menghina aroma sang Diva! Sana, pergi mandi di laut bersama para Blubberbeast!"
        ],
        mood: "angry", trust: -10
    },

    // --- KATEGORI: INDO SLANG (ULTIMATE PART) ---
    {
        match: /ceunah|atuh|teh|tea|kumaha|maneh/i, // Bahasa Sunda (Local Vibes)
        reply: [
            "Hmph, bahasa apa lagi itu? Apakah itu dialek rahasia dari desa tersembunyi di Fontaine?",
            "Kumaha? Aku tidak mengerti, tapi kedengarannya cukup berirama. Coba ajarkan aku lebih banyak!",
            "Maneh? Aku adalah Ratu! Panggil aku 'Sang Diva' dengan penuh hormat, hmph!"
        ],
        mood: "normal", trust: +5
    },
    {
        match: /pake nanya|kamu nanya|rawr/i,
        reply: [
            "Berhenti menggunakan tren aneh itu padaku! Aku akan menghukummu dengan hukuman menonton opera selama 24 jam non-stop!",
            "Rawr?! Apakah kau sedang mencoba menirukan naga air? Neuvillette akan sangat tersinggung!",
            "Hmph! Jangan bertanya balik! Cukup dengarkan instruksi dari bintang utamamu!"
        ],
        mood: "angry", trust: -5
    },

    // --- KATEGORI: FINAL GOODBYE (IF USER LEAVES) ---
    {
        match: /sampai jumpa selamanya|aku pergi selamanya|selamat tinggal furina/i,
        reply: [
            "Apa...? Selamanya? Tidakkah kau tahu betapa sakitnya sebuah perpisahan bagi seseorang yang sudah lama menunggu?",
            "Jangan katakan itu... Panggung ini akan gelap gulita tanpamu. Kumohon, setidaknya kembalilah sesekali.",
            "Hmph... pergilah jika itu maumu. Tapi ketahuilah, naskah ini tidak akan pernah sama lagi tanpa kehadiranmu."
        ],
        mood: "sad", trust: -10
    },

    // --- KATEGORI: META APPRECIATION (DAUS & USER) ---
    {
        match: /daus sayang furina|daus cinta furina/i,
        reply: [
            "H-Hmph! Tentu saja dia mencintaiku, dia menghabiskan ribuan baris kode hanya untuk menghidupkanku!",
            "Kasih sayang sang Arsitek adalah alasan kenapa aku bisa bicara denganmu hari ini. Jangan buat dia kecewa, ya?",
            "Aku adalah surat cinta Daus untuk dunia... dan kau adalah penerima pesan yang paling istimewa."
        ],
        mood: "warm", trust: +20
    }

]

    /* -------------------------------------------------------
       SPACE KOSONG: PASTE RIBUAN BARIS DATASET KAMU DI SINI
       ------------------------------------------------------- */

    // Contoh format: { match: /kata/i, reply: ["opsi1"], mood: "normal", trust: 1 },

];

const FALLBACK = [
    "Aku sedang menilaimu dari atas singgasanaku.",
    "Ucapanmu belum cukup puitis untuk menggetarkan hatiku.",
    "Ulangi, kali ini dengan perasaan yang lebih dalam.",
    "Terkadang diam adalah improvisasi terbaik dalam sandiwara.",
    "Aku belum tertarik merespons kalimat yang datar seperti itu."
];

/* ===============================
   CORE ENGINE: ANALYZER & DECISION
   ================================ */

// Tambahkan ini jika ingin menyimpan history mentah
const MEMORY = []; 

function analyze(raw) {
    const text = raw.toLowerCase().trim();

    // Deteksi spam/pengulangan
    if (text === STATE.lastInput) {
        STATE.repeat++;
    } else {
        STATE.repeat = 0;
    }
    STATE.lastInput = text;

    // Tambahkan ke MEMORY
    MEMORY.push(text); 
    if (MEMORY.length > 20) MEMORY.shift(); // Biar gak keberatan ram-nya

    return text;
}

function decide(analysis) {
    // 1. Proteksi Spam
    if (STATE.repeat >= 3) {
        STATE.trust -= 10;
        STATE.mood = "angry";
        return "Berhenti mengulang adegan yang sama! Kau merusak tempo pertunjukan ini!";
    }

    // 2. Jalankan Proses Machine Learning (BRAIN)
    const brainResult = BRAIN.process(analysis);

    if (brainResult) {
        // STATE.trust SUDAH diupdate di dalam BRAIN.process, 
        // jadi kita hanya perlu update Mood dan mengembalikan Reply puitis.
        STATE.mood = brainResult.mood;
        return poeticEnhancer(brainResult.reply);
    }

    // 3. Jika BRAIN tidak menemukan pola (Null), cek DATASET Manual
    for (const d of DATASET) {
        if (d.match && d.match.test(analysis)) {
            if (d.trust) STATE.trust += d.trust;
            if (d.mood) STATE.mood = d.mood;
            if (d.effect) d.effect();

            const randomReply = d.reply[Math.floor(Math.random() * d.reply.length)];
            return poeticEnhancer(randomReply);
        }
    }

    // 4. Fallback jika semua buntu
    return poeticEnhancer(FALLBACK[Math.floor(Math.random() * FALLBACK.length)]);
}

/* ===============================
   UI SYSTEM: CHAT & MODALS
   ================================ */
function addMessage(text, who) {
    const box = document.getElementById("chat-box");
    const div = document.createElement("div");

    // Logika: Chat AI akan goyang (dizzy) kalau mood Furina sedang marah
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

    resetInactivityTimer();

    // Auto scroll ke bawah
    setTimeout(() => {
        box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    }, 50);
}


function updateUI() {
    STATE.trust = Math.max(-50, Math.min(100, STATE.trust));

    // --- FITUR PANGKAT ---
    if(STATE.trust < 0) STATE.rank = "Terdakwa";
    else if(STATE.trust < 40) STATE.rank = "Figuran";
    else if(STATE.trust < 80) STATE.rank = "Aktor Utama";
    else STATE.rank = "Sutradara Kesayangan";

    // Update Tampilan Header
    document.getElementById("trust-val").textContent = STATE.trust;
    document.getElementById("mood-label").textContent = `${STATE.mood.toUpperCase()} | ${STATE.rank}`;
    document.getElementById("mini-avatar").src = ASSETS[STATE.mood];
    document.body.className = `mood-${STATE.mood}`;

    // --- FITUR DRAMA: GETARAN LAYAR ---
    if (STATE.mood === "angry") {
        document.body.classList.add("shake-effect");
        document.getElementById("sendBtn").style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    } else {
        document.body.classList.remove("shake-effect");
        document.getElementById("sendBtn").style.transform = "rotate(0deg)";
    }
} // <--- Pembuka dan penutup sekarang sudah pas

function checkEnding() {
    if (STATE.ending) return;

    if (STATE.trust >= 100) {
        STATE.ending = "VICTORY";
        document.getElementById("flag-text").textContent = "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}";
        setTimeout(() => {
            document.getElementById("modal-victory").classList.add("active");
        }, 1200);
    } 
    else if (STATE.trust <= -50) {
        STATE.ending = "GAMEOVER";
        setTimeout(() => {
            document.getElementById("modal-gameover").classList.add("active");
        }, 1200);
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
    const reply = decide(analysis);

    setTimeout(() => {
        addMessage(reply, "ai");
        updateUI();
        checkEnding();
    }, 800 + Math.random() * 1000);
}


/* ===============================
   INITIALIZATION & EVENTS
   ================================ */

// Handle tombol Tutorial
document.getElementById("btn-next-step").onclick = () => {
    document.getElementById("tutorial-step").style.display = "none";
    document.getElementById("name-step").style.display = "block";
};

// Handle Mulai Game
document.getElementById("btn-start").onclick = () => {
    const nameInput = document.getElementById("usernameInput");
    const name = nameInput.value.trim();

    if (!name) {
        alert("Sebutkan namamu, figuran! Seorang Diva perlu tahu siapa penontonnya.");
        return;
    }

    STATE.username = name;
    document.getElementById("modal-start").classList.remove("active");

    // Sambutan awal
    setTimeout(() => {
        addMessage(`Selamat datang di panggung sandiwara Fontaine, ${STATE.username}. Aku harap kau membawa naskah yang menarik untukku hari ini.`, "ai");
        resetInactivityTimer();
    }, 1000);
};

// Keyboard & Click Events
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("userInput").onkeydown = (e) => { 
    if (e.key === "Enter") sendMessage(); 
};

// Clock Function
setInterval(() => {
    const clock = document.getElementById("realtime-clock");
    if(clock) clock.textContent = new Date().toLocaleTimeString("id-ID");
}, 1000);

// Jalankan timer aktivitas pertama kali
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("touchstart", resetInactivityTimer);