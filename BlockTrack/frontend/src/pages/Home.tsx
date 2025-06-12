import HeaderLanding from "../components/layout/HeaderLanding";

const Home = () => {
  return (
    <div className="relative h-screen w-full bg-[url('/landing.png')] bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Texto encima */}
      <div className="relative flex justify-center items-center h-full">
        <h2 className="text-5xl font-extrabold text-white text-center w-3/4 drop-shadow-lg">
          Lleva el control logístico al futuro: trazabilidad transparente y
          segura
        </h2>
      </div>
    </div>
  );
};
export default Home;
