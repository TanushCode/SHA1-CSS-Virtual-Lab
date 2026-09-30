# SHA-1 Hash Algorithm

## Experiment Name

SHA-1 - Generate the SHA-1 hash value for a given input message and study its output characteristics and sensitivity to input changes.

## Purpose

This interactive simulation generates SHA-1 digests and compares the output for an original message and a modified message. It makes the 160-bit output, hexadecimal representation, changed-bit count, and percentage difference visible.

## Module Structure

```text
experiments/sha1/
├── index.html
├── script.js
└── README.md
```

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

## SHA-1 Core Integration

`generateSHA1(message)` in `script.js` is the browser-side SHA-1 core integration point. It currently uses the browser Web Crypto API (`crypto.subtle.digest("SHA-1", ...)`) as a temporary implementation for development and testing. The merged Java core is in `sha1-code/Main.java` and exposes a matching `generateSHA1(String input)` method for a future Java service or API adapter. A browser page cannot call a Java class directly, so connecting that service is the remaining integration step; the UI can continue to use its asynchronous contract.

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

Place this module at `/experiments/sha1/` and add its `index.html` to the common navigation when the integration team connects the experiment to the wider laboratory. Keep the merged Java core in `/sha1-code/Main.java`; expose its `generateSHA1(String input)` method through the chosen backend or service before replacing the browser fallback. The module has no framework or external dependency and does not modify shared styles, navigation, or other experiments.