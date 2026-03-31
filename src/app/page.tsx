import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Benchmark from "@/components/Benchmark";
import Publications from "@/components/Publications";
import About from "@/components/About";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Projects />
      <Benchmark />
      <Publications />
      <About />
      <Footer />
    </main>
  );
}
