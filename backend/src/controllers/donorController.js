import User from '../models/User.js';

export const getDonors = async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;

    // Har us user ko include karein jo donor role ya isDonor flag rakhta ho
    let query = {
      $or: [
        { role: 'donor' },
        { isDonor: true }
      ]
    };

    if (bloodGroup && bloodGroup.trim() !== '') {
      query.bloodGroup = bloodGroup.trim();
    }

    if (city && city.trim() !== '') {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    // Password chhodein baaki sab fetch karein
    const donors = await User.find(query).select('-password');
    res.status(200).json(donors);
  } catch (error) {
    console.error("Backend Error in getDonors:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};