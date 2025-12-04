import ActivityLog from "../models/ActivityLog.js";

export default function logger(action, module, details = {}) {
  return async (req, res, next) => {
    await ActivityLog.create({
      userId: req.user?._id,
      action,
      module,
      details,
      ip: req.ip
    });
    next();
  };
}
