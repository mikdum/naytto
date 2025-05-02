const langButtons = document.querySelectorAll("[data-btn]");
const response = await fetch('./lang.json');
var currenLang = "fi";
const currentText = await response.json();

langButtons.forEach((btn => {
    btn.addEventListener('click', (event) => {
        currenLang = event.target.dataset.btn;
        langButtons.forEach((elem) => elem.classList.remove(`btn_active`));

        btn.classList.add(`btn_active`);
        changeLang();

    })
}))




function changeLang() {
    for (const key in currentText) {
        const element = document.querySelector(`[data-lang=${key}]`);
        if (element) {
            element.textContent = currentText[key][currenLang];
        }

    }
}

changeLang();
