var menu = {};

document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    loadOrders();
    setInterval(loadOrders, 5000);
});

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const pendingOrders = document.getElementById('pendingOrders');
    const completedOrders = document.getElementById('completedOrders');
    
    pendingOrders.innerHTML = '';
    completedOrders.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = createOrderElement(order);
        if (order.status === 'pending') {
            pendingOrders.appendChild(orderElement);
        } else if (order.status === 'completed') {
            completedOrders.appendChild(orderElement);
        }
    });
}

function createOrderElement(order) {
    const template = document.getElementById('orderItemTemplate');
    const div = template.content.cloneNode(true);
    
    let productsHtml = '';
    // const lang = getLang();
    
    if (order.products) {
        productsHtml = order.products.map(p => {
            const Tuote=getmenuItem(Object.keys(p)[0]);
              return `${Tuote} x ${p[Object.keys(p)[0]]}`;
        }).join('<br>');
    } else {
         productsHtml = `Tuote x ${order.quantity}`;
    }
    
    const orderDiv = div.querySelector('.order-item');
    const tableNumber = orderDiv.querySelector('h6');
    const products = orderDiv.querySelector('p');
    const timestamp = orderDiv.querySelector('small');
    const button = orderDiv.querySelector('button');
    
    tableNumber.textContent = `${tableNumber.textContent} ${order.tableNumber}`;
    products.innerHTML = productsHtml;
    timestamp.textContent = new Date(order.timestamp).toLocaleTimeString();
    
    if (order.status === 'pending') {
        button.onclick = () => markAsCompleted(order.id);
    } else {
        button.remove();
        const badge = document.createElement('span');
        badge.className = 'badge badge-success';
        badge.setAttribute('data-lang', 'Valmis');
        badge.textContent = 'Valmis';
        orderDiv.querySelector('.d-flex').appendChild(badge);
    }
    
    return orderDiv;
}

function markAsCompleted(orderId) {
    const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem('activeOrders', JSON.stringify(orders));
        loadOrders();
    }
}
function clearCache() {
    localStorage.removeItem("nayttoUsers");
    localStorage.removeItem("nayttoMenu");
    localStorage.removeItem("nayttoTables");
    localStorage.removeItem("activeOrders");
    localStorage.removeItem("tableReservations");

    loadOrders();


  
  }

  function loadMenuItems() {

    nayttoMenu = localStorage.getItem("nayttoMenu");
    if (nayttoMenu != null) {
        menu = JSON.parse(nayttoMenu);
        
    }
    else {
        var langfile = '../data/menu.json';
        fetch(langfile)
        .then(response => response.json())
        .then(langData => {
            menu = langData;
        });
  
    }
}


function getmenuItem(currentTuote){
  let Tuote="Tuote not defined";
     for (const [key, value] of Object.entries(menu)) {
     value.items.forEach(element => {

        if (element.en===currentTuote){
            Tuote =element[currentLang];
            return ;

        }

          });

    }
    return Tuote;

  
}
