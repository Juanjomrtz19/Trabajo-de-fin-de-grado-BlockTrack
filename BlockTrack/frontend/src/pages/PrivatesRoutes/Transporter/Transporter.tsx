import { useState } from "react";
import Button from "../../../components/common/Button/Button";
import Dialog from "../../../components/common/Dialog/Dialog";
import Title from "../../../components/common/Title/Title";

const Transporter = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between">
        <Title text="Manage your transporters" />
        <Button
          variant="primary"
          className="mr-20"
          onClick={() => setOpen(true)}
        >
          Create transporter
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          ¿Estas seguro que quieres continuar?
        </Dialog>
      </div>
    </>
  );
};

export default Transporter;
