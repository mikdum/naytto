let currentLang = localStorage.getItem('language') || "fi";

fetch('/src/data/lang.json')
    .then(response => response.json())
    .then(langData => {
        updateLanguage(currentLang, langData);

        document.querySelectorAll('.btn-lang').forEach(button => {
            button.addEventListener('click', () => {
                currentLang = button.dataset.btn;
                localStorage.setItem('language', currentLang);
                document.querySelectorAll('.btn-lang').forEach(btn => btn.classList.remove('btn_active'));
                button.classList.add('btn_active');
                updateLanguage(currentLang, langData);
            });
        });
    });

function updateLanguage(lang, langData) {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (langData[key] && langData[key][lang]) {
            element.textContent = langData[key][lang];
        }
    });
}

document.querySelector('.btn-login').addEventListener('click', () => {
    window.location.href = '/src/pages/login.html';
}); 