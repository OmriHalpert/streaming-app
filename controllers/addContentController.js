//Imports


// Main functions
// Render add-content (admin) page
// Note: Authentication and admin check is handled by requireAdminAuth middleware
async function renderAddContentPage(req, res) {
  try {
    res.render("add-content");
  } catch (error) {
    console.error("Error rendering admin page:", error);
    return res.status(500).render("error", {
      error: "Server Error",
      message: "Error rendering admin page",
      statusCode: 500
    });
  }
}

module.exports = { renderAddContentPage };