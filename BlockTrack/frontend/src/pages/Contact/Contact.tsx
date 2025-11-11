import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Button from "../../components/common/Button/Button";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el email (de mentira)
    console.log("Formulario enviado:", formData);
    alert("¡Mensaje enviado con éxito! (simulado)");
    // Resetear formulario
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="relative min-h-full w-full bg-[url('/landing.png')] bg-cover bg-center bg-fixed flex items-center justify-center">
      {/* Overlay más opaco */}
      <div className="absolute inset-0 bg-background-dark/70"></div>

      <div className="relative py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8 w-full">
        <div className="max-w-3xl mx-auto">
          {/* Formulario centrado */}
          <div className="bg-white/95 rounded-lg opacity-90 shadow-2xl p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-text-light mb-6 text-center">
              Envíanos un mensaje
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-light mb-2"
                  >
                    Nombre completo <span className="text-error-light">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-light mb-2"
                  >
                    Email <span className="text-error-light">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-text-light mb-2"
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-text-light mb-2"
                  >
                    Asunto <span className="text-error-light">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                    placeholder="Consulta general"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-text-light mb-2"
                >
                  Mensaje <span className="text-error-light">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full flex justify-center items-center gap-3"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Enviar mensaje
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
