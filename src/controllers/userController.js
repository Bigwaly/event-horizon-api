async function getProfile(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt
      }
    }
  });
}

module.exports = { getProfile };
