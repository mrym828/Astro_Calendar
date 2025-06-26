import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout/Layout';
import Home from './pages/Home/Home';
import AstroCalendar from './pages/Calendar/Calendar';
import HomePageBackGround from './assets/images/Backgrounds/homepage_background.png';
import CalendarHero from './assets/images/Backgrounds/CalendarHero.png';
import Hero from './components/common/Hero/Hero';
const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout
          hero={
            <Hero
          Background={HomePageBackGround}
          title="ASTRONOMICAL CALENDAR"
          subtitle="Track upcoming astronomical events"
          ButtonText="View Calendar"
            />
          }
          >
            <Home />
          </Layout>
        }
      />
      <Route
      path="/Calendar"
      element={
        <Layout
          hero={
            <Hero
            Background={CalendarHero}
            title="ASTRONOMICAL CALENDAR"
            subtitle="Never miss another meteor shower, eclipse, or planetary alignment."
            showButton= {false}
            />
          }>
          <AstroCalendar/>
        </Layout>
      }   
      />
         {/* Add more routes wrapped in <Layout> as needed */}
    </Routes>
  );
};

export default App;