import {
  Package,
  Truck,
  Shield,
  Clock,
  BarChart3,
  MapPin,
  Blocks,
  Users,
  CheckCircle2,
} from "lucide-react";

const Services = () => {
  const mainServices = [
    {
      icon: Package,
      title: "Gestión de Remesas",
      description:
        "Crea y gestiona tus envíos de forma intuitiva. Controla cada paquete desde su origen hasta su destino final con total transparencia.",
      features: [
        "Seguimiento en tiempo real",
        "Múltiples tipos de mercancía",
        "Notificaciones automáticas",
        "Historial completo de envíos",
      ],
      color: "primary",
    },
    {
      icon: Truck,
      title: "Red de Transportistas",
      description:
        "Conecta con una red verificada de transportistas profesionales. Asignación inteligente según zona operativa y disponibilidad.",
      features: [
        "Transportistas verificados",
        "Asignación automática por zona",
        "Gestión de vehículos",
        "Cobertura nacional",
      ],
      color: "secondary",
    },
    {
      icon: Blocks,
      title: "Blockchain & Trazabilidad",
      description:
        "Tecnología blockchain para garantizar la integridad y trazabilidad inmutable de cada envío en la cadena de suministro.",
      features: [
        "Registros inmutables",
        "Trazabilidad completa",
        "Verificación de autenticidad",
        "Auditoría transparente",
      ],
      color: "accent",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "from-primary-light to-primary-dark";
      case "secondary":
        return "from-secondary-light to-secondary-dark";
      case "accent":
        return "from-accent-light to-accent-dark";
      default:
        return "from-primary-light to-primary-dark";
    }
  };

  return (
    <div className="relative min-h-full w-full bg-[url('/landing.png')] bg-cover bg-center bg-fixed">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background-dark/50"></div>

      <div className="relative py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8 sm:mb-10 lg:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-4 drop-shadow-lg">
            Nuestros Servicios
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md px-4">
            Revoluciona tu logística con tecnología blockchain y una plataforma
            diseñada para la transparencia y eficiencia
          </p>
        </div>

        {/* Main Services */}
        <div className="max-w-7xl mx-auto pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${getColorClasses(
                      service.color
                    )}`}
                  ></div>
                  <div className="p-6 lg:p-8">
                    <div
                      className={`w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${getColorClasses(
                        service.color
                      )} rounded-xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-text-light mb-3 lg:mb-4">
                      {service.title}
                    </h3>
                    <p className="text-sm lg:text-base text-gray-600 mb-4 lg:mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2 lg:space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-success-light mt-0.5 flex-shrink-0" />
                          <span className="text-sm lg:text-base text-gray-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
