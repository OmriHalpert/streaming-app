document.addEventListener('DOMContentLoaded', () => {
    const profileName = localStorage.getItem('selectedProfileName');
    
    // Add a small delay to ensure page is fully rendered
    setTimeout(() => {
        if (profileName) {
            alert(`Hello ${profileName}!`);
        } else {
            console.log('No profile name found in localStorage');
        }
    }, 500);
});