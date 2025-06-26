import { Link } from 'react-router-dom';

const Hero = ({ Background, title, subtitle, showButton = true , ButtonText}) => {
  return (
    <section
      className="relative my-4 w-screen h-[35vh] md:h-[50vh] bg-cover bg-right bg-fixed flex flex-col items-center justify-center text-center text-white"
      style={{ backgroundImage: `url(${Background})` }}
    >

      <div className="p-6 inline-block">
        <h1 className="pt-8 text-2xl sm:text-3xl md:text-[43px] font-semibold tracking-wide mb-6 font-[Orbitron] uppercase">{title}</h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-9 font-normal space-grotesk-font">{subtitle}</p>
        {showButton && (
          <Link
            to="/Calendar"
            className="text-base w-[40px] md:w-[305px] h-[50px] px-6 sm:px-8 md:px-14 py-2 space-grotesk-font-bold  button-gradient text-white rounded-full sm:text-xl md:text-2xl"
          >
            {ButtonText}
          </Link>
        )}


      </div>
    </section>
  );
};

export default Hero;