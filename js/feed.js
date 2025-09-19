// Holds initial files data
const initialFiles = [
    {
        name: "movie1",
        year: 2020,
        genre: "Action",
        likes: 100,
        liked: false
    },
    {
        name: "movie2",
        year: 2021,
        genre: "Comedy",
        likes: 150,
        liked: false
    },
    {
        name: "movie3",
        year: 2019,
        genre: "Drama",
        likes: 80,
        liked: false
    },
    {
        name: "movie4",
        year: 2022,
        genre: "Thriller",
        likes: 200,
        liked: false
    },
    {
        name: "movie5",
        year: 2021,
        genre: "Horror",
        likes: 120,
        liked: false
    },
    {
        name: "movie6",
        year: 2020,
        genre: "Sci-Fi",
        likes: 180,
        liked: false
    },
    {
        name: "movie7",
        year: 2023,
        genre: "Adventure",
        likes: 90,
        liked: false
    },
    {
        name: "movie8",
        year: 2022,
        genre: "Romance",
        likes: 160,
        liked: false
    },
    {
        name: "movie9",
        year: 2021,
        genre: "Mystery",
        likes: 140,
        liked: false
    },
    {
        name: "movie10",
        year: 2023,
        genre: "Fantasy",
        likes: 170,
        liked: false
    },
    {
        name: "movie11",
        year: 2020,
        genre: "Documentary",
        likes: 110,
        liked: false
    },
    {
        name: "movie12",
        year: 2022,
        genre: "Animation",
        likes: 190,
        liked: false
    }
];

// Load files from localStorage or use initial files
Files = JSON.parse(localStorage.getItem('moviesData')) || initialFiles;

// Render movies and TV shows (files)
const renderFiles = () => {
    const filesContainer = document.getElementById('files-container');
    filesContainer.innerHTML = '';
    Files.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'file';
        fileDiv.innerHTML = `
            <h3>${file.name} (${file.year})</h3>
            <p>Genre: ${file.genre}</p>
            <p>Likes: <span class="likes-count">${file.likes}</span></p>
            <img src="resources/heart.png" alt="Like Icon" class="like-icon ${file.liked ? 'liked' : ''}" data-index="${index}" />
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

document.addEventListener('DOMContentLoaded', () => {

    // Load profile login message
    const profileName = localStorage.getItem('selectedProfileName');
    // Add a small delay to ensure page is fully rendered
    setTimeout(() => {
        if (profileName) {
            alert(`Hello ${profileName}!`);
        } else {
            console.log('No profile name found in localStorage');
        }
    }, 500);

    // renders files to the DOM
    renderFiles();
});