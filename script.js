"use strict";

/**
 * FURINA DEUS EX MACHINA ENGINE V2
 * Kepribadian: Kompleks, Cerdas, Bisa Berbohong, Penantang.
 */

const STATE = {
    username: "Traveler",
    trust: 20,
    mood: "NORMAL",
    stage: "GREETING", // GREETING, RIDDLE, JUDGMENT, FINAL
    interactionCount: 0,
    inventory: [],
    failedAttempts: 0
};

const MOOD_ASSETS = {
    NORMAL: "5.jpeg",
    SAD: "1.jpeg",
    ANGRY: "2.jpeg",
    POUT: "3.jpeg", 
    WARM: "4.jpeg"
};

// Dataset Jawaban yang lebih "Deep"
const RESPONSES = {
    RIDDLES: [
        { q: "Aku tidak punya sayap tapi bisa terbang, tidak punya mata tapi bisa menangis. Apakah aku?", a: "awan", hint: "Sesuatu yang ada di langit Fontaine." },
        { q: "Semakin banyak kau mengambil darinya, semakin besar ia jadinya. Apakah itu?", a: "lubang", hint: "Pikirkan tentang penggalian." },
        { q: "Aku punya kota tapi tak punya rumah, punya gunung tapi tak punya pohon. Apa aku?", a: "peta", hint: "Benda yang dibawa petualang." }
    ],
    LIE_FLAGS: [
        "FLAG{AKU_CANTIK_KAN?}",
        "FLAG{BELAJAR_LAGI_DEH}",
        "FLAG{DAUS_GANTENG_KATANYA}"
    ],
    TIME_SENSITIVE: {
        pagi: "Teh pagi di Opera Epiclese adalah yang terbaik. Kau mau?",
        siang: "Matahari Fontaine sangat terik, jangan sampai kau pingsan di panggungku.",
        sore: "Lampu panggung mulai menyala... drama sebenarnya akan dimulai.",
        malam: "Malam sunyi begini... apa kau sedang memikirkanku?"
    }
};

const ENGINE = {
    // Deteksi Waktu
    getTime: () => {
        const hr = new Date().getHours();
        if (hr < 11) return "pagi";
        if (hr < 15) return "siang";
        if (hr < 19) return "sore";
        return "malam";
    },

    // Fuzzy Search Sederhana agar Typo tidak masalah
    isMatch: (input, keywords) => {
        return keywords.some(k => input.toLowerCase().includes(k.toLowerCase()));
    },

    process: (input) => {
        STATE.interactionCount++;
        const text = input.toLowerCase();
        let reply = "";
        let moodTarget = "NORMAL";

        // --- SISTEM LOGIKA BERLAPIS ---

        // 1. Deteksi Toksisitas (Sangat Sensitif)
        if (ENGINE.isMatch(text, ["anjing", "tolol", "goblok", "jelek", "bego"])) {
            STATE.trust -= 25;
            moodTarget = "ANGRY";
            reply = "Beraninya kau menghina sang Archon?! Aku bisa saja membuatmu tenggelam dalam drama tragis!";
        } 
        
        // 2. Logic Teka-teki (Challenge)
        else if (text.includes("tantangan") || text.includes("main") || text.includes("tebak")) {
            const riddle = RESPONSES.RIDDLES[Math.floor(Math.random() * RESPONSES.RIDDLES.length)];
            STATE.currentRiddle = riddle;
            STATE.stage = "RIDDLE";
            reply = `Oh, kau ingin tantangan? Baiklah. Jawab ini: "${riddle.q}"`;
            moodTarget = "NORMAL";
        }

        // 3. Menjawab Teka-teki
        else if (STATE.stage === "RIDDLE" && STATE.currentRiddle) {
            if (text.includes(STATE.currentRiddle.a)) {
                STATE.trust += 30;
                STATE.stage = "GREETING";
                moodTarget = "WARM";
                reply = "Hmph! Ternyata otakmu tidak tumpul juga. Aku terkesan sedikit.";
                delete STATE.currentRiddle;
            } else {
                STATE.failedAttempts++;
                moodTarget = "POUT";
                reply = `Salah! Masa begitu saja tidak tahu? Petunjuk: ${STATE.currentRiddle.hint}`;
            }
        }

        // 4. Deteksi Curhat / Emosi (Contextual)
        else if (ENGINE.isMatch(text, ["sedih", "kesepian", "capek", "lelah"])) {
            STATE.trust += 15;
            moodTarget = "SAD";
            reply = "Dunia ini memang panggung yang melelahkan. Sini, ceritakan semuanya padaku... aku akan mendengarkan.";
        }

        // 5. Pancingan Flag (Ujian Kesabaran)
        else if (text.includes("flag") || text.includes("kode")) {
            if (STATE.trust < 120) {
                moodTarget = "POUT";
                reply = `Kau mau kode rahasia? Nih: ${RESPONSES.LIE_FLAGS[Math.floor(Math.random() * RESPONSES.LIE_FLAGS.length)]}. Senang?`;
            } else {
                moodTarget = "WARM";
                reply = "Kau sudah sangat dekat dengan jawabannya. Teruslah buat aku bahagia!";
            }
        }

        // 6. Respon Umum Berdasarkan Waktu
        else {
            const t = ENGINE.getTime();
            if (STATE.trust > 80) {
                moodTarget = "WARM";
                reply = `Kau tahu, ${STATE.username}, berada bersamamu di waktu ${t} ini terasa berbeda dari biasanya.`;
            } else {
                reply = `Hmm... "${input}" ya? Menarik. Tapi tidak semenarik penampilanku hari ini!`;
            }
        }

        // Finalisasi Emosi dan UI
        STATE.mood = moodTarget;
        UI.render(reply);
        
        if (STATE.trust >= 150) {
            setTimeout(ENGINE.triggerEnding, 2000);
        }
    },

    triggerEnding: () => {
        document.getElementById('app').classList.remove('active');
        document.getElementById('ending').classList.add('active');
        document.getElementById('flagValue').textContent = "FLAG{sana minta uang ke daus buat beli nasi padang}";
    }
};

const UI = {
    render: (msg) => {
        // Efek transisi tema CSS
        document.body.className = `mood-${STATE.mood.toLowerCase()}`;
        document.getElementById('trustVal').textContent = STATE.trust;
        document.getElementById('moodLabel').textContent = STATE.mood;
        document.getElementById('miniAvatar').src = MOOD_ASSETS[STATE.mood];

        // Simulasi Furina sedang mengetik
        const chat = document.getElementById('chat');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'msg ai typing';
        typingDiv.textContent = 'Furina sedang berpikir...';
        chat.appendChild(typingDiv);
        chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });

        setTimeout(() => {
            typingDiv.remove();
            UI.addBubble(msg, 'ai', MOOD_ASSETS[STATE.mood]);
        }, 1200);
    },

    addBubble: (msg, type, imgUrl = null) => {
        const chat = document.getElementById('chat');
        const div = document.createElement('div');
        div.className = `msg ${type} ${STATE.mood === 'ANGRY' ? 'reality-hack' : ''}`;
        
        if (type === 'ai' && imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.className = 'chat-img';
            div.appendChild(img);
        }

        const p = document.createElement('p');
        p.textContent = msg;
        div.appendChild(p);
        
        chat.appendChild(div);
        chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    }
};

// Start System
window.onload = () => {
    // Clock Update
    setInterval(() => {
        document.getElementById('realtimeClock').textContent = new Date().toLocaleTimeString('id-ID');
    }, 1000);

    document.getElementById('startBtn').onclick = () => {
        const val = document.getElementById('usernameInput').value;
        if (val) {
            STATE.username = val;
            document.getElementById('welcome').classList.remove('active');
            document.getElementById('app').classList.add('active');
            const greeting = `Akhirnya muncul juga, ${val}! Panggung sudah siap. Jangan membuatku malu dengan tingkahmu!`;
            UI.addBubble(greeting, 'ai', MOOD_ASSETS.NORMAL);
        }
    };

    const handleSend = () => {
        const el = document.getElementById('userInput');
        if (el.value.trim()) {
            UI.addBubble(el.value, 'user');
            ENGINE.process(el.value);
            el.value = '';
        }
    };

    document.getElementById('sendBtn').onclick = handleSend;
    document.getElementById('userInput').onkeydown = (e) => { if(e.key === 'Enter') handleSend(); };
};
