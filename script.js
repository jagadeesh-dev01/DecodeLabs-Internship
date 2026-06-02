// --- Mobile Menu Toggle ---
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const header = document.querySelector('header');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a:not(#cart-nav-btn)').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Advanced Shopping Cart Logic ---
const cartNavBtn = document.getElementById('cart-nav-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');

// Cart State Object
let cart = {}; // Format: { "Coffee Name": { price: 350, quantity: 1 } }

// Event Delegation: Listen for clicks anywhere on the coffee grid
document.querySelector('.grid-container').addEventListener('click', (e) => {
    // Check if the click happened inside a card-footer
    const footer = e.target.closest('.card-footer');
    if (!footer) return;

    const name = footer.getAttribute('data-name');
    const price = parseInt(footer.getAttribute('data-price'));

    // Handle initial "Add" button click
    if (e.target.classList.contains('add-btn')) {
        cart[name] = { price: price, quantity: 1 };
    } 
    // Handle "+" button click
    else if (e.target.classList.contains('plus')) {
        cart[name].quantity++;
    } 
    // Handle "-" button click
    else if (e.target.classList.contains('minus')) {
        cart[name].quantity--;
        if (cart[name].quantity <= 0) {
            delete cart[name]; // Remove from cart if quantity is 0
        }
    } 
    // If clicked anywhere else in footer, do nothing
    else {
        return; 
    }

    renderCardButtons();
    updateCartUI();
});

// Function to visually swap between "Add" button and "+/-" controls
function renderCardButtons() {
    document.querySelectorAll('.card-footer').forEach(footer => {
        const name = footer.getAttribute('data-name');
        const price = footer.getAttribute('data-price');

        if (cart[name]) {
            // Item is in cart, show quantity controls
            footer.innerHTML = `
                <span class="price">₹${price}</span>
                <div class="qty-controls">
                    <button class="qty-btn minus">-</button>
                    <span class="qty-display">${cart[name].quantity}</span>
                    <button class="qty-btn plus">+</button>
                </div>
            `;
        } else {
            // Item is not in cart, show Add button
            footer.innerHTML = `
                <span class="price">₹${price}</span>
                <button class="btn-secondary add-btn">Add</button>
            `;
        }
    });
}

// Function to update the Modal and Navbar totals
function updateCartUI() {
    let totalQty = 0;
    let totalAmount = 0;
    
    // Clear current list
    cartItemsList.innerHTML = '';

    for (let name in cart) {
        let item = cart[name];
        totalQty += item.quantity;
        totalAmount += (item.price * item.quantity);

        // Add item row to modal
        const li = document.createElement('li');
        li.innerHTML = `<span>${name} (x${item.quantity})</span> <span>₹${item.price * item.quantity}</span>`;
        cartItemsList.appendChild(li);
    }

    if (totalQty === 0) {
        cartItemsList.innerHTML = '<li class="empty-msg">Your cart is empty.</li>';
    }

    // Update Text
    cartNavBtn.textContent = `Cart (${totalQty})`;
    cartTotalPrice.textContent = totalAmount;
}

// Open Cart Modal
cartNavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.classList.add('show');
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
});

// Close Cart Modal via X button
closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('show');
});

// Close Modal via clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('show');
    }
});
// ==========================================
// FULL STACK INTEGRATION LOGIC
// ==========================================
const API_URL = 'http://localhost:3000/api/coffees';
const menuContainer = document.getElementById('dynamic-menu');
const coffeeForm = document.getElementById('coffeeForm');

// 1. READ: Fetch data from backend and display it
async function fetchAndDisplayCoffees() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const coffees = await response.json();
        
        // Clear the container before adding new items
        menuContainer.innerHTML = '';
        
        // Loop through database items and create HTML cards
        coffees.forEach(coffee => {
            const card = document.createElement('article');
            card.className = 'coffee-card';
            
            card.innerHTML = `
                <img src="${coffee.image || 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80'}" alt="${coffee.name}" class="card-img" />
                <div class="card-content">
                    <h3>${coffee.name}</h3>
                    <p>${coffee.description}</p>
                    <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">Category: ${coffee.category}</p>
                    <div class="card-footer">
                        <span class="price">₹${coffee.price}</span>
                        <button onclick="deleteCoffee('${coffee._id}')" class="btn-secondary" style="background: #dc3545; color: white; border: none;">Delete</button>
                    </div>
                </div>
            `;
            menuContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error fetching coffees:", error);
        menuContainer.innerHTML = `<p style="text-align:center; color:red; grid-column: 1 / -1;">Failed to connect to the database. Is your Node.js backend running?</p>`;
    }
}

// 2. CREATE: Send new coffee to the database
if (coffeeForm) {
    coffeeForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page refresh

        const newCoffee = {
            name: document.getElementById('name').value,
            price: Number(document.getElementById('price').value),
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            image: document.getElementById('image').value
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCoffee)
            });

            if (response.status === 201) {
                coffeeForm.reset(); // Clear the inputs
                fetchAndDisplayCoffees(); // Refresh the live menu
            } else {
                throw new Error('Failed to create coffee');
            }
        } catch (error) {
            console.error("Error adding coffee:", error);
            alert("Could not add coffee. Make sure the backend is running.");
        }
    });
}

// 3. DELETE: Remove a coffee from the database
window.deleteCoffee = async function(id) {
    const confirmDelete = confirm("Are you sure you want to permanently delete this coffee from the database?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchAndDisplayCoffees(); // Refresh the live menu to remove the card
        } else {
            throw new Error('Failed to delete coffee');
        }
    } catch (error) {
        console.error("Error deleting coffee:", error);
        alert("Could not delete the item.");
    }
};

// Run the fetch function as soon as the page loads
fetchAndDisplayCoffees();