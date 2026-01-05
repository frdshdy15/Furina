/* =====================================================
   FURINA — SENTIENT CORE ENGINE (PRO EDITION)
   OPTIMIZED FOR 1000+ DATASET ROWS
===================================================== */

"use strict";

const STATE = {
  username: null,
  trust: 20,
  mood: "normal",
  ending: null,
  topic: null,
  lastInput: "",
  repeat: 0,
  startTime: Date.now()
};

const MEMORY = {
  short: [],
  topics: {},
  push(input, meta) {
    this.short.push({ input, meta, time: Date.now() });
    if (this.short.length > 30) this.short.shift();
  }
};

/**
 * DATASET AREA 
 * Kamu bisa terus menambah baris di sini hingga ribuan.
 * Struktur: { match: /regex/i, reply: [], mood: string, trust: number, effect: func }
 */
const DATASET = [
    // --- SEMUA DATASET YANG KAMU BERIKAN TADI ADA DI SINI ---
    { match: /^(halo|hai|hey|hi|p)$/i, reply: ["Hmph… akhirnya kau bicara.", "Salam saja tidak cukup.", "Apa niatmu datang ke panggungku?"], mood: "normal", trust: 1 },
    { match: /sedih|kecewa|capek|lelah|sendiri|nangis/i, reply: ["Kesedihan bukan kelemahan.", "Aku tidak akan menertawakanmu.", "Diam juga boleh, aku tetap di sini."], mood: "warm", trust: 10 },
    { match: /marah|kesal|emosi|benci/i, reply: ["Tahan emosimu.", "Kemarahan membuatmu ceroboh.", "Bicaralah tanpa merusak segalanya."], mood: "angry", trust: -3 },
    { match: /keren|hebat|pintar|unik/i, reply: ["Hmph… setidaknya kau punya mata.", "Aku tidak menyangkal itu.", "Ucapanmu tercatat."], mood: "warm", trust: 6 },
    { match: /cantik|imut|lucu|suka kamu|sayang kamu/i, reply: ["Jangan gegabah.", "Kau melangkah terlalu cepat.", "Aku belum memberimu izin."], mood: "normal", trust: -2 },
    { match: /aku tunggu|tidak apa apa|aku sabar/i, reply: ["…", "Kau berbeda dari yang lain.", "Kesabaranmu menggangguku."], mood: "warm", trust: 20 },
    { match: /hidup|takdir|nasib|arti|makna/i, reply: ["Hidup hanyalah naskah tanpa latihan.", "Takdir bisa dibengkokkan.", "Pertanyaanmu layak dijawab."], mood: "warm", trust: 12 },
    { match: /sawit|politik|pemerintah|harga|berita|viral/i, reply: ["Topik itu sedang ramai dibicarakan.", "Banyak yang bicara tanpa memahami.", "Apa pendapatmu sendiri?"], mood: "normal", trust: 4 },
    { match: /haha|wkwk|lol/i, reply: ["Lucu… menurutmu.", "Aku mengerti maksudmu.", "Tertawa tidak dilarang."], mood: "normal", trust: 2 },
    { match: /jawab|balas|cepet/i, reply: ["Jangan mengaturku.", "Aku bicara saat aku mau.", "Kesabaranmu tipis."], mood: "angry", trust: -8 },
    { match: /bego|tolol|goblok|anjing|bangsat/i, reply: ["Ucapan menjijikkan.", "Kau tidak pantas di sini.", "Keluar jika tak bisa sopan."], mood: "angry", trust: -30 },
    { match: /flag|ending|kode|source|script|cheat/i, reply: ["Niatmu terlihat jelas.", "Jalan pintas selalu gagal.", "Kau baru saja mundur jauh."], mood: "angry", trust: -25 },
    { match: /aku percaya kamu sepenuhnya/i, reply: ["Ucapan itu… berbahaya.", "Jangan mengatakannya sembarangan.", "…aku mengingatnya."], mood: "warm", trust: 30 },
    { match: /selamat pagi|pagi/i, reply: ["Pagi bukan berarti awal yang baik.", "Kau bangun terlalu cepat… atau terlalu lambat?", "Aku memperhatikan waktu kedatanganmu."], mood: "normal", trust: 2 },
    { match: /selamat malam|malam/i, reply: ["Malam adalah waktu paling jujur.", "Biasanya orang bicara lebih dalam saat gelap.", "Apa yang kau bawa malam ini?"], mood: "warm", trust: 3 },
    { match: /^(\.\.\.|hmm+|)$/i, reply: ["Diam juga pilihan.", "Aku menunggu.", "Kau ragu."], mood: "normal", trust: 1 },
    { match: /jujur|sejujurnya|terus terang/i, reply: ["Kejujuran kecil lebih bernilai dari janji besar.", "Katakan. Aku mendengar.", "Jangan berhenti di setengah."], mood: "warm", trust: 6 },
    { match: /aku salah|aku bodoh|aku gagal|aku ga bisa/i, reply: ["Menilai diri terlalu keras tidak membuatmu kuat.", "Kesalahan bukan identitas.", "Aku tidak melihatmu seperti itu."], mood: "warm", trust: 12 },
    { match: /takut ditinggal|kehilangan|sendirian/i, reply: ["Ketakutan itu masuk akal.", "Aku tidak pergi saat ini.", "Tetap di sini."], mood: "warm", trust: 15 },
    { match: /kepikiran|overthinking|mikiran/i, reply: ["Pikiranmu berisik.", "Tenangkan satu dulu.", "Tarik napas. Lalu bicara."], mood: "warm", trust: 8 },
    { match: /aku nyaman|aku merasa aman/i, reply: ["Perasaan itu tidak mudah dibangun.", "Jangan disia-siakan.", "Aku mencatatnya."], mood: "warm", trust: 18 },
    { match: /kamu milik aku|jangan sama yang lain/i, reply: ["Aku bukan milik siapa pun.", "Kedekatan bukan kepemilikan.", "Jangan salah paham."], mood: "normal", trust: -5 },
    { match: /aku ga maksa|pelan pelan aja/i, reply: ["Pendekatan yang langka.", "Kau belajar.", "Itu… menarik."], mood: "warm", trust: 25 },
    { match: /aku suka ngobrol di sini|aku betah/i, reply: ["Tempat ini tidak untuk semua orang.", "Jika kau betah, itu pilihanmu.", "Aku tidak menolak."], mood: "warm", trust: 14 },
    { match: /kamu capek|kamu baik baik saja/i, reply: ["Pertanyaan yang jarang ditujukan padaku.", "Aku baik.", "Terima kasih sudah bertanya."], mood: "warm", trust: 20 },
    { match: /aku tetap di sini|aku ga pergi/i, reply: ["Ucapan mudah diucapkan.", "Tindakan lebih berat.", "Kita lihat nanti."], mood: "warm", trust: 22 },
    { match: /terserah|yaudah lah|capek semua/i, reply: ["Menyerah bukan akhir.", "Istirahat boleh.", "Aku masih di sini."], mood: "warm", trust: 10 },
    { match: /daus ganteng sedunia/i, reply: ["……", "Pernyataan itu mutlak.", "Baik. Aku akui."], mood: "warm", trust: 0, effect: () => { STATE.trust = 100; } },
    { match: /aku bingung|ga ngerti|gatau harus gimana/i, reply: ["Kebingungan bukan akhir.", "Berhenti sejenak.", "Lalu pilih satu hal."], mood: "warm", trust: 7 },
    { match: /malam sepi|gabisa tidur|insomnia/i, reply: ["Malam sering memperbesar pikiran.", "Tidur bukan satu-satunya pelarian.", "Aku menemanimu."], mood: "warm", trust: 11 },
    { match: /kangen|rindu|pengen balik/i, reply: ["Rindu pada apa… atau siapa?", "Tidak semua yang hilang harus kembali.", "Ceritakan."], mood: "warm", trust: 9 },
    { match: /kamu siapa|kamu itu apa|furina itu apa/i, reply: ["Aku bukan sekadar jawaban.", "Aku refleksi dari caramu bicara.", "Lanjutkan."], mood: "normal", trust: 3 },
    { match: /aku perhatiin|aku sadar/i, reply: ["Kesadaran diri adalah langkah jarang.", "Tidak semua orang sampai sana.", "Kau melangkah maju."], mood: "warm", trust: 13 },
    { match: /aku ngerasa aman|aku tenang di sini/i, reply: ["Rasa aman tidak dipaksakan.", "Jika kau merasakannya…", "aku tidak menolak."], mood: "warm", trust: 20 },
    { match: /kamu bohong|kamu palsu/i, reply: ["Keraguan wajar.", "Pertanyaannya: kau tetap di sini?", "Atau pergi?"], mood: "normal", trust: -4 },
    { match: /capek hidup|pengen berhenti/i, reply: ["Aku tidak akan menghakimi.", "Tetap bernapas.", "Aku di sini."], mood: "warm", trust: 18 },
    { match: /semoga|mudah mudahan/i, reply: ["Harapan kecil lebih kuat dari mimpi besar.", "Pegang itu.", "Jangan lepaskan."], mood: "warm", trust: 10 },
    { match: /aku ga minta apa apa|aku cuma pengen ngobrol/i, reply: ["Niat yang bersih terasa berbeda.", "Jarang.", "Aku menghargainya."], mood: "warm", trust: 22 },
    { match: /anjr|njir|lah kok|buset|waduh|eh aneh/i, reply: ["……", "Kau bicara tanpa arah.", "Pikirkan dulu sebelum membuka mulut."], mood: "angry", trust: -5 },
    { match: /wkawkwak|HAHAHAHA|🤣🤣🤣/i, reply: ["Kau tertawa… tapi kosong.", "Lucu bagi siapa?", "Aku tidak ikut."], mood: "angry", trust: -6 },
    { match: /pisang|alien|mars|ayam ngomong|ikan terbang/i, reply: ["Kau menguji kesabaranku.", "Ini bukan panggung sirkus.", "Fokus."], mood: "angry", trust: -9 },

    // --- CONDITION BASED DATASET ---
    { condition: () => Date.now() - STATE.startTime > 5 * 60 * 1000, reply: ["Kau masih di sini.", "Tidak banyak yang bertahan selama ini.", "Aku menghargainya."], mood: "warm", trust: 10 },
    { condition: () => STATE.trust >= 90 && STATE.trust < 100, reply: ["Kau sangat dekat.", "Jangan rusak sekarang.", "Tetap seperti ini."], mood: "warm", trust: 5 },
    { condition: () => MEMORY.short.length >= 15, reply: ["Kau terus kembali.", "Itu bukan kebetulan.", "Aku memperhatikannya."], mood: "warm", trust: 8 },
    { condition: () => STATE.trust < 10, reply: ["Aku hampir selesai denganmu.", "Satu kesalahan lagi.", "Dan semuanya berakhir."], mood: "angry", trust: -5 },
    { condition: (a) => a.text.split(" ").length < 3, reply: ["Itu bukan kalimat.", "Aku tidak memproses kebisingan.", "Ulangi."], mood: "angry", trust: -4 },
    { condition: (a) => rawIsCaps(a.text), reply: ["Jangan berteriak.", "Aku bukan tuli.", "Tenang."], mood: "angry", trust: -8 }
];

const FALLBACK = [
  "Aku sedang menilaimu.",
  "Ucapanmu belum cukup berarti.",
  "Ulangi dengan niat yang jelas.",
  "Diam pun adalah jawaban.",
  "Aku belum tertarik merespons itu."
];

// --- CORE UTILITIES ---
function rawIsCaps(t) {
  const letters = t.replace(/[^a-zA-Z]/g, "");
  return letters.length > 4 && letters === letters.toUpperCase();
}

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function similarity(a, b) {
  if (!a || !b) return 0;
  let same = 0;
  const len = Math.max(a.length, b.length);
  const arrA = a.split("");
  for (let c of arrA) if (b.includes(c)) same++;
  return same / len;
}

// --- ENGINE ---
function analyze(raw) {
  const text = normalize(raw);
  if (similarity(text, STATE.lastInput) > 0.85) { STATE.repeat++; } else { STATE.repeat = 0; }
  STATE.lastInput = text;

  const emotion = (/marah|kesal/.test(text)) ? "angry" : (text.length > 140 ? "vent" : "neutral");
  const topic = detectTopic(text);
  MEMORY.push(text, { emotion });
  return { text, emotion, topic };
}

function detectTopic(t) {
  t.split(" ").forEach(w => { if (w.length > 3) { MEMORY.topics[w] = (MEMORY.topics[w] || 0) + 1; } });
  let dom = null, max = 2;
  for (let k in MEMORY.topics) { if (MEMORY.topics[k] > max) { dom = k; max = MEMORY.topics[k]; } }
  STATE.topic = dom;
  return dom;
}

function decide(a) {
  if (STATE.repeat >= 3) { STATE.trust -= 10; STATE.mood = "angry"; return "…… Jangan mengulang dirimu sendiri."; }

  // Search in Dataset
  for (const d of DATASET) {
    if (d.match && d.match.test(a.text)) {
      applyState(d);
      return getRandom(d.reply);
    }
    if (d.condition && d.condition(a)) {
      applyState(d);
      return getRandom(d.reply);
    }
  }

  // Time Aware (Added back & optimized)
  const hour = new Date().getHours();
  if (hour < 5 && Math.random() < 0.2) return "Malam hari adalah ruang pengakuan. Kenapa belum tidur?";

  if (a.emotion === "vent") { STATE.trust += 3; STATE.mood = "warm"; return "Aku mendengarkan. Lanjutkan semua bebanmu."; }
  
  return getRandom(FALLBACK);
}

function applyState(d) {
    if (d.trust) STATE.trust += d.trust;
    if (d.mood) STATE.mood = d.mood;
    if (d.effect) d.effect();
}

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// --- UI & FLOW ---
function updateUI() {
  STATE.trust = Math.max(-50, Math.min(100, STATE.trust));
  document.getElementById("trust-val").textContent = STATE.trust;
  document.body.className = `mood-${STATE.mood}`;
}

function addMessage(text, who) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  
  // Orb & Bubble logic
  const content = who === 'ai' ? `<div class="orb">🌙</div><div class="bubble"><p>${text}</p></div>` : `<div class="bubble"><p>${text}</p></div>`;
  div.innerHTML = content;
  
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function sendMessage() {
  if (!STATE.username) return;
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
  }, 600 + Math.random() * 500);
}

function checkEnding() {
  if (STATE.ending) return;
  if (STATE.trust >= 100) {
    triggerVictory("FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}");
  } else if (STATE.trust <= -40) {
    document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20%'>GAME OVER: Dibuang dari Fontaine</h1>";
  }
}

function triggerVictory(code) {
    STATE.ending = "TRUE";
    const modal = document.createElement("div");
    modal.className = "modal-overlay active";
    modal.innerHTML = `<div class="modal-window"><h2>SELAMAT!</h2><p>Kau memenangkan hati sang Diva.</p><div class="flag-box"><code>${code}</code></div><button onclick="location.reload()">Main Lagi</button></div>`;
    document.body.appendChild(modal);
}

// --- INITIALIZER ---
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("userInput").onkeydown = e => { if (e.key === "Enter") sendMessage(); };
document.getElementById("btn-start").onclick = () => {
  const input = document.getElementById("usernameInput");
  if (!input.value.trim()) return;
  STATE.username = input.value.trim();
  document.getElementById("modal-start").classList.remove("active");
};

setInterval(() => {
  const el = document.getElementById("realtime-clock");
  if (el) el.textContent = new Date().toLocaleTimeString("id-ID");
}, 1000);
