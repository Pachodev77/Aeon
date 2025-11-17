export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

export class PlaylistManager {
  private songs: Song[] = [];
  private currentSongIndex: number = 0;

  async loadSongsFromMusicFolder(): Promise<Song[]> {
    try {
      // Real songs from the music folder
      const realSongs: Song[] = [
        {
          id: '1',
          title: '12 (Extended Mix)',
          artist: 'Unknown',
          duration: 0,
          url: '/music/12 (Extended Mix).mp3'
        },
        {
          id: '2',
          title: '6 For 6',
          artist: 'Central Cee',
          duration: 0,
          url: '/music/Central Cee - 6 For 6.mp3'
        },
        {
          id: '3',
          title: 'Esquelefascina (Vol. 3) Aleteo, Zapateo & Guaracha',
          artist: 'DJ DASTEN',
          duration: 0,
          url: '/music/DJ DASTEN - Esquelefascina (Vol. 3) Aleteo, Zapateo & Guaracha.mp3'
        },
        {
          id: '4',
          title: 'Gangsta Track feat. Tupac & 50 Cent',
          artist: 'Dark Boy',
          duration: 0,
          url: '/music/Dark Boy - Gangsta Track feat. Tupac & 50 Cent.mp3'
        },
        {
          id: '5',
          title: 'Deseo que sanes de todo aquello que no hablas con nadie',
          artist: 'House LiveSet Fumaratto 2020',
          duration: 0,
          url: '/music/Deseo que sanes de todo aquello que no hablas con nadie - House LiveSet Fumaratto 2020 (1).mp3'
        },
        {
          id: '6',
          title: 'Sem Você Sou Ninguém (Full Version)',
          artist: 'Mandragora',
          duration: 0,
          url: '/music/Mandragora - Sem Você Sou Ninguém (Full Version).mp3'
        },
        {
          id: '7',
          title: 'Maison Margiela',
          artist: 'Migos',
          duration: 0,
          url: '/music/Migos - Maison Margiela.mp3'
        },
        {
          id: '8',
          title: 'Real Gangstaz ft. Lil Jon',
          artist: 'Mobb Deep',
          duration: 0,
          url: '/music/Mobb Deep - Real Gangstaz ft. Lil Jon.mp3'
        },
        {
          id: '9',
          title: 'Sittin Sidewayz ft. Big Pokey',
          artist: 'Paul Wall',
          duration: 0,
          url: '/music/Paul Wall - Sittin Sidewayz ft. Big Pokey.mp3'
        },
        {
          id: '10',
          title: 'Aim For The Moon',
          artist: 'Pop Smoke',
          duration: 0,
          url: '/music/Pop Smoke - Aim For The Moon.mp3'
        },
        {
          id: '11',
          title: 'Plug Walk (Audio)',
          artist: 'Rich The Kid',
          duration: 0,
          url: '/music/Rich The Kid - Plug Walk (Audio).mp3'
        },
        {
          id: '12',
          title: 'Canarsie',
          artist: 'Russ Millions x Fivio Foreign',
          duration: 0,
          url: '/music/Russ Millions x Fivio Foreign - Canarsie.mp3'
        },
        {
          id: '13',
          title: 'animal_rap_(ft._kool_g._rap)',
          artist: 'Unknown',
          duration: 0,
          url: '/music/animal_rap_(ft._kool_g._rap).mp3'
        },
        {
          id: '14',
          title: 'questions',
          artist: 'ap.9',
          duration: 0,
          url: '/music/ap.9-questions.mp3'
        }
      ];
      
      this.songs = realSongs;
      return this.songs;
    } catch (error) {
      console.error('Error loading songs:', error);
      return [];
    }
  }

  getSongs(): Song[] {
    return this.songs;
  }

  getCurrentSong(): Song | null {
    return this.songs[this.currentSongIndex] || null;
  }

  setCurrentSongIndex(index: number): void {
    if (index >= 0 && index < this.songs.length) {
      this.currentSongIndex = index;
    }
  }

  getNextSong(): Song | null {
    const nextIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.currentSongIndex = nextIndex;
    return this.getCurrentSong();
  }

  getPreviousSong(): Song | null {
    const prevIndex = this.currentSongIndex === 0 ? this.songs.length - 1 : this.currentSongIndex - 1;
    this.currentSongIndex = prevIndex;
    return this.getCurrentSong();
  }
}
