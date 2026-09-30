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
async function generateSHA1(message) {
  const bytes = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
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
  if (testName === "case") modifiedMessage = originalMessage.length ? originalMessage[0].toLowerCase() + originalMessage.slice(1) : originalMessage;
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

function bindEvents() {
  elements.messageInput.addEventListener("input", updateCharacterCount);
  document.querySelector("#generate-button").addEventListener("click", handleGenerateHash);
  document.querySelector("#clear-button").addEventListener("click", resetExperiment);
  document.querySelector("#compare-button").addEventListener("click", compareMessages);
  document.querySelectorAll("[data-test]").forEach(button => button.addEventListener("click", () => applyQuickTest(button.dataset.test)));
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
