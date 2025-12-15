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
      // Real songs from the music folder (now in public folder)
      const realSongs: Song[] = [
        {
          id: '1',
          title: '12 (Extended Mix)',
          artist: 'Unknown',
          duration: 0,
          url: '/12 (Extended Mix).mp3'
        },
        {
          id: '2',
          title: '6 For 6',
          artist: 'Central Cee',
          duration: 0,
          url: '/Central Cee - 6 For 6.mp3'
        },
        {
          id: '3',
          title: 'Esquelefascina (Vol. 3) Aleteo, Zapateo & Guaracha',
          artist: 'DJ DASTEN',
          duration: 0,
          url: '/DJ DASTEN - Esquelefascina (Vol. 3) Aleteo, Zapateo & Guaracha.mp3'
        },
        {
          id: '4',
          title: 'Gangsta Track feat. Tupac & 50 Cent',
          artist: 'Dark Boy',
          duration: 0,
          url: '/Dark Boy - Gangsta Track feat. Tupac & 50 Cent.mp3'
        },
        {
          id: '5',
          title: 'Deseo que sanes de todo aquello que no hablas con nadie',
          artist: 'House LiveSet Fumaratto 2020',
          duration: 0,
          url: '/Deseo que sanes de todo aquello que no hablas con nadie - House LiveSet Fumaratto 2020 (1).mp3'
        },
        {
          id: '6',
          title: 'Sem Você Sou Ninguém (Full Version)',
          artist: 'Mandragora',
          duration: 0,
          url: '/Mandragora - Sem Você Sou Ninguém (Full Version).mp3'
        },
        {
          id: '7',
          title: 'Maison Margiela',
          artist: 'Migos',
          duration: 0,
          url: '/Migos - Maison Margiela.mp3'
        },
        {
          id: '8',
          title: 'Real Gangstaz ft. Lil Jon',
          artist: 'Mobb Deep',
          duration: 0,
          url: '/Mobb Deep - Real Gangstaz ft. Lil Jon.mp3'
        },
        {
          id: '9',
          title: 'Sittin Sidewayz ft. Big Pokey',
          artist: 'Paul Wall',
          duration: 0,
          url: '/Paul Wall - Sittin Sidewayz ft. Big Pokey.mp3'
        },
        {
          id: '10',
          title: 'Aim For The Moon',
          artist: 'Pop Smoke',
          duration: 0,
          url: '/Pop Smoke - Aim For The Moon.mp3'
        },
        {
          id: '11',
          title: 'Plug Walk (Audio)',
          artist: 'Rich The Kid',
          duration: 0,
          url: '/Rich The Kid - Plug Walk (Audio).mp3'
        },
        {
          id: '12',
          title: 'Canarsie',
          artist: 'Russ Millions x Fivio Foreign',
          duration: 0,
          url: '/Russ Millions x Fivio Foreign - Canarsie.mp3'
        },
        {
          id: '13',
          title: 'animal_rap_(ft._kool_g._rap)',
          artist: 'Unknown',
          duration: 0,
          url: '/animal_rap_(ft._kool_g._rap).mp3'
        },
        {
          id: '14',
          title: 'questions',
          artist: 'ap.9',
          duration: 0,
          url: '/ap.9-questions.mp3'
        }
      ];
      
      this.songs = realSongs;
      return this.songs;
    } catch (error) {
      console.error('Error loading songs:', error);
      return [];
    }
  }

  // Helper method to recursively get all audio files from a directory
  private async getAudioFilesFromDirectory(dirHandle: any): Promise<FileSystemFileHandle[]> {
    const audioFiles: FileSystemFileHandle[] = [];
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
    
    // Get all entries in the directory
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        const name = entry.name.toLowerCase();
        if (audioExtensions.some(ext => name.endsWith(ext))) {
          audioFiles.push(entry);
        }
      } else if (entry.kind === 'directory') {
        // Recursively get files from subdirectories
        const subDirFiles = await this.getAudioFilesFromDirectory(entry);
        audioFiles.push(...subDirFiles);
      }
    }
    return audioFiles;
  }

  async loadLocalDeviceSongs(): Promise<Song[]> {
    try {
      this.songs = [];
      
      // Check if the browser supports the File System Access API
      if ('showDirectoryPicker' in window) {
        try {
          // Request directory access
          const directoryHandle = await (window as any).showDirectoryPicker({
            id: 'musicFolder',
            mode: 'read',
            startIn: 'music'
          });

          console.log('Directory access granted, scanning for audio files...');
          
          // Get all audio files from the directory
          const audioFiles = await this.getAudioFilesFromDirectory(directoryHandle);
          console.log(`Found ${audioFiles.length} audio files`);
          
          if (audioFiles.length === 0) {
            console.warn('No audio files found in the selected directory');
            return [];
          }
          
          const localSongs: Song[] = [];
          
          // Process each audio file
          for (const file of audioFiles) {
            try {
              const fileHandle = await file.getFile();
              
              // Create a unique ID for the song
              const songId = `local-${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9-_]/g, '_');
              
              // Extract artist and title from filename (format: "Artist - Title")
              const fileName = file.name.replace(/\.[^/.]+$/, '');
              let artist = 'Unknown Artist';
              let title = fileName;
              
              // Try to extract artist and title if in "Artist - Title" format
              const artistTitleMatch = fileName.match(/^(.+?)\s*-\s*(.+)$/);
              if (artistTitleMatch && artistTitleMatch.length === 3) {
                artist = artistTitleMatch[1].trim();
                title = artistTitleMatch[2].trim();
              }
              
              // Create object URL for the file
              const objectUrl = URL.createObjectURL(fileHandle);
              
              console.log(`Added song: ${artist} - ${title}`);
              
              localSongs.push({
                id: songId,
                title: title || 'Untitled',
                artist: artist || 'Unknown Artist',
                duration: 0, // Will be updated when the audio loads
                url: objectUrl
              });
            } catch (error) {
              console.error(`Error processing file ${file.name}:`, error);
            }
          }
          
          if (localSongs.length === 0) {
            console.warn('No valid audio files could be processed');
            return [];
          }
          
          // Update the songs array
          this.songs = [...localSongs];
          this.currentSongIndex = 0; // Reset to first song
          
          console.log(`Successfully loaded ${this.songs.length} songs`);
          return this.songs;
          
        } catch (error) {
          if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
            console.log('User cancelled directory access');
          } else {
            console.error('Error accessing directory:', error);
          }
          return [];
        }
      } else {
        // Fallback to file input for browsers that don't support the File System Access API
        console.log('Using file input fallback for local files');
        
        return new Promise<Song[]>((resolve) => {
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.multiple = true;
          fileInput.accept = 'audio/*';
          
          fileInput.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (!files || files.length === 0) {
              console.log('No files selected');
              resolve([]);
              return;
            }

            console.log(`Processing ${files.length} files...`);
            
            const localSongs: Song[] = [];
            
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              try {
                // Create a unique ID for the song
                const songId = `local-${Date.now()}-${i}`;
                
                // Extract artist and title from filename
                const fileName = file.name.replace(/\.[^/.]+$/, '');
                let artist = 'Unknown Artist';
                let title = fileName;
                
                // Try to extract artist and title if in "Artist - Title" format
                const artistTitleMatch = fileName.match(/^(.+?)\s*-\s*(.+)$/);
                if (artistTitleMatch && artistTitleMatch.length === 3) {
                  artist = artistTitleMatch[1].trim();
                  title = artistTitleMatch[2].trim();
                }
                
                // Create object URL for the file
                const objectUrl = URL.createObjectURL(file);
                
                console.log(`Added song: ${artist} - ${title}`);
                
                localSongs.push({
                  id: songId,
                  title: title || 'Untitled',
                  artist: artist || 'Unknown Artist',
                  duration: 0, // Will be updated when the audio loads
                  url: objectUrl
                });
              } catch (error) {
                console.error(`Error processing file ${file.name}:`, error);
              }
            }

            if (localSongs.length === 0) {
              console.warn('No valid audio files could be processed');
              resolve([]);
              return;
            }

            // Update the songs array
            this.songs = [...localSongs];
            this.currentSongIndex = 0; // Reset to first song
            
            console.log(`Successfully loaded ${this.songs.length} songs`);
            resolve(this.songs);
          };

          fileInput.oncancel = () => {
            console.log('File selection cancelled');
            resolve([]);
          };

          // Trigger file selection dialog
          fileInput.click();
        });
      }
    } catch (error) {
      console.error('Unexpected error in loadLocalDeviceSongs:', error);
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
