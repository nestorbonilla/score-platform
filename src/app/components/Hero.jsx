import { discount, robot } from '@/assets';
import GetStarted from '@/app/components/GetStarted';
import Image from 'next/image';

const Hero = () => {
  return (
    <section id="home" className={`flex md:flex-row flex-col sm:py-16 py-6`}>
      <div className={`flex-1 flex justify-center items-start flex-col xl:px-0 sm:px-16 px-6`}>
        <a href="https://explorer.gitcoin.co/#/round/42161/0x0c12752d28a68fd3dc791826b3405b8803aa8a52/0x0c12752d28a68fd3dc791826b3405b8803aa8a52-0">
          <div className="flex flex-row items-center py-[6px] px-4 bg-discount-gradient rounded-[10px] mb-2">
            <Image src={discount} alt="discount" width={32} height={32} />
            <p className={`font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px] ml-2`}>
              <span className="text-white">We are</span> a public good.{" "}
              <span className="text-white">Fund us</span> here.
            </p>
          </div>
        </a>
      </div>

      <div className="flex flex-row justify-between items-center w-full">
        <h1 className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100.8px] leading-[75px]">
          Unlock <br className="sm:block hidden" />{" "}
          <span className="text-gradient">Your Credit</span>{" "}
        </h1>
        <h1 className="font-poppins font-semibold ss:text-[68px] text-[52px] text-white ss:leading-[100.8px] leading-[75px] w-full">
          Potential.
        </h1>
        <p className={`font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px] max-w-[500px] mt-3`}>
          We create you an initial trust score from authenticated real world data that enables you access to web3 credits even if you have just opened your wallet and do not have any collateral to put as guarantee.
        </p>
      </div>

      <div className={`flex-1 flex justify-center items-center md:my-0 my-10 relative`}>
        <Image src={robot} alt="billing" width={100} height={95} className="relative z-[5]" />

        {/* gradient start */}
        <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
        <div className="absolute z-[1] w-[80%] h-[80%] rounded-full white__gradient bottom-40" />
        <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
        {/* gradient end */}
      </div>

      <div className={`ss:hidden flex justify-center items-center`}>
        <GetStarted />
      </div>
    </section>
  );
};

export default Hero;
