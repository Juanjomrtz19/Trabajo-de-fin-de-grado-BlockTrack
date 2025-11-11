import HeaderLanding from "../components/layout/HeaderLanding";

const Home = () => {
  return (
    <div className="relative h-screen w-full bg-[url('/landing.png')] bg-cover bg-center bg-fixed">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background-dark/50"></div>

      {/* Texto encima */}
      <div className="relative flex justify-center items-center h-full px-4">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-accent-light text-center w-full max-w-4xl drop-shadow-lg">
          Lleva el control logístico al futuro: trazabilidad transparente y
          segura
        </h2>
      </div>
    </div>
  );
};
export default Home;
