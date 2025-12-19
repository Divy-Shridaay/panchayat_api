import User from "../models/User.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ---------- Gmail transporter ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,   // ✅ correct

  },
});




// ---------- sendMail function ----------
export const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,  // Important Fix
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
};


// ---------- Helper Functions ----------

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate random username
const generateUsername = (firstName) => {
  return `${firstName.toLowerCase()}_${Date.now()}`;
};

// Generate random password
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// ---------- Step 1: Send OTP ----------
export const sendOTP = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      email,
      phone,
      pinCode,
      taluko
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !gender || !email || !phone || !pinCode || !taluko) {
      return res.status(400).json({
        message: "બધા જરૂરી ફીલ્ડ ભરો (All required fields needed)"
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "આ ઇમેઇલ પહેલાથી રજીસ્ટર છે (Email already registered)"
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update user with OTP
    const user = await User.findOneAndUpdate(
      { email },
      {
        firstName,
        middleName,
        lastName,
        gender,
        dob,
        email,
        phone,
        pinCode,
        taluko,
        otp,
        otpExpiry,
        isVerified: false
      },
      { upsert: true, new: true }
    );

    // Send OTP via email
    const htmlContent = `
      <h2>OTP ચકાસણી (Verification)</h2>
      <p>નમસ્તે ${firstName},</p>
      <p>તમારો OTP નીચે મુજબ છે:</p>
      <h1 style="color: #2563eb; font-size: 32px;">${otp}</h1>
      <p>આ OTP 10 મિનિટમાં સમાપ્ત થઈ જશે.</p>
      <p>જો તમે આ વિનંતી ન કરી હોય તો આ ઇમેઇલને અવગણો.</p>
    `;

    await sendMail(email, "Panchayat Dashboard - OTP Verification", htmlContent);

    return res.json({
      message: "OTP મોકલી દેવાયો છે (OTP sent to your email)",
      email,
      userId: user._id
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "OTP મોકલવામાં નિષ્ફળ (Failed to send OTP)",
      error: err.message
    });
  }
};


// ---------- Step 2: Verify OTP and Create Account ----------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "ઇમેઇલ અને OTP બન્ને જરૂરી છે"
      });
    }

    // Find user by email
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        message: "યુઝર મળ્યો નથી (User not found)"
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP સમાપ્ત થઈ ગયો છે (OTP expired)"
      });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "ખોટો OTP (Incorrect OTP)"
      });
    }

    // Generate username and password
    const username = generateUsername(user.firstName);
    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Update user
    user.username = username;
    user.password = hashedPassword;
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.name = `${user.firstName} ${user.middleName || ""} ${user.lastName}`.trim();
    user.trialStartDate = new Date(); // Start trial period
    
    await user.save();

    // Send credentials via email
    const htmlContent = `
      <h2>તમારું એકાઉન્ટ સફળતાપૂર્વક બનાવાયું!</h2>
      <p>નમસ્તે ${user.firstName},</p>
      <p>તમારું એકાઉન્ટ રજીસ્ટર થઈ ગયું છે. અહીં ваши login credentials છે:</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${rawPassword}</p>
      <p><strong>Login URL:</strong> http://localhost:5173/login</p>
      <br/>
      <p style="color: #dc2626;"><strong>મહત્વપૂર્ણ:</strong> પહેલી વખત login પછી તમારું password બદલશો.</p>
    `;

    await sendMail(email, "Panchayat Dashboard - Login Credentials", htmlContent);

    return res.json({
      message: "એકાઉન્ટ સફળતાપૂર્વક બનાવાયું (Account created successfully)",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: username,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "OTP ચકાસવામાં નિષ્ફળ (OTP verification failed)",
      error: err.message
    });
  }
};

// ---------- Admin: Get all registered users ----------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false })
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    return res.json({
      message: "બધા યુઝર્સની યાદી (All users list)",
      totalUsers: users.length,
      users
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "યુઝર્સ લાવવામાં નિષ્ફળ ગયો (Failed to fetch users)",
      error: err.message
    });
  }
};


// ---------- Admin: Get single user details ----------
export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    
    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી (User not found)"
      });
    }

    return res.json({
      message: "ઉપયોગકર્તાની વિગત (User details)",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "ઉપયોગકર્તાની માહિતી મેળવી શકાઈ નહીં (Failed to fetch user)",
      error: err.message
    });
  }
};

// ---------- Admin: Activate user (set isPaid to true) ----------
export const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isPaid: true },
      { new: true }
    ).select("-password -otp -otpExpiry");
    
    if (!user) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી (User not found)"
      });
    }

    return res.json({
      message: "ઉપયોગકર્તા સક્રિય કર્યો (User activated)",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "ઉપયોગકર્તાને સક્રિય કરવામાં નિષ્ફળ (Failed to activate user)",
      error: err.message
    });
  }
};

// ---------- Get current user status ----------
export const getUserStatus = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming auth middleware sets req.user
    
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    
    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: "ઉપયોગકર્તા મળ્યો નથી (User not found)"
      });
    }

    // Calculate days since trial start
    let daysSinceTrial = 0;
    if (user.trialStartDate) {
      const now = new Date();
      const trialStart = new Date(user.trialStartDate);
      daysSinceTrial = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
    }

    const canAccessModules = user.isPaid || daysSinceTrial < 8;
    const canPrint = user.isPaid || user.printCount < 5;

    return res.json({
      message: "ઉપયોગકર્તાની સ્થિતિ (User status)",
      user: {
        ...user.toObject(),
        daysSinceTrial,
        canAccessModules,
        canPrint
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "સ્થિતિ મેળવવામાં નિષ્ફળ (Failed to get status)",
      error: err.message
    });
  }
};

// ---------- Increment print count ----------
// ---------- Increment print count ----------
export const incrementPrintCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ CHANGE: Check isPaid instead of isActive
    if (user.isPaid) {
      user.printCount += 1;
      await user.save();

      return res.json({
        canPrint: true,
        reason: "PAID_USER",
        printCount: user.printCount,
        user
      });
    }

    // ❌ TRIAL USER
    const FREE_PRINT_LIMIT = 5;

    if (user.printCount >= FREE_PRINT_LIMIT) {
      return res.json({
        canPrint: false,
        reason: "FREE_LIMIT_EXCEEDED",
        printCount: user.printCount,
        user
      });
    }

    // ✅ ALLOW PRINT & INCREMENT
    user.printCount += 1;
    await user.save();

    return res.json({
      canPrint: true,
      reason: "FREE_TRIAL",
      printCount: user.printCount,
      user
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to increment print count",
      error: err.message
    });
  }
};


