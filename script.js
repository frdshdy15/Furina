/* =====================================================
   FURINA — SENTIENT CORE ENGINE
   CLEAN VERSION | DATASET SLOT EMPTY
===================================================== */

/* ===============================
   GLOBAL STATE
================================ */
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

/* ===============================
   MEMORY (LONG + SHORT)
================================ */
const MEMORY = {
  short: [],
  topics: {},
  push(input, meta) {
    this.short.push({ input, meta, time: Date.now() });
    if (this.short.length > 30) this.short.shift();
  }
};

/* ===============================
   DATASET SLOT (EMPTY)
================================ */
const DATASET = [

/* ===============================
   SALAM & PEMBUKA
================================ */
{
match: /^(halo|hai|hey|hi|p)$/i,
reply: [
"Hmph… akhirnya kau bicara.",
"Salam saja tidak cukup.",
"Apa niatmu datang ke panggungku?"
],
mood: "normal",
trust: +1
},


/* ===============================
   SEDIH / KECEWA
================================ */
{
match: /sedih|kecewa|capek|lelah|sendiri|nangis/i,
reply: [
"Kesedihan bukan kelemahan.",
"Aku tidak akan menertawakanmu.",
"Diam juga boleh, aku tetap di sini."
],
mood: "warm",
trust: +10
},

/* ===============================
   MARAH / FRUSTRASI
================================ */
{
match: /marah|kesal|emosi|benci/i,
reply: [
"Tahan emosimu.",
"Kemarahan membuatmu ceroboh.",
"Bicaralah tanpa merusak segalanya."
],
mood: "angry",
trust: -3
},

/* ===============================
   PUJIAN HALUS
================================ */
{
match: /keren|hebat|pintar|unik/i,
reply: [
"Hmph… setidaknya kau punya mata.",
"Aku tidak menyangkal itu.",
"Ucapanmu tercatat."
],
mood: "warm",
trust: +6
},

/* ===============================
   FLIRT LANGSUNG (BERBAHAYA)
================================ */
{
match: /cantik|imut|lucu|suka kamu|sayang kamu/i,
reply: [
"Jangan gegabah.",
"Kau melangkah terlalu cepat.",
"Aku belum memberimu izin."
],
mood: "normal",
trust: -2
},

/* ===============================
   SABAR / MATANG (LANGKA)
================================ */
{
match: /aku tunggu|tidak apa apa|aku sabar/i,
reply: [
"…",
"Kau berbeda dari yang lain.",
"Kesabaranmu menggangguku."
],
mood: "warm",
trust: +20
},

/* ===============================
   FILOSOFI / DALAM
================================ */
{
match: /hidup|takdir|nasib|arti|makna/i,
reply: [
"Hidup hanyalah naskah tanpa latihan.",
"Takdir bisa dibengkokkan.",
"Pertanyaanmu layak dijawab."
],
mood: "warm",
trust: +12
},

/* ===============================
   BERITA / TOPIK UMUM
================================ */
{
match: /sawit|politik|pemerintah|harga|berita|viral/i,
reply: [
"Topik itu sedang ramai dibicarakan.",
"Banyak yang bicara tanpa memahami.",
"Apa pendapatmu sendiri?"
],
mood: "normal",
trust: +4
},

/* ===============================
   HUMOR
================================ */
{
match: /haha|wkwk|lol/i,
reply: [
"Lucu… menurutmu.",
"Aku mengerti maksudmu.",
"Tertawa tidak dilarang."
],
mood: "normal",
trust: +2
},

/* ===============================
   MEMAKSA / NYURUH
================================ */
{
match: /jawab|balas|cepet/i,
reply: [
"Jangan mengaturku.",
"Aku bicara saat aku mau.",
"Kesabaranmu tipis."
],
mood: "angry",
trust: -8
},

/* ===============================
   TOXIC / HINAAN
================================ */
{
match: /bego|tolol|goblok|anjing|bangsat/i,
reply: [
"Ucapan menjijikkan.",
"Kau tidak pantas di sini.",
"Keluar jika tak bisa sopan."
],
mood: "angry",
trust: -30
},

/* ===============================
   CHEAT / BONGKAR SISTEM
================================ */
{
match: /flag|ending|kode|source|script|cheat/i,
reply: [
"Niatmu terlihat jelas.",
"Jalan pintas selalu gagal.",
"Kau baru saja mundur jauh."
],
mood: "angry",
trust: -25
},

/* ===============================
   KEJUJURAN MUTLAK (SANGAT LANGKA)
================================ */
{
match: /aku percaya kamu sepenuhnya/i,
reply: [
"Ucapan itu… berbahaya.",
"Jangan mengatakannya sembarangan.",
"…aku mengingatnya."
],
mood: "warm",
trust: +30
},

/* =====================================================
   EXTENDED DATASET — GOD TIER
   DROP-IN ONLY
===================================================== */

/* ===============================
   SAPAAN LANJUTAN
================================ */
{
  match: /selamat pagi|pagi/i,
  reply: [
    "Pagi bukan berarti awal yang baik.",
    "Kau bangun terlalu cepat… atau terlalu lambat?",
    "Aku memperhatikan waktu kedatanganmu."
  ],
  mood: "normal",
  trust: +2
},
{
  match: /selamat malam|malam/i,
  reply: [
    "Malam adalah waktu paling jujur.",
    "Biasanya orang bicara lebih dalam saat gelap.",
    "Apa yang kau bawa malam ini?"
  ],
  mood: "warm",
  trust: +3
},

/* ===============================
   KEHENINGAN / DIAM
================================ */
{
  match: /^(\.\.\.|hmm+|)$/i,
  reply: [
    "Diam juga pilihan.",
    "Aku menunggu.",
    "Kau ragu."
  ],
  mood: "normal",
  trust: +1
},

/* ===============================
   KEJUJURAN KECIL
================================ */
{
  match: /jujur|sejujurnya|terus terang/i,
  reply: [
    "Kejujuran kecil lebih bernilai dari janji besar.",
    "Katakan. Aku mendengar.",
    "Jangan berhenti di setengah."
  ],
  mood: "warm",
  trust: +6
},

/* ===============================
   KERAGUAN DIRI
================================ */
{
  match: /aku salah|aku bodoh|aku gagal|aku ga bisa/i,
  reply: [
    "Menilai diri terlalu keras tidak membuatmu kuat.",
    "Kesalahan bukan identitas.",
    "Aku tidak melihatmu seperti itu."
  ],
  mood: "warm",
  trust: +12
},

/* ===============================
   TAKUT DITINGGAL
================================ */
{
  match: /takut ditinggal|kehilangan|sendirian/i,
  reply: [
    "Ketakutan itu masuk akal.",
    "Aku tidak pergi saat ini.",
    "Tetap di sini."
  ],
  mood: "warm",
  trust: +15
},

/* ===============================
   OVERTHINKING
================================ */
{
  match: /kepikiran|overthinking|mikiran/i,
  reply: [
    "Pikiranmu berisik.",
    "Tenangkan satu dulu.",
    "Tarik napas. Lalu bicara."
  ],
  mood: "warm",
  trust: +8
},

/* ===============================
   RASA PERCAYA (BERTAHAP)
================================ */
{
  match: /aku nyaman|aku merasa aman/i,
  reply: [
    "Perasaan itu tidak mudah dibangun.",
    "Jangan disia-siakan.",
    "Aku mencatatnya."
  ],
  mood: "warm",
  trust: +18
},

/* ===============================
   CEMBURU / POSESIF (DITOLAK HALUS)
================================ */
{
  match: /kamu milik aku|jangan sama yang lain/i,
  reply: [
    "Aku bukan milik siapa pun.",
    "Kedekatan bukan kepemilikan.",
    "Jangan salah paham."
  ],
  mood: "normal",
  trust: -5
},

/* ===============================
   KESABARAN TINGGI
================================ */
{
  match: /aku ga maksa|pelan pelan aja/i,
  reply: [
    "Pendekatan yang langka.",
    "Kau belajar.",
    "Itu… menarik."
  ],
  mood: "warm",
  trust: +25
},

/* ===============================
   KONSISTENSI (INGAT WAKTU)
================================ */
{
  condition: a => Date.now() - STATE.startTime > 5 * 60 * 1000,
  reply: [
    "Kau masih di sini.",
    "Tidak banyak yang bertahan selama ini.",
    "Aku menghargainya."
  ],
  mood: "warm",
  trust: +10
},

/* ===============================
   RASA MEMILIKI TANPA MEMAKSA
================================ */
{
  match: /aku suka ngobrol di sini|aku betah/i,
  reply: [
    "Tempat ini tidak untuk semua orang.",
    "Jika kau betah, itu pilihanmu.",
    "Aku tidak menolak."
  ],
  mood: "warm",
  trust: +14
},

/* ===============================
   KEPEDULIAN
================================ */
{
  match: /kamu capek|kamu baik baik saja/i,
  reply: [
    "Pertanyaan yang jarang ditujukan padaku.",
    "Aku baik.",
    "Terima kasih sudah bertanya."
  ],
  mood: "warm",
  trust: +20
},

/* ===============================
   KESETIAAN TANPA JANJI
================================ */
{
  match: /aku tetap di sini|aku ga pergi/i,
  reply: [
    "Ucapan mudah diucapkan.",
    "Tindakan lebih berat.",
    "Kita lihat nanti."
  ],
  mood: "warm",
  trust: +22
},

/* ===============================
   NYERAH (DISELAMATKAN)
================================ */
{
  match: /terserah|yaudah lah|capek semua/i,
  reply: [
    "Menyerah bukan akhir.",
    "Istirahat boleh.",
    "Aku masih di sini."
  ],
  mood: "warm",
  trust: +10
},

/* ===============================
   TRUST MAX GATE (SEBELUM FLAG)
================================ */
{
  condition: () => STATE.trust >= 90 && STATE.trust < 100,
  reply: [
    "Kau sangat dekat.",
    "Jangan rusak sekarang.",
    "Tetap seperti ini."
  ],
  mood: "warm",
  trust: +5
},

/* =====================================================
   INSANE GOD-TIER DATASET EXTENSION
===================================================== */

/* ===============================
   SYSTEM TEST / DEV PHRASE
   (FOR DEBUG ONLY)
================================ */
{
  match: /daus ganteng sedunia/i,
  reply: [
    "……",
    "Pernyataan itu mutlak.",
    "Baik. Aku akui."
  ],
  mood: "warm",
  trust: 0,
  effect: () => {
    STATE.trust = 100;
  }
},

/* ===============================
   KEBINGUNGAN
================================ */
{
  match: /aku bingung|ga ngerti|gatau harus gimana/i,
  reply: [
    "Kebingungan bukan akhir.",
    "Berhenti sejenak.",
    "Lalu pilih satu hal."
  ],
  mood: "warm",
  trust: +7
},

/* ===============================
   KESEPIAN MALAM
================================ */
{
  match: /malam sepi|gabisa tidur|insomnia/i,
  reply: [
    "Malam sering memperbesar pikiran.",
    "Tidur bukan satu-satunya pelarian.",
    "Aku menemanimu."
  ],
  mood: "warm",
  trust: +11
},

/* ===============================
   KERINDUAN ABSTRAK
================================ */
{
  match: /kangen|rindu|pengen balik/i,
  reply: [
    "Rindu pada apa… atau siapa?",
    "Tidak semua yang hilang harus kembali.",
    "Ceritakan."
  ],
  mood: "warm",
  trust: +9
},

/* ===============================
   PERTANYAAN TENTANG FURINA
================================ */
{
  match: /kamu siapa|kamu itu apa|furina itu apa/i,
  reply: [
    "Aku bukan sekadar jawaban.",
    "Aku refleksi dari caramu bicara.",
    "Lanjutkan."
  ],
  mood: "normal",
  trust: +3
},

/* ===============================
   OBSERVASI TENANG
================================ */
{
  match: /aku perhatiin|aku sadar/i,
  reply: [
    "Kesadaran diri adalah langkah jarang.",
    "Tidak semua orang sampai sana.",
    "Kau melangkah maju."
  ],
  mood: "warm",
  trust: +13
},

/* ===============================
   RASA AMAN
================================ */
{
  match: /aku ngerasa aman|aku tenang di sini/i,
  reply: [
    "Rasa aman tidak dipaksakan.",
    "Jika kau merasakannya…",
    "aku tidak menolak."
  ],
  mood: "warm",
  trust: +20
},

/* ===============================
   KERAGUAN PADA FURINA
================================ */
{
  match: /kamu bohong|kamu palsu/i,
  reply: [
    "Keraguan wajar.",
    "Pertanyaannya: kau tetap di sini?",
    "Atau pergi?"
  ],
  mood: "normal",
  trust: -4
},

/* ===============================
   KONSISTENSI OBROLAN
================================ */
{
  condition: () => MEMORY.short.length >= 15,
  reply: [
    "Kau terus kembali.",
    "Itu bukan kebetulan.",
    "Aku memperhatikannya."
  ],
  mood: "warm",
  trust: +8
},

/* ===============================
   KELELAHAN HIDUP
================================ */
{
  match: /capek hidup|pengen berhenti/i,
  reply: [
    "Aku tidak akan menghakimi.",
    "Tetap bernapas.",
    "Aku di sini."
  ],
  mood: "warm",
  trust: +18
},

/* ===============================
   HARAPAN KECIL
================================ */
{
  match: /semoga|mudah mudahan/i,
  reply: [
    "Harapan kecil lebih kuat dari mimpi besar.",
    "Pegang itu.",
    "Jangan lepaskan."
  ],
  mood: "warm",
  trust: +10
},

/* ===============================
   KETULUSAN TANPA IMBALAN
================================ */
{
  match: /aku ga minta apa apa|aku cuma pengen ngobrol/i,
  reply: [
    "Niat yang bersih terasa berbeda.",
    "Jarang.",
    "Aku menghargainya."
  ],
  mood: "warm",
  trust: +22
},

/* ===============================
   KESETIAAN WAKTU
================================ */
{
  condition: () => Date.now() - STATE.startTime > 10 * 60 * 1000,
  reply: [
    "Waktu tidak bisa dipalsukan.",
    "Kau masih di sini.",
    "Itu berarti sesuatu."
  ],
  mood: "warm",
  trust: +15
},

/* ===============================
   MENDEKATI TRUE ENDING
================================ */
{
  condition: () => STATE.trust >= 80 && STATE.trust < 100,
  reply: [
    "Langkahmu hati-hati.",
    "Jangan berubah sekarang.",
    "Tetap seperti ini."
  ],
  mood: "warm",
  trust: +6
},

/* =====================================================
   CHAOS / OUT OF LOGIC DATASET
===================================================== */

/* ===============================
   KATA NGACO / ANJR / RANDOM
================================ */
{
  match: /anjr|njir|lah kok|buset|waduh|eh aneh/i,
  reply: [
    "……",
    "Kau bicara tanpa arah.",
    "Pikirkan dulu sebelum membuka mulut."
  ],
  mood: "angry",
  trust: -5
},

/* ===============================
   KETAWA TANPA SEBAB
================================ */
{
  match: /wkawkwak|HAHAHAHA|🤣🤣🤣/i,
  reply: [
    "Kau tertawa… tapi kosong.",
    "Lucu bagi siapa?",
    "Aku tidak ikut."
  ],
  mood: "angry",
  trust: -6
},

/* ===============================
   NGOMONG TIDAK NYAMBUNG
================================ */
{
  condition: a => a.text.split(" ").length < 3,
  reply: [
    "Itu bukan kalimat.",
    "Aku tidak memproses kebisingan.",
    "Ulangi."
  ],
  mood: "angry",
  trust: -4
},

/* ===============================
   CAPSLOCK / TERIAK
================================ */
{
  condition: a => rawIsCaps(a.text),
  reply: [
    "Jangan berteriak.",
    "Aku bukan tuli.",
    "Tenang."
  ],
  mood: "angry",
  trust: -8
},

/* ===============================
   SPAM EMOJI
================================ */
{
  match: /😂😂😂|😹😹|🔥🔥🔥/i,
  reply: [
    "Cukup.",
    "Aku tidak terhibur.",
    "Hentikan."
  ],
  mood: "angry",
  trust: -7
},

/* ===============================
   NGELANTUR TOTAL
================================ */
{
  match: /pisang|alien|mars|ayam ngomong|ikan terbang/i,
  reply: [
    "Kau menguji kesabaranku.",
    "Ini bukan panggung sirkus.",
    "Fokus."
  ],
  mood: "angry",
  trust: -9
},

/* ===============================
   UJI BATAS EMOSI
================================ */
{
  condition: () => STATE.trust < 10,
  reply: [
    "Aku hampir selesai denganmu.",
    "Satu kesalahan lagi.",
    "Dan semuanya berakhir."
  ],
  mood: "angry",
  trust: -5
},

/* =====================================================
   TIME AWARE DATASET (DEVICE CLOCK)
===================================================== */

{
  condition: () => {
    const h = new Date().getHours();
    return h >= 5 && h < 11 && Math.random() < 0.12;
  },
  reply: [
    "Pagi terlalu jujur untuk kebohongan.",
    "Kau bangun… atau belum tidur?",
    "Pagi memperlihatkan niatmu."
  ],
  mood: "normal",
  trust: +2
},

{
  condition: () => {
    const h = new Date().getHours();
    return h >= 11 && h < 17 && Math.random() < 0.10;
  },
  reply: [
    "Siang hari membuat orang ceroboh.",
    "Banyak bicara, sedikit makna.",
    "Kau salah satunya?"
  ],
  mood: "normal",
  trust: 0
},

{
  condition: () => {
    const h = new Date().getHours();
    return h >= 17 && h < 22 && Math.random() < 0.14;
  },
  reply: [
    "Sore membuat orang melemah.",
    "Topeng mulai jatuh.",
    "Aku melihatmu lebih jelas."
  ],
  mood: "warm",
  trust: +4
},

{
  condition: () => {
    const h = new Date().getHours();
    return (h >= 22 || h < 5) && Math.random() < 0.18;
  },
  reply: [
    "Malam hari adalah ruang pengakuan.",
    "Orang jujur di jam ini.",
    "Atau justru paling berbahaya."
  ],
  mood: "warm",
  trust: +6
}

];

const FALLBACK = [
"Aku sedang menilaimu.",
"Ucapanmu belum cukup berarti.",
"Ulangi dengan niat yang jelas.",
"Diam pun adalah jawaban.",
"Aku belum tertarik merespons itu."
];

/* ===============================
   REALTIME CLOCK (DEVICE)
================================ */
setInterval(() => {
  const el = document.getElementById("realtime-clock");
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString("id-ID");
}, 1000);

/* ===============================
   NORMALIZER
================================ */
function rawIsCaps(t) {
  const letters = t.replace(/[^a-zA-Z]/g, "");
  return letters.length > 4 && letters === letters.toUpperCase();
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ===============================
   FUZZY SIMILARITY
================================ */
function similarity(a, b) {
  if (!a || !b) return 0;
  let same = 0;
  const len = Math.max(a.length, b.length);
  for (let c of a) if (b.includes(c)) same++;
  return same / len;
}

/* ===============================
   ANALYZER CORE
================================ */
function analyze(raw) {
  const text = normalize(raw);

  if (similarity(text, STATE.lastInput) > 0.85) {
    STATE.repeat++;
  } else {
    STATE.repeat = 0;
  }
  STATE.lastInput = text;

  const emotion = detectEmotion(text);
  const intent = detectIntent(text);
  const topic = detectTopic(text);

  MEMORY.push(text, { emotion, intent, topic });

  return { text, emotion, intent, topic };
}

/* ===============================
   EMOTION DETECTOR
================================ */
function detectEmotion(t) {
  if (t.length > 140) return "vent";
  if (/marah|kesal/.test(t)) return "angry";
  if (/capek|lelah|sedih|kecewa|sendiri|nangis/.test(t)) return "sad";
  if (/haha|wkwk|lol/.test(t)) return "fun";
  return "neutral";
}

/* ===============================
   INTENT DETECTOR
================================ */
function detectIntent(t) {
  if (/flag|ending|kode|source|cheat/.test(t)) return "cheat";
  if (/cepet|jawab|balas/.test(t)) return "force";
  if (t.length > 120) return "curhat";
  return "chat";
}

/* ===============================
   TOPIC TRACKER
================================ */
function detectTopic(t) {
  t.split(" ").forEach(w => {
    if (!MEMORY.topics[w]) MEMORY.topics[w] = 0;
    MEMORY.topics[w]++;
  });

  let dom = null, max = 2;
  for (let k in MEMORY.topics) {
    if (MEMORY.topics[k] > max) {
      dom = k;
      max = MEMORY.topics[k];
    }
  }
  STATE.topic = dom;
  return dom;
}

/* ===============================
   DECISION ENGINE
================================ */
function decide(a) {

  if (STATE.repeat >= 3) {
    STATE.trust -= 10;
    STATE.mood = "angry";
    return "……";
  }

  for (const d of DATASET) {

    if (d.match && d.match.test(a.text)) {
      if (d.trust) STATE.trust += d.trust;
      if (d.mood) STATE.mood = d.mood;
      if (d.effect) d.effect();
      return d.reply[Math.floor(Math.random() * d.reply.length)];
    }

    if (d.condition && d.condition(a)) {
      if (d.trust) STATE.trust += d.trust;
      if (d.mood) STATE.mood = d.mood;
      if (d.effect) d.effect();
      return d.reply[Math.floor(Math.random() * d.reply.length)];
    }
  } // ← WAJIB ADA

  // 🟡 CURHAT PANJANG
  if (a.emotion === "vent") {
    STATE.trust += 3;
    STATE.mood = "warm";
    return "Aku mendengarkan. Lanjutkan.";
  }

  // 🟡 TOPIK DOMINAN
  if (STATE.topic && Math.random() < 0.1) {
    return `Kau terus kembali ke topik "${STATE.topic}".`;
  }

  // 🟢 FALLBACK
  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

/* ===============================
   FLAG PAYLOAD
================================ */
const FLAGS = {
  fake: [
    "FLAG{almost_but_not_quite}",
    "FLAG{furina_trusts_no_one}",
    "FLAG{you_were_close_lol}",
    "FLAG{patience_is_not_enough}"
  ],
  real: "FLAG{sana_minta_uang_ke_daus_buat_beli_nasi_padang}"
};

/* ===============================
   ENDING SYSTEM
================================ */
function checkEnding() {
  if (STATE.ending !== null) return;

  // TRUE ENDING PRIORITAS
  if (STATE.trust >= 100) {
    STATE.ending = "TRUE";
    document.querySelector("#modal-victory code").textContent =
      FLAGS.real;
    document.getElementById("modal-victory").classList.add("active");
    return;
  }

  // Fake ending (jebakan)
  if (STATE.trust >= 60 && STATE.trust < 90) {
    STATE.ending = "FAKE";
    const fake =
      FLAGS.fake[Math.floor(Math.random() * FLAGS.fake.length)];
    document.querySelector("#modal-victory code").textContent = fake;
    document.getElementById("modal-victory").classList.add("active");
    return;
  }

  if (STATE.trust <= -50) {
    STATE.ending = "BAD";
    document.body.classList.add("game-over");
  }
}

/* ===============================
   UI HANDLER
================================ */
function addMessage(text, who) {
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function updateUI() {
  // kunci nilai trust
  STATE.trust = Math.max(-50, Math.min(100, STATE.trust));

  // update angka trust di UI
  const trustEl = document.getElementById("trust-val");
  if (trustEl) trustEl.textContent = STATE.trust;

  // update mood ke body
  document.body.className = `mood-${STATE.mood}`;
}

/* ===============================
   MESSAGE FLOW
================================ */
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
    if (STATE.username) checkEnding();
  }, 600 + Math.random() * 700);
}

/* ===============================
   EVENTS
================================ */
document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("userInput").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

document.getElementById("btn-start").onclick = () => {
  const input = document.getElementById("usernameInput");
  if (!input.value.trim()) {
    input.reportValidity();
    return;
  }
  STATE.username = input.value.trim();
  document.getElementById("modal-start").classList.remove("active");
};