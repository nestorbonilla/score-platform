import Arb from "./assets/arblogo.png"
import Image from 'next/image';

const clients = [
  {
    id: "client-1",
    logo: Arb,
  },
  {
    id: "client-2",
    logo: Arb,
  },
  {
    id: "client-3",
    logo: Arb,
  },
  {
    id: "client-4",
    logo: Arb,
  },
];

const Clients = () => (
  <section className={`flex justify-center items-center my-4`}>
    <div className={`flex justify-center items-center flex-wrap w-full `}>
      {clients.map((client) => (
        <div key={client.id} className={`flex-1 flex justify-center items-center sm:min-w-[192px] min-w-[120px] m-5`}>
          <Image src={client.logo} alt="client_logo" width={192} height={192} className="sm:w-[192px] w-[100px] object-contain" />
        </div>
      ))}
    </div>
  </section>
);

export default Clients;
