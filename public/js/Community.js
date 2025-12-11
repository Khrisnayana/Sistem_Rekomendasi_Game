class Community {
  constructor() {
    this.posts = JSON.parse(localStorage.getItem('community_posts') || '[]');
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupPostModal();
    this.updateCreatePostButton();
    this.loadForums();
    this.loadAchievements();
    this.loadStats();
  }

  updateCreatePostButton() {
    const createPostBtn = document.getElementById('create-post-btn');
    if (createPostBtn) {
      if (!this.isLoggedIn()) {
        createPostBtn.innerHTML = '<i class="fas fa-lock mr-2"></i>Login to Post';
        createPostBtn.classList.remove('bg-[#5c7e10]', 'hover:bg-[#6e8f1a]');
        createPostBtn.classList.add('bg-[#2a475e]', 'hover:bg-[#3a5a7e]');
      } else {
        createPostBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>New Post';
        createPostBtn.classList.remove('bg-[#2a475e]', 'hover:bg-[#3a5a7e]');
        createPostBtn.classList.add('bg-[#5c7e10]', 'hover:bg-[#6e8f1a]');
      }
    }
  }

  setupTabs() {
    const tabs = document.querySelectorAll('.community-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => {
          t.classList.remove('active', 'text-[#66c0f4]', 'border-b-2', 'border-[#66c0f4]');
          t.classList.add('text-[#c7d5e0]');
        });
        tab.classList.add('active', 'text-[#66c0f4]', 'border-b-2', 'border-[#66c0f4]');
        tab.classList.remove('text-[#c7d5e0]');
        
        // Show corresponding content
        document.querySelectorAll('.community-tab-content').forEach(content => {
          content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');
      });
    });
  }

  setupPostModal() {
    const createPostBtn = document.getElementById('create-post-btn');
    const closeModalBtn = document.getElementById('close-post-modal');
    const cancelBtn = document.getElementById('cancel-post-btn');
    const modal = document.getElementById('create-post-modal');
    const form = document.getElementById('post-form');

    if (createPostBtn) {
      createPostBtn.addEventListener('click', () => {
        if (!this.isLoggedIn()) {
          this.showNotification('Please login to create a post', 'error');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
          return;
        }
        this.loadGamesForPost();
        modal.classList.remove('hidden');
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createPost();
      });
    }
  }

  async loadGamesForPost() {
    const select = document.getElementById('post-game');
    if (!select) return;

    try {
      const games = await Recommendation.getAllGames();
      select.innerHTML = '<option value="">Select a game...</option>';
      games.slice(0, 20).forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.name;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Error loading games:', error);
    }
  }

  isLoggedIn() {
    const user = window.app?.user;
    return user && user.username && user.username !== 'Guest';
  }

  async createPost() {
    if (!this.isLoggedIn()) {
      this.showNotification('Please login to create a post', 'error');
      const modal = document.getElementById('create-post-modal');
      if (modal) modal.classList.add('hidden');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const gameId = document.getElementById('post-game').value;
    const modal = document.getElementById('create-post-modal');
    const form = document.getElementById('post-form');

    if (!title || !content) {
      alert('Please fill in all required fields');
      return;
    }

    const user = window.app?.user;
    const game = gameId ? await this.getGameById(parseInt(gameId)) : null;

    const post = {
      id: Date.now(),
      title,
      content,
      author: user.username,
      gameId: gameId ? parseInt(gameId) : null,
      gameName: game ? game.name : null,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    this.posts.unshift(post);
    localStorage.setItem('community_posts', JSON.stringify(this.posts));
    
    modal.classList.add('hidden');
    form.reset();
    this.loadForums();
    this.showNotification('Post created successfully!', 'success');
  }

  async getGameById(id) {
    try {
      const games = await Recommendation.getAllGames();
      return games.find(g => g.id === id);
    } catch (error) {
      return null;
    }
  }

  loadForums() {
    const container = document.getElementById('forum-posts');
    if (!container) return;

    // Ensure all posts have comments array
    this.posts.forEach(post => {
      if (!post.comments) {
        post.comments = [];
      }
      if (post.likes === undefined) {
        post.likes = 0;
      }
    });

    if (this.posts.length === 0) {
      if (!this.isLoggedIn()) {
        container.innerHTML = `
          <div class="bg-[#16202d] rounded-lg p-12 border border-[#2a475e] text-center">
            <i class="fas fa-lock text-5xl text-[#8f98a0] mb-4"></i>
            <p class="text-[#8f98a0] text-lg mb-4">Please login to view and create forum posts</p>
            <a href="login.html" class="inline-block bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-semibold transition-colors">
              <i class="fas fa-sign-in-alt mr-2"></i>Login
            </a>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="bg-[#16202d] rounded-lg p-12 border border-[#2a475e] text-center">
            <i class="fas fa-comments text-5xl text-[#8f98a0] mb-4"></i>
            <p class="text-[#8f98a0] text-lg mb-4">No posts yet. Be the first to start a discussion!</p>
            <button id="create-first-post" class="bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-semibold transition-colors">
              <i class="fas fa-plus mr-2"></i>Create First Post
            </button>
          </div>
        `;
        const createFirstBtn = document.getElementById('create-first-post');
        if (createFirstBtn) {
          createFirstBtn.addEventListener('click', () => {
            document.getElementById('create-post-btn')?.click();
          });
        }
      }
      return;
    }

    container.innerHTML = this.posts.map(post => {
      const date = new Date(post.timestamp);
      const timeAgo = this.getTimeAgo(date);
      const commentsHtml = this.renderComments(post.comments || []);
      
      return `
        <div class="bg-[#16202d] rounded-lg p-6 border border-[#2a475e] hover:border-[#66c0f4] transition-colors" data-post-id="${post.id}">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h4 class="text-xl font-bold text-[#c7d5e0] mr-3">${this.escapeHtml(post.title)}</h4>
                ${post.gameName ? `<span class="bg-[#2a475e] text-[#66c0f4] px-3 py-1 rounded text-sm font-medium">${this.escapeHtml(post.gameName)}</span>` : ''}
              </div>
              <div class="flex items-center text-[#8f98a0] text-sm">
                <i class="fas fa-user mr-2"></i>
                <span class="font-semibold text-[#c7d5e0]">${this.escapeHtml(post.author)}</span>
                <span class="mx-2">•</span>
                <i class="fas fa-clock mr-2"></i>
                <span>${timeAgo}</span>
              </div>
            </div>
          </div>
          <p class="text-[#c7d5e0] mb-4 whitespace-pre-wrap">${this.escapeHtml(post.content)}</p>
          <div class="flex items-center justify-between pt-4 border-t border-[#2a475e]">
            <div class="flex items-center space-x-6">
              <button class="like-post-btn flex items-center text-[#8f98a0] hover:text-[#66c0f4] transition-colors" data-post-id="${post.id}">
                <i class="fas fa-heart mr-2"></i>
                <span>${post.likes || 0}</span>
              </button>
              <button class="toggle-comments-btn flex items-center text-[#8f98a0] hover:text-[#66c0f4] transition-colors" data-post-id="${post.id}">
                <i class="fas fa-comment mr-2"></i>
                <span>${(post.comments || []).length}</span>
              </button>
            </div>
            ${post.gameId ? `
              <button class="view-game-btn bg-[#2a475e] hover:bg-[#3a5a7e] text-[#c7d5e0] px-4 py-2 rounded text-sm font-semibold transition-colors" data-game-id="${post.gameId}">
                View Game
              </button>
            ` : ''}
          </div>
          
          <!-- Comments Section -->
          <div class="comments-section hidden mt-4 pt-4 border-t border-[#2a475e]" data-post-id="${post.id}">
            ${commentsHtml}
            <!-- Comment Form -->
            ${this.isLoggedIn() ? `
              <div class="mt-4">
                <textarea class="comment-input w-full px-4 py-3 bg-[#1b2838] border border-[#2a475e] rounded-lg text-[#c7d5e0] focus:outline-none focus:ring-2 focus:ring-[#66c0f4] resize-none" 
                          rows="3" 
                          placeholder="Write a comment..." 
                          data-post-id="${post.id}"></textarea>
                <div class="flex justify-end mt-2">
                  <button class="submit-comment-btn bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-2 rounded font-semibold transition-colors flex items-center" data-post-id="${post.id}">
                    <i class="fas fa-paper-plane mr-2"></i>Post Comment
                  </button>
                </div>
              </div>
            ` : `
              <div class="mt-4 bg-[#1b2838] rounded-lg p-6 border border-[#2a475e] text-center">
                <i class="fas fa-lock text-3xl text-[#8f98a0] mb-3"></i>
                <p class="text-[#8f98a0] mb-4">Please login to add a comment</p>
                <a href="login.html" class="inline-block bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-2 rounded font-semibold transition-colors">
                  <i class="fas fa-sign-in-alt mr-2"></i>Login
                </a>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners
    container.querySelectorAll('.like-post-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = parseInt(btn.dataset.postId);
        this.likePost(postId);
      });
    });

    container.querySelectorAll('.toggle-comments-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = parseInt(btn.dataset.postId);
        this.toggleComments(postId);
      });
    });

    container.querySelectorAll('.submit-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = parseInt(btn.dataset.postId);
        this.submitComment(postId);
      });
    });

    // Allow Enter key to submit comment (Ctrl+Enter or Shift+Enter)
    container.querySelectorAll('.comment-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey)) {
          e.preventDefault();
          const postId = parseInt(input.dataset.postId);
          this.submitComment(postId);
        }
      });
    });

    container.querySelectorAll('.view-game-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const gameId = parseInt(btn.dataset.gameId);
        const game = await this.getGameById(gameId);
        if (game && typeof GameDetail !== 'undefined') {
          const gameDetail = new GameDetail(game);
          gameDetail.show();
        }
      });
    });
  }

  renderComments(comments) {
    if (!comments || comments.length === 0) {
      return '<p class="text-[#8f98a0] text-sm mb-4">No comments yet. Be the first to comment!</p>';
    }

    return `
      <div class="space-y-4 mb-4">
        ${comments.map(comment => {
          const date = new Date(comment.timestamp);
          const timeAgo = this.getTimeAgo(date);
          return `
            <div class="bg-[#1b2838] rounded-lg p-4 border border-[#2a475e]">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full bg-[#2a475e] flex items-center justify-center mr-3">
                    <i class="fas fa-user text-[#66c0f4]"></i>
                  </div>
                  <div>
                    <span class="font-semibold text-[#c7d5e0]">${this.escapeHtml(comment.author)}</span>
                    <span class="text-[#8f98a0] text-xs ml-2">${timeAgo}</span>
                  </div>
                </div>
              </div>
              <p class="text-[#c7d5e0] whitespace-pre-wrap ml-11">${this.escapeHtml(comment.content)}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  toggleComments(postId) {
    if (!this.isLoggedIn()) {
      this.showNotification('Please login to view and add comments', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;

    const commentsSection = postElement.querySelector('.comments-section');
    if (!commentsSection) return;

    const isHidden = commentsSection.classList.contains('hidden');
    
    if (isHidden) {
      commentsSection.classList.remove('hidden');
      // Focus on comment input
      const commentInput = commentsSection.querySelector('.comment-input');
      if (commentInput) {
        setTimeout(() => commentInput.focus(), 100);
      }
    } else {
      commentsSection.classList.add('hidden');
    }
  }

  submitComment(postId) {
    if (!this.isLoggedIn()) {
      this.showNotification('Please login to comment', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (!postElement) return;

    const commentInput = postElement.querySelector('.comment-input');
    if (!commentInput) return;

    const content = commentInput.value.trim();
    if (!content) {
      this.showNotification('Please enter a comment', 'error');
      return;
    }

    const user = window.app?.user;
    const post = this.posts.find(p => p.id === postId);
    
    if (!post) return;

    if (!post.comments) {
      post.comments = [];
    }

    const comment = {
      id: Date.now(),
      author: user.username,
      content: content,
      timestamp: new Date().toISOString()
    };

    post.comments.push(comment);
    localStorage.setItem('community_posts', JSON.stringify(this.posts));
    
    // Clear input
    commentInput.value = '';
    
    // Reload forums to show new comment
    this.loadForums();
    
    // Keep comments section open
    setTimeout(() => {
      const commentsSection = postElement.querySelector('.comments-section');
      if (commentsSection) {
        commentsSection.classList.remove('hidden');
      }
    }, 100);

    this.showNotification('Comment posted successfully!', 'success');
  }

  likePost(postId) {
    if (!this.isLoggedIn()) {
      this.showNotification('Please login to like posts', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.likes++;
      localStorage.setItem('community_posts', JSON.stringify(this.posts));
      this.loadForums();
    }
  }

  loadAchievements() {
    const container = document.getElementById('achievements-list');
    if (!container) return;

    if (!this.isLoggedIn()) {
      container.innerHTML = `
        <div class="col-span-full bg-[#16202d] rounded-lg p-12 border border-[#2a475e] text-center">
          <i class="fas fa-lock text-5xl text-[#8f98a0] mb-4"></i>
          <p class="text-[#8f98a0] text-lg mb-4">Please login to view your achievements</p>
          <a href="login.html" class="inline-block bg-[#5c7e10] hover:bg-[#6e8f1a] text-white px-6 py-3 rounded font-semibold transition-colors">
            <i class="fas fa-sign-in-alt mr-2"></i>Login
          </a>
        </div>
      `;
      return;
    }

    const user = window.app?.user;
    const library = JSON.parse(localStorage.getItem(`library_${user.username}`) || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const posts = this.posts.filter(p => p.author === user.username);

    const achievements = [
      {
        id: 1,
        name: 'First Steps',
        description: 'Create your account',
        icon: 'fa-user-plus',
        unlocked: user.username !== 'Guest',
        color: '#66c0f4'
      },
      {
        id: 2,
        name: 'Game Collector',
        description: 'Own 5 games',
        icon: 'fa-gamepad',
        unlocked: library.length >= 5,
        color: '#4c6b22',
        progress: library.length,
        target: 5
      },
      {
        id: 3,
        name: 'Wishful Thinker',
        description: 'Add 10 games to wishlist',
        icon: 'fa-heart',
        unlocked: wishlist.length >= 10,
        color: '#b84040',
        progress: wishlist.length,
        target: 10
      },
      {
        id: 4,
        name: 'Social Butterfly',
        description: 'Create 5 forum posts',
        icon: 'fa-comments',
        unlocked: posts.length >= 5,
        color: '#66c0f4',
        progress: posts.length,
        target: 5
      },
      {
        id: 5,
        name: 'Shopping Spree',
        description: 'Add 10 items to cart',
        icon: 'fa-shopping-cart',
        unlocked: cart.length >= 10,
        color: '#5c7e10',
        progress: cart.length,
        target: 10
      },
      {
        id: 6,
        name: 'Veteran Gamer',
        description: 'Own 20 games',
        icon: 'fa-trophy',
        unlocked: library.length >= 20,
        color: '#ffd700',
        progress: library.length,
        target: 20
      }
    ];

    container.innerHTML = achievements.map(achievement => {
      const progressBar = achievement.progress !== undefined ? `
        <div class="mt-3">
          <div class="flex justify-between text-sm text-[#8f98a0] mb-1">
            <span>Progress</span>
            <span>${achievement.progress}/${achievement.target}</span>
          </div>
          <div class="bg-[#2a475e] rounded-full h-2">
            <div class="bg-[#66c0f4] h-2 rounded-full transition-all duration-500" style="width: ${Math.min((achievement.progress / achievement.target) * 100, 100)}%"></div>
          </div>
        </div>
      ` : '';

      return `
        <div class="bg-[#16202d] rounded-lg p-6 border border-[#2a475e] ${achievement.unlocked ? 'border-[#4c6b22]' : ''} transition-colors">
          <div class="flex items-start mb-4">
            <div class="flex-shrink-0">
              <div class="w-16 h-16 rounded-full flex items-center justify-center ${achievement.unlocked ? 'bg-[#4c6b22]' : 'bg-[#2a475e]'} transition-colors">
                <i class="fas ${achievement.icon} text-2xl ${achievement.unlocked ? 'text-white' : 'text-[#8f98a0]'}"></i>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <h4 class="text-lg font-bold ${achievement.unlocked ? 'text-[#c7d5e0]' : 'text-[#8f98a0]'} mb-1">
                ${this.escapeHtml(achievement.name)}
                ${achievement.unlocked ? '<i class="fas fa-check-circle text-[#4c6b22] ml-2"></i>' : ''}
              </h4>
              <p class="text-[#8f98a0] text-sm">${this.escapeHtml(achievement.description)}</p>
              ${progressBar}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async loadStats() {
    // Load total games
    try {
      const games = await Recommendation.getAllGames();
      const totalGamesEl = document.getElementById('total-games');
      if (totalGamesEl) totalGamesEl.textContent = games.length;
    } catch (error) {
      console.error('Error loading games:', error);
    }

    // Load total users (simulated)
    const totalUsersEl = document.getElementById('total-users');
    if (totalUsersEl) totalUsersEl.textContent = '1,234';

    // Load total posts
    const totalPostsEl = document.getElementById('total-posts');
    if (totalPostsEl) totalPostsEl.textContent = this.posts.length;

    // Load total purchases (from all libraries)
    let totalPurchases = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('library_')) {
        const library = JSON.parse(localStorage.getItem(key) || '[]');
        totalPurchases += library.length;
      }
    }
    const totalPurchasesEl = document.getElementById('total-purchases');
    if (totalPurchasesEl) totalPurchasesEl.textContent = totalPurchases;

    // Load top games
    await this.loadTopGames();

    // Load recent activity
    this.loadRecentActivity();
  }

  async loadTopGames() {
    const container = document.getElementById('top-games-list');
    if (!container) return;

    try {
      const games = await Recommendation.getAllGames();
      const topGames = games
        .sort((a, b) => {
          if (b.popularity !== a.popularity) return b.popularity - a.popularity;
          return b.rating - a.rating;
        })
        .slice(0, 5);

      container.innerHTML = topGames.map((game, index) => `
        <div class="flex items-center justify-between p-3 bg-[#1b2838] rounded border border-[#2a475e] hover:border-[#66c0f4] transition-colors">
          <div class="flex items-center space-x-4">
            <span class="text-2xl font-bold text-[#66c0f4] w-8">${index + 1}</span>
            <div class="flex-1">
              <h5 class="font-semibold text-[#c7d5e0]">${this.escapeHtml(game.name)}</h5>
              <div class="flex items-center space-x-3 mt-1">
                <span class="text-yellow-400 text-sm">
                  <i class="fas fa-star"></i> ${game.rating.toFixed(1)}
                </span>
                <span class="text-[#8f98a0] text-sm">
                  <i class="fas fa-fire"></i> ${game.popularity}%
                </span>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading top games:', error);
    }
  }

  loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    const activities = [];
    
    // Add recent posts
    this.posts.slice(0, 5).forEach(post => {
      activities.push({
        type: 'post',
        text: `${post.author} created a post: "${post.title}"`,
        timestamp: new Date(post.timestamp),
        icon: 'fa-comments',
        color: '#66c0f4'
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);

    if (activities.length === 0) {
      container.innerHTML = '<p class="text-[#8f98a0] text-center py-4">No recent activity</p>';
      return;
    }

    container.innerHTML = activities.slice(0, 10).map(activity => {
      const timeAgo = this.getTimeAgo(activity.timestamp);
      return `
        <div class="flex items-center space-x-4 p-3 bg-[#1b2838] rounded border border-[#2a475e]">
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: ${activity.color}20; border: 1px solid ${activity.color}">
              <i class="fas ${activity.icon} text-lg" style="color: ${activity.color}"></i>
            </div>
          </div>
          <div class="flex-1">
            <p class="text-[#c7d5e0] text-sm">${this.escapeHtml(activity.text)}</p>
            <p class="text-[#8f98a0] text-xs mt-1">${timeAgo}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'success') {
    const colors = {
      success: 'bg-[#4c6b22]',
      error: 'bg-[#b84040]'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-[100] flex items-center space-x-3`;
    notification.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
      <span class="font-semibold">${message}</span>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
}

// Community will be initialized by app.js when switching to community page

