"use strict";

const TOTAL_BITS = 160;

const elements = {
  messageInput: document.querySelector("#message-input"),
  characterCount: document.querySelector("#character-count"),
  hashStatus: document.querySelector("#hash-status"),
  hashResult: document.querySelector("#hash-result"),
  resultMessage: document.querySelector("#result-message"),
  resultHash: document.querySelector("#result-hash"),
  originalInput: document.querySelector("#original-input"),
  modifiedInput: document.querySelector("#modified-input"),
  comparisonStatus: document.querySelector("#comparison-status"),
  comparisonResult: document.querySelector("#comparison-result"),
  comparisonOriginalMessage: document.querySelector("#comparison-original-message"),
  comparisonModifiedMessage: document.querySelector("#comparison-modified-message"),
  comparisonOriginalHash: document.querySelector("#comparison-original-hash"),
  comparisonModifiedHash: document.querySelector("#comparison-modified-hash"),
  hashDifference: document.querySelector("#hash-difference"),
  changedBits: document.querySelector("#changed-bits"),
  changedPercentage: document.querySelector("#changed-percentage"),
  sensitivityProgress: document.querySelector("#sensitivity-progress"),
  observation: document.querySelector("#observation")
};

// SHA-1 CORE INTEGRATION POINT
// Temporary browser implementation used until the team's Java SHA-1 implementation/API is connected.
function generateSHA1Fallback(message) {
  const bytes = Array.from(new TextEncoder().encode(message));
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  for (let shift = 7; shift >= 0; shift -= 1) bytes.push(Math.floor(bitLength / (2 ** (shift * 8))) & 0xff);

  let hash0 = 0x67452301;
  let hash1 = 0xefcdab89;
  let hash2 = 0x98badcfe;
  let hash3 = 0x10325476;
  let hash4 = 0xc3d2e1f0;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = new Array(80).fill(0);
    for (let index = 0; index < 16; index += 1) {
      const position = offset + index * 4;
      words[index] = (bytes[position] << 24) | (bytes[position + 1] << 16) | (bytes[position + 2] << 8) | bytes[position + 3];
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] = ((words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16]) << 1) | ((words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16]) >>> 31);
    }

    let a = hash0;
    let b = hash1;
    let c = hash2;
    let d = hash3;
    let e = hash4;
    for (let index = 0; index < 80; index += 1) {
      let functionValue;
      let constant;
      if (index < 20) {
        functionValue = (b & c) | (~b & d);
        constant = 0x5a827999;
      } else if (index < 40) {
        functionValue = b ^ c ^ d;
        constant = 0x6ed9eba1;
      } else if (index < 60) {
        functionValue = (b & c) | (b & d) | (c & d);
        constant = 0x8f1bbcdc;
      } else {
        functionValue = b ^ c ^ d;
        constant = 0xca62c1d6;
      }
      const rotatedA = (a << 5) | (a >>> 27);
      const temporary = (rotatedA + functionValue + e + words[index] + constant) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temporary;
    }
    hash0 = (hash0 + a) | 0;
    hash1 = (hash1 + b) | 0;
    hash2 = (hash2 + c) | 0;
    hash3 = (hash3 + d) | 0;
    hash4 = (hash4 + e) | 0;
  }

  return [hash0, hash1, hash2, hash3, hash4]
    .map(value => (value >>> 0).toString(16).padStart(8, "0"))
    .join("");
}

async function generateSHA1(message) {
  const bytes = new TextEncoder().encode(message);
  if (window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest("SHA-1", bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  }
  return generateSHA1Fallback(message);
}

function hexToBinary(hexHash) {
  return hexHash.split("").map(hexCharacter => parseInt(hexCharacter, 16).toString(2).padStart(4, "0")).join("");
}

// SENSITIVITY INTEGRATION POINT: replace this temporary local calculation with Asher's implementation when available.
function calculateSensitivity(originalHash, modifiedHash) {
  const originalBits = hexToBinary(originalHash);
  const modifiedBits = hexToBinary(modifiedHash);
  let changedBits = 0;

  for (let index = 0; index < TOTAL_BITS; index += 1) {
    if (originalBits[index] !== modifiedBits[index]) changedBits += 1;
  }

  return { changedBits, totalBits: TOTAL_BITS, percentageChanged: (changedBits / TOTAL_BITS) * 100 };
}

function setStatus(element, message) {
  element.textContent = message;
}

function updateCharacterCount() {
  elements.characterCount.textContent = `Characters: ${elements.messageInput.value.length}`;
}

function displayHashResult(message, hash) {
  elements.resultMessage.textContent = message;
  elements.resultHash.textContent = hash;
  elements.hashResult.classList.add("visible");
}

async function handleGenerateHash() {
  const message = elements.messageInput.value;
  setStatus(elements.hashStatus, "");
  if (!message) {
    elements.hashResult.classList.remove("visible");
    setStatus(elements.hashStatus, "Please enter a message.");
    elements.messageInput.focus();
    return;
  }

  try {
    displayHashResult(message, await generateSHA1(message));
  } catch {
    elements.hashResult.classList.remove("visible");
    setStatus(elements.hashStatus, "The message could not be hashed. Please try again.");
  }
}

function renderHashDifference(originalHash, modifiedHash) {
  elements.hashDifference.replaceChildren();
  for (let index = 0; index < originalHash.length; index += 1) {
    const character = document.createElement("span");
    character.textContent = originalHash[index];
    if (originalHash[index] !== modifiedHash[index]) character.className = "diff";
    elements.hashDifference.append(character);
  }
  elements.hashDifference.prepend("Original hash characters (differences highlighted): ");
}

function showObservation(originalMessage, modifiedMessage, changedBits) {
  if (originalMessage === modifiedMessage) {
    elements.observation.textContent = "The messages are identical, so their SHA-1 hashes are identical and no bits changed.";
  } else {
    elements.observation.textContent = `The modified input produced a different SHA-1 hash. ${changedBits} of 160 output bits changed in this comparison.`;
  }
}

function displayComparison(originalMessage, modifiedMessage, originalHash, modifiedHash, sensitivity) {
  elements.comparisonOriginalMessage.textContent = originalMessage;
  elements.comparisonModifiedMessage.textContent = modifiedMessage;
  elements.comparisonOriginalHash.textContent = originalHash;
  elements.comparisonModifiedHash.textContent = modifiedHash;
  renderHashDifference(originalHash, modifiedHash);
  elements.changedBits.textContent = `Changed Bits: ${sensitivity.changedBits} / ${sensitivity.totalBits}`;
  elements.changedPercentage.textContent = `${sensitivity.percentageChanged.toFixed(2)}%`;
  elements.sensitivityProgress.value = sensitivity.percentageChanged;
  showObservation(originalMessage, modifiedMessage, sensitivity.changedBits);
  elements.comparisonResult.classList.add("visible");
}

async function compareMessages() {
  const originalMessage = elements.originalInput.value;
  const modifiedMessage = elements.modifiedInput.value;
  setStatus(elements.comparisonStatus, "");
  if (!originalMessage || !modifiedMessage) {
    elements.comparisonResult.classList.remove("visible");
    setStatus(elements.comparisonStatus, !originalMessage ? "Please enter an original message." : "Please enter a modified message.");
    (!originalMessage ? elements.originalInput : elements.modifiedInput).focus();
    return;
  }

  try {
    const [originalHash, modifiedHash] = await Promise.all([generateSHA1(originalMessage), generateSHA1(modifiedMessage)]);
    displayComparison(originalMessage, modifiedMessage, originalHash, modifiedHash, calculateSensitivity(originalHash, modifiedHash));
  } catch {
    elements.comparisonResult.classList.remove("visible");
    setStatus(elements.comparisonStatus, "The messages could not be compared. Please try again.");
  }
}

function baseMessage() {
  return elements.originalInput.value || elements.messageInput.value || "Hello World";
}

function applyQuickTest(testName) {
  const originalMessage = baseMessage();
  let modifiedMessage = originalMessage;
  if (testName === "case") modifiedMessage = originalMessage === originalMessage.toLowerCase() ? originalMessage.toUpperCase() : originalMessage.toLowerCase();
  if (testName === "add") modifiedMessage = `${originalMessage}!`;
  if (testName === "remove") modifiedMessage = originalMessage.slice(0, -1);
  if (testName === "character" && originalMessage.length) {
    const index = originalMessage.length - 1;
    const replacement = originalMessage[index].toLowerCase() === "z" ? "a" : String.fromCharCode(originalMessage[index].charCodeAt(0) + 1);
    modifiedMessage = `${originalMessage.slice(0, index)}${replacement}`;
  }
  if (testName === "reset") modifiedMessage = originalMessage;
  elements.originalInput.value = originalMessage;
  elements.modifiedInput.value = modifiedMessage;
}

function resetExperiment() {
  elements.messageInput.value = "";
  elements.originalInput.value = "";
  elements.modifiedInput.value = "";
  elements.hashResult.classList.remove("visible");
  elements.comparisonResult.classList.remove("visible");
  setStatus(elements.hashStatus, "");
  setStatus(elements.comparisonStatus, "");
  updateCharacterCount();
}

function showToast(message) {
  const toast = document.querySelector("#toast-notice");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function selectPane(targetId) {
  const targetPane = document.querySelector(`#${targetId}`);
  if (!targetPane) return;

  document.querySelectorAll(".section-pane").forEach(pane => pane.classList.toggle("active", pane === targetPane));
  document.querySelectorAll(".nav-link").forEach(link => {
    const isActive = link.dataset.target === targetId;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-selected", String(isActive));
  });
  document.querySelector("#page-indicator").textContent = `${targetPane.dataset.index} / ${document.querySelectorAll(".section-pane").length}`;
}

function selectSimulationTab(tabName) {
  document.querySelectorAll(".sim-subtab-btn").forEach(button => button.classList.toggle("active", button.dataset.subtab === tabName));
  document.querySelectorAll(".sim-subpanel").forEach(panel => panel.classList.toggle("active", panel.id === `subpanel-${tabName}`));
}

function moveToPage(direction) {
  const panes = [...document.querySelectorAll(".section-pane")];
  const currentIndex = panes.findIndex(pane => pane.classList.contains("active"));
  const nextIndex = Math.max(0, Math.min(panes.length - 1, currentIndex + direction));
  selectPane(panes[nextIndex].id);
}

function applyFilter(filter) {
  document.querySelectorAll(".filter-pill").forEach(button => button.classList.toggle("active", button.dataset.filter === filter));
  document.querySelectorAll(".nav-item").forEach(item => {
    item.hidden = filter !== "all" && item.dataset.category !== filter;
  });
}

function copyHash() {
  const hash = elements.resultHash.textContent;
  if (!hash) {
    showToast("Generate a hash before copying it.");
    return;
  }

  navigator.clipboard.writeText(hash)
    .then(() => showToast("Hash copied to clipboard."))
    .catch(() => showToast("Copy is unavailable in this browser context."));
}

function inspectPadding() {
  const message = document.querySelector("#inspector-input").value;
  const bytes = new TextEncoder().encode(message);
  const messageBits = bytes.length * 8;
  const zeroBits = (448 - ((messageBits + 1) % 512) + 512) % 512;
  const totalBits = messageBits + 1 + zeroBits + 64;
  const lengthHex = messageBits.toString(16).padStart(16, "0");

  document.querySelector("#pad-orig-str").textContent = message;
  document.querySelector("#pad-orig-len").textContent = `${bytes.length} bytes = ${messageBits} bits`;
  document.querySelector("#pad-k-zeros").textContent = `1 bit '1' + ${zeroBits} zero bits = ${zeroBits + 1} padding bits`;
  document.querySelector("#pad-len-field").textContent = `0x${lengthHex} (${messageBits} in decimal)`;
  document.querySelector("#subpanel-padding-tab strong").textContent = `${totalBits} bits (${totalBits / 512} block${totalBits === 512 ? "" : "s"} of 16 words)`;
}

function submitQuiz() {
  let score = 0;
  const questions = document.querySelectorAll(".quiz-question-card");
  questions.forEach(question => {
    const answer = question.querySelector(`input[name="q${question.dataset.q}"]:checked`);
    const correct = answer && answer.value === question.dataset.correct;
    question.querySelectorAll(".quiz-option-label").forEach(label => {
      const input = label.querySelector("input");
      label.classList.toggle("correct", input.value === question.dataset.correct);
      label.classList.toggle("incorrect", Boolean(input.checked && !correct));
    });
    question.querySelector(`#exp-q${question.dataset.q}`).classList.add("visible");
    if (correct) score += 1;
  });
  const scoreBanner = document.querySelector("#quiz-score-banner");
  scoreBanner.textContent = `Score: ${score} / ${questions.length}`;
  scoreBanner.classList.add("visible");
}

function resetQuiz() {
  document.querySelector("#quiz-form").reset();
  document.querySelectorAll(".quiz-option-label").forEach(label => label.classList.remove("correct", "incorrect"));
  document.querySelectorAll(".quiz-explanation").forEach(explanation => explanation.classList.remove("visible"));
  document.querySelector("#quiz-score-banner").classList.remove("visible");
}

function setRating(rating) {
  document.querySelector("#fb-rating").value = rating;
  document.querySelectorAll(".star-btn").forEach(button => button.classList.toggle("active", Number(button.dataset.rating) <= rating));
}

function resetView() {
  document.documentElement.style.fontSize = "16px";
  selectPane("pane-aim");
  selectSimulationTab("hash-tab");
  applyFilter("all");
  document.querySelector("#sidebar-container").classList.remove("collapsed");
  document.querySelector("#resources-list").hidden = false;
  document.querySelector("#btn-sidebar-collapse").classList.remove("collapsed");
  resetExperiment();
  resetQuiz();
  showToast("View reset.");
}

function bindNavigationEvents() {
  document.querySelector("#btn-back").addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
    else showToast("You are already at the first page.");
  });
  document.querySelector("#btn-share").addEventListener("click", () => {
    const shareData = { title: document.title, text: "SHA-1 Virtual Cryptography Lab", url: window.location.href };
    if (navigator.share) navigator.share(shareData).catch(() => {});
    else navigator.clipboard.writeText(window.location.href).then(() => showToast("Page link copied to clipboard.")).catch(() => showToast("Sharing is unavailable here."));
  });
  document.querySelector("#btn-menu-toggle").addEventListener("click", () => document.querySelector("#sidebar-container").scrollIntoView({ behavior: "smooth", block: "start" }));
  document.querySelector("#btn-prev-page").addEventListener("click", () => moveToPage(-1));
  document.querySelector("#btn-next-page").addEventListener("click", () => moveToPage(1));
  document.querySelector("#btn-reset-view").addEventListener("click", resetView);
  document.querySelector("#btn-font-decrease").addEventListener("click", () => {
    document.documentElement.style.fontSize = `${Math.max(14, parseFloat(getComputedStyle(document.documentElement).fontSize) - 1)}px`;
  });
  document.querySelector("#btn-font-increase").addEventListener("click", () => {
    document.documentElement.style.fontSize = `${Math.min(20, parseFloat(getComputedStyle(document.documentElement).fontSize) + 1)}px`;
  });
  document.querySelector("#btn-read-aloud").addEventListener("click", () => {
    if (!window.speechSynthesis) return showToast("Read aloud is unavailable in this browser.");
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      document.querySelector("#read-aloud-text").textContent = "Read Aloud";
      return;
    }
    const utterance = new SpeechSynthesisUtterance(document.querySelector(".section-pane.active").innerText);
    utterance.rate = Number(document.querySelector("#select-speech-speed").value);
    const selectedVoice = document.querySelector("#select-speech-voice").value;
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === selectedVoice) || null;
    utterance.onend = () => { document.querySelector("#read-aloud-text").textContent = "Read Aloud"; };
    speechSynthesis.speak(utterance);
    document.querySelector("#read-aloud-text").textContent = "Stop Reading";
  });
  document.querySelector("#select-speech-voice").addEventListener("focus", () => {
    const voiceSelect = document.querySelector("#select-speech-voice");
    if (voiceSelect.options.length > 1) return;
    speechSynthesis.getVoices().forEach(voice => voiceSelect.add(new Option(voice.name, voice.name)));
  });
  document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => selectPane(link.dataset.target)));
  document.querySelectorAll(".filter-pill").forEach(button => button.addEventListener("click", () => applyFilter(button.dataset.filter)));
  document.querySelectorAll(".sim-subtab-btn").forEach(button => button.addEventListener("click", () => selectSimulationTab(button.dataset.subtab)));
  document.querySelector("#btn-sidebar-collapse").addEventListener("click", () => {
    const list = document.querySelector("#resources-list");
    list.hidden = !list.hidden;
    document.querySelector("#btn-sidebar-collapse").classList.toggle("collapsed", list.hidden);
  });
  document.querySelector("#btn-copy-hash").addEventListener("click", copyHash);
  document.querySelector("#btn-inspect-padding").addEventListener("click", inspectPadding);
  document.querySelector("#btn-submit-quiz").addEventListener("click", submitQuiz);
  document.querySelector("#btn-reset-quiz").addEventListener("click", resetQuiz);
  document.querySelectorAll(".star-btn").forEach(button => button.addEventListener("click", () => setRating(Number(button.dataset.rating))));
  document.querySelector("#feedback-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    document.querySelector("#feedback-success").classList.add("visible");
    event.currentTarget.reset();
    setRating(5);
  });
}

function bindEvents() {
  elements.messageInput.addEventListener("input", updateCharacterCount);
  document.querySelector("#generate-button").addEventListener("click", handleGenerateHash);
  document.querySelector("#clear-button").addEventListener("click", resetExperiment);
  document.querySelector("#compare-button").addEventListener("click", compareMessages);
  document.querySelectorAll("[data-test]").forEach(button => button.addEventListener("click", () => applyQuickTest(button.dataset.test)));
  bindNavigationEvents();
}

async function runKnownVectorTests() {
  const testVectors = [
    ["abc", "a9993e364706816aba3e25717850c26c9cd0d89d"],
    ["", "da39a3ee5e6b4b0d3255bfef95601890afd80709"]
  ];
  for (const [message, expectedHash] of testVectors) {
    if (await generateSHA1(message) !== expectedHash) throw new Error("SHA-1 test vector failed");
  }
}

bindEvents();
updateCharacterCount();
runKnownVectorTests().catch(() => setStatus(elements.hashStatus, "SHA-1 self-check failed. Please reload the experiment."));
