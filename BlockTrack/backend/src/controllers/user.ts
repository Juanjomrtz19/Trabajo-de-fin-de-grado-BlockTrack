import { Request, Response } from "express";
import * as userService from "../services/user";
import { registerUserSchema } from "../validators/user";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, phone, password, role, dni } = req.body;

  try {
    console.log("[USER][REGISTER] Request");

    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.format() });
      return;
    }

    const userData = {
      name: firstName,
      lastName,
      email,
      phone: String(phone),
      password,
      role,
      dni,
    };

    const result = await userService.registerUser(userData);

    console.log("[USER][REGISTER] Succest");
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    console.log("[USER][LOGIN] Request");
    const result = await userService.loginUser(email, password);
    res.cookie("token", result, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    });

    console.log("[USER][LOGIN] Succest");
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: (error as Error).message });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.cookies.token;
  try {
    console.log("[USER][GETCURRENTUSER] Request");
    const user = userService.verifyToken(token);
    if (!user) res.status(401).json({ message: "Unauthorized" });
    res.status(200).json({ user });
    console.log("[USER][GETCURRENTUSER] Succest");
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
