let currentLang = 'fi';
let translations = {};
let deliveries = [];

const isCompleted = (status) => status === 'completed';
const getStatusClass = (status) => isCompleted(status) ? 'bg-success' : 'bg-primary';
const getStatusText = (status) => isCompleted(status) ? 'Valmis' : 'Aktiivinen';
const getStatusLang = (status) => isCompleted(status) ? 'delivery.completed' : 'delivery.active';

const storage = {
    get: (key) => {
        try {
            if (!window.localStorage) return null;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Virhe localStorage lukemisessa:', error);
            return null;
        }
    },
    set: (key, value) => {
        try {
            if (!window.localStorage) return false;
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Virhe localStorage kirjoittamisessa:', error);
            return false;
        }
    }
};

async function loadTranslations() {
    try {
        const response = await fetch('../assets/data/lang.json');
        if (!response.ok) throw new Error('Kielitiedoston lataus epäonnistui');
        translations = await response.json();
        updateLanguage();
    } catch (error) {
        console.error('Virhe kielitiedoston lataamisessa:', error);
        showToast('Virhe kielitiedoston lataamisessa');
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    storage.set('language', lang);
    updateLanguage();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('deliveriesList')) {
        loadDeliveriesFromStorage();
        if (!deliveries || deliveries.length === 0) {
            deliveries = initialDeliveries;
            saveDeliveriesToStorage();
        }
        initializeDeliverySystem();
        setupEventListeners();
    }
    loadTranslations();
    const savedLang = storage.get('language');
    if (savedLang) {
        currentLang = savedLang;
        updateLanguage();
    }
});

function loadDeliveriesFromStorage() {
    const storedDeliveries = storage.get('deliveries');
    if (storedDeliveries) {
        deliveries = storedDeliveries;
    }
}

function saveDeliveriesToStorage() {
    storage.set('deliveries', deliveries);
}

// feikki data, muutan jos ryhmä korjaa oman sivun bugit ajoissa
const initialDeliveries = [
    {
        id: 'DEL001',
        orderId: 'ORD001',
        customer: 'Matti Meikäläinen',
        address: 'Mannerheimintie 1, Helsinki',
        items: ['Pizza Margherita', 'Coca-Cola'],
        total: 15.80,
        orderTime: '2024-02-20 18:30',
        status: 'active',
        driver: 'Kuljettaja 1'
    },
    {
        id: 'DEL002',
        orderId: 'ORD002',
        customer: 'Maija Meikäläinen',
        address: 'Aleksanterinkatu 2, Helsinki',
        items: ['Burger Classic', 'Fries', 'Sprite'],
        total: 15.70,
        orderTime: '2024-02-20 19:15',
        status: 'completed',
        driver: 'Kuljettaja 2'
    }
];

function initializeDeliverySystem() {
    updateStatistics();
    loadDeliveries();
}

function updateStatistics() {
    const activeDeliveriesElement = document.getElementById('activeDeliveries');
    const completedDeliveriesElement = document.getElementById('completedDeliveries');
    const deliveryRevenueElement = document.getElementById('deliveryRevenue');

    if (!activeDeliveriesElement || !completedDeliveriesElement || 
        !deliveryRevenueElement) {
        return;
    }

    const activeDeliveries = deliveries.filter(d => d.status === 'active').length;
    const completedDeliveries = deliveries.filter(d => d.status === 'completed').length;
    const totalRevenue = deliveries
        .filter(d => d.status === 'completed')
        .reduce((sum, d) => sum + d.total, 0);

    activeDeliveriesElement.textContent = activeDeliveries;
    completedDeliveriesElement.textContent = completedDeliveries;
    deliveryRevenueElement.textContent = `${totalRevenue.toFixed(2)} €`;
}

function parseFinnishDateTime(dateTimeStr) {
    //ISO muotoilu
    const [datePart, timePart] = dateTimeStr.split(' klo ');
    const [day, month, year] = datePart.split('.');
    const [hours, minutes, seconds] = timePart.split('.');
    
    return new Date(year, month - 1, day, hours, minutes, seconds);
}

function loadDeliveries() {
    const deliveriesElement = document.getElementById('deliveriesList');
    if (!deliveriesElement) return;

    deliveriesElement.innerHTML = '';

    deliveries.forEach(delivery => {
        const template = document.getElementById('deliveryRowTemplate');
        if (!template) return;
        const clone = template.content.cloneNode(true);
        clone.querySelector('.delivery-id').textContent = delivery.id;
        clone.querySelector('.delivery-customer').textContent = delivery.customer;
        clone.querySelector('.delivery-address').textContent = delivery.address;
        clone.querySelector('.delivery-time').textContent = delivery.orderTime;
        const statusBadge = clone.querySelector('.delivery-status');
        statusBadge.classList.add(getStatusClass(delivery.status));
        statusBadge.setAttribute('data-lang', getStatusLang(delivery.status));
        statusBadge.textContent = getStatusText(delivery.status);
        const viewButton = clone.querySelector('.view-delivery');
        viewButton.addEventListener('click', () => viewDelivery(delivery.id));
        deliveriesElement.appendChild(clone);
    });
    updateLanguage();
}

function setupEventListeners() {
    const filterButtons = document.querySelectorAll('.filterButtons__button');
    if (!filterButtons.length) return;
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active', 'filterButtons__button--active'));
            e.target.classList.add('active', 'filterButtons__button--active');
            filterDeliveries(e.target.dataset.filter);
        });
    });
}

function filterDeliveries(status) {
    const rows = document.querySelectorAll('#deliveriesList tr');
    if (!rows.length) return;
    rows.forEach(row => {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const statusElement = row.querySelector('.badge');
            const deliveryStatus = statusElement.getAttribute('data-lang') === 'delivery.completed' ? 'completed' : 'active';
            row.style.display = deliveryStatus === status ? '' : 'none';
        }
    });
}

function viewDelivery(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
        showToast('Kuljetusta ei löytynyt');
        return;
    }
    const detailsElement = document.getElementById('deliveryDetails');
    const template = document.getElementById('deliveryDetailsTemplate');
    if (!detailsElement || !template) return;
    const clone = template.content.cloneNode(true);
    clone.querySelector('.delivery-details-id').textContent = delivery.id;
    clone.querySelector('.delivery-details-customer').textContent = delivery.customer;
    clone.querySelector('.delivery-details-address').textContent = delivery.address;
    clone.querySelector('.delivery-details-time').textContent = delivery.orderTime;
    const statusBadge = clone.querySelector('.delivery-details-status');
    statusBadge.classList.add(getStatusClass(delivery.status));
    statusBadge.setAttribute('data-lang', getStatusLang(delivery.status));
    statusBadge.textContent = getStatusText(delivery.status);
    const itemsList = clone.querySelector('.delivery__details-list');
    if (itemsList) {
        delivery.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            itemsList.appendChild(li);
        });
    }
    const totalElement = clone.querySelector('.delivery-details-total');
    if (totalElement) {
        totalElement.textContent = `${delivery.total.toFixed(2)} €`;
    }
    detailsElement.innerHTML = '';
    detailsElement.appendChild(clone);
    updateLanguage();
    const completeBtn = document.getElementById('completeDeliveryBtn');
    if (completeBtn) {
        completeBtn.style.display = isCompleted(delivery.status) ? 'none' : 'block';
        completeBtn.onclick = () => {
            updateDeliveryStatus(delivery.id);
            const modal = bootstrap.Modal.getInstance(document.getElementById('deliveryModal'));
            if (modal) modal.hide();
        };
    }
    const modal = new bootstrap.Modal(document.getElementById('deliveryModal'));
    modal.show();
}

function updateDeliveryStatus(deliveryId) {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    delivery.status = 'completed';
    saveDeliveriesToStorage();
    updateStatistics();
    loadDeliveries();
    showToast('Kuljetuksen tila päivitetty onnistuneesti!');
}

function showToast(message) {
    const toastElement = document.getElementById('statusToast');
    if (!toastElement) return;

    const toast = new bootstrap.Toast(toastElement);
    const toastBody = toastElement.querySelector('.toast-body');
    if (toastBody) {
        toastBody.textContent = message;
    }
    toast.show();
}

function addDelivery(orderData) {
    console.log('Lisätään kuljetus:', orderData);

    const newDelivery = {
        id: `DEL${String(deliveries.length + 1).padStart(3, '0')}`,
        orderId: orderData.id,
        customer: orderData.customer,
        address: orderData.address,
        items: orderData.items,
        total: orderData.total,
        orderTime: orderData.orderTime || new Date().toLocaleString('fi-FI'),
        status: 'active',
        driver: 'Kuljettaja 1'
    };

    deliveries.unshift(newDelivery);
    saveDeliveriesToStorage();
    console.log('Kuljetukset päivityksen jälkeen:', deliveries);
    
    if (document.getElementById('deliveriesList')) {
        updateStatistics();
        loadDeliveries();
        showToast('Uusi kuljetus lisätty!');
    }
}

function updateLanguage() {
    if (!translations || !translations[currentLang]) return;
    
    document.querySelectorAll('[data-lang]').forEach(element => {
        const keys = element.getAttribute('data-lang').split('.');
        let value = translations[currentLang];
        
        for (const key of keys) {
            if (value && value[key]) {
                value = value[key];
            } else {
                value = null;
                break;
            }
        }
        
        if (value) {
            element.textContent = value;
        }
    });
}

window.addDelivery = addDelivery;
window.viewDelivery = viewDelivery;
window.updateDeliveryStatus = updateDeliveryStatus;
window.changeLanguage = changeLanguage; 