
let pinCode = "";

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

    nayttoUsers = localStorage.getItem("nayttoUsers");
    if (nayttoUsers != null) {
        users = JSON.parse(nayttoUsers);
        checkPinCode();

    }
    else {

        var langfile = '../data/users.json';
        fetch(langfile)
            .then(response => response.json())
            .then(langData => {
                users = langData;
                checkPinCode();
            });
    }



});

function checkPinCode() {

    currentUser = users.filter((e, i) => e.pin === pinCode);
    console.log(pinCode);
    console.log(currentUser);
    if (currentUser.length > 0 && currentUser[0].role === "kokki") {
        window.location.href = '../../src/pages/kokit.html';
    }

    else if (currentUser.length > 0 && currentUser[0].role === "tarjoilija") {
        window.location.href = '../../src/pages/tarjoilijat.html';
    }
    else if (currentUser.length > 0 && currentUser[0].role === "administrator") {
        window.location.href = '../../src/pages/adminstrators.html';
    }
    else if (currentUser.length > 0 && currentUser[0].role === "boss") {
        window.location.href = '../../src/pages/ohjaaja.html';
    }

    else {
        pinCode = "";
        updatePinDisplay();
    }
}

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

function clearCache() {
    localStorage.removeItem("nayttoUsers");
    localStorage.removeItem("nayttoMenu");
    localStorage.removeItem("nayttoTables");
  
  }