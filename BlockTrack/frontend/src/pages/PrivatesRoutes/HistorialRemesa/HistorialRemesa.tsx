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
    // si tus nodos usan handles personalizados:
    sourceHandle: "out",
    targetHandle: "in",
  }));

export default function HistorialRemesa() {
  let { idRemesa } = useParams();
  const { data: remesaData } = useGetRemesaQuery(Number(idRemesa), {
    skip: !idRemesa,
  });

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
    <div className="relative w-full h-full overflow-hidden">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
