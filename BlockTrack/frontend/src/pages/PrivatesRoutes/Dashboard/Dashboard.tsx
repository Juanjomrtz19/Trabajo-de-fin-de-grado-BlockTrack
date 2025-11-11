import { useObtenerEstadisticasQuery } from "../../../services/api/estadisticasApi";
import { FaBox, FaTruck, FaInbox } from "react-icons/fa";

const Dashboard = () => {
  const { data: estadisticas, isLoading } = useObtenerEstadisticasQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-primary-dark">
        Panel de Control
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta: Total Remesas Creadas */}
        <div className="bg-white border border-primary-light rounded-lg shadow-lg shadow-secondary-light p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary-light bg-opacity-20 p-4 rounded-full">
              <FaBox className="text-primary-light text-3xl" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm font-medium">
                Total Remesas Creadas
              </p>
              <p className="text-4xl font-bold text-primary-dark">
                {estadisticas?.totalRemesasCreadas ?? 0}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-sm">
              Remesas que has creado en total
            </p>
          </div>
        </div>

        {/* Tarjeta: Transportistas Activos */}
        <div className="bg-white border border-accent-light rounded-lg shadow-lg shadow-secondary-light p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent-light bg-opacity-20 p-4 rounded-full">
              <FaTruck className="text-accent-light text-3xl" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm font-medium">
                Transportistas Activos
              </p>
              <p className="text-4xl font-bold text-accent-dark">
                {estadisticas?.transportistasActivos ?? 0}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-sm">
              Transportistas disponibles actualmente
            </p>
          </div>
        </div>

        {/* Tarjeta: Remesas a Recoger */}
        <div className="bg-white border border-secondary-light rounded-lg shadow-lg shadow-secondary-light p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-secondary-light bg-opacity-20 p-4 rounded-full">
              <FaInbox className="text-secondary-light text-3xl" />
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm font-medium">
                Remesas a Recoger
              </p>
              <p className="text-4xl font-bold text-secondary-dark">
                {estadisticas?.remesasARecoger ?? 0}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 text-sm">
              Paquetes pendientes de recibir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
