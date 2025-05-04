
let pinCode = "";
const correctPin = "1234";

// Lisää numero PIN-koodiin
document.querySelectorAll('.btn-num').forEach(button => {
    button.addEventListener('click', () => {
        if (pinCode.length < 4) {
            pinCode += button.dataset.num;
            updatePinDisplay();
        }
    });
});

// Tyhjennä PIN-koodi
document.querySelector('.btn-clear').addEventListener('click', () => {
    pinCode = "";
    updatePinDisplay();
});

// Tarkista PIN-koodi
document.querySelector('.btn-enter').addEventListener('click', () => {
    if (pinCode === correctPin) {
        window.location.href = '/src/pages/adminstrators.html';
    } else {
        pinCode = "";
        updatePinDisplay();
    }
});

// Päivitä PIN-näyttö
function updatePinDisplay() {
    const digits = document.querySelectorAll('.pin-digit');
    digits.forEach((digit, index) => {
        if (index < pinCode.length) {
            digit.classList.add('filled');
        } else {
            digit.classList.remove('filled');
        }
    });
} 