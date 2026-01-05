"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DATASET (1 dulu, gampang ditambah)
    ===================================================== */
    const FURINA_DB = {
        intro: "Hmph… akhirnya kau datang juga ke panggungku,",

        responses: [
            {
                keys: ["halo", "hai", "hey", "p"],
                reply: "Salam untuk penontonku. Jangan mengecewakanku.",
                trust: +3,
                mood: "NORMAL"
            }
        ],

        fallback: "Aku sedang menilaimu… hati-hati dengan ucapanmu.",

        avatar: {
            NORMAL: "5.jpeg",
            WARM: "4.jpeg",
            ANGRY: "2.jpeg"
        }
    };

    /* =====================================================
       STATE
    ===================================================== */
    const STATE = {
        name: "",
        trust: 20,
        mood: "NORMAL",
        busy: false
    };

    /* =====================================================
       ELEMENT
    ===================================================== */
    const modalStart = document.getElementById("modal-start");
    const btnStart   = document.getElementById("btn-start");
    const nameInput  = document.getElementById("usernameInput");

    const chatBox   = document.getElementById("chat-box");
    const userInput = document.getElementById("userInput");
    const sendBtn   = document.getElementById("sendBtn");

    const trustVal  = document.getElementById("trust-val");
    const moodLabel = document.getElementById("mood-label");
    const avatar    = document.getElementById("mini-avatar");

    /* =====================================================
       WAJIB: VALIDASI NATIVE HP
    ===================================================== */
    nameInput.setAttribute("required", "");
    nameInput.setAttribute("minlength", "1");

    /* =====================================================
       UI FUNCTION
    ===================================================== */
    function addBubble(text, type, img = null) {
        const div = document.createElement("div");
        div.className = `msg ${type}`;

        if (img) {
            const i = document.createElement("img");
            i.src = img;
            i.className = "chat-img-bubble";
            div.appendChild(i);
        }

        const p = document.createElement("p");
        p.textContent = text;
        div.appendChild(p);

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function updateUI() {
        trustVal.textContent = STATE.trust;
        moodLabel.textContent = STATE.mood;
        avatar.src = FURINA_DB.avatar[STATE.mood];
        document.body.className = `mood-${STATE.mood.toLowerCase()}`;
    }

    /* =====================================================
       START GAME (FIX UTAMA)
    ===================================================== */
    btnStart.addEventListener("click", () => {

        // ⛔️ biarin browser HP yang marah kalau kosong
        if (!nameInput.checkValidity()) {
            nameInput.reportValidity(); // ← ini kunci notif sistem HP
            return;
        }

        STATE.name = nameInput.value.trim();

        // Tutup modal
        modalStart.classList.remove("active");

        // Intro Furina
        setTimeout(() => {
            addBubble(
                `${FURINA_DB.intro} ${STATE.name}.`,
                "ai",
                FURINA_DB.avatar.NORMAL
            );
        }, 400);
    });

    /* =====================================================
       CHAT
    ===================================================== */
    sendBtn.addEventListener("click", sendChat);
    userInput.addEventListener("keydown", e => {
        if (e.key === "Enter") sendChat();
    });

    function sendChat() {
        if (STATE.busy) return;

        const text = userInput.value.trim();
        if (!text) return;

        addBubble(text, "user");
        userInput.value = "";
        STATE.busy = true;

        setTimeout(() => {
            replyLogic(text.toLowerCase());
            STATE.busy = false;
        }, 600);
    }

    function replyLogic(text) {
        let found = false;

        for (const data of FURINA_DB.responses) {
            if (data.keys.some(k => text.includes(k))) {
                STATE.trust += data.trust;
                STATE.mood = data.mood;
                addBubble(data.reply, "ai", FURINA_DB.avatar[STATE.mood]);
                found = true;
                break;
            }
        }

        if (!found) {
            addBubble(FURINA_DB.fallback, "ai", FURINA_DB.avatar[STATE.mood]);
        }

        updateUI();
    }

});