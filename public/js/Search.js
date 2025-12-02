class Search {
  constructor(inputElement, gameList) {
    this.input = inputElement;
    this.gameList = gameList;
    this.init();
  }

  init() {
    this.input.addEventListener('input', this.handleSearch.bind(this));
  }

  handleSearch() {
    const query = this.input.value;
    this.gameList.filterGames(query);
  }
}
