// The invitation page that opens in the dialog. Plug yours in here.
const PAGE_URL = "./principal.html";

// Shown if PAGE_URL can't be loaded (here: the same invitation, built in).
const FALLBACK = "";
const cv = document.getElementById("c"), g = cv.getContext("2d");
const box = document.getElementById("box"), frame = document.getElementById("page");
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
let sparks = [];
function burst() {
    for (let i = 0; i < 16; i++)
        sparks.push({
            x: 170 + (Math.random() - .5) * 140, y: 90, vx: (Math.random() - .5) * 3,
            vy: -1 - Math.random() * 1.5, life: 1, red: i % 3 === 0
        });
}
let t = 0, dir = 0; // t: 0 closed .. 1 open. dir: 1 opening, -1 closing

// Seeded random, so the pencil wobble stays the same every frame
let seed = 1;
const rnd = (n) => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647 - 0.5) * 2 * n; };

// One edge drawn twice, slightly off, like a sketchy pencil line
function sketch(a, b) {
    for (let pass = 0; pass < 2; pass++) {
        g.lineWidth = pass ? 1.2 : 2.2;
        g.strokeStyle = pass ? "rgba(60,60,65,.5)" : "rgba(50,50,55,.85)";
        g.beginPath();
        g.moveTo(a[0] + rnd(2), a[1] + rnd(2));
        g.quadraticCurveTo((a[0] + b[0]) / 2 + rnd(3), (a[1] + b[1]) / 2 + rnd(3), b[0] + rnd(2), b[1] + rnd(2));
        g.stroke();
    }
}

// Polygon: soft tint, pencil hatching, then sketchy outline
function shape(pts, tint, hatch) {
    g.save();
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath();
    g.fillStyle = tint; g.fill();
    if (hatch) {
        g.clip(); g.strokeStyle = hatch; g.lineWidth = 1;
        for (let x = -260; x < 360; x += 7) {
            g.beginPath(); g.moveTo(x + rnd(1), 0); g.lineTo(x + 260 + rnd(2), 260); g.stroke();
        }
    }
    g.restore();
    pts.forEach((p, i) => sketch(p, pts[(i + 1) % pts.length]));
}

function draw() {
    seed = 7;
    g.clearRect(0, 0, 340, 260);
    g.lineCap = "round"; g.lineJoin = "round";

    const f = t * t * (3 - 2 * t);                 // eased flap progress
    const k = Math.min(Math.max((t - 0.45) / 0.55, 0), 1);
    const pop = 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2); // letter overshoots
    const now = performance.now() / 1000;
    g.save();
    if (t === 0 && !dir && !calm) {                // idle: bob and tilt
        g.translate(170, 160 + Math.sin(now * 3) * 3);
        g.rotate(Math.sin(now * 2) * 0.03);
        g.translate(-170, -160);
    }

    // scribbled ground shadow
    //g.strokeStyle = "rgba(60,60,65,.3)"; g.lineWidth = 1.5;
    //for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(60 + i * 18 + rnd(3), 242); g.lineTo(80 + i * 18 + rnd(3), 232); g.stroke(); }

    const L = 35, R = 305, T = 90, B = 230;

    // back
    shape([[L, T], [R, T], [R, B], [L, B]], "#ecd9a8");

    const cx = (L + R) / 2;
    const apex = 165 - f * 145;
    const flap = () => shape([[L, T], [cx, apex], [R, T]], f < 0.5 ? "#e6cf98" : "#d9c083");

    // open flap sits behind the letter
    if (f >= 0.5) flap();

    // letter slides up
    const up = pop * 85;
    shape([[L + 20, T + 10 - up], [R - 20, T + 10 - up], [R - 20, B - 20], [L + 20, B - 20]], "#fffdf6");
    g.strokeStyle = "rgba(60,60,65,.35)"; g.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(L + 40, T + 35 - up + i * 18); g.lineTo(R - 40 + rnd(8), T + 35 - up + i * 18 + rnd(2)); g.stroke(); }

    // front pocket
    shape([[L, T], [cx, 165], [L, B]], "#f1e1b8");
    shape([[R, T], [cx, 165], [R, B]], "#f1e1b8");
    shape([[L, B], [cx, 150], [R, B]], "#f6e9c6");

    // closed flap and heart sit in front
    const heart = (g, pt) => {
        const y = pt[1] - 12;
        g.save();
        g.beginPath();
        g.moveTo(pt[0], y + 6);
        g.bezierCurveTo(pt[0] - 28, y - 22, pt[0] - 8, y - 28, pt[0], y - 15);
        g.bezierCurveTo(pt[0] + 8, y - 28, pt[0] + 28, y - 22, pt[0], y + 6);
        g.closePath();
        g.fillStyle = "rgba(210,70,80,.50)"; g.fill();

        g.strokeStyle = "rgba(60,60,65,.85)"; g.lineWidth = 2;
        g.beginPath(); g.moveTo(cx, y + 6); g.bezierCurveTo(cx - 28, y - 22, cx - 4, y - 28, cx, y - 12);
        g.bezierCurveTo(cx + 4, y - 28, cx + 28, y - 22, cx, y + 6); g.stroke();
        g.restore();
    }

    if (f < 0.5) {
        flap();
        heart(g, [cx, apex])
    }
    g.restore();

    sparks.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.01; p.life -= 0.02;
        heart(g, [p.x, p.y + 35])
    });
    sparks = sparks.filter(p => p.life > 0);
}


function tick() {
    if (dir) {
        const before = t;
        t += dir * 0.035;
        if (dir === 1 && before < 0.5 && t >= 0.5 && !calm) burst();
        if (t >= 1) { t = 1; dir = 0; setTimeout(openDialog, 400); }
        if (t <= 0) { t = 0; dir = 0; }
    }
    draw();
    requestAnimationFrame(tick);
}

async function openDialog() {
    frame.srcdoc = "<body style='font-family:sans-serif'>Cargando...<3</body>";
    box.showModal();
    try {
        const res = await fetch(PAGE_URL);
        if (!res.ok) throw new Error(res.status);
        frame.srcdoc = await res.text();
    } catch (e) {
        frame.srcdoc = FALLBACK;
    }
}

cv.onclick = () => { if (!dir && t === 0) dir = 1; };
document.getElementById("close").onclick = () => box.close();
box.onclose = () => { dir = -1; };
tick();