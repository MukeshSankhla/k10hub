import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import LearningProgression from '../components/home/LearningProgression';

export default function HomePage() {
  return (
    <>
      <Header />

      <main id="main-content" tabIndex={-1}>
        <Hero />
        <LearningProgression />
      </main>

      <Footer />
    </>
  );
}
