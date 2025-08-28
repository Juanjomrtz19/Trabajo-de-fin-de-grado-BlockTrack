import { useState } from "react";
import Button from "../../../components/common/Button/Button";
import Dialog from "../../../components/common/Dialog/Dialog";
import CreateVehicle from "./components/CreateVehicle";
import { useGetTransportesQuery } from "../../../services/api/transporteApi";
import VehicleCard from "./components/VehicleCard";
import { Transporte } from "../../../types/transporte";
import { useObtenerConduceQuery } from "../../../services/api/conduceApi";

const Vehicles = () => {
  const [open, setOpen] = useState(false);
  const { data: transportes, isLoading } = useGetTransportesQuery();
  const { data: conduceData } = useObtenerConduceQuery();
  const [selectedVehicle, setSelectedVehicle] = useState<Transporte | null>(
    null
  );
  console.log("conduceData", conduceData);

  return (
    <div>
      <div className="flex justify-end items-center pr-8">
        <Button variant="primary" onClick={() => setOpen(true)}>
          Añadir vehículo
        </Button>
      </div>
      <div className="flex flex-wrap">
        {transportes?.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            selectedVehicle={setSelectedVehicle}
            setOpen={setOpen}
            conduceData={conduceData}
          />
        ))}
      </div>
      {open && (
        <CreateVehicle
          open={open}
          onClose={() => {
            setOpen(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
};

export default Vehicles;
