import Navbar from "../../../components/Navbar";
import Hero from "../../../components/hero";
import Footer from "../../../components/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      {/* <Hero /> */}
      <div className=" m-60"></div>
      {/* ...rest of your homepage sections (categories, best sellers, etc.) go here... */}
      <Footer />
    </>
  );
}
