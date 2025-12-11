class Cart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.modal = null;
  }

  show() {
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.createModal();
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  createModal() {
    if (this.modal) {
      this.modal.remove();
    }

    this.modal = document.createElement('div');
    this.modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4';
    
    const total = this.cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    
    this.modal.innerHTML = `
      <div class="bg-[#1b2838] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#2a475e]">
        <div class="sticky top-0 bg-[#1b2838] border-b border-[#2a475e] p-6 flex items-center justify-between z-10">
          <h2 class="text-3xl font-bold text-[#c7d5e0] flex items-center">
            <i class="fas fa-shopping-cart mr-3 text-[#66c0f4]"></i>
            Shopping Cart
          </h2>
          <button class="close-cart text-[#c7d5e0] hover:text-[#66c0f4] text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#16202d] transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6">
          ${this.cart.length === 0 ? `
            <div class="text-center py-16">
              <i class="fas fa-shopping-cart text-6xl text-[#8f98a0] mb-4"></i>
              <h3 class="text-2xl font-bold text-[#c7d5e0] mb-2">Your cart is empty</h3>
              <p class="text-[#8f98a0] mb-6">Add some games to your cart to get started!</p>
              <button class="close-cart bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-semibold transition-colors">
                Continue Shopping
              </button>
            </div>
          ` : `
            <div class="space-y-4 mb-6">
              ${this.cart.map((item, index) => `
                <div class="bg-[#16202d] rounded-lg p-4 border border-[#2a475e] hover:border-[#66c0f4] transition-colors flex items-center space-x-4">
                  <img src="${item.image || 'https://via.placeholder.com/150x200?text=Game'}" 
                       alt="${item.name}" 
                       class="w-24 h-32 object-cover rounded">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-[#c7d5e0] mb-2">${item.name}</h3>
                    <div class="flex items-center space-x-4">
                      ${item.discount > 0 ? `
                        <span class="text-[#8f98a0] line-through text-sm">$${parseFloat(item.price / (1 - item.discount / 100)).toFixed(2)}</span>
                        <span class="text-[#4c6b22] font-semibold">-${item.discount}%</span>
                      ` : ''}
                      <span class="text-[#66c0f4] font-bold text-xl">$${parseFloat(item.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <button class="remove-item text-[#b84040] hover:text-[#c94a4a] text-xl px-4 py-2 rounded hover:bg-[#16202d] transition-colors" 
                          data-index="${index}">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              `).join('')}
            </div>

            <div class="border-t border-[#2a475e] pt-6">
              <div class="flex justify-between items-center mb-6">
                <span class="text-2xl font-bold text-[#c7d5e0]">Total:</span>
                <span class="text-3xl font-bold text-[#66c0f4]">$${total.toFixed(2)}</span>
              </div>
              <div class="flex space-x-4">
                <button class="checkout-btn flex-1 bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-bold transition-colors">
                  <i class="fas fa-credit-card mr-2"></i>
                  Proceed to Checkout
                </button>
                <button class="close-cart bg-[#2a475e] hover:bg-[#3a5a7e] text-[#c7d5e0] px-6 py-3 rounded font-bold transition-colors">
                  Continue Shopping
                </button>
              </div>
            </div>
          `}
        </div>
      </div>
    `;

    // Add event listeners
    this.modal.querySelector('.close-cart').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Add remove item listeners
    this.modal.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.removeItem(index);
      });
    });

    // Add checkout button listener
    const checkoutBtn = this.modal.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.proceedToCheckout();
      });
    }

    document.body.appendChild(this.modal);
  }

  proceedToCheckout() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty!', 'warning');
      return;
    }

    this.showCheckoutModal();
  }

  showCheckoutModal() {
    const total = this.cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    
    // Create checkout confirmation modal
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4';
    checkoutModal.innerHTML = `
      <div class="bg-[#1b2838] rounded-xl max-w-2xl w-full shadow-2xl border border-[#2a475e]">
        <div class="p-6 border-b border-[#2a475e]">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-[#c7d5e0] flex items-center">
              <i class="fas fa-credit-card mr-3 text-[#66c0f4]"></i>
              Checkout Confirmation
            </h2>
            <button class="close-checkout-modal text-[#c7d5e0] hover:text-[#66c0f4] text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#16202d] transition-colors">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="p-6">
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-[#c7d5e0] mb-4">Order Summary</h3>
            <div class="space-y-3 max-h-64 overflow-y-auto">
              ${this.cart.map((item, index) => `
                <div class="bg-[#16202d] rounded-lg p-4 border border-[#2a475e] flex items-center space-x-4">
                  <img src="${item.image || 'https://via.placeholder.com/150x200?text=Game'}" 
                       alt="${item.name}" 
                       class="w-16 h-20 object-cover rounded">
                  <div class="flex-1">
                    <h4 class="text-[#c7d5e0] font-semibold">${item.name}</h4>
                    ${item.discount > 0 ? `
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-[#8f98a0] line-through text-sm">$${parseFloat(item.price / (1 - item.discount / 100)).toFixed(2)}</span>
                        <span class="bg-[#4c6b22] text-white px-2 py-1 rounded text-xs font-bold">-${item.discount}%</span>
                      </div>
                    ` : ''}
                  </div>
                  <span class="text-[#66c0f4] font-bold">$${parseFloat(item.price || 0).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="border-t border-[#2a475e] pt-4 mb-6">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[#8f98a0]">Subtotal:</span>
              <span class="text-[#c7d5e0]">$${total.toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-[#8f98a0]">Tax:</span>
              <span class="text-[#c7d5e0]">$0.00</span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-[#2a475e]">
              <span class="text-xl font-bold text-[#c7d5e0]">Total:</span>
              <span class="text-2xl font-bold text-[#66c0f4]">$${total.toFixed(2)}</span>
            </div>
          </div>

          <div class="flex space-x-4">
            <button class="confirm-checkout flex-1 bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-bold transition-colors flex items-center justify-center">
              <i class="fas fa-check mr-2"></i>
              Confirm Purchase
            </button>
            <button class="cancel-checkout bg-[#2a475e] hover:bg-[#3a5a7e] text-[#c7d5e0] px-6 py-3 rounded font-bold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    checkoutModal.querySelector('.close-checkout-modal').addEventListener('click', () => {
      checkoutModal.remove();
    });
    
    checkoutModal.querySelector('.cancel-checkout').addEventListener('click', () => {
      checkoutModal.remove();
    });

    checkoutModal.querySelector('.confirm-checkout').addEventListener('click', async () => {
      await this.processCheckout();
      checkoutModal.remove();
    });

    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) {
        checkoutModal.remove();
      }
    });

    document.body.appendChild(checkoutModal);
  }

  async processCheckout() {
    // Get current username from session or app
    let username = 'guest';
    if (window.app && window.app.user && window.app.user.username) {
      username = window.app.user.username;
    } else {
      // Try to get from session
      try {
        const response = await fetch('/api/session', { credentials: 'include' });
        const data = await response.json();
        if (data.loggedIn && data.user) {
          username = data.user.username;
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    }
    
    // Save games to library specific to user
    const libraryKey = `library_${username}`;
    const library = JSON.parse(localStorage.getItem(libraryKey) || '[]');
    
    this.cart.forEach(item => {
      // Check if game already exists in library
      const exists = library.find(libItem => libItem.id === item.id);
      if (!exists) {
        library.push({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          image: item.image,
          discount: item.discount || 0,
          purchaseDate: new Date().toISOString()
        });
      }
    });
    
    localStorage.setItem(libraryKey, JSON.stringify(library));
    
    // Show success notification
    this.showSuccessModal(this.cart.length);
    
    // Clear cart after successful checkout
    localStorage.removeItem('cart');
    this.cart = [];
    this.updateCartCount();
    
    // Notify app.js to update count and reload library if on library page
    if (window.app) {
      if (window.app.updateCartCount) {
        window.app.updateCartCount();
      }
      // Reload library if currently viewing library page
      const libraryPage = document.getElementById('library-page');
      if (libraryPage && !libraryPage.classList.contains('hidden')) {
        window.app.loadLibrary();
      }
    }
    
    // Close cart modal
    this.close();
  }

  showSuccessModal(gameCount) {
    const successModal = document.createElement('div');
    successModal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4';
    successModal.innerHTML = `
      <div class="bg-[#1b2838] rounded-xl max-w-md w-full shadow-2xl border border-[#4c6b22]">
        <div class="p-8 text-center">
          <div class="mb-6">
            <i class="fas fa-check-circle text-6xl text-[#4c6b22] mb-4"></i>
            <h2 class="text-3xl font-bold text-[#c7d5e0] mb-2">Purchase Successful!</h2>
            <p class="text-[#8f98a0] text-lg">
              ${gameCount} ${gameCount === 1 ? 'game has' : 'games have'} been added to your library.
            </p>
          </div>
          <button class="close-success-modal w-full bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-bold transition-colors">
            <i class="fas fa-check mr-2"></i>
            Continue
          </button>
        </div>
      </div>
    `;

    successModal.querySelector('.close-success-modal').addEventListener('click', () => {
      successModal.remove();
    });

    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        successModal.remove();
      }
    });

    document.body.appendChild(successModal);

    // Auto close after 3 seconds
    setTimeout(() => {
      if (successModal.parentNode) {
        successModal.remove();
      }
    }, 3000);
  }

  showNotification(message, type = 'success') {
    const colors = {
      success: 'bg-[#4c6b22]',
      warning: 'bg-yellow-600',
      error: 'bg-[#b84040]'
    };

    const notification = document.createElement('div');
    notification.className = `game-notification fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-[100] flex items-center space-x-3 animate-slide-in`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-times-circle'}"></i>
      <span class="font-semibold">${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  removeItem(index) {
    this.cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.createModal();
    this.updateCartCount();
    
    // Notify app.js to update count
    if (window.app && window.app.updateCartCount) {
      window.app.updateCartCount();
    }
  }

  updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      if (this.cart.length > 0) {
        cartCountEl.textContent = this.cart.length;
        cartCountEl.classList.remove('hidden');
      } else {
        cartCountEl.classList.add('hidden');
      }
    }
  }

  close() {
    if (this.modal) {
      this.modal.classList.add('hidden');
      setTimeout(() => {
        if (this.modal && this.modal.parentNode) {
          this.modal.remove();
        }
      }, 300);
      document.body.style.overflow = 'auto';
    }
  }
}

