
async function renderSignupPage(req, res) {
    try {
        res.render('signup');
    }
    catch (error) {
        console.error('Error rendering signup page:', error);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = {
    renderSignupPage
}