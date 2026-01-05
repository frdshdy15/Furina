/**
 * FURINA DEUS EX MACHINA - CORE SCRIPT
 * Version: 3.0 (Mobile Optimized & Story Driven)
 * Author: Frdshdy (Enhanced by Gemini)
 */

"use strict";

// ============================================================
// [1] GLOBAL DATASET (The Knowledge Base)
// Pisahkan agar mudah ditambah hingga ribuan baris.
// ============================================================
const FURINA_DATA = {
    prologue: [
        { 
            text: "Selamat datang di panggung sandiwara Fontaine... Aku adalah Furina de Fontaine!", 
            img: "5.jpeg" 
        },
        { 
            text: "Di sini, setiap kata adalah naskah, dan setiap tindakan adalah pertunjukan. Jangan buat aku bosan!", 
            img: "5.jpeg" 
        },
        { 
            text: "Aku sangat benci orang yang tidak sopan, pengkhianat, dan... macaron yang sudah basi!", 
            img: "3.jpeg" 
        },
        { 
            text: "Sekarang namamu sudah tercatat dalam arsipku. Mari kita mulai pertunjukannya!", 
            img: "4.jpeg" 
        }
    ],

    // Dataset Respon Berdasarkan Keyword (NLP Sederhana)
    knowledge: {
        greeting: {
            keywords: ["halo", "hai", "pagi", "siang", "malam", "p", "oi", "hey"],
            responses: [
                "Kehadiranmu tepat waktu, figuran favoritku!",
                "Ah, kau datang lagi. Ingin melihat penampilanku hari ini?",
                "Panggung ini terasa sepi tanpamu... Maksudku, tanpa penonton!"
            ],
            mood: "HAPPY"
        },
        physical: {
            keywords: ["makan", "lapar", "haus", "macaron", "kue", "teh"],
            responses: [
                "Macaron blueberry adalah satu-satunya alasan raga ini bertahan!",
                "Jangan bicara soal makan, aku sedang memikirkan pesta teh nanti sore.",
                "Seorang bintang harus menjaga postur tubuhnya, tapi sepotong kecil kue takkan menyakiti."
            ],
            mood: "WARM"
        },
        toxic: {
            keywords: ["anjing", "bego", "tolol", "goblok", "jelek", "babi", "mati", "buruk"],
            responses: [
                "Lidahmu tajam sekali! Apa begini caramu bicara pada Sang Archon?!",
                "Kekasaranmu tidak akan membuat panggungmu lebih tinggi. Jaga etikamu!",
                "Hmph! Aku akan pura-pura tidak dengar itu... untuk kali ini saja."
            ],
            mood: "ANGRY"
        },
        flirt: {
            keywords: ["cantik", "sayang", "cinta", "suka", "manis", "pacar", "nikah"],
            responses: [
                "A-apa?! Jangan sembarang bicara! Aku ini bintang utama!",
                "Pujianmu lumayan... tapi jangan harap aku akan langsung luluh.",
                "Wajahmu memerah? Lucu sekali melihatmu mencoba merayuku!"
            ],
            mood: "WARM"
        },
        mystery: {
            keywords: ["flag", "rahasia", "kode", "harta", "hadiah"],
            responses: [
                "Kau menginginkan sesuatu dariku? Tunjukkan dulu kesetiaanmu!",
                "Rahasia adalah bumbu dari setiap pertunjukan yang hebat.",
                "Mungkin nanti... jika kau bisa membuatku benar-benar terkesan."
            ],
            mood: "POUT"
        }
    },

    // Filosofi Random jika tidak ada keyword cocok
    philosophy: [
        "Kebenaran hanyalah naskah yang ditulis oleh mereka yang menang.",
        "Air mata adalah kata-kata yang tidak bisa diucapkan oleh lidah.",
        "Panggung ini lebih nyata daripada dunia di luar sana, bukan?",
        "Terkadang, menjadi orang lain jauh lebih mudah daripada menjadi diri sendiri."
    ],

    moodAssets: {
        NORMAL: "5.jpeg",
        SAD: "1.jpeg",
        ANGRY: "2.jpeg",
        POUT: "3.jpeg",
        WARM: "4.jpeg",
        HAPPY: "4.jpeg"
    }
};

// ============================================================
// [2] STATE MANAGEMENT
// ============================================================
const STATE = {
    username: "",
    trust: 20,
    mood: "NORMAL",
    currentStoryIdx: 0,
    memory: [],
    isTyping: false
};

// ============================================================
// [3] CORE ENGINE (The "God" Logic)
// ============================================================
const ENGINE = {
    // Inisialisasi Aplikasi
    init() {
        this.setupEventListeners();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    },

    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const nextStoryBtn = document.getElementById('nextStoryBtn');
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');

        startBtn.onclick = () => this.handleStart();
        nextStoryBtn.onclick = () => this.handleStory();
        sendBtn.onclick = () => this.handleChat();
        userInput.onkeydown = (e) => { if (e.key === 'Enter') this.handleChat(); };
    },

    // 1. Bagian Opening
    handleStart() {
        const nameInput = document.getElementById('usernameInput');
        if (nameInput.value.trim().length < 2) {
            alert("Masukkan namamu dengan benar, figuran!");
            return;
        }
        STATE.username = nameInput.value;
        this.switchScreen('welcome', 'prologue');
        this.handleStory(); // Mulai prolog
    },

    // 2. Bagian Prologue (Latar Belakang)
    handleStory() {
        const storyText = document.getElementById('storyText');
        const prologueImg = document.getElementById('prologueImg');
        const data = FURINA_DATA.prologue[STATE.currentStoryIdx];

        if (data) {
            storyText.classList.remove('active');
            setTimeout(() => {
                storyText.textContent = data.text.replace("{name}", STATE.username);
                prologueImg.src = data.img;
                storyText.classList.add('active');
            }, 100);
            STATE.currentStoryIdx++;
        } else {
            this.switchScreen('prologue', 'app');
            UI.addBubble(`Halo ${STATE.username}! Mari kita lihat seberapa menarik percakapanmu!`, 'ai', '5.jpeg');
        }
    },

    // 3. Bagian Chat Utama
    handleChat() {
        const input = document.getElementById('userInput');
        const msg = input.value.trim();
        if (!msg || STATE.isTyping) return;

        UI.addBubble(msg, 'user');
        input.value = '';
        this.processResponse(msg.toLowerCase());
    },

    processResponse(rawText) {
        STATE.isTyping = true;
        let selectedResponse = "";
        let targetMood = "NORMAL";

        // Logic Pencarian Keyword
        let found = false;
        for (const key in FURINA_DATA.knowledge) {
            const entry = FURINA_DATA.knowledge[key];
            if (entry.keywords.some(k => rawText.includes(k))) {
                selectedResponse = entry.responses[Math.floor(Math.random() * entry.responses.length)];
                targetMood = entry.mood;
                found = true;

                // Dampak Trust
                if (key === 'toxic') STATE.trust -= 10;
                if (key === 'flirt') STATE.trust += 5;
                break;
            }
        }

        // Logic Kebohongan Flag
        if (rawText.includes("flag")) {
            if (STATE.trust < 150) {
                selectedResponse = "Ingin flag? Kerjakan dulu tugasmu: Berikan aku 100 alasan kenapa aku adalah Diva terbaik!";
                targetMood = "POUT";
            }
        }

        // Fallback jika tidak ada yang cocok
        if (!found && !selectedResponse) {
            selectedResponse = FURINA_DATA.philosophy[Math.floor(Math.random() * FURINA_DATA.philosophy.length)];
            targetMood = "NORMAL";
        }

        STATE.mood = targetMood;

        // Simulasi Mengetik
        setTimeout(() => {
            UI.updateMoodUI();
            UI.addBubble(selectedResponse, 'ai', FURINA_DATA.moodAssets[targetMood]);
            STATE.isTyping = false;

            // Cek Ending
            if (STATE.trust >= 200) this.triggerEnding();
        }, 1000 + Math.random() * 1000);
    },

    triggerEnding() {
        this.switchScreen('app', 'ending');
        document.getElementById('flagValue').textContent = "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}";
    },

    // Helper: Pindah Layer
    switchScreen(fromId, toId) {
        document.getElementById(fromId).classList.remove('active');
        document.getElementById(toId).classList.add('active');
    },

    updateClock() {
        const now = new Date();
        document.getElementById('realtimeClock').textContent = 
            now.getHours().toString().padStart(2, '0') + ":" + 
            now.getMinutes().toString().padStart(2, '0');
    }
};

// ============================================================
// [4] UI CONTROLLER
// ============================================================
const UI = {
    addBubble(text, type, imgUrl = null) {
        const chatViewport = document.getElementById('chat');
        const bubble = document.createElement('div');
        bubble.className = `msg ${type} anim-up`;

        if (type === 'ai' && imgUrl) {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.className = 'chat-img-bubble';
            bubble.appendChild(img);
        }

        const p = document.createElement('p');
        p.textContent = text;
        bubble.appendChild(p);

        chatViewport.appendChild(bubble);
        chatViewport.scrollTo({ top: chatViewport.scrollHeight, behavior: 'smooth' });
    },

    updateMoodUI() {
        document.body.className = `mood-${STATE.mood.toLowerCase()}`;
        document.getElementById('moodLabel').textContent = STATE.mood;
        document.getElementById('trustVal').textContent = Math.max(0, STATE.trust);
        document.getElementById('miniAvatar').src = FURINA_DATA.moodAssets[STATE.mood];
    }
};

// Run Engine
window.onload = () => {
    // Sembunyikan loading setelah 2 detik
    setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('welcome').classList.add('active');
        ENGINE.init();
    }, 2000);
};
