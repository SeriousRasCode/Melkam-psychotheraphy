import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { UserRepository } from "../repositories/user.repository";
import { sendOtpEmail } from "../utils/email.util";
import { z } from "zod";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const userSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["THERAPIST", "PATIENT", "ADMIN"]),
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class UserService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role // 🔑 enforce enum type
  ) {
    userSchema.parse({ firstName, lastName, email, password, role });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.repository.createUser(
      firstName,
      lastName,
      email,
      hashedPassword,
      role,
      verificationToken
    );

    await sendOtpEmail(email, otp, "verify");
    return { message: "Verification OTP sent", verificationToken };
  }

  async verifyEmail(token: string, otp: string) {
    const user = await this.repository.findByVerificationToken(token);
    if (!user) throw new Error("Invalid token");
    // Assume OTP is validated via cache/session
    await this.repository.updateVerification(token, true, null);
    return { message: "Email verified" };
  }

  async login(email: string, password: string) {
    userSchema.pick({ email: true, password: true }).parse({ email, password });
    const user = await this.repository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    await this.repository.updateRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     const decoded: any = jwt.verify(refreshToken, JWT_SECRET);
  //     const user = await this.repository.findById(decoded.userId);
  //     if (!user || user.refreshToken !== refreshToken)
  //       throw new Error("Invalid token");

  //     const accessToken = jwt.sign(
  //       { id: user.id, role: user.role },
  //       JWT_SECRET,
  //       { expiresIn: "1h" }
  //     );
  //     return { accessToken };
  //   } catch {
  //     throw new Error("Invalid refresh token");
  //   }
  // }
async refreshToken(refreshToken: string) {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

    const user = await this.repository.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { accessToken };
  } catch (err) {
    throw new Error("Invalid refresh token");
  }
}


  async forgotPassword(email: string) {
    userSchema.pick({ email: true }).parse({ email });
    const user = await this.repository.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = uuidv4();

    // 🔑 create a repo method to update verification by userId
    await this.repository.updateVerificationById(user.id, verificationToken);

    await sendOtpEmail(email, otp, "reset");
    return { message: "Reset OTP sent", verificationToken };
  }

  async resetPassword(token: string, otp: string, password: string) {
    userSchema.pick({ password: true }).parse({ password });
    const user = await this.repository.findByVerificationToken(token);
    if (!user) throw new Error("Invalid token");

    // Assume OTP is validated elsewhere
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.repository.updatePassword(token, hashedPassword);

    return { message: "Password reset successful" };
  }
}
