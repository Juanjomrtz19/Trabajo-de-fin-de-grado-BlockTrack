import React, { useState } from "react";
import { useGetRemesasQuery } from "../../../services/api/remesaApi";
import type { Remesa } from "../../../types/remesa";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import GenericTable from "../../../components/common/Table/GenericTable";
import Button from "../../../components/common/Button/Button";
import Dialog from "../../../components/common/Dialog/Dialog";
import CrearRemesa from "./components/CrearRemesa";
import CambiarPaso from "./components/CambiarPaso";
import { AnimatePresence, motion } from "framer-motion";
import CartelMultiPaso from "../../../components/common/CartelMultiPaso/CartelMultiPaso";
import Direccion from "./components/Direccion";
import ActionCell from "./components/ActionCell";
import {
  resetCrearRemesa,
  setEstaEditando,
} from "../../../services/crearRemesaSlice";
import { useDispatch } from "react-redux";

const ch = createColumnHelper<Remesa>();

const estadoPretty = (v: Remesa["estado"]) => {
  if (!v) return "PENDIENTE";
  // Si llega en mayúsculas desde el backend, lo humanizamos
  const map: Record<string, string> = {
    PENDIENTE: "Pendiente",
    ASIGNADA: "Asignada",
    EN_RUTA: "En ruta",
    ENTREGADA: "Entregada",
    CANCELADA: "Cancelada",
  };
  const key = String(v).toUpperCase();
  return map[key] ?? String(v);
};

const RemesasPage = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState<boolean>(false);
  const [paso, setPaso] = useState<number>(0);

  const columns: ColumnDef<Remesa, any>[] = [
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <ActionCell remesa={row.original} setOpen={setOpen} />,
    },
    ch.accessor("peso", { header: "Peso (kg)" }),
    ch.accessor("medida", { header: "Medida (cm)" }),
    ch.accessor("nPaquetes", { header: "Paquetes" }),
    ch.accessor("tipoMercancia", { header: "Mercancía" }),
    ch.accessor("estado", {
      header: "Estado",
      cell: (i) => estadoPretty(i.getValue()),
    }),

    // ENTREGA
    ch.accessor("dirEnvio", { header: "Dirección envío" }),
    ch.accessor("ciudadEnvio", { header: "Ciudad envío" }),
    ch.accessor("codigoPostalEnvio", { header: "CP envío" }),

    // RECOGIDA
    ch.accessor("dirRecogida", { header: "Dirección recogida" }),
    ch.accessor("ciudadRecogida", { header: "Ciudad recogida" }),
    ch.accessor("codigoPostalRecogida", { header: "CP recogida" }),

    // CONTACTO
    ch.accessor("emailDestinatario", { header: "Email destinatario" }),
  ];

  const { data = [] } = useGetRemesasQuery();

  const cambiarFormulario = () => {
    switch (paso) {
      case 0:
        return <CrearRemesa />;
      case 1:
        return <Direccion />;
      case 2:
        return <Direccion tipo="recogida" label={"Dirección de recogida"} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-end items-center pr-8">
        <Button variant="primary" onClick={() => setOpen(true)}>
          Crear remesa
        </Button>
      </div>

      <GenericTable data={data} columns={columns} initialPageSize={10} />

      <Dialog
        open={open}
        onClose={() => {
          dispatch(resetCrearRemesa());
          dispatch(setEstaEditando(false));
          setOpen(false);
        }}
      >
        <div className="relative w-full">
          <CartelMultiPaso paso={paso} nPasos={3} />
          <AnimatePresence mode="wait">
            <motion.div
              key={paso}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {cambiarFormulario()}
            </motion.div>
          </AnimatePresence>
        </div>

        <CambiarPaso paso={paso} setPaso={setPaso} />
      </Dialog>
    </div>
  );
};

export default RemesasPage;
