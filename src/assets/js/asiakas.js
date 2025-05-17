const menuItems = [];
const currentOrder = {
    items: [],
    total: 0
};

let orderHistory = [];
let currentLang = 'fi';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap JavaScriptia ei ole ladattu.');
            showToast('Virhe: Bootstrapia ei ladattu.');
            return;
        }

        if (typeof bootstrap.Modal !== 'undefined' && typeof bootstrap.Modal.VERSION !== 'undefined') {
             try {
                bootstrap.Modal.getOrCreateInstance(document.getElementById('newOrderModal'));
                bootstrap.Modal.getOrCreateInstance(document.getElementById('profileModal'));
             } catch (e) {
                 console.error('Virhe Bootstrap 5+ modaalien alustuksessa:', e);
             }

        } else {
            console.error('Ei tunnistettua Bootstrap Modal versiota manuaaliseen alustukseen.');
        }

        await loadTranslations();
        await loadMenuItems();
        initializeCustomerView();
        setupEventListeners();
        setupLanguageButtons();
        
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            currentLang = savedLang;
            updateLanguage();
        }

        // TILAPÄINEN TESTI: Yritä avata uusi tilaus -modaali heti latauksen jälkeen
        const newOrderModalElement = document.getElementById('newOrderModal');
        if (newOrderModalElement) {
            const modal = new bootstrap.Modal(newOrderModalElement);

            // Varmistetaan, että sisältö on ladattu ennen modaalin näyttämistä
            displayMenuItems(menuItems);
            updateOrderSummary();
        }

    } catch (error) {
        console.error('Virhe sivun lataamisessa:', error);
        showToast('Virhe sivun lataamisessa');
    }
});

async function loadTranslations() {
    try {
        const response = await fetch('../assets/data/lang.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        window.translations = await response.json();
        updateLanguage();
    } catch (error) {
        console.error('Virhe kielitiedoston lataamisessa:', error);
        throw error;
    }
}

function setupLanguageButtons() {
    const langButtons = document.querySelectorAll('.dropdown-item[data-lang]');
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            if (lang) {
                changeLanguage(lang);
            }
        });
    });
}

function changeLanguage(lang) {
    if (!lang) return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateLanguage();
}

async function loadMenuItems() {
    try {
        if (!window.translations?.fi?.menu?.items) {
            throw new Error('Menu data not found in translations');
        }
        menuItems.length = 0;
        menuItems.push(...window.translations.fi.menu.items);
        displayMenuItems(menuItems);
        loadFavoriteItems();
    } catch (error) {
        console.error('Virhe menun lataamisessa:', error);
        showToast('Virhe menun lataamisessa');
    }
}

function displayMenuItems(items) {
    const menuItemsElement = document.getElementById('menuItems');
    if (!menuItemsElement) return;

    menuItemsElement.innerHTML = '';

    items.forEach(item => {
        const template = document.getElementById('menuItemTemplate');
        if (!template) return;
        
        const clone = template.content.cloneNode(true);
        
        const nameElement = clone.querySelector('.menu-item-name');
        const descriptionElement = clone.querySelector('.menu-item-description');
        const priceElement = clone.querySelector('.menu-item-price');
        const addButton = clone.querySelector('.add-to-order');
        
        if (nameElement) nameElement.textContent = item.name;
        if (descriptionElement) descriptionElement.textContent = item.description;
        if (priceElement) priceElement.textContent = `${item.price.toFixed(2)} €`;
        
        if (addButton) {
            addButton.addEventListener('click', () => addToOrder(item.id));
        }
        
        menuItemsElement.appendChild(clone);
    });
}

function initializeCustomerView() {
    const storedOrders = localStorage.getItem('orderHistory');
    if (storedOrders) {
        try {
            orderHistory = JSON.parse(storedOrders);
        } catch (error) {
            console.error('Virhe tilaushistorian lataamisessa:', error);
            orderHistory = [];
        }
    } else {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        orderHistory = [
            {
                id: 'ORD001',
                date: today.toISOString().split('T')[0],
                items: ['Kahvi', 'Korvapuusti'],
                total: 7.40,
                status: 'active'
            },
            {
                id: 'ORD002',
                date: yesterday.toISOString().split('T')[0],
                items: ['Latte', 'Päivän leivos', 'Kahvi'],
                total: 12.80,
                status: 'completed'
            },
            {
                id: 'ORD003',
                date: twoDaysAgo.toISOString().split('T')[0],
                items: ['Cappuccino', 'Korvapuusti', 'Päivän leivos'],
                total: 15.20,
                status: 'completed'
            },
            {
                id: 'ORD004',
                date: twoDaysAgo.toISOString().split('T')[0],
                items: ['Kahvi', 'Päivän leivos'],
                total: 8.90,
                status: 'completed'
            }
        ];
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }

    const storedProfile = localStorage.getItem('customerProfile');
    if (storedProfile) {
        try {
            const profile = JSON.parse(storedProfile);
            const nameInput = document.getElementById('customerName');
            const emailInput = document.getElementById('customerEmail');
            const phoneInput = document.getElementById('customerPhone');
            const addressInput = document.getElementById('customerAddress');

            if (nameInput) nameInput.value = profile.name || '';
            if (emailInput) emailInput.value = profile.email || '';
            if (phoneInput) phoneInput.value = profile.phone || '';
            if (addressInput) addressInput.value = profile.address || '';
        } catch (error) {
            console.error('Virhe profiilin lataamisessa:', error);
        }
    }

    updateStatistics();
    loadOrderHistory();
}

function updateStatistics() {
    const totalOrders = document.getElementById('totalOrders');
    const totalDeliveries = document.getElementById('totalDeliveries');
    const totalSpent = document.getElementById('totalSpent');

    if (totalOrders) totalOrders.textContent = orderHistory.length;
    if (totalDeliveries) {
        totalDeliveries.textContent = orderHistory.filter(order => order.status === 'completed').length;
    }
    if (totalSpent) {
        const total = orderHistory.reduce((sum, order) => sum + (order.total || 0), 0);
        totalSpent.textContent = `${total.toFixed(2)} €`;
    }
}

function loadOrderHistory() {
    const orderHistoryElement = document.getElementById('orderHistory');
    if (!orderHistoryElement) return;
    
    orderHistoryElement.innerHTML = '';

    orderHistory.forEach(order => {
        const template = document.getElementById('orderHistoryTemplate');
        if (!template) return;
        
        const clone = template.content.cloneNode(true);
        
        const idElement = clone.querySelector('.order-history-id');
        const dateElement = clone.querySelector('.order-history-date');
        const totalElement = clone.querySelector('.order-history-total');
        const statusBadge = clone.querySelector('.order-history-status');
        const viewButton = clone.querySelector('.view-order');
        
        if (idElement) idElement.textContent = order.id;
        if (dateElement) dateElement.textContent = order.date;
        if (totalElement) totalElement.textContent = `${order.total.toFixed(2)} €`;
        
        if (statusBadge) {
            statusBadge.classList.add(order.status === 'completed' ? 'bg-success' : 'bg-primary');
            statusBadge.setAttribute('data-lang', order.status === 'completed' ? 'orders.completed' : 'orders.active');
            statusBadge.textContent = order.status === 'completed' ? 'Valmis' : 'Aktiivinen';
        }
        
        if (viewButton) {
            viewButton.addEventListener('click', () => viewOrder(order.id));
        }
        
        orderHistoryElement.appendChild(clone);
    });

    updateLanguage();
}

function loadFavoriteItems() {
    const favoriteItemsElement = document.getElementById('favoriteItems');
    if (!favoriteItemsElement) return;

    favoriteItemsElement.innerHTML = '';

    const favorites = [
        {
            id: 1,
            name: 'Kahvi',
            description: 'Tuorepavutettu kahvi',
            count: 28
        },
        {
            id: 2,
            name: 'Korvapuusti',
            description: 'Tuore uunissa paistettu',
            count: 19
        },
        {
            id: 3,
            name: 'Latte',
            description: 'Espresso ja kuuma maito',
            count: 15
        }
    ];

    favorites.forEach(item => {
        const template = document.getElementById('favoriteItemTemplate');
        if (!template) return;
        
        const clone = template.content.cloneNode(true);
        
        const nameElement = clone.querySelector('.favorite-item-name');
        const descriptionElement = clone.querySelector('.favorite-item-description');
        const countElement = clone.querySelector('[data-lang="favorites.count"]');
        
        if (nameElement) nameElement.textContent = item.name;
        if (descriptionElement) descriptionElement.textContent = item.description;
        if (countElement) countElement.textContent = `${item.count} kpl`;
        
        favoriteItemsElement.appendChild(clone);
    });

    updateLanguage();
}

function addToOrder(itemId) {
    try {
        const item = menuItems.find(i => i.id === parseInt(itemId));
        if (!item) {
            console.error('Tuotetta ei löydy:', itemId);
            return;
        }

        const existingItem = currentOrder.items.find(i => i.id === parseInt(itemId));
        if (existingItem) {
            existingItem.quantity++;
        } else {
            currentOrder.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }

        updateOrderSummary();
    } catch (error) {
        console.error('Virhe tuotteen lisäämisessä:', error);
        showToast('Virhe tuotteen lisäämisessä');
    }
}

function decreaseQuantity(itemId) {
    const item = currentOrder.items.find(i => i.id === parseInt(itemId));
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            currentOrder.items = currentOrder.items.filter(i => i.id !== parseInt(itemId));
        }
        updateOrderSummary();
    }
}

function increaseQuantity(itemId) {
    const item = currentOrder.items.find(i => i.id === parseInt(itemId));
    if (item) {
        item.quantity++;
        updateOrderSummary();
    }
}

function updateOrderSummary() {
    try {
        const orderItemsElement = document.getElementById('orderItems');
        if (!orderItemsElement) {
            console.error('Tilauslistan elementtiä ei löydy');
            return;
        }
        
        orderItemsElement.innerHTML = '';

        currentOrder.total = 0;
        currentOrder.items.forEach(item => {
            try {
                const itemTotal = item.price * item.quantity;
                currentOrder.total += itemTotal;

                const template = document.getElementById('orderItemTemplate');
                if (!template) {
                    console.error('Tilauskohteen mallipohjaa ei löydy');
                    return;
                }
                
                const clone = template.content.cloneNode(true);
                
                const nameElement = clone.querySelector('.order-item-name');
                const priceElement = clone.querySelector('.order-item-price');
                const quantityElement = clone.querySelector('.order-item-quantity');
                const decreaseButton = clone.querySelector('.decrease-quantity');
                const increaseButton = clone.querySelector('.increase-quantity');
                
                if (nameElement) nameElement.textContent = item.name;
                if (priceElement) priceElement.textContent = `${item.price.toFixed(2)} €`;
                if (quantityElement) quantityElement.textContent = item.quantity;
                
                if (decreaseButton) {
                    decreaseButton.addEventListener('click', () => decreaseQuantity(item.id));
                }
                
                if (increaseButton) {
                    increaseButton.addEventListener('click', () => increaseQuantity(item.id));
                }
                
                orderItemsElement.appendChild(clone);
            } catch (error) {
                console.error('Virhe tilauskohteen lisäämisessä:', error);
            }
        });

        const orderTotalElement = document.getElementById('orderTotal');
        if (orderTotalElement) {
            orderTotalElement.textContent = `${currentOrder.total.toFixed(2)} €`;
        }
    } catch (error) {
        console.error('Virhe tilauksen päivityksessä:', error);
        showToast('Virhe tilauksen päivityksessä');
    }
}

function setupEventListeners() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const openNewOrderModalBtn = document.getElementById('openNewOrderModalBtn');
    const openProfileModalBtn = document.getElementById('openProfileModalBtn');

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', placeOrder);
    }
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    if (openNewOrderModalBtn) {
        openNewOrderModalBtn.addEventListener('click', () => {
            // console.log('Yritetään avata modaalia manuaalisesti...');
            const newOrderModalElement = document.getElementById('newOrderModal');

            if (newOrderModalElement) {
                // Väliaikainen manuaalinen tapa näyttää modaali
                newOrderModalElement.style.display = 'block';
                newOrderModalElement.classList.add('show');
                document.body.classList.add('modal-open');

                // Lisätään väliaikaiset sulkemiskuuntelijat testausta varten
                const closeButton = newOrderModalElement.querySelector('.btn-close');
                const cancelButton = newOrderModalElement.querySelector('[data-bs-dismiss="modal"]');

                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        // console.log('Suljetaan modaalia (manuaalisesti)...');
                        newOrderModalElement.style.display = 'none';
                        newOrderModalElement.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }, { once: true });
                }

                 if (cancelButton) {
                    cancelButton.addEventListener('click', () => {
                         // console.log('Suljetaan modaalia (manuaalisesti, peruuta-nappi)...');
                        newOrderModalElement.style.display = 'none';
                        newOrderModalElement.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }, { once: true });
                }


                // Varmistetaan, että sisältö on ladattu ennen modaalin näyttämistä
                displayMenuItems(menuItems);
                updateOrderSummary();
                // console.log('Modaalin sisältö päivitetty.');

            } else {
                console.error('Virhe: Modaali-elementtiä #newOrderModal ei löytynyt.');
            }
        });
    }

    // Uusi kuuntelija asetukset-modaalin avaamiseen
    if (openProfileModalBtn) {
        openProfileModalBtn.addEventListener('click', () => {
            // console.log('Yritetään avata asetukset-modaalia manuaalisesti...');
            const profileModalElement = document.getElementById('profileModal');

            if (profileModalElement) {
                // Väliaikainen manuaalinen tapa näyttää modaali
                profileModalElement.style.display = 'block';
                profileModalElement.classList.add('show');
                document.body.classList.add('modal-open');

                // Lisätään väliaikaiset sulkemiskuuntelijat testausta varten
                const closeButton = profileModalElement.querySelector('.btn-close');
                const cancelButton = profileModalElement.querySelector('[data-bs-dismiss="modal"]');
                const saveButton = profileModalElement.querySelector('#saveProfileBtn');


                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                         // console.log('Suljetaan asetukset-modaalia (manuaalisesti)...');
                        profileModalElement.style.display = 'none';
                        profileModalElement.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }, { once: true });
                }

                 if (cancelButton) {
                    cancelButton.addEventListener('click', () => {
                         // console.log('Suljetaan asetukset-modaalia (manuaalisesti, peruuta-nappi)...');
                        profileModalElement.style.display = 'none';
                        profileModalElement.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }, { once: true });
                }
//erroreita +5
                 if (saveButton) {
                    saveButton.addEventListener('click', () => {
                         saveProfile();
                         profileModalElement.style.display = 'none';
                         profileModalElement.classList.remove('show');
                         document.body.classList.remove('modal-open');
                    });
                }


            } else {
                console.error('Virhe: Modaali-elementtiä #profileModal ei löytynyt.');
            }
        });
    }
}

function placeOrder() {
    try {
        if (!currentOrder.items || currentOrder.items.length === 0) {
            showToast('Lisää tuotteita tilaukseen');
            return;
        }

        const newOrder = {
            id: `ORD${String(orderHistory.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            items: currentOrder.items.map(item => item.name),
            total: currentOrder.total,
            status: 'active'
        };

        orderHistory.unshift(newOrder);
        
        try {
            localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        } catch (error) {
            console.error('Virhe tilaushistorian tallentamisessa:', error);
            showToast('Virhe tilaushistorian tallentamisessa');
            return;
        }
        
        const customerName = document.getElementById('customerName')?.value || 'Asiakas';
        const customerAddress = document.getElementById('customerAddress')?.value || 'Osoite puuttuu';

        const deliveryData = {
            id: newOrder.id,
            customer: customerName,
            address: customerAddress,
            items: currentOrder.items.map(item => `${item.name} (${item.quantity}kpl)`),
            total: currentOrder.total,
            orderTime: new Date().toLocaleString('fi-FI'),
            status: 'active'
        };

        let deliveries = [];
        try {
            deliveries = JSON.parse(localStorage.getItem('deliveries') || '[]');
        } catch (error) {
            console.error('Virhe kuljetusten lataamisessa:', error);
        }
        
        deliveries.unshift(deliveryData);
        
        try {
            localStorage.setItem('deliveries', JSON.stringify(deliveries));
        } catch (error) {
            console.error('Virhe kuljetusten tallentamisessa:', error);
        }

        if (typeof addDelivery === 'function') {
            try {
                addDelivery(deliveryData);
            } catch (error) {
                console.error('Virhe kuljetuksen lisäämisessä:', error);
            }
        }

        currentOrder.items = [];
        currentOrder.total = 0;
        
        updateStatistics();
        loadOrderHistory();
        updateOrderSummary();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('newOrderModal'));
        if (modal) {
            modal.hide();
        }

        showToast('Tilaus tehty onnistuneesti!');
    } catch (error) {
        console.error('Virhe tilauksen tekemisessä:', error);
        showToast('Virhe tilauksen tekemisessä');
    }
}

function saveProfile() {
    const name = document.getElementById('customerName')?.value || '';
    const email = document.getElementById('customerEmail')?.value || '';
    const phone = document.getElementById('customerPhone')?.value || '';
    const address = document.getElementById('customerAddress')?.value || '';

    try {
        localStorage.setItem('customerProfile', JSON.stringify({ name, email, phone, address }));
    } catch (error) {
        console.error('Virhe profiilin tallentamisessa:', error);
        showToast('Virhe profiilin tallentamisessa');
        return;
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
    if (modal) {
        modal.hide();
    }

    showToast('Profiili tallennettu onnistuneesti!');
}

function showToast(message) {
    try {
        const toastElement = document.getElementById('statusToast');
        if (!toastElement) {
            console.error('Toast-elementtiä ei löydy.');
            return;
        }

        if (typeof bootstrap.Toast === 'undefined') {
             console.error('Bootstrapin Toast-komponentti ei ole käytettävissä.');
             return;
        }

        const toast = new bootstrap.Toast(toastElement);
        const toastBody = toastElement.querySelector('.toast-body');
        if (toastBody) {
            toastBody.textContent = message;
        }
        toast.show();
    } catch (error) {
        console.error('Virhe toastin näyttämisessä:', error);
    }
}

function viewOrder(orderId) {
    const order = orderHistory.find(o => o.id === orderId);
    if (!order) return;

    showToast(`Tilauksen ${orderId} tiedot:\n\nTuotteet: ${order.items.join(', ')}\nSumma: ${order.total.toFixed(2)} €`);
}

function updateLanguage() {
    if (!window.translations?.[currentLang]) return;
    
    document.querySelectorAll('[data-lang]').forEach(element => {
        const keys = element.getAttribute('data-lang')?.split('.') || [];
        let value = window.translations[currentLang];
        
        for (const key of keys) {
            if (value?.[key]) {
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