"use strict";

/* ==========================================================================
   Virtual Cryptography Laboratory - SHA-1 Interactive Simulation & Lab Suite
   Core Logic & Frontend Interactions
   Developed by:
   - Swar (Frontend / UI & Lab Workflow)
   - Tanush Chavan (SHA-1 Core Reference & Testing)
   - Aaron Deniz (Interactive Simulation)
   - Asher (Sensitivity & Avalanche Calculation)
   ========================================================================== */

const TOTAL_BITS = 160;

// Main DOM Elements
const elements = {
  // Hash Generator
  messageInput: document.querySelector("#message-input"),
  characterCount: document.querySelector("#character-count"),
  hashStatus: document.querySelector("#hash-status"),
  hashResult: document.querySelector("#hash-result"),
  resultMessage: document.querySelector("#result-message"),
  resultHash: document.querySelector("#result-hash"),
  btnCopyHash: document.querySelector("#btn-copy-hash"),

  // Sensitivity Comparison
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
  observation: document.querySelector("#observation"),

  // Padding Inspector
  inspectorInput: document.querySelector("#inspector-input"),
  btnInspectPadding: document.querySelector("#btn-inspect-padding"),
  padOrigStr: document.querySelector("#pad-orig-str"),
  padOrigLen: document.querySelector("#pad-orig-len"),
  padKZeros: document.querySelector("#pad-k-zeros"),
  padLenField: document.querySelector("#pad-len-field"),

  // Navigation & Panes
  sectionPanes: document.querySelectorAll(".section-pane"),
  navLinks: document.querySelectorAll(".nav-link"),
  filterPills: document.querySelectorAll(".filter-pill"),
  pageIndicator: document.querySelector("#page-indicator"),
  btnPrevPage: document.querySelector("#btn-prev-page"),
  btnNextPage: document.querySelector("#btn-next-page"),
  btnBack: document.querySelector("#btn-back"),
  btnShare: document.querySelector("#btn-share"),
  btnSidebarCollapse: document.querySelector("#btn-sidebar-collapse"),
  resourcesList: document.querySelector("#resources-list"),

  // Speech & Accessibility
  btnReadAloud: document.querySelector("#btn-read-aloud"),
  readAloudText: document.querySelector("#read-aloud-text"),
  selectSpeechSpeed: document.querySelector("#select-speech-speed"),
  selectSpeechVoice: document.querySelector("#select-speech-voice"),
  btnFontIncrease: document.querySelector("#btn-font-increase"),
  btnFontDecrease: document.querySelector("#btn-font-decrease"),
  btnResetView: document.querySelector("#btn-reset-view"),
  contentContainer: document.querySelector("#content-container"),

  // Simulation Subtabs
  simSubtabs: document.querySelectorAll(".sim-subtab-btn"),
  simSubpanels: document.querySelectorAll(".sim-subpanel"),

  // Quiz
  quizForm: document.querySelector("#quiz-form"),
  btnSubmitQuiz: document.querySelector("#btn-submit-quiz"),
  btnResetQuiz: document.querySelector("#btn-reset-quiz"),
  quizScoreBanner: document.querySelector("#quiz-score-banner"),

  // Feedback
  feedbackForm: document.querySelector("#feedback-form"),
  feedbackSuccess: document.querySelector("#feedback-success"),
  starRating: document.querySelector("#star-rating"),
  fbRating: document.querySelector("#fb-rating"),

  // Toast
  toastNotice: document.querySelector("#toast-notice")
};

// ==========================================================================
// 1. SHA-1 Core Integration Point (Web Crypto API implementation)
// ==========================================================================
async function generateSHA1(message) {
  const bytes = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBinary(hexHash) {
  return hexHash
    .split("")
    .map(hexCharacter => parseInt(hexCharacter, 16).toString(2).padStart(4, "0"))
    .join("");
}

// ==========================================================================
// 2. Sensitivity Integration Point (Asher's Bitwise Sensitivity Analysis)
// ==========================================================================
function calculateSensitivity(originalHash, modifiedHash) {
  const originalBits = hexToBinary(originalHash);
  const modifiedBits = hexToBinary(modifiedHash);
  let changedBits = 0;

  for (let index = 0; index < TOTAL_BITS; index += 1) {
    if (originalBits[index] !== modifiedBits[index]) {
      changedBits += 1;
    }
  }

  return {
    changedBits,
    totalBits: TOTAL_BITS,
    percentageChanged: (changedBits / TOTAL_BITS) * 100
  };
}

// ==========================================================================
// 3. UI Helpers & Toast Notifications
// ==========================================================================
function showToast(message, duration = 3000) {
  if (!elements.toastNotice) return;
  elements.toastNotice.textContent = message;
  elements.toastNotice.classList.add("show");
  clearTimeout(elements.toastTimeout);
  elements.toastTimeout = setTimeout(() => {
    elements.toastNotice.classList.remove("show");
  }, duration);
}

function setStatus(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function updateCharacterCount() {
  if (elements.messageInput && elements.characterCount) {
    elements.characterCount.textContent = `Characters: ${elements.messageInput.value.length}`;
  }
}

// ==========================================================================
// 4. Interactive Simulation Handlers (Aaron's Implementation Preserved)
// ==========================================================================
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
    setStatus(elements.hashStatus, "Please enter a message to compute its hash.");
    elements.messageInput.focus();
    return;
  }

  try {
    const hash = await generateSHA1(message);
    displayHashResult(message, hash);
  } catch {
    elements.hashResult.classList.remove("visible");
    setStatus(elements.hashStatus, "The message could not be hashed. Please try again.");
  }
}

function renderHashDifference(originalHash, modifiedHash) {
  elements.hashDifference.replaceChildren();

  const titleSpan = document.createElement("strong");
  titleSpan.textContent = "Hexadecimal Difference View (Differences highlighted): ";
  elements.hashDifference.appendChild(titleSpan);

  const container = document.createElement("div");
  container.style.marginTop = "8px";

  for (let index = 0; index < originalHash.length; index += 1) {
    const character = document.createElement("span");
    character.textContent = modifiedHash[index];
    if (originalHash[index] !== modifiedHash[index]) {
      character.className = "diff-tag";
    }
    container.append(character);
  }
  elements.hashDifference.append(container);
}

function showObservation(originalMessage, modifiedMessage, changedBits, percentage) {
  if (originalMessage === modifiedMessage) {
    elements.observation.textContent =
      "The messages are identical, so their SHA-1 hashes are identical and 0 bits changed (0.00%).";
  } else {
    elements.observation.textContent =
      `Avalanche Effect Observed: Altering the input produced a dramatically different digest. Exactly ${changedBits} of 160 bits flipped (${percentage.toFixed(2)}%). Cryptographic hash functions aim for ~50% bit variance under any single-bit mutation.`;
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
  showObservation(originalMessage, modifiedMessage, sensitivity.changedBits, sensitivity.percentageChanged);
  elements.comparisonResult.classList.add("visible");
}

async function compareMessages() {
  const originalMessage = elements.originalInput.value;
  const modifiedMessage = elements.modifiedInput.value;
  setStatus(elements.comparisonStatus, "");

  if (!originalMessage || !modifiedMessage) {
    elements.comparisonResult.classList.remove("visible");
    setStatus(
      elements.comparisonStatus,
      !originalMessage ? "Please enter an original message." : "Please enter a modified message."
    );
    (!originalMessage ? elements.originalInput : elements.modifiedInput).focus();
    return;
  }

  try {
    const [originalHash, modifiedHash] = await Promise.all([
      generateSHA1(originalMessage),
      generateSHA1(modifiedMessage)
    ]);
    const sensitivity = calculateSensitivity(originalHash, modifiedHash);
    displayComparison(originalMessage, modifiedMessage, originalHash, modifiedHash, sensitivity);
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

  if (testName === "case") {
    modifiedMessage = originalMessage.length
      ? (originalMessage[0] === originalMessage[0].toLowerCase()
          ? originalMessage[0].toUpperCase()
          : originalMessage[0].toLowerCase()) + originalMessage.slice(1)
      : originalMessage;
  } else if (testName === "add") {
    modifiedMessage = `${originalMessage}!`;
  } else if (testName === "remove") {
    modifiedMessage = originalMessage.length > 1 ? originalMessage.slice(0, -1) : originalMessage;
  } else if (testName === "character" && originalMessage.length) {
    const index = originalMessage.length - 1;
    const replacement =
      originalMessage[index].toLowerCase() === "z"
        ? "a"
        : String.fromCharCode(originalMessage[index].charCodeAt(0) + 1);
    modifiedMessage = `${originalMessage.slice(0, index)}${replacement}`;
  } else if (testName === "reset") {
    modifiedMessage = originalMessage;
  }

  elements.originalInput.value = originalMessage;
  elements.modifiedInput.value = modifiedMessage;
  compareMessages();
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
  showToast("Simulation inputs cleared");
}

// ==========================================================================
// 5. Message Padding Inspector
// ==========================================================================
function inspectPadding() {
  const text = elements.inspectorInput ? elements.inspectorInput.value : "abc";
  const bytes = new TextEncoder().encode(text);
  const bitLength = bytes.length * 8;

  // k = (448 - 1 - bitLength) mod 512
  let k = (448 - 1 - (bitLength % 512)) % 512;
  if (k < 0) k += 512;

  const totalBits = bitLength + 1 + k + 64;
  const totalBlocks = totalBits / 512;

  if (elements.padOrigStr) elements.padOrigStr.textContent = text || "(empty string)";
  if (elements.padOrigLen) {
    elements.padOrigLen.textContent = `${bytes.length} bytes (${bitLength} bits)`;
  }
  if (elements.padKZeros) {
    elements.padKZeros.textContent = `1 bit ('1') + ${k} zero bits = ${k + 1} padding bits`;
  }
  if (elements.padLenField) {
    const hexLen = bitLength.toString(16).padStart(16, "0");
    elements.padLenField.textContent = `0x${hexLen} (${bitLength} bits in 64-bit Big-Endian)`;
  }
}

// ==========================================================================
// 6. Navigation, Paging & Section Switching
// ==========================================================================
let currentSectionIndex = 1;
const totalSections = elements.sectionPanes.length || 7;

function updatePageIndicator() {
  if (elements.pageIndicator) {
    elements.pageIndicator.textContent = `${currentSectionIndex} / ${totalSections}`;
  }
}

function switchSection(targetId) {
  elements.sectionPanes.forEach(pane => {
    if (pane.id === targetId) {
      pane.classList.add("active");
      currentSectionIndex = parseInt(pane.getAttribute("data-index"), 10) || 1;
    } else {
      pane.classList.remove("active");
    }
  });

  elements.navLinks.forEach(link => {
    if (link.getAttribute("data-target") === targetId) {
      link.classList.add("active");
      link.setAttribute("aria-selected", "true");
    } else {
      link.classList.remove("active");
      link.setAttribute("aria-selected", "false");
    }
  });

  updatePageIndicator();

  // Scroll to top of content
  if (elements.contentContainer) {
    elements.contentContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Stop speech if speaking new section
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    updateReadAloudButton(false);
  }
}

function navigatePage(direction) {
  let newIndex = currentSectionIndex + direction;
  if (newIndex < 1) newIndex = 1;
  if (newIndex > totalSections) newIndex = totalSections;

  const targetPane = document.querySelector(`.section-pane[data-index="${newIndex}"]`);
  if (targetPane) {
    switchSection(targetPane.id);
  }
}

// Filter tabs (All, Theory, Interactive)
function filterResources(category) {
  elements.filterPills.forEach(pill => {
    if (pill.getAttribute("data-filter") === category) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });

  const resourceItems = document.querySelectorAll(".nav-item");
  resourceItems.forEach(item => {
    const itemCat = item.getAttribute("data-category");
    if (category === "all" || itemCat === category) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}

// ==========================================================================
// 7. Speech Synthesis (Read Aloud Feature)
// ==========================================================================
let synthUtterance = null;

function populateVoices() {
  if (!window.speechSynthesis || !elements.selectSpeechVoice) return;
  const voices = window.speechSynthesis.getVoices();
  elements.selectSpeechVoice.innerHTML = '<option value="auto">Voice: Auto</option>';

  voices.forEach((voice, index) => {
    if (voice.lang.includes("en")) {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      elements.selectSpeechVoice.appendChild(option);
    }
  });
}

function updateReadAloudButton(isPlaying) {
  if (!elements.btnReadAloud || !elements.readAloudText) return;
  if (isPlaying) {
    elements.btnReadAloud.classList.add("playing");
    elements.readAloudText.textContent = "Stop Audio";
  } else {
    elements.btnReadAloud.classList.remove("playing");
    elements.readAloudText.textContent = "Read Aloud";
  }
}

function toggleReadAloud() {
  if (!("speechSynthesis" in window)) {
    showToast("Speech synthesis is not supported in this browser.");
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    updateReadAloudButton(false);
    return;
  }

  const activePane = document.querySelector(".section-pane.active");
  if (!activePane) return;

  const textToRead = activePane.innerText;
  synthUtterance = new SpeechSynthesisUtterance(textToRead);

  // Speed
  const rate = parseFloat(elements.selectSpeechSpeed ? elements.selectSpeechSpeed.value : 1) || 1;
  synthUtterance.rate = rate;

  // Voice
  const voiceIdx = elements.selectSpeechVoice ? elements.selectSpeechVoice.value : "auto";
  if (voiceIdx !== "auto") {
    const voices = window.speechSynthesis.getVoices();
    if (voices[voiceIdx]) synthUtterance.voice = voices[voiceIdx];
  }

  synthUtterance.onend = () => updateReadAloudButton(false);
  synthUtterance.onerror = () => updateReadAloudButton(false);

  window.speechSynthesis.speak(synthUtterance);
  updateReadAloudButton(true);
}

// ==========================================================================
// 8. Accessibility: Font Resizing
// ==========================================================================
let currentFontSize = 16;

function adjustFontSize(delta) {
  currentFontSize += delta;
  if (currentFontSize < 13) currentFontSize = 13;
  if (currentFontSize > 22) currentFontSize = 22;

  if (elements.contentContainer) {
    elements.contentContainer.style.fontSize = `${currentFontSize}px`;
  }
  showToast(`Font size: ${currentFontSize}px`);
}

// ==========================================================================
// 9. Interactive Quiz Logic
// ==========================================================================
function evaluateQuiz() {
  const cards = document.querySelectorAll(".quiz-question-card");
  let score = 0;
  let allAnswered = true;

  cards.forEach(card => {
    const qNum = card.getAttribute("data-q");
    const correct = card.getAttribute("data-correct");
    const selectedInput = card.querySelector(`input[name="q${qNum}"]:checked`);
    const explanation = card.querySelector(".quiz-explanation");
    const optionLabels = card.querySelectorAll(".quiz-option-label");

    // Clear previous colors
    optionLabels.forEach(lbl => lbl.classList.remove("correct", "incorrect"));

    if (!selectedInput) {
      allAnswered = false;
    } else {
      const selectedValue = selectedInput.value;
      const parentLabel = selectedInput.closest(".quiz-option-label");

      if (selectedValue === correct) {
        score += 1;
        if (parentLabel) parentLabel.classList.add("correct");
      } else {
        if (parentLabel) parentLabel.classList.add("incorrect");
        const correctInput = card.querySelector(`input[name="q${qNum}"][value="${correct}"]`);
        if (correctInput) {
          const correctLabel = correctInput.closest(".quiz-option-label");
          if (correctLabel) correctLabel.classList.add("correct");
        }
      }

      if (explanation) explanation.classList.add("visible");
    }
  });

  if (!allAnswered) {
    showToast("Please attempt all questions before submitting.");
  }

  if (elements.quizScoreBanner) {
    const percent = Math.round((score / cards.length) * 100);
    elements.quizScoreBanner.textContent = `Quiz Result: You scored ${score} out of ${cards.length} (${percent}%).`;
    elements.quizScoreBanner.classList.add("visible");
    elements.quizScoreBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function resetQuiz() {
  if (elements.quizForm) elements.quizForm.reset();

  const explanations = document.querySelectorAll(".quiz-explanation");
  explanations.forEach(exp => exp.classList.remove("visible"));

  const optionLabels = document.querySelectorAll(".quiz-option-label");
  optionLabels.forEach(lbl => lbl.classList.remove("correct", "incorrect"));

  if (elements.quizScoreBanner) {
    elements.quizScoreBanner.classList.remove("visible");
    elements.quizScoreBanner.textContent = "";
  }
  showToast("Quiz answers reset");
}

// ==========================================================================
// 10. Feedback Star Rating & Form Handler
// ==========================================================================
function setupStarRating() {
  if (!elements.starRating) return;
  const stars = elements.starRating.querySelectorAll(".star-btn");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.getAttribute("data-rating"), 10);
      if (elements.fbRating) elements.fbRating.value = rating;

      stars.forEach(s => {
        const val = parseInt(s.getAttribute("data-rating"), 10);
        if (val <= rating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });
}

function handleFeedbackSubmit(event) {
  event.preventDefault();
  const name = document.querySelector("#fb-name")?.value || "Anonymous";

  if (elements.feedbackSuccess) {
    elements.feedbackSuccess.textContent =
      `Thank you, ${name}! Your feedback has been recorded successfully.`;
    elements.feedbackSuccess.classList.add("visible");
  }

  showToast("Feedback submitted successfully!");
  if (elements.feedbackForm) elements.feedbackForm.reset();
}

// ==========================================================================
// 11. Event Binding & Initialization
// ==========================================================================
function bindAllEvents() {
  // Input live count
  if (elements.messageInput) {
    elements.messageInput.addEventListener("input", updateCharacterCount);
  }

  // Generate & Clear Buttons
  const genBtn = document.querySelector("#generate-button");
  if (genBtn) genBtn.addEventListener("click", handleGenerateHash);

  const clearBtn = document.querySelector("#clear-button");
  if (clearBtn) clearBtn.addEventListener("click", resetExperiment);

  // Copy Hash
  if (elements.btnCopyHash) {
    elements.btnCopyHash.addEventListener("click", () => {
      const hashText = elements.resultHash ? elements.resultHash.textContent : "";
      if (hashText) {
        navigator.clipboard.writeText(hashText).then(() => {
          showToast("SHA-1 Hash copied to clipboard!");
        });
      }
    });
  }

  // Sensitivity comparison & Quick Presets
  const compareBtn = document.querySelector("#compare-button");
  if (compareBtn) compareBtn.addEventListener("click", compareMessages);

  document.querySelectorAll("[data-test]").forEach(button => {
    button.addEventListener("click", () => applyQuickTest(button.dataset.test));
  });

  // Navigation Links
  elements.navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("data-target");
      if (targetId) switchSection(targetId);
    });
  });

  // Pager buttons
  if (elements.btnPrevPage) elements.btnPrevPage.addEventListener("click", () => navigatePage(-1));
  if (elements.btnNextPage) elements.btnNextPage.addEventListener("click", () => navigatePage(1));

  // Filter pills
  elements.filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const filter = pill.getAttribute("data-filter");
      if (filter) filterResources(filter);
    });
  });

  // Speech & Accessibility
  if (elements.btnReadAloud) elements.btnReadAloud.addEventListener("click", toggleReadAloud);
  if (elements.btnFontIncrease) elements.btnFontIncrease.addEventListener("click", () => adjustFontSize(1));
  if (elements.btnFontDecrease) elements.btnFontDecrease.addEventListener("click", () => adjustFontSize(-1));
  if (elements.btnResetView) {
    elements.btnResetView.addEventListener("click", () => {
      currentFontSize = 16;
      if (elements.contentContainer) elements.contentContainer.style.fontSize = "16px";
      resetExperiment();
      resetQuiz();
      switchSection("pane-aim");
    });
  }

  // Simulation Subtabs
  elements.simSubtabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const subtabTarget = tab.getAttribute("data-subtab");
      elements.simSubtabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      elements.simSubpanels.forEach(panel => {
        if (panel.id === `subpanel-${subtabTarget}`) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

  // Padding Inspector
  if (elements.btnInspectPadding) {
    elements.btnInspectPadding.addEventListener("click", inspectPadding);
  }

  // Quiz
  if (elements.btnSubmitQuiz) elements.btnSubmitQuiz.addEventListener("click", evaluateQuiz);
  if (elements.btnResetQuiz) elements.btnResetQuiz.addEventListener("click", resetQuiz);

  // Feedback
  setupStarRating();
  if (elements.feedbackForm) {
    elements.feedbackForm.addEventListener("submit", handleFeedbackSubmit);
  }

  // Share button
  if (elements.btnShare) {
    elements.btnShare.addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({
          title: "SHA-1 Virtual Cryptography Lab",
          text: "Interactive simulation and avalanche analysis of the SHA-1 Hash Algorithm.",
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          showToast("Laboratory link copied to clipboard!");
        });
      }
    });
  }

  // Sidebar collapse toggle
  if (elements.btnSidebarCollapse && elements.resourcesList) {
    elements.btnSidebarCollapse.addEventListener("click", () => {
      const isHidden = elements.resourcesList.style.display === "none";
      elements.resourcesList.style.display = isHidden ? "" : "none";
      elements.btnSidebarCollapse.classList.toggle("collapsed", !isHidden);
    });
  }

  // Mobile menu button
  const btnMenuToggle = document.querySelector("#btn-menu-toggle");
  if (btnMenuToggle && elements.resourcesList) {
    btnMenuToggle.addEventListener("click", () => {
      const sidebar = document.querySelector("#sidebar-container");
      if (sidebar) {
        sidebar.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Back button
  if (elements.btnBack) {
    elements.btnBack.addEventListener("click", () => {
      showToast("Virtual Laboratory Home");
      switchSection("pane-aim");
    });
  }
}

// Self-check known test vectors
async function runKnownVectorTests() {
  const testVectors = [
    ["abc", "a9993e364706816aba3e25717850c26c9cd0d89d"],
    ["", "da39a3ee5e6b4b0d3255bfef95601890afd80709"]
  ];

  for (const [message, expectedHash] of testVectors) {
    const computed = await generateSHA1(message);
    if (computed !== expectedHash) {
      throw new Error(`SHA-1 test vector failed for input "${message}"`);
    }
  }
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  bindAllEvents();
  updateCharacterCount();
  updatePageIndicator();
  inspectPadding();

  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = populateVoices;
    populateVoices();
  }

  runKnownVectorTests().catch(() => {
    setStatus(elements.hashStatus, "SHA-1 self-check failed. Please reload the experiment.");
  });
});
