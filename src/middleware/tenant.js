export default function tenant(req, res, next) {
  req.panchayat = "panchayat";  // only one collection
  next();
}
