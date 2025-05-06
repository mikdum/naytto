// Get the container element
var btnContainer = document.getElementById("myDIV");

// Get the container element
var rightPanelAdm = document.getElementById("rightPanelAdm");

// Get all buttons with class="btn" inside the container
var btns = btnContainer.getElementsByClassName("list-group-item");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    console.log(this.dataset.lang);
    this.className += " active";
    while (rightPanelAdm.firstChild) {
      console.log(rightPanelAdm.firstChild);
      rightPanelAdm.removeChild(rightPanelAdm.firstChild);
    }

    if (this.dataset.lang === "users") {
      createUserPanel();
    }

  });
}

function createUserPanel() {
  const button = document.createElement('div');
  button.classList.add("addUser");
  button.innerHTML=htmlButtonAddUser();
  rightPanelAdm.appendChild(button);

  var langfile = '../data/users.json';
  fetch(langfile)
    .then(response => response.json())
    .then(langData => {
      createUserTable(langData);

    });

}

function createUserTable(users) {
  const $table = document.createElement('table'),
    $thead = document.createElement('thead'),
    $tbody = document.createElement('tbody');
  let $tr = document.createElement('tr');
  let $tdName = document.createElement('td'),
    $tdRole = document.createElement('td'),
    $tdPin = document.createElement('td');

    var rightPanelAdm = document.getElementById('rightPanelAdm');
    rightPanelAdm.appendChild($table);

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

    $tr = document.createElement('tr');

    $tdName.textContent = element.name;
    $tdRole.textContent = element.role;
    $tdPin.textContent = element.pin;

    $tr.append($tdName);
    $tr.append($tdRole);
    $tr.append($tdPin);



    $tbody.append($tr);


  });

}

createUserPanel();

function htmlButtonAddUser(){
  return `<button type="button" class="btn btn-outline-secondary bg-dark" id="btn-addUser">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-person-plus" viewBox="0 0 16 16">
                        <path
                            d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z">
                        </path>
                        <path fill-rule="evenodd"
                            d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5">
                        </path>
                    </svg>
                    <span class="visually-hidden" data-lang="user">User</span>
                </button>
`
}