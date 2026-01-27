import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Snippets',
  tagline: 'Collection of knowledge snippets',
  favicon: 'img/favicon.ico',
  trailingSlash: true,

  future: { v4: true }, // https://docusaurus.io/docs/api/docusaurus-config#future

  url: 'https://snippets.whoisnian.com',
  baseUrl: '/',

  organizationName: 'whoisnian', // Usually your GitHub org/user name.
  projectName: 'snippets', // Usually your repo name.

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: ({ versionDocsDirPath, docPath }) => {
            return `https://github.com/whoisnian/snippets/edit/master/${versionDocsDirPath}/${docPath}`
          },
        },
        theme: { customCss: './src/css/custom.css' },
        sitemap: { lastmod: 'date' },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/logo.svg',
      colorMode: { respectPrefersColorScheme: true },
      navbar: {
        title: 'Snippets',
        logo: { alt: 'Website Logo', src: 'img/logo.svg', srcDark: 'img/logo-dark.svg' },
        items: [
          { label: '软件', to: '/docs/software', position: 'left' },
          { label: '系统', to: '/docs/system', position: 'left' },
          { label: '编程', to: '/docs/programming', position: 'left' },
          { label: '杂项', to: '/docs/others', position: 'left' },
          { label: 'GitHub', href: 'https://github.com/whoisnian/snippets', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '分类',
            items: [
              { label: '软件', to: '/docs/software' },
              { label: '系统', to: '/docs/system' },
              { label: '编程', to: '/docs/programming' },
              { label: '杂项', to: '/docs/others' },
            ],
          },
          {
            title: '链接',
            items: [
              { label: 'Source', href: 'https://github.com/whoisnian/snippets' },
              { label: "GitHub", href: 'https://github.com/whoisnian' },
              { label: "Blog", href: 'https://whoisnian.com' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} whoisnian. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: [ // default: markup jsx tsx swift kotlin objectivec js-extras reason rust graphql yaml go cpp markdown python json
          'bash', 'ini', 'java', 'javascript', 'log', 'markdown', 'nginx', 'powershell', 'php', 'ruby', 'sql', 'systemd',
        ], // supported additional: https://prismjs.com/#supported-languages or `ls node_modules/prismjs/components/`
      },
    }),
};

export default config;
