
// Renders login page
async function renderLoginPage(req, res) {
    try {
        res.render('login');
    }
    catch (error) {
        console.error('Error rendering login page:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    renderLoginPage
}