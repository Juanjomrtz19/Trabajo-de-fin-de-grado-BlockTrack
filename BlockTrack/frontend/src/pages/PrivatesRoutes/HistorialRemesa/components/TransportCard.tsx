import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import Chip from "../../../../components/common/Chip/Chip";
import { useSelector } from "react-redux";
import { RootState } from "../../../../app/store";

type RemesaNode = Node<{ lleva: any }, "remesaCard">;

const TransportCard = ({ data }: NodeProps<RemesaNode>) => {
  const { user } = useSelector((state: RootState) => state.user);
  const { lleva } = data;
  console.log("lleva", lleva);
  const { conduce } = lleva ?? {};
  const { transportista, transporte } = conduce ?? {};
  const { usuario } = transportista ?? {};
  return (
    <div
      className={`border p-4 rounded shadow-md mb-4  text-white flex-col relative w-60 ${
        user?.transportistaId === lleva?.conduce?.transportista?.id
          ? "bg-primary-light"
          : "bg-secondary-light"
      } `}
    >
      <div className="h-20 w-20 object-cover absolute -top-10 left-3/6 translate-x-[-50%]">
        <img src="/camionVehiculos.png" alt="" />
      </div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
      <h5
        className={` font-bold ${
          user?.transportistaId === lleva?.conduce?.transportista?.id
            ? "text-accent-dark"
            : "text-primary-light"
        }`}
      >
        Transportista
      </h5>
      <p className="text-xs">
        <span className="font-semibold underline">Email:</span> {usuario?.email}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">DNI:</span> {usuario?.dni}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Matricula:</span>{" "}
        {transporte?.matricula}
      </p>
      <p className="text-xs max-w-[200px] truncate" title={lleva?.dirInicio}>
        <span className="font-semibold underline">Dirección de Inicio:</span>{" "}
        {lleva?.dirInicio}
      </p>
      <p className="text-xs max-w-[200px] truncate" title={lleva?.dirFin}>
        <span className="font-semibold underline">Dirección de Final:</span>{" "}
        {lleva?.dirFin}
      </p>
      <div className="flex justify-center items-center mt-2">
        <Chip
          text={lleva?.status}
          color={lleva?.status === "PENDIENTE" ? "warning" : "success"}
          variant="filled"
        />
      </div>
    </div>
  );
};

export default TransportCard;
