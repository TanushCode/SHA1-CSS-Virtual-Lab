# Virtual Cryptography Laboratory — SHA-1 Hash Algorithm

## Experiment Identification & Integration Metadata

- **Group:** SHA-1
- **Experiment ID:** EXP09
- **Experiment Name:** SHA-1 Hash Algorithm & Sensitivity Analysis
- **Full Title:** SHA-1 - Generate the SHA-1 hash value for a given input message and study its output characteristics and sensitivity to input changes.
- **Folder Location:** `/experiments/sha1/`
- **Entry File:** `index.html`
- **Navigation Title:** SHA-1 Hash Algorithm
- **Short Description:** Generate 160-bit SHA-1 message digests, examine output determinism, and analyze the Avalanche Effect using bit-level sensitivity metrics.
- **Required Libraries:** None (Zero external dependencies; vanilla HTML5, CSS3, JavaScript, Web Crypto API)
- **Input:** Arbitrary text message
- **Output:** 160-bit SHA-1 hash (formatted as 40 hexadecimal characters) and bitwise sensitivity metrics
- **Expected Navigation Link:** `/experiments/sha1/`

---

## Team & Task Division

| Roll No. | Name | Role | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **10713** | **Swar** | Frontend / UI Lead | Common UI layout, terracotta/lab manual theme, navigation, Aim, Theory, Procedure, References, Quiz & Feedback integration. |
| **10710** | **Tanush Chavan** | SHA-1 Core | Standalone Java SHA-1 core (`Main.java`), correctness testing suite, and reference integration. |
| **10719** | **Aaron Deniz** | Interactive Simulation | Interactive single and dual-message hashing UI, character counters, comparison cards, and sensitivity UI integration. |
| **10715** | **Asher** | Sensitivity Test | Bitwise sensitivity logic, 160-bit XOR comparison, percentage changed bits calculation, and avalanche effect metrics. |

---

## Module Structure

```text
SHA1-CSS-Virtual-Lab/
├── index.html       # Complete lab interface with all 7 experiment sections & sidebar
├── style.css        # Educational laboratory theme styles (terracotta & warm ivory palette)
├── script.js        # Lab navigation, Web Crypto hashing, sensitivity math, speech & quiz logic
├── Main.java        # Standalone Java SHA-1 reference implementation and CLI test runner
├── README.md        # Integration documentation, test cases, and academic rubrics
└── team/
    └── contributors.md # Detailed task allocation and contributor details
```

---

## Implemented Virtual Lab Sections

As mandated by the laboratory guidelines, this virtual experiment incorporates all 7 required components:

1. **Aim & Objectives:** Detailed educational goals, mathematical foundations, iterative compression overview, and course metadata.
2. **Theory:**
   - Cryptographic hash properties (pre-image, second pre-image, collision resistance).
   - Algorithm specifications (512-bit blocks, 160-bit digest, 80 rounds, 32-bit words).
   - Step-by-step pipeline: Padding bits, 64-bit length appending, working registers ($A, B, C, D, E$), message schedule expansion ($W_0 \dots W_{79}$), and non-linear round functions ($f_t, K_t$).
   - Avalanche Effect theoretical explanation (~50% target bit flip).
   - Cryptanalytic status (Wang et al. theoretical attack, Google/CWI SHAttered practical collision).
3. **Procedure:**
   - Real Laboratory step-by-step procedure.
   - Virtual Laboratory simulation procedure.
4. **Interactive Simulation:**
   - **Hash Generator:** Live character counter, deterministic SHA-1 generation, copy-to-clipboard, output length verification.
   - **Sensitivity & Avalanche Analysis:** Side-by-side comparison of original and mutated text, quick mutation presets (*Change Case, Add Character, Remove Character, Change One Character, Reset*), bit-level difference counter ($x / 160$), percentage progress bar, and dynamic observation notes.
   - **Message Padding Inspector:** Educational visualizer breaking down original bit length $L$, $k$ zero bits, 64-bit length field, and 512-bit block formation.
5. **Assessment / Quiz:**
   - 5 conceptual multiple-choice questions testing digest size, block size, round count, avalanche percentage, and NIST deprecation reasons.
   - Dynamic grading banner, instant green/red answer highlighting, and in-depth explanations for every question.
6. **References:**
   - Citations for NIST FIPS PUB 180-1, FIPS PUB 180-4, RFC 3174, William Stallings' Cryptography textbook, and the CRYPTO 2017 SHAttered paper.
7. **Feedback:**
   - Interactive star rating (1–5 stars), student identity fields, usability evaluation questions, and feedback submission state.

---

## Accessibility & UI Features

- **Laboratory Manual Theme:** Matches the standardized brown/terracotta educational layout.
- **Explanation Resources Sidebar:** Quick-navigation cards with active red/coral highlight borders matching the faculty manual interface.
- **Read Aloud (Text-to-Speech):** Native Web Speech API integration with speed selection (0.85x, 1x, 1.25x, 1.5x) and voice selection.
- **Font Resizing:** Dynamic text scaling controls (`−` / `+`).
- **Resource Filtering:** Toolbar tabs to filter by `All`, `Theory`, or `Interactive` resources.
- **Self-Testing Vectors on Load:** Automatically verifies standard test vectors upon launch.

---

## Known Validation Test Cases

| Test Case | Input | Expected 160-Bit SHA-1 Hex Digest |
| :--- | :--- | :--- |
| **Empty String** | `""` | `da39a3ee5e6b4b0d3255bfef95601890afd80709` |
| **Standard Vector 1** | `"abc"` | `a9993e364706816aba3e25717850c26c9cd0d89d` |
| **Standard Vector 2** | `"hello"` | `aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d` |
| **Standard Vector 3** | `"password"` | `5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8` |

---

## Java Standalone Execution

To compile and run the Java SHA-1 core and automated verification suite:

```bash
javac Main.java
java experiments.sha1.Main
```

Menu options:
- `1. Generate SHA-1`: Interactive terminal hashing loop.
- `2. Run correctness tests`: Executes automated test vector verification against expected standard digests.