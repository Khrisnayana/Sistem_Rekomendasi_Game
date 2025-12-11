class GameDetail {
  constructor(game) {
    this.game = game;
    this.modal = null;
    this.createModal();
  }

  createModal() {
    // Helper functions to safely get values
    const safeGet = (obj, key, defaultValue = 'N/A') => {
      return obj[key] !== null && obj[key] !== undefined ? obj[key] : defaultValue;
    };
    
    const formatPrice = (price) => {
      if (price === null || price === undefined) return '0.00';
      const numPrice = typeof price === 'number' ? price : parseFloat(price);
      return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };
    
    const formatRating = (rating) => {
      const numRating = rating || 0;
      // Convert from 10-point scale to 5-star scale for display
      const rating5Star = numRating / 2;
      const fullStars = Math.floor(rating5Star);
      const hasHalfStar = rating5Star % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
      return {
        stars: '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars),
        value: numRating.toFixed(1)
      };
    };
    
    const formatArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',').map(s => s.trim());
      return [];
    };
    
    const price = formatPrice(this.game.price);
    const originalPrice = formatPrice(this.game.original_price || this.game.price);
    const discount = this.game.discount || 0;
    const isFree = parseFloat(price) === 0;
    const rating = formatRating(this.game.rating);
    const releaseDate = this.game.release_date ? new Date(this.game.release_date) : null;
    const genres = formatArray(this.game.genres);
    const modes = formatArray(this.game.modes);
    const tags = formatArray(this.game.tags || '');
    const platforms = formatArray(this.game.platforms || '');
    const reviewsCount = this.game.reviews_count || 0;
    const positiveReviews = this.game.positive_reviews || 0;
    const reviewPercentage = reviewsCount > 0 ? Math.round((positiveReviews / reviewsCount) * 100) : 0;
    const systemReqs = this.game.system_requirements || 'Not specified';
    
    this.modal = document.createElement('div');
    this.modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4';
    this.modal.innerHTML = `
      <div class="bg-[#1b2838] rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#2a475e]">
        <div class="relative">
          <button class="close-modal absolute top-4 right-4 text-white text-2xl hover:text-[#66c0f4] z-10 bg-[#16202d] bg-opacity-90 rounded-full w-12 h-12 flex items-center justify-center transition-colors border border-[#2a475e]">
            <i class="fas fa-times"></i>
          </button>
          <img src="${this.game.image || 'https://via.placeholder.com/800x400?text=Game+Image'}" alt="${this.game.name}" class="w-full h-80 object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-transparent to-transparent"></div>
          <div class="absolute bottom-6 left-6 right-6">
            <h2 class="text-white text-4xl font-bold mb-3">${this.game.name}</h2>
            <div class="flex items-center space-x-6 text-[#c7d5e0]">
              <span class="flex items-center bg-[#16202d] px-3 py-1 rounded">
                <i class="fas fa-star text-yellow-400 mr-2"></i>
                <span class="font-semibold">${rating.value}</span>
                <span class="ml-2 text-yellow-400 text-sm">${rating.stars}</span>
              </span>
              ${releaseDate ? `<span class="flex items-center bg-[#16202d] px-3 py-1 rounded">
                <i class="fas fa-calendar mr-2 text-[#66c0f4]"></i>
                ${releaseDate.getFullYear()}
              </span>` : ''}
              ${this.game.developer ? `<span class="flex items-center bg-[#16202d] px-3 py-1 rounded">
                <i class="fas fa-user mr-2 text-[#66c0f4]"></i>
                ${this.game.developer}
              </span>` : ''}
            </div>
          </div>
        </div>

        <div class="p-8">
          <div class="flex items-center justify-between mb-6 pb-6 border-b border-[#2a475e]">
            <div class="flex items-center space-x-3">
              ${discount > 0 ?
                `<span class="text-[#8f98a0] line-through text-lg">$${originalPrice}</span>
                 <span class="text-[#c7d5e0] font-bold text-3xl">$${price}</span>
                 <span class="bg-[#4c6b22] text-white px-3 py-1 rounded font-bold">-${discount}%</span>` :
                isFree ?
                  '<span class="text-[#4c6b22] font-bold text-3xl">Free to Play</span>' :
                  `<span class="text-[#c7d5e0] font-bold text-3xl">$${price}</span>`
              }
            </div>
            ${reviewsCount > 0 ? `<div class="flex items-center space-x-4">
              <span class="text-[#8f98a0]">
                <i class="fas fa-users mr-2"></i>
                ${reviewsCount.toLocaleString()} reviews
              </span>
              <span class="${this.getReviewColor()} font-semibold">
                ${reviewPercentage}% positive
              </span>
            </div>` : ''}
          </div>

          <div class="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 class="text-[#c7d5e0] text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-info-circle mr-3 text-[#66c0f4]"></i>
                Game Details
              </h3>
              <div class="space-y-3 text-[#8f98a0]">
                ${this.game.developer ? `<p><strong class="text-[#c7d5e0]">Developer:</strong> ${this.game.developer}</p>` : ''}
                ${this.game.publisher ? `<p><strong class="text-[#c7d5e0]">Publisher:</strong> ${this.game.publisher}</p>` : ''}
                ${releaseDate ? `<p><strong class="text-[#c7d5e0]">Release Date:</strong> ${releaseDate.toLocaleDateString()}</p>` : ''}
                <p><strong class="text-[#c7d5e0]">Genres:</strong> ${genres.join(', ')}</p>
                <p><strong class="text-[#c7d5e0]">Modes:</strong> ${modes.join(', ')}</p>
                ${platforms.length > 0 ? `<p><strong class="text-[#c7d5e0]">Platforms:</strong> ${platforms.join(', ')}</p>` : ''}
              </div>
            </div>

            ${tags.length > 0 ? `<div>
              <h3 class="text-[#c7d5e0] text-2xl font-bold mb-4 flex items-center">
                <i class="fas fa-tags mr-3 text-[#4c6b22]"></i>
                Popular Tags
              </h3>
              <div class="flex flex-wrap gap-2">
                ${tags.map(tag =>
                  `<span class="bg-[#2a475e] text-[#66c0f4] px-4 py-2 rounded-full text-sm font-medium">${tag}</span>`
                ).join('')}
              </div>
            </div>` : ''}
          </div>

          ${this.game.description ? `<div class="mb-8">
            <h3 class="text-[#c7d5e0] text-2xl font-bold mb-4 flex items-center">
              <i class="fas fa-book mr-3 text-[#66c0f4]"></i>
              Description
            </h3>
            <p class="text-[#8f98a0] leading-relaxed text-lg">${this.game.description}</p>
          </div>` : ''}

          ${systemReqs !== 'Not specified' ? `<div class="mb-8">
            <h3 class="text-[#c7d5e0] text-2xl font-bold mb-4 flex items-center">
              <i class="fas fa-cogs mr-3 text-[#66c0f4]"></i>
              System Requirements
            </h3>
            <div class="bg-[#16202d] rounded-lg p-5 text-[#8f98a0] border border-[#2a475e]">
              ${systemReqs.split(', ').map(req =>
                `<div class="mb-2 flex items-start">
                  <i class="fas fa-check-circle text-[#4c6b22] mr-2 mt-1"></i>
                  <span>${req}</span>
                </div>`
              ).join('')}
            </div>
          </div>` : ''}

          <div class="flex space-x-4 pt-6 border-t border-[#2a475e]">
            <button class="add-to-cart-btn bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-8 py-3 rounded font-bold flex items-center transition-colors">
              <i class="fas fa-shopping-cart mr-2"></i>
              Add to Cart
            </button>
            <button class="add-to-wishlist-btn bg-[#2a475e] hover:bg-[#3a5a7e] text-[#c7d5e0] px-8 py-3 rounded font-bold flex items-center transition-colors">
              <i class="fas fa-heart mr-2"></i>
              Add to Wishlist
            </button>
            ${isFree ? `<button class="play-now-btn bg-[#66c0f4] hover:bg-[#8cd4f4] text-white px-8 py-3 rounded font-bold flex items-center transition-colors">
              <i class="fas fa-play mr-2"></i>
              Play Now
            </button>` : ''}
          </div>
        </div>
      </div>
    `;

    // Add close functionality
    this.modal.querySelector('.close-modal').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Add to Cart functionality
    const addToCartBtn = this.modal.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addToCart();
      });
    }

    // Add to Wishlist functionality
    const addToWishlistBtn = this.modal.querySelector('.add-to-wishlist-btn');
    if (addToWishlistBtn) {
      addToWishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addToWishlist();
      });
    }

    document.body.appendChild(this.modal);
  }

  addToCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const gameExists = cart.find(item => item.id === this.game.id);
      
      if (gameExists) {
        this.showNotification('Game sudah ada di cart!', 'warning');
        return;
      }

      cart.push({
        id: this.game.id,
        name: this.game.name,
        price: this.game.price || 0,
        image: this.game.image,
        discount: this.game.discount || 0
      });
      
      localStorage.setItem('cart', JSON.stringify(cart));
      this.showNotification(`${this.game.name} berhasil ditambahkan ke cart!`, 'success');
      this.updateCartCount();
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Gagal menambahkan ke cart', 'error');
    }
  }

  addToWishlist() {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const gameExists = wishlist.find(item => item.id === this.game.id);
      
      if (gameExists) {
        this.showNotification('Game sudah ada di wishlist!', 'warning');
        return;
      }

      wishlist.push({
        id: this.game.id,
        name: this.game.name,
        price: this.game.price || 0,
        image: this.game.image,
        discount: this.game.discount || 0
      });
      
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      this.showNotification(`${this.game.name} berhasil ditambahkan ke wishlist!`, 'success');
      this.updateWishlistCount();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      this.showNotification('Gagal menambahkan ke wishlist', 'error');
    }
  }

  showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotif = document.querySelector('.game-notification');
    if (existingNotif) {
      existingNotif.remove();
    }

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

    // Add animation style if not exists
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  updateCartCount() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (cart.length > 0) {
        cartCountEl.textContent = cart.length;
        cartCountEl.classList.remove('hidden');
      } else {
        cartCountEl.classList.add('hidden');
      }
    }
  }

  updateWishlistCount() {
    const wishlistCountEl = document.getElementById('wishlist-count');
    if (wishlistCountEl) {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (wishlist.length > 0) {
        wishlistCountEl.textContent = wishlist.length;
        wishlistCountEl.classList.remove('hidden');
      } else {
        wishlistCountEl.classList.add('hidden');
      }
    }
  }

  getReviewColor() {
    const reviewsCount = this.game.reviews_count || 0;
    const positiveReviews = this.game.positive_reviews || 0;
    if (reviewsCount === 0) return 'text-[#8f98a0]';
    const percentage = (positiveReviews / reviewsCount) * 100;
    if (percentage >= 80) return 'text-[#4c6b22]';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-[#b84040]';
  }

  show() {
    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    this.modal.remove();
  }
}
