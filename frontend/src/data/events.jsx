// data/events.js
const events = [
  {
    title: "Wolf Moon",
    date: "WED, June 11, 2025",
    description: "The Moon will reach full phase. At this time of the month, it is visible for much of the night, rising at around dusk and setting at dawn.",
    badge: "Full Moon",
    badgeColor: "blue",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg"
  },
  {
    title: "Daytime Arietid meteor shower",
    date: "TUE, June 10, 2025",
    description: "The Daytime Arietid meteor shower will be active from 14 April to 24 June, producing its peak rate of meteors around 10 June.",
    badge: "Meteor Shower",
    badgeColor: "green",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Perseid_Meteor_Shower.jpg"
  },
  {
    title: "Venus appearance",
    date: "WED, June 18, 2025",
    description: "Venus react to be visible at twilight and just after sunset in the western sky.",
    badge: "Planet visibility",
    badgeColor: "purple",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Venus_globe.jpg/600px-Venus_globe.jpg"
  },
  {
  title: "Saturn at Opposition",
    date: "FRI, July 5, 2025",
    description: "Saturn will be at its closest approach to Earth and its face will be fully illuminated by the Sun.",
    badge: "Planet Event",
    badgeColor: "yellow",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg"
  },
  {
    title: "Total Solar Eclipse",
    date: "MON, August 12, 2025",
    description: "A total solar eclipse will be visible in parts of the Northern Hemisphere, a rare and awe-inspiring event.",
    badge: "Eclipse",
    badgeColor: "red",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Total_Solar_Eclipse_2017.jpg"
  },
];

const EventsType =[
  { title: 'Moon Phase', color: 'blue'},
  { title: 'Eclipse', color: 'red'},
  { title: 'Planets', color: 'purple'},
  { title: 'Meteor Shower', color: 'green'},
  { title: 'Special Events', color: 'yellow'}
];

export { events, EventsType };