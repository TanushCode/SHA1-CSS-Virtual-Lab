"use strict";

(function () {
  var H_INIT = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
  var F_NAMES = ["Ch", "Parity", "Maj", "Parity"];
  var DEFAULT_A = "abc";
  var DEFAULT_B = "abd";

  function rotl(x, n) {
    return ((x << n) | (x >>> (32 - n))) >>> 0;
  }

  function hex8(n) {
    return ("00000000" + (n >>> 0).toString(16)).slice(-8);
  }

  function hex2(n) {
    return ("0" + n.toString(16)).slice(-2);
  }

  function textToBytes(str) {
    return Array.prototype.slice.call(new TextEncoder().encode(str));
  }

  function roundFunction(t, b, c, d) {
    if (t < 20) {
      return ((b & c) | (~b & d)) >>> 0;
    }
    if (t < 40 || t >= 60) {
      return (b ^ c ^ d) >>> 0;
    }
    return ((b & c) | (b & d) | (c & d)) >>> 0;
  }

  // RFC 3174 padding. Returns padded bytes plus the size of each part.
  function padMessage(bytes) {
    var len = bytes.length;
    var zeros = (55 - len) % 64;
    if (zeros < 0) {
      zeros += 64;
    }
    var padded = bytes.slice();
    padded.push(0x80);
    for (var i = 0; i < zeros; i++) {
      padded.push(0);
    }
    var bitLen = len * 8;
    var high = Math.floor(bitLen / 4294967296);
    var low = bitLen >>> 0;
    var lenBytes = [high >>> 24, high >>> 16, high >>> 8, high, low >>> 24, low >>> 16, low >>> 8, low];
    for (var j = 0; j < 8; j++) {
      padded.push(lenBytes[j] & 0xff);
    }
    return { padded: padded, msgLen: len, zeros: zeros, bitLen: bitLen };
  }

  function expandSchedule(block, offset) {
    var w = new Array(80);
    for (var t = 0; t < 16; t++) {
      var p = offset + t * 4;
      w[t] = ((block[p] << 24) | (block[p + 1] << 16) | (block[p + 2] << 8) | block[p + 3]) >>> 0;
    }
    for (var u = 16; u < 80; u++) {
      w[u] = rotl(w[u - 3] ^ w[u - 8] ^ w[u - 14] ^ w[u - 16], 1);
    }
    return w;
  }

  // Full SHA-1 with every intermediate value recorded for the views.
  function computeSha1(str) {
    var bytes = textToBytes(str);
    var pad = padMessage(bytes);
    var h = H_INIT.slice();
    var blocks = [];

    for (var off = 0; off < pad.padded.length; off += 64) {
      var w = expandSchedule(pad.padded, off);
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4];
      var steps = [];
      var roundEnds = [];

      for (var t = 0; t < 80; t++) {
        var f = roundFunction(t, b, c, d);
        var k = K[Math.floor(t / 20)];
        var temp = (rotl(a, 5) + f + e + k + w[t]) >>> 0;
        e = d;
        d = c;
        c = rotl(b, 30);
        b = a;
        a = temp;
        steps.push({ t: t, f: f, k: k, w: w[t], regs: [a, b, c, d, e] });
        if (t % 20 === 19) {
          roundEnds.push([a, b, c, d, e]);
        }
      }

      h = [
        (h[0] + a) >>> 0,
        (h[1] + b) >>> 0,
        (h[2] + c) >>> 0,
        (h[3] + d) >>> 0,
        (h[4] + e) >>> 0
      ];
      blocks.push({ w: w, steps: steps, roundEnds: roundEnds, chain: h.slice() });
    }

    var digest = h.map(hex8).join("");
    return { digest: digest, pad: pad, blocks: blocks, bits: bytes.length * 8 };
  }

  function popcount4(n) {
    var c = 0;
    while (n) {
      c += n & 1;
      n >>= 1;
    }
    return c;
  }

  function compareDigests(x, y) {
    var changedBits = 0;
    var changedChars = 0;
    var marks = [];
    for (var i = 0; i < x.length; i++) {
      var diff = parseInt(x.charAt(i), 16) ^ parseInt(y.charAt(i), 16);
      var n = popcount4(diff);
      changedBits += n;
      marks.push(n > 0);
      if (n > 0) {
        changedChars++;
      }
    }
    return { bits: changedBits, chars: changedChars, marks: marks };
  }

  function highlight(hash, marks, useMarks) {
    var out = "";
    for (var i = 0; i < hash.length; i++) {
      if (useMarks && marks[i]) {
        out += '<span class="lab-diff">' + hash.charAt(i) + "</span>";
      } else {
        out += hash.charAt(i);
      }
    }
    return out;
  }

  // ---- DOM references -------------------------------------------------------
  function el(id) {
    return document.getElementById(id);
  }

  var input = el("sim-input");
  var input2 = el("sim-input2");
  var schedBlock = el("sim-sched-block");
  var stepBlock = el("sim-step-block");
  var stepRange = el("sim-step");
  var current = null;

  function fillBlockSelect(select, count) {
    var previous = parseInt(select.value, 10) || 0;
    var html = "";
    for (var i = 0; i < count; i++) {
      html += '<option value="' + i + '">' + (i + 1) + "</option>";
    }
    select.innerHTML = html;
    select.value = String(Math.min(previous, count - 1));
  }

  // ---- Renderers --------------------------------------------------------------
  function renderDigest(r) {
    el("sim-digest").textContent = r.digest;
    el("sim-bits").textContent = r.bits + " bits";
    el("sim-blocks").textContent = r.blocks.length + " block(s)";
  }

  function renderSelfCheck() {
    var vectors = [
      ["abc", "a9993e364706816aba3e25717850c26c9cd0d89d"],
      ["", "da39a3ee5e6b4b0d3255bfef95601890afd80709"]
    ];
    var html = "";
    vectors.forEach(function (v) {
      var got = computeSha1(v[0]).digest;
      var ok = got === v[1];
      html += (ok ? '<span class="lab-ok">PASS</span>' : '<span class="lab-bad">FAIL</span>');
      html += '  SHA1("' + v[0] + '") = ' + got + "\n";
    });
    el("sim-selfcheck").innerHTML = html;
  }

  function renderPadding(r) {
    var p = r.pad;
    el("sim-padding").textContent =
      "Original data: " + p.msgLen + " bytes (" + p.bitLen + " bits)\n" +
      "+ 0x80 start byte: 1 byte\n" +
      "+ zero padding: " + p.zeros + " byte(s)\n" +
      "+ 64-bit length: 8 bytes\n" +
      "= padded message: " + p.padded.length + " bytes = " + (p.padded.length / 64) + " block(s) of 512 bits";

    var html = "";
    for (var i = 0; i < p.padded.length; i++) {
      var cls = "lab-b-msg";
      if (i === p.msgLen) {
        cls = "lab-b-one";
      } else if (i > p.msgLen && i < p.msgLen + 1 + p.zeros) {
        cls = "lab-b-zero";
      } else if (i >= p.msgLen + 1 + p.zeros) {
        cls = "lab-b-len";
      }
      html += '<span class="lab-byte ' + cls + '">' + hex2(p.padded[i]) + "</span>";
    }
    el("sim-padbytes").innerHTML = html;
  }

  function renderSchedule(r) {
    var idx = parseInt(schedBlock.value, 10) || 0;
    var w = r.blocks[idx].w;
    var html = "";
    for (var t = 0; t < 40; t++) {
      html += "<tr>" + scheduleCells(t, w) + scheduleCells(t + 40, w) + "</tr>";
    }
    el("sim-schedule").innerHTML = html;
  }

  function scheduleCells(t, w) {
    var src = t < 16 ? "message word" : "ROTL1(W" + (t - 3) + "^W" + (t - 8) + "^W" + (t - 14) + "^W" + (t - 16) + ")";
    return "<td>" + t + "</td><td>" + hex8(w[t]) + "</td><td>" + src + "</td>";
  }

  function renderRounds(r) {
    var html = "";
    r.blocks.forEach(function (blk, bi) {
      blk.roundEnds.forEach(function (regs, ri) {
        html += "<tr><td>Block " + (bi + 1) + " / Round " + (ri + 1) + " (" + F_NAMES[ri] + ")</td>" + regs.map(cell).join("") + "</tr>";
      });
      html += "<tr><td>Block " + (bi + 1) + " / H after chaining</td>" + blk.chain.map(cell).join("") + "</tr>";
    });
    el("sim-rounds").innerHTML = html;
    renderStep(r);
  }

  function cell(n) {
    return "<td>" + hex8(n) + "</td>";
  }

  function renderStep(r) {
    var bi = parseInt(stepBlock.value, 10) || 0;
    var t = parseInt(stepRange.value, 10) || 0;
    var s = r.blocks[bi].steps[t];
    var round = Math.floor(t / 20);
    el("sim-step-label").textContent = String(t);
    el("sim-stepinfo").textContent =
      "Block " + (bi + 1) + ", step " + t + " (round " + (round + 1) + ", f = " + F_NAMES[round] + ")\n" +
      "f(b,c,d) = " + hex8(s.f) + "\n" +
      "K        = " + hex8(s.k) + "\n" +
      "W[" + t + "]" + (t < 10 ? "   " : "  ") + " = " + hex8(s.w) + "\n" +
      "a = " + hex8(s.regs[0]) + "   b = " + hex8(s.regs[1]) + "   c = " + hex8(s.regs[2]) + "\n" +
      "d = " + hex8(s.regs[3]) + "   e = " + hex8(s.regs[4]);
  }

  function renderAvalanche(r) {
    var other = computeSha1(input2.value);
    var cmp = compareDigests(r.digest, other.digest);
    var percent = (cmp.bits / 160) * 100;
    var identical = input.value === input2.value;
    el("sim-hash-a").innerHTML = highlight(r.digest, cmp.marks, true);
    el("sim-hash-b").innerHTML = highlight(other.digest, cmp.marks, true);
    el("sim-changed").textContent = cmp.bits + " / 160 bits";
    el("sim-percent").textContent = percent.toFixed(2) + " %";
    el("sim-hexdiff").textContent = cmp.chars + " / 40";
    var note;
    if (identical) {
      note = "The two messages are identical, so the digests match. Edit the modified message to see the avalanche effect.";
    } else if (cmp.bits >= 64 && cmp.bits <= 96) {
      note = "Close to the ideal 50 percent (about 80 bits): a small input change flipped roughly half of the digest bits.";
    } else {
      note = "Different from the ideal 80 bits for this sample. Statistically the average over many inputs is 50 percent; single samples vary.";
    }
    el("sim-observation").textContent = note;
  }

  function renderAll() {
    current = computeSha1(input.value);
    fillBlockSelect(schedBlock, current.blocks.length);
    fillBlockSelect(stepBlock, current.blocks.length);
    renderDigest(current);
    renderPadding(current);
    renderSchedule(current);
    renderRounds(current);
    renderAvalanche(current);
  }

  // ---- Wiring (simulator-only controls, no page navigation) ---------------------
  var btns = document.querySelectorAll(".lab-sim-viewbtn");
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      btns.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var want = btn.getAttribute("data-view");
      document.querySelectorAll(".lab-sim-view").forEach(function (panel) {
        panel.classList.toggle("active", panel.getAttribute("data-viewpanel") === want);
      });
    });
  });

  input.addEventListener("input", renderAll);
  input2.addEventListener("input", function () {
    renderAvalanche(current);
  });
  schedBlock.addEventListener("change", function () {
    renderSchedule(current);
  });
  stepBlock.addEventListener("change", function () {
    renderStep(current);
  });
  stepRange.addEventListener("input", function () {
    renderStep(current);
  });

  el("sim-reset").addEventListener("click", function () {
    input.value = DEFAULT_A;
    input2.value = DEFAULT_B;
    stepRange.value = "0";
    renderAll();
  });

  el("sim-flip").addEventListener("click", function () {
    var chars = Array.from(input.value);
    if (chars.length === 0) {
      input2.value = "\u0001";
    } else {
      var last = chars.length - 1;
      chars[last] = String.fromCodePoint(chars[last].codePointAt(0) ^ 1);
      input2.value = chars.join("");
    }
    renderAvalanche(current);
  });

  el("sim-append").addEventListener("click", function () {
    input2.value = input.value + ".";
    renderAvalanche(current);
  });

  el("sim-copy").addEventListener("click", function () {
    input2.value = input.value;
    renderAvalanche(current);
  });

  renderSelfCheck();
  renderAll();
})();
