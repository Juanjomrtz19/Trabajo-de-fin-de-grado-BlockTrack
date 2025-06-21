import { Request, Response } from "express";
import * as userService from "../services/user";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password, role, dni } = req.body;
    const userData = {
      name: firstName,
      lastName,
      email,
      phone: String(phone),
      password,
      role,
      dni,
    };
    console.log("userData", userData);
    const result = await userService.registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: (error as Error).message });
  }
};
