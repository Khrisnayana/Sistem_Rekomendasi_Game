class Recommendation {
  static async getAllGames() {
    const response = await fetch('/api/games');
    return response.json();
  }

  static async getRecommendations(user) {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genres: user.genres, modes: user.modes })
    });
    return response.json();
  }
}
