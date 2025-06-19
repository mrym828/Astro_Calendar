import Hero from '../../components/common/Hero/Hero';
import HomePageBackGround from '../../assets/images/Backgrounds/homepage_background.png';

const Home = () => {
  return (
    <main className="home-container">
      <Hero
  Background={HomePageBackGround}
  title="Explore the Skies"
  subtitle="Dive into detailed planetary motion and sky charts"
/>
    </main>
  );
};

export default Home;