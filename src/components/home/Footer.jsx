'use client';
import { useRouter } from 'next/router';

// import { logo, facebook, instagram, linkedin, twitter } from '@/assets';
import { logo } from '@/assets';
import { useEffect } from 'react';
import Image from 'next/image';

const footerLinks = [
  {
    title: "Useful Links",
    links: [
      {
        name: "Content",
        link: "https://www.j.com/content/",
      },
      {
        name: "How it Works",
        link: "https://www.j.com/how-it-works/",
      },
      {
        name: "Create",
        link: "https://www.j.com/create/",
      },
      {
        name: "Explore",
        link: "https://www.j.com/explore/",
      },
      {
        name: "Terms & Services",
        link: "https://www.l.com/terms-and-services/",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        name: "Help Center",
        link: "https://www.l.com/help-center/",
      },
      {
        name: "Partners",
        link: "https://www.l.com/partners/",
      },
      {
        name: "Suggestions",
        link: "https://www.l.com/suggestions/",
      },
      {
        name: "Blog",
        link: "https://www.l.com/blog/",
      },
      {
        name: "Newsletters",
        link: "https://www.l.com/newsletters/",
      },
    ],
  },
  {
    title: "Partner",
    links: [
      {
        name: "Our Partner",
        link: "https://www.k.com/our-partner/",
      },
      {
        name: "Become a Partner",
        link: "https://www.k.com/become-a-partner/",
      },
    ],
  },
];

const socialMedia = [
  // {
  //   id: "social-media-1",
  //   icon: instagram,
  //   link: "https://www.instagram.com/",
  // },
  // {
  //   id: "social-media-2",
  //   icon: facebook,
  //   link: "https://www.facebook.com/",
  // },
  // {
  //   id: "social-media-3",
  //   icon: twitter,
  //   link: "https://www.x.com/",
  // },
  // {
  //   id: "social-media-4",
  //   icon: linkedin,
  //   link: "https://www.linkedin.com/",
  // },
];

const Footer = () => {
  // const router = useRouter();
  
  // const handleClick = (e, href) => {
  //   e.preventDefault();
  //   router.push(href);
  // }
  
  return (
    <section className={`flex justify-center items-center sm:py-16 py-6 flex-col`}>
      <div className={`flex justify-center items-start md:flex-row flex-col mb-8 w-full`}>
        <div className="flex-[1] flex flex-col justify-start mr-10">
          <Image
            src={logo}
            alt="hoobank"
            width={200}
            height={180}
            className="object-contain"
          />
          <p className={`font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px] mt-4 max-w-[312px]`}>
            A new way to verify personal data for web3 credits.
          </p>
        </div>

        <div className="flex-[1.5] w-full flex flex-row justify-between flex-wrap md:mt-0 mt-10">
          {footerLinks.map((footerlink) => (
            <div key={footerlink.title} className={`flex flex-col ss:my-0 my-4 min-w-[150px]`}>
              <h4 className="font-poppins font-medium text-[18px] leading-[27px] text-white">
                {footerlink.title}
              </h4>
              <ul className="list-none mt-4">
                {footerlink.links.map((link, index) => (
                  <li
                    key={link.name}
                    className={`font-poppins font-normal text-[16px] leading-[24px] text-dimWhite hover:text-secondary cursor-pointer ${index !== footerlink.links.length - 1 ? "mb-4" : "mb-0"
                      }`}
                  >
                    {link.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-between items-center md:flex-row flex-col pt-6 border-t-[1px] border-t-[#3F3E45]">
        <p className="font-poppins font-normal text-center text-[18px] leading-[27px] text-white">
          Copyright Ⓒ 2024 deCredit Score. All Rights Reserved.
        </p>

        <div className="flex flex-row md:mt-0 mt-6">
          {socialMedia.map((social, index) => (
            <Image
              key={social.id}
              src={social.icon}
              alt={social.id}
              width={21}
              height={21}
              className={`object-contain cursor-pointer ${index !== socialMedia.length - 1 ? "mr-6" : "mr-0"
                }`}
              onClick={() => handleClick(social.link)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Footer;
