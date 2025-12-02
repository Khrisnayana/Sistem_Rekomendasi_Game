class GameDetail {
  constructor(game) {
    this.game = game;
    this.modal = null;
    this.createModal();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    this.modal.innerHTML = `
      <div class="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="relative">
          <button class="close-modal absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center">
            <i class="fas fa-times"></i>
          </button>
          <img src="${this.game.image}" alt="${this.game.name}" class="w-full h-64 object-cover rounded-t-xl">
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-t-xl"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <h2 class="text-white text-3xl font-bold mb-2">${this.game.name}</h2>
            <div class="flex items-center space-x-4 text-gray-300">
              <span class="flex items-center">
                <i class="fas fa-star text-yellow-400 mr-1"></i>
                ${this.game.rating}
              </span>
              <span class="flex items-center">
                <i class="fas fa-calendar mr-1"></i>
                ${new Date(this.game.release_date).getFullYear()}
              </span>
              <span class="flex items-center">
                <i class="fas fa-user mr-1"></i>
                ${this.game.developer}
              </span>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              ${this.game.discount > 0 ?
                `<span class="text-gray-400 line-through">$${this.game.original_price}</span>
                 <span class="text-white font-bold text-xl">$${this.game.price}</span>
                 <span class="bg-red-500 text-white px-2 py-1 rounded text-sm">-${this.game.discount}%</span>` :
                this.game.price === 0 ?
                  '<span class="text-green-400 font-bold text-xl">Free to Play</span>' :
                  `<span class="text-white font-bold text-xl">$${this.game.price}</span>`
              }
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-400">
                <i class="fas fa-users mr-1"></i>
                ${this.game.reviews_count.toLocaleString()} reviews
              </span>
              <span class="${this.getReviewColor()}">
                ${Math.round((this.game.positive_reviews / this.game.reviews_count) * 100)}% positive
              </span>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-white text-xl font-bold mb-3 flex items-center">
                <i class="fas fa-info-circle mr-2 text-blue-400"></i>
                Game Details
              </h3>
              <div class="space-y-2 text-gray-300">
                <p><strong class="text-white">Developer:</strong> ${this.game.developer}</p>
                <p><strong class="text-white">Publisher:</strong> ${this.game.publisher}</p>
                <p><strong class="text-white">Release Date:</strong> ${new Date(this.game.release_date).toLocaleDateString()}</p>
                <p><strong class="text-white">Genres:</strong> ${this.game.genres.split(',').join(', ')}</p>
                <p><strong class="text-white">Modes:</strong> ${this.game.modes.split(',').join(', ')}</p>
                <p><strong class="text-white">Platforms:</strong> ${this.game.platforms.split(',').join(', ')}</p>
              </div>
            </div>

            <div>
              <h3 class="text-white text-xl font-bold mb-3 flex items-center">
                <i class="fas fa-tags mr-2 text-green-400"></i>
                Popular Tags
              </h3>
              <div class="flex flex-wrap gap-2">
                ${this.game.tags.split(',').map(tag =>
                  `<span class="bg-blue-500 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm">${tag.trim()}</span>`
                ).join('')}
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-white text-xl font-bold mb-3 flex items-center">
              <i class="fas fa-book mr-2 text-purple-400"></i>
              Description
            </h3>
            <p class="text-gray-300 leading-relaxed">${this.game.description}</p>
          </div>

          <div class="mb-6">
            <h3 class="text-white text-xl font-bold mb-3 flex items-center">
              <i class="fas fa-cogs mr-2 text-orange-400"></i>
              System Requirements
            </h3>
            <div class="bg-gray-800 rounded-lg p-4 text-gray-300">
              ${this.game.system_requirements.split(', ').map(req =>
                `<div class="mb-1">${req}</div>`
              ).join('')}
            </div>
          </div>

          <div class="flex space-x-4">
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center transition duration-300">
              <i class="fas fa-shopping-cart mr-2"></i>
              Add to Cart
            </button>
            <button class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold flex items-center transition duration-300">
              <i class="fas fa-heart mr-2"></i>
              Add to Wishlist
            </button>
            <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center transition duration-300">
              <i class="fas fa-play mr-2"></i>
              Play Game
            </button>
          </div>
        </div>
      </div>
    `;

    // Add close functionality
    this.modal.querySelector('.close-modal').addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    document.body.appendChild(this.modal);
  }

  getReviewColor() {
    const percentage = (this.game.positive_reviews / this.game.reviews_count) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
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
