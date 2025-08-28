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

  disponibilidadActual?: boolean | null;
  documentacionValidad?: boolean | null;

  // CLIENTE
  direccionPrincipal?: string | null;
  direccionPrincipalCiudad?: string | null;
  direccionPrincipalCP?: string | null;
  direccionPrincipalLat?: number | null;
  direccionPrincipalLon?: number | null;

  // TRANSPORTISTA
  zonaOperativa?: string | null; // texto/label del centro de zona
  zonaOperativaCiudad?: string | null;
  zonaOperativaCP?: string | null;
  zonaOperativaLat?: number | null; // coordenadas del centro de zona
  zonaOperativaLon?: number | null;
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
    setDireccionPrincipal: (
      state,
      action: PayloadAction<{ direccionPrincipal: string }>
    ) => {
      state.direccionPrincipal = action.payload.direccionPrincipal;
    },
    setDireccionPrincipalCiudad: (
      state,
      action: PayloadAction<{ ciudad: string }>
    ) => {
      state.direccionPrincipalCiudad = action.payload.ciudad;
    },
    setDireccionPrincipalCP: (
      state,
      action: PayloadAction<{ codPostal: string }>
    ) => {
      state.direccionPrincipalCP = action.payload.codPostal;
    },
    setDireccionPrincipalLat: (
      state,
      action: PayloadAction<{ lat: number | null }>
    ) => {
      state.direccionPrincipalLat = action.payload.lat;
    },
    setDireccionPrincipalLon: (
      state,
      action: PayloadAction<{ lon: number | null }>
    ) => {
      state.direccionPrincipalLon = action.payload.lon;
    },

    setZonaOperativa: (
      state,
      action: PayloadAction<{ zonaOperativa: string }>
    ) => {
      state.zonaOperativa = action.payload.zonaOperativa;
    },
    setZonaOperativaCiudad: (
      state,
      action: PayloadAction<{ ciudad: string }>
    ) => {
      state.zonaOperativaCiudad = action.payload.ciudad;
    },
    setZonaOperativaCP: (
      state,
      action: PayloadAction<{ codPostal: string }>
    ) => {
      state.zonaOperativaCP = action.payload.codPostal;
    },
    setZonaOperativaLat: (
      state,
      action: PayloadAction<{ lat: number | null }>
    ) => {
      state.zonaOperativaLat = action.payload.lat;
    },
    setZonaOperativaLon: (
      state,
      action: PayloadAction<{ lon: number | null }>
    ) => {
      state.zonaOperativaLon = action.payload.lon;
    },
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
  resetRegister,
  setDireccionPrincipalCP,
  setDireccionPrincipalCiudad,
  setDireccionPrincipalLat,
  setDireccionPrincipalLon,
  setZonaOperativa,
  setZonaOperativaCP,
  setZonaOperativaCiudad,
  setZonaOperativaLat,
  setZonaOperativaLon,
} = registerSlice.actions;

export default registerSlice.reducer;
