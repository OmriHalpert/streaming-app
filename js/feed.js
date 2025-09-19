Files = [
    {
        name: "movie1",
        year: 2020,
        genre: "Action",
        likes: 100
    },
    {
        name: "movie2",
        year: 2021,
        genre: "Comedy",
        likes: 150
    },
    {
        name: "movie3",
        year: 2019,
        genre: "Drama",
        likes: 80
    },
    {
        name: "movie4",
        year: 2022,
        genre: "Thriller",
        likes: 200
    },
    {
        name: "movie5",
        year: 2021,
        genre: "Horror",
        likes: 120
    },
    {
        name: "movie6",
        year: 2020,
        genre: "Sci-Fi",
        likes: 180
    },
    {
        name: "movie7",
        year: 2023,
        genre: "Adventure",
        likes: 90
    },
    {
        name: "movie8",
        year: 2022,
        genre: "Romance",
        likes: 160
    },
    {
        name: "movie9",
        year: 2021,
        genre: "Mystery",
        likes: 140
    },
    {
        name: "movie10",
        year: 2023,
        genre: "Fantasy",
        likes: 170
    },
    {
        name: "movie11",
        year: 2020,
        genre: "Documentary",
        likes: 110
    },
    {
        name: "movie12",
        year: 2022,
        genre: "Animation",
        likes: 190
    }
]

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
            <img src="resources/heart.png" alt="Like Icon" class="like-icon" data-index="${index}" />
        `;

        // Add click handler for the like icon
        fileDiv.querySelector('.like-icon').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the file div click event
            const icon = e.target;
            const index = parseInt(icon.dataset.index);
            
            // Toggle liked state
            icon.classList.toggle('liked');
            
            // Update likes count
            const likesElement = fileDiv.querySelector('.likes-count');
            Files[index].likes = icon.classList.contains('liked') 
                ? Files[index].likes + 1 
                : Files[index].likes - 1;
            likesElement.textContent = Files[index].likes;
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