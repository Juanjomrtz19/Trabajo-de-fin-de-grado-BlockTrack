import * as yup from "yup";
import { Conduce } from "../models/conduce";
import { GeneralError } from "../server/serverInterface";
import { ValidationError as YupValidationError } from "yup";

const conduceSchema = yup.object().shape({
  transporteId: yup.number().required(),
  transportistaId: yup.number().required(),
});

export const validateConduce = (data: unknown): Conduce => {
  try {
    return conduceSchema.validateSync(data, {
      abortEarly: false,
      stripUnknown: true,
    }) as Conduce;
  } catch (error) {
    if (error instanceof YupValidationError) {
      throw new GeneralError(400, error.message, "validaciones");
    }
    throw new GeneralError(500, "Internal Server Error", "servidor");
  }
};
