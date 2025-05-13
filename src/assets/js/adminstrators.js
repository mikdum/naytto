// Get the container element
var btnContainer = document.getElementById("myDIV");

// Get the container element
var rightPanelAdm = document.getElementById("rightPanelAdm");

// Get all buttons with class="btn" inside the container
var btns = btnContainer.getElementsByClassName("list-group-item");


var users = [];
var tables = [];
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
    else if (this.dataset.lang === "tables") {
      createtablePanel();
       
    }
  });
}


function createtablePanel() {

  addButton("tables");

  nayttoTables = localStorage.getItem("nayttoTables");
  if (nayttoTables != null) {
    tables = JSON.parse(nayttoTables);
    createTable();

  }
  else {

    var langfile = '../data/tables.json';
    fetch(langfile)
      .then(response => response.json())
      .then(langData => {
        tables = langData;
        createTable();
      });
  }
  document.getElementById("savechanges").onclick = function () { saveTables() };

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
  document.getElementById("savechanges").onclick = function () { saveUsers() };

}
function createTable() {

  const $table = document.createElement('table'),
    $thead = document.createElement('thead'),
    $tbody = document.createElement('tbody');
  $table.id = "PydatTable";
  
  const $menuPanel = document.createElement('div');
  $menuPanel.classList.add("rigth-card");
  rightPanelAdm.appendChild($menuPanel);
  $menuPanel.appendChild($table);

  let $tr = createTrMenu("Ru", "Fi", "En", "type");

  $tr.cells[3].setAttribute("data-lang", "type");
  $thead.append($tr);


  $table.classList.add("table");
  $table.classList.add("table-dark");
  $table.append($thead);
  $table.append($tbody);


  tables.forEach(element => {
    let $tr = createTrMenu(element.name.ru, element.name.fi, element.name.en, element.type);
    $tdDelete = document.createElement('td');
    $tdDelete.innerHTML = `<a class='btn btn-light' href='#' onclick=deleteRow(this.parentNode.parentNode,"PydatTable") ><img src='/images/crest.png' style="width: 20px; height: 20px;"></a>`;
    $tr.append($tdDelete);

    $tbody.append($tr);

  });



  document.querySelector('.btn-lang.btn_active').click();

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
  $tdName.setAttribute("data-lang", "name");
  $tdRole.setAttribute("data-lang", "role");
  $tdPin.setAttribute("data-lang", "pincode");

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
    $tdRole.setAttribute("data-lang", element.role);
    $tdPin.textContent = element.pin;

    $tdDelete.innerHTML = `<a class='btn btn-light' href='#' onclick=deleteRow(this.parentNode.parentNode,"usersTable") ><img src='/images/crest.png' style="width: 20px; height: 20px;"></a>`;
    $tr.append($tdName);
    $tr.append($tdRole);
    $tr.append($tdPin);
    $tr.append($tdDelete);



    $tbody.append($tr);


  });
  document.querySelector('.btn-lang.btn_active').click();

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
   
   
    $tdDelete = document.createElement('div');
    $tdDelete.innerHTML = `<a class='btn btn-light mt-2  mr-2' href='#' onclick=editcurrentPartion("${value.en}") data-lang="edit" id="btn-addModalWindow" data-bs-toggle="modal" data-bs-target="#addModalWindow">qqq</a>`;
    $currentItem.append($tdDelete);
  

    $tdDelete = document.createElement('div');
    $tdDelete.innerHTML = `<a class='btn btn-light mt-2' href='#' onclick=deletecurrentPartion("${value.en}") ><img src='/images/crest.png' style="width: 20px; height: 20px;"></a>`;
    $currentItem.append($tdDelete);
  

    $menuPanel.appendChild($currentItem);
    $menuPanel.appendChild($table);


    let $tr = createTrMenu("Ru", "Fi", "En", "Price");

    $tr.cells[3].setAttribute("data-lang", "price");
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


    document.querySelector('.btn-lang.btn_active').click();

  };
  document.getElementById("savechanges").onclick = function () { saveMenu("") };

}


function editcurrentPartion(valueen) {
  createModalPanel("menu");
  currentMenuItem=menu[valueen];
  console.log(currentMenuItem);

  document.getElementById("AddMenuEn").value=valueen;
  document.getElementById("AddMenuFi").value=currentMenuItem.fi;
  document.getElementById("AddMenuRu").value=currentMenuItem.ru;
  $tbody=document.querySelector("#menuTableAdding >tbody");
  $tbody.removeChild($tbody.firstChild);
  currentMenuItem.items.forEach(element => {
    var $tr=addRowMenu();
    console.log($tr.cells[0]);
    $tr.cells[0].childNodes[0].value=element.ru;
    $tr.cells[1].childNodes[0].value=element.fi;
    $tr.cells[2].childNodes[0].value=element.en;
    $tr.cells[3].childNodes[0].value=element.price;
    $tbody.appendChild($tr);

  });
  document.getElementById("savechanges").onclick = function () { saveMenu(`${valueen}`) };

}

function deletecurrentPartion(valueen) {
  menu=Object.fromEntries(Object.entries(menu).filter(([e]) => e !=valueen));
  localStorage.setItem("nayttoMenu", JSON.stringify(menu));

  while (rightPanelAdm.firstChild) {
    rightPanelAdm.removeChild(rightPanelAdm.firstChild);
  }

     createmenuPanel();
 
}

function deleteRow(row, idtable) {
  var table = document.getElementById(idtable);
  if (idtable === "usersTable") {

    users = users.filter((e, i) => e.name != row.cells[0].textContent);
    localStorage.setItem("nayttoUsers", JSON.stringify(users));
  }
  else if (idtable === "PydatTable") {

    tables = tables.filter((e, i) => e.name.en != row.cells[2].textContent);
    localStorage.setItem("nayttoTables", JSON.stringify(tables));
  }

  else if (idtable!="menuTableAdding"){


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



function createTrEpty() {

  let $tr = document.createElement('tr');

  let $tdRu = document.createElement('td'),
    $tdFi = document.createElement('td'),
    $tdEn = document.createElement('td');
  $tdPrice = document.createElement('td');

  $tdRu.innerHTML = "<input type='text'>";
  $tdFi.innerHTML = "<input type='text'>";
  $tdEn.innerHTML = "<input type='text'>";
  $tdPrice.innerHTML = "<input type='number'>";

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

  $bodyofform = document.querySelector(".modal-body");
  while ($bodyofform.firstChild) {
    $bodyofform.removeChild($bodyofform.firstChild);
  }
  if (typeOfPanel == "user") {
    createModalUsers();
  }
  else if (typeOfPanel == "menu") {
    createModalMenu();

  }
  else if (typeOfPanel == "tables") {
    createModalTable();
    
  }

  document.querySelector('.btn-lang.btn_active').click();
}
function createModalMenu() {
  document.getElementById("addModalWindow").querySelector(".modal-dialog").classList.add("modal-xl");
  $titleLabel = document.getElementById("addModalWindowLabel");
  $titleLabel.setAttribute("data-lang", "addingMenu");

  addElementwithLabel($bodyofform, "AddMenuRu", "russian", "30");
  addElementwithLabel($bodyofform, "AddMenuFi", "finnish", "30");
  addElementwithLabel($bodyofform, "AddMenuEn", "english", "30");


  const $parent = document.createElement('div');

  $bodyofform.appendChild($parent);
  $button = document.createElement('button');
  $button.setAttribute("data-lang","addRow");
  $button.classList.add("btn");
  $button.classList.add("btn-secondary");
  $button.onclick=function(){
    var tr=addRowMenu();
    document.querySelector("#menuTableAdding >tbody").appendChild(tr);
  }
  $parent.appendChild($button);

  const $table = document.createElement('table'),
    $thead = document.createElement('thead'),
    $tbody = document.createElement('tbody');


  $parent.appendChild($table);
  $table.id="menuTableAdding";

  let $tr = createTrMenu("Ru", "Fi", "En", "Price");

  $tr.cells[3].setAttribute("data-lang", "price");



  $thead.append($tr);


  $table.classList.add("table");
  $table.classList.add("table-dark");
  $table.append($thead);
  $table.append($tbody);

  $button.click();


}

function addRowMenu(){
  let $tr = createTrEpty();
  $tdDelete = document.createElement('td');
  $tdDelete.innerHTML = `<a class='btn btn-light' href='#' onclick=deleteRow(this.parentNode.parentNode,"menuTableAdding") ><img src='/images/crest.png' style="width: 20px; height: 20px;"></a>`;
  $tr.append($tdDelete);
 return $tr;
}
function createModalTable() {
  document.getElementById("addModalWindow").querySelector(".modal-dialog").classList.remove("modal-xl");

  $titleLabel = document.getElementById("addModalWindowLabel");
  $titleLabel.setAttribute("data-lang", "addingTables");


  addElementwithLabel($bodyofform, "AddTableRu", "russian", "30");
  addElementwithLabel($bodyofform, "AddTableFi", "finnish", "30");
  addElementwithLabel($bodyofform, "AddTableEn", "english", "30");


  const $parent = document.createElement('div');
  $parent.classList.add("form-check");
  $bodyofform.appendChild($parent);

  field = addRadioElementwithLabel($parent, "normalType", "normal");
  field.setAttribute("Checked", true);
  addRadioElementwithLabel($parent, "normalType", "vip");

}

function createModalUsers() {
  document.getElementById("addModalWindow").querySelector(".modal-dialog").classList.remove("modal-xl");

  $titleLabel = document.getElementById("addModalWindowLabel");
  $titleLabel.setAttribute("data-lang", "addingUsers");

  addElementwithLabel($bodyofform, "AddUserName", "user", "20");
  var field = addElementwithLabel($bodyofform, "AddPincode", "pincode", "1");
  field.setAttribute("maxlength", 4);



  const $parent = document.createElement('div');
  $parent.classList.add("form-check");
  $bodyofform.appendChild($parent);

  field = addRadioElementwithLabel($parent, "bossRole", "boss");
  field.setAttribute("Checked", true);
  addRadioElementwithLabel($parent, "adminRole", "administrator");
  addRadioElementwithLabel($parent, "kokkinRole", "kokki");
  addRadioElementwithLabel($parent, "tarjoilijaRole", "tarjoilija");

}

function createElement(tagofElement, elementId, datalang) {
  const $element = document.createElement(tagofElement);
  $element.id = elementId;
  $element.setAttribute("data-lang", datalang);
  return $element;
}

function addRadioElementwithLabel($groupofElements, elementId, datalang) {
  const $parent = document.createElement('div');
  $groupofElements.appendChild($parent);

  const $input = createElement('input', elementId, datalang);
  $input.setAttribute("type", "radio");
  $input.name = "usersRoles";
  $input.value = datalang;

  const $label = createElement('label', elementId, datalang);

  $label.forHTML = elementId;
  $label.setAttribute("class", "col-sm-2 col-form-label");

  $parent.appendChild($input);
  $parent.appendChild($label);
  return $input;
}

function addElementwithLabel($groupofElements, elementId, datalang, size) {
  const $parent = document.createElement('div');
  $groupofElements.appendChild($parent);

  const $input = createElement('input', elementId, datalang);
  $input.setAttribute("size", size);


  const $label = createElement('label', "", datalang);

  $label.forHTML = elementId;
  $label.setAttribute("class", "mx-2 col-sm-3 col-form-label");

  $parent.appendChild($label);
  $parent.appendChild($input);
  return $input;
}

function addButton(buttonName) {
  const $button = document.createElement('div');

  $button.classList.add("addUser");
  $button.innerHTML = htmlButtonAddUser();

  rightPanelAdm.appendChild($button);
  var btnaddModalWindow = document.getElementById("btn-addModalWindow");
  btnaddModalWindow.onclick = function () { createModalPanel(buttonName) };

  var buttonTitle = document.getElementById("buttonTitle");
  buttonTitle.setAttribute("data-lang", buttonName);
  document.querySelector('.btn-lang.btn_active').click();
}


function closemodalDiscard() {

}
function saveTables() {
  const ru = document.getElementById("AddTableRu").value;
  const fi = document.getElementById("AddTableFi").value;
  const en = document.getElementById("AddTableEn").value;
  const type = document.querySelector('input[name="usersRoles"]:checked').value;
  const table = { "name": {"ru":ru,"fi":fi,"en":en}, "type": type };
  tables.push(table);
  localStorage.setItem("nayttoTables", JSON.stringify(tables));

  while (rightPanelAdm.firstChild) {
    rightPanelAdm.removeChild(rightPanelAdm.firstChild);
  }
  createtablePanel();


}
function saveUsers() {
  const name = document.getElementById("AddUserName").value;
  const pin = document.getElementById("AddPincode").value;
  const role = document.querySelector('input[name="usersRoles"]:checked').value;
  const user = { "name": name, "pin": pin, "role": role };
  users.push(user);
  localStorage.setItem("nayttoUsers", JSON.stringify(users));

  while (rightPanelAdm.firstChild) {
    rightPanelAdm.removeChild(rightPanelAdm.firstChild);
  }
  createUserPanel();


}

function saveMenu(valueen){
  while (rightPanelAdm.firstChild) {
    rightPanelAdm.removeChild(rightPanelAdm.firstChild);
  }
  if (valueen.length>0){
    delete menu[valueen];
  }


    menuItem={
      "ru": document.getElementById("AddMenuRu").value,
      "fi": document.getElementById("AddMenuFi").value,
      "en": document.getElementById("AddMenuEn").value,
      "items": []
          }
     document.querySelectorAll("#menuTableAdding >tbody tr").forEach((element, index) => {

      const item={
        "ru": element.cells[0].childNodes[0].value,
        "fi": element.cells[1].childNodes[0].value,
        "en": element.cells[2].childNodes[0].value,
        "price": Number(element.cells[3].childNodes[0].value)
    }
    
    menuItem.items.push(item);
    
  });
  menu[menuItem.en]=menuItem;
  localStorage.setItem("nayttoMenu", JSON.stringify(menu));
  createmenuPanel();
 
}