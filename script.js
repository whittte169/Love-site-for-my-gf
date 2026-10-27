const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const heartCanvas = document.getElementById('heartCanvas');
const heartCtx = heartCanvas.getContext('2d');
const nameTag = document.getElementById('name-tag');
const hintTag = document.getElementById('hint-tag');
const counterTag = document.getElementById('counter-tag');
const musicBtn = document.getElementById('music-btn');
const canvas3d = document.getElementById('canvas3d');
const reasonTag = document.getElementById('reason-tag');
const letterBtn = document.getElementById('letter-btn');
const letterEl = document.getElementById('letter');
const letterText = document.getElementById('letter-text');
const letterClose = document.getElementById('letter-close');
let centerX, centerY, scale;
let mouseX = 0, mouseY = 0;
const audio = new Audio('music.mp3');
audio.loop = true;
audio.volume = 0.4;
let musicStarted = false;
function resize() {
    bgCanvas.width = heartCanvas.width = window.innerWidth;
    bgCanvas.height = heartCanvas.height = window.innerHeight;
    centerX = heartCanvas.width / 2;
    centerY = heartCanvas.height / 2 + (window.innerWidth < 768 ? 20 : 40);
    const baseDimension = Math.min(heartCanvas.width, heartCanvas.height);
    scale = baseDimension * (window.innerWidth < 768 ? 0.015 : 0.022);
}
window.addEventListener('resize', () => { resize(); initSpace(); });
function heartX(t) { return 16 * Math.pow(Math.sin(t), 3); }
function heartY(t) { return -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)); }
const phrase = "Я тебя люблю ";
const textToScale = phrase.repeat(window.innerWidth < 768 ? 3 : 5);
const totalChars = textToScale.length;
let currentCharIndex = 0;
let particles = [];
let floatingTexts = [];
let galaxies = [];
let backgroundStars = [];
let shootingStars = [];
let burstTriggered = false;
let heartDone = false;
let pulseFactor = 1;
let pulseTime = 0;
const startDate = new Date(2026, 9, 17, 21, 0, 0);
const lovePhrases = ["Я тебя люблю", "Ты самая лучшая", "Я люблю тебя сильнее всех на свете", "Я без тебя как луна без земли", "Моё солнце", "Ты моё всё", "Самая милая", "Счастье моё", "Ты моя вселенная", "Самая прекрасная улыбка"];
const reasons = ["Твоя улыбка делает любой день лучше", "С тобой я чувствую себя дома", "Ты умеешь меня рассмешить", "Твой голос — мой любимый звук", "Ты делаешь меня лучше", "С тобой даже тишина уютная", "Ты просто есть — и этого достаточно для счастья", "В твоих глазах целая галактика", "Ты веришь в меня", "Рядом с тобой время летит незаметно"];
const letter = "Соня,\n\nЯ долго думал, как рассказать тебе всё, что чувствую, и понял, что обычных слов для этого мало. Поэтому я собрал для тебя целую вселенную.\n\nС тех пор как ты появилась в моей жизни, всё стало ярче: самые обычные дни превратились в маленькие праздники, а будущее перестало пугать, ведь в нём есть ты.\n\nСпасибо тебе за твою улыбку, за твоё тепло и за то, что ты просто рядом. Я хочу быть с тобой и в яркие дни, и в самые простые.\n\nПусть у нас будет ещё очень много общих звёзд.\n\nЯ тебя люблю 💖";
const milestoneList = [["1 неделя", 0, 7], ["1 месяц", 1, 0], ["100 дней", 0, 100], ["3 месяца", 3, 0], ["полгода", 6, 0], ["1 год", 12, 0], ["2 года", 24, 0], ["3 года", 36, 0], ["5 лет", 60, 0]].map(m => ({ label: m[0], date: new Date(startDate.getFullYear(), startDate.getMonth() + m[1], startDate.getDate() + m[2], 21, 0, 0) })).sort((a, b) => a.date - b.date);
let foundCount = 0;
let reasonOrder = [];
let reasonTimer;
let letterRead = false;
let letterTimer = null;
function pluralize(num, one, two, many) {
    let n = Math.abs(num);
    n %= 100;
    if (n >= 5 && n <= 20) return many;
    n %= 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return many;
}
function updateCounter() {
    const now = new Date();
    const diff = now - startDate;
    if (diff < 0) {
        counterTag.innerHTML = "Космический отсчет запущен...";
        return;
    }
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const dTxt = pluralize(days, "день", "дня", "дней");
    const hTxt = pluralize(hours, "час", "часа", "часов");
    const mTxt = pluralize(minutes, "минуту", "минуты", "минут");
    const sTxt = pluralize(seconds, "секунду", "секунды", "секунд");
    const upcoming = milestoneList.find(m => m.date.getTime() + 864e5 > now.getTime());
    let mileTxt = "";
    if (upcoming) {
        const left = upcoming.date - now;
        if (left <= 0) {
            mileTxt = `Сегодня нам ${upcoming.label} 💖`;
        } else {
            const ld = Math.floor(left / 864e5);
            const lh = Math.floor(left / 36e5) % 24;
            mileTxt = ld > 0 ? `До отметки «${upcoming.label}» осталось ${ld} ${pluralize(ld, "день", "дня", "дней")}` : `До отметки «${upcoming.label}» осталось ${lh} ${pluralize(lh, "час", "часа", "часов")}`;
        }
    }
    counterTag.innerHTML = `Мы вместе уже:<br>${days} ${dTxt}, ${hours} ${hTxt}, ${minutes} ${mTxt} и ${seconds} ${sTxt}<span class="milestone">${mileTxt}</span>`;
}
class BackgroundStar {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random();
        this.speed = Math.random() * 0.02 + 0.01;
    }
    draw() {
        bgCtx.save();
        bgCtx.globalAlpha = Math.abs(Math.sin(this.alpha));
        bgCtx.fillStyle = '#FFFFFF';
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
        bgCtx.restore();
    }
    update() { this.alpha += this.speed; }
}
class ShootingStar {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * (bgCanvas.height * 0.4);
        this.len = Math.random() * 80 + 40;
        this.speed = Math.random() * 4 + 4;
        this.vx = this.speed;
        this.vy = this.speed * 0.5;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        if (this.alpha <= 0 || this.x > bgCanvas.width || this.y > bgCanvas.height) {
            this.reset();
        }
    }
    draw() {
        if (this.alpha <= 0) return;
        bgCtx.save();
        bgCtx.globalAlpha = this.alpha;
        let grad = bgCtx.createLinearGradient(this.x, this.y, this.x - this.len, this.y - this.len * 0.5);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, 'rgba(255, 105, 180, 0.6)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        bgCtx.strokeStyle = grad;
        bgCtx.lineWidth = 2;
        bgCtx.beginPath();
        bgCtx.moveTo(this.x, this.y);
        bgCtx.lineTo(this.x - this.len, this.y - this.len * 0.5);
        bgCtx.stroke();
        bgCtx.restore();
    }
}
class Galaxy {
    constructor() {
        this.x = Math.random() * bgCanvas.width;
        this.y = Math.random() * bgCanvas.height;
        this.angle = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
        this.size = Math.random() * 35 + 25;
        this.stars = [];
        const starCount = window.innerWidth < 768 ? 80 : 150;
        for (let i = 0; i < starCount; i++) {
            const progress = i / starCount;
            const t = Math.random() * Math.PI * 2;
            const distFactor = Math.pow(progress, 1.5);
            const angleOffset = progress * 4.5;
            this.stars.push({
                t: t,
                dist: distFactor,
                angleOffset: angleOffset,
                size: Math.random() * 1.2 + 0.4,
                opacity: Math.random() * 0.4 + 0.4,
                isCore: progress < 0.12,
                color: progress < 0.15 ? '#FFFFFF' : `hsl(${Math.random() * 40 + 320}, 100%, ${Math.random() * 20 + 70}%)`
            });
        }
    }
    draw() {
        bgCtx.save();
        bgCtx.translate(this.x, this.y);
        bgCtx.rotate(this.angle);
        for (let i = 0; i < this.stars.length; i++) {
            const s = this.stars[i];
            let hx = heartX(s.t) * this.size * 0.06 * s.dist;
            let hy = heartY(s.t) * this.size * 0.06 * s.dist;
            const cos = Math.cos(s.angleOffset);
            const sin = Math.sin(s.angleOffset);
            const rx = hx * cos - hy * sin;
            const ry = hx * sin + hy * cos;
            bgCtx.save();
            bgCtx.globalAlpha = s.opacity;
            bgCtx.fillStyle = s.color;
            if (s.isCore) {
                bgCtx.shadowBlur = 6;
                bgCtx.shadowColor = '#FF69B4';
                bgCtx.beginPath();
                bgCtx.arc(rx, ry, s.size * 1.4, 0, Math.PI * 2);
                bgCtx.fill();
            } else {
                bgCtx.beginPath();
                bgCtx.arc(rx, ry, s.size, 0, Math.PI * 2);
                bgCtx.fill();
            }
            bgCtx.restore();
        }
        bgCtx.restore();
    }
    update() {
        this.angle += this.rotSpeed;
        this.y -= 0.12;
        if (this.y < -this.size * 2) {
            this.y = bgCanvas.height + this.size * 2;
            this.x = Math.random() * bgCanvas.width;
        }
    }
}
function initSpace() {
    galaxies = [];
    backgroundStars = [];
    shootingStars = [];
    const maxGalaxies = window.innerWidth < 768 ? 2 : 4;
    const count = Math.min(maxGalaxies, Math.floor((bgCanvas.width * bgCanvas.height) / 200000));
    for (let i = 0; i < Math.max(2, count); i++) galaxies.push(new Galaxy());
    const starCount = window.innerWidth < 768 ? 40 : 70;
    for (let i = 0; i < starCount; i++) backgroundStars.push(new BackgroundStar());
    for (let i = 0; i < 2; i++) shootingStars.push(new ShootingStar());
}
resize();
initSpace();
class Particle {
    constructor(x, y, isHeart, vx, vy) {
        this.x = x;
        this.y = y;
        this.isHeart = isHeart;
        this.size = Math.random() * 2 + 1.5;
        this.vx = vx || (Math.random() - 0.5) * 1.2;
        this.vy = vy || (Math.random() - 0.5) * 1.2 - 0.3;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
        this.color = `hsl(${Math.random() * 20 + 335}, 100%, ${Math.random() * 20 + 70}%)`;
    }
    draw() {
        bgCtx.save();
        bgCtx.globalAlpha = this.alpha;
        bgCtx.fillStyle = this.color;
        if (this.isHeart) {
            bgCtx.font = `${this.size * 3.5}px Arial`;
            bgCtx.fillText('❤️', this.x, this.y);
        } else {
            bgCtx.beginPath();
            bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            bgCtx.fill();
        }
        bgCtx.restore();
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (heartDone) {
            const dx = centerX - this.x;
            const dy = centerY - this.y;
            this.x += dx * 0.002;
            this.y += dy * 0.002;
        }
        this.alpha -= this.decay;
    }
}
function createBurst(cx, cy, count) {
    const maxParticles = window.innerWidth < 768 ? 60 : 120;
    if (particles.length > maxParticles) return;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particles.push(new Particle(cx, cy, Math.random() > 0.6, Math.cos(angle) * speed, Math.sin(angle) * speed));
    }
}
class FloatingText {
    constructor() { this.reset(true); }
    reset(fromBottom = false) {
        this.text = "Соня";
        this.isLovePhrase = false;
        this.x = Math.random() * (bgCanvas.width - 160) + 80;
        this.y = fromBottom ? bgCanvas.height + 30 : -30;
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = -(Math.random() * 1.0 + 0.5);
        this.scale = 1;
        this.targetScale = 1;
        this.fontSize = window.innerWidth < 768 ? 14 : 16;
        this.clicked = false;
    }
    draw() {
        bgCtx.save();
        bgCtx.globalAlpha = 1;
        if (this.isLovePhrase) {
            bgCtx.fillStyle = '#FFFFFF';
            bgCtx.font = `bold ${this.fontSize * this.scale}px Arial`;
            bgCtx.shadowColor = '#FF1493';
            bgCtx.shadowBlur = 10;
        } else {
            bgCtx.fillStyle = '#FF69B4';
            bgCtx.font = `bold ${this.fontSize * this.scale}px Arial`;
        }
        bgCtx.fillText(this.text, this.x, this.y);
        bgCtx.restore();
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 50 || this.x > bgCanvas.width - 50) this.vx *= -1;
        if (this.clicked) {
            this.scale += (this.targetScale - this.scale) * 0.2;
            if (Math.abs(this.scale - this.targetScale) < 0.05 && this.targetScale === 0) {
                const randomIndex = Math.floor(Math.random() * lovePhrases.length);
                this.text = lovePhrases[randomIndex];
                this.isLovePhrase = true;
                registerFound();
                this.targetScale = this.text.length > 20 ? 1.0 : 1.3;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = -(Math.random() * 1.2 + 0.8);
            }
        }
        if (this.y < -50 || this.y > bgCanvas.height + 50) { this.reset(true); }
    }
    checkClick(mx, my) {
        if (this.clicked && this.isLovePhrase) return false;
        const textWidth = this.isLovePhrase ? 180 : 50;
        const textHeight = 25;
        if (mx > this.x - textWidth/2 - 25 && mx < this.x + textWidth/2 + 25 &&
            my > this.y - textHeight/2 - 25 && my < this.y + textHeight/2 + 25) {
            this.clicked = true;
            this.targetScale = 0;
            return true;
        }
        return false;
    }
}
function checkTextClick(clientX, clientY) {
    let hit = false;
    for (let i = 0; i < floatingTexts.length; i++) {
        if (floatingTexts[i].checkClick(clientX, clientY)) {
            createBurst(clientX, clientY, 12);
            hit = true;
            break;
        }
    }
    if (!hit && Math.hypot(clientX - centerX, clientY - centerY) < scale * 10) {
        showReason();
        createBurst(centerX, centerY, 18);
        hit = true;
    }
    if (!hit) createBurst(clientX, clientY, 6);
}
function registerFound() {
    foundCount++;
    if (foundCount < 5) {
        hintTag.textContent = `Нажимай на надписи! ${foundCount}/5`;
    } else if (foundCount === 5) {
        letterBtn.classList.add('visible');
        hintTag.textContent = "Тебе письмо 💌 А сердце тоже можно нажать";
    }
}
function showReason() {
    if (!reasonOrder.length) reasonOrder = reasons.slice().sort(() => Math.random() - 0.5);
    reasonTag.textContent = reasonOrder.pop();
    reasonTag.style.top = centerY + 'px';
    reasonTag.classList.add('show');
    clearTimeout(reasonTimer);
    reasonTimer = setTimeout(() => reasonTag.classList.remove('show'), 3500);
}
function finishLetter() {
    clearInterval(letterTimer);
    letterTimer = null;
    letterText.textContent = letter;
    letterRead = true;
    letterClose.classList.add('ready');
}
function openLetter() {
    letterEl.classList.add('open');
    clearInterval(letterTimer);
    letterTimer = null;
    letterClose.classList.remove('ready');
    if (letterRead) {
        finishLetter();
        return;
    }
    letterText.textContent = "";
    let i = 0;
    letterTimer = setInterval(() => {
        letterText.textContent += letter[i++];
        if (i >= letter.length) finishLetter();
    }, 28);
}
function toggleMusic() {
    if (!musicStarted) {
        audio.play().catch(e => console.log("Интеракция необходима"));
        musicStarted = true;
        musicBtn.innerHTML = "⏸️";
        musicBtn.style.background = "#FF1493";
    } else {
        if (audio.paused) {
            audio.play();
            musicBtn.innerHTML = "⏸️";
        } else {
            audio.pause();
            musicBtn.innerHTML = "🎵";
            musicBtn.style.background = "rgba(255, 20, 147, 0.15)";
        }
    }
}
musicBtn.onclick = (e) => { e.stopPropagation(); toggleMusic(); };
letterBtn.onclick = (e) => { e.stopPropagation(); openLetter(); };
letterEl.onclick = (e) => { e.stopPropagation(); if (letterTimer) finishLetter(); else letterEl.classList.remove('open'); };
window.addEventListener('click', (e) => {
    if (!musicStarted) { toggleMusic(); }
    if (heartDone) checkTextClick(e.clientX, e.clientY);
    else createBurst(e.clientX, e.clientY, 6);
});
window.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.15) {
        particles.push(new Particle(e.clientX, e.clientY, false, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4));
    }
});
window.addEventListener('touchstart', (e) => {
    if (e.target.closest('button, #letter')) return;
    if (!musicStarted) { toggleMusic(); }
    if (e.touches.length > 0) {
        const t = e.touches[0];
        if (heartDone) checkTextClick(t.clientX, t.clientY);
        else createBurst(t.clientX, t.clientY, 6);
    }
}, { passive: true });
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0 && Math.random() < 0.15) {
        const t = e.touches[0];
        particles.push(new Particle(t.clientX, t.clientY, false, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4));
    }
}, { passive: true });
function redrawHeart() {
    heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    const currentScale = scale * pulseFactor;
    if (heartDone) {
        const grad = heartCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentScale * 15);
        grad.addColorStop(0, 'rgba(255, 20, 147, 0.45)');
        grad.addColorStop(0.3, 'rgba(255, 105, 180, 0.25)');
        grad.addColorStop(0.7, 'rgba(255, 20, 147, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        heartCtx.fillStyle = grad;
        heartCtx.beginPath();
        for (let i = 0; i <= totalChars; i++) {
            const t = (i / totalChars) * 2 * Math.PI;
            const x = centerX + heartX(t) * currentScale;
            const y = centerY + heartY(t) * currentScale;
            if (i === 0) heartCtx.moveTo(x, y); else heartCtx.lineTo(x, y);
        }
        heartCtx.fill();
    }
    heartCtx.textAlign = 'center';
    heartCtx.textBaseline = 'middle';
    heartCtx.font = `bold ${window.innerWidth < 768 ? '11px' : '15px'} Arial`;
    heartCtx.fillStyle = '#FF69B4';
    for (let i = 0; i < currentCharIndex; i++) {
        const t = 2 * Math.PI - (i * (2 * Math.PI / totalChars));
        const x = centerX + heartX(t) * currentScale;
        const y = centerY + heartY(t) * currentScale;
        heartCtx.fillText(textToScale[i], x, y);
    }
}
function drawNextChar() {
    if (currentCharIndex >= totalChars) {
        nameTag.style.opacity = 1;
        counterTag.style.opacity = 1;
        hintTag.style.opacity = 1;
        if (!burstTriggered) {
            createBurst(centerX, centerY, window.innerWidth < 768 ? 25 : 45);
            burstTriggered = true;
            heartDone = true;
            const textCount = window.innerWidth < 768 ? 4 : 7;
            for (let i = 0; i < textCount; i++) floatingTexts.push(new FloatingText());
        }
        return;
    }
    currentCharIndex++;
    redrawHeart();
    setTimeout(drawNextChar, window.innerWidth < 768 ? 25 : 35);
}
function animate() {
    bgCtx.fillStyle = 'rgba(3, 3, 8, 0.25)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    for (let i = 0; i < backgroundStars.length; i++) {
        backgroundStars[i].update();
        backgroundStars[i].draw();
    }
    if (heartDone && Math.random() < 0.008) {
        for (let i = 0; i < shootingStars.length; i++) {
            if (shootingStars[i].alpha <= 0) {
                shootingStars[i].reset();
                break;
            }
        }
    }
    for (let i = 0; i < shootingStars.length; i++) {
        shootingStars[i].update();
        shootingStars[i].draw();
    }
    for (let i = 0; i < galaxies.length; i++) {
        galaxies[i].update();
        galaxies[i].draw();
    }
    if (heartDone) {
        pulseTime += 0.04;
        pulseFactor = 1 + 0.04 * Math.sin(pulseTime * 2);
        redrawHeart();
        updateCounter();
    }
    if (Math.random() < 0.03 && particles.length < 30) {
        particles.push(new Particle(Math.random() * bgCanvas.width, bgCanvas.height + 10, Math.random() > 0.7, (Math.random() - 0.5) * 0.6, -Math.random() * 1.2 - 0.5));
    }
    bgCtx.textAlign = 'center';
    bgCtx.textBaseline = 'middle';
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
    for (let i = 0; i < floatingTexts.length; i++) {
        floatingTexts[i].update();
        floatingTexts[i].draw();
    }
    bgCtx.globalAlpha = 1;
    requestAnimationFrame(animate);
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xff69b4, 1.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
function create3DHeartGeometry() {
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, 2.5, -2.5, 4.5, -5, 4.5);
    heartShape.bezierCurveTo(-8.5, 4.5, -8.5, 1, -8.5, 1);
    heartShape.bezierCurveTo(-8.5, -2, -6.5, -5, 0, -9.5);
    heartShape.bezierCurveTo(6.5, -5, 8.5, -2, 8.5, 1);
    heartShape.bezierCurveTo(8.5, 1, 8.5, 4.5, 5, 4.5);
    heartShape.bezierCurveTo(2.5, 4.5, 0, 2.5, 0, 0);
    const extrudeSettings = { depth: 2, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.8, bevelThickness: 0.5 };
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();
    return geometry;
}
const heartGeometry = create3DHeartGeometry();
const heartMaterial = new THREE.MeshPhongMaterial({ color: 0xff1493, shininess: 100, specular: 0xff69b4, flatShading: true });
const meshes3d = [];
const heartCount3d = window.innerWidth < 768 ? 6 : 12;
for (let i = 0; i < heartCount3d; i++) {
    const mesh = new THREE.Mesh(heartGeometry, heartMaterial);
    mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30 - 10);
    const sizeScale = Math.random() * 0.2 + 0.15;
    mesh.scale.set(sizeScale, sizeScale, sizeScale);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.03,
        speedY: (Math.random() - 0.5) * 0.03,
        rotX: (Math.random() - 0.5) * 0.015,
        rotY: (Math.random() - 0.5) * 0.015
    };
    scene.add(mesh);
    meshes3d.push(mesh);
}
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}, { passive: true });
function animate3D() {
    requestAnimationFrame(animate3D);
    camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 4 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    meshes3d.forEach(m => {
        m.position.x += m.userData.speedX;
        m.position.y += m.userData.speedY;
        m.rotation.x += m.userData.rotX;
        m.rotation.y += m.userData.rotY;
        if (m.position.x > 35) m.position.x = -35;
        if (m.position.x < -35) m.position.x = 35;
        if (m.position.y > 25) m.position.y = -25;
        if (m.position.y < -25) m.position.y = 25;
    });
    renderer.render(scene, camera);
}
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
animate();
animate3D();
setTimeout(drawNextChar, 400);