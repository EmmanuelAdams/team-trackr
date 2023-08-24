import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserDocument } from "../models/User";
import asyncHandler from "../middlewares/async";

export const logoutUser = (req: Request, res: Response) => {
  res.setHeader("Authorization", ""); 
 
  return res.status(200).json({
    message: "User logged out successfully",
  });
};

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email }); 
    if (!existingUser) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const secretKey = process.env.SECRET_KEY || "qwert@4321";
    const token = jwt.sign({ userId: existingUser._id }, secretKey, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: existingUser,
      token: token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export const registerEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, level, yearsOfWork, availability } =
        req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (availability) {
        if (
          availability.status === "Not Available" &&
          (!availability.reason || !availability.nextAvailability)
        ) {
          return res.status(400).json({
            message:
              'Reason and next Available date are required for "Not Available" status',
          });
        }
        if (availability.nextAvailability) {
          availability.nextAvailability = new Date(
            availability.nextAvailability
          );
        }
      }

      const newUser: Partial<UserDocument> = {
        name,
        email,
        password: hashedPassword,
        level: level as "Junior" | "Mid-level" | "Senior" | "CEO",
        yearsOfWork,
        availability,
        userType: "Employee",
      };

      // Generate JWT token
      const secretKey = "qwert@4321";

      // const options = {
      //   expiresIn: '7d',
      // };
      // const token = jwt.sign(
      //   secretKey,
      //   { expiresIn: '7d' }
      // );

      // const token = jwt.sign(secretKey, options);

      const createdUser = await User.create(newUser as UserDocument);

      return res.status(201).json({
        message: "Employee registered successfully",
        user: createdUser,
        // token: token
      });
    } catch (error) {
      console.error("Error registering employee:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export const registerOrganization = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, level, yearsOfWork, organizationName } =
        req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: Partial<UserDocument> = {
        name,
        email,
        password: hashedPassword,
        level: level as "Junior" | "Mid-level" | "Senior" | "CEO",
        yearsOfWork,
        organizationName,
        userType: "Organization",
      };

      const createdUser = await User.create(newUser as UserDocument);

      return res.status(201).json({
        message: "Organization registered successfully",
        user: createdUser,
      });
    } catch (error) {
      console.error("Error registering organization:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);
