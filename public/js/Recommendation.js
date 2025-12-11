class Recommendation {
  static async getAllGames() {
    try {
      const response = await fetch('/api/games');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const games = await response.json();
      console.log('Recommendation.getAllGames: Received', games.length, 'games from server');
      return games;
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  static async getRecommendations(user) {
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genres: user.genres, modes: user.modes })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Return as object with categories (like Steam)
      return data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return {};
    }
  }
}
