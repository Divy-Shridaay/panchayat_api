import Pedhinamu from "../models/Pedhinamu.js";
import PedhinamuFormDetails from "../models/PedhinamuFormDetails.js";

// Create basic Pedhinamu (Alive only)
export const createPedhinamu = async (req, res) => {
  try {
    const data = req.body;

    // remove empty heirs
    data.heirs = data.heirs.filter((h) => h.name && h.relation);

    const saved = await Pedhinamu.create(data);

    return res.json({
      message: "Pedhinamu saved successfully",
      data: saved
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to create Pedhinamu" });
  }
};

// List all Pedhinamu
export const getPedhinamus = async (req, res) => {
  const list = await Pedhinamu.find().sort({ createdAt: -1 });
  res.json(list);
};

// Save full form
export const saveFullForm = async (req, res) => {
  try {
    const { id } = req.params;

    const saved = await PedhinamuFormDetails.findOneAndUpdate(
      { pedhinamuId: id },
      { ...req.body, pedhinamuId: id, heirType: "alive" },
      { upsert: true, new: true }
    );

    await Pedhinamu.findByIdAndUpdate(id, { hasFullForm: true });

    res.json({
      message: "Full form saved successfully",
      data: saved
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save form" });
  }
};

// Get full details
export const getFullPedhinamu = async (req, res) => {
  try {
    const { id } = req.params;

    const pedhinamu = await Pedhinamu.findById(id);
    const form = await PedhinamuFormDetails.findOne({ pedhinamuId: id });

    res.json({ pedhinamu, form });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get pedhinamu" });
  }
};
