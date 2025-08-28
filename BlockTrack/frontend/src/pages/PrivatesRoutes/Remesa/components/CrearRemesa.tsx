import { useState } from "react";
import TextField from "../../../../components/common/Inputs/TextField";
import AddressAutocomplete from "../../../../components/common/Inputs/AddressAutocomplete";
// Import RootState from your store file, e.g.:
import { RootState } from "../../../../app/store";
import { useSelector, useDispatch } from "react-redux";
import {
  setPeso,
  setEmailDestinatario,
  setMedida,
  setNPaquetes,
  setObservaciones,
} from "../../../../services/crearRemesaSlice";
import SelectField from "../../../../components/common/Inputs/SelectField";

function CrearRemesa() {
  const {
    peso,
    medida,
    nPaquetes,
    tipoMercancia,
    emailDestinatario,
    observaciones,
  } = useSelector((state: RootState) => state.crearRemesa);
  const dispatch = useDispatch();

  const handlePesoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPeso(Number(event.target.value)));
  };

  const handleEmailDestinatarioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(setEmailDestinatario(event.target.value));
  };

  const handleMedidaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setMedida(event.target.value));
  };

  const handleNPaquetesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(setNPaquetes(Number(event.target.value)));
  };

  return (
    <div className="flex gap-4 flex-col">
      <form className="grid grid-cols-6 gap-6">
        <div className="col-span-2">
          <TextField
            label="Peso"
            type="number"
            onChange={handlePesoChange}
            value={peso ?? ""}
          />
        </div>

        <div className="col-span-2">
          <TextField
            label="Medida"
            onChange={handleMedidaChange}
            value={medida ?? ""}
          />
        </div>

        <div className="col-span-2">
          <TextField
            label="N. paquetes"
            type="number"
            onChange={handleNPaquetesChange}
            value={nPaquetes ?? ""}
          />
        </div>

        <div className="col-span-3">
          <SelectField
            label="Mercancía"
            value={tipoMercancia}
            options={[
              { value: "GENERICO", label: "Genérico" },
              { value: "PERECEDERO", label: "Perecedero" },
              { value: "FRAGIL", label: "Frágil" },
              { value: "PELIGROSO", label: "Peligroso" },
              { value: "DOCUMENTACION", label: "Documentacion" },
            ]}
          />
        </div>

        <div className="col-span-3">
          <TextField
            label="Email destinatario"
            type="text"
            onChange={handleEmailDestinatarioChange}
            value={emailDestinatario}
          />
        </div>

        <div className="col-span-6">
          <TextField
            label="Observaciones"
            type="text"
            onChange={(e) => dispatch(setObservaciones(e.target.value))}
            value={observaciones ?? ""}
          />
        </div>
      </form>
    </div>
  );
}

export default CrearRemesa;
