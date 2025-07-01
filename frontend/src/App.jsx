import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout/Layout';
import Home from './pages/Home/Home';
import AstroCalendar from './pages/Calendar/Calendar';
import HomePageBackGround from './assets/images/Backgrounds/homepage_background.png';
import EventsHeader from './assets/images/Backgrounds/EventsHeader.png'
import CalendarHero from './assets/images/Backgrounds/CalendarHero.png';
import ArchiveHero from './assets/images/Backgrounds/ArchiveHeader.png';
import SearchHero from './assets/images/Backgrounds/SearchHero.png'
import Hero from './components/common/Hero/Hero';
import EventsList from './pages/Events/EventsList/EventsList';
import Archive from './pages/Archive/Archive';
import SearchPage from './pages/Search/Search';
import EventDetail from './pages/Events/EventDetails/EventDetails';
import { useParams, useNavigate } from 'react-router-dom';
import { mockEvents } from './pages/Events/EventsList/EventsList';

const EventDetailWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => navigate('/events');
  const currentEvent = mockEvents.find(event => event.id === parseInt(id));

  return (
    <Layout
      hero={
        <Hero
          Background={CalendarHero}
          title={currentEvent ? currentEvent.title : 'Event Details'}
          showButton={true}
          eventId={currentEvent.id}
          EventsPage= {true}
        />
      }
    >
      <EventDetail eventId={id} onBack={handleBack} />
    </Layout>
  );
};

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
          EventsPage= {false}
            />
          }
          >
            <Home />
          </Layout>
        }
      />
      <Route
      path="/calendar"
      element={
        <Layout
          hero={
            <Hero
            Background={CalendarHero}
            title="ASTRONOMICAL CALENDAR"
            subtitle="Never miss another meteor shower, eclipse, or planetary alignment."
            showButton= {false}
            EventsPage= {false}
            />
          }>
          <AstroCalendar/>
        </Layout>
      }   
      />
      <Route
      path="/events"
      element={
        <Layout
          hero={
            <Hero
            Background={EventsHeader}
            title="Celestial Events"
            subtitle="Discover upcoming astronomical events and plan your stargazing adventures."
            showButton= {false}
            EventsPage= {false}
            />
          }>
          <EventsList/>
        </Layout>
      }   
      />
      <Route
      path="/archive"
      element={
        <Layout
          hero={
            <Hero
            Background={ArchiveHero}
            title="Celestial Archive"
            subtitle="Explore our comprehensive collection of past astronomical events."
            showButton= {false}
            EventsPage= {false}
            />
          }>
          <Archive/>
        </Layout>
      }   
      />
      <Route
      path="/search"
      element={
        <Layout
          hero={
            <Hero
            Background={SearchHero}
            title="Celestial Search"
            subtitle="Search and analyze astronomical data with advanced filters and export tools."
            showButton= {false}
            EventsPage= {false}
            />
          }>
          <SearchPage/>
        </Layout>
      }   
      />
      <Route
        path="/events/:id"
        element={
          <EventDetailWrapper />
        }
      />
    </Routes>
  );
};

export default App;