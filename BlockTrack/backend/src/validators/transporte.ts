import * as yup from "yup";
import { Transporte } from "../models/transporte";
import { GeneralError } from "../server/serverInterface";
import { ValidationError as YupValidationError } from "yup";

const transporteSchema = yup.object().shape({
  tipoCarga: yup.string().required(),
  matricula: yup.string().required(),
  capacidadCarga: yup.string().required(),
  marca: yup.string().required(),
});

export const validateTransporte = (data: unknown): Transporte => {
  try {
    return transporteSchema.validateSync(data, {
      abortEarly: false,
      stripUnknown: true,
    }) as Transporte;
  } catch (error) {
    if (error instanceof YupValidationError) {
      throw new GeneralError(400, error.message, "validaciones");
    }
    throw new GeneralError(500, "Internal Server Error", "servidor");
  }
};
