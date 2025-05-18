document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.querySelector('.progress-bar-container');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const volumeBar = document.getElementById('volume-bar');
    const volumeContainer = document.querySelector('.volume-bar-container');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const currentAlbumCover = document.getElementById('current-album-cover');
    const prevBtn = document.querySelector('.fa-step-backward');
    const nextBtn = document.querySelector('.fa-step-forward');
    const shuffleBtn = document.querySelector('.fa-random');
    const repeatBtn = document.querySelector('.fa-redo');
    const likeBtn = document.querySelector('.fa-heart');
    const playlistCards = document.querySelectorAll('.playlist-card');
    const recentSongs = document.querySelectorAll('.recent-song');
    
    // Player state
    let isPlaying = false;
    let isShuffled = false;
    let isRepeated = false;
    let currentSongIndex = 0;
    
    // Song data
    const songList = Array.from(recentSongs).map(song => ({
        element: song,
        src: song.getAttribute('data-src'),
        title: song.getAttribute('data-title'),
        artist: song.getAttribute('data-artist'),
        cover: song.getAttribute('data-cover'),
        duration: song.querySelector('.duration').textContent
    }));
    
    // Initialize player
    function init() {
        // Set initial volume
        audioPlayer.volume = 0.7;
        volumeBar.style.width = '70%';
        
        // Load first song
        loadSong(currentSongIndex);
        
        // Event listeners
        playPauseBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        shuffleBtn.addEventListener('click', toggleShuffle);
        repeatBtn.addEventListener('click', toggleRepeat);
        likeBtn.addEventListener('click', toggleLike);
        progressContainer.addEventListener('click', setProgress);
        volumeContainer.addEventListener('click', setVolume);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', songEnded);
        audioPlayer.addEventListener('loadedmetadata', updateDuration);
        
        // Playlist card click events
        playlistCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Don't trigger if play button was clicked
                if (!e.target.closest('.play-btn')) {
                    // In a real app, this would load the playlist
                    // For now, we'll play the first song in our list
                    currentSongIndex = 0;
                    loadSong(currentSongIndex);
                    playSong();
                }
            });
            
            // Play button on cards
            const playBtn = card.querySelector('.play-btn');
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                currentSongIndex = 0; // Play first song in playlist
                loadSong(currentSongIndex);
                playSong();
            });
        });
        
        // Recent song click events
        recentSongs.forEach((song, index) => {
            song.addEventListener('click', function() {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
            });
        });
    }
    
    // Load song
    function loadSong(index) {
        const song = songList[index];
        audioPlayer.src = song.src;
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        currentAlbumCover.src = song.cover;
        durationDisplay.textContent = song.duration;
        
        // Update active song in playlist
        recentSongs.forEach(s => s.classList.remove('active-song'));
        song.element.classList.add('active-song');
    }
    
    // Play song
    function playSong() {
        isPlaying = true;
        audioPlayer.play();
        playPauseBtn.classList.remove('fa-play-circle');
        playPauseBtn.classList.add('fa-pause-circle');
    }
    
    // Pause song
    function pauseSong() {
        isPlaying = false;
        audioPlayer.pause();
        playPauseBtn.classList.remove('fa-pause-circle');
        playPauseBtn.classList.add('fa-play-circle');
    }
    
    // Toggle play/pause
    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }
    
    // Previous song
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songList.length - 1;
        }
        loadSong(currentSongIndex);
        playSong();
    }
    
    // Next song
    function nextSong() {
        if (isShuffled) {
            currentSongIndex = Math.floor(Math.random() * songList.length);
        } else {
            currentSongIndex++;
            if (currentSongIndex > songList.length - 1) {
                currentSongIndex = 0;
            }
        }
        loadSong(currentSongIndex);
        playSong();
    }
    
    // Update progress bar
    function updateProgress() {
        const { duration, currentTime } = audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeDisplay.textContent = formatTime(currentTime);
    }
    
    // Set progress
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    }
    
    // Update duration display
    function updateDuration() {
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    }
    
    // Set volume
    function setVolume(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const volume = clickX / width;
        audioPlayer.volume = volume;
        volumeBar.style.width = `${volume * 100}%`;
        
        // Update volume icon
        const volumeIcon = document.querySelector('.volume-controls i');
        if (volume === 0) {
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    }
    
    // Song ended
    function songEnded() {
        if (isRepeated) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            nextSong();
        }
    }
    
    // Toggle shuffle
    function toggleShuffle() {
        isShuffled = !isShuffled;
        shuffleBtn.style.color = isShuffled ? '#1DB954' : '#b3b3b3';
    }
    
    // Toggle repeat
    function toggleRepeat() {
        isRepeated = !isRepeated;
        repeatBtn.style.color = isRepeated ? '#1DB954' : '#b3b3b3';
    }
    
    // Toggle like
    function toggleLike() {
        likeBtn.classList.toggle('far');
        likeBtn.classList.toggle('fas');
        likeBtn.style.color = likeBtn.classList.contains('fas') ? '#1DB954' : '#b3b3b3';
    }
    
    // Format time
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
                break;
            case 'ArrowRight':
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
                break;
            case 'ArrowUp':
                audioPlayer.volume = Math.min(1, audioPlayer.volume + 0.1);
                volumeBar.style.width = `${audioPlayer.volume * 100}%`;
                break;
            case 'ArrowDown':
                audioPlayer.volume = Math.max(0, audioPlayer.volume - 0.1);
                volumeBar.style.width = `${audioPlayer.volume * 100}%`;
                break;
        }
    });
    
    // Initialize the player
    init();
});