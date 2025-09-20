// Holds initial files data
const initialFiles = [
    {
        name: "The Dark Knight",
        year: 2008,
        genre: ["Action", "Crime", "Drama"],
        likes: 100,
        liked: false,
        thumbnail: "../resources/thumbnails/the_dark_knight.jpg"
    },
    {
        name: "Deadpool",
        year: 2016,
        genre: ["Action", "Comedy"],
        likes: 150,
        liked: false,
        thumbnail: "../resources/thumbnails/deadpool.jpg"
    },
    {
        name: "The Shawshank Redemption",
        year: 1994,
        genre: ["Drama"],
        likes: 80,
        liked: false,
        thumbnail: "../resources/thumbnails/the_shawshank_redemption.jpg"
    },
    {
        name: "Inception",
        year: 2010,
        genre: ["Action", "Sci-Fi", "Thriller"],
        likes: 200,
        liked: false,
        thumbnail: "../resources/thumbnails/inception.jpg"
    },
    {
        name: "The Conjuring",
        year: 2013,
        genre: ["Horror", "Thriller"],
        likes: 120,
        liked: false,
        thumbnail: "../resources/thumbnails/the_conjuring.jpg"
    },
    {
        name: "Interstellar",
        year: 2014,
        genre: ["Adventure", "Drama", "Sci-Fi"],
        likes: 180,
        liked: false,
        thumbnail: "../resources/thumbnails/interstellar.jpg"
    },
    {
        name: "Avatar",
        year: 2009,
        genre: ["Action", "Adventure", "Fantasy"],
        likes: 90,
        liked: false,
        thumbnail: "../resources/thumbnails/avatar.jpg"
    },
    {
        name: "Titanic",
        year: 1997,
        genre: ["Drama", "Romance"],
        likes: 160,
        liked: false,
        thumbnail: "../resources/thumbnails/titanic.jpg"
    },
    {
        name: "Gone Girl",
        year: 2014,
        genre: ["Drama", "Mystery", "Thriller"],
        likes: 140,
        liked: false,
        thumbnail: "../resources/thumbnails/gone_girl.jpg"
    },
    {
        name: "Harry Potter",
        year: 2001,
        genre: ["Adventure", "Fantasy"],
        likes: 170,
        liked: false,
        thumbnail: "../resources/thumbnails/harry_potter.jpg"
    },
    {
        name: "Planet Earth",
        year: 2006,
        genre: ["Documentary"],
        likes: 110,
        liked: false,
        thumbnail: "../resources/thumbnails/planet_earth.jpg"
    },
    {
        name: "Toy Story",
        year: 1995,
        genre: ["Animation", "Adventure", "Comedy"],
        likes: 190,
        liked: false,
        thumbnail: "../resources/thumbnails/toy_story.jpg"
    },
    {
        name: "Breaking Bad",
        year: 2008,
        genre: ["Drama", "Crime", "Thriller"],
        likes: 220,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "Stranger Things",
        year: 2016,
        genre: ["Drama", "Fantasy", "Horror"],
        likes: 180,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "The Office",
        year: 2005,
        genre: ["Comedy"],
        likes: 200,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "Game of Thrones",
        year: 2011,
        genre: ["Drama", "Fantasy", "Adventure"],
        likes: 170,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "Friends",
        year: 1994,
        genre: ["Comedy", "Romance"],
        likes: 190,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "The Crown",
        year: 2016,
        genre: ["Drama", "Biography"],
        likes: 150,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "Sherlock",
        year: 2010,
        genre: ["Crime", "Drama", "Mystery"],
        likes: 165,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "The Mandalorian",
        year: 2019,
        genre: ["Adventure", "Fantasy", "Action"],
        likes: 175,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "Black Mirror",
        year: 2011,
        genre: ["Drama", "Thriller", "Sci-Fi"],
        likes: 160,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "The Witcher",
        year: 2019,
        genre: ["Fantasy", "Adventure", "Drama"],
        likes: 155,
        liked: false
        // No thumbnail - will use regular text layout
    },
    {
        name: "House of Cards",
        year: 2013,
        genre: ["Drama", "Thriller"],
        likes: 140,
        liked: false
        // No thumbnail - will use regular text layout
    }
];

// Load files from localStorage or use initial files
Files = JSON.parse(localStorage.getItem('filessData')) || initialFiles;

// Function to group files by genre
function groupFilesByGenre(files) {
    const genreGroups = {};

    files.forEach(file => {
        // Extracts genres from files
        file.genre.forEach(genre => {
            if (!genreGroups[genre]) {
                genreGroups[genre] = [];
            }
            // Adds files to genre groups (avoids duplicates)
            if (!genreGroups[genre].find(f => f.name === file.name)) {
                genreGroups[genre].push(file);
            }
        });
    });
    
    return genreGroups;
}

// Render movies and TV shows (files)
const renderFiles = (filesToRender = Files) => {
    const filesContainer = document.getElementById('files-container');
    filesContainer.innerHTML = '';
    filesContainer.className = 'files-container'; // Reset to grid layout class (grid view)

    // Use createFileElement to build each file's HTML
    filesToRender.forEach((file, index) => {
        const fileDiv = createFileElement(file);
        filesContainer.appendChild(fileDiv);
    });
};

// Default view (genre based)
function renderGenreView() {
    const container = document.getElementById('files-container');
    container.innerHTML = '';
    container.className = 'genre-container'; // Different layout class (genre view)

    // Group files by genre dynamically
    const genreGroups = groupFilesByGenre(Files);

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
        
        // Add files to this genre row
        genreGroups[genre].forEach(file => {
            const fileCard = createFileElement(file);
            // Remove the default .file class and add .genre-file class for genre view
            fileCard.classList.remove('file');
            fileCard.classList.add('genre-file');
            genreRow.appendChild(fileCard);
        });
        
        genreSection.appendChild(genreRow);
        container.appendChild(genreSection);
    });
}

// Create individual file element (shared between grid and genre views)
function createFileElement(file) {
    const originalIndex = Files.indexOf(file);
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file';

    if (file.thumbnail) {
        // For files with thumbnails, create a card with background image and overlay content
        fileDiv.style.backgroundImage = `url(${file.thumbnail})`;
        fileDiv.style.backgroundSize = 'cover';
        fileDiv.style.backgroundPosition = 'center';
        fileDiv.classList.add('file-with-thumbnail');
        
        fileDiv.innerHTML = `
            <div class="file-overlay">
                <div class="file-content">
                    <h3>${file.name} (${file.year})</h3>
                    <p>Genre: ${file.genre.join(', ')}</p>
                    <p>Likes: <span class="likes-count">${file.likes}</span></p>
                </div>
                <span class="like-icon ${file.liked ? 'liked' : ''}" data-index="${originalIndex}"></span>
            </div>
        `;
    } else {
        // For files without thumbnails, use the regular layout
        fileDiv.innerHTML = `
            <div class="file-text-content">
                <h3>${file.name} (${file.year})</h3>
                <p>Genre: ${file.genre.join(', ')}</p>
                <p>Likes: <span class="likes-count">${file.likes}</span></p>
            </div>
            <span class="like-icon ${file.liked ? 'liked' : ''}" data-index="${originalIndex}"></span>
        `;
    }

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
        localStorage.setItem('filesData', JSON.stringify(Files));

        // Update all instances of this file without re-rendering
        updateFileInstances(Files[index]);
    });

    return fileDiv;
}

// Update all instances of a file across the page
function updateFileInstances(file) {
    const fileIndex = Files.indexOf(file);
    // Find all like icons for this file
    const allLikeIcons = document.querySelectorAll(`[data-index="${fileIndex}"]`);

    allLikeIcons.forEach(icon => {
        // Update like state
        if (file.liked) {
            icon.classList.add('liked');
        } else {
            icon.classList.remove('liked');
        }
        
        // Update likes count in the same card
        const card = icon.closest('.file, .genre-file');
        if (card) {
            const likesCountSpan = card.querySelector('.likes-count');
            if (likesCountSpan) {
                likesCountSpan.textContent = file.likes;
            }
        }
    });

    return fileDiv;
}

// Initialize search
const initializeSearch = () => {
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.querySelector('.search-input');
    const sortButton = document.querySelector('.sort-button');
    
    searchIcon.addEventListener('click', () => {
        searchInput.classList.toggle('visible');
        sortButton.classList.toggle('visible');
        
        if (searchInput.classList.contains('visible')) {
            searchInput.focus();
        } else {
            searchInput.value = '';
            sortButton.classList.remove('active');
            renderGenreView(); // Return to genre view when search is closed
        }
    });
};

// Search and sort functionality
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

// initialize hamburger menu
function initializeHamburgerMenu() {
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
}

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

    // Add close button functionality
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
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

    // renders files to the DOM - default genre view
    renderGenreView();

    // Initialize search
    initializeSearch();
    searchAbility();

    // initialize hamburger menu
    initializeHamburgerMenu();
});

