"use strict";

/**
 * FURINA SENTIENCE ENGINE (NEURAL-LINK MOCKUP)
 * Menggunakan Probabilitas Kontekstual & Weighted Random
 * Tanpa API - Machine Learning Logic
 */

const STATE = {
    username: "Traveler",
    trust: 50,
    mood: "THEATRICAL",
    memory: [], 
    isNight: false
};

// --- [1] NEURAL DATASET (The Knowledge Base) ---
const BRAIN_MODEL = {
    // Kumpulan data mentah yang akan diproses oleh "Neural Engine"
    corpus: {
        "GREETING": {
            weight: 1,
            patterns: ["halo", "hai", "pagi", "siang", "malam", "oi", "permisi", "hey"],
            nodes: [
                "Halo! Pas sekali kau datang ke panggungku.",
                "Kehadiranmu tepat waktu, simfoni baru saja akan dimulai.",
                "Oh, figuran favoritku muncul juga. Apa harimu menyenangkan?"
            ]
        },
        "PHYSICAL": {
            weight: 2,
            patterns: ["makan", "lapar", "haus", "minum", "mam", "kenyang", "macaron", "teh"],
            nodes: [
                "Macaron blueberry adalah satu-satunya alasan raga ini tetap bertahan dalam drama dunia. Kau sudah makan?",
                "Seorang bintang tidak boleh gemetar karena lapar. Aku baru saja menikmati teh kembang sepatu.",
                "Makan? Aku hanya butuh apresiasi penonton untuk hidup! Tapi sepotong kue tadi cukup enak."
            ]
        },
        "CONDITION": {
            weight: 2,
            patterns: ["kabar", "lagi apa", "sedang apa", "gimana", "sehat", "apa kabar"],
            nodes: [
                "Sedang merenungi naskah untuk hari esok. Dunia ini butuh lebih banyak drama!",
                "Kabarku luar biasa, secerah langit Fontaine hari ini.",
                "Menunggumu menyapa, meskipun aku pura-pura sibuk dengan urusan pengadilan."
            ]
        },
        "EMPATHY": {
            weight: 3,
            patterns: ["sedih", "capek", "lelah", "galau", "nangis", "sakit", "sendiri", "kesepian"],
            nodes: [
                "Jangan menangis sendirian. Panggung ini cukup luas untuk kita berdua berbagi beban.",
                "Terkadang bahkan seorang bintang butuh waktu untuk redup sejenak. Aku mendengarkanmu.",
                "Beban itu... biarkan aku membaginya sedikit bersamamu melalui obrolan ini. Jangan menyerah."
            ]
        },
        "TOXIC": {
            weight: 5,
            patterns: ["anjing", "bego", "tolol", "goblok", "jelek", "babi", "mati", "jahat"],
            nodes: [
                "Lidahmu tajam sekali! Apa begini caramu bicara pada seseorang sepertiku?",
                "Kekasaranmu tidak akan membuat panggungmu lebih tinggi. Jaga etikamu!",
                "Aku akan pura-pura tidak dengar itu. Tapi jangan ulangi lagi, mengerti?"
            ]
        }
    },
    
    // Gabungan kata-kata puitis untuk "Berpikir Sendiri" (Generative)
    philosophy: [
        "bahwa setiap tarian akan berakhir pada waktunya.",
        "kebenaran adalah naskah yang ditulis oleh pemenang.",
        "air mata adalah kata-kata yang tak bisa diucapkan lidah.",
        "panggung sandiwara ini lebih nyata dari dunia luar."
    ]
};

const ENGINE = {
    // 2. INFERENCE ENGINE (Mengenali Niat & Typo)
    inference: (input) => {
        const text = input.toLowerCase();
        let bestMatch = "GENERAL";
        let maxScore = 0;

        for (let key in BRAIN_MODEL.corpus) {
            let score = 0;
            BRAIN_MODEL.corpus[key].patterns.forEach(p => {
                if (text.includes(p)) score += BRAIN_MODEL.corpus[key].weight;
            });

            if (score > maxScore) {
                maxScore = score;
                bestMatch = key;
            }
        }
        return bestMatch;
    },

    // 3. GENERATIVE RESPONSE (Merakit Kalimat)
    generate: (intent) => {
        const node = BRAIN_MODEL.corpus[intent];
        let reply = "";

        if (node) {
            reply = node.nodes[Math.floor(Math.random() * node.nodes.length)];
        } else {
            // Jika "Neural" tidak kenal kata tersebut, dia akan "Berpikir Filosofis"
            const phil = BRAIN_MODEL.philosophy[Math.floor(Math.random() * BRAIN_MODEL.philosophy.length)];
            reply = `Hmm, pertanyaanmu unik. Kau tahu, ${phil}`;
        }

        return reply;
    },

    process: (input) => {
        const intent = ENGINE.inference(input);
        
        // Anti-Repetition (Memory Check)
        let reply = ENGINE.generate(intent);
        if (STATE.memory.includes(reply)) {
            reply = ENGINE.generate("GENERAL"); // Cari variasi lain
        }

        // Update Mood & Trust
        if (intent === "TOXIC") {
            STATE.trust -= 10;
            STATE.mood = "ANGRY";
        } else if (intent === "EMPATHY") {
            STATE.trust += 5;
            STATE.mood = "WARM";
        }

        UI.update();
        
        // Simulasikan Machine Learning sedang memproses data (Delay Manusiawi)
        const delay = 1000 + (Math.random() * 2000);
        setTimeout(() => {
            if (STATE.trust >= 150) {
                ENGINE.triggerEnding();
            } else {
                UI.addBubble(reply, 'ai');
                STATE.memory.push(reply);
                if (STATE.memory.length > 5) STATE.memory.shift();
            }
        }, delay);
    },

    triggerEnding: () => {
        document.getElementById('app').classList.remove('active');
        document.getElementById('ending').classList.add('active');
        document.getElementById('flagValue').textContent = "FLAG{minta uang ke daus buat beli nasi padang}";
    }
};

const UI = {
    addBubble: (msg, type) => {
        const chat = document.getElementById('chat');
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        div.textContent = msg;
        chat.appendChild(div);
        chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    },
    update: () => {
        document.getElementById('trustVal').textContent = Math.floor(STATE.trust);
        document.getElementById('moodLabel').textContent = STATE.mood;
        const colors = { THEATRICAL: "#00d2ff", WARM: "#ffeb3b", ANGRY: "#f44336" };
        document.getElementById('statusDot').style.backgroundColor = colors[STATE.mood];
    }
};

window.onload = () => {
    document.getElementById('startBtn').onclick = () => {
        const name = document.getElementById('usernameInput').value;
        if (name) {
            STATE.username = name;
            document.getElementById('welcome').classList.remove('active');
            document.getElementById('app').classList.add('active');
            UI.addBubble(`Halo ${STATE.username}, ini aku Furina. Mari kita mengobrol dari hati ke hati!`, 'ai');
        }
    };

    const send = () => {
        const input = document.getElementById('userInput');
        if (input.value.trim()) {
            UI.addBubble(input.value, 'user');
            ENGINE.process(input.value);
            input.value = '';
        }
    };

    document.getElementById('sendBtn').onclick = send;
    document.getElementById('userInput').onkeydown = (e) => { if(e.key === 'Enter') send(); };
};
