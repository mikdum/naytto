let currentLang = localStorage.getItem('language') || "fi";
let pinCode = "";
const correctPin = "1234";

// Lataa käännökset
fetch('/src/data/lang.json')
    .then(response => response.json())
    .then(langData => {
        updateLanguage(currentLang, langData);
    });

// Päivitä kieli
function updateLanguage(lang, langData) {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (langData[key] && langData[key][lang]) {
            element.textContent = langData[key][lang];
        }
    });
}

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