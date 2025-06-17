const LogIn = () => {
  return (
    <div className="relative h-screen w-full bg-[url('/landing.png')] bg-cover bg-center justify-center items-center">
      <div className="absolute inset-0 bg-black/70"></div>
      <form className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background-light p-8 rounded shadow-md">
        <label htmlFor="" className="block mb-2 text-sm font-medium">
          Email
        </label>
        <input type="text" className="w-full mb-4 p-2 border rounded" />

        <label htmlFor="" className="block mb-2 text-sm font-medium">
          Password
        </label>
        <input type="password" className="w-full mb-4 p-2 border rounded" />

        <button
          type="submit"
          className="shadow-2xl shadow-background-light w-full bg-primary-light text-white py-2 rounded mt-2 cursor-pointer hover:bg-secondary-light transition-all duration-300 "
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LogIn;
