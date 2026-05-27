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