class GameList {
  constructor(container, games) {
    this.container = container;
    this.games = games;
    this.filteredGames = [...games];
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.filteredGames.forEach(game => {
      const gameCard = document.createElement('div');
      gameCard.className = 'bg-white p-4 rounded shadow';
      gameCard.innerHTML = `
        <img src="${game.image}" alt="${game.name}" class="w-full h-48 object-cover mb-2">
        <h3 class="text-lg font-bold">${game.name}</h3>
        <p>Genres: ${game.genres.join(', ')}</p>
        <p>Modes: ${game.modes.join(', ')}</p>
        <p>Rating: ${game.rating}</p>
        <p>Popularity: ${game.popularity}</p>
      `;
      this.container.appendChild(gameCard);
    });
  }

  filterGames(query) {
    this.filteredGames = this.games.filter(game =>
      game.name.toLowerCase().includes(query.toLowerCase()) ||
      game.genres.some(g => g.toLowerCase().includes(query.toLowerCase())) ||
      game.modes.some(m => m.toLowerCase().includes(query.toLowerCase()))
    );
    this.render();
  }
}
