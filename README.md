## Group
Group B

## Experiment ID
EXP02

## Navigation Title
SHA-1 Secure Hash Algorithm

## Short Description
Explore SHA-1 padding, the 80-step compression function and the avalanche effect by hashing messages live in the browser.

## Folder
/experiments/sha1/

## Entry File
index.html

## Expected Navigation Link
/experiments/sha1/

## Required Libraries
None

## Input
A text message (up to 200 characters) and an optional modified message used for the avalanche comparison.

## Output
The 160-bit SHA-1 digest as 40 hexadecimal characters, the RFC 3174 padded message, the 80-word message schedule, the a-e register state after each round and step, and the changed-bit count and percentage between two digests.

## Theory Summary
SHA-1 pads the message to a multiple of 512 bits, expands each block into 80 words with a left-rotate by 1, and runs 80 compression steps in four rounds using the functions Ch, Parity, Maj and Parity with constants 5A827999, 6ED9EBA1, 8F1BBCDC and CA62C1D6. The five 32-bit registers are added into the chaining value after each block to produce a 160-bit digest. SHA-1 is deprecated because practical collisions (SHAttered, 2017) exist.
