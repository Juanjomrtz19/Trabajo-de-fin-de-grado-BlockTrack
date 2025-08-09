import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface RegisterData {
  rol: "CLIENTE" | "TRANSPORTISTA" | "";
  nombre: string;
  apellidos: string;
  dni: string;
  email: string;
  telefono: string;
  contrasenia: string;
  confirmarContrasenia: string;
  direccionPrincipal?: string | null;
  zonaOperativa?: string | null;
  disponibilidadActual?: boolean | null;
  documentacionValidad?: boolean | null;
}

const initialState: RegisterData = {
  rol: "",
  nombre: "",
  apellidos: "",
  dni: "",
  email: "",
  telefono: "",
  contrasenia: "",
  confirmarContrasenia: "",
  direccionPrincipal: null,
  zonaOperativa: null,
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    setRol: (
      state,
      action: PayloadAction<{ rol: "CLIENTE" | "TRANSPORTISTA" | "" }>
    ) => {
      state.rol = action.payload.rol;
    },

    setNombre: (state, action: PayloadAction<{ nombre: string }>) => {
      state.nombre = action.payload.nombre;
    },

    setApellidos: (state, action: PayloadAction<{ apellidos: string }>) => {
      state.apellidos = action.payload.apellidos;
    },

    setDni: (state, action: PayloadAction<{ dni: string }>) => {
      state.dni = action.payload.dni;
    },

    setEmail: (state, action: PayloadAction<{ email: string }>) => {
      state.email = action.payload.email;
    },

    setTelefono: (state, action: PayloadAction<{ telefono: string }>) => {
      state.telefono = action.payload.telefono;
    },

    setContrasenia: (state, action: PayloadAction<{ contrasenia: string }>) => {
      state.contrasenia = action.payload.contrasenia;
    },

    setConfirmarContrasenia: (
      state,
      action: PayloadAction<{ confirmarContrasenia: string }>
    ) => {
      state.confirmarContrasenia = action.payload.confirmarContrasenia;
    },

    setDireccionPrincipal: (
      state,
      action: PayloadAction<{ direccionPrincipal: string | null }>
    ) => {
      state.direccionPrincipal = action.payload.direccionPrincipal;
    },

    setZonaOperativa: (
      state,
      action: PayloadAction<{ zonaOperativa: string | null }>
    ) => {
      state.zonaOperativa = action.payload.zonaOperativa;
    },

    setDisponibilidadActual: (
      state,
      action: PayloadAction<{ disponibilidadActual: boolean | null }>
    ) => {
      state.disponibilidadActual = action.payload.disponibilidadActual;
    },

    setDocumentacionValidad: (
      state,
      action: PayloadAction<{ documentacionValidad: boolean | null }>
    ) => {
      state.documentacionValidad = action.payload.documentacionValidad;
    },

    resetRegister: () => initialState,
  },
});

export const {
  setRol,
  setNombre,
  setApellidos,
  setDni,
  setEmail,
  setTelefono,
  setContrasenia,
  setConfirmarContrasenia,
  setDireccionPrincipal,
  setZonaOperativa,
  resetRegister,
} = registerSlice.actions;

export default registerSlice.reducer;
