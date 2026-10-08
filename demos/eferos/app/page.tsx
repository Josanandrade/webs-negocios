import Hero from "@/components/sections/Hero";
import Approach from "@/components/sections/Approach";
import Treatments from "@/components/sections/Treatments";
import Conditions from "@/components/sections/Conditions";
import Spaces from "@/components/sections/Spaces";
import Team from "@/components/sections/Team";
import Visit from "@/components/sections/Visit";
import Reviews from "@/components/sections/Reviews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Approach />
      <Treatments />
      <Conditions />
      <Spaces />
      <Team />
      <Reviews />
      <Visit />
    </>
  );
}
