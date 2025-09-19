// Profiles array
const profiles = [
    {
        imageSrc: "resources/profile1.jpg",
        imageAlt: "Profile 1",
        placeholder: "User 1"
    },
    {
        imageSrc: "resources/profile2.jpg",
        imageAlt: "Profile 2",
        placeholder: "User 2"
    },
    {
        imageSrc: "resources/profile3.jpg",
        imageAlt: "Profile 3",
        placeholder: "User 3"
    },
    {
        imageSrc: "resources/profile4.jpg",
        imageAlt: "Profile 4",
        placeholder: "User 4"
    },
    {
        imageSrc: "resources/profile5.jpg",
        imageAlt: "Profile 5",
        placeholder: "User 5"
    }
];

// Renders profiles to the DOM
const renderProfiles = () => {
    const profilesContainer = document.getElementById('profiles-container');
    profilesContainer.innerHTML = '';

    profiles.forEach(profile => {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'profile';
        
        profileDiv.innerHTML = `
            <img
                src="${profile.imageSrc}"
                alt="${profile.imageAlt}"
                class="profile-image"
            />
            <input
                class="name-input"
                type="text"
                placeholder="${profile.placeholder}"
            />
        `;
        
        profilesContainer.appendChild(profileDiv);
    });
};

// Call renderProfiles when the page loads (loads profiles to page)
document.addEventListener('DOMContentLoaded', renderProfiles);