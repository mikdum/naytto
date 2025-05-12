document.addEventListener('DOMContentLoaded', () => {
    setupLanguageButtons();
    translatePage();
    loadOrders();
    setInterval(loadOrders, 5000);
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
    return localStorage.getItem('lang') || 'fi';
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

        document.title = translations['KokkienNakyma'][lang] || 'Kokkien näkymä';
    } catch (e) {
        console.error('Virhe käännösten lataamisessa:', e);
    }
}

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
    const lang = getLang();
    
    if (order.products) {
        productsHtml = order.products.map(p => {
            const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
            const menuItem = menuItems.find(item => item.id == p.menuItemId);
            const itemName = menuItem ? (menuItem[lang] || menuItem.name || menuItem.fi || 'Tuote') : 'Tuote';
            return `${itemName} x ${p.quantity}`;
        }).join('<br>');
    } else {
        const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        const menuItem = menuItems.find(item => item.id == order.menuItemId);
        const itemName = menuItem ? (menuItem[lang] || menuItem.name || menuItem.fi || 'Tuote') : 'Tuote';
        productsHtml = `${itemName} x ${order.quantity}`;
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
