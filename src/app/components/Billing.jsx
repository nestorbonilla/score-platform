import { bill } from '@/app/assets';

const Billing = () => (
  <section id="product" className={'flex md:flex-row flex-col-reverse sm:py-16 py-6'}>
    <div className={'flex-1 flex justify-center items-center md:mr-10 mr-0 md:mt-0 mt-10 relative'}>
      <img src={bill} alt="billing" className="w-[100%] h-[95%] relative z-[5]" />

      {/* gradient start */}
      <div className="absolute z-[3] -left-1/2 top-0 w-[50%] h-[50%] rounded-full white__gradient" />
      <div className="absolute z-[0] w-[50%] h-[50%] -left-1/2 bottom-0 rounded-full pink__gradient" />
      {/* gradient end */}
    </div>

    <div className={'flex-1 flex justify-center items-start flex-col'}>
      <h2 className={'font-poppins font-semibold xs:text-[48px] text-[40px] text-white xs:leading-[76.8px] leading-[66.8px] w-full'}>
        Visual Confidence <br className="sm:block hidden" /> Score
      </h2>
      <p className={`font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px] max-w-[470px] mt-5`}>
        Know the data that your credit applicants have authenticated.
      </p>


    </div>
  </section>
);

export default Billing;
