// script.js
console.log("CSE Motors site loaded successfully!");

const passwordInput = document.getElementById('accountPassword');
const toggleButton = document.getElementById('togglePassword');

toggleButton.addEventListener('click', () => {
if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleButton.textContent = 'Hide';
} else {
    passwordInput.type = 'password';
    toggleButton.textContent = 'Show';
    }
});