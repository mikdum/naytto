let orders = [];
let stats = {
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderTime: 0
};

let translations = {};

let currentLang = 'fi';

// feikki data, kunnes tilaukset korjataan
const mockOrders = [
    {
        id: 1,
        tableNumber: 5,
        status: 'pending',
        items: [
            { name: 'Kahvi', quantity: 2, price: 3.50 },
            { name: 'Pulla', quantity: 1, price: 2.50 }
        ],
        total: 9.50,
        timestamp: '2024-03-20T10:30:00'
    },
    {
        id: 2,
        tableNumber: 3,
        status: 'pending',
        items: [
            { name: 'Tea', quantity: 1, price: 3.00 },
            { name: 'Korvapuusti', quantity: 2, price: 2.50 }
        ],
        total: 8.00,
        timestamp: '2024-03-20T09:15:00'
    },
    {
        id: 3,
        tableNumber: 7,
        status: 'pending',
        items: [
            { name: 'Latte', quantity: 1, price: 4.50 },
            { name: 'Muffinssi', quantity: 1, price: 3.50 }
        ],
        total: 8.00,
        timestamp: '2024-03-20T11:00:00'
    }
];

const mockTables = [
    { number: 1, status: 'available', orders: 0 },
    { number: 2, status: 'reserved', orders: 1 },
    { number: 3, status: 'reserved', orders: 1 },
    { number: 4, status: 'available', orders: 0 },
    { number: 5, status: 'reserved', orders: 1 },
    { number: 6, status: 'available', orders: 0 },
    { number: 7, status: 'reserved', orders: 1 },
    { number: 8, status: 'available', orders: 0 }
];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadTranslations();
        setupLanguageButtons();
        updateStatistics();
        updateTopProducts();
        updateTableStatus();
    } catch (error) {
        console.error('Virhe sivun alustuksessa:', error);
    }
});

function setupLanguageButtons() {
    try {
        const langButtons = document.querySelectorAll('.dropdown-item[data-lang]');
        if (!langButtons.length) {
            throw new Error('Kielipainikkeita ei löydy');
        }
        
        langButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.getAttribute('data-lang');
                if (!lang) {
                    throw new Error('Kielikoodia ei löydy painikkeesta');
                }
                localStorage.setItem('language', lang);
                currentLang = lang;
                updateLanguage();
            });
        });
    } catch (error) {
        console.error('Virhe kielipainikkeiden asetuksessa:', error);
    }
}

function updateLanguage() {
    try {
        document.querySelectorAll('[data-lang]').forEach(element => {
            const dataLangKey = element.getAttribute('data-lang');
            if (!dataLangKey) return;
            
            const keys = dataLangKey.split('.');
            let value = translations;
            
            for (const key of keys) {
                if (value && value[key]) {
                    value = value[key];
                } else {
                    value = null;
                    break;
                }
            }
            
            if (value && value[currentLang]) {
                element.textContent = value[currentLang];
            }
        });
    } catch (error) {
        console.error('Virhe kielen päivityksessä:', error);
    }
}

async function loadTranslations() {
    try {
        const response = await fetch('../data/lang.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        const savedLang = localStorage.getItem('language') || 'fi';
        currentLang = savedLang;
        updateLanguage();
    } catch (error) {
        console.error('Virhe kielitiedoston lataamisessa:', error);
        translations = {};
    }
}

function updateStatistics() {
    try {
        const totalOrders = mockOrders.length;
        const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;
        const availableTables = mockTables.filter(table => table.status === 'available').length;
        const reservedTables = mockTables.filter(table => table.status === 'reserved').length;

        const elements = {
            totalOrdersCount: document.getElementById('totalOrdersCount'),
            pendingOrdersCount: document.getElementById('pendingOrdersCount'),
            availableTablesCount: document.getElementById('availableTablesCount'),
            reservedTablesCount: document.getElementById('reservedTablesCount')
        };

        for (const [id, element] of Object.entries(elements)) {
            if (!element) {
                throw new Error(`Elementtiä ${id} ei löydy`);
            }
        }

        elements.totalOrdersCount.textContent = totalOrders;
        elements.pendingOrdersCount.textContent = pendingOrders;
        elements.availableTablesCount.textContent = availableTables;
        elements.reservedTablesCount.textContent = reservedTables;
    } catch (error) {
        console.error('Virhe tilastojen päivityksessä:', error);
    }
}

function updateTopProducts() {
    try {
        const productStats = {};
        
        mockOrders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (!productStats[item.name]) {
                        productStats[item.name] = {
                            orders: 0,
                            quantity: 0,
                            revenue: 0
                        };
                    }
                    productStats[item.name].orders++;
                    productStats[item.name].quantity += item.quantity;
                    productStats[item.name].revenue += (item.price || 0) * item.quantity;
                });
            }
        });

        const sortedProducts = Object.entries(productStats)
            .sort(([, a], [, b]) => b.quantity - a.quantity);

        const tbody = document.getElementById('topProductsTableBody');
        if (!tbody) {
            throw new Error('topProductsTableBody elementtiä ei löydy');
        }

        const rows = sortedProducts.map(([name, stats]) => `
            <tr>
                <td>${name}</td>
                <td>${stats.orders}</td>
                <td>${stats.quantity}</td>
                <td>${stats.revenue.toFixed(2)} €</td>
            </tr>
        `).join('');

        tbody.innerHTML = rows;
    } catch (error) {
        console.error('Virhe tuotetilastojen päivityksessä:', error);
    }
}

function updateTableStatus() {
    try {
        const tableList = document.getElementById('tableStatusList');
        if (!tableList) {
            throw new Error('tableStatusList elementtiä ei löydy');
        }

        const template = document.getElementById('tableStatusItemTemplate');
        if (!template) {
            throw new Error('tableStatusItemTemplate elementtiä ei löydy');
        }

        tableList.innerHTML = '';

        mockTables.forEach(table => {
            try {
                const clone = template.content.cloneNode(true);
                const listItem = clone.querySelector('.list-group-item');
                
                if (!listItem) {
                    throw new Error('list-group-item elementtiä ei löydy templatesta');
                }

                listItem.classList.add('d-flex', 'justify-content-between', 'align-items-center');
                
                const tableNumber = clone.querySelector('.table-number');
                const tableStatus = clone.querySelector('.table-status');
                const tableOrders = clone.querySelector('.table-orders');

                if (!tableNumber || !tableStatus || !tableOrders) {
                    throw new Error('Vaadittuja elementtejä ei löydy templatesta');
                }

                tableNumber.textContent = `${translations.ordersDashboard?.tableStatus?.table?.[currentLang] || 'Pöytä'} ${table.number}`;
                tableStatus.textContent = table.status === 'available' 
                    ? (translations.ordersDashboard?.tableStatus?.available?.[currentLang] || 'Vapaa')
                    : (translations.ordersDashboard?.tableStatus?.reserved?.[currentLang] || 'Varattu');
                tableOrders.textContent = table.orders !== undefined ? table.orders : '0';

                if (table.status === 'reserved') {
                    listItem.classList.add('list-group-item-warning');
                }

                tableList.appendChild(clone);
            } catch (error) {
                console.error(`Virhe pöydän ${table.number} päivityksessä:`, error);
            }
        });
    } catch (error) {
        console.error('Virhe pöytien tilan päivityksessä:', error);
    }
}
