import GlobeNetwork from "../components/home/GlobeNetwork";

const Home = () => {
    return(
        <div className="pt-10 lg:pt-0 lg:min-h-screen flex flex-col">
        <section className="relative flex-grow flex justify-center items-center lg:bg-gray-200">
            <GlobeNetwork/>
            <div className="prose p-4">
                <h1>Transforma tu cadena de suministro con tecnología de vanguardia</h1>
                <p><span className="font-bold text-lg">🌐 Interfaz Intuitiva:</span> Fácil de usar para enviadores, destinatarios y transportistas.</p>
                <p><span className="font-bold text-lg">🔒 Seguridad Imbatible:</span> Blockchain para transacciones inmutables y transparentes.</p>
                <p><span className="font-bold text-lg">📦 Trazabilidad en Tiempo Real:</span>Sigue cada movimiento de tus mercancías desde el origen hasta el destino.</p>
                <p><span className="font-bold text-lg">🚀 Eficiencia Asegurada:</span> Optimiza rutas, reduce costos y mejora la satisfacción de tus clientes.</p>
            </div>
        </section>
        </div>
    )
}

export default Home;