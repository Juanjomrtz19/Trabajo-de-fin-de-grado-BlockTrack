import { Handle, Node, NodeProps, Position } from "@xyflow/react";
import { Remesa } from "../../../../types/remesa";

type RemesaNode = Node<{ remesa: Remesa }, "remesaCard">;

const DestinatarioCard = ({ data }: NodeProps<RemesaNode>) => {
  const { remesa } = data;
  return (
    <div className="border p-4 rounded shadow-md mb-4 bg-secondary-light text-white flex-col relative w-60">
      <div className="h-20 w-20 object-cover absolute -top-10 left-3/6 translate-x-[-50%]">
        <img src="/opcionUsuario.png" alt="" />
      </div>
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />
      <h5 className="text-primary-light font-bold">Destinatario</h5>
      <p className="text-xs">
        <span className="font-semibold underline">Email:</span>{" "}
        {remesa?.emailDestinatario}
      </p>
      <p className="text-xs max-w-[200px] truncate" title={remesa?.dirRecogida}>
        <span className="font-semibold underline">Dirrección de recogida:</span>{" "}
        {remesa?.dirRecogida}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">Ciudad de Recogida:</span>{" "}
        {remesa?.ciudadRecogida}
      </p>
      <p className="text-xs">
        <span className="font-semibold underline">
          Código Postal de Recogida:
        </span>{" "}
        {remesa?.codigoPostalRecogida}
      </p>
    </div>
  );
};

export default DestinatarioCard;
