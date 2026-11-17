
// =====================================
// FOOD LOVER - RESTAURANT POS
// ADMIN + BILLING DEMO
// =====================================


// 1. DATABASE (LOCAL STORAGE)

let foodItems = JSON.parse(localStorage.getItem("fl_foods")) || [];
let carts = JSON.parse(localStorage.getItem("fl_carts")) || {};
let orderHistory = JSON.parse(localStorage.getItem("fl_history")) || [];

let orderType = "dinein";
let selectedTable = 1;
let activeCategory = "All";
let searchText = "";
let editingId = null;
let adminLoggedIn = false;

const tables = [
    { id: 1, waiter: "Ali" },
    { id: 2, waiter: "Ahmed" },
    { id: 3, waiter: "Usman" },
    { id: 4, waiter: "Bilal" },
    { id: 5, waiter: "Hamza" },
    { id: 6, waiter: "Zain" },
    { id: 7, waiter: "Hassan" }
];


// 2. HELPER FUNCTIONS

function saveData() {
    localStorage.setItem("fl_foods", JSON.stringify(foodItems));
    localStorage.setItem("fl_carts", JSON.stringify(carts));
    localStorage.setItem("fl_history", JSON.stringify(orderHistory));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function money(value) {
    return "Rs. " + Number(value).toLocaleString("en-PK");
}

function getCurrentCart() {
    return carts[getOrderKey()] || [];
}

function getOrderKey() {
    if (orderType === "dinein") {
        return "dinein-" + selectedTable;
    }

    return orderType + "-current";
}


// 3. PAGE NAVIGATION

const navLinks = document.querySelectorAll(".side-link");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        const page = link.dataset.page;

        if (page === "admin" && !adminLoggedIn) {
            openModal("loginModal");
            return;
        }

        showPage(page);

    });

});

function showPage(page) {

    if (page === "admin" && !adminLoggedIn) {
        openModal("loginModal");
        return;
    }

    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page + "Page").classList.remove("hidden");

    navLinks.forEach(link => {
        link.classList.toggle("active", link.dataset.page === page);
    });

    if (page === "admin") renderAdmin();
    if (page === "orders") renderOrders();

}


// 4. MODAL FUNCTIONS

function openModal(id) {
    document.getElementById(id).classList.add("show");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("show");
}

document.querySelectorAll(".modal-close").forEach(button => {

    button.addEventListener("click", () => {
        closeModal(button.dataset.close);
    });

});

document.querySelectorAll(".modal").forEach(modal => {

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.remove("show");
        }
    });

});


// 5. ADMIN LOGIN

document.getElementById("loginForm").addEventListener("submit", event => {

    event.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    const error = document.getElementById("loginError");

    if (email === "admin@foodlover.com" && password === "123456") {

        adminLoggedIn = true;

        error.textContent = "";

        closeModal("loginModal");

        event.target.reset();

        showPage("admin");

    } else {

        error.textContent = "Incorrect email or password!";

    }

});


// 6. ADMIN LOGOUT

document.getElementById("logoutBtn").addEventListener("click", () => {

    adminLoggedIn = false;

    showPage("pos");

    alert("Admin logged out successfully.");

});


// 7. ADD NEW FOOD ITEM

document.getElementById("openAddItem").addEventListener("click", () => {

    editingId = null;

    document.getElementById("itemForm").reset();

    document.getElementById("itemModalTitle").textContent = "Add Food Item";

    document.getElementById("foodAvailable").checked = true;

    document.getElementById("imagePreview").style.display = "none";

    openModal("itemModal");

});


// 8. IMAGE PREVIEW

document.getElementById("foodImage").addEventListener("input", function() {

    const image = document.getElementById("imagePreview");

    if (!this.value.trim()) {
        image.style.display = "none";
        return;
    }

    image.src = this.value;
    image.style.display = "block";

});


// 9. SAVE FOOD ITEM

document.getElementById("itemForm").addEventListener("submit", event => {

    event.preventDefault();

    const name = document.getElementById("foodName").value.trim();
    const category = document.getElementById("foodCategory").value.trim();
    const price = Number(document.getElementById("foodPrice").value);
    const image = document.getElementById("foodImage").value.trim();
    const available = document.getElementById("foodAvailable").checked;

    if (!name || !category || !image || price <= 0) {
        alert("Please enter valid food details.");
        return;
    }

    let validImageURL;

    try {
        validImageURL = new URL(image);
        if (!["http:", "https:"].includes(validImageURL.protocol)) {
            throw new Error("Invalid URL");
        }
    } catch {
        alert("Please enter a valid image URL.");
        return;
    }

    if (editingId !== null) {

        const item = foodItems.find(food => food.id === editingId);

        if (item) {
            item.name = name;
            item.category = category;
            item.price = price;
            item.image = image;
            item.available = available;
        }

    } else {

        foodItems.push({
            id: Date.now(),
            name,
            category,
            price,
            image,
            available
        });

    }

    saveData();

    closeModal("itemModal");

    event.target.reset();

    document.getElementById("imagePreview").style.display = "none";

    renderAdmin();
    renderAll();

    alert("Food item saved successfully!");

});


// 10. RENDER ADMIN PANEL

function renderAdmin() {

    const list = document.getElementById("adminItemsList");

    list.innerHTML = "";

    document.getElementById("totalItems").textContent = foodItems.length;

    document.getElementById("availableItems").textContent =
        foodItems.filter(item => item.available).length;

    document.getElementById("totalCategories").textContent =
        new Set(foodItems.map(item => item.category.toLowerCase())).size;

    if (foodItems.length === 0) {

        list.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:35px;">
                    No food items added yet.
                    <br><br>
                    Click "+ Add New Item" to create your menu.
                </td>
            </tr>
        `;

        return;
    }

    foodItems.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="item-cell">
                    <img src="${escapeHTML(item.image)}"
                         onerror="this.style.display='none'"
                         alt="">
                    <strong>${escapeHTML(item.name)}</strong>
                </div>
            </td>

            <td>${escapeHTML(item.category)}</td>

            <td>${money(item.price)}</td>

            <td>
                ${item.available ? "Available" : "Unavailable"}
            </td>

            <td>
                <button class="action-btn edit-btn">Edit</button>
                <button class="action-btn delete-btn">Delete</button>
                <button class="action-btn ${item.available ? "unavailable-btn" : "toggle-btn"}">
                    ${item.available ? "Disable" : "Enable"}
                </button>
            </td>
        `;

        row.querySelector(".edit-btn").addEventListener("click", () => {
            editFood(item.id);
        });

        row.querySelector(".delete-btn").addEventListener("click", () => {
            deleteFood(item.id);
        });

        row.querySelector(".action-btn:last-child").addEventListener("click", () => {
            toggleFood(item.id);
        });

        list.appendChild(row);

    });

}


// 11. EDIT FOOD

function editFood(id) {

    const item = foodItems.find(food => food.id === id);

    if (!item) return;

    editingId = id;

    document.getElementById("foodName").value = item.name;
    document.getElementById("foodCategory").value = item.category;
    document.getElementById("foodPrice").value = item.price;
    document.getElementById("foodImage").value = item.image;
    document.getElementById("foodAvailable").checked = item.available;

    const preview = document.getElementById("imagePreview");

    preview.src = item.image;
    preview.style.display = "block";

    document.getElementById("itemModalTitle").textContent = "Edit Food Item";

    openModal("itemModal");

}


// 12. DELETE FOOD

function deleteFood(id) {

    const confirmDelete = confirm("Are you sure you want to delete this item?");

    if (!confirmDelete) return;

    foodItems = foodItems.filter(food => food.id !== id);

    saveData();

    renderAdmin();
    renderAll();

}


// 13. ENABLE / DISABLE FOOD

function toggleFood(id) {

    const item = foodItems.find(food => food.id === id);

    if (!item) return;

    item.available = !item.available;

    saveData();

    renderAdmin();
    renderAll();

}


// 14. TABLE MANAGEMENT

function renderTables() {

    const grid = document.getElementById("tablesGrid");

    grid.innerHTML = "";

    tables.forEach(table => {

        const cart = carts["dinein-" + table.id] || [];

        const occupied = cart.length > 0;

        const card = document.createElement("div");

        card.className =
            "table-card " +
            (occupied ? "occupied" : "available") +
            (orderType === "dinein" && selectedTable === table.id ? " selected" : "");

        card.innerHTML = `
            <div class="table-icon">🪑</div>
            <h3>Table ${String(table.id).padStart(2, "0")}</h3>
            <p>Waiter: ${table.waiter}</p>
            <div class="table-state">
                ${occupied ? "● Occupied" : "● Available"}
            </div>
        `;

        card.addEventListener("click", () => {

            orderType = "dinein";
            selectedTable = table.id;

            updateOrderTypes();
            renderAll();

        });

        grid.appendChild(card);

    });

}


// 15. ORDER TYPE

document.querySelectorAll(".type-btn").forEach(button => {

    button.addEventListener("click", () => {

        orderType = button.dataset.type;

        updateOrderTypes();
        renderAll();

    });

});

function updateOrderTypes() {

    document.querySelectorAll(".type-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.type === orderType
        );

    });

}


// 16. FOOD CATEGORIES

function renderCategories() {

    const box = document.getElementById("categories");

    box.innerHTML = "";

    const categories = [
        "All",
        ...new Set(foodItems.map(item => item.category))
    ];

    if (!categories.includes(activeCategory)) {
        activeCategory = "All";
    }

    categories.forEach(category => {

        const button = document.createElement("button");

        button.className =
            "category-btn " +
            (activeCategory === category ? "active" : "");

        button.textContent = category;

        button.addEventListener("click", () => {

            activeCategory = category;

            renderCategories();
            renderFood();

        });

        box.appendChild(button);

    });

}


// 17. SHOW FOOD IN BILLING POS

function renderFood() {

    const grid = document.getElementById("foodGrid");

    grid.innerHTML = "";

    const filteredFoods = foodItems.filter(item => {

        const categoryMatch =
            activeCategory === "All" || item.category === activeCategory;

        const searchMatch =
            item.name.toLowerCase().includes(searchText);

        return categoryMatch && searchMatch && item.available;

    });

    if (filteredFoods.length === 0) {

        grid.innerHTML = `
            <div class="no-food">
                <h3>No Food Items Available</h3>
                <p>Admin can add food items from the Admin Panel.</p>
            </div>
        `;

        return;
    }

    filteredFoods.forEach(item => {

        const card = document.createElement("div");

        card.className = "food-card";

        card.innerHTML = `
            <img src="${escapeHTML(item.image)}"
                 alt="${escapeHTML(item.name)}"
                 onerror="this.style.display='none'">

            <div class="food-info">
                <h3>${escapeHTML(item.name)}</h3>
                <p>${money(item.price)}</p>
                <span class="add-label">+ Add to Order</span>
            </div>
        `;

        card.addEventListener("click", () => addToCart(item.id));

        grid.appendChild(card);

    });

}


// 18. FOOD SEARCH

document.getElementById("searchInput").addEventListener("input", event => {

    searchText = event.target.value.toLowerCase().trim();

    renderFood();

});


// 19. ADD TO CART

function addToCart(id) {

    const food = foodItems.find(item => item.id === id);

    if (!food || !food.available) return;

    const key = getOrderKey();

    if (!carts[key]) carts[key] = [];

    const existing = carts[key].find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        carts[key].push({
            id: food.id,
            name: food.name,
            price: food.price,
            quantity: 1
        });
    }

    saveData();
    renderAll();

}


// 20. QUANTITY AND REMOVE

function changeQuantity(id, amount) {

    const cart = getCurrentCart();

    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeItem(id);
        return;
    }

    saveData();
    renderAll();

}

function removeItem(id) {

    carts[getOrderKey()] = getCurrentCart().filter(item => item.id !== id);

    saveData();
    renderAll();

}


// 21. RENDER CART

function renderCart() {

    const box = document.getElementById("cartItems");

    const cart = getCurrentCart();

    box.innerHTML = "";

    let quantity = 0;

    if (cart.length === 0) {

        box.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <h3>No Items Yet</h3>
                <p>Select food from the menu</p>
            </div>
        `;

    }

    cart.forEach(item => {

        quantity += item.quantity;

        const row = document.createElement("div");

        row.className = "cart-item";

        row.innerHTML = `
            <div class="cart-item-info">
                <h4>${escapeHTML(item.name)}</h4>
                <p>${money(item.price)}</p>
            </div>

            <div class="quantity-controls">
                <button class="minus">−</button>
                <span>${item.quantity}</span>
                <button class="plus">+</button>
            </div>

            <button class="remove-item">✕</button>
        `;

        row.querySelector(".minus").addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        row.querySelector(".plus").addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        row.querySelector(".remove-item").addEventListener("click", () => {
            removeItem(item.id);
        });

        box.appendChild(row);

    });

    document.getElementById("itemCount").textContent =
        quantity + (quantity === 1 ? " Item" : " Items");

}


// 22. BILL TOTAL

function renderTotal() {

    const cart = getCurrentCart();

    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    const delivery = orderType === "delivery" && subtotal > 0 ? 150 : 0;

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("deliveryCharge").textContent = money(delivery);
    document.getElementById("grandTotal").textContent = money(subtotal + delivery);

}


// 23. CUSTOMER AND WAITER DETAILS

function renderOrderDetails() {

    const label = document.getElementById("orderLabel");
    const waiterArea = document.getElementById("waiterArea");
    const customerFields = document.getElementById("customerFields");
    const address = document.getElementById("customerAddress");

    if (orderType === "dinein") {

        label.textContent =
            "Table " + String(selectedTable).padStart(2, "0");

        waiterArea.style.display = "block";
        customerFields.classList.remove("show");

        document.getElementById("waiterSelect").value =
            tables.find(table => table.id === selectedTable).waiter;

        address.style.display = "none";

    } else if (orderType === "takeaway") {

        label.textContent = "Takeaway Order";

        waiterArea.style.display = "none";
        customerFields.classList.add("show");

        address.style.display = "none";

    } else {

        label.textContent = "Delivery Order";

        waiterArea.style.display = "none";
        customerFields.classList.add("show");

        address.style.display = "block";

    }

}


// 24. CLEAR ORDER

document.getElementById("clearOrder").addEventListener("click", () => {

    if (!confirm("Clear this current order?")) return;

    carts[getOrderKey()] = [];

    saveData();
    renderAll();

});


// 25. PRINT BILL

document.getElementById("printBill").addEventListener("click", () => {

    const cart = getCurrentCart();

    if (cart.length === 0) {
        alert("Please add food items first.");
        return;
    }

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if (orderType !== "dinein" && !name) {
        alert("Please enter customer name.");
        return;
    }

    if (orderType === "delivery" && !address) {
        alert("Please enter delivery address.");
        return;
    }

    const waiter = orderType === "dinein"
        ? tables.find(table => table.id === selectedTable).waiter
        : "N/A";

    let subtotal = 0;
    let itemHTML = "";

    cart.forEach(item => {

        const total = item.price * item.quantity;

        subtotal += total;

        itemHTML += `
            <div class="receipt-item">
                <div>${escapeHTML(item.name)}</div>
                <div class="receipt-row">
                    <span>${item.quantity} x ${item.price}</span>
                    <span>${money(total)}</span>
                </div>
            </div>
        `;

    });

    const delivery = orderType === "delivery" ? 150 : 0;
    const total = subtotal + delivery;

    const orderNumber = "FL-" + Date.now().toString().slice(-7);
    const date = new Date().toLocaleString("en-PK");

    const receipt = document.getElementById("receipt");

    receipt.innerHTML = `
        <h2>FOOD LOVER</h2>
        <p>Restaurant Billing Receipt</p>
        <p>Thank You For Visiting!</p>

        <div class="receipt-line"></div>

        <div>Order: ${orderNumber}</div>
        <div>Date: ${date}</div>
        <div>Type: ${orderType.toUpperCase()}</div>

        ${orderType === "dinein"
            ? `<div>Table: ${selectedTable}</div><div>Waiter: ${waiter}</div>`
            : `<div>Customer: ${escapeHTML(name)}</div><div>Phone: ${escapeHTML(phone || "N/A")}</div>`
        }

        ${orderType === "delivery" ? `<div>Address: ${escapeHTML(address)}</div>` : ""}

        <div class="receipt-line"></div>
        <strong>ORDER DETAILS</strong>
        <div class="receipt-line"></div>

        ${itemHTML}

        <div class="receipt-line"></div>

        <div class="receipt-row">
            <span>Subtotal</span>
            <span>${money(subtotal)}</span>
        </div>

        ${delivery ? `<div class="receipt-row"><span>Delivery</span><span>${money(delivery)}</span></div>` : ""}

        <div class="receipt-line"></div>

        <div class="receipt-row receipt-total">
            <span>TOTAL</span>
            <span>${money(total)}</span>
        </div>

        <div class="receipt-line"></div>
        <div>Payment: ${document.getElementById("paymentMethod").value}</div>
        <div class="receipt-line"></div>
        <p>THANK YOU!</p>
        <p>Visit Again - Food Lover</p>
    `;

    orderHistory.push({
        orderNumber,
        type: orderType,
        table: orderType === "dinein" ? selectedTable : null,
        customerName: name,
        items: [...cart],
        total,
        date,
        payment: document.getElementById("paymentMethod").value
    });

    // Order complete hone ke baad table/cart clear
    carts[getOrderKey()] = [];

    saveData();
    renderAll();

    window.print();

});


// 26. ORDER HISTORY

function renderOrders() {

    const list = document.getElementById("ordersList");

    list.innerHTML = "";

    if (orderHistory.length === 0) {

        list.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px;">
                    No completed orders yet.
                </td>
            </tr>
        `;

        return;
    }

    [...orderHistory].reverse().forEach(order => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(order.orderNumber)}</td>
            <td>${escapeHTML(order.type)}</td>
            <td>${order.table ? "Table " + order.table : escapeHTML(order.customerName || "Customer")}</td>
            <td>${money(order.total)}</td>
            <td>${escapeHTML(order.date)}</td>
        `;

        list.appendChild(row);

    });

}


// 27. RENDER EVERYTHING

function renderAll() {

    renderTables();
    renderCategories();
    renderFood();
    renderCart();
    renderTotal();
    renderOrderDetails();

}


// 28. START

document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-PK");

renderAll();

console.log("Food Lover POS Demo Started!");
