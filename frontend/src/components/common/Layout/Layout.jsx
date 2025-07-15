import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import Navigation from '../Navigation/Navigation';
const Layout = ({hero, children}) => {
  return (
    <> 
      <Header />
      <div className='mt-20'>
      {hero}
      <Navigation/>
      </div>
      <main className="main-content min-h-screen w-screen">
        {children}
      </main>
      <Footer />
   
    </>
  );
};

export default Layout;