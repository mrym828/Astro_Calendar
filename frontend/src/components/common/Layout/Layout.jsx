import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content pt-[60px] min-h-screen w-full">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;