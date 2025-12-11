class Wishlist {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    this.modal = null;
  }

  show() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
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
    
    this.modal.innerHTML = `
      <div class="bg-[#1b2838] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#2a475e]">
        <div class="sticky top-0 bg-[#1b2838] border-b border-[#2a475e] p-6 flex items-center justify-between z-10">
          <h2 class="text-3xl font-bold text-[#c7d5e0] flex items-center">
            <i class="fas fa-heart mr-3 text-[#b84040]"></i>
            My Wishlist
          </h2>
          <button class="close-wishlist text-[#c7d5e0] hover:text-[#66c0f4] text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#16202d] transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6">
          ${this.wishlist.length === 0 ? `
            <div class="text-center py-16">
              <i class="fas fa-heart text-6xl text-[#8f98a0] mb-4"></i>
              <h3 class="text-2xl font-bold text-[#c7d5e0] mb-2">Your wishlist is empty</h3>
              <p class="text-[#8f98a0] mb-6">Add games to your wishlist to save them for later!</p>
              <button class="browse-games bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-semibold transition-colors">
                Browse Games
              </button>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${this.wishlist.map((item, index) => `
                <div class="bg-[#16202d] rounded-lg p-4 border border-[#2a475e] hover:border-[#66c0f4] transition-colors group cursor-pointer" data-game-id="${item.id}">
                  <div class="flex items-start space-x-4">
                    <img src="${item.image || 'https://via.placeholder.com/150x200?text=Game'}" 
                         alt="${item.name}" 
                         class="w-20 h-28 object-cover rounded">
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-[#c7d5e0] mb-2 group-hover:text-[#66c0f4] transition-colors">${item.name}</h3>
                      <div class="flex items-center space-x-4 mb-3">
                        ${item.discount > 0 ? `
                          <span class="text-[#8f98a0] line-through text-sm">$${parseFloat(item.price / (1 - item.discount / 100)).toFixed(2)}</span>
                          <span class="bg-[#4c6b22] text-white px-2 py-1 rounded text-xs font-bold">-${item.discount}%</span>
                        ` : ''}
                        <span class="text-[#66c0f4] font-bold">$${parseFloat(item.price || 0).toFixed(2)}</span>
                      </div>
                      <div class="flex space-x-2">
                        <button class="add-to-cart-from-wishlist flex-1 bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-3 py-2 rounded text-sm font-semibold transition-colors" 
                                data-index="${index}">
                          <i class="fas fa-cart-plus mr-1"></i>
                          Add to Cart
                        </button>
                        <button class="remove-from-wishlist text-[#b84040] hover:text-[#c94a4a] px-3 py-2 rounded text-sm font-semibold transition-colors" 
                                data-index="${index}">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Add event listeners
    this.modal.querySelector('.close-wishlist').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Add remove item listeners
    this.modal.querySelectorAll('.remove-from-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.removeItem(index);
      });
    });

    // Add to cart from wishlist
    this.modal.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.addToCart(index);
      });
    });

    // Click on game card to view details
    this.modal.querySelectorAll('[data-game-id]').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const gameId = parseInt(card.dataset.gameId);
          this.viewGameDetails(gameId);
        }
      });
    });

    // Add browse games listener to send users back to store
    this.modal.querySelectorAll('.browse-games').forEach(btn => {
      btn.addEventListener('click', () => this.goToStore());
    });

    document.body.appendChild(this.modal);
  }

  removeItem(index) {
    this.wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    this.createModal();
    this.updateWishlistCount();
    
    // Notify app.js to update count
    if (window.app && window.app.updateWishlistCount) {
      window.app.updateWishlistCount();
    }
  }

  addToCart(index) {
    const item = this.wishlist[index];
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const gameExists = cart.find(cartItem => cartItem.id === item.id);
    if (gameExists) {
      alert('Game sudah ada di cart!');
      return;
    }

    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    if (window.app && window.app.updateCartCount) {
      window.app.updateCartCount();
    }
    
    // Show notification
    this.showNotification(`${item.name} ditambahkan ke cart!`, 'success');
  }

  viewGameDetails(gameId) {
    // Fetch game details and show GameDetail modal
    fetch('/api/games')
      .then(res => res.json())
      .then(games => {
        const game = games.find(g => g.id === gameId);
        if (game && typeof GameDetail !== 'undefined') {
          const gameDetail = new GameDetail(game);
          gameDetail.show();
          this.close();
        }
      })
      .catch(err => console.error('Error fetching game:', err));
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

  updateWishlistCount() {
    const wishlistCountEl = document.getElementById('wishlist-count');
    if (wishlistCountEl) {
      if (this.wishlist.length > 0) {
        wishlistCountEl.textContent = this.wishlist.length;
        wishlistCountEl.classList.remove('hidden');
      } else {
        wishlistCountEl.classList.add('hidden');
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

  goToStore() {
    this.close();
    if (window.app && typeof window.app.showPage === 'function') {
      window.app.showPage('store');
    } else {
      window.location.href = 'index.html';
    }
  }
}

