import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  useConsultarPedidoQuery,
  useConsultarLlevasPedidoQuery,
} from "../../services/api/remesaApi";
import RemesaCard from "../PrivatesRoutes/HistorialRemesa/components/RemesaCard";
import TransportCard from "../PrivatesRoutes/HistorialRemesa/components/TransportCard";
import DestinatarioCard from "../PrivatesRoutes/HistorialRemesa/components/DestinatarioCard";
import Button from "../../components/common/Button/Button";

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

export default function ConsultarPedido() {
  const [idRemesa, setIdRemesa] = useState<string>("");
  const [buscar, setBuscar] = useState<boolean>(false);
  const [idBuscado, setIdBuscado] = useState<number | null>(null);

  const {
    data: remesaData,
    error: remesaError,
    isLoading: isLoadingRemesa,
    isSuccess: isSuccessRemesa,
  } = useConsultarPedidoQuery(Number(idBuscado), {
    skip: !buscar || !idBuscado,
  });

  const { data: llevasData, isLoading: isLoadingLlevas } =
    useConsultarLlevasPedidoQuery(Number(idBuscado), {
      skip: !buscar || !idBuscado,
    });

  console.log("llevasData", llevasData);

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    if (!remesaData) return;

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
    setEdges(buildSequentialEdges(newNodes));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idRemesa && !isNaN(Number(idRemesa))) {
      setIdBuscado(Number(idRemesa));
      setBuscar(true);
    }
  };

  const handleReset = () => {
    setIdRemesa("");
    setBuscar(false);
    setIdBuscado(null);
    setNodes([]);
    setEdges([]);
  };

  return (
    <div className="min-h-full w-full bg-[url('/landing.png')] bg-cover bg-center bg-repeat-y">
      <div className="min-h-full w-full bg-black/20">
        <div className="p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-white text-center drop-shadow-lg">
            Consultar Pedido
          </h1>

          {!buscar && (
            <div className="max-w-md mx-auto bg-white opacity-90 border border-primary-light rounded-lg shadow-lg p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="idRemesa"
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    ID de la Remesa
                  </label>
                  <input
                    type="number"
                    id="idRemesa"
                    value={idRemesa}
                    onChange={(e) => setIdRemesa(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
                    placeholder="Ingrese el ID del pedido"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  Buscar Pedido
                </Button>
              </form>
            </div>
          )}

          {buscar && (isLoadingRemesa || isLoadingLlevas) && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-light"></div>
            </div>
          )}

          {buscar &&
            (llevasData?.length === 0 ||
              (isSuccessRemesa && !remesaData && !isLoadingRemesa)) &&
            !isLoadingRemesa &&
            !isLoadingLlevas && (
              <div className="max-w-md mx-auto bg-red-50 border border-red-300 rounded-lg shadow-lg p-6 mt-8">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    className="w-16 h-16 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-red-700 mb-3 text-center">
                  Pedido no encontrado
                </h2>
                <p className="text-red-600 mb-2 text-center">
                  No se encontró ningún pedido con el ID:{" "}
                  <span className="font-bold">#{idBuscado}</span>
                </p>
                <p className="text-red-500 text-sm mb-4 text-center">
                  Por favor, verifica que el ID sea correcto e intenta
                  nuevamente.
                </p>
                <Button
                  onClick={handleReset}
                  variant="primary"
                  className="w-full"
                >
                  Realizar nueva búsqueda
                </Button>
              </div>
            )}

          {buscar &&
            remesaData &&
            !isLoadingRemesa &&
            !isLoadingLlevas &&
            llevasData?.length > 0 && (
              <div className="space-y-4">
                <div className="bg-white border border-primary-light rounded-lg shadow-lg p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <p className="text-sm md:text-lg">
                        <span className="font-semibold">Actual poseedor:</span>{" "}
                        <span className="block md:inline mt-1 md:mt-0">
                          {remesaData?.onchain?.poseedorActual || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm md:text-lg">
                        <span className="font-semibold">Estado:</span>{" "}
                        {remesaData?.onchain?.estadoLabel || "N/A"}
                      </p>
                    </div>
                    <Button
                      onClick={handleReset}
                      variant="accent"
                      className="w-full md:w-auto"
                    >
                      Nueva consulta
                    </Button>
                  </div>
                </div>

                <div className="relative w-full h-[400px] md:h-[600px] bg-white border border-primary-light rounded-lg shadow-lg overflow-hidden">
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
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
