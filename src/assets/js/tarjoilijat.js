<<<<<<< HEAD
let orders = [];
let menu = {};
let tables = [];
let currentOrder = null;
let orderModal = null;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 5000);
    initializeOrderModal();
});

function initializeOrderModal() {
    orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
    
    const menuCategories = document.querySelector('.menu-categories');
    Object.entries(menu).forEach(([category, data]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category mb-4';
        categoryDiv.innerHTML = `
            <h4>${data.fi}</h4>
            <div class="menu-items">
                ${data.items.map(item => `
                    <div class="menu-item">
                        <span>${item.fi}</span>
                        <span>${item.price.toFixed(2)} €</span>
                        <button class="btn btn-sm btn-primary add-item" data-item='${JSON.stringify(item)}'>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        menuCategories.appendChild(categoryDiv);
    });

    document.querySelectorAll('.add-item').forEach(button => {
        button.addEventListener('click', () => {
            const item = JSON.parse(button.dataset.item);
            addItemToOrder(item);
        });
    });
}

function addItemToOrder(item) {
    if (!currentOrder) return;

    const existingItem = currentOrder.items.find(i => i.fi === item.fi);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        currentOrder.items.push({
            ...item,
            quantity: 1
        });
    }

    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    const submitButton = document.getElementById('submitOrder');

    if (!currentOrder || currentOrder.items.length === 0) {
        orderItems.innerHTML = '<p>Ei tuotteita valittuna</p>';
        orderTotal.textContent = '0.00';
        submitButton.disabled = true;
        return;
    }

    let total = 0;
    orderItems.innerHTML = currentOrder.items.map(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        return `
            <div class="order-item">
                <span>${item.fi}</span>
                <span>${item.quantity || 1}x</span>
                <span>${itemTotal.toFixed(2)} €</span>
                <button class="btn btn-sm btn-danger remove-item" data-item="${item.fi}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    orderTotal.textContent = total.toFixed(2);
    submitButton.disabled = false;

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const itemName = button.dataset.item;
            removeItemFromOrder(itemName);
        });
    });
}

function removeItemFromOrder(itemName) {
    if (!currentOrder) return;

    currentOrder.items = currentOrder.items.filter(item => item.fi !== itemName);
    updateOrderDisplay();
}

async function createOrder(tableId) {
    const table = tables.find(t => t.name.fi === tableId);
    if (!table) return;

    currentOrder = {
        id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
        time: new Date().toISOString(),
        startTime: new Date().toISOString(),
        table: table.name.fi,
        amount: 0,
        status: 'active',
        items: []
    };

    document.getElementById('currentOrder').innerHTML = `
        <h4>Tilaus pöydälle ${table.name.fi}</h4>
    `;

    orderModal.show();
}

async function submitOrder() {
    if (!currentOrder || currentOrder.items.length === 0) return;

    currentOrder.amount = currentOrder.items.reduce((total, item) => {
        return total + (item.price * (item.quantity || 1));
    }, 0);

    orders.push(currentOrder);
    await saveOrders();
    updateTableStatus();
    
    currentOrder = null;
    document.getElementById('currentOrder').innerHTML = '<p>Valitse pöytä tilauksen tekemistä varten</p>';
    updateOrderDisplay();
    orderModal.hide();
}

async function loadData() {
    try {
        const storedOrders = localStorage.getItem("nayttoOrders");
        if (storedOrders != null) {
            orders = JSON.parse(storedOrders);
        } else {
            const response = await fetch('../data/orders.json');
            orders = await response.json();
            localStorage.setItem("nayttoOrders", JSON.stringify(orders));
        }

        const storedMenu = localStorage.getItem("nayttoMenu");
        if (storedMenu != null) {
            menu = JSON.parse(storedMenu);
        } else {
            const response = await fetch('../data/menu.json');
            menu = await response.json();
            localStorage.setItem("nayttoMenu", JSON.stringify(menu));
        }

        const storedTables = localStorage.getItem("nayttoTables");
        if (storedTables != null) {
            tables = JSON.parse(storedTables);
        } else {
            const response = await fetch('../data/tables.json');
            tables = await response.json();
            localStorage.setItem("nayttoTables", JSON.stringify(tables));
        }

        updateTableStatus();
    } catch (error) {
        console.error('Virhe datan haussa:', error);
    }
}

function updateTableStatus() {
    tables.forEach(table => {
        const tableElement = document.querySelector(`[data-table="${table.name.fi}"]`);
        if (tableElement) {
            const statusElement = tableElement.querySelector('.card-text');
            const orderButton = tableElement.querySelector('.order-btn');
            const reserveButton = tableElement.querySelector('.reserve-btn');
            const releaseButton = tableElement.querySelector('.release-btn');

            const tableOrders = orders.filter(order => order.table === table.name.fi);
            const activeOrder = tableOrders.find(order => order.status === 'active');

            if (activeOrder) {
                statusElement.textContent = 'Varattu';
                orderButton.disabled = false;
                reserveButton.disabled = true;
                releaseButton.disabled = false;
            } else {
                statusElement.textContent = 'Vapaa';
                orderButton.disabled = true;
                reserveButton.disabled = false;
                releaseButton.disabled = true;
            }
        }
    });
}

async function completeOrder(tableId) {
    const order = orders.find(o => o.table === tableId && o.status === 'active');
    if (!order) return;

    order.status = 'completed';
    order.endTime = new Date().toISOString();
    await saveOrders();
    updateTableStatus();
}

async function saveOrders() {
    try {
        localStorage.setItem("nayttoOrders", JSON.stringify(orders));

        const response = await fetch('../data/orders.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orders)
        });

        if (!response.ok) {
            throw new Error('Virhe tilauksen tallennuksessa');
        }
    } catch (error) {
        console.error('Virhe tilauksen tallennuksessa:', error);
    }
}

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('order-btn')) {
        const tableId = event.target.dataset.table;
        createOrder(tableId);
    } else if (event.target.classList.contains('release-btn')) {
        const tableId = event.target.dataset.table;
        completeOrder(tableId);
    } else if (event.target.id === 'submitOrder') {
        submitOrder();
    }
}); 
=======
var menu = {};
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    initializeData();
    loadActiveOrders();
    loadReservedTables();
    updateStats();
    setupLanguageButtons();
    
    loadTables();
    setupModals();
    setupEventListeners();
    
    
});
document.querySelector('.btn-lang.btn_active').click();  

let locallanguage={
    "Varaa": {
        "fi": "Varaa",
        "en": "Reserve",
        "ru": "Забронировать"
    },
    "Vapauta": {
        "fi": "Vapauta",
        "en": "Release",
        "ru": "Освободить"
    },    "TeeTilaus": {
        "fi": "Tee tilaus",
        "en": "Make order",
        "ru": "Сделать заказ"
    },
    "Maara": {
        "fi": "Määrä",
        "en": "Quantity",
        "ru": "Количество"
    },
    "ValitseRuoka": {
        "fi": "Valitse ruoka",
        "en": "Select food",
        "ru": "Выберите блюдо"
    }
}

function initializeData() {
    if (!localStorage.getItem('tableReservations')) {
        localStorage.setItem('tableReservations', JSON.stringify([]));
    }
    if (!localStorage.getItem('activeOrders')) {
        localStorage.setItem('activeOrders', JSON.stringify([]));
    }
    // if (!localStorage.getItem('menuItems')) {
    //     localStorage.setItem('menuItems', JSON.stringify([]));
    // }
}

function setupModals() {
    const orderModalTemplate = document.getElementById('orderModalTemplate');
    const reservationModalTemplate = document.getElementById('reservationModalTemplate');
    
    document.body.appendChild(orderModalTemplate.content.cloneNode(true));
    document.body.appendChild(reservationModalTemplate.content.cloneNode(true));
}

function setupEventListeners() {
    const tableReservationForm = document.getElementById('tableReservationForm');
    if (tableReservationForm) {
        tableReservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const tableId = document.getElementById('tableNumber').value;
            const guestCount = document.getElementById('guestCount').value;
            
            const reservations = JSON.parse(localStorage.getItem('tableReservations')) || [];
            const existingReservation = reservations.find(r => r.tableNumber === tableId.toString());
            
            if (existingReservation) {
                alert('Pöytä on jo varattu!');
                return;
            }
            
            reservations.push({
                tableNumber: tableId.toString(),
                guestCount: parseInt(guestCount),
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('tableReservations', JSON.stringify(reservations));
            $('#reservationModal').modal('hide');
            renderTableGrid();
            updateStats();
            this.reset();
        });
    }

    const newOrderForm = document.getElementById('newOrderForm');
    if (newOrderForm) {
        newOrderForm.addEventListener('submit', handleNewOrder);
    }

    const activeOrders = document.getElementById('activeOrders');
    if (activeOrders) {
        activeOrders.addEventListener('click', (e) => {
            if (e.target.classList.contains('status-btn')) {
                const orderId = parseInt(e.target.dataset.orderId);
                updateOrderStatus(orderId, e.target.dataset.status);
            }
        });
    }

    const addOrderRow = document.getElementById('addOrderRow');
    if (addOrderRow) {
        addOrderRow.addEventListener('click', function() {
            const orderRows = document.getElementById('orderRows');
            if (!orderRows) return;
            
            const template = document.getElementById('orderRowTemplate');


            const row = template.content.cloneNode(true);
            orderRows.appendChild(row);
            fillOrderRowSelects();
            const removeBtn = orderRows.lastElementChild.querySelector('.btn-remove-row');
            if (removeBtn) {
                removeBtn.style.display = '';
          
                removeBtn.addEventListener('click', function() {
                    this.closest('.order-row').remove();
                });
            }
        });
    }

    const orderRows = document.getElementById('orderRows');
    if (orderRows) {
        orderRows.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-remove-row')) {
                e.target.closest('.order-row').remove();
            }
        });
    }

    const tableOrderForm = document.getElementById('tableOrderForm');
    if (tableOrderForm) {
        tableOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const tableId = document.getElementById('tableNumber').value;
            const orderRows = document.querySelectorAll('.order-row');
            const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
            
            const products = [];
            orderRows.forEach(row => {
                const menuItemId = row.querySelector('.modalMenuItems').value;
                const quantity = row.querySelector('.modalOrderQuantity').value;
                
                products.push({[menuItemId]:parseInt(quantity)});
                
            });
            
            if (products.length > 0) {
                orders.push({
                    id: Date.now(),
                    tableNumber: tableId,
                    products,
                    status: 'pending',
                    timestamp: new Date().toISOString()
                });
                
                localStorage.setItem('activeOrders', JSON.stringify(orders));
                $('#orderModal').modal('hide');
                renderTableGrid();
                loadActiveOrders();
                updateStats();
            }
        });
    }
}

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


function handleTableReservation(event) {
    event.preventDefault();
    const tableNumber = document.getElementById('tableNumber').value;
    const guestCount = document.getElementById('guestCount').value;
    
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const existingReservation = reservations.find(r => r.tableNumber === tableNumber);
    
    if (existingReservation) {
        return;
    }
    
    reservations.push({
        tableNumber,
        guestCount,
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('tableReservations', JSON.stringify(reservations));
    loadReservedTables();
    updateStats();
    event.target.reset();
}

function handleNewOrder(event) {
    event.preventDefault();
    const tableNumber = document.getElementById('orderTableNumber').value;
    const menuItemId = document.getElementById('menuItems').value;
    const quantity = document.getElementById('orderQuantity').value;
    
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    // const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    //const selectedItem = menuItems.find(item => item.id === menuItemId);
    
    orders.push({
        id: Date.now(),
        tableNumber,
        menuItemId,
        menuItemName: selectedItem.name,
        quantity,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    
    localStorage.setItem('activeOrders', JSON.stringify(orders));
    loadActiveOrders();
    updateStats();
    event.target.reset();
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('activeOrders', JSON.stringify(orders));
        loadActiveOrders();
        updateStats();
    }
}

function getLang() {
    return localStorage.getItem('lang') || 'fi';
}

const statusTranslations = {
    fi: {
        pending: 'Odottaa',
        completed: 'Valmis',
        cancelled: 'Peruttu'
    },
    en: {
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled'
    },
    ru: {
        pending: 'В ожидании',
        completed: 'Готово',
        cancelled: 'Отменено'
    }
};

function getStatusText(status) {
    const lang = getLang();
    return (statusTranslations[lang] && statusTranslations[lang][status]) || status;
}

function loadActiveOrders() {
    nayttoMenu = localStorage.getItem("nayttoMenu");
    if (nayttoMenu != null) {
        menu = JSON.parse(nayttoMenu);
        
    }
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const container = document.getElementById('activeOrders');
    container.innerHTML = '';
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        let productsHtml = '';
        if (order.products) {
            productsHtml = order.products.map(p =>
                { 
                    console.log(Object.keys(p))
                    const Tuote=getmenuItem(Object.keys(p)[0]);
                    console.log(Tuote)

                  return `${Tuote} x ${p[Object.keys(p)[0]]}`;

            }).join('<br>');
        } else {
            productsHtml = `Error`;
        }
        console.log("productsHtml",productsHtml)
        orderElement.innerHTML = `
            <div class="order-header">
                <span>Pöytä ${order.tableNumber}</span>
                <span>${new Date(order.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="order-details">
                <span>${productsHtml}</span>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${getStatusText(order.status)}</span>
                    <button class="btn btn-sm btn-primary status-btn" data-order-id="${order.id}" data-status="completed">Valmis</button>
                    <button class="btn btn-sm btn-danger status-btn" data-order-id="${order.id}" data-status="cancelled">Peruuta</button>
                </div>
            </div>
        `;
        container.appendChild(orderElement);
    });
}

function loadReservedTables() {
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const container = document.getElementById('reservedTables');
    container.innerHTML = '';
    
    reservations.forEach(reservation => {
        const tableElement = document.createElement('div');
        tableElement.className = 'reserved-table-box table-item';
        tableElement.innerHTML = `
            <div class="table-info">
                <span class="table-number">Pöytä ${reservation.tableNumber}</span>
                <span class="table-guests">${reservation.guestCount} vierasta</span>
                <span class="table-time">${new Date(reservation.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="table-actions">
                <button class="btn btn-sm btn-danger" onclick="removeReservation('${reservation.tableNumber}')">
                    X
                </button>
            </div>
        `;
        container.appendChild(tableElement);
    });
}

function removeReservation(tableNumber) {
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const updatedReservations = reservations.filter(r => r.tableNumber !== tableNumber);
    localStorage.setItem('tableReservations', JSON.stringify(updatedReservations));
    loadReservedTables();
    updateStats();
}

function updateStats() {
    const reservations = JSON.parse(localStorage.getItem('tableReservations'));
    const orders = JSON.parse(localStorage.getItem('activeOrders'));
    const today = new Date().toISOString().split('T')[0];
    
    const totalGuests = reservations.reduce((sum, res) => sum + parseInt(res.guestCount), 0);
    const activeOrdersCount = orders.filter(order => order.status === 'pending').length;
    const todayOrders = orders.filter(order => order.timestamp.startsWith(today)).length;
    
    document.getElementById('totalGuests').textContent = totalGuests;
    document.getElementById('activeOrdersCount').textContent = activeOrdersCount;
    document.getElementById('todayOrders').textContent = todayOrders;
}


let TABLES = [];

function loadTables() {


    nayttoTables = localStorage.getItem("nayttoTables");
    if (nayttoTables != null) {
        TABLES = JSON.parse(nayttoTables);
        renderTableGrid();
        
    }
    else {
        
        
        try {
            
            var langfile = '../data/tables.json';
            fetch(langfile)
            .then(response => response.json())
            .then(langData => {
                TABLES = langData;
            renderTableGrid();
          });

    } catch (e) {
        TABLES = [];
        renderTableGrid();
    }}


}

function renderTableGrid() {
    const grid = document.getElementById('tableGrid');
    grid.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
    const reservations = JSON.parse(localStorage.getItem('tableReservations')) || [];
    const currentLang = getLang();
    TABLES.forEach(table => {
        const hasOrder = orders.some(order => order.tableNumber == table.id && order.status === 'pending');
        const isReserved = reservations.some(res => res.tableNumber == table.id.toString());
        
        const template = document.getElementById('tableContainerTemplate');
        const tableContainer = template.content.cloneNode(true);
        const container = tableContainer.querySelector('.table-container');
        const btn = container.querySelector('.table-btn');
        const buttonContainer = container.querySelector('.table-buttons');
        
        if (table.type === 'vip') {
            btn.classList.add('vip');
        }
        
        if (isReserved) {
            btn.classList.add('reserved');
            btn.disabled = true;
        } else if (hasOrder) {
            btn.classList.add('has-order');
        }
        
        btn.textContent = typeof table.name === 'object' ? table.name[currentLang] : table.name;
        if (!isReserved) {
            const reserveBtn = document.createElement('button');
            reserveBtn.className = 'btn btn-sm btn-info reserve-btn';
            reserveBtn.setAttribute('data-lang', 'Varaa');
            reserveBtn.textContent = locallanguage['Varaa'][currentLang];
            reserveBtn.onclick = () => openReservationModal(table.id);
            buttonContainer.appendChild(reserveBtn);
            
            btn.onclick = () => openOrderModal(table.id);
        } else {
            const orderBtn = document.createElement('button');
            orderBtn.className = 'btn btn-sm btn-success order-btn';
            orderBtn.setAttribute('data-lang', 'TeeTilaus');
            orderBtn.textContent = locallanguage['TeeTilaus'][currentLang];
            orderBtn.onclick = () => openOrderModal(table.id);
            buttonContainer.appendChild(orderBtn);
            
            const releaseBtn = document.createElement('button');
            releaseBtn.className = 'btn btn-sm btn-danger release-btn';
            releaseBtn.setAttribute('data-lang', 'Vapauta');
            releaseBtn.textContent = locallanguage['Vapauta'][currentLang];
            releaseBtn.onclick = () => releaseTable(table.id);
            buttonContainer.appendChild(releaseBtn);
        }
        
        grid.appendChild(container);
    });


}

function releaseTable(tableId) {
    const confirmMessage = getLang() === 'fi' ? 'Haluatko varmasti vapauttaa pöydän?' :
                          getLang() === 'en' ? 'Are you sure you want to release the table?' :
                          'Вы уверены, что хотите освободить стол?';
    if (confirm(confirmMessage)) {
        const reservations = JSON.parse(localStorage.getItem('tableReservations')) || [];
        const updatedReservations = reservations.filter(r => r.tableNumber !== tableId.toString());
        localStorage.setItem('tableReservations', JSON.stringify(updatedReservations));
        
        const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
        const updatedOrders = orders.filter(order => order.tableNumber != tableId);
        localStorage.setItem('activeOrders', JSON.stringify(updatedOrders));
        
        renderTableGrid();
        updateStats();
    }
}

function cancelOrder(tableId) {
    const confirmMessage = getLang() === 'fi' ? 'Haluatko varmasti peruuttaa pöydän tilauksen?' :
                          getLang() === 'en' ? 'Are you sure you want to cancel the table order?' :
                          'Вы уверены, что хотите отменить заказ стола?';
    if (confirm(confirmMessage)) {
        const orders = JSON.parse(localStorage.getItem('activeOrders')) || [];
        const updatedOrders = orders.filter(order => !(order.tableNumber == tableId && order.status === 'pending'));
        localStorage.setItem('activeOrders', JSON.stringify(updatedOrders));
        renderTableGrid();
        updateStats();
    }
}

function fillOrderRowSelects() {

    document.querySelectorAll('.modalMenuItems').forEach(select => {
        if (select.children.length==0){

        for (const [key, value] of Object.entries(menu)) {

            value.items.forEach(element => {
               const option = document.createElement('option');
               option.value = element.en;
               option.textContent = element[currentLang];
               select.appendChild(option);
                 });
       
           }}})



      
    // });
}

function openOrderModal(tableId) {
    document.getElementById('tableNumber').value = tableId;
    const orderRows = document.getElementById('orderRows');
    orderRows.innerHTML = '';
    const template = document.getElementById('orderRowTemplate');
    const row = template.content.cloneNode(true);
    orderRows.appendChild(row);
    fillOrderRowSelects();
    $('#orderModal').modal('show');
}

function openReservationModal(tableId) {
    document.getElementById('tableNumber').value = tableId;
    $('#reservationModal').modal('show');

} 

function clearCache() {
    localStorage.removeItem("nayttoUsers");
    localStorage.removeItem("nayttoMenu");
    localStorage.removeItem("nayttoTables");
    localStorage.removeItem("activeOrders");
    localStorage.removeItem("tableReservations");

   loadTables();


  
  }


  
function getmenuItem(currentTuote){
    let Tuote="Tuote not defined";
    console.log ("menu",menu);
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
  
>>>>>>> e66b0c55ebce19009f0fc004ef28ae9010f76990
