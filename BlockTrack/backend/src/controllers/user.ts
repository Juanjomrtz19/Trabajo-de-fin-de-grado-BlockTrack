import { Request, Response } from "express";
import * as userService from "../services/user";
import { registerUserSchema } from "../validators/user";
import { UserUpdate } from "../models/user";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, lastName, email, phone, password, role, dni } = req.body;

  try {
    console.log("[USER][REGISTER] Request");

    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.format() });
      return;
    }

    const userData = {
      name: name,
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
    res.status(401).json({ message: "There was something wrong" });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logout successful" });
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { dni, name, lastName, email, phone, role } = req.body;

  const { id } = req.user!;

  const data: UserUpdate = {
    dni: dni,
    name: name,
    lastName: lastName,
    email: email,
    phone: phone,
    role: role,
    id,
  };

  try {
    console.log("[USER][UPDATEUSER] Request");
    const result = await userService.updateUser(data);

    res.status(200).json({ user: result });
    console.log("[USER][UPDATEUSER] Succest");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating user" });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.cookies.token;
  try {
    console.log("[USER][GETCURRENTUSER] Request");
    const user = await userService.verifyToken(token);
    if (!user) res.status(401).json({ message: "Unauthorized" });
    console.log("user", user);
    res.status(200).json({ user });
    console.log("[USER][GETCURRENTUSER] Succest");
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
