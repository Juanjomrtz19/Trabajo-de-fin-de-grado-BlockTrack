import { Handle, Node, NodeProps, Position } from "@xyflow/react";

type RemesaNode = Node<{ lleva: any }, "remesaCard">;

const TransportCard = ({ data }: NodeProps<RemesaNode>) => {
  const { lleva } = data;
  console.log("lleva", lleva);
  const { conduce } = lleva ?? {};
  const { transportista, transporte } = conduce ?? {};
  const { usuario } = transportista ?? {};
  return (
    <div className="border p-4 rounded shadow-md mb-4 bg-secondary-light text-white flex-col relative w-60">
      <div className="h-20 w-20 object-cover absolute -top-10 left-3/6 translate-x-[-50%]">
        <img src="/camionVehiculos.png" alt="" />
      </div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
      <h5 className="text-primary-light font-bold">Transportista</h5>
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
    </div>
  );
};

export default TransportCard;
