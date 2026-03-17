/* ================================================
   von den Sternschnuppen – FAQ Chatbot
   Regelbasiert, kein API-Key nötig
   ================================================ */

let faqData = [];
let chatOpen = false;

const greetings = ['hallo', 'hi', 'hey', 'guten tag', 'moin', 'servus', 'guten morgen', 'guten abend'];
const thanks    = ['danke', 'vielen dank', 'dankeschön', 'thx', 'merci'];

async function loadFaq() {
  try {
    const res = await fetch('data/faq.json');
    faqData = await res.json();
  } catch(e) {
    faqData = [];
  }
}

function findAnswer(input) {
  const query = input.toLowerCase().trim();

  // Grußformeln
  if (greetings.some(g => query.includes(g))) {
    return 'Hallo! Ich bin Mariens FAQ-Assistent. Womit kann ich Ihnen helfen? Sie können mich z.B. nach Preisen, der Rasse, dem Ablauf oder Besuchsmöglichkeiten fragen. 🐾';
  }

  // Dankeschön
  if (thanks.some(t => query.includes(t))) {
    return 'Gerne! Wenn Sie weitere Fragen haben, helfe ich Ihnen gern. Oder nehmen Sie direkt Kontakt mit Marie auf. 😊';
  }

  // Keyword-Matching
  let bestMatch = null;
  let bestScore = 0;

  for (const item of faqData) {
    const score = item.keywords.filter(kw => query.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch.answer;
  }

  // Fallback
  return 'Das weiß ich leider nicht genau. Ich empfehle Ihnen, direkt Kontakt mit Marie aufzunehmen – sie hilft Ihnen gern weiter! 📧 knorr.marie94@gmail.com';
}

function addMessage(text, type) {
  const container = document.getElementById('chatbot-messages');
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function handleSend() {
  const input = document.getElementById('chatbot-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';

  // Kurze Verzögerung für natürlicheres Gefühl
  setTimeout(() => {
    const answer = findAnswer(text);
    addMessage(answer, 'bot');
  }, 400);
}

function handleSuggestion(text) {
  const input = document.getElementById('chatbot-input');
  if (input) input.value = text;
  handleSend();
}

function toggleChatbot() {
  chatOpen = !chatOpen;
  const panel = document.getElementById('chatbot-panel');
  const toggle = document.getElementById('chatbot-toggle');
  if (!panel || !toggle) return;
  panel.classList.toggle('open', chatOpen);
  toggle.classList.toggle('open', chatOpen);

  if (chatOpen) {
    const input = document.getElementById('chatbot-input');
    if (input) setTimeout(() => input.focus(), 300);
  }
}

function initChatbot() {
  loadFaq();

  const toggle = document.getElementById('chatbot-toggle');
  const sendBtn = document.getElementById('chatbot-send');
  const input = document.getElementById('chatbot-input');
  const chips = document.querySelectorAll('.suggestion-chip');

  if (toggle) toggle.addEventListener('click', toggleChatbot);
  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSend();
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => handleSuggestion(chip.textContent));
  });

  // Begrüßungsnachricht
  setTimeout(() => {
    addMessage('Hallo! Ich beantworte gerne Ihre Fragen rund um unsere Zucht. Was möchten Sie wissen? 🌟', 'bot');
  }, 300);
}

document.addEventListener('DOMContentLoaded', initChatbot);
