import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import GenericTable from "../../../components/common/Table/GenericTable";
import { LLeva } from "../../../types/lleva";
import { useObtenerLlevasPorTransportistaQuery } from "../../../services/api/transportistaApi";
import Chip from "../../../components/common/Chip/Chip";
import { Clock } from "lucide-react";
import { CalendarDays } from "lucide-react";
import ActionButtons from "./components/ActionButtons";

const ch = createColumnHelper<LLeva>();

const getColorStatus = (status: string | null) => {
  switch (status) {
    case "PENDIENTE":
      return "warning";
    case "ACEPTADA":
      return "success";
    case "RECHAZADA":
      return "error";
    default:
      return "primary";
  }
};

const columns: ColumnDef<LLeva, any>[] = [
  {
    id: "acciones",
    header: "Acciones",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <ActionButtons lleva={row.original} />,
  },
  ch.accessor("dirFin", {
    header: () => <span>Dirección de Fin</span>,
  }),
  ch.accessor("dirInicio", {
    header: () => <span>Dirección de Inicio</span>,
  }),
  ch.accessor("distanciaKm", {
    header: () => <span>Distancia (km)</span>,
    cell: ({ getValue }) => {
      const v = getValue();
      return (
        <Chip
          text={`${parseFloat(v.toFixed(2))?.toString() ?? ""} kms`}
          color="secondary"
          variant="outlined"
        />
      );
    },
  }),

  ch.accessor("fecha", {
    header: () => <span>Fecha</span>,
    cell: ({ getValue }) => {
      const v = getValue<string | Date | null>();
      return (
        <Chip
          text={v?.toString().split("T")[0] ?? ""}
          color="warning"
          icon={<CalendarDays />}
          variant="outlined"
        />
      );
    },
  }),
  ch.accessor("hora", {
    header: () => <span>Hora</span>,
    cell: ({ getValue }) => {
      const v = getValue();
      return (
        <Chip
          text={v ?? ""}
          variant="outlined"
          color="primary"
          icon={<Clock />}
        />
      );
    },
  }),
  ch.accessor("status", {
    header: () => <span>Estado</span>,
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return <Chip text={v ?? ""} variant="filled" color={getColorStatus(v)} />;
    },
  }),
];

const Asignacion = () => {
  const { data: llevas, isLoading } = useObtenerLlevasPorTransportistaQuery();
  const result: LLeva[] = llevas ?? [];

  return <GenericTable data={result} columns={columns} initialPageSize={10} />;
};

export default Asignacion;
