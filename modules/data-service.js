/**
 * Data fetching service for ebtheguy Website
 * Fetches from static JSON file (updated automatically by Google Sheets)
 */

class DataService {
  constructor() {
    this.cache = {
      data: null,
      timestamp: null
    };
    // Cache duration: 5 minutes
    this.cacheDuration = 5 * 60 * 1000;
  }

  /**
   * Check if cached data is still valid
   */
  isCacheValid() {
    if (!this.cache.data || !this.cache.timestamp) {
      return false;
    }
    const now = Date.now();
    return (now - this.cache.timestamp) < this.cacheDuration;
  }

  /**
   * Fetch all data from static JSON file (fast!)
   */
  async getAllData() {
    // Return cached data if valid
    if (this.isCacheValid()) {
      console.log('Using cached data');
      return this.cache.data;
    }

    try {
      console.log('Fetching data from static JSON file...');
      
      // Fetch from static JSON file with cache-busting
      const cacheBuster = Date.now();
      const response = await fetch(`./data/content.json?v=${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // Update cache
      this.cache.data = data;
      this.cache.timestamp = Date.now();
      
      console.log('Data fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error fetching data from JSON file:', error);
      console.log('Falling back to default data');
      return this.getDefaultData();
    }
  }

  /**
   * Get about section data
   */
  async getAboutData() {
    const data = await this.getAllData();
    return data.about || this.getDefaultData().about;
  }

  /**
   * Get blog posts
   */
  async getBlogData() {
    const data = await this.getAllData();
    return data.blog || this.getDefaultData().blog;
  }

  /**
   * Get music players data
   */
  async getMusicPlayersData() {
    const data = await this.getAllData();
    return data.musicPlayers || this.getDefaultData().musicPlayers;
  }

  /**
   * Default/fallback data when JSON is unavailable
   */
  getDefaultData() {
    return {
      about: {
        showWelcomeOnLoad: true,
        window1: {
          title: "Message box",
          message: "This is a short about section for ethan's audio production website. Who knows what will be written here? It could be long, or short - but not too long.",
          welcomeText: "Welcome!"
        },
        window2: {
          title: "Contact",
          email: "myemail@email.com",
          contact: "another-contact-field",
          buttons: [
            {
              text: "Link here",
              url: "https://example.com/link1"
            },
            {
              text: "Spotify",
              url: "https://open.spotify.com/artist/your-artist-id"
            }
          ]
        }
      },
      blog: [
        {
          title: "First Post",
          body: "This is the body content of the first blog post.",
          year: "2026",
          month: "01",
          date: "11",
          time: "12:00"
        }
      ],
      musicPlayers: [
        {
          artist: "Murdock Street",
          albums: [
            {
              title: "Basement Candy - EP",
              displayName: "Basement-Candy.wav",
              icon: "cd.png",
              position: {
                top: "15%",
                right: "90%"
              }
            },
            {
              title: "Ode to You",
              displayName: "Ode-to-You.wav",
              icon: "cd.png",
              position: {
                top: "75%",
                right: "10%"
              }
            }
          ]
        },
        {
          artist: "Lokadonna",
          albums: [
            {
              title: "code:GRĖĖN (feat. Prod.eb) - EP",
              displayName: "code:GREEN.wav",
              icon: "cd.png",
              position: {
                top: "20%",
                right: "20%"
              }
            }
          ]
        },
        {
          artist: "tsunamë",
          albums: [
            {
              title: "99 Side A",
              displayName: "99 Side A.wav",
              icon: "cd.png",
              position: {
                top: "50%",
                right: "50%"
              }
            }
          ]
        }
      ],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear the cache (useful for forcing a refresh)
   */
  clearCache() {
    this.cache.data = null;
    this.cache.timestamp = null;
  }
}

// Create global instance
window.dataService = new DataService();
