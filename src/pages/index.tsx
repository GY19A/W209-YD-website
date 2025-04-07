import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/Features';
import Circles from '@site/src/components/circles';
import Quickstart from '@site/src/components/Quickstart';
import CodeBlock from '@theme/CodeBlock';
import Web3Map from '../components/Web3Map';  // 使用相对路径
import TokenMarketData from '../components/TokenMarketData';
import PyramidRacingBar from '../components/PyramidRacingBar';
import TopFromWalletsRacing from '../components/TopFromWalletsRacing';
import TopToWalletsRacing from '../components/TopToWalletsRacing';
import TransactionSankey from '../components/TransactionSankey';
import TreemapDropdown from '../components/TreemapDropdown';
import YellowDuckieWeb3Map from '../components/YellowDuckieWeb3Map';
import XEngagementGraph from '../components/XEngagementGraph';
import BitcoinDominanceChart from '../components/BitcoinDominanceChart';
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
          {/* {siteConfig.tagline} */}
          <br />
          <div className="max-w-2xl">
            <CodeBlock
              title="CA:"
              metastring="bash"
            >
              5e1mcGeaNL42mJ2oxBNKDTZ1KYVXLoodp27PonpEnK9d
            </CodeBlock>
          </div>
        </p>

        <div className="py-10">
          <Link
            className="transition-all ease-in hover:bg-yellow-700 hover:text-white hover:text text-md text-white font-bold py-3 px-4 rounded bg-yellow-500 shadow-lg shadow-yellow-500/50"
            to="https://raydium.io/swap/?inputMint=5e1mcGeaNL42mJ2oxBNKDTZ1KYVXLoodp27PonpEnK9d&outputMint=sol"
          >
            Buy Yellow Duckie Coin
            <span className="ml-3">🪙</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="The Yellow Duckie Coin!"
      wrapperClassName="relative overflow-hidden"
    >

      <div className="relative w-full max-w-[1440px] mx-auto opacity-40">
        <div className="animate-blob opacity-80 absolute top-0 -right-10 md:top-0 md:right-0 bg-gradient-to-r from-indigo-600 via-blue-700 to-blue-400 h-[210px] w-[210px] md:h-[350px] md:w-[350px] lg:h-[382px] lg:w-[382px]" style={{ borderRadius: '30% 70% 67% 33% / 64% 30% 70% 36%' }} />
        <div className="animate-blob-delay-1 opacity-80 absolute top-0 right-32 md:top-[250px] md:right-1/4 lg:right-60 bg-gradient-to-r from-red-600 via-pink-700 to-pink-400 h-[180px] w-[180px] md:h-[230px] md:w-[230px] lg:h-[282px] lg:w-[282px]" style={{ borderRadius: '30% 70% 67% 33% / 64% 30% 70% 36%' }} />
      </div>
      {/* <nav style={{marginLeft: '630px'}} className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out hover:bg-white dark:hover:bg-gray-800">
            <div className="space-y-2">
              <a href="#web3-map" className="block text-sm hover:text-yellow-500 transition-colors">Web3 Map</a>
              <a href="#engagement" className="block text-sm hover:text-yellow-500 transition-colors">X Engagement</a>
              <a href="#bitcoin" className="block text-sm hover:text-yellow-500 transition-colors">Bitcoin Dominance</a>
              <a href="#pyramid" className="block text-sm hover:text-yellow-500 transition-colors">Pyramid Racing</a>
              <a href="#wallets" className="block text-sm hover:text-yellow-500 transition-colors">Wallets Analysis</a>
              <a href="#transactions" className="block text-sm hover:text-yellow-500 transition-colors">Transactions</a>
            </div>
          </nav> */}
      <div className="backdrop-blur-xl">

        <div className="relative w-full max-w-[1440px] mx-auto" style={{marginTop: '50px'}}>
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

          <svg className="-mb-[1px] bottom-0 w-full sm:-mt-50 fill-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="current" fillOpacity="1" d="M0,320L60,272C120,224,240,128,360,128C480,128,600,224,720,234.7C840,245,960,171,1080,122.7C1200,75,1320,53,1380,42.7L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
          </svg>
          <section className="relative flex justify-end bg-yellow-400 mb-0 pb-32 sm:-mb-[100px] lg:-mb-[270px] lg:pb-[200px]">
            <div className="relative w-[1200px] mx-auto">
              <div className="space-y-8">
                <section id="web3-map" style={{height: '695px'}} className="bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Web3 Map</h2> */}
                  <div className="h-auto">
                    <YellowDuckieWeb3Map />
                  </div>
                </section>

                <section id="engagement" style={{height: '515px'}} className="bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">X Engagement Analysis</h2> */}
                  <div className="h-auto">
                    <XEngagementGraph />
                  </div>
                </section>

                <section id="bitcoin" style={{height: '585px'}}  className=" bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Bitcoin Dominance</h2> */}
                  <BitcoinDominanceChart />
                </section>

                <section id="pyramid" style={{height: '830px'}}className=" bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Pyramid Racing</h2> */}
                  <PyramidRacingBar />
                </section>

                <section id="wallets" style={{height: '930px'}} className=" bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Wallets Analysis</h2> */}
                  <div className="space-y-4">
                    <TopFromWalletsRacing />
                  </div>
                </section>

                <section id="wallets" style={{height: '930px'}} className=" bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Wallets Analysis</h2> */}
                  <div className="space-y-4">
                    <TopToWalletsRacing />
                  </div>
                </section>
                <section id="transactions" style={{height: '1230px'}}  className=" bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Transaction Analysis</h2> */}
                  <div className="space-y-4">
                    <TransactionSankey />
                  </div>
                </section>
                <section id="transactions"style={{height: '930px'}}  className=" bg-white/10 rounded-lg backdrop-blur">
                  {/* <h2 className="text-xl font-bold mb-4">Transaction Analysis</h2> */}
                  <div className="space-y-4">

                    <TreemapDropdown />
                  </div>
                </section>
              </div>
            </div>
          </section>
          {/* <Quickstart /> */}
          {/* <svg className="-mb-[1px] pointer-events-none absolute bottom-0 sm:bottom-[169px] sm:bottom-[99px] lg:bottom-[269px] w-full sm:-mt-20 fill-neutral-100 dark:fill-neutral-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="current" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg> */}

        </main>


      </div>
    </Layout>
  );
}
