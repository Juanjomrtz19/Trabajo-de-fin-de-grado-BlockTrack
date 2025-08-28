// Direccion.tsx
import AddressAutocomplete from "../../../../components/common/Inputs/AddressAutocomplete";
import Mapa from "../../../../components/common/Mapa/Mapa";
import TextField from "../../../../components/common/Inputs/TextField";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../app/store";
import {
  setDatosEnvioLon,
  setDatosEnvioLat,
  setDatosEnvioDireccion,
  setDatosEnvioCiudad,
  setDatosEnvioCP,
  setDatosRecogidaCP,
  setDatosRecogidaDireccion,
  setDatosRecogidaCiudad,
  setDatosRecogidaLat,
  setDatosRecogidaLon,
} from "../../../../services/crearRemesaSlice";

type DireccionProps = {
  label?: string;
  tipo?: "envio" | "recogida";
};

export default function Direccion({
  label = "Dirección",
  tipo = "envio",
}: DireccionProps) {
  const dispatch = useDispatch();
  const { datosEnvio, datosRecogida } = useSelector(
    (state: RootState) => state.crearRemesa
  );

  const datos = tipo === "envio" ? datosEnvio : datosRecogida;

  const setDireccion = (v: string) =>
    tipo === "envio"
      ? dispatch(setDatosEnvioDireccion(v))
      : dispatch(setDatosRecogidaDireccion(v));

  const setLat = (v: number | null) =>
    tipo === "envio"
      ? dispatch(setDatosEnvioLat(v))
      : dispatch(setDatosRecogidaLat(v));

  const setLon = (v: number | null) =>
    tipo === "envio"
      ? dispatch(setDatosEnvioLon(v))
      : dispatch(setDatosRecogidaLon(v));

  const setCiudad = (v: string) =>
    tipo === "envio"
      ? dispatch(setDatosEnvioCiudad(v))
      : dispatch(setDatosRecogidaCiudad(v));

  const setCP = (v: string) =>
    tipo === "envio"
      ? dispatch(setDatosEnvioCP(v))
      : dispatch(setDatosRecogidaCP(v));

  const hasCoords = datos.lat != null && datos.lon != null;

  return (
    <div className="grid grid-cols-6 gap-3 pb-3">
      <div className="col-span-6">
        <AddressAutocomplete
          label={label}
          value={datos.direccion ?? ""}
          onChange={(val) => {
            // Solo texto del input
            setDireccion(val);
          }}
          onSelect={(s) => {
            // Al elegir una sugerencia, rellena dirección y coords
            setDireccion(s.label);
            setLat(s.lat);
            setLon(s.lon);
          }}
          countrycodes="es"
        />
      </div>

      <div className="col-span-3">
        <TextField
          label="Ciudad"
          type="text"
          value={datos.ciudad ?? ""}
          onChange={(e) => setCiudad(e.target.value)}
        />
      </div>

      <div className="col-span-3">
        <TextField
          label="C.Postal"
          type="text" // CP suele ir mejor como string
          value={datos.codPostal ?? ""}
          onChange={(e) => setCP(e.target.value)}
        />
      </div>

      <div className="col-span-6">
        <p className="text-xs text-gray-500">
          Lat: {datos.lat ?? "-"}, Lon: {datos.lon ?? "-"}
        </p>

        <div className="h-64 bg-accent-dark">
          <Mapa
            position={[(datos.lat as number) ?? 0, (datos.lon as number) ?? 0]}
          />
        </div>
      </div>
    </div>
  );
}
