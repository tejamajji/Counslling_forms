const mongoose = require("mongoose"); 
const AdminSchema = new mongoose.Schema({
  employee_name: { type: String, required: true },
  employee_id: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String }
});
module.exports = mongoose.model("Admin", AdminSchema);