import Image from "next/image";
import Button from "./Button";
import { facebook, instagram, linkedin, twitter, cryptochicks, ETHvzla, mxweb3, send, shield, star, cryptoconexion } from '@/assets';

const features = [
  {
    id: "feature-1",
    icon: star,
    title: "Decentralized",
    content:
      "The use of blockchain and smart contracts allows us to be transparent. ",
  },
  {
    id: "feature-2",
    icon: shield,
    title: "Chain Agnostic",
    content:
      "We use a software solution designed to work seamlessly across multiple blockchain networks.",
  },
  {
    id: "feature-3",
    icon: send,
    title: "Verified by Tech & People",
    content:
      "Human support together with the support of technology allows for better verification.",
  },
];

const FeatureCard = ({ icon, title, content, index }) => (
  <div className={`flex flex-row p-6 rounded-[20px] ${index !== features.length - 1 ? "mb-6" : "mb-0"} feature-card`}>
    <div className={`w-[64px] h-[64px] rounded-full flex justify-center items-center bg-dimBlue`}>
      <Image src={icon} alt="star" width={50} height={50} className="object-contain" />
    </div>
    <div className="flex-1 flex flex-col ml-3">
      <h4 className="font-poppins font-semibold text-white text-[18px] leading-[23.4px] mb-1">
        {title}
      </h4>
      <p className="font-poppins font-normal text-dimWhite text-[16px] leading-[24px]">
        {content}
      </p>
    </div>
  </div>
);

const Business = () => (
  <section id="features" className={'flex md:flex-row flex-col sm:py-16 py-6'}>
    <div className={'flex-1 flex justify-center items-start flex-col'}>
      <h2 className={'font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full'}>
        You do the lending business, <br className="sm:block hidden" /> We handle the IRL risks.
      </h2>
      <p className={`font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px] max-w-[470px] mt-5`}>
        Creating new forms of verification for all those who require web3 credits.
      </p>


    </div>

    <div className={`flex-1 flex justify-center items-center md:ml-10 ml-0 md:mt-0 mt-10 relative flex-col`}>
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} {...feature} index={index} />
      ))}
    </div>
  </section>
);

export default Business;
