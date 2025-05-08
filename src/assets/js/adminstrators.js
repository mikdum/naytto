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

  addButton("user");

  nayttoUsers = localStorage.getItem("nayttoUsers");
  if (nayttoUsers != null) {
    users = JSON.parse(nayttoUsers);
    createUserTable();

  }
  else {

    var langfile = '../data/users.json';
    fetch(langfile)
      .then(response => response.json())
      .then(langData => {
        users = langData;
        createUserTable();
      });
  }


}

function createUserTable() {

  const $table = document.createElement('table'),
    $thead = document.createElement('thead'),
    $tbody = document.createElement('tbody');
  $table.id = "usersTable";
  let $tr = document.createElement('tr');
  let $tdName = document.createElement('td'),
    $tdRole = document.createElement('td'),
    $tdPin = document.createElement('td');


  const $menuPanel = document.createElement('div');
  $menuPanel.classList.add("rigth-card");
  rightPanelAdm.appendChild($menuPanel);
  $menuPanel.appendChild($table);


  $tdName.textContent = 'Name';
  $tdRole.textContent = 'Role';
  $tdPin.textContent = 'Pin';

  $tr.append($tdName);
  $tr.append($tdRole);
  $tr.append($tdPin);

  $thead.append($tr);


  $table.classList.add("table");
  $table.classList.add("table-dark");
  $table.append($thead);
  $table.append($tbody);
  users.forEach(element => {

    $tdName = document.createElement('td'),
      $tdRole = document.createElement('td'),
      $tdPin = document.createElement('td');
    $tdDelete = document.createElement('td');

    $tr = document.createElement('tr');

    $tdName.textContent = element.name;
    $tdRole.textContent = element.role;
    $tdPin.textContent = element.pin;

    $tdDelete.innerHTML = `<a class='btn btn-light' href='#' onclick=deleteRow(this.parentNode.parentNode,"usersTable") ><img src='/images/crest.png' style="width: 20px; height: 20px;"></a>`;
    $tr.append($tdName);
    $tr.append($tdRole);
    $tr.append($tdPin);
    $tr.append($tdDelete);



    $tbody.append($tr);


  });

}

createUserPanel();

function htmlButtonAddUser() {
  return `<button type="button" class="btn btn-outline-secondary bg-dark" id="btn-addModalWindow" data-bs-toggle="modal" data-bs-target="#addModalWindow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-person-plus" viewBox="0 0 16 16">
                        <path
                            d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z">
                        </path>
                        <path fill-rule="evenodd"
                            d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5">
                        </path>
                    </svg>
                    <span class="visually-hidden"  id="buttonTitle" data-lang="user">User</span>
                </button>
`
}


function createmenuPanel() {

  addButton("menu");
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

function clearCache() {
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

function createModalPanel(typeOfPanel) {

  console.log(typeOfPanel);
}

function addButton(buttonName) {
  const $button = document.createElement('div');

  $button.classList.add("addUser");
  $button.innerHTML = htmlButtonAddUser();

  rightPanelAdm.appendChild($button);
  var btnaddModalWindow = document.getElementById("btn-addModalWindow");
  btnaddModalWindow.onclick = function () { createModalPanel(buttonName) };
  
  var buttonTitle = document.getElementById("buttonTitle");
  buttonTitle.setAttribute("data-lang",buttonName);  
  document.querySelector('.btn-lang.btn_active').click();
}


function closemodalDiscard() {

}