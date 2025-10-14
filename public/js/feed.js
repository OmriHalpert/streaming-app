// Get profile ID from the page
function getProfileId() {
    return document.body.getAttribute('data-profile-id');
}

// Get user ID from the page
function getUserId() {
    return document.body.getAttribute('data-user-id');
}

// Load recommendations
async function loadRecommendations() {
    const profileId = getProfileId();
    const userId = getUserId();
    const container = document.getElementById('recommendations-container');
    
    try {
        container.innerHTML = '<div class="loading">Loading recommendations...</div>';
        
        const recommendations = await UserAPI.fetchRecommendations(userId, profileId, 10);
        
        container.innerHTML = '';
        
        if (recommendations && recommendations.length > 0) {
            // Use same structure as genre sections
            const recommendationsRow = document.createElement('div');
            recommendationsRow.className = 'genre-row';
            
            // Build cards same way as regular content
            recommendations.forEach(item => {
                const contentDiv = document.createElement('div');
                contentDiv.className = `genre-file ${item.thumbnail ? 'file-with-thumbnail' : ''}`;
                contentDiv.setAttribute('data-content-name', item.name);
                contentDiv.setAttribute('data-content-year', item.year);
                contentDiv.setAttribute('data-content-genre', item.genre.join(', '));
                contentDiv.setAttribute('data-is-liked', item.isLiked);
                
                // Handle thumbnails same way as other content
                if (item.thumbnail) {
                    contentDiv.style.backgroundImage = `url('${item.thumbnail}')`;
                    contentDiv.style.backgroundSize = 'cover';
                    contentDiv.style.backgroundPosition = 'center';
                    
                    contentDiv.innerHTML = `
                        <div class="file-overlay">
                            <div class="file-content">
                                <h3 title="${item.name}">${item.name} (${item.year})</h3>
                                <p>Genre: ${item.genre.join(', ')}</p>
                            </div>
                            <span class="like-icon ${item.isLiked ? 'liked' : ''}" data-content-name="${item.name}"></span>
                        </div>
                    `;
                } else {
                    contentDiv.innerHTML = `
                        <div class="file-text-content">
                            <h3 title="${item.name}">${item.name} (${item.year})</h3>
                            <p>Genre: ${item.genre.join(', ')}</p>
                        </div>
                        <span class="like-icon ${item.isLiked ? 'liked' : ''}" data-content-name="${item.name}"></span>
                    `;
                }
                
                recommendationsRow.appendChild(contentDiv);
            });
            
            container.appendChild(recommendationsRow);
            
            // Set up functionality for recommendation content
            setTimeout(() => {
                setupWatchTracking();
                setupLikeButtons();
            }, 50);
            
        } else {
            container.innerHTML = `
                <div class="no-content">
                    <p>Watch and like some content to get personalized recommendations!</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading recommendations:', error);
        container.innerHTML = `
            <div class="no-content">
                <p>Unable to load recommendations right now.</p>
            </div>
        `;
    }
}

// Load content from server
async function loadContent() {
    const profileId = getProfileId();
    const userId = getUserId();
    const container = document.getElementById('files-container');
    const titleElement = document.getElementById('content-title');
    
    try {
        // Show loading message
        container.innerHTML = '<div class="loading">Loading content...</div>';
        titleElement.textContent = 'Loading your content...';
        
        // Fetch content via API
        const feedData = await UserAPI.fetchContent(userId, profileId);
        
        if (!feedData) {
            throw new Error('Failed to load content');
        }
        
        // Update title with count
        titleElement.innerHTML = `Your Movies and TV shows (${feedData.totalCount || 0} items)`;
        
        // Clear loading message
        container.innerHTML = '';
        
        // Check if we got content
        if (feedData.genreGroups && Object.keys(feedData.genreGroups).length > 0) {
            // Create HTML for each genre
            Object.keys(feedData.genreGroups).forEach(genre => {
                const genreSection = document.createElement('div');
                genreSection.className = 'genre-section';
                
                // Add genre title to div
                const genreTitle = document.createElement('h2');
                genreTitle.className = 'genre-title';
                genreTitle.textContent = genre;
                genreSection.appendChild(genreTitle);
                
                const genreRow = document.createElement('div');
                genreRow.className = 'genre-row';
                
                // Create content items for this genre
                feedData.genreGroups[genre].forEach(item => {
                    const contentDiv = document.createElement('div');
                    contentDiv.className = `genre-file ${item.thumbnail ? 'file-with-thumbnail' : ''}`;
                    contentDiv.setAttribute('data-content-name', item.name);
                    contentDiv.setAttribute('data-content-year', item.year);
                    contentDiv.setAttribute('data-content-genre', item.genre.join(', '));
                    contentDiv.setAttribute('data-is-liked', item.isLiked);
                    
                    // Check if content has a thumbnail, if not fallback to default view
                    if (item.thumbnail) {
                        contentDiv.style.backgroundImage = `url('${item.thumbnail}')`;
                        contentDiv.style.backgroundSize = 'cover';
                        contentDiv.style.backgroundPosition = 'center';
                        
                        contentDiv.innerHTML = `
                            <div class="file-overlay">
                                <div class="file-content">
                                    <h3 title="${item.name}">${item.name} (${item.year})</h3>
                                    <p>Genre: ${item.genre.join(', ')}</p>
                                </div>
                                <span class="like-icon ${item.isLiked ? 'liked' : ''}" data-content-name="${item.name}"></span>
                            </div>
                        `;
                    } else {
                        contentDiv.innerHTML = `
                            <div class="file-text-content">
                                <h3 title="${item.name}">${item.name} (${item.year})</h3>
                                <p>Genre: ${item.genre.join(', ')}</p>
                            </div>
                            <span class="like-icon ${item.isLiked ? 'liked' : ''}" data-content-name="${item.name}"></span>
                        `;
                    }
                    
                    // Add single content to a single genre
                    genreRow.appendChild(contentDiv);
                });
                
                // Add Genre to container
                genreSection.appendChild(genreRow);
                container.appendChild(genreSection);
            });
            
            // Set up genre click handlers after all content is loaded
            handleGenreClick();
            
            // Set up watch tracking for content clicks
            setupWatchTracking();
            
        } else {
            // Fallback for when content is empty
            container.innerHTML = `
                <div class="no-content">
                    <h3>No content available</h3>
                    <p>Check back later for new movies and shows!</p>
                </div>
            `;
        }
        
        // Load user profile for avatar
        await loadUserProfile();
        
    } catch (error) {
        console.error('Error loading content:', error);
        container.innerHTML = `
            <div class="no-content">
                <h3>Error loading content</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Load user profile avatar
async function loadUserProfile() {
    const userId = getUserId();
    const profileId = getProfileId();
    const avatarContainer = document.getElementById('profile-avatar-container');
    
    try {
        // Show loading spinner (it's already there from the template)
        avatarContainer.innerHTML = '<div class="profile-loading"></div>';
        
        // Fetches profile
        const profiles = await UserAPI.fetchUserProfiles(userId);
        const currentProfile = profiles.find(p => p.id === parseInt(profileId));
        
        if (currentProfile) {
            // Replace loading spinner with actual image
            avatarContainer.innerHTML = `
                <img src="${currentProfile.avatar}" 
                     alt="Profile Icon" 
                     class="icon"
                     onload="this.style.opacity=1"
                     style="opacity:0; transition: opacity 0.3s ease;" />
            `;
        } else {
            // Fallback to default image if profile not found
            avatarContainer.innerHTML = `
                <img src="/resources/profile_pics/profile1.jpg" 
                     alt="Profile Icon" 
                     class="icon"
                     onload="this.style.opacity=1"
                     style="opacity:0; transition: opacity 0.3s ease;" />
            `;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to default image on error
        avatarContainer.innerHTML = `
            <img src="/resources/profile_pics/profile1.jpg" 
                 alt="Profile Icon" 
                 class="icon"
                 onload="this.style.opacity=1"
                 style="opacity:0; transition: opacity 0.3s ease;" />
        `;
    }
}

// Helper function to truncate text if it exceeds character limit
function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
}

// Update all instances of a specific content across the page
function updateAllContentCards(contentName, isLiked) {
    // Find all elements with matching content name
    const allContentElements = document.querySelectorAll(`[data-content-name="${contentName}"]`);
    
    allContentElements.forEach(element => {
        // Find the like icon within this element
        const likeIcon = element.querySelector('.like-icon');
        if (likeIcon) {
            // Update like state
            if (isLiked) {
                likeIcon.classList.add('liked');
            } else {
                likeIcon.classList.remove('liked');
            }
        }
        
        // Update the data attribute as well
        element.setAttribute('data-is-liked', isLiked);
    });
}

// Initialize like button handlers for server-rendered content
function setupLikeButtons() {
    // Get all like icons (fresh elements from innerHTML)
    const likeIcons = document.querySelectorAll('.like-icon');
    
    console.log(`Setting up ${likeIcons.length} like buttons`); // Debug log
    
    likeIcons.forEach(icon => {
        icon.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Like button clicked!'); // Debug log
            
            const contentName = icon.getAttribute('data-content-name');
            const userId = getUserId();
            const profileId = getProfileId();
            
            console.log('Like data:', { contentName, userId, profileId }); // Debug log
            
            if (!contentName || !userId || !profileId) {
                console.error('Missing content name, user ID, or profile ID');
                return;
            }
            
            // Store original state
            const wasLiked = icon.classList.contains('liked');
            
            try {
                const response = await fetch('/api/content/like', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contentName: contentName,
                        userId: parseInt(userId),
                        profileId: parseInt(profileId)
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Update ALL instances of this content across the page
                    updateAllContentCards(contentName, result.data.isLiked);
                    
                    // Show feedback message
                    const message = result.data.isLiked ? 
                        `❤️ Added "${contentName}" to your liked content!` : 
                        `💔 Removed "${contentName}" from your liked content!`;
                    showNotification(message);
                    
                } else {
                    console.error('Failed to toggle like:', result.error);
                    showNotification('Failed to update like. Please try again.', 'error');
                }
                
            } catch (error) {
                console.error('Error toggling like:', error);
                showNotification('Network error. Please try again.', 'error');
            }
        });
    });
}

// Handle clicking on genre -> redirect to genre page
function handleGenreClick() {
    try {
        // Get all genre titles
        const genreElems = document.querySelectorAll('.genre-title');

        genreElems.forEach(element => {
            // Remove any existing event listeners to prevent duplicates
            element.replaceWith(element.cloneNode(true));
        });

        // Re-get the elements after cloning and add fresh listeners
        const freshGenreElems = document.querySelectorAll('.genre-title');

        freshGenreElems.forEach(element => {
            element.addEventListener('click', async (e) => {
                // Don't trigger for the recommendations section
                if (element.textContent === 'Recommended for You') {
                    return;
                }

                const genreName = element.innerText;

                if (!genreName) {
                    console.error('Failed to fetch genre name from html');
                    return;
                }

                try {
                    const userId = getUserId();
                    const profileId = getProfileId();
                    const result = await UserAPI.fetchContentByGenre(genreName, userId, profileId);

                    if (result && result.length > 0) {
                        // Reset any existing filter when switching to a new genre
                        currentGenreData = {
                            genreName: '',
                            allContent: [],
                            currentFilter: 'all'
                        };
                        
                        // Switch to genre view
                        switchToGenreView(genreName, result);
                    } else {
                        console.error('No content found for genre:', genreName);
                        const container = document.getElementById('files-container');
                        container.innerHTML = `
                            <div class="no-content">
                                <h3>No ${genreName} content found</h3>
                                <p>Check back later for new movies and shows!</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Failed to fetch content by genre', error);
                    showNotification('Failed to load genre content. Please try again.', 'error');
                }
            });
        });

    } catch (error) {
        console.error('Failed to setup genre click handlers', error);
        showNotification('Failed to setup genre navigation. Please try again.', 'error');
    }
}

// Global state for genre view
let currentGenreData = {
    genreName: '',
    allContent: [],
    currentFilter: 'all' // 'all', 'watched', 'unwatched'
};

// Switch to genre view (hide recommendations, show back button)
function switchToGenreView(genreName, content) {
    console.log(`Switching to genre view for: ${genreName} with ${content.length} items`); // Debug log
    
    // Store genre data globally for filtering
    currentGenreData = {
        genreName: genreName,
        allContent: content,
        currentFilter: 'all'
    };
    
    // Update page title with back button and toggle button
    const titleElement = document.getElementById('content-title');
    if (titleElement) {
        titleElement.innerHTML = `
            <span class="back-button" onclick="returnToMainFeed()">← Back to Feed</span>
            <span class="toggle-watched-button" onclick="toggleWatchedFilter()" data-filter="all">All Content</span>
            <span class="genre-title-text">${genreName} Movies and TV Shows (${content.length} items)</span>
        `;
    }

    // Update content display (this will handle hiding recommendations)
    updateContentDisplay(content, 'genre');
}

// Toggle between All -> Watched -> Unwatched -> All
function toggleWatchedFilter() {
    const toggleButton = document.querySelector('.toggle-watched-button');
    const titleText = document.querySelector('.genre-title-text');
    
    if (!toggleButton || !currentGenreData.allContent.length) {
        console.error('Toggle button or genre data not found');
        return;
    }

    const userId = getUserId();
    const profileId = getProfileId();

    let filteredContent = [];
    let newFilter = '';
    let buttonText = '';
    let buttonClass = '';

    // Cycle through states: all -> watched -> unwatched -> all
    switch (currentGenreData.currentFilter) {
        case 'all':
            // Show only watched content
            filteredContent = currentGenreData.allContent.filter(item => item.isWatched === true);
            newFilter = 'watched';
            buttonText = 'Watched Only';
            buttonClass = 'filter-watched';
            break;
            
        case 'watched':
            // Show only unwatched content
            filteredContent = currentGenreData.allContent.filter(item => item.isWatched === false);
            newFilter = 'unwatched';
            buttonText = 'Unwatched Only';
            buttonClass = 'filter-unwatched';
            break;
            
        case 'unwatched':
            // Show all content (back to original)
            filteredContent = currentGenreData.allContent;
            newFilter = 'all';
            buttonText = 'All Content';
            buttonClass = '';
            break;
            
        default:
            // Fallback to all content
            filteredContent = currentGenreData.allContent;
            newFilter = 'all';
            buttonText = 'All Content';
            buttonClass = '';
    }

    // Update current filter state
    currentGenreData.currentFilter = newFilter;

    // Update button appearance
    toggleButton.textContent = buttonText;
    toggleButton.className = `toggle-watched-button ${buttonClass}`;
    toggleButton.setAttribute('data-filter', newFilter);

    // Update title with new count
    if (titleText) {
        titleText.textContent = `${currentGenreData.genreName} Movies and TV Shows (${filteredContent.length} items)`;
    }

    // Update content display with filtered results
    if (filteredContent.length === 0) {
        const container = document.getElementById('files-container');
        const emptyMessages = {
            'watched': `No watched content found in ${currentGenreData.genreName}`,
            'unwatched': `No unwatched content found in ${currentGenreData.genreName}`,
            'all': `No content found in ${currentGenreData.genreName}`
        };
        
        container.innerHTML = `
            <div class="no-content">
                <h3>${emptyMessages[newFilter]}</h3>
                <p>Try a different filter or check back later!</p>
            </div>
        `;
    } else {
        updateContentDisplay(filteredContent, 'genre');
    }

    // Show notification about filter change
    const filterMessages = {
        'watched': `Showing ${filteredContent.length} watched items`,
        'unwatched': `Showing ${filteredContent.length} unwatched items`,
        'all': `Showing all ${filteredContent.length} items`
    };
    
    showNotification(filterMessages[newFilter]);
}

// Return to main feed view
function returnToMainFeed() {
    // Reset genre data state
    currentGenreData = {
        genreName: '',
        allContent: [],
        currentFilter: 'all'
    };

    // Show recommendations section again
    const recommendationsSection = document.querySelector('.recommendations-section');
    if (recommendationsSection) {
        recommendationsSection.style.display = 'block';
    }

    // Clear search input if it's visible
    const searchInput = document.querySelector('.search-input');
    if (searchInput && searchInput.classList.contains('visible')) {
        searchInput.value = '';
        searchInput.classList.remove('visible');
        
        const sortButton = document.querySelector('.sort-button');
        if (sortButton) {
            sortButton.classList.remove('visible', 'active');
        }
    }

    // Remove active class from aside genre items
    const genreList = document.querySelector('.genre-list');
    if (genreList) {
        genreList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
    }

    // Restore original title (will be updated by loadContent)
    const titleElement = document.getElementById('content-title');
    if (titleElement) {
        titleElement.innerHTML = 'Loading your content...';
    }

    // Reload the main content
    loadContent();
}

// Make functions available globally for onclick handlers
window.returnToMainFeed = returnToMainFeed;
window.toggleWatchedFilter = toggleWatchedFilter;

// Set up watch tracking for content cards
function setupWatchTracking() {
    // Get all content cards (but not like buttons)
    const contentCards = document.querySelectorAll('.genre-file, .file');
    
    console.log(`Setting up watch tracking for ${contentCards.length} content cards`); // Debug log
    
    contentCards.forEach(card => {
        // Remove any existing click listeners to avoid duplicates
        card.replaceWith(card.cloneNode(true));
    });
    
    // Re-get the cloned elements and add fresh listeners
    const freshContentCards = document.querySelectorAll('.genre-file, .file');
    
    freshContentCards.forEach(card => {
        card.addEventListener('click', async (e) => {
            // Don't trigger if clicking on like button or any child of like button
            if (e.target.classList.contains('like-icon') || e.target.closest('.like-icon')) {
                console.log('Click on like button detected, not triggering watch'); // Debug log
                return;
            }
            
            console.log('Content card clicked for watch tracking'); // Debug log
            
            const contentName = card.getAttribute('data-content-name');
            const userId = getUserId();
            const profileId = getProfileId();
            
            if (!contentName || !userId || !profileId) {
                console.error('Missing content name, user ID, or profile ID for watch tracking');
                return;
            }
            
            try {
                // Mark content as watched
                const result = await UserAPI.markContentAsWatched(userId, profileId, contentName);
                
                if (result && result.success) {
                    // Show notification if it's the first time watching
                    if (!result.alreadyWatched) {
                        showNotification(`📺 Added "${contentName}" to your watch history!`);
                    }
                    
                    // Future: Navigate to content details page
                    // For now, just log the action
                    console.log(`Marked "${contentName}" as watched for profile ${profileId}`);
                    
                } else {
                    console.error('Failed to mark content as watched');
                }
                
            } catch (error) {
                console.error('Error tracking watch:', error);
            }
        });
    });
}

// Initialize search functionality
function setupSearch() {
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.querySelector('.search-input');
    const sortButton = document.querySelector('.sort-button');
    
    if (!searchIcon || !searchInput) return;
    
    searchIcon.addEventListener('click', () => {
        // Set search elements visibility
        searchInput.classList.toggle('visible');
        if (sortButton) sortButton.classList.toggle('visible');
        
        if (searchInput.classList.contains('visible')) {
            searchInput.focus();
        } else {
            // Clear search and restore main feed view
            searchInput.value = '';
            // Reset sort button state when closing search
            if (sortButton) {
                sortButton.classList.remove('active');
            }
            returnToMainFeed();
        }
    });
    
    // Handle search input
    searchInput.addEventListener('input', debounce(searchContent, 300));
    
    // Handle sort button
    if (sortButton) {
        sortButton.addEventListener('click', () => {
            sortButton.classList.toggle('active');
            
            // Re-run search with current query to apply sorting
            searchContent();
        });
    }
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Perform search with optional sorting
async function searchContent() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();
    const userId = getUserId();
    const profileId = getProfileId();
    
    // If query is too short, just return without doing anything
    if (query.length < 2) {
        return;
    }
    
    try {
        const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}&userId=${userId}&profileId=${profileId}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
            let searchResults = result.data;
            
            // Apply A-Z sorting if sort button is active
            const sortButton = document.querySelector('.sort-button');
            if (sortButton && sortButton.classList.contains('active')) {
                searchResults = searchResults.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            // Update title to show search results with back button
            const titleElement = document.getElementById('content-title');
            if (titleElement) {
                titleElement.innerHTML = `
                    <span class="back-button" onclick="returnToMainFeed()">← Back to Feed</span>
                    <span class="genre-title-text">Search Results for "${query}" (${searchResults.length} items)</span>
                `;
            }
            
            updateContentDisplay(searchResults, 'search');
        } else {
            console.error('Search failed:', result.error);
        }
        
    } catch (error) {
        console.error('Search error:', error);
    }
}


// Create HTML for a single content card
function createContentCard(item) {
    const hasThumb = item.thumbnail;
    const truncatedTitle = truncateText(item.name, 40);
    
    if (hasThumb) {
        return `
            <div class="file file-with-thumbnail" 
                 data-content-name="${item.name}" 
                 data-content-year="${item.year}"
                 data-content-genre="${item.genre.join(', ')}"
                 data-is-liked="${item.isLiked}"
                 style="background-image: url('${item.thumbnail}'); background-size: cover; background-position: center;">
                <div class="file-overlay">
                    <div class="file-content">
                        <h3 title="${item.name}">${truncatedTitle} (${item.year})</h3>
                        <p>Genre: ${item.genre.join(', ')}</p>
                    </div>
                    <span class="like-icon ${item.isLiked ? 'liked' : ''}" 
                          data-content-name="${item.name}"></span>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="file" 
                 data-content-name="${item.name}" 
                 data-content-year="${item.year}"
                 data-content-genre="${item.genre.join(', ')}"
                 data-is-liked="${item.isLiked}">
                <div class="file-text-content">
                    <h3 title="${item.name}">${truncatedTitle} (${item.year})</h3>
                    <p>Genre: ${item.genre.join(', ')}</p>
                </div>
                <span class="like-icon ${item.isLiked ? 'liked' : ''}" 
                      data-content-name="${item.name}"></span>
            </div>
        `;
    }
}

// Update content display with search results (switches to grid view)
function updateContentDisplay(content, viewType = 'search') {
    const container = document.getElementById('files-container');
    
    if (content.length === 0) {
        container.innerHTML = '<div class="no-content"><h3>No results found</h3></div>';
        return;
    }
    
    // Hide recommendations when showing search/genre results
    const recommendationsSection = document.querySelector('.recommendations-section');
    if (recommendationsSection && viewType !== 'main') {
        recommendationsSection.style.display = 'none';
    }
    
    // Switch container to grid layout for search results
    container.className = 'files-container';
    
    // Generate HTML for all content cards
    container.innerHTML = content.map(item => createContentCard(item)).join('');
    
    console.log(`Updated content display with ${content.length} items, viewType: ${viewType}`); // Debug log
    
    // Use setTimeout to ensure DOM is fully updated before setting up event listeners
    setTimeout(() => {
        // IMPORTANT: Set up watch tracking FIRST since it clones elements
        setupWatchTracking();
        
        // Then set up like buttons AFTER watch tracking
        setupLikeButtons();
    }, 100);
}

// Show a notification message to the user
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-hide
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize hamburger menu
function setupHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
        
        navMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-selection')) {
                navMenu.classList.remove('show');
            }
        });
    }
}

// Initialize aside for genres
async function setupAside() {
    console.log('Starting setupAside function'); // Debug log
    
    const genreList = document.querySelector('.genre-list');
    console.log('Genre list element:', genreList); // Debug log

    if (!genreList) {
        console.error('Genre list element not found');
        return;
    }

    try {
        // Get user data from page attributes
        const userId = getUserId();
        const profileId = getProfileId();
        
        console.log('User data for aside:', { userId, profileId }); // Debug log
        
        if (!userId || !profileId) {
            console.error('User ID or Profile ID not found for aside setup');
            return;
        }

        // Fetch content via API
        console.log('Fetching content for aside...'); // Debug log
        const feedData = await UserAPI.fetchContent(userId, profileId);
        
        console.log('Feed data received:', feedData); // Debug log
        
        if (!feedData || !feedData.genreGroups) {
            console.error('No genre data found');
            return;
        }

        const genres = feedData.genreGroups;
        console.log('Genres found:', Object.keys(genres)); // Debug log

        // Clear existing content
        genreList.innerHTML = '';

        // Check if we got content
        if (genres && Object.keys(genres).length > 0) {
            // Iterate over genre keys (genre names)
            Object.keys(genres).forEach(genreName => {
                console.log('Adding genre to aside:', genreName); // Debug log
                
                // Create new li element
                const newGenreItem = document.createElement('li');
                newGenreItem.textContent = genreName;
                newGenreItem.setAttribute('data-genre', genreName);
                
                // Add click handler for genre navigation
                newGenreItem.addEventListener('click', async () => {
                    try {
                        // Remove active class from all items
                        genreList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
                        // Add active class to clicked item
                        newGenreItem.classList.add('active');
                        
                        // Fetch and display genre content
                        const result = await UserAPI.fetchContentByGenre(genreName, userId, profileId);
                        if (result && result.length > 0) {
                            switchToGenreView(genreName, result);
                        }
                    } catch (error) {
                        console.error('Error loading genre from aside:', error);
                        showNotification('Failed to load genre content', 'error');
                    }
                });

                // Append item to list
                genreList.appendChild(newGenreItem);
            });
            
            console.log(`Successfully loaded ${Object.keys(genres).length} genres in aside`);
        } else {
            console.log('No genres found, showing fallback message');
            genreList.innerHTML = '<li style="color: #666;">No genres available</li>';
        }
    } catch (error) {
        console.error('Error setting up aside:', error);
        genreList.innerHTML = '<li style="color: #666;">Error loading genres</li>';
    }
}

// Initialize logout functionality
function setupLogout() {
    const logoutLinks = document.querySelectorAll('a[href="/logout"]');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Clear localStorage
            localStorage.clear();
            
            // Redirect to logout
            window.location.href = '/logout';
        });
    });
}

// Main initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Debug: Check if aside exists
    const aside = document.querySelector('.feed-aside');
    const genreList = document.querySelector('.genre-list');
    console.log('Aside element found:', !!aside);
    console.log('Genre list element found:', !!genreList);
    if (aside) {
        console.log('Aside computed styles:', window.getComputedStyle(aside).display);
    }
    
    // Load recommendations first
    await loadRecommendations();
    
    // Load content
    await loadContent();

    // Load aside
    await setupAside();
    
    // Set up like buttons for everything
    setupLikeButtons();
    
    // Initialize other stuff
    setupSearch();
    setupHamburgerMenu();
    setupLogout();
    
    // Show welcome message if profile is selected
    const selectedProfile = JSON.parse(localStorage.getItem('selectedProfile') || '{}');
    const welcomeShown = localStorage.getItem('welcomeShown');
    
    if (selectedProfile.name && !welcomeShown) {
        showNotification(`👋 Welcome back ${selectedProfile.name}!`);
        localStorage.setItem('welcomeShown', 'true');
    }
});
