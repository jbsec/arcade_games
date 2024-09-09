const canvas = document.getElementById('plinkoCanvas');
const ctx = canvas.getContext('2d');
const balanceDisplay = document.getElementById('balance');
const betAmountInput = document.getElementById('betAmount');
const riskSelect = document.getElementById('risk');
const rowsInput = document.getElementById('rows');

let balance = 10.00;
let betAmount = parseFloat(betAmountInput.value);
let risk = riskSelect.value;
let rows = parseInt(rowsInput.value);

const gravity = 1.5;
const bounce = 0.3;
const flashDuration = 5;

const ballRadius = 8;
const pegRadius = 5;
const potHeight = 40;

let multipliers;

function updateMultipliers() {
    multipliers = [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000];
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = ballRadius;
        this.dx = Math.random() * 2 - 1;
        this.dy = 1;
        this.color = '#FF0000';
        this.landed = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        if (this.landed) return;
        if (this.x + this.dx > canvas.width - this.radius || this.x + this.dx < this.radius) {
            this.dx = -this.dx;
        }
        if (this.y + this.dy > canvas.height - this.radius - potHeight) {
            this.dy = 0;
            this.dx = 0;
            this.land();
        } else {
            this.dy += gravity * 0.1;
        }
        this.x += this.dx;
        this.y += this.dy;

        this.checkCollisionWithPegs();
    }

    checkCollisionWithPegs() {
        for (const peg of pegs) {
            const dx = this.x - peg.x;
            const dy = this.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.radius + peg.radius) {
                this.dy = -Math.abs(this.dy) * bounce;
                this.dx += Math.random() * 0.4 - 0.2;
                this.x = Math.min(Math.max(this.x, pegRadius), canvas.width - pegRadius);
                this.y += this.dy;
                peg.flash = flashDuration;
            }
        }
    }

    land() {
        const slotWidth = canvas.width / multipliers.length;
        const slotIndex = Math.floor(this.x / slotWidth);
        const multiplier = multipliers[slotIndex];
        if (multiplier < 1) {
            balance -= betAmount;
        } else {
            balance += betAmount * multiplier;
        }
        balanceDisplay.textContent = balance.toFixed(2);
        this.landed = true;
    }
}

class Peg {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = pegRadius;
        this.flash = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        if (this.flash > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.flash--;
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.fill();
        ctx.closePath();
    }
}

let pegs = [];

function createPegs() {
    pegs = [];
    const pegSpacingY = 25; // Vertical spacing between rows
    const basePegSpacingX = 25; // Base horizontal spacing

    for (let i = 0; i < rows; i++) {
        const pegSpacingX = basePegSpacingX;
        const offsetX = (canvas.width - (i * pegSpacingX)) / 2; // Center each row horizontally

        for (let j = 0; j <= i; j++) {
            const x = offsetX + j * pegSpacingX;
            const y = 50 + i * pegSpacingY;
            pegs.push(new Peg(x, y));
        }
    }
}


updateMultipliers();
createPegs();

const slots = [];
for (let i = 0; i < multipliers.length; i++) {
    slots.push({ x: (i + 0.5) * (canvas.width / multipliers.length), multiplier: multipliers[i] });
}

const slotColors = [
    '#ff0000', '#ff4500', '#ff8c00', '#ffd700',
    '#ffff00', '#9acd32', '#7fff00', '#7fff00',
    '#7fff00', '#7fff00', '#9acd32', '#ffd700',
    '#ff8c00', '#ff4500', '#ff0000'
];

const balls = [];

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pegs.forEach(peg => peg.draw());

    slots.forEach((slot, i) => {
        ctx.fillStyle = slotColors[i];
        ctx.fillRect(
            slot.x - (canvas.width / multipliers.length) / 2, 
            canvas.height - potHeight, 
            canvas.width / multipliers.length, 
            potHeight
        );

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(`${slot.multiplier}x`).width;
        ctx.fillText(
            `${slot.multiplier}x`, 
            slot.x - textWidth / 2, 
            canvas.height - 10
        );
    });

    balls.forEach(ball => ball.draw());
}

function update() {
    balls.forEach(ball => ball.update());
}

function gameLoop() {
    draw();
    update();
    requestAnimationFrame(gameLoop);
}

gameLoop();

document.getElementById('insertBallBtn').addEventListener('click', () => {
    betAmount = parseFloat(betAmountInput.value);
    risk = riskSelect.value;
    rows = parseInt(rowsInput.value);

    updateMultipliers();
    createPegs();

    const ball = new Ball(canvas.width / 2, 40);
    balls.push(ball);
});
