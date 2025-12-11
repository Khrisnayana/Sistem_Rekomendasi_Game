class GameList {
  constructor(container, games, isGroupedByCategory = false) {
    this.container = container;
    this.games = games;
    this.isGroupedByCategory = isGroupedByCategory;
    this.filteredGames = isGroupedByCategory ? { ...games } : [...games];
    this.allGames = this.flattenGames();
    this.render();
  }

  flattenGames() {
    if (this.isGroupedByCategory) {
      return Object.values(this.games).flat();
    }
    return this.games;
  }

  render() {
    this.container.innerHTML = '';
    
    if (this.isGroupedByCategory) {
      // Render grouped by category (Steam-like)
      const categories = Object.keys(this.filteredGames).filter(cat => this.filteredGames[cat].length > 0);
      
      if (categories.length === 0) {
        this.container.innerHTML = `
          <div class="text-center py-12">
            <p class="text-white text-xl">No games found matching your preferences.</p>
            <p class="text-gray-400 mt-2">Try adjusting your search or preferences.</p>
          </div>
        `;
        return;
      }
      
      categories.forEach(category => {
        const categoryGames = this.filteredGames[category];
        if (categoryGames.length === 0) return;

        // Category header with Steam-like styling
        const categorySection = document.createElement('div');
        categorySection.className = 'mb-12';
        categorySection.innerHTML = `
          <div class="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#66c0f4]">
            <h2 class="text-3xl font-bold text-[#c7d5e0] flex items-center">
              <i class="fas fa-th-large mr-3 text-[#66c0f4]"></i>
              ${category} Games
            </h2>
            <span class="text-[#8f98a0] text-lg font-medium bg-[#16202d] px-4 py-2 rounded">
              ${categoryGames.length} ${categoryGames.length === 1 ? 'game' : 'games'}
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" data-category="${category}">
          </div>
        `;
        this.container.appendChild(categorySection);

        // Games in this category - render ALL games, no limit
        const gamesContainer = categorySection.querySelector(`[data-category="${category}"]`);
        console.log(`Rendering ${categoryGames.length} games for category: ${category}`); // Debug
        categoryGames.forEach(game => {
          const gameCard = this.createGameCard(game);
          gamesContainer.appendChild(gameCard);
        });
      });
    } else {
      // Render flat list
      if (this.filteredGames.length === 0) {
        this.container.innerHTML = `
          <div class="text-center py-12">
            <p class="text-white text-xl">No games found.</p>
            <p class="text-gray-400 mt-2">Try adjusting your search.</p>
          </div>
        `;
        return;
      }
      
      // Create grid container for flat list with Steam-like styling
      const gridContainer = document.createElement('div');
      gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6';
      this.container.appendChild(gridContainer);
      
      console.log('Rendering', this.filteredGames.length, 'games'); // Debug
      
      // Render ALL games without any limit
      this.filteredGames.forEach((game, index) => {
        const gameCard = this.createGameCard(game);
        gridContainer.appendChild(gameCard);
      });
      
      console.log('Total game cards rendered:', gridContainer.children.length); // Debug
    }
  }

  createGameCard(game) {
    const gameCard = document.createElement('div');
    gameCard.className = 'group bg-[#1b2838] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-[#2a475e] hover:border-[#66c0f4]';
    
    // Format price properly
    const price = game.price !== null && game.price !== undefined ? (typeof game.price === 'number' ? game.price.toFixed(2) : parseFloat(game.price).toFixed(2)) : '0.00';
    const originalPrice = game.original_price !== null && game.original_price !== undefined ? (typeof game.original_price === 'number' ? game.original_price.toFixed(2) : parseFloat(game.original_price).toFixed(2)) : price;
    const discount = game.discount || 0;
    const isFree = parseFloat(price) === 0;
    
    // Format rating with stars (convert from 10-point scale to 5-star scale)
    const rating = game.rating || 0;
    const rating5Star = (rating / 2); // Convert from 10-point to 5-star scale
    const fullStars = Math.floor(rating5Star);
    const hasHalfStar = rating5Star % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    // Format popularity
    const popularity = game.popularity || 0;
    const popularityBar = Math.min(popularity, 100);
    
    // Format genres and modes
    const genres = Array.isArray(game.genres) ? game.genres : (game.genres || '').split(',');
    const modes = Array.isArray(game.modes) ? game.modes : (game.modes || '').split(',');
    
    gameCard.innerHTML = `
      <div class="relative overflow-hidden">
        <img src="${game.image}" alt="${game.name}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-[#1b2838] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        ${discount > 0 ? `<div class="absolute top-2 right-2 bg-[#4c6b22] text-white px-3 py-1 rounded font-bold text-sm shadow-lg">-${discount}%</div>` : ''}
        ${isFree ? `<div class="absolute top-2 right-2 bg-[#4c6b22] text-white px-3 py-1 rounded font-bold text-sm shadow-lg">FREE</div>` : ''}
      </div>
      <div class="p-4">
        <h3 class="text-lg font-bold text-[#c7d5e0] mb-2 line-clamp-2 group-hover:text-[#66c0f4] transition-colors">${game.name}</h3>
        
        <div class="mb-3">
          <div class="flex items-center mb-1">
            <div class="flex text-yellow-400 text-sm mr-2">
              ${'★'.repeat(fullStars)}${hasHalfStar ? '½' : ''}${'☆'.repeat(emptyStars)}
            </div>
            <span class="text-[#66c0f4] text-sm font-semibold">${rating.toFixed(1)}</span>
          </div>
          <div class="flex items-center">
            <div class="flex-1 bg-[#2a475e] rounded-full h-2 mr-2">
              <div class="bg-[#66c0f4] h-2 rounded-full transition-all duration-500" style="width: ${popularityBar}%"></div>
            </div>
            <span class="text-[#8f98a0] text-xs font-medium">${popularity}%</span>
          </div>
        </div>
        
        <div class="flex flex-wrap gap-1 mb-3">
          ${genres.slice(0, 2).map(genre => `<span class="bg-[#2a475e] text-[#c7d5e0] px-2 py-1 rounded text-xs">${genre.trim()}</span>`).join('')}
        </div>
        
        <div class="flex justify-between items-center pt-3 border-t border-[#2a475e]">
          ${discount > 0 ? `
            <div class="flex items-center space-x-2">
              <span class="text-[#8f98a0] line-through text-sm">$${originalPrice}</span>
              <span class="text-[#c7d5e0] font-bold text-lg">$${price}</span>
            </div>
          ` : isFree ? `
            <span class="text-[#4c6b22] font-bold text-lg">Free to Play</span>
          ` : `
            <span class="text-[#c7d5e0] font-bold text-lg">$${price}</span>
          `}
          <button class="bg-[#1b2838] hover:bg-[#2a475e] text-[#66c0f4] px-4 py-2 rounded text-sm font-semibold transition-colors border border-[#66c0f4]">
            View Details
          </button>
        </div>
      </div>
    `;
    
    // Add click handler to open game details
    gameCard.addEventListener('click', () => {
      if (typeof GameDetail !== 'undefined') {
        const gameDetail = new GameDetail(game);
        gameDetail.show();
      }
    });
    
    return gameCard;
  }

  filterGames(query) {
    if (!query || query.trim() === '') {
      this.filteredGames = this.isGroupedByCategory ? { ...this.games } : [...this.games];
      this.render();
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    if (this.isGroupedByCategory) {
      // Filter grouped games
      const filtered = {};
      Object.keys(this.games).forEach(category => {
        const categoryGames = this.games[category].filter(game =>
          game.name.toLowerCase().includes(lowerQuery) ||
          (Array.isArray(game.genres) ? game.genres : game.genres.split(',')).some(g => g.toLowerCase().includes(lowerQuery)) ||
          (Array.isArray(game.modes) ? game.modes : game.modes.split(',')).some(m => m.toLowerCase().includes(lowerQuery))
        );
        if (categoryGames.length > 0) {
          filtered[category] = categoryGames;
        }
      });
      this.filteredGames = filtered;
    } else {
      // Filter flat list
      this.filteredGames = this.games.filter(game =>
        game.name.toLowerCase().includes(lowerQuery) ||
        (Array.isArray(game.genres) ? game.genres : game.genres.split(',')).some(g => g.toLowerCase().includes(lowerQuery)) ||
        (Array.isArray(game.modes) ? game.modes : game.modes.split(',')).some(m => m.toLowerCase().includes(lowerQuery))
      );
    }
    this.render();
  }
}
