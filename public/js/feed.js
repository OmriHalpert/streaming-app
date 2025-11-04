// Helper functions
// Get profile ID from the page
function getProfileId() {
  return document.body.getAttribute("data-profile-id");
}

// Get user ID from the page
function getUserId() {
  return document.body.getAttribute("data-user-id");
}

// Update all instances of a specific content across the page
function updateAllContentCards(contentName, isLiked) {
  // Find all elements with matching content name
  const allContentElements = document.querySelectorAll(
    `[data-content-name="${contentName}"]`
  );

  allContentElements.forEach((element) => {
    // Find the like icon within this element
    const likeIcon = element.querySelector(".like-icon");
    if (likeIcon) {
      // Update like state
      if (isLiked) {
        likeIcon.classList.add("liked");
      } else {
        likeIcon.classList.remove("liked");
      }
    }

    // Update the data attribute as well
    element.setAttribute("data-is-liked", isLiked);
  });
}

// Helper function to deduplicate content by ID
function deduplicateContent(contentArray) {
  const seen = new Set();
  return contentArray.filter((item) => {
    const id = item.id; // Use numeric id for deduplication
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}

// Create HTML for a single content card
function createContentCard(item) {
  const hasThumb = item.thumbnail;
  const contentId = item.id; // Use numeric id, not MongoDB _id

  if (hasThumb) {
    return `
            <div class="file file-with-thumbnail" 
                 data-content-id="${contentId}"
                 data-content-name="${item.name}" 
                 data-content-year="${item.year}"
                 data-content-genre="${item.genre.join(", ")}"
                 data-is-liked="${item.isLiked}"
                 style="background-image: url('${
                   item.thumbnail
                 }'); background-size: cover; background-position: center;">
                <div class="file-overlay">
                    <div class="file-content">
                        <h3 title="${item.name}">${item.name} (${
      item.year
    })</h3>
                        <p>Genre: ${item.genre.join(", ")}</p>
                    </div>
                    <span class="like-icon ${item.isLiked ? "liked" : ""}" 
                          data-content-name="${item.name}"></span>
                </div>
            </div>
        `;
  } else {
    return `
            <div class="file" 
                 data-content-id="${contentId}"
                 data-content-name="${item.name}" 
                 data-content-year="${item.year}"
                 data-content-genre="${item.genre.join(", ")}"
                 data-is-liked="${item.isLiked}">
                <div class="file-text-content">
                    <h3 title="${item.name}">${item.name} (${item.year})</h3>
                    <p>Genre: ${item.genre.join(", ")}</p>
                </div>
                <span class="like-icon ${item.isLiked ? "liked" : ""}" 
                      data-content-name="${item.name}"></span>
            </div>
        `;
  }
}

// Show a notification message to the user
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100);

  // Auto-hide
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Show loading indicator at bottom of content
function showLoadingIndicator() {
  const container = document.getElementById("files-container");
  const existingLoader = document.getElementById("infinite-scroll-loader");

  if (!existingLoader && container) {
    const loader = document.createElement("div");
    loader.id = "infinite-scroll-loader";
    loader.className = "loading-indicator";
    loader.innerHTML = '<div class="loading">Loading more content...</div>';
    container.appendChild(loader);
  }
}

// Hide loading indicator
function hideLoadingIndicator() {
  const loader = document.getElementById("infinite-scroll-loader");
  if (loader) {
    loader.remove();
  }
}

// Append new content to existing display
function appendContentToDisplay(newContent) {
  const container = document.getElementById("files-container");
  if (!container) return;

  // Create new content elements
  const newContentHTML = newContent
    .map((item) => createContentCard(item))
    .join("");

  // Create a temporary container to hold the new content
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = newContentHTML;

  // Append each new element to the container
  while (tempDiv.firstChild) {
    container.appendChild(tempDiv.firstChild);
  }

  // Re-setup event listeners for new content
  setTimeout(() => {
    setupLikeButtons();
  }, 100);
}

// Update genre title with current count
function updateGenreTitle(genreName, totalCount) {
  const titleText = document.querySelector(".genre-title-text");
  if (titleText) {
    titleText.textContent = `${genreName} Movies and TV Shows (${totalCount} items)`;
  }
}

// Update content display with search results (switches to grid view)
function updateContentDisplay(content, viewType = "search") {
  const container = document.getElementById("files-container");

  // Hide recommendations when showing search/genre results
  const recommendationsSection = document.querySelector(
    ".recommendations-section"
  );
  if (recommendationsSection && viewType !== "main") {
    recommendationsSection.style.display = "none";
  }

  // Hide popular content when showing search/genre results
  const popularContentSection = document.querySelector(
    ".popular-section"
  )
  if (popularContentSection && viewType !== "main") {
    popularContentSection.style.display = "none";
  }

  if (content.length === 0) {
    container.innerHTML =
      '<div class="no-content"><h3>No results found</h3></div>';
    return;
  }

  // Switch container to grid layout for search results
  container.className = "files-container";

  // Generate HTML for all content cards
  container.innerHTML = content.map((item) => createContentCard(item)).join("");

  // Use setTimeout to ensure DOM is fully updated before setting up event listeners
  setTimeout(() => {
    setupLikeButtons();
  }, 100);
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

// Global state for genre view
let currentGenreData = {
  genreName: "",
  allContent: [],
  currentFilter: "all", // 'all', 'watched', 'unwatched'
  currentPage: 1,
  isLoading: false,
  hasMore: true,
  isInfiniteScrollEnabled: true,
};

// Main functions
// Load content from server
async function loadContent() {
  const profileId = getProfileId();
  const userId = getUserId();
  const container = document.getElementById("files-container");
  const titleElement = document.getElementById("content-title");

  try {
    // Show loading message
    container.innerHTML = '<div class="loading">Loading content...</div>';
    titleElement.textContent = "Loading your content...";

    // Fetch content via API
    const feedData = await UserAPI.fetchContent(userId, profileId);

    if (!feedData) {
      throw new Error("Failed to load content");
    }

    // Render popular content section (using same fetched data)
    renderPopularContent(feedData);

    // Update title with count
    titleElement.innerHTML = `Your Movies and TV shows (${
      feedData.totalCount || 0
    } items)`;

    // Clear loading message
    container.innerHTML = "";

    // Check if recieved content
    if (feedData.genreGroups && Object.keys(feedData.genreGroups).length > 0) {
      // Create HTML for each genre
      Object.keys(feedData.genreGroups).forEach((genre) => {
        const genreSection = document.createElement("div");
        genreSection.className = "genre-section";

        // Add genre title to div
        const genreTitle = document.createElement("h2");
        genreTitle.className = "genre-title";
        genreTitle.textContent = genre;
        genreSection.appendChild(genreTitle);

        // Add genre div for cards
        const genreRow = document.createElement("div");
        genreRow.className = "genre-row";

        // Create cards for this genre
        feedData.genreGroups[genre].forEach((item) => {
          // Use the helper function to create consistent content cards
          const contentHTML = createContentCard(item);

          // Create a temporary container to parse the HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = contentHTML;
          const contentDiv = tempDiv.firstElementChild;

          // Update class name for genre view (use genre-file instead of file)
          contentDiv.className = contentDiv.className.replace(
            "file",
            "genre-file"
          );

          console.log("Default feed: Created content card for", item.name); // Debug log

          // Add card to genre
          genreRow.appendChild(contentDiv);
        });

        // Add genre to container
        genreSection.appendChild(genreRow);
        container.appendChild(genreSection);
      });

      // Set up genre click handlers
      handleGenreClick();
    } else {
      // Fallback for when content is empty
      container.innerHTML = `
                <div class="no-content">
                    <h3>No content available</h3>
                    <p>Check back later for new movies and shows!</p>
                </div>
            `;
    }
  } catch (error) {
    console.error("Error loading content:", error);
    container.innerHTML = `
            <div class="no-content">
                <h3>Error loading content</h3>
                <p>Please try refreshing the page.</p>
            </div>
        `;
  }
}

// Load recommendations
async function loadRecommendations() {
  const profileId = getProfileId();
  const userId = getUserId();
  const container = document.getElementById("recommendations-container");

  try {
    container.innerHTML =
      '<div class="loading">Loading recommendations...</div>';

    // Fetch recommendations via API
    const recommendations = await UserAPI.fetchRecommendations(
      userId,
      profileId,
      10
    );

    // Clear loading message
    container.innerHTML = "";

    if (recommendations && recommendations.length > 0) {
      // Use same structure as genre sections
      const recommendationsRow = document.createElement("div");
      recommendationsRow.className = "genre-row";

      // Create card for each recommendation
      recommendations.forEach((item) => {
        // Use the helper function to create consistent content cards
        const contentHTML = createContentCard(item);

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = contentHTML;
        const contentDiv = tempDiv.firstElementChild;

        // Update class name for genre view (use genre-file instead of file)
        contentDiv.className = contentDiv.className.replace(
          "file",
          "genre-file"
        );

        recommendationsRow.appendChild(contentDiv);
      });

      container.appendChild(recommendationsRow);

      // Set up functionality for recommendation content
      setTimeout(() => {
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
    console.error("Error loading recommendations:", error);
    container.innerHTML = `
            <div class="no-content">
                <p>Unable to load recommendations right now.</p>
            </div>
        `;
  }
}

// Load popular content (uses already-fetched feedData)
function renderPopularContent(feedData) {
  const container = document.getElementById("popular-container");

  try {
    // Clear loading message
    container.innerHTML = "";

    if (feedData && feedData.popularContent && feedData.popularContent.length > 0) {
      // Use same structure as genre sections
      const popularRow = document.createElement("div");
      popularRow.className = "genre-row";

      // Create card for each popular content item
      feedData.popularContent.forEach((item) => {
        // Use the helper function to create consistent content cards
        const contentHTML = createContentCard(item);

        // Create a temporary container to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = contentHTML;
        const contentDiv = tempDiv.firstElementChild;

        // Update class name for genre view (use genre-file instead of file)
        contentDiv.className = contentDiv.className.replace(
          "file",
          "genre-file"
        );

        popularRow.appendChild(contentDiv);
      });

      container.appendChild(popularRow);
    } else {
      // Hide the entire popular section if no data
      const popularSection = document.querySelector(".popular-section");
      if (popularSection) {
        popularSection.style.display = "none";
      }
    }
  } catch (error) {
    console.error("Error rendering popular content:", error);
    // Hide section on error
    const popularSection = document.querySelector(".popular-section");
    if (popularSection) {
      popularSection.style.display = "none";
    }
  }
}

// Load user profile avatar
async function loadUserProfile() {
  const userId = getUserId();
  const profileId = getProfileId();
  const avatarContainer = document.getElementById("profile-avatar-container");

  try {
    // Show loading spinner
    avatarContainer.innerHTML = '<div class="profile-loading"></div>';

    // Fetches profile via API
    const profiles = await UserAPI.fetchUserProfiles(userId);
    const currentProfile = profiles.find((p) => p.id === parseInt(profileId));

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
    console.error("Error loading user profile:", error);
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

// Initialize like button handlers for server-rendered content
function setupLikeButtons() {
  // Get all like icons from DOM
  const likeIcons = document.querySelectorAll(".like-icon");

  likeIcons.forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get content data from parent card element
      const parentCard = icon.closest(".file, .genre-file");
      
      if (!parentCard) {
        console.error("Could not find parent content card");
        return;
      }

      const contentId = parentCard.getAttribute("data-content-id");
      const contentName = icon.getAttribute("data-content-name");
      const userId = getUserId();
      const profileId = getProfileId();

      if (!contentId || !userId || !profileId) {
        console.error("Missing content ID, user ID, or profile ID");
        return;
      }

      // Store original state
      const wasLiked = icon.classList.contains("liked");

      try {
        // Toggle like via API
        const result = await UserAPI.toggleContentLike(
          userId,
          profileId,
          contentId
        );

        if (result && result.success) {
          // Update ALL instances of this content across the page
          updateAllContentCards(contentName, result.data.isLiked);

          // Show feedback message
          const message = result.data.isLiked
            ? `❤️ Added "${contentName}" to your liked content!`
            : `💔 Removed "${contentName}" from your liked content!`;
          showNotification(message);
        } else {
          console.error(
            "Failed to toggle like:",
            result ? result.error : "Unknown error"
          );
          showNotification("Failed to update like. Please try again.", "error");
        }
      } catch (error) {
        console.error("Error toggling like:", error);
        showNotification("Network error. Please try again.", "error");
      }
    });
  });
}

// Global flag to prevent duplicate event listeners
let genreClickHandlersSetup = false;

// Handle clicking on genre -> redirect to genre page
function handleGenreClick() {
  // Prevent setting up handlers multiple times
  if (genreClickHandlersSetup) return;
  genreClickHandlersSetup = true;

  try {
    // Get all genre titles
    const genreElems = document.querySelectorAll(".genre-title");

    genreElems.forEach((element) => {
      element.addEventListener("click", async (e) => {
        // Don't trigger for the recommendations section
        if (element.textContent === "Recommended for You") {
          return;
        }

        const genreName = element.innerText;

        if (!genreName) {
          console.error("Failed to fetch genre name from html");
          return;
        }

        try {
          const userId = getUserId();
          const profileId = getProfileId();

          // Fetches content by genre via API
          const result = await UserAPI.fetchContentByGenre(
            genreName,
            userId,
            profileId,
            1
          );

          if (result && result.content && result.content.length > 0) {
            // Reset any existing filter when switching to a new genre
            currentGenreData = {
              genreName: "",
              allContent: [],
              currentFilter: "all",
              currentPage: 1,
              isLoading: false,
              hasMore: true,
              isInfiniteScrollEnabled: true,
            };

            // Switch to genre view
            switchToGenreView(genreName, result.content, result.pagination);
          } else {
            console.error("No content found for genre:", genreName);
            const container = document.getElementById("files-container");
            container.innerHTML = `
                            <div class="no-content">
                                <h3>No ${genreName} content found</h3>
                                <p>Check back later for new movies and shows!</p>
                            </div>
                        `;
          }
        } catch (error) {
          console.error("Failed to fetch content by genre", error);
          showNotification(
            "Failed to load genre content. Please try again.",
            "error"
          );
        }
      });
    });
  } catch (error) {
    console.error("Failed to setup genre click handlers", error);
    showNotification(
      "Failed to setup genre navigation. Please try again.",
      "error"
    );
  }
}

// Switch to genre view (hide recommendations, show back button)
function switchToGenreView(genreName, content, pagination = null) {
  // Store genre data globally for filtering and pagination
  currentGenreData = {
    genreName: genreName,
    allContent: content,
    currentFilter: "all",
    currentPage: pagination ? pagination.page : 1,
    isLoading: false,
    hasMore: pagination ? pagination.hasMore : false,
    isInfiniteScrollEnabled: true,
  };

  // Update page title with back button and toggle button
  const titleElement = document.getElementById("content-title");
  if (titleElement) {
    titleElement.innerHTML = `
            <span class="back-button" onclick="returnToMainFeed()">← Back to Feed</span>
            <span class="toggle-watched-button" onclick="toggleWatchedFilter()" data-filter="all">All Content</span>
            <span class="genre-title-text">${genreName} Movies and TV Shows (${content.length} items)</span>
        `;
  }

  // Update content display
  updateContentDisplay(content, "genre");

  // Set up infinite scroll for genre view
  setupInfiniteScroll();
}

// Set up infinite scroll for genre view
function setupInfiniteScroll() {
  // Remove any existing scroll listeners
  window.removeEventListener("scroll", handleInfiniteScroll);

  // Add new scroll listener only if we're in genre view
  if (currentGenreData.genreName) {
    window.addEventListener("scroll", handleInfiniteScroll);
    console.log("Infinite scroll setup for genre:", currentGenreData.genreName);
  }
}

// Handle infinite scroll events
async function handleInfiniteScroll() {
  // Only proceed if we're in genre view and not currently loading
  if (
    !currentGenreData.genreName ||
    currentGenreData.isLoading ||
    !currentGenreData.hasMore
  ) {
    return;
  }

  // Disable infinite scroll when filtering is active (only works with 'all' content)
  if (currentGenreData.currentFilter !== "all") {
    return;
  }

  // Check if user has scrolled near the bottom
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // Trigger loading when user is 200px from bottom
  if (scrollTop + windowHeight >= documentHeight - 200) {
    await loadMoreGenreContent();
  }
}

// Load more content for current genre
async function loadMoreGenreContent() {
  if (currentGenreData.isLoading || !currentGenreData.genreName) {
    return;
  }

  currentGenreData.isLoading = true;

  try {
    // Show loading indicator
    showLoadingIndicator();

    const userId = getUserId();
    const profileId = getProfileId();
    const nextPage = currentGenreData.currentPage + 1;

    const result = await UserAPI.fetchContentByGenre(
      currentGenreData.genreName,
      userId,
      profileId,
      nextPage
    );

    if (result && result.content && result.content.length > 0) {
      // Update state
      currentGenreData.currentPage = nextPage;
      currentGenreData.allContent.push(...result.content);
      currentGenreData.hasMore = result.pagination
        ? result.pagination.hasMore
        : true;

      // Append new content to existing display (only when viewing "all" content)
      if (currentGenreData.currentFilter === "all") {
        appendContentToDisplay(result.content);
      }

      // Update title with new count
      updateGenreTitle(
        currentGenreData.genreName,
        currentGenreData.allContent.length
      );
    }
  } catch (error) {
    console.error("Error loading more content:", error);
    showNotification("Failed to load more content", "error");
  } finally {
    currentGenreData.isLoading = false;
    hideLoadingIndicator();
  }
}

// Handles watched / unwatched / all filter button
function toggleWatchedFilter() {
  const toggleButton = document.querySelector(".toggle-watched-button");
  const titleText = document.querySelector(".genre-title-text");

  if (!toggleButton || !currentGenreData.allContent.length) {
    console.error("Toggle button or genre data not found");
    return;
  }

  const userId = getUserId();
  const profileId = getProfileId();

  let filteredContent = [];
  let newFilter = "";
  let buttonText = "";
  let buttonClass = "";

  // Cycle through states: all -> watched -> unwatched -> all
  switch (currentGenreData.currentFilter) {
    case "all":
      // Show only watched content (deduplicated to avoid duplicates from infinite scroll)
      filteredContent = deduplicateContent(currentGenreData.allContent).filter(
        (item) => item.isWatched === true
      );
      newFilter = "watched";
      buttonText = "Watched Only";
      buttonClass = "filter-watched";
      break;

    case "watched":
      // Show only unwatched content (deduplicated to avoid duplicates from infinite scroll)
      filteredContent = deduplicateContent(currentGenreData.allContent).filter(
        (item) => item.isWatched === false
      );
      newFilter = "unwatched";
      buttonText = "Unwatched Only";
      buttonClass = "filter-unwatched";
      break;

    case "unwatched":
      // Show all content (keep original array with potential duplicates for infinite scroll)
      filteredContent = currentGenreData.allContent;
      newFilter = "all";
      buttonText = "All Content";
      buttonClass = "";
      break;

    default:
      // Fallback to all content
      filteredContent = currentGenreData.allContent;
      newFilter = "all";
      buttonText = "All Content";
      buttonClass = "";
  }

  // Update current filter state
  currentGenreData.currentFilter = newFilter;

  // Update button appearance
  toggleButton.textContent = buttonText;
  toggleButton.className = `toggle-watched-button ${buttonClass}`;
  toggleButton.setAttribute("data-filter", newFilter);

  // Update title with new count
  if (titleText) {
    titleText.textContent = `${currentGenreData.genreName} Movies and TV Shows (${filteredContent.length} items)`;
  }

  // Update content display with filtered results
  if (filteredContent.length === 0) {
    const container = document.getElementById("files-container");
    const emptyMessages = {
      watched: `No watched content found in ${currentGenreData.genreName}`,
      unwatched: `No unwatched content found in ${currentGenreData.genreName}`,
      all: `No content found in ${currentGenreData.genreName}`,
    };

    container.innerHTML = `
            <div class="no-content">
                <h3>${emptyMessages[newFilter]}</h3>
                <p>Try a different filter or check back later!</p>
            </div>
        `;
  } else {
    updateContentDisplay(filteredContent, "genre");
  }

  // Manage infinite scroll state based on filter
  if (newFilter === "all") {
    // Re-enable infinite scroll when showing all content
    currentGenreData.isInfiniteScrollEnabled = true;
    console.log('Infinite scroll enabled for "all content" view');
  } else {
    // Disable infinite scroll when filtering (watched/unwatched)
    currentGenreData.isInfiniteScrollEnabled = false;
    console.log(`Infinite scroll disabled for "${newFilter}" filter view`);
  }

  // Show notification about filter change
  const filterMessages = {
    watched: `Showing ${filteredContent.length} watched items`,
    unwatched: `Showing ${filteredContent.length} unwatched items`,
    all: `Showing all ${filteredContent.length} items`,
  };

  showNotification(filterMessages[newFilter]);
}

// Return to main feed view
function returnToMainFeed() {
  // Reset genre data state
  currentGenreData = {
    genreName: "",
    allContent: [],
    currentFilter: "all",
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    isInfiniteScrollEnabled: true,
  };

  // Reset container class back to genre-container
  const container = document.getElementById("files-container");
  if (container) {
    container.className = "genre-container";
  }

  // Show recommendations section again
  const recommendationsSection = document.querySelector(
    ".recommendations-section"
  );
  if (recommendationsSection) {
    recommendationsSection.style.display = "";
  }

  // Show popular content section again
  const popularContentSection = document.querySelector(
    ".popular-section"
  );
  if (popularContentSection) {
    popularContentSection.style.display = "";
  }

  // Clear search input if it's visible
  const searchInput = document.querySelector(".search-input");
  if (searchInput && searchInput.classList.contains("visible")) {
    searchInput.value = "";
    searchInput.classList.remove("visible");

    const sortButton = document.querySelector(".sort-button");
    if (sortButton) {
      sortButton.classList.remove("visible", "active");
    }
  }

  // Remove active class from aside genre items
  const genreList = document.querySelector(".genre-list");
  if (genreList) {
    genreList
      .querySelectorAll("li")
      .forEach((item) => item.classList.remove("active"));
  }

  // Restore original title
  const titleElement = document.getElementById("content-title");
  if (titleElement) {
    titleElement.innerHTML = "Loading your content...";
  }

  // Reload the main content
  loadContent();
}

// Make functions available globally for onclick handlers
window.returnToMainFeed = returnToMainFeed;
window.toggleWatchedFilter = toggleWatchedFilter;

// Global flag to prevent duplicate content card click setup
let contentCardClickSetup = false;

// Set up content card click navigation to content details page
function setupContentCardNavigation() {
  // Only set up the delegated listener once
  if (contentCardClickSetup) return;
  contentCardClickSetup = true;

  // Use event delegation on the document body for better performance
  document.body.addEventListener("click", (e) => {
    // Check if the clicked element is a content card
    const element = e.target.closest(".genre-file, .file");
    
    // If not a card, ignore click
    if (!element) {
      return;
    }

    // Don't trigger if clicking on like button or any child of like button
    if (
      e.target.classList.contains("like-icon") ||
      e.target.closest(".like-icon")
    ) {
      return;
    }

    // Get content and user data
    const contentId = element.getAttribute("data-content-id");
    const userId = getUserId();
    const profileId = getProfileId();

    // Validate required data
    if (!contentId || !userId || !profileId) {
      console.error(
        "Missing content ID, user ID, or profile ID for navigation"
      );
      return;
    }

    // Navigate to content details page
    window.location.href = `/content/${contentId}?userId=${userId}&profileId=${profileId}`;
  });
}

// Initialize search functionality
function setupSearch() {
  const searchIcon = document.querySelector(".search-icon");
  const searchInput = document.querySelector(".search-input");
  const sortButton = document.querySelector(".sort-button");

  if (!searchIcon || !searchInput) return;

  searchIcon.addEventListener("click", () => {
    // Set search elements visibility
    searchInput.classList.toggle("visible");
    if (sortButton) sortButton.classList.toggle("visible");

    if (searchInput.classList.contains("visible")) {
      searchInput.focus();
    } else {
      // Clear search and restore main feed view
      searchInput.value = "";
      // Reset sort button state when closing search
      if (sortButton) {
        sortButton.classList.remove("active");
      }
      returnToMainFeed();
    }
  });

  // Handle search input
  searchInput.addEventListener("input", debounce(searchContent, 300));

  // Handle sort button
  if (sortButton) {
    sortButton.addEventListener("click", () => {
      sortButton.classList.toggle("active");

      // Re-run search with current query to apply sorting
      searchContent();
    });
  }
}

// Perform search with optional sorting
async function searchContent() {
  const searchInput = document.querySelector(".search-input");
  const query = searchInput.value.trim();
  const userId = getUserId();
  const profileId = getProfileId();

  // If query is too short, just return without doing anything
  if (query.length < 2) {
    return;
  }

  try {
    // Search content using API
    const result = await UserAPI.searchContent(query, userId, profileId);

    if (result.success) {
      let searchResults = result.data;

      // Apply A-Z sorting if sort button is active
      const sortButton = document.querySelector(".sort-button");
      if (sortButton && sortButton.classList.contains("active")) {
        searchResults = searchResults.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      }

      // Update title to show search results with back button
      const titleElement = document.getElementById("content-title");
      if (titleElement) {
        titleElement.innerHTML = `
                    <span class="back-button" onclick="returnToMainFeed()">← Back to Feed</span>
                    <span class="genre-title-text">Search Results for "${query}" (${searchResults.length} items)</span>
                `;
      }

      updateContentDisplay(searchResults, "search");
    } else {
      console.error("Search failed:", result.error);
    }
  } catch (error) {
    console.error("Search error:", error);
  }
}

// Initialize hamburger menu
function setupHamburgerMenu() {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });

    navMenu.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-selection")) {
        navMenu.classList.remove("show");
      }
    });
  }
}

// Initialize aside for genres
async function setupAside() {
  const genreList = document.querySelector(".genre-list");

  if (!genreList) {
    console.error("Genre list element not found");
    return;
  }

  try {
    const userId = getUserId();
    const profileId = getProfileId();

    if (!userId || !profileId) {
      console.error("User ID or Profile ID not found for aside setup");
      return;
    }

    // Fetch content via API
    const feedData = await UserAPI.fetchContent(userId, profileId);

    if (!feedData || !feedData.genreGroups) {
      console.error("No genre data found");
      return;
    }

    // Fetch genre groups
    const genres = feedData.genreGroups;

    // Clear existing content
    genreList.innerHTML = "";

    // Validate genres list
    if (genres && Object.keys(genres).length > 0) {
      // Iterate over genres
      Object.keys(genres).forEach((genreName) => {
        // Create new li element
        const newGenreItem = document.createElement("li");
        newGenreItem.textContent = genreName;
        newGenreItem.setAttribute("data-genre", genreName);

        // Add click handler for genre navigation
        newGenreItem.addEventListener("click", async () => {
          try {
            // Remove active class from all items
            genreList
              .querySelectorAll("li")
              .forEach((item) => item.classList.remove("active"));
            // Add active class to clicked item
            newGenreItem.classList.add("active");

            // Fetch and display genre content
            const result = await UserAPI.fetchContentByGenre(
              genreName,
              userId,
              profileId,
              1
            );
            if (result && result.content && result.content.length > 0) {
              switchToGenreView(genreName, result.content, result.pagination);
            }
          } catch (error) {
            console.error("Error loading genre from aside:", error);
            showNotification("Failed to load genre content", "error");
          }
        });

        // Append item to list
        genreList.appendChild(newGenreItem);
      });
    } else {
      console.log("No genres found, showing fallback message");
      genreList.innerHTML = '<li style="color: #666;">No genres available</li>';
    }
  } catch (error) {
    console.error("Error setting up aside:", error);
    genreList.innerHTML = '<li style="color: #666;">Error loading genres</li>';
  }
}

// Initialize logout functionality
function setupLogout() {
  const logoutLinks = document.querySelectorAll('a[href="/logout"]');

  logoutLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Clear localStorage
      localStorage.clear();

      // Redirect to logout
      window.location.href = "/logout";
    });
  });
}

// Initialize feed when page loads
document.addEventListener("DOMContentLoaded", async () => {
  // Load user profile avatar
  await loadUserProfile();

  // Load recommendations
  await loadRecommendations();

  // Load content (also renders popular content)
  await loadContent();

  // Load aside
  await setupAside();

  // Set up content card navigation to details page
  setupContentCardNavigation();

  // Set up like buttons
  setupLikeButtons();

  // Initialize search
  setupSearch();

  // Initialize hamburger menu
  setupHamburgerMenu();

  // initialize logout button
  setupLogout();

  // Show welcome message if profile is selected
  const selectedProfile = JSON.parse(
    localStorage.getItem("selectedProfile") || "{}"
  );
  const welcomeShown = localStorage.getItem("welcomeShown");

  if (selectedProfile.name && !welcomeShown) {
    showNotification(`👋 Welcome back ${selectedProfile.name}!`);
    localStorage.setItem("welcomeShown", "true");
  }
});
