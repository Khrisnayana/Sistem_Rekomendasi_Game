class App {
  constructor() {
    this.user = null;
    this.gameList = null;
    this.search = null;
    window.app = this; // Make app accessible globally
    this.init();
  }

  async init() {
    // Check session
    const sessionResponse = await fetch('/api/session', { credentials: 'include' });
    const sessionData = await sessionResponse.json();

    if (sessionData.loggedIn) {
      // User is logged in - show user dashboard and personalized recommendations
      this.user = sessionData.user;
      this.showUserDashboard();

      // Load personalized recommendations based on user preferences
      let games;
      let isGrouped = false;
      
      if (this.user.genres && this.user.genres.length > 0 && this.user.modes && this.user.modes.length > 0) {
        // Get personalized recommendations grouped by category
        games = await Recommendation.getRecommendations(this.user);
        // Check if games is grouped by category (object) or flat array
        isGrouped = games && typeof games === 'object' && !Array.isArray(games) && Object.keys(games).length > 0;
        
        // If no recommendations found, fallback to all games
        if (!isGrouped || Object.keys(games).length === 0) {
          games = await Recommendation.getAllGames();
          games.sort((a, b) => {
            if (b.popularity !== a.popularity) {
              return b.popularity - a.popularity;
            }
            return b.rating - a.rating;
          });
          isGrouped = false;
        }
      } else {
        // If no preferences set, show all games sorted by popularity and rating
        games = await Recommendation.getAllGames();
        games.sort((a, b) => {
          if (b.popularity !== a.popularity) {
            return b.popularity - a.popularity;
          }
          return b.rating - a.rating;
        });
        isGrouped = false;
      }

      // Initialize components only for store page
      const storePage = document.getElementById('store-page');
      if (storePage && !storePage.classList.contains('hidden')) {
        const gameListContainer = document.getElementById('game-list');
        if (gameListContainer) {
          this.gameList = new GameList(gameListContainer, games, isGrouped);
          console.log('GameList initialized (logged in) with personalized recommendations'); // Debug
        }
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          this.search = new Search(searchInput, this.gameList);
        }
      }
    } else {
      // User not logged in - show guest view with all popular games
      this.showGuestView();

      // Load all games sorted by popularity and rating (like Steam homepage)
      const games = await Recommendation.getAllGames();
      games.sort((a, b) => {
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }
        return b.rating - a.rating;
      });

      // Initialize components only for store page
      const storePage = document.getElementById('store-page');
      if (storePage && !storePage.classList.contains('hidden')) {
        const gameListContainer = document.getElementById('game-list');
        if (gameListContainer) {
          this.gameList = new GameList(gameListContainer, games, false);
          console.log('GameList initialized (guest) with', games.length, 'games'); // Debug
        }
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          this.search = new Search(searchInput, this.gameList);
        }
      }
    }

    // Setup navigation for all users - call after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.setupNavigation();
    }, 100);
  }

  showUserDashboard() {
    // Hide guest navigation, show user navigation
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');

    if (guestNav) guestNav.classList.add('hidden');
    if (userNav) userNav.classList.remove('hidden');
    if (userGreeting) userGreeting.textContent = `Welcome, ${this.user.username}!`;
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.logout.bind(this));
    }

    // Show user header, hide guest header
    const guestHeader = document.getElementById('guest-header');
    const userHeader = document.getElementById('user-header');
    if (guestHeader) guestHeader.classList.add('hidden');
    if (userHeader) userHeader.classList.remove('hidden');

    // Show user dashboard
    const dashboard = document.getElementById('user-dashboard');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      // Update dashboard content with badges
      const genresEl = document.getElementById('user-genres');
      const modesEl = document.getElementById('user-modes');
      if (genresEl) {
        genresEl.innerHTML = this.user.genres.map(genre => 
          `<span class="bg-[#2a475e] text-[#66c0f4] px-3 py-1 rounded-full text-sm font-medium">${genre}</span>`
        ).join('');
      }
      if (modesEl) {
        modesEl.innerHTML = this.user.modes.map(mode => 
          `<span class="bg-[#2a475e] text-[#66c0f4] px-3 py-1 rounded-full text-sm font-medium">${mode}</span>`
        ).join('');
      }
    }

    // Update cart and wishlist counts
    this.updateCartCount();
    this.updateWishlistCount();

    // Add event listeners for cart and wishlist links
    const cartLink = document.getElementById('cart-link');
    const wishlistLink = document.getElementById('wishlist-link');
    if (cartLink) {
      cartLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showCart();
      });
    }
    if (wishlistLink) {
      wishlistLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showWishlist();
      });
    }

    // Add navigation listeners
    this.setupNavigation();
  }

  setupNavigation() {
    // Setup navigation links with explicit event listeners
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Setting up navigation for', navLinks.length, 'links'); // Debug
    
    navLinks.forEach((link, index) => {
      // Remove existing event listeners by cloning
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const page = newLink.getAttribute('data-page');
        console.log('Nav link clicked:', page); // Debug
        if (page) {
          this.showPage(page);
        }
      });
    });
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

  showCart() {
    if (typeof Cart !== 'undefined') {
      const cart = new Cart();
      cart.show();
    }
  }

  showWishlist() {
    if (typeof Wishlist !== 'undefined') {
      const wishlist = new Wishlist();
      wishlist.show();
    }
  }

  showPage(page) {
    console.log('Switching to page:', page);
    
    // Hide all page sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
      section.classList.add('hidden');
    });

    // Show selected page
    const targetSection = document.getElementById(`${page}-page`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      console.log('Page shown:', page);
    } else {
      console.error('Page not found:', `${page}-page`);
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === page) {
        link.classList.remove('text-[#c7d5e0]');
        link.classList.add('text-[#66c0f4]');
      } else {
        link.classList.remove('text-[#66c0f4]');
        link.classList.add('text-[#c7d5e0]');
      }
    });

    // If switching to store page and gameList not initialized, initialize it
    if (page === 'store') {
      if (!this.gameList) {
        this.loadStoreGames();
      }
    }
    
    // If switching to library page, load library games
    if (page === 'library') {
      this.loadLibrary();
    }

    // If switching to community page, initialize community
    if (page === 'community') {
      if (typeof Community !== 'undefined' && !window.community) {
        window.community = new Community();
      } else if (window.community) {
        // Refresh community data
        window.community.loadForums();
        window.community.loadAchievements();
        window.community.loadStats();
      }
    }
  }

  loadLibrary() {
    // Load library specific to current user
    const libraryKey = this.getLibraryKey();
    const library = JSON.parse(localStorage.getItem(libraryKey) || '[]');
    const libraryContent = document.getElementById('library-content');
    const libraryCount = document.getElementById('library-count');
    
    if (libraryCount) {
      libraryCount.textContent = `${library.length} ${library.length === 1 ? 'game' : 'games'}`;
    }
    
    if (!libraryContent) return;
    
    if (library.length === 0) {
      libraryContent.innerHTML = `
        <div class="bg-[#16202d] rounded-lg p-8 border border-[#2a475e] max-w-2xl mx-auto text-center">
          <i class="fas fa-inbox text-5xl text-[#8f98a0] mb-4"></i>
          <p class="text-[#8f98a0] text-lg mb-4">No games in your library yet.</p>
          <p class="text-[#8f98a0] mb-6">Start shopping to build your collection!</p>
          <a href="#" class="nav-link inline-block bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-semibold transition-colors" data-page="store">
            <i class="fas fa-store mr-2"></i>Browse Store
          </a>
        </div>
      `;
      // Re-setup navigation for the new link
      this.setupNavigation();
    } else {
      libraryContent.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          ${library.map(item => `
            <div class="bg-[#16202d] rounded-lg overflow-hidden border border-[#2a475e] hover:border-[#66c0f4] transition-colors group cursor-pointer" data-game-id="${item.id}">
              <div class="relative">
                <img src="${item.image || 'https://via.placeholder.com/150x200?text=Game'}" 
                     alt="${item.name}" 
                     class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500">
                <div class="absolute top-2 right-2 bg-[#4c6b22] text-white px-2 py-1 rounded text-xs font-bold">
                  OWNED
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-bold text-[#c7d5e0] mb-2 group-hover:text-[#66c0f4] transition-colors line-clamp-2">${item.name}</h3>
                <p class="text-[#8f98a0] text-sm mb-3">
                  Purchased: ${new Date(item.purchaseDate).toLocaleDateString()}
                </p>
                <button class="w-full bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-4 py-2 rounded font-semibold transition-colors">
                  <i class="fas fa-play mr-2"></i>Play
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Add click handlers to view game details
      libraryContent.querySelectorAll('[data-game-id]').forEach(card => {
        card.addEventListener('click', (e) => {
          if (!e.target.closest('button')) {
            const gameId = parseInt(card.dataset.gameId);
            this.viewGameFromLibrary(gameId);
          }
        });
      });
    }
  }

  async viewGameFromLibrary(gameId) {
    try {
      const games = await Recommendation.getAllGames();
      const game = games.find(g => g.id === gameId);
      if (game && typeof GameDetail !== 'undefined') {
        const gameDetail = new GameDetail(game);
        gameDetail.show();
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  }

  async loadStoreGames() {
    const games = await Recommendation.getAllGames();
    console.log('loadStoreGames: Fetched', games.length, 'games from API'); // Debug
    
    games.sort((a, b) => {
      if (b.popularity !== a.popularity) {
        return b.popularity - a.popularity;
      }
      return b.rating - a.rating;
    });

    const gameListContainer = document.getElementById('game-list');
    if (gameListContainer) {
      // Clear any existing content
      gameListContainer.innerHTML = '';
      this.gameList = new GameList(gameListContainer, games, false);
      console.log('loadStoreGames: GameList created with', games.length, 'games'); // Debug
      
      const searchInput = document.getElementById('search-input');
      if (searchInput && !this.search) {
        this.search = new Search(searchInput, this.gameList);
      }
    }
  }

  showGuestView() {
    // Show guest navigation, hide user navigation
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');

    if (guestNav) guestNav.classList.remove('hidden');
    if (userNav) userNav.classList.add('hidden');

    // Show guest header, hide user header
    const guestHeader = document.getElementById('guest-header');
    const userHeader = document.getElementById('user-header');
    if (guestHeader) guestHeader.classList.remove('hidden');
    if (userHeader) userHeader.classList.add('hidden');

    // Hide user dashboard
    const dashboard = document.getElementById('user-dashboard');
    if (dashboard) dashboard.classList.add('hidden');

    // Setup navigation for guest users too
    this.setupNavigation();
  }

  getLibraryKey() {
    // Get library key based on current user
    if (this.user && this.user.username) {
      return `library_${this.user.username}`;
    }
    return 'library_guest';
  }

  async logout() {
    // Clear only cart and wishlist (not library - it's user-specific and should persist)
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.location.href = 'index.html';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
