import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import AddressAutocomplete from "../../../components/common/Inputs/AddressAutocomplete";
import Mapa from "../../../components/common/Mapa/Mapa";
import TextField from "../../../components/common/Inputs/TextField";

import {
  // CLIENTE
  setDireccionPrincipal,
  setDireccionPrincipalLat,
  setDireccionPrincipalLon,
  setDireccionPrincipalCiudad,
  setDireccionPrincipalCP,
  // TRANSPORTISTA
  setZonaOperativa,
  setZonaOperativaLat,
  setZonaOperativaLon,
  setZonaOperativaCiudad,
  setZonaOperativaCP,
} from "../../../services/registerSlice";

const UsuarioEspecifico = () => {
  const dispatch = useDispatch();
  const {
    rol,

    // CLIENTE
    direccionPrincipal,
    direccionPrincipalLat,
    direccionPrincipalLon,
    direccionPrincipalCiudad,
    direccionPrincipalCP,

    // TRANSPORTISTA
    zonaOperativa,
    zonaOperativaLat,
    zonaOperativaLon,
    zonaOperativaCiudad,
    zonaOperativaCP,
  } = useSelector((state: RootState) => state.register);

  const isTransportista = rol === "TRANSPORTISTA";

  // Bindings comunes según rol
  const valueDireccion = isTransportista
    ? zonaOperativa ?? ""
    : direccionPrincipal ?? "";
  const valueCiudad = isTransportista
    ? zonaOperativaCiudad ?? ""
    : direccionPrincipalCiudad ?? "";
  const valueCP = isTransportista
    ? zonaOperativaCP ?? ""
    : direccionPrincipalCP ?? "";
  const lat = isTransportista ? zonaOperativaLat : direccionPrincipalLat;
  const lon = isTransportista ? zonaOperativaLon : direccionPrincipalLon;

  const setDir = (v: string) =>
    isTransportista
      ? dispatch(setZonaOperativa({ zonaOperativa: v }))
      : dispatch(setDireccionPrincipal({ direccionPrincipal: v }));

  const setLat = (v: number | null) =>
    isTransportista
      ? dispatch(setZonaOperativaLat({ lat: v }))
      : dispatch(setDireccionPrincipalLat({ lat: v }));

  const setLon = (v: number | null) =>
    isTransportista
      ? dispatch(setZonaOperativaLon({ lon: v }))
      : dispatch(setDireccionPrincipalLon({ lon: v }));

  const setCiudad = (v: string) =>
    isTransportista
      ? dispatch(setZonaOperativaCiudad({ ciudad: v }))
      : dispatch(setDireccionPrincipalCiudad({ ciudad: v }));

  const setCP = (v: string) =>
    isTransportista
      ? dispatch(setZonaOperativaCP({ codPostal: v }))
      : dispatch(setDireccionPrincipalCP({ codPostal: v }));

  const hasCoords = lat != null && lon != null;

  return (
    <form className="grid grid-cols-6 gap-3">
      <div className="col-span-6">
        <AddressAutocomplete
          label={
            isTransportista ? "Zona operativa (centro)" : "Dirección principal"
          }
          value={valueDireccion}
          onChange={(val) => {
            // Texto libre: actualizamos solo la dirección; no tocamos coords
            setDir(val);
          }}
          onSelect={(s) => {
            // Al elegir sugerencia: sincronizamos dirección + coords
            setDir(s.label);
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
          value={valueCiudad}
          onChange={(e) => setCiudad(e.target.value)}
        />
      </div>

      <div className="col-span-3">
        <TextField
          label="C.Postal"
          type="text"
          value={valueCP}
          onChange={(e) => setCP(e.target.value)}
        />
      </div>

      <div className="col-span-6">
        <p className="text-xs text-gray-500">
          Lat: {lat ?? "-"}, Lon: {lon ?? "-"}
        </p>
        <div className="h-64 bg-accent-dark rounded-md overflow-hidden">
          <Mapa position={[Number(lat ?? 0), Number(lon ?? 0)]} />
        </div>
      </div>
    </form>
  );
};

export default UsuarioEspecifico;
