import { card } from "../assets";
import Button from "./Button";

const CardDeal = () => (
  <section className={'flex md:flex-row flex-col sm:py-16 py-6'}>
    <div className={'flex-1 flex justify-center items-start flex-col'}>
      <h2 className={'font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full'}>
        Fraud-proof <br className="sm:block hidden" /> Authentication.
      </h2>
      <p className={`font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px] max-w-[470px] mt-5`}>
        We verify personal data such as Identity, Title Deeds, Municipal Operating Licenses, Personal and Business Addresses,
        Reputation for real customers, local credit history and many other integrations.
        <br />
        We do all of this with zK technology, AI and human verification.
      </p>

    </div>

    <div className={'flex-1 flex justify-center items-center md:ml-10 ml-0 md:mt-0 mt-10 relative'}>
      <img src={card} alt="billing" className="w-[100%] h-[100%]" />
    </div>
  </section>
);

export default CardDeal;
