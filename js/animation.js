const themeToggle = document.querySelector('.theme-toggle button');
const body = document.body;
let color__ = "rgba(255,255,255,";
let particleColor = "rgba(255,255,255,1)";
themeToggle.addEventListener('click', () => {
	body.classList.toggle('light-mode');
	const isDarkMode = !body.classList.contains('light-mode');
	themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun fa-lg"></i>' : '<i class="fas fa-moon fa-lg"></i>';
    color__ = isDarkMode ? "rgba(255,255,255," :  "rgba(0,0,0";
    particleColor = isDarkMode ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)";
	init();
	connect();
});

const canvas = document.getElementById("background");
ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particlesArray;
class Particle {
    constructor(t, i, a, r, e, c) {
        this.x = t, this.y = i, this.directionX = a, this.directionY = r, this.size = e, this.color = c;
    }
    draw() {
        ctx.beginPath(), ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, !1), ctx.fillStyle = this.color, ctx.fill();
    }
    update() {
        (this.x > canvas.width || this.x < 0) && (this.directionX = -this.directionX), (this.y > canvas.height || this.y < 0) && (this.directionY = -this.directionY), this.x += this.directionX, this.y += this.directionY, this.draw();
    }
}

function init() {
    particlesArray = [];
    let t = canvas.height * canvas.width / 90000;
    for (let i = 0; i < t; i++) {
        let a = 3 * Math.random() + 1,
		r = Math.random() * (innerWidth - 2 * a - 2 * a) + 2 * a,
		e = Math.random() * (innerHeight - 2 * a - 2 * a) + 2 * a,
		c = 2 * Math.random() - 1,
		s = 2 * Math.random() - 1;
		particlesArray.push(new Particle(r, e, c, s, a, particleColor));
	}
}

function connect() {
    let t = 1;
    for (let i = 0; i < particlesArray.length; i++)
        for (let a = i; a < particlesArray.length; a++) {
            let r = (particlesArray[i].x - particlesArray[a].x) * (particlesArray[i].x - particlesArray[a].x) + (particlesArray[i].y - particlesArray[a].y) * (particlesArray[i].y - particlesArray[a].y);
            r < canvas.width / 10 * (canvas.height / 10) && (t = 1 - r / 20000, ctx.strokeStyle = color__ + t + ")", ctx.lineWidth = 0.5, ctx.beginPath(), ctx.moveTo(particlesArray[i].x, particlesArray[i].y), ctx.lineTo(particlesArray[a].x, particlesArray[a].y), ctx.stroke());
        }
}

function animate() {
    requestAnimationFrame(animate), ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let t = 0; t < particlesArray.length; t++) particlesArray[t].update();
    connect();
}
window.addEventListener("resize", function() {
    canvas.width = this.innerWidth, canvas.height = this.innerHeight, init();
});
init(), animate();
