# SHA-1 Hash Algorithm

## Experiment Name

SHA-1 - Generate the SHA-1 hash value for a given input message and study its output characteristics and sensitivity to input changes.

## Purpose

This interactive simulation generates SHA-1 digests and compares the output for an original message and a modified message. It makes the 160-bit output, hexadecimal representation, changed-bit count, and percentage difference visible.

## Module Structure

```text
experiment-template/
├── index.html
├── style.css
├── script.js
└── README.md
```

This module is self-contained and does not modify the main application, shared styles, or other experiment modules.

## Features

- Message input with a live character count
- SHA-1 hash generation
- 160-bit output represented as 40 hexadecimal characters
- Original versus modified message comparison
- Changed-bit and percentage calculations
- Hash-character difference highlighting
- Quick sensitivity tests
- Dynamic observations and validation messages

## Input and Output

The user enters a message. The output is a 160-bit SHA-1 hash represented by 40 hexadecimal characters.

## Sensitivity Test

The simulation hashes both messages, converts each 40-character hexadecimal hash into 160 bits, and counts corresponding bits that differ. The percentage is calculated as `changedBits / 160 * 100` and displayed to two decimal places.

## SHA-1 Core

`generateSHA1(message)` in `script.js` uses the browser Web Crypto API when available and includes a local SHA-1 fallback for non-secure HTTP contexts. No backend, Java file, framework, or external dependency is required.

## Sensitivity Integration

`calculateSensitivity(originalHash, modifiedHash)` is the sensitivity integration point. It currently contains a temporary local implementation. Asher's implementation can replace this function as long as it returns `changedBits`, `totalBits`, and `percentageChanged`.

## Test Cases

The script self-checks these known vectors when the module loads:

| Input | SHA-1 |
| --- | --- |
| `abc` | `a9993e364706816aba3e25717850c26c9cd0d89d` |
| empty string | `da39a3ee5e6b4b0d3255bfef95601890afd80709` |

These values are validation vectors only and are not used as interactive output.

## Integration Instructions

Place this self-contained module at `/experiments/sha1/` and add its `index.html` to the common navigation when the integration team connects the experiment to the wider laboratory. The module has no framework or external dependency and does not modify shared styles, navigation, or other experiments.

## Evaluation Questions

1. Why does SHA-1 always produce a 160-bit digest?
2. How does changing one input character demonstrate the avalanche effect?
3. Why is SHA-1 no longer recommended for collision-resistant security applications?

## Quiz Questions

The Assessment pane includes five multiple-choice questions covering SHA-1 digest size, block size, compression rounds, the avalanche effect, and the reason SHA-1 was deprecated.