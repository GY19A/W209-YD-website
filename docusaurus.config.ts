import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

export default {
  title: 'Yellow Duckie Coin',
  tagline: 'The world\'s first Solana POW meme coin！',
  url: 'https://thecodingmachine.github.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/yd.png',
  organizationName: 'thecodingmachine',
  projectName: 'react-native-boilerplate',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  themes: [
    // ... Your other themes.
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,

        // For Docs using Chinese, it is recommended to set:
        language: ["en", "zh"],

        // If you're using `noIndex: true`, set `forceIgnoreNoIndex` to enable local index:
        // forceIgnoreNoIndex: true,
      }),
    ],
  ],
  plugins: [
    async function myPlugin() {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          // eslint-disable-next-line global-require,import/no-extraneous-dependencies
          postcssOptions.plugins.push(require('tailwindcss'));
          // eslint-disable-next-line global-require,import/no-extraneous-dependencies
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/thecodingmachine/react-native-boilerplate/edit/main/website-documentation/docs',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/thecodingmachine/react-native-boilerplate/edit/main/website-documentation/blog',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  staticDirectories: ['static'],
  themeConfig: {
    // algolia: {
    //   appId: 'RS0W62V3KF',
    //   indexName: '20f91c3ffa50a5c271ea9faa0c56de9e',
    //   apiKey: '20f91c3ffa50a5c271ea9faa0c56de9e',
    //   contextualSearch: true,
    // },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Yellow Duckie Coin',
      logo: {
        alt: 'yellow duckie logo',
        src: 'img/yd.png',
      },
      items: [
        {
          to: 'https://explorer.yellowduckie.net/',
          label: 'Explorer',
          position: 'left',
        },
        {
          to: 'https://pool.yellowduckie.net/',
          label: 'MiningPool',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'white-paper',
          position: 'left',
          label: 'Whitepaper',
        },
        {
          to: 'https://github.com/YellowDuckieCoin/YellowDuckie',
          label: 'GitHub',
          position: 'right',
        },
        // {
        //   type: 'doc',
        //   docId: 'white-paper',
        //   position: 'left',
        //   label: 'Docs',
        // },
        // // { to: '/blog', label: 'Blog', position: 'left' },
        // {
        //   to: 'https://github.com/thecodingmachine/react-native-boilerplate',
        //   label: ' ',
        //   className: 'header-github-link group',
        //   position: 'right',
        // },
      ],
    },
    headTags: [
      { tagName: 'meta', attributes: { name: 'og:image', content: '/img/yd.png' } },
      { tagName: 'meta', attributes: { name: 'og:title', content: 'Yellow Duckie Coin' } },
      { tagName: 'meta', attributes: { name: 'og:description', content: 'The Yellow Duckie Coin!' } },
      { tagName: 'meta', attributes: { name: 'twitter:card', content: 'summary_large_image' } },
      { tagName: 'meta', attributes: { name: 'twitter:image', content: '/img/yd.png' } },
      { tagName: 'meta', attributes: { name: 'twitter:title', content: 'Yellow Duckie Coin' } },
      { tagName: 'meta', attributes: { name: 'twitter:description', content: 'The Yellow Duckie Coin!' } },
    ],
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: 'Features',
      //     items: [
      //       {
      //         label: 'Navigation',
      //         to: '/docs/navigate',
      //       },
      //       {
      //         label: 'Data fetching',
      //         to: '/docs/data-fetching',
      //       },
      //       {
      //         label: 'Internationalization',
      //         to: '/docs/internationalization',
      //       },
      //       {
      //         label: 'Multi theming',
      //         to: '/docs/theming/how-to-use',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: '/blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         to: 'https://github.com/thecodingmachine/react-native-boilerplate',
      //       },
      //     ],
      //   },
      // ],
      copyright: `Copyright © ${new Date().getFullYear()} The Yellow Duckie Team.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
} satisfies Config;
