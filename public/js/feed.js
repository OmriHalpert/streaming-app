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
            
            setupWatchTracking();
            
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
        titleElement.textContent = `Your Movies and TV shows (${feedData.totalCount || 0} items)`;
        
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
    const likeIcons = document.querySelectorAll('.like-icon');
    
    likeIcons.forEach(icon => {
        icon.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const contentName = icon.getAttribute('data-content-name');
            const userId = getUserId();
            const profileId = getProfileId();
            
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

// Set up watch tracking for content cards
function setupWatchTracking() {
    // Get all content cards (but not like buttons)
    const contentCards = document.querySelectorAll('.genre-file, .file');
    
    contentCards.forEach(card => {
        // Remove any existing click listeners to avoid duplicates
        card.replaceWith(card.cloneNode(true));
    });
    
    // Re-get the cloned elements and add fresh listeners
    const freshContentCards = document.querySelectorAll('.genre-file, .file');
    
    freshContentCards.forEach(card => {
        card.addEventListener('click', async (e) => {
            // Don't trigger if clicking on like button
            if (e.target.classList.contains('like-icon')) {
                return;
            }
            
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
            // Clear search and restore genre view
            searchInput.value = '';
            // Reset sort button state when closing search
            if (sortButton) {
                sortButton.classList.remove('active');
            }
            window.location.reload();
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
            
            updateContentDisplay(searchResults);
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
function updateContentDisplay(content) {
    const container = document.getElementById('files-container');
    
    if (content.length === 0) {
        container.innerHTML = '<div class="no-content"><h3>No results found</h3></div>';
        return;
    }
    
    // Switch container to grid layout for search results
    container.className = 'files-container';
    
    // Generate HTML for all content cards
    container.innerHTML = content.map(item => createContentCard(item)).join('');
    
    // Re-initialize like buttons for new content
    setupLikeButtons();
    
    // Re-initialize watch tracking for new content
    setupWatchTracking();
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
    // Load recommendations first
    await loadRecommendations();
    
    // Load content
    await loadContent();
    
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
