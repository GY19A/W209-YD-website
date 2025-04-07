import React from 'react';

type FeatureItem = {
  title: string;
  icon: string
  color: string
  description: JSX.Element;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'X',
    icon: '../img/social/x_logo-black.png',
    color: 'yellow',
    description: (
      <>
        A straightforward starter kit equipped with essential and widely recognized dependencies.
      </>
    ),
    link: 'https://x.com/YellowDuckieNet',
  },
  {
    title: 'Discord',
    icon: '../img/social/discord.png',
    color: 'cyan',
    description: (
      <>
        It includes just the bare minimum code required to create amazing apps.
      </>
    ),
    link: 'https://discord.gg/XFKbTVeNPC',
  },
  {
    title: 'Coingecko',
    icon: '../img/social/cg.png',
    color: 'green',
    description: (
      <>
        We believe in giving you the freedom to select your preferred codebase language.
      </>
    ),
    link: 'https://coinmarketcap.com/dexscan/solana/6Xei6kKe15fhuezV3LFW8HqsT78K6qtHBuZ6SeWtQ1yw/',
  },
  {
    title: 'Dexscreener',
    icon: '../img/social/dex-screener.png',
    color: 'orange',
    description: (
      <>
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        Effortlessly expand your app's capabilities and scale it up as needed.
      </>
    ),
    link: 'https://dexscreener.com/solana/6xei6kke15fhuezv3lfw8hqst78k6qthbuz6sewtq1yw',
  },
];

const colors = {
  yellow: 'bg-yellow-300 shadow-xl shadow-yellow-500/50',
  green: 'bg-green-400 shadow-xl shadow-green-500/50',
  orange: 'bg-orange-400 shadow-xl shadow-orange-500/50',
  cyan: 'bg-cyan-400 shadow-xl shadow-cyan-500/50',
};

function Feature({
  title, icon, color, description, link,
}: FeatureItem) {
  const colorClass = colors[color];
  return (
    <div
      className="
        transition-all
        ease-in
        flex
        items-center
        bg-slate-100/40
        dark:bg-slate-800/40
        backdrop-blur-xl
        rounded-xl
        p-4
        hover:shadow-xl
     "
    >
       {/* mr-4 */}
      <div
        className={`
          flex
          items-center
          justify-center
          ${colorClass}
          border-sm
          w-[50px]
          h-[50px]
          min-w-[50px]
          min-h-[50px]
        
          rounded-xl
        `}
      >
        <a href={link} target="_blank" rel="noopener noreferrer">
          <img className='p-2' src={icon} alt={title} />
        </a>
      </div>
      {/* <div className="flex flex-col">
        <div className="font-bold mb-4">{title}</div>
        <p className="text-xs text-slate-500 dark:text-slate-300">
          {description}
        </p>
      </div> */}
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className="relative">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 p-5 sm:px-16 sm:pb-16 pt-0">
        {FeatureList.map((props, idx) => (
          <Feature key={`feature-${idx}`} {...props} />
        ))}
      </div>
    </section>
  );
}
