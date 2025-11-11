import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  useObtenerRemesaLlevasQuery,
  useGetRemesaQuery,
} from "../../../services/api/remesaApi";
import { useParams } from "react-router-dom";
import RemesaCard from "./components/RemesaCard";
import TransportCard from "./components/TransportCard";
import DestinatarioCard from "./components/DestinatarioCard";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

const nodeTypes = {
  remesaCard: RemesaCard,
  transportistaCard: TransportCard,
  destinatarioCard: DestinatarioCard,
};

const buildSequentialEdges = (ns: { id: string }[]) =>
  ns.slice(0, -1).map((n, i) => ({
    id: `e-${n.id}-${ns[i + 1].id}`,
    source: n.id,
    target: ns[i + 1].id,
    sourceHandle: "out",
    targetHandle: "in",
  }));

export default function HistorialRemesa() {
  let { idRemesa } = useParams();
  const { data: remesaData } = useGetRemesaQuery(Number(idRemesa), {
    skip: !idRemesa,
  });

  console.log("remesaData", remesaData);

  const { data: llevasData } = useObtenerRemesaLlevasQuery(Number(idRemesa), {
    skip: !idRemesa,
  });

  console.log("llevasData", llevasData);

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    const transportistaNodes = (llevasData ?? []).map(
      (lleva: any, index: number) => ({
        id: `n-${Number(lleva.id) + 2}`,
        position: { x: 300 * (index + 1), y: 50 },
        type: "transportistaCard",
        data: { lleva },
      })
    );

    const newNodes = [
      {
        id: "n1",
        position: { x: 0, y: 0 },
        type: "remesaCard",
        data: { remesa: remesaData },
      },
      ...transportistaNodes,
      {
        id: `n2`,
        position: { x: 300 * (transportistaNodes.length + 1), y: 50 },
        type: "destinatarioCard",
        data: { remesa: remesaData },
      },
    ];

    setNodes(newNodes);
    setEdges(buildSequentialEdges(newNodes)); // 👈 aquí se automatiza
  }, [remesaData, llevasData]);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Header con información de la remesa */}
      <div className="bg-white border border-primary-light rounded-lg shadow-lg p-4">
        <h2 className="text-xl md:text-2xl font-bold text-primary-dark mb-3">
          Historial de Remesa #{idRemesa}
        </h2>
        <div className="space-y-1">
          <p className="text-sm md:text-base">
            <span className="font-semibold">Actual poseedor:</span>{" "}
            <span className="block md:inline mt-1 md:mt-0">
              {remesaData?.onchain?.poseedorActual || "N/A"}
            </span>
          </p>
          <p className="text-sm md:text-base">
            <span className="font-semibold">Estado:</span>{" "}
            {remesaData?.onchain?.estadoLabel || "N/A"}
          </p>
        </div>
      </div>

      {/* Diagrama de flujo responsive */}
      <div className="relative w-full h-[400px] md:h-[600px] lg:h-[700px] bg-white border border-primary-light rounded-lg shadow-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          panOnScroll
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
        />
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <span className="font-semibold">Tip:</span>{" "}
          <span className="hidden md:inline">
            Arrastra con el ratón para moverte, usa la rueda para hacer zoom.
          </span>
          <span className="md:hidden">
            Usa dos dedos para hacer zoom y arrastrar el diagrama.
          </span>
        </p>
      </div>
    </div>
  );
}
