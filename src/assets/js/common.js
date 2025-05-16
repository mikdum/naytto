let currentLang = localStorage.getItem('language') || "fi";

document.querySelectorAll('.btn-lang').forEach(btn => {
    if (currentLang === btn.dataset.btn) {
        btn.classList.add('btn_active');
    }
    else {
        btn.classList.remove('btn_active');
    }

})

if (location.pathname === "/naytto/") {
    var langfile = '/naytto/src/data/lang.json';
}
else if (location.pathname === "/index.html") {
    var langfile = '/src/data/lang.json';
}
else {
    var langfile = '../data/lang.json';
}
try {


    fetch(langfile)
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

} catch (error) {
}
function updateLanguage(lang, langData) {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (langData[key] && langData[key][lang]) {
            element.textContent = langData[key][lang];
        }
    });
}
