export function softDelete(model) {
  return async (req, res) => {
    const doc = await model.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not Found" });

    doc.isDeleted = true;
    await doc.save();

    res.json({ message: "Soft deleted" });
  };
}
