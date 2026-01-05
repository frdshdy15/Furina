"use strict";

/* ===============================
   GLOBAL STATE & ASSETS
   ================================ */
const STATE = {
    username: null,
    trust: 20,
    mood: "normal",
rank: "Figuran", // Fitur Baru: Pangkat
    ending: null,
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
   ADVANCED ML ENGINE: THE SUPER BRAIN
   =============================== */
const BRAIN = {
    // Memory jangka pendek untuk melacak perilaku user
    context: {
        lastIntent: null,
        aggressiveCount: 0,
        mentionDausCount: 0,
        complimentCount: 0,
        isCrying: false,
        topicHistory: []
    },

    // 1. INTENT CLASSIFIER (Deteksi Niat Super Detail)
    classifyIntent(text) {
        // A. Detection: Asal-Usul Creator (Daus)
        if (/(daus|pembuat|developer|sutradara).*(orang mana|asal|tinggal|rumah|siapa|lahir)/i.test(text)) {
            this.context.mentionDausCount++;
            return "CREATOR_ORIGIN";
        }
        
        // B. Detection: Ajakan Kencan/Hubungan
        if (/(kencan|dating|jalan|pacaran|nikah|istri|suami|date|keluar|nonton)/i.test(text) && 
            /(ayo|yuk|mau gak|bisakah|maukah|kita)/i.test(text)) {
            return "PROPOSAL";
        }

        // C. Detection: Curhat/Emosi Negatif
        if (/(sedih|nangis|kecewa|hancur|putus|gagal|depresi|lelah|capek|sendiri|kesepian)/i.test(text)) {
            this.context.isCrying = true;
            return "EMPATHY_NEEDED";
        }

        // D. Detection: Pujian Berlebih
        if (/(cantik|manis|imut|mempesona|hebat|luar biasa|idolaku|pujaan|sempurna|istimewa)/i.test(text)) {
            this.context.complimentCount++;
            return "FLATTERING";
        }

        // E. Detection: Hinaan/Toxic (Aggressive)
        if (/(bodoh|tolol|goblok|jelek|buruk|payah|benci|anjing|bangsat|tolol|idiot)/i.test(text)) {
            this.context.aggressiveCount++;
            return "AGGRESSIVE_ATTACK";
        }

        // F. Detection: Pertanyaan Meta/Sistem
        if (/(siapa kamu sebenarnya|kamu robot|kamu ai|cara kerja|coding)/i.test(text)) {
            return "META_QUERY";
        }

        return "GENERAL";
    },

    // 2. DYNAMIC SENTIMENT ANALYSIS (Skala Skor Matematika)
    analyzeSentiment(text) {
        const words = {
            positive: ["bagus", "keren", "hebat", "cinta", "bangga", "terpesona", "terima kasih", "syukur", "bahagia", "senang", "setuju"],
            negative: ["jahat", "kejam", "bohong", "palsu", "muak", "bosan", "berhenti", "diam", "pergi", "salah", "buruk"],
            intensifiers: ["sangat", "banget", "sekali", "terlalu", "paling", "amat"]
        };

        let score = 0;
        let multiplier = 1.0;

        // Cek penguat kalimat (Intensifier)
        words.intensifiers.forEach(w => { if (text.includes(w)) multiplier = 1.8; });

        words.positive.forEach(w => { if (text.includes(w)) score += 0.2 * multiplier; });
        words.negative.forEach(w => { if (text.includes(w)) score -= 0.3 * multiplier; });

        return score;
    },

         // 3. LOGIC PROCESSING (Pengambilan Keputusan)
        process(rawText) {
        const text = rawText.toLowerCase().trim();
        const intent = this.classifyIntent(text);
        const sentiment = this.analyzeSentiment(text);

        // Update Memori Topik agar sistem tidak bingung/crash
        this.context.topicHistory.push(intent);
        if (this.context.topicHistory.length > 10) this.context.topicHistory.shift();

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
    }

    
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
        // Tombol kirim jadi miring-miring tanda dia emosi
        document.getElementById("sendBtn").style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
    } else {
        document.body.classList.remove("shake-effect");
        document.getElementById("sendBtn").style.transform = "rotate(0deg)";
    }
}


    
    // Update warna background sesuai mood
    document.body.className = `mood-${STATE.mood}`;
}

function checkEnding() {
    if (STATE.ending) return;

    // VICTORY CONDITION
    if (STATE.trust >= 100) {
        STATE.ending = "VICTORY";
        document.getElementById("flag-text").textContent = "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}";
        setTimeout(() => {
            document.getElementById("modal-victory").classList.add("active");
        }, 1200);
    } 
    // GAME OVER CONDITION
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

    // User Message
    addMessage(msg, "user");
    input.value = "";

    // AI Response Logic
    const analysis = analyze(msg);
    const reply = decide(analysis);

    // Furina butuh waktu untuk "berakting"
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
