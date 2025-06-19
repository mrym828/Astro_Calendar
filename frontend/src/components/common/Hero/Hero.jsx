const Hero = ({ Background, title, subtitle }) => {
  return (
    <section
      className="my-6 w-screen h-[30vh] md:h-[45vh] bg-cover bg-center bg-no-repeat flex items-center justify-center text-center text-white"
      style={{ backgroundImage: `url(${Background})` }}
    >
      <div className="p-6 inline-block">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-lg md:text-xl">{subtitle}</p>
      </div>
    </section>
  );
};

export default Hero;