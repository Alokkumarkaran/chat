exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
    const files = req.files.map(f => ({
      url: `${process.env.FRONTEND_ORIGIN || ''}/uploads/${f.filename}`,
      name: f.originalname,
      size: f.size,
      mime: f.mimetype
    }));
    res.json({ ok: true, files });
  } catch (err) {
    next(err);
  }
};
