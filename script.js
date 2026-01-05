"use strict";

/* =====================================================
   [1] DATASET FURINA (MUDAH DITAMBAH)
===================================================== */
const FURINA_DB = {
    intro: [
        {
            text: "Hmph… akhirnya kau datang juga ke panggungku.",
            mood: "NORMAL"
        }
    ],

    responses: [
        {
            keys: ["halo", "hai", "hey", "p"],
            reply: [
                "Salam hormat untuk sang penonton.",
                "Datang juga kau, figuran.",
                "Aku harap kau siap diuji."
            ],
            trust: +2,
            mood: "NORMAL"
        },
        {
            keys: ["cantik", "imut", "lucu"],
            reply: [
                "A-apa?! Jaga ucapanmu!",
                "Hmph… aku memang memesona.",
                "Kau tahu caranya merayu, ya?"
            ],
            trust: +5,
            mood: "WARM"
        },
        {
            keys: ["anjing", "tolol", "bego", "goblok"],
            reply: [
                "Beraninya kau bicara begitu!",
                "Etikamu buruk sekali.",
                "Sekali lagi dan kau kuadili!"
            ],
            trust: -10,
            mood: "ANGRY"
        }
    ],

    fallback: [
        "Kata-katamu sulit ditebak.",
        "Panggung ini menuntut kejujuran.",
        "Aku sedang menilaimu."
    ],

    avatar: {
        NORMAL: "5.jpeg",
        WARM: "4.jpeg",
        ANGRY: "2.jpeg"
    }
};

/* =====================================================
   [2] STATE GAME
===================================================== */
const STATE = {
    username: "",
    trust: 20,
    mood: "NORMAL",
    locked: false
};

/* =====================================================
   [3] ELEMENT DOM
===================================================== */
const el = {
    modalStart: document.getElementById("modal-start"),
    startBtn: document.getElementById("btn-start"),
    nameInput: document.getElementById("usernameInput"),

    chatBox: document.getElementById("chat-box"),
    userInput: document.getElementById("userInput"),
    sendBtn: document.getElementById("sendBtn"),

    trustVal: document.getElementById("trust-val"),
    moodLabel: document.getElementById("mood-label"),
    avatar: document.getElementById("mini-avatar")
};

/* =====================================================
   [4] UI FUNCTION
===================================================== */
function addBubble(text, type, img = null) {
    const div = document.createElement("div");
    div.className = `msg ${type}`;

    if (img) {
        const image = document.createElement("img");
        image.src = img;
        image.className = "chat-img-bubble";
        div.appendChild(image);
    }

    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);

    el.chatBox.appendChild(div);
    el.chatBox.scrollTop = el.chatBox.scrollHeight;
}

function updateUI() {
    el.trustVal.textContent = STATE.trust;
    el.moodLabel.textContent = STATE.mood;
    el.avatar.src = FURINA_DB.avatar[STATE.mood];
    document.body.className = `mood-${STATE.mood.toLowerCase()}`;
}

/* =====================================================
   [5] CORE LOGIC
===================================================== */
function furinaReply(userText) {
    let found = false;

    for (const data of FURINA_DB.responses) {
        if (data.keys.some(k => userText.includes(k))) {
            const reply =
                data.reply[Math.floor(Math.random() * data.reply.length)];

            STATE.trust += data.trust;
            STATE.mood = data.mood;

            addBubble(reply, "ai", FURINA_DB.avatar[STATE.mood]);
            found = true;
            break;
        }
    }

    if (!found) {
        const fallback =
            FURINA_DB.fallback[Math.floor(Math.random() * FURINA_DB.fallback.length)];
        addBubble(fallback, "ai", FURINA_DB.avatar[STATE.mood]);
    }

    updateUI();
}

/* =====================================================
   [6] EVENT HANDLER
===================================================== */

// === FIX UTAMA: MASUK NAMA ===
el.startBtn.addEventListener("click", () => {
    const name = el.nameInput.value.trim();

    if (name.length < 2) {
        alert("Nama jangan kosong, figuran.");
        return;
    }

    STATE.username = name;
    el.modalStart.classList.remove("active");

    // Intro Furina
    setTimeout(() => {
        const intro = FURINA_DB.intro[0];
        addBubble(
            `${intro.text} ${STATE.username}.`,
            "ai",
            FURINA_DB.avatar.NORMAL
        );
    }, 400);
});

// === KIRIM CHAT ===
el.sendBtn.addEventListener("click", sendChat);
el.userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") sendChat();
});

function sendChat() {
    const text = el.userInput.value.trim();
    if (!text || STATE.locked) return;

    addBubble(text, "user");
    el.userInput.value = "";
    STATE.locked = true;

    setTimeout(() => {
        furinaReply(text.toLowerCase());
        STATE.locked = false;
    }, 700);
}