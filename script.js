/**
 * FURINA DEUS EX MACHINA - CORE SCRIPT V4
 * Dirancang untuk skalabilitas ribuan baris dataset.
 */

"use strict";

// ============================================================
// [1] DATABASE DATASET (Bagian yang bisa kamu perbanyak nanti)
// ============================================================
const FURINA_DB = {
    // Cerita perkenalan di layar Prologue
    prologue: [
        {
            text: "Selamat datang di panggung sandiwara Fontaine... Aku adalah Furina de Fontaine!",
            image: "5.jpeg"
        },
        {
            text: "Aku harap kau mengerti etikanya. Di panggungku, tidak ada tempat untuk kebosanan.",
            image: "5.jpeg"
        },
        {
            text: "Jangan sekali-kali meremehkanku, atau kau akan merasakan keadilan yang tajam!",
            image: "2.jpeg"
        }
    ],

    // Logika respon chat
    responses: {
        greeting: {
            keys: ["halo", "hai", "pagi", "siang", "malam", "p", "hey"],
            text: [
                "Kehadiranmu tepat waktu, figuran favoritku!",
                "Ah, kau datang lagi. Ingin melihat penampilanku?",
                "Panggung ini terasa sepi tanpa penonton sepertimu."
            ],
            mood: "NORMAL"
        },
        toxic: {
            keys: ["anjing", "bego", "tolol", "goblok", "jelek", "babi", "mati"],
            text: [
                "Lidahmu tajam sekali! Jaga etikamu di hadapan Diva!",
                "Kekasaranmu tidak akan membuatmu terlihat keren.",
                "Hmph! Aku akan pura-pura tidak dengar itu... kali ini saja."
            ],
            mood: "ANGRY"
        },
        praise: {
            keys: ["cantik", "sayang", "cinta", "suka", "manis", "hebat"],
            text: [
                "A-apa?! Tentu saja aku hebat! Aku ini bintang utama!",
                "Pujianmu lumayan... tapi jangan harap aku luluh begitu saja.",
                "Wajahmu memerah? Lucu sekali melihatmu merayuku."
            ],
            mood: "WARM"
        }
    },

    // Jawaban jika tidak ada keyword yang cocok (Philosophy Mode)
    philosophy: [
        "Kebenaran hanyalah naskah yang ditulis oleh pemenang.",
        "Air mata adalah kata-kata yang tidak sanggup diucapkan lidah.",
        "Panggung ini lebih nyata daripada dunia di luar sana.",
        "Terkadang menjadi orang lain jauh lebih mudah daripada menjadi diri sendiri."
    ],

    // Pemetaan foto berdasarkan Mood
    assets: {
        NORMAL: "5.jpeg",
        SAD: "1.jpeg",
        ANGRY: "2.jpeg",
        POUT: "3.jpeg",
        WARM: "4.jpeg"
    }
};

// ============================================================
// [2] GLOBAL STATE (Status Game)
// ============================================================
const STATE = {
    name: "Figuran",
    trust: 20,
    mood: "NORMAL",
    prologueStep: 0,
    isProcessing: false
};

// ============================================================
// [3] UI CONTROLLER (Manipulasi Tampilan)
// ============================================================
const UI = {
    // Pindah layar dengan aman
    switchScreen(toId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(toId);
        if (target) target.classList.add('active');
    },

    // Tambah bubble chat
    addBubble(msg, type, img = null) {
        const box = document.getElementById('chat-box');
        const div = document.createElement('div');
        div.className = `msg ${type}`;
        
        if (img) {
            const elImg = document.createElement('img');
            elImg.src = img;
            elImg.className = 'chat-img-bubble';
            div.appendChild(elImg);
        }

        const p = document.createElement('p');
        p.textContent = msg;
        div.appendChild(p);

        box.appendChild(div);
        box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
    },

    // Update status bar & warna tema
    updateStatus() {
        document.body.className = `mood-${STATE.mood.toLowerCase()}`;
        document.getElementById('mood-label').textContent = STATE.mood;
        document.getElementById('trust-val').textContent = STATE.trust;
        document.getElementById('mini-avatar').src = FURINA_DB.assets[STATE.mood];
    }
};

// ============================================================
// [4] CORE ENGINE (Logika Utama)
// ============================================================
const ENGINE = {
    init() {
        // 1. Loading Timeout (Anti-Stuck)
        setTimeout(() => UI.switchScreen('screen-welcome'), 2000);

        // 2. Event Listeners
        document.getElementById('btn-to-prologue').onclick = () => this.startPrologue();
        document.getElementById('btn-to-chat').onclick = () => this.nextStory();
        document.getElementById('btn-send').onclick = () => this.handleChat();
        document.getElementById('chatInput').onkeypress = (e) => { if(e.key === 'Enter') this.handleChat(); };

        // 3. Jam Realtime
        setInterval(() => {
            const now = new Date();
            document.getElementById('clock').textContent = 
                now.getHours().toString().padStart(2, '0') + ":" + 
                now.getMinutes().toString().padStart(2, '0');
        }, 1000);
    },

    startPrologue() {
        const inputName = document.getElementById('usernameInput').value;
        if (!inputName) return alert("Masukkan namamu dulu!");
        STATE.name = inputName;
        UI.switchScreen('screen-prologue');
        this.nextStory();
    },

    nextStory() {
        const data = FURINA_DB.prologue[STATE.prologueStep];
        if (data) {
            document.getElementById('img-prologue').src = data.image;
            document.getElementById('text-prologue').textContent = data.text;
            STATE.prologueStep++;
        } else {
            UI.switchScreen('screen-chat');
            UI.addBubble(`Halo ${STATE.name}! Mari kita mulai sidangnya.`, 'ai', FURINA_DB.assets.NORMAL);
        }
    },

    handleChat() {
        const input = document.getElementById('chatInput');
        const val = input.value.trim().toLowerCase();
        if (!val || STATE.isProcessing) return;

        UI.addBubble(input.value, 'user');
        input.value = "";
        STATE.isProcessing = true;

        // Simulasi Furina berpikir
        setTimeout(() => {
            this.generateResponse(val);
            STATE.isProcessing = false;
        }, 1000);
    },

    generateResponse(input) {
        let reply = "";
        let mood = "NORMAL";
        let found = false;

        // Cari di dataset
        for (const category in FURINA_DB.responses) {
            const item = FURINA_DB.responses[category];
            if (item.keys.some(k => input.includes(k))) {
                reply = item.text[Math.floor(Math.random() * item.text.length)];
                mood = item.mood;
                found = true;
                
                // Update Trust secara dinamis
                if (category === 'toxic') STATE.trust -= 10;
                if (category === 'praise') STATE.trust += 5;
                break;
            }
        }

        // Jika tidak ketemu, gunakan filosofi
        if (!found) {
            reply = FURINA_DB.philosophy[Math.floor(Math.random() * FURINA_DB.philosophy.length)];
        }

        // Update Global State & UI
        STATE.mood = mood;
        UI.updateStatus();
        UI.addBubble(reply, 'ai', FURINA_DB.assets[mood]);

        // Cek Ending
        if (STATE.trust >= 150) {
            setTimeout(() => {
                UI.switchScreen('screen-ending');
                document.getElementById('flag-text').textContent = "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}";
            }, 2000);
        }
    }
};

// Jalankan sistem saat semua elemen siap
document.addEventListener('DOMContentLoaded', () => ENGINE.init());
