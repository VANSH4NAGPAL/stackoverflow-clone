import Company from "../models/company.js";

// initCompanies removed because we are entirely organic now.

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: companies });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch companies" });
  }
};

export const addCompany = async (req, res) => {
  const { name, description, industry, location, openRoles } = req.body;
  try {
    const newCompany = await Company.create({ name, description, industry, location, openRoles });
    return res.status(201).json({ message: "Company successfully created", data: newCompany });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create company" });
  }
};
