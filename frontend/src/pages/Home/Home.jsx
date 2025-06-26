//home.jsx

import HomePageBackGround from '../../assets/images/Backgrounds/homepage_background.png';
import Navigation from '../../components/common/Navigation/Navigation';
import HighlightedEvent from './HighlightedEvent/HighlightedEvent';
import UpcomingEvents from './UpcomingEvents/UpcomingEvents';
import Newsletters from './Newsletters/Newsletters';

const Home = () => {
  return (
    <main className="home-container">
    <HighlightedEvent/>
    <div class="my-8">
    <UpcomingEvents/>
    </div>
    <div class="my-8 mt-20">
      <Newsletters/>
    </div>
    </main>
  );
};

export default Home;