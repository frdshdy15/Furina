/**
 * FURINA DEUS EX MACHINA - CORE SCRIPT (FIXED)
 * Version: 3.1 (Stable Mobile)
 * Author: Frdshdy
 */

"use strict";

// ============================================================
// [1] GLOBAL DATASET (The Knowledge Base)
// ============================================================
const FURINA_DATA = {
    prologue: [
        { text: "Selamat datang di panggung sandiwara Fontaine... Aku adalah Furina de Fontaine!", img: "5.jpeg" },
        { text: "Di sini, setiap kata adalah naskah, dan setiap tindakan adalah pertunjukan. Jangan buat aku bosan!", img: "5.jpeg" },
        { text: "Aku sangat benci orang yang tidak sopan, pengkhianat, dan... macaron yang sudah basi!", img: "3.jpeg" },
        { text: "Sekarang namamu sudah tercatat dalam arsipku. Mari kita mulai pertunjukannya!", img: "4.jpeg" }
    ],

    knowledge: {
        greeting: {
            keywords: ["halo", "hai", "pagi", "siang", "malam", "p", "oy", "hey", "halo furina"],
            responses: [
                "Kehadiranmu tepat waktu, figuran favoritku!",
                "Ah, kau datang lagi. Ingin melihat penampilanku hari ini?",
                "Panggung ini terasa sepi tanpamu... Maksudku, tanpa penonton!"
            ],
            mood: "HAPPY"
        },
        toxic: {
            keywords: ["anjing", "bego", "tolol", "goblok", "jelek", "babi", "mati", "buruk", "bangsat"],
            responses: [
                "Lidahmu tajam sekali! Apa begini caramu bicara pada Sang Archon?!",
                "Kekasaranmu tidak akan membuat panggungmu lebih tinggi. Jaga etikamu!",
                "Hmph! Aku akan pura-pura tidak dengar itu... untuk kali ini saja."
            ],
            mood: "ANGRY"
        },
        flirt: {
            keywords: ["cantik", "sayang", "cinta", "suka", "manis", "pacar", "nikah", "loveyou"],
            responses: [
                "A-apa?! Jangan sembarang bicara! Aku ini bintang utama!",
                "Pujianmu lumayan... tapi jangan harap aku akan langsung luluh.",
                "Wajahmu memerah? Lucu sekali melihatmu mencoba merayuku!"
            ],
            mood: "WARM"
        },
        mystery: {
            keywords: ["flag", "rahasia", "kode", "harta", "hadiah", "mana flag"],
            responses: [
                "Kau menginginkan sesuatu dariku? Tunjukkan dulu kesetiaanmu!",
                "Rahasia adalah bumbu dari setiap pertunjukan yang hebat.",
                "Mungkin nanti... jika kau bisa membuatku benar-benar terkesan."
            ],
            mood: "POUT"
        }
    },

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
    isTyping: false
};

// ============================================================
// [3] CORE ENGINE
// ============================================================
const ENGINE = {
    init() {
        console.log("Furina Engine Initialized...");
        this.setupEventListeners();
        this.startClock();
        
        // Anti-Stuck: Paksa masuk ke Welcome setelah 2.5 detik
        setTimeout(() => {
            this.switchScreen('loading', 'welcome');
        }, 2500);
    },

    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const nextStoryBtn = document.getElementById('nextStoryBtn');
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');

        if(startBtn) startBtn.onclick = () => this.handleStart();
        if(nextStoryBtn) nextStoryBtn.onclick = () => this.handleStory();
        if(sendBtn) sendBtn.onclick = () => this.handleChat();
        if(userInput) {
            userInput.onkeydown = (e) => { 
                if (e.key === 'Enter') this.handleChat(); 
            };
        }
    },

    handleStart() {
        const nameInput = document.getElementById('usernameInput');
        if (!nameInput.value.trim()) {
            alert("Siapa namamu, figuran? Jangan biarkan naskah ini kosong!");
            return;
        }
        STATE.username = nameInput.value;
        this.switchScreen('welcome', 'prologue');
        this.handleStory(); 
    },

    handleStory() {
        const storyText = document.getElementById('storyText');
        const prologueImg = document.getElementById('prologueImg');
        const data = FURINA_DATA.prologue[STATE.currentStoryIdx];

        if (data) {
            storyText.style.opacity = 0;
            setTimeout(() => {
                storyText.textContent = data.text.replace("{name}", STATE.username);
                prologueImg.src = data.img;
                storyText.style.opacity = 1;
            }, 300);
            STATE.currentStoryIdx++;
        } else {
            this.switchScreen('prologue', 'app');
            UI.addBubble(`Halo ${STATE.username}! Mari kita mulai pertunjukan besar ini!`, 'ai', '5.jpeg');
        }
    },

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
        let found = false;

        // NLP Logic
        for (const key in FURINA_DATA.knowledge) {
            const entry = FURINA_DATA.knowledge[key];
            if (entry.keywords.some(k => rawText.includes(k))) {
                selectedResponse = entry.responses[Math.floor(Math.random() * entry.responses.length)];
                targetMood = entry.mood;
                found = true;
                if (key === 'toxic') STATE.trust -= 10;
                if (key === 'flirt') STATE.trust += 5;
                if (key === 'mystery') STATE.trust += 2;
                break;
            }
        }

        if (!found) {
            selectedResponse = FURINA_DATA.philosophy[Math.floor(Math.random() * FURINA_DATA.philosophy.length)];
            targetMood = "NORMAL";
        }

        // Delay agar manusiawi
        setTimeout(() => {
            STATE.mood = targetMood;
            UI.updateMoodUI();
            UI.addBubble(selectedResponse, 'ai', FURINA_DATA.moodAssets[targetMood]);
            STATE.isTyping = false;

            if (STATE.trust >= 200) this.triggerEnding();
        }, 1200);
    },

    triggerEnding() {
        this.switchScreen('app', 'ending');
        document.getElementById('flagValue').textContent = "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}";
    },

    switchScreen(fromId, toId) {
        const fromEl = document.getElementById(fromId);
        const toEl = document.getElementById(toId);
        if(fromEl) fromEl.classList.remove('active');
        if(toEl) toEl.classList.add('active');
    },

    startClock() {
        const update = () => {
            const clockEl = document.getElementById('realtimeClock');
            if(clockEl) {
                const now = new Date();
                clockEl.textContent = now.getHours().toString().padStart(2, '0') + ":" + 
                                      now.getMinutes().toString().padStart(2, '0');
            }
        };
        update();
        setInterval(update, 1000);
    }
};

const UI = {
    addBubble(text, type, imgUrl = null) {
        const chatViewport = document.getElementById('chat');
        if(!chatViewport) return;

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
        const moodLabel = document.getElementById('moodLabel');
        const trustVal = document.getElementById('trustVal');
        const miniAvatar = document.getElementById('miniAvatar');
        
        if(moodLabel) moodLabel.textContent = STATE.mood;
        if(trustVal) trustVal.textContent = Math.max(0, STATE.trust);
        if(miniAvatar) miniAvatar.src = FURINA_DATA.moodAssets[STATE.mood];
    }
};

// Start System
document.addEventListener('DOMContentLoaded', () => {
    ENGINE.init();
});
