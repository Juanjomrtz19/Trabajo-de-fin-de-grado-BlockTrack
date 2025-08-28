import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Remesa } from "../../../../types/remesa";

type RemesaNode = Node<{ remesa: Remesa }, "remesaCard">;

const RemesaCard = ({ data }: NodeProps<RemesaNode>) => {
  const { remesa } = data;

  return (
    <div className="border p-4 rounded shadow-md mb-4 bg-secondary-light text-white flex-col relative w-60">
      <div className="h-20 w-20 object-cover absolute -top-10 left-3/6 translate-x-[-50%]">
        <img src="/remesaIcon.png" alt="" />
      </div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
      <h5 className="text-primary-light font-bold">Remesa</h5>
      <p className="text-xs">
        <span className="font-semibold underline">Peso:</span> {remesa?.peso}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Medida:</span>{" "}
        {remesa?.medida}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Número de Paquetes:</span>{" "}
        {remesa?.nPaquetes}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Tipo de Mercancía:</span>{" "}
        {remesa?.tipoMercancia}
      </p>
      <p className="text-xs max-w-[200px] truncate" title={remesa?.dirEnvio}>
        <span className="font-semibold underline">Dirección de Envío:</span>{" "}
        {remesa?.dirEnvio}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Ciudad de Envío:</span>{" "}
        {remesa?.ciudadEnvio}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Código Postal de Envío:</span>{" "}
        {remesa?.codigoPostalEnvio}
      </p>

      <p className="text-xs">
        <span className="font-semibold underline">Observaciones:</span>{" "}
        {remesa?.observaciones}
      </p>
    </div>
  );
};

export default RemesaCard;
