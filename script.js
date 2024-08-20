const canvas = document.getElementById("canvas1"),
ctx = canvas.getContext("2d");
canvas.width = window.innerWidth, canvas.height = window.innerHeight, color__ = "rgba(75,75,75,";
let particlesArray;
class Particle {
    constructor(t, i, a, r, e, c) {
        this.x = t, this.y = i, this.directionX = a, this.directionY = r, this.size = e, this.color = c
    }
    draw() {
        ctx.beginPath(), ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, !1), ctx.fillStyle = "rgba(75,75,75,1)", ctx.fill()
    }
    update() {
        (this.x > canvas.width || this.x < 0) && (this.directionX = -this.directionX), (this.y > canvas.height || this.y < 0) && (this.directionY = -this.directionY), this.x += this.directionX, this.y += this.directionY, this.draw()
    }
}

function init() {
    particlesArray = [];
    let t = canvas.height * canvas.width / 45e3;
    for (let i = 0; i < t; i++) {
        let a = 5 * Math.random() + 1,
            r = Math.random() * (innerWidth - 2 * a - 2 * a) + 2 * a,
            e = Math.random() * (innerHeight - 2 * a - 2 * a) + 2 * a,
            c = 5 * Math.random() - 2.5,
            s = 5 * Math.random() - 2.5;
        particlesArray.push(new Particle(r, e, c, s, a, "rgba(75,75,75,1)"))
    }
}

function connect() {
    let t = 1;
    for (let i = 0; i < particlesArray.length; i++)
        for (let a = i; a < particlesArray.length; a++) {
            let r = (particlesArray[i].x - particlesArray[a].x) * (particlesArray[i].x - particlesArray[a].x) + (particlesArray[i].y - particlesArray[a].y) * (particlesArray[i].y - particlesArray[a].y);
            r < canvas.width / 9 * (canvas.height / 9) && (t = 1 - r / 15e3, ctx.strokeStyle = color__ + t + ")", ctx.lineWidth = 2, ctx.beginPath(), ctx.moveTo(particlesArray[i].x, particlesArray[i].y), ctx.lineTo(particlesArray[a].x, particlesArray[a].y), ctx.stroke())
        }
}

function animate() {
    requestAnimationFrame(animate), ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let t = 0; t < particlesArray.length; t++) particlesArray[t].update();
    connect()
}
window.addEventListener("resize", function() {
    canvas.width = this.innerWidth, canvas.height = this.innerHeight, canvas.radius = canvas.height / 100 * (canvas.height / 100), init()
}), init(), animate();

function calculateAge(e) {
    let t = new Date,
        a = new Date(e);
    if (a > t) return "Invalid";
    if (1990 > a.getFullYear() || a.getFullYear() > 2010) return "Birthdate out of range";
    let n = t.getFullYear() - a.getFullYear(),
        l = t.getMonth() - a.getMonth();
    return (l < 0 || 0 === l && t.getDate() < a.getDate()) && n--, n
}
document.addEventListener("DOMContentLoaded", () => {
    let e = document.getElementById("birthday"),
        t = e.getAttribute("datetime"),
        a = calculateAge(t);
    document.getElementById("age").textContent = a
});
"use strict";
const elementToggleFunc = function(e) {
        e.classList.toggle("active")
    },
    sidebar = document.querySelector("[data-sidebar]"),
    sidebarBtn = document.querySelector("[data-sidebar-btn]");
sidebarBtn.addEventListener("click", function() {
    elementToggleFunc(sidebar)
});
const testimonialsItem = document.querySelectorAll("[testimonials-data-item]"),
    modalContainer = document.querySelector("[testimonials-data-modal-container]"),
    modalCloseBtn = document.querySelector("[testimonials-data-modal-close-btn]"),
    overlay = document.querySelector("[testimonials-data-overlay]"),
    modalImg = document.querySelector("[testimonials-data-modal-img]"),
    modalTitle = document.querySelector("[testimonials-data-modal-title]"),
    modalText = document.querySelector("[testimonials-data-modal-text]"),
    testimonialsModalFunc = function() {
        modalContainer.classList.toggle("active"), overlay.classList.toggle("active")
    };
for (let i = 0; i < testimonialsItem.length; i++) testimonialsItem[i].addEventListener("click", function() {
    modalImg.src = this.querySelector("[testimonials-data-avatar]").src, modalImg.alt = this.querySelector("[testimonials-data-avatar]").alt, modalTitle.innerHTML = this.querySelector("[testimonials-data-title]").innerHTML, modalText.innerHTML = this.querySelector("[testimonials-data-text]").innerHTML, testimonialsModalFunc()
});
// modalCloseBtn.addEventListener("click", testimonialsModalFunc), overlay.addEventListener("click", testimonialsModalFunc);
const select = document.querySelector("[data-select]"),
    selectItems = document.querySelectorAll("[data-select-item]"),
    selectValue = document.querySelector("[data-selecct-value]"),
    filterBtn = document.querySelectorAll("[data-filter-btn]");
// select.addEventListener("click", function() {
//     elementToggleFunc(this)
// });
for (let i = 0; i < selectItems.length; i++) selectItems[i].addEventListener("click", function() {
    let e = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText, elementToggleFunc(select), filterFunc(e)
});
const filterItems = document.querySelectorAll("[data-filter-item]"),
    filterFunc = function(e) {
        for (let t = 0; t < filterItems.length; t++) "42cursus" === e ? filterItems[t].classList.add("active") : e === filterItems[t].dataset.category ? filterItems[t].classList.add("active") : filterItems[t].classList.remove("active")
    };
let lastClickedBtn = filterBtn[0];
for (let i = 0; i < filterBtn.length; i++) filterBtn[i].addEventListener("click", function() {
    let e = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText, filterFunc(e), lastClickedBtn.classList.remove("active"), this.classList.add("active"), lastClickedBtn = this
});
const form = document.querySelector("[data-form]"),
    formInputs = document.querySelectorAll("[data-form-input]"),
    formBtn = document.querySelector("[data-form-btn]");
for (let i = 0; i < formInputs.length; i++) formInputs[i].addEventListener("input", function() {
    form.checkValidity() ? formBtn.removeAttribute("disabled") : formBtn.setAttribute("disabled", "")
});
const navigationLinks = document.querySelectorAll("[data-nav-link]"),
    pages = document.querySelectorAll("[data-page]");
for (let i = 0; i < navigationLinks.length; i++) navigationLinks[i].addEventListener("click", function() {
    for (let e = 0; e < pages.length; e++) this.innerHTML.toLowerCase() === pages[e].dataset.page ? (pages[e].classList.add("active"), navigationLinks[e].classList.add("active"), window.scrollTo(0, 0)) : (pages[e].classList.remove("active"), navigationLinks[e].classList.remove("active"))
});