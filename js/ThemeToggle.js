// import './ThemeToggle.js';
const themeToggle = document.querySelector('.theme-toggle button');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isDarkMode = !body.classList.contains('light-mode');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun fa-lg"></i>' : '<i class="fas fa-moon fa-lg"></i>';
});