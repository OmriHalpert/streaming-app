// Get profile ID from the page
function getProfileId() {
    return document.body.getAttribute('data-profile-id');
}

// Helper function to truncate text if it exceeds character limit
function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + '...';
}

// Update all instances of a specific content across the page
function updateAllContentCards(contentName, isLiked, likeCount) {
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
        
        // Find and update likes count
        const likesCountSpan = element.querySelector('.likes-count');
        if (likesCountSpan) {
            likesCountSpan.textContent = likeCount;
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
            const profileId = getProfileId();
            
            if (!contentName || !profileId) {
                console.error('Missing content name or profile ID');
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
                        profileId: parseInt(profileId)
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Update ALL instances of this content across the page
                    updateAllContentCards(contentName, result.data.isLiked, result.data.likeCount);
                    
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
    const profileId = getProfileId();
    
    // If query is too short, just return without doing anything
    if (query.length < 2) {
        return;
    }
    
    try {
        const response = await fetch(`/api/content/search?q=${encodeURIComponent(query)}&profileId=${profileId}`);
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
                        <p>Likes: <span class="likes-count">${item.likes}</span></p>
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
                    <p>Likes: <span class="likes-count">${item.likes}</span></p>
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
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all functionality
    setupLikeButtons();
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
