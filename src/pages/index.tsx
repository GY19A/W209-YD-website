import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/Features';
import Circles from '@site/src/components/circles';
import CodeBlock from '@theme/CodeBlock';

import PyramidRacingBar from '../components/PyramidRacingBar';
import TopFromWalletsRacing from '../components/TopFromWalletsRacing';
import TopToWalletsRacing from '../components/TopToWalletsRacing';
import TransactionSankey from '../components/TransactionSankey';
import TreemapDropdown from '../components/TreemapDropdown';
import YellowDuckieWeb3Map from '../components/YellowDuckieWeb3Map';
import XEngagementGraph from '../components/XEngagementGraph';
import BitcoinDominanceChart from '../components/BitcoinDominanceChart';
import PhiPriceEngagementGraph from '../components/PhiPriceEngagementGraph';
import ActivityXEngagementGraph from '../components/ActivityXEngagementGraph';
import Backgrounds from '../components/Backgrounds';

// 新增的 ChartCard 组件，每个卡片分两个部分：上部为原有图表，下部为说明文本
function ChartCard({ children, description }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:-translate-y-2 hover:scale-105" style={{backgroundColor:'rgb(250, 204, 21)'}}>
      {/* 卡片上部分：原有的图表内容 */}
      
        {children}
      
      {/* 卡片下部分：图表说明 */}
      <div className="p-4 bg-gray-100 border-t border-gray-200 text-sm font-medium text-gray-700" style={{backgroundColor:'rgb(250, 204, 21)',color:'#2a2a4d', fontSize:'16px',fontWeight:'400'}}>
        {description}
      </div>
    </div>
  );
}

// 定义一个数组，收集所有图表组件以及对应说明描述
const charts = [
  {
    id: "web3-map",
    content: <YellowDuckieWeb3Map />,
    description:
      "Interactive Web3 Map that provides a real-time visualization of Yellow Duckie's blockchain activity, illustrating network interactions and data flow.",
  },
  {
    id: "transactions",
    content: <TransactionSankey />,
    description:
      "Detailed Sankey diagram that visualizes blockchain transaction flows, clearly depicting the movement of funds across the network.",
  },
  {
    id: "engagement",
    content: <XEngagementGraph />,
    description:
      "This visualization displays the analytics from YD's X account. Use the checkbox to toggle lines on and off. Hover over the line to get more details.",
  },
  {
    id: "activity-x-engagement",
    content: <ActivityXEngagementGraph />,
    description:
      "This visualization shows X social media impressions over time, with circles \ representing the number of transactions on the day.",
  },
  {
    id: "bitcoin",
    content: <BitcoinDominanceChart />,
    description:
      "This visualization displays the relationship between Bitcoin Market Dominance and the Altcoin Index over time. Use the time period buttons to adjust the view, and hover over data points to see detailed information.",
  },
  {
    id: "pyramid",
    content: <PyramidRacingBar />,
    description:
      "Dynamic pyramid racing bar chart illustrating ranking changes and competitive performance shifts in real time.",
  },
  {
    id: "wallets-from",
    content: <TopFromWalletsRacing />,
    description:
      "Visualization of top originating wallets, tracking competitive trends in transaction initiations and on-chain activity.",
  },
  {
    id: "wallets-to",
    content: <TopToWalletsRacing />,
    description:
      "Visualization of wallets receiving the highest transaction volumes, reflecting network transactional popularity and influence.",
  },
  {
    id: "treemap_dropdown",
    content: <TreemapDropdown />,
    description:
      "Hierarchical treemap that presents a detailed breakdown of transaction data, enabling multifaceted analysis of network activities.",
  },
];


function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header>
      <div className="bottom-0 w-screen left-1/2 top-24 ml-3 mt-10 pt-0 md:pt-0 sm:-ml-5 md:ml-auto flex justify-end right-12 md:top-auto md:left-auto md:-right-12 md:justify-center absolute md:w-2/3 sm:top-20 m-auto lg:w-1/2">
        <img
          className="dark:block pointer-events-none hidden object-contain z-10 w-full md:w-3/4"
          src="./img/yd.png"
          alt="tom"
        />
        <img
          className="dark:hidden pointer-events-none sm:block object-contain z-10 w-full md:w-3/4"
          src="./img/yd.png"
          alt="tom"
        />
      </div>

      <div className="px-5 sm:px-12 md:px-16 relative mx-auto pt-10 md:pt-24 max-w-7xl">
        <h1 className="text-[32px] sm:text-[40px] mt-10 lg:mt-16 md:mt-0 md:text-[45px] lg:text-[63px] leading-10 md:leading-8 font-black text-yellow-400">
          Yellow Duckie Coin
          <span className="font-extralight mt-4 md:mt-8 lg:mt-0 text-[66px] sm:text-[83px] md:text-[92px] lg:text-8xl block text-yellow-500 dark:text-yellow-600">$YD</span>
        </h1>
        <p className="mt-6 pr-20 sm:pr-0 sm:mt-12 lg:mt-5 w-full sm:w-2/3 md:w-1/2 text-sm font-bold ml-1 text-slate-700 dark:text-white">
          <br />
          <div className="max-w-2xl">
            <CodeBlock title="CA:" metastring="bash">
              5e1mcGeaNL42mJ2oxBNKDTZ1KYVXLoodp27PonpEnK9d
            </CodeBlock>
          </div>
        </p>
        <div className="py-10 flex gap-4">
          <Link
            className="transition-all ease-in hover:bg-yellow-700 hover:text-white text-md font-bold py-3 px-4 rounded bg-yellow-500 shadow-lg shadow-yellow-500/50"
            to="https://raydium.io/swap/?inputMint=5e1mcGeaNL42mJ2oxBNKDTZ1KYVXLoodp27PonpEnK9d&outputMint=sol"
          >
            Buy $YD <span className="ml-3">🪙</span>
          </Link>
          <Link
            className="transition-all ease-in hover:bg-yellow-700 hover:text-white text-md font-bold py-3 px-4 rounded bg-yellow-500 shadow-lg shadow-yellow-500/50"
            to="/docs/mining-guide"
          >
            Mine $YD <span className="ml-3">⛏️</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="The Yellow Duckie Coin!"
      wrapperClassName="relative overflow-hidden"
    >
      {/* 背景动画 */}
      <div className="relative w-full max-w-[1440px] mx-auto opacity-40">
        <div
          className="animate-blob opacity-80 absolute top-0 -right-10 md:top-0 md:right-0 bg-gradient-to-r from-indigo-600 via-blue-700 to-blue-400 h-[210px] w-[210px] md:h-[350px] md:w-[350px] lg:h-[382px] lg:w-[382px]"
          style={{ borderRadius: '30% 70% 67% 33% / 64% 30% 70% 36%' }}
        />
        <div
          className="animate-blob-delay-1 opacity-80 absolute top-0 right-32 md:top-[250px] md:right-1/4 lg:right-60 bg-gradient-to-r from-red-600 via-pink-700 to-pink-400 h-[180px] w-[180px] md:h-[230px] md:w-[230px] lg:h-[282px] lg:w-[282px]"
          style={{ borderRadius: '30% 70% 67% 33% / 64% 30% 70% 36%' }}
        />
      </div>

      <div className="backdrop-blur-xl">
        <div
          className="relative w-full max-w-[1440px] mx-auto"
          style={{ marginTop: '50px' }}
        >
          <div className="absolute top-[800px]">
            <Circles animate="animate-circle-delay-1" />
          </div>
          <div className="absolute top-[400px] right-0">
            <Circles color="white" />
          </div>
          <HomepageHeader />
        </div>

        <main className="relative">
          <div className="relative w-full max-w-[1440px] mx-auto">
            <HomepageFeatures />
          </div>

          {/* 底部波浪 SVG */}
          <svg
            className="-mb-[1px] bottom-0 w-full sm:-mt-50 fill-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
          >
            <path
              fill="current"
              fillOpacity="1"
              d="M0,320L60,272C120,224,240,128,360,128C480,128,600,224,720,234.7C840,245,960,171,1080,122.7C1200,75,1320,53,1380,42.7L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>

          {/* 将原有各图表 section 替换成卡片堆叠效果 */}
          <div
            id="main_content"
            style={{ width: '100%', backgroundColor: 'rgb(250, 204, 21)' }}
          >
            <section
              style={{ width: '1200px', margin: '0 auto' }}
              className="relative flex flex-col gap-8 bg-yellow-400 mb-0 pb-8"
            >
              {charts.map(({ id, content, description }) => (
                <ChartCard key={id} description={description}>
                  {content}
                </ChartCard>
              ))}
            </section>
          </div>
          {/* 其他部分可继续添加 */}
        </main>
      </div>
    </Layout>
  );
}
