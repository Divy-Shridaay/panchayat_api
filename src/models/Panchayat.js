import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  villageCode: String,
  taluka: String,
  district: String
});

export default mongoose.model("Panchayat", schema);
