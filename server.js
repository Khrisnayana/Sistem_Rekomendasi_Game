const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./db');

// Create sample user accounts for testing
function createSampleUsers() {
  const sampleUsers = [
    {
      username: 'gamer123',
      password: 'password123',
      genres: 'Action,RPG,Adventure',
      modes: 'Single-player,Multiplayer'
    },
    {
      username: 'steamfan',
      password: 'steam123',
      genres: 'Strategy,Simulation,Indie',
      modes: 'Single-player,Co-op'
    },
    {
      username: 'casualplayer',
      password: 'casual123',
      genres: 'Party,Casual,Sports',
      modes: 'Multiplayer,Online'
    },
    {
      username: 'rpglover',
      password: 'rpg123',
      genres: 'RPG,Fantasy,Adventure',
      modes: 'Single-player'
    },
    {
      username: 'competitor',
      password: 'compete123',
      genres: 'Action,Strategy,Shooter',
      modes: 'Multiplayer,Competitive'
    }
  ];

  // Check if users already exist
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err) {
      console.error('Error checking users:', err);
      return;
    }

    if (row.count === 0) {
      console.log('Creating sample user accounts...');
      const stmt = db.prepare("INSERT INTO users (username, password, genres, modes) VALUES (?, ?, ?, ?)");

      sampleUsers.forEach(user => {
        stmt.run(user.username, user.password, user.genres, user.modes);
      });

      stmt.finalize();
      console.log('Sample user accounts created successfully!');
      console.log('\nAvailable test accounts:');
      sampleUsers.forEach(user => {
        console.log(`Username: ${user.username}, Password: ${user.password}, Genres: ${user.genres}`);
      });
    }
  });
}

const app = express();
const DEFAULT_PORT = 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'game-recommendation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(express.static('public'));

// API Endpoints
app.get('/api/games', (req, res) => {
  db.all("SELECT * FROM games", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Convert genres and modes from comma-separated strings to arrays
    const games = rows.map(game => ({
      ...game,
      genres: game.genres.split(','),
      modes: game.modes.split(',')
    }));
    res.json(games);
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, genres, modes } = req.body;
  if (!username || !password || !Array.isArray(genres) || !Array.isArray(modes) || genres.length === 0 || modes.length === 0) {
    return res.json({ success: false, message: 'Invalid payload' });
  }
  const genresStr = genres.join(',');
  const modesStr = modes.join(',');

  db.run("INSERT INTO users (username, password, genres, modes) VALUES (?, ?, ?, ?)",
    [username, password, genresStr, modesStr], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.json({ success: false, message: 'Username already exists' });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({ success: true, userId: this.lastID });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    if (row) {
      req.session.userId = row.id;
      req.session.username = row.username;
      req.session.genres = row.genres.split(',');
      req.session.modes = row.modes.split(',');
      res.json({ success: true, user: { username: row.username, genres: req.session.genres, modes: req.session.modes } });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

app.get('/api/session', (req, res) => {
  if (req.session.userId) {
    res.json({
      loggedIn: true,
      user: {
        username: req.session.username,
        genres: req.session.genres,
        modes: req.session.modes
      }
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.post('/api/recommend', (req, res) => {
  const { genres, modes } = req.body;
  const g = Array.isArray(genres) ? genres : [];
  const m = Array.isArray(modes) ? modes : [];
  
  if (g.length === 0 && m.length === 0) {
    return res.json({});
  }

  // Get all games that match user preferences
  const conditions = [];
  const params = [];
  
  if (g.length > 0) {
    const genreConditions = g.map(() => 'genres LIKE ?').join(' OR ');
    conditions.push(`(${genreConditions})`);
    params.push(...g.map(genre => `%${genre}%`));
  }
  
  if (m.length > 0) {
    const modeConditions = m.map(() => 'modes LIKE ?').join(' OR ');
    conditions.push(`(${modeConditions})`);
    params.push(...m.map(mode => `%${mode}%`));
  }
  
  const whereClause = conditions.length > 0 ? conditions.join(' OR ') : '1=0';
  
  const query = `
    SELECT * FROM games
    WHERE ${whereClause}
    ORDER BY popularity DESC, rating DESC
  `;

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Convert genres and modes to arrays
    const allGames = rows.map(game => ({
      ...game,
      genres: game.genres.split(','),
      modes: game.modes.split(',')
    }));

    // Group games by genre category (prioritizing user's preferred genres)
    const gamesByCategory = {};
    
    // For each user's preferred genre, get top games
    g.forEach(userGenre => {
      const categoryGames = allGames
        .filter(game => game.genres.some(genre => genre.trim() === userGenre.trim()))
        .sort((a, b) => {
          // Sort by popularity first, then rating
          if (b.popularity !== a.popularity) {
            return b.popularity - a.popularity;
          }
          return b.rating - a.rating;
        });
        // Removed slice limit to show all games
      
      if (categoryGames.length > 0) {
        gamesByCategory[userGenre] = categoryGames;
      }
    });

    // If no games found for preferred genres, try modes
    if (Object.keys(gamesByCategory).length === 0) {
      m.forEach(userMode => {
        const categoryGames = allGames
          .filter(game => game.modes.some(mode => mode.trim() === userMode.trim()))
          .sort((a, b) => {
            if (b.popularity !== a.popularity) {
              return b.popularity - a.popularity;
            }
            return b.rating - a.rating;
          });
          // Removed slice limit to show all games
        
        if (categoryGames.length > 0) {
          gamesByCategory[userMode] = categoryGames;
        }
      });
    }

    res.json(gamesByCategory);
  });
});

const preferredPort = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
function listen(port) {
  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`Server running on http://localhost:${actualPort}`);
    createSampleUsers();
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      listen(port + 1);
    } else {
      throw err;
    }
  });
}
listen(preferredPort);
