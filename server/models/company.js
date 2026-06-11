import mongoose from "mongoose";

const companySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  openRoles: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Company", companySchema);
