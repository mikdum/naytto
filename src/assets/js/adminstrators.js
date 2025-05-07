// Get the container element
var btnContainer = document.getElementById("myDIV");

// Get the container element
var rightPanelAdm = document.getElementById("rightPanelAdm");

// Get all buttons with class="btn" inside the container
var btns = btnContainer.getElementsByClassName("list-group-item");


var users = [];
var menu = {};

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
    while (rightPanelAdm.firstChild) {
      rightPanelAdm.removeChild(rightPanelAdm.firstChild);
    }

    if (this.dataset.lang === "users") {
      createUserPanel();
    }
    else if (this.dataset.lang === "menu") {
      createmenuPanel();
    }


  });
}




function createUserPanel() {
  nayttoUsers = localStorage.getItem("nayttoUsers");
  if (nayttoUsers != null) {
    users = JSON.parse(nayttoUsers);
    createUserTable();
  } else {
    var langfile = '../data/users.json';
    fetch(langfile)
      .then(response => response.json())
      .then(langData => {
        users = langData;
        createUserTable();
      });
  }

  // Add user -painike
  const $addUserBtn = document.createElement('button');
  $addUserBtn.textContent = 'Add user';
  $addUserBtn.className = 'btn btn-primary btn-lg mb-4 show-add-user-form';
  $addUserBtn.style.width = '100%';
  rightPanelAdm.appendChild($addUserBtn);

  // Lomake wrapper
  const $formWrapper = document.createElement('div');
  $formWrapper.style.display = 'none';
  $formWrapper.className = 'addUserFormWrapper';
  $formWrapper.innerHTML = htmlButtonAddUser();
  rightPanelAdm.appendChild($formWrapper);

  $addUserBtn.addEventListener('click', function() {
    $formWrapper.style.display = 'block';
    $addUserBtn.style.display = 'none';
    setupAddUserForm();
  });
}

const translations = {
  fi: {
    addUser: "Lisää käyttäjä",
    name: "Nimi",
    role: "Rooli",
    pin: "PIN",
    admin: "Admin",
    waiter: "Tarjoilija",
    users: "Käyttäjät",
    delete: "Poista"
  },
  en: {
    addUser: "Add user",
    name: "Name",
    role: "Role",
    pin: "PIN",
    admin: "Admin",
    waiter: "Waiter",
    users: "Users",
    delete: "Delete"
  },
  ru: {
    addUser: "Добавить пользователя",
    name: "Имя",
    role: "Роль",
    pin: "ПИН",
    admin: "Админ",
    waiter: "Официант",
    users: "Пользователи",
    delete: "Удалить"
  }
};

function getLang() {
  return localStorage.getItem("nayttoLang") || "fi";
}

function htmlButtonAddUser() {
  const lang = getLang();
  const t = translations[lang];
  return `
    <form id="addUserForm" class="p-3 rounded shadow mb-3" style="max-width:400px;">
      <h5 class="text-light mb-3">${t.addUser}</h5>
      <div class="form-group">
        <label class="text-light">${t.name}</label>
        <input type="text" class="form-control text-light" id="newUserName" required>
      </div>
      <div class="form-group">
        <label class="text-light">${t.role}</label>
        <select class="form-control text-light" id="newUserRole" required>
          <option value="admin">${t.admin}</option>
          <option value="waiter">${t.waiter}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="text-light">${t.pin}</label>
        <input type="text" class="form-control text-light" id="newUserPin" required pattern="\\d{4}">
      </div>
      <button type="submit" class="btn btn-success btn-block mt-2">${t.addUser}</button>
    </form>
  `;
}

function setupAddUserForm() {
  const form = document.getElementById('addUserForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;
    const pin = document.getElementById('newUserPin').value.trim();
    if (!/^\d{4}$/.test(pin)) {
      alert('PIN-koodin tulee olla 4 numeroa!');
      return;
    }
    const newUser = { name, role, pin };
    users.push(newUser);
    localStorage.setItem("nayttoUsers", JSON.stringify(users));
    createUserTable();
    form.reset();
    location.reload();
  });
}

function createUserTable() {
  const lang = getLang();
  const t = translations[lang];
  const $table = document.createElement('table'),
    $thead = document.createElement('thead'),
    $tbody = document.createElement('tbody');
  $table.id = "usersTable";
  let $tr = document.createElement('tr');
  let $tdName = document.createElement('td'),
    $tdRole = document.createElement('td'),
    $tdPin = document.createElement('td');

  const $menuPanel = document.createElement('div');
  $menuPanel.classList.add("user-list-panel", "rigth-card", "p-3", "rounded", "shadow", "mb-4");
  rightPanelAdm.appendChild($menuPanel);
  $menuPanel.appendChild($table);

  $tdName.innerHTML = `<span class="text-light">${t.name}</span>`;
  $tdRole.innerHTML = `<span class="text-light">${t.role}</span>`;
  $tdPin.innerHTML = `<span class="text-light">${t.pin}</span>`;

  $tr.append($tdName);
  $tr.append($tdRole);
  $tr.append($tdPin);

  $thead.append($tr);

  $table.classList.add("table", "table-dark", "table-striped", "rounded");
  $table.append($thead);
  $table.append($tbody);
  users.forEach(element => {
    $tdName = document.createElement('td'),
      $tdRole = document.createElement('td'),
      $tdPin = document.createElement('td');
    $tdDelete = document.createElement('td');

    $tr = document.createElement('tr');

    $tdName.innerHTML = `<span class=\"text-light\">${element.name}</span>`;
    $tdRole.innerHTML = `<span class=\"text-light\">${element.role}</span>`;
    $tdPin.innerHTML = `<span class=\"text-light\">${element.pin}</span>`;

    $tdDelete.innerHTML = `<a class='btn btn-outline-danger btn-sm' href='#' onclick=deleteRow(this.parentNode.parentNode,\"usersTable\") ><i class=\"fa fa-trash\"></i></a>`;
    $tr.append($tdName);
    $tr.append($tdRole);
    $tr.append($tdPin);
    $tr.append($tdDelete);

    $tbody.append($tr);
  });
}

createUserPanel();

function createmenuPanel() {
  const button = document.createElement('div');
  button.classList.add("addUser");
  button.innerHTML = htmlButtonAddUser();
  rightPanelAdm.appendChild(button);


  nayttoMenu = localStorage.getItem("nayttoMenu");
  if (nayttoMenu != null) {
    menu = JSON.parse(nayttoMenu);
    createMenuTables();

  }
  else {
    var langfile = '../data/menu.json';
    fetch(langfile)
      .then(response => response.json())
      .then(langData => {
        menu = langData;
        createMenuTables();
      });

  }
}

function createMenuTables() {

  for (const [key, value] of Object.entries(menu)) {
    const $menuPanel = document.createElement('div');
    $menuPanel.classList.add("rigth-card");
    rightPanelAdm.appendChild($menuPanel);

    const $table = document.createElement('table'),
      $thead = document.createElement('thead'),
      $tbody = document.createElement('tbody');

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




  };

}

function deleteRow(row, idtable) {
  var table = document.getElementById(idtable);
  if (idtable === "usersTable") {

    users = users.filter((e, i) => e.name != row.cells[0].textContent);
    localStorage.setItem("nayttoUsers", JSON.stringify(users));
  }
  else {


    var currentItems = menu[idtable.replace("menuTable", "")];
    currentItems.items = currentItems.items.filter((e, i) => e.en != row.cells[2].textContent);
    localStorage.setItem("nayttoMenu", JSON.stringify(menu));
  }

  table.deleteRow(row.rowIndex);

}
function createDescriptionelement($parent, currentdescription) {
  $element = document.createElement('div');
  $element.classList.add("description");
  $element.textContent = currentdescription;
  $parent.appendChild($element);
}

function createTrMenu(Ru, Fi, En, Price) {

  let $tr = document.createElement('tr');

  let $tdRu = document.createElement('td'),
    $tdFi = document.createElement('td'),
    $tdEn = document.createElement('td');
  $tdPrice = document.createElement('td');

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

function clearCache(){
  localStorage.removeItem("nayttoUsers");
  localStorage.removeItem("nayttoMenu");
  var current = document.getElementsByClassName("active");
  while (rightPanelAdm.firstChild) {
    rightPanelAdm.removeChild(rightPanelAdm.firstChild);
  }
 
  if (current[0].dataset.lang === "users") {
    createUserPanel();
  }
  else if (current[0].dataset.lang === "menu") {
    createmenuPanel();
  }


}