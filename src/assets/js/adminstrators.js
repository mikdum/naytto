document.addEventListener('DOMContentLoaded', () => {
    setupLanguageButtons();
    translatePage();
    setupEventListeners();
    createUserPanel();
});

function setupLanguageButtons() {
    const currentLang = getLang();
    document.querySelectorAll('.btn-lang').forEach(btn => {
        if (btn.getAttribute('data-btn') === currentLang) {
            btn.classList.add('btn_active');
        } else {
            btn.classList.remove('btn_active');
        }
    });

    document.querySelectorAll('[data-btn]').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-btn');
            localStorage.setItem('lang', lang);
            location.reload();
        });
    });
}

function getLang() {
    return localStorage.getItem("lang") || "fi";
}

async function translatePage() {
    const lang = getLang();
    try {
        const response = await fetch('../data/lang.json');
        if (!response.ok) return;
        const translations = await response.json();
        
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });

        document.title = translations['Hallintapaneeli'][lang] || 'Hallintapaneeli';
    } catch (e) {
        console.error('Virhe käännösten lataamisessa:', e);
    }
}

function setupEventListeners() {
    const btnContainer = document.getElementById("myDIV");
    const rightPanelAdm = document.getElementById("rightPanelAdm");
    const btns = btnContainer.getElementsByClassName("list-group-item");

    for (let i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function() {
            const current = document.getElementsByClassName("active");
            current[0].className = current[0].className.replace(" active", "");
            this.className += " active";
            while (rightPanelAdm.firstChild) {
                rightPanelAdm.removeChild(rightPanelAdm.firstChild);
            }

            if (this.dataset.lang === "users") {
                createUserPanel();
            } else if (this.dataset.lang === "menu") {
                createmenuPanel();
            } else if (this.dataset.lang === "tables") {
                createTablesPanel();
            }
        });
    }
}

async function createUserPanel() {
    const users = await loadUsers();
    const $addUserBtn = document.createElement('button');
    $addUserBtn.textContent = 'Add user';
    $addUserBtn.className = 'btn btn-primary btn-lg mb-4 show-add-user-form';
    $addUserBtn.style.width = '100%';
    rightPanelAdm.appendChild($addUserBtn);

    const $formWrapper = document.createElement('div');
    $formWrapper.style.display = 'none';
    $formWrapper.className = 'addUserFormWrapper';
    
    const template = document.getElementById('addUserFormTemplate');
    const formContent = template.content.cloneNode(true);
    $formWrapper.appendChild(formContent);
    rightPanelAdm.appendChild($formWrapper);

    $addUserBtn.addEventListener('click', function() {
        $formWrapper.style.display = 'block';
        $addUserBtn.style.display = 'none';
        setupAddUserForm();
    });

    createUserTable(users);
}

async function loadUsers() {
    const nayttoUsers = localStorage.getItem("nayttoUsers");
    if (nayttoUsers != null) {
        return JSON.parse(nayttoUsers);
    }
    
    try {
        const response = await fetch('../data/users.json');
        if (!response.ok) return [];
        const users = await response.json();
        return users;
    } catch (e) {
        console.error('Virhe käyttäjien lataamisessa:', e);
        return [];
    }
}

function setupAddUserForm() {
    const form = document.getElementById('addUserForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('newUserName').value.trim();
        const role = document.getElementById('newUserRole').value;
        const pin = document.getElementById('newUserPin').value.trim();
        
        if (!/^\d{4}$/.test(pin)) {
            alert('PIN-koodin tulee olla 4 numeroa!');
            return;
        }
        
        const users = await loadUsers();
        const newUser = { name, role, pin };
        users.push(newUser);
        localStorage.setItem("nayttoUsers", JSON.stringify(users));
        
        const rightPanelAdm = document.getElementById("rightPanelAdm");
        while (rightPanelAdm.firstChild) {
            rightPanelAdm.removeChild(rightPanelAdm.firstChild);
        }
        createUserPanel();
    });
}

function createUserTable(users) {
    const $table = document.createElement('table');
    const $thead = document.createElement('thead');
    const $tbody = document.createElement('tbody');
    $table.id = "usersTable";
    
    let $tr = document.createElement('tr');
    let $tdName = document.createElement('td');
    let $tdRole = document.createElement('td');
    let $tdPin = document.createElement('td');

    const $menuPanel = document.createElement('div');
    $menuPanel.classList.add("user-list-panel", "rigth-card", "p-3", "rounded", "shadow", "mb-4");
    rightPanelAdm.appendChild($menuPanel);
    $menuPanel.appendChild($table);

    $tdName.innerHTML = `<span class="text-light" data-lang="Name">Nimi</span>`;
    $tdRole.innerHTML = `<span class="text-light" data-lang="Role">Rooli</span>`;
    $tdPin.innerHTML = `<span class="text-light" data-lang="PIN">PIN</span>`;

    $tr.append($tdName);
    $tr.append($tdRole);
    $tr.append($tdPin);

    $thead.append($tr);

    $table.classList.add("table", "table-dark", "table-striped", "rounded");
    $table.append($thead);
    $table.append($tbody);
    
    users.forEach(element => {
        $tdName = document.createElement('td');
        $tdRole = document.createElement('td');
        $tdPin = document.createElement('td');
        $tdDelete = document.createElement('td');

        $tr = document.createElement('tr');

        $tdName.innerHTML = `<span class="text-light">${element.name}</span>`;
        $tdRole.innerHTML = `<span class="text-light">${element.role}</span>`;
        $tdPin.innerHTML = `<span class="text-light">${element.pin}</span>`;

        $tdDelete.innerHTML = `<a class='btn btn-outline-danger btn-sm' href='#' onclick=deleteRow(this.parentNode.parentNode,"usersTable") ><i class="fa fa-trash"></i></a>`;
        $tr.append($tdName);
        $tr.append($tdRole);
        $tr.append($tdPin);
        $tr.append($tdDelete);

        $tbody.append($tr);
    });
}

function deleteRow(row, idtable) {
    const table = document.getElementById(idtable);
    if (idtable === "usersTable") {
        const users = JSON.parse(localStorage.getItem("nayttoUsers")) || [];
        const updatedUsers = users.filter((e) => e.name != row.cells[0].textContent);
        localStorage.setItem("nayttoUsers", JSON.stringify(updatedUsers));
    } else {
        const menu = JSON.parse(localStorage.getItem("nayttoMenu")) || {};
        const currentItems = menu[idtable.replace("menuTable", "")];
        currentItems.items = currentItems.items.filter((e) => e.en != row.cells[2].textContent);
        localStorage.setItem("nayttoMenu", JSON.stringify(menu));
    }
    table.deleteRow(row.rowIndex);
}

async function createmenuPanel() {
    const template = document.getElementById('addMenuButtonTemplate');
    const button = template.content.cloneNode(true);
    rightPanelAdm.appendChild(button);

    const menu = await loadMenu();
    createMenuTables(menu);
}

async function loadMenu() {
    const nayttoMenu = localStorage.getItem("nayttoMenu");
    if (nayttoMenu != null) {
        return JSON.parse(nayttoMenu);
    }
    
    try {
        const response = await fetch('../data/menu.json');
        if (!response.ok) return {};
        const menu = await response.json();
        return menu;
    } catch (e) {
        console.error('Virhe valikon lataamisessa:', e);
        return {};
    }
}

function createMenuTables(menu) {
    for (const [key, value] of Object.entries(menu)) {
        const $menuPanel = document.createElement('div');
        $menuPanel.classList.add("rigth-card");
        rightPanelAdm.appendChild($menuPanel);

        const $table = document.createElement('table');
        const $thead = document.createElement('thead');
        const $tbody = document.createElement('tbody');

        $table.id = `menuTable${key}`;
        const $currentItem = document.createElement('div');
        $currentItem.classList.add("groupelement");
        $currentItem.classList.add("bg-dark");

        createDescriptionelement($currentItem, value.ru);
        createDescriptionelement($currentItem, value.fi);
        createDescriptionelement($currentItem, value.en);

        $menuPanel.appendChild($currentItem);
        $menuPanel.appendChild($table);

        let $tr = createTrMenu("Ru", "Fi", "En", "Price");
        $thead.append($tr);

        $table.classList.add("table");
        $table.classList.add("table-dark");
        $table.append($thead);
        $table.append($tbody);

        value.items.forEach(element => {
            let $tr = createTrMenu(element.ru, element.fi, element.en, element.price);
            $tdDelete = document.createElement('td');
            $tdDelete.innerHTML = `<a class='btn btn-light' href='#' onclick=deleteRow(this.parentNode.parentNode,"menuTable${key}") ><img src='/images/crest.png' style="width: 20px; height: 20px;"></a>`;
            $tr.append($tdDelete);
            $tbody.append($tr);
        });
    }
}

function createDescriptionelement($parent, currentdescription) {
    const $element = document.createElement('div');
    $element.classList.add("description");
    $element.textContent = currentdescription;
    $parent.appendChild($element);
}

function createTrMenu(Ru, Fi, En, Price) {
    let $tr = document.createElement('tr');
    let $tdRu = document.createElement('td');
    let $tdFi = document.createElement('td');
    let $tdEn = document.createElement('td');
    let $tdPrice = document.createElement('td');

    $tdRu.textContent = Ru;
    $tdFi.textContent = Fi;
    $tdEn.textContent = En;
    $tdPrice.textContent = Price;

    $tr.append($tdRu);
    $tr.append($tdFi);
    $tr.append($tdEn);
    $tr.append($tdPrice);
    return $tr;
}

function createTablesPanel() {
    const template = document.getElementById('tablesPanelTemplate');
    const panel = template.content.cloneNode(true);
    rightPanelAdm.appendChild(panel);
}