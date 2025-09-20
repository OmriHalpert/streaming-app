// Holds initial files data
const initialFiles = [
    {
        name: "The Dark Knight",
        year: 2008,
        genre: ["Action", "Crime", "Drama"],
        likes: 100,
        liked: false
    },
    {
        name: "Deadpool",
        year: 2016,
        genre: ["Action", "Comedy"],
        likes: 150,
        liked: false
    },
    {
        name: "The Shawshank Redemption",
        year: 1994,
        genre: ["Drama"],
        likes: 80,
        liked: false
    },
    {
        name: "Inception",
        year: 2010,
        genre: ["Action", "Sci-Fi", "Thriller"],
        likes: 200,
        liked: false
    },
    {
        name: "The Conjuring",
        year: 2013,
        genre: ["Horror", "Thriller"],
        likes: 120,
        liked: false
    },
    {
        name: "Interstellar",
        year: 2014,
        genre: ["Adventure", "Drama", "Sci-Fi"],
        likes: 180,
        liked: false
    },
    {
        name: "Avatar",
        year: 2009,
        genre: ["Action", "Adventure", "Fantasy"],
        likes: 90,
        liked: false
    },
    {
        name: "Titanic",
        year: 1997,
        genre: ["Drama", "Romance"],
        likes: 160,
        liked: false
    },
    {
        name: "Gone Girl",
        year: 2014,
        genre: ["Drama", "Mystery", "Thriller"],
        likes: 140,
        liked: false
    },
    {
        name: "Harry Potter",
        year: 2001,
        genre: ["Adventure", "Fantasy"],
        likes: 170,
        liked: false
    },
    {
        name: "Planet Earth",
        year: 2006,
        genre: ["Documentary"],
        likes: 110,
        liked: false
    },
    {
        name: "Toy Story",
        year: 1995,
        genre: ["Animation", "Adventure", "Comedy"],
        likes: 190,
        liked: false
    }
];

// Load files from localStorage or use initial files
Files = JSON.parse(localStorage.getItem('moviesData')) || initialFiles;

// Function to group movies by genre
function groupMoviesByGenre(movies) {
    const genreGroups = {};
    
    movies.forEach(movie => {
        // Now genre is already an array
        movie.genre.forEach(genre => {
            if (!genreGroups[genre]) {
                genreGroups[genre] = [];
            }
            // Only add if not already in this genre group (avoid duplicates)
            if (!genreGroups[genre].find(m => m.name === movie.name)) {
                genreGroups[genre].push(movie);
            }
        });
    });
    
    return genreGroups;
}

// Render movies and TV shows (files)
const renderFiles = (filesToRender = Files) => {
    const filesContainer = document.getElementById('files-container');
    filesContainer.innerHTML = '';
    filesContainer.className = 'files-container'; // Reset to grid layout class
    filesToRender.forEach((file, index) => {
        const originalIndex = Files.indexOf(file);
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file';
        fileDiv.innerHTML = `
            <h3>${file.name} (${file.year})</h3>
            <p>Genre: ${file.genre.join(', ')}</p>
            <p>Likes: <span class="likes-count">${file.likes}</span></p>
            <img src="resources/heart.png" alt="Like Icon" class="like-icon ${file.liked ? 'liked' : ''}" data-index="${originalIndex}" />
        `;

        // Add click handler for the like icon
        fileDiv.querySelector('.like-icon').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the file div click event
            const icon = e.target;
            const index = parseInt(icon.dataset.index);
            
            const wasLiked = Files[index].liked;
            // Toggle liked state in both UI and data
            Files[index].liked = !Files[index].liked;
            icon.classList.toggle('liked');
            
            // Update likes count based on previous state
            const likesElement = fileDiv.querySelector('.likes-count');
            if (!wasLiked && Files[index].liked) {
                Files[index].likes += 1;
            } else if (wasLiked && !Files[index].liked) {
                Files[index].likes -= 1;
            }
            likesElement.textContent = Files[index].likes;
            
            // Save updated Files array to localStorage
            localStorage.setItem('moviesData', JSON.stringify(Files));
        });

        filesContainer.appendChild(fileDiv);
    });
};

// Netflix-style genre view (for default homepage)
function renderGenreView() {
    const container = document.getElementById('files-container');
    container.innerHTML = '';
    container.className = 'genre-container'; // Different layout class
    
    // Group movies by genre dynamically
    const genreGroups = groupMoviesByGenre(Files);
    
    // Create a section for each genre
    Object.keys(genreGroups).forEach(genre => {
        const genreSection = document.createElement('div');
        genreSection.className = 'genre-section';
        
        // Genre title
        const genreTitle = document.createElement('h2');
        genreTitle.className = 'genre-title';
        genreTitle.textContent = genre;
        genreSection.appendChild(genreTitle);
        
        // Genre row container (horizontal scrolling)
        const genreRow = document.createElement('div');
        genreRow.className = 'genre-row';
        
        // Add movies to this genre row
        genreGroups[genre].forEach(movie => {
            const movieCard = createFileElement(movie);
            movieCard.className = 'genre-file'; // Different styling for genre view
            genreRow.appendChild(movieCard);
        });
        
        genreSection.appendChild(genreRow);
        container.appendChild(genreSection);
    });
}

// Create individual movie element (shared between grid and genre views)
function createFileElement(file) {
    const originalIndex = Files.indexOf(file);
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file';
    fileDiv.innerHTML = `
        <h3>${file.name} (${file.year})</h3>
        <p>Genre: ${file.genre.join(', ')}</p>
        <p>Likes: <span class="likes-count">${file.likes}</span></p>
        <img src="resources/heart.png" alt="Like Icon" class="like-icon ${file.liked ? 'liked' : ''}" data-index="${originalIndex}" />
    `;

    // Add click handler for the like icon
    fileDiv.querySelector('.like-icon').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the file div click event
        const icon = e.target;
        const index = parseInt(icon.dataset.index);
        
        const wasLiked = Files[index].liked;
        // Toggle liked state in the data
        Files[index].liked = !Files[index].liked;
        
        // Update likes count based on previous state
        if (!wasLiked && Files[index].liked) {
            Files[index].likes += 1;
        } else if (wasLiked && !Files[index].liked) {
            Files[index].likes -= 1;
        }
        
        // Save updated Files array to localStorage
        localStorage.setItem('moviesData', JSON.stringify(Files));
        
        // Re-render the current view to reflect changes everywhere
        const searchInput = document.querySelector('.search-input');
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        
        if (query === '') {
            // We're in genre view, re-render it
            renderGenreView();
        } else {
            // We're in search/grid view, re-render the search results
            const sortButton = document.querySelector('.sort-button');
            let filteredFiles = Files.filter(file => file.name.toLowerCase().includes(query));
            
            if (sortButton && sortButton.classList.contains('active')) {
                filteredFiles = filteredFiles.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            renderFiles(filteredFiles);
        }
    });

    return fileDiv;
}

// Initialize search functionality
const initializeSearch = () => {
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.querySelector('.search-input');
    const sortButton = document.querySelector('.sort-button');
    
    searchIcon.addEventListener('click', () => {
        searchInput.classList.toggle('visible');
        sortButton.classList.toggle('visible');
        
        if (searchInput.classList.contains('visible')) {
            searchInput.style.display = 'block';
            sortButton.style.display = 'block';
            searchInput.focus();
        } else {
            searchInput.style.display = 'none';
            sortButton.style.display = 'none';
            searchInput.value = '';
            sortButton.classList.remove('active');
            renderGenreView(); // Return to genre view when search is closed
        }
    });
};

const searchAbility = () => {
    const searchInput = document.querySelector('.search-input');
    const sortButton = document.querySelector('.sort-button');
    let isSorted = false;
    
    // Handle search input
    searchInput.addEventListener('input', () => {
        performSearch();
    });
    
    // Handle sort button
    sortButton.addEventListener('click', () => {
        isSorted = !isSorted;
        sortButton.classList.toggle('active');
        performSearch();
    });
    
    // Perform search with optional sorting
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        // If search is empty, show genre view
        if (query === '') {
            renderGenreView();
            return;
        }
        
        // If there's search text, show grid view with filtered results
        let filteredFiles = Files.filter(file => file.name.toLowerCase().includes(query));
        
        if (isSorted) {
            filteredFiles = filteredFiles.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        renderFiles(filteredFiles);
    }
};

// Custom notification function
function showCustomNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
        <button class="close-btn">&times;</button>
        ${message}
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 4000);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Main DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Clear search input on page refresh
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Load profile login message
    const profileName = localStorage.getItem('selectedProfileName');
    // Add a small delay to ensure page is fully rendered
    setTimeout(() => {
        if (profileName) {
            showCustomNotification(`Welcome back ${profileName}!`);
        } else {
            console.log('No profile name found in localStorage');
        }
    }, 500);

    // renders files to the DOM - default to genre view
    renderGenreView();

    // Initialize search
    initializeSearch();
    searchAbility();
    
    // Simple hamburger menu
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
        
        // Close menu when clicking on a link
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-selection')) {
                navMenu.classList.remove('show');
            }
        });
    }
});

