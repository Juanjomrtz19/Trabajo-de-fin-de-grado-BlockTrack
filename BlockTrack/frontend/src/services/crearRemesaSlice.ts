import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Remesa, TipoMercancia } from "../types/remesa";

export interface crearRemesa {
  id: number | null;
  peso: number | null;
  medida: string | null;
  nPaquetes: number | null;
  tipoMercancia: TipoMercancia;
  emailDestinatario: string;
  observaciones: string | null;

  datosEnvio: Direccion;
  datosRecogida: Direccion;
  estaEditando: boolean;
}

export interface Direccion {
  lat: number | null;
  lon: number | null;
  direccion: string | null;
  codPostal: string | null;
  ciudad: string | null;
}

const initialDireccion: Direccion = {
  lat: null,
  lon: null,
  direccion: null,
  codPostal: null,
  ciudad: null,
};

const initialState: crearRemesa = {
  id: null,
  peso: null,
  medida: "",
  nPaquetes: null,
  tipoMercancia: "GENERICO",
  emailDestinatario: "",
  observaciones: null,
  datosEnvio: initialDireccion,
  datosRecogida: initialDireccion,
  estaEditando: false,
};

const crearRemesaSlice = createSlice({
  name: "crearRenesa",
  initialState,
  reducers: {
    setPeso(state, action: PayloadAction<number | null>) {
      state.peso = action.payload;
    },
    setMedida(state, action: PayloadAction<string | null>) {
      state.medida = action.payload;
    },
    setNPaquetes(state, action: PayloadAction<number | null>) {
      state.nPaquetes = action.payload;
    },
    setTipoMercancia(state, action: PayloadAction<TipoMercancia>) {
      state.tipoMercancia = action.payload;
    },
    setEmailDestinatario(state, action: PayloadAction<string>) {
      state.emailDestinatario = action.payload;
    },

    setObservaciones(state, action: PayloadAction<string | null>) {
      state.observaciones = action.payload;
    },

    //Datos envio
    setDatosEnvioLon(state, action: PayloadAction<number | null>) {
      state.datosEnvio = { ...state.datosEnvio, lon: action.payload };
    },
    setDatosEnvioLat(state, action: PayloadAction<number | null>) {
      state.datosEnvio = { ...state.datosEnvio, lat: action.payload };
    },
    setDatosEnvioDireccion(state, action: PayloadAction<string | null>) {
      state.datosEnvio = { ...state.datosEnvio, direccion: action.payload };
    },
    setDatosEnvioCiudad(state, action: PayloadAction<string | null>) {
      state.datosEnvio = { ...state.datosEnvio, ciudad: action.payload };
    },
    setDatosEnvioCP(state, action: PayloadAction<string | null>) {
      state.datosEnvio = { ...state.datosEnvio, codPostal: action.payload };
    },
    //Datos recogida
    setDatosRecogidaLon(state, action: PayloadAction<number | null>) {
      state.datosRecogida = { ...state.datosRecogida, lon: action.payload };
    },
    setDatosRecogidaLat(state, action: PayloadAction<number | null>) {
      state.datosRecogida = { ...state.datosRecogida, lat: action.payload };
    },
    setDatosRecogidaDireccion(state, action: PayloadAction<string | null>) {
      state.datosRecogida = {
        ...state.datosRecogida,
        direccion: action.payload,
      };
    },
    setDatosRecogidaCiudad(state, action: PayloadAction<string | null>) {
      state.datosRecogida = { ...state.datosRecogida, ciudad: action.payload };
    },
    setDatosRecogidaCP(state, action: PayloadAction<string | null>) {
      state.datosRecogida = {
        ...state.datosRecogida,
        codPostal: action.payload,
      };
    },
    setRemesa(state, action: PayloadAction<Remesa>) {
      const remesa = action.payload;
      state.id = remesa.id ?? null;
      state.peso = remesa.peso;
      state.medida = remesa.medida;
      state.nPaquetes = remesa.nPaquetes;
      state.tipoMercancia = remesa.tipoMercancia;
      state.emailDestinatario = remesa.emailDestinatario;
      state.observaciones = remesa.observaciones ?? "";

      // Datos de envío
      state.datosEnvio = {
        lat: Number(remesa.latEnvio) || null,
        lon: Number(remesa.lngEnvio) || null,
        direccion: remesa.dirEnvio || null,
        codPostal: remesa.codigoPostalEnvio || null,
        ciudad: remesa.ciudadEnvio || null,
      };

      // Datos de recogida
      state.datosRecogida = {
        lat: Number(remesa.latRecogida) || null,
        lon: Number(remesa.lngRecogida) || null,
        direccion: remesa.dirRecogida || null,
        codPostal: remesa.codigoPostalRecogida || null,
        ciudad: remesa.ciudadRecogida || null,
      };
    },

    setEstaEditando(state, action: PayloadAction<boolean>) {
      state.estaEditando = action.payload;
    },
    resetCrearRemesa(state) {
      return initialState;
    },
  },
});

export const {
  setPeso,
  setMedida,
  setNPaquetes,
  setTipoMercancia,
  setEmailDestinatario,
  setDatosEnvioLon,
  setDatosEnvioLat,
  setDatosEnvioDireccion,
  setDatosEnvioCiudad,
  setDatosEnvioCP,
  setDatosRecogidaLon,
  setDatosRecogidaLat,
  setDatosRecogidaDireccion,
  setDatosRecogidaCiudad,
  setDatosRecogidaCP,
  setObservaciones,
  setRemesa,
  setEstaEditando,
  resetCrearRemesa,
} = crearRemesaSlice.actions;
export default crearRemesaSlice.reducer;
