import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: '沐雪 Bot',
  icon: '/favicon.png',
  logo: {
    'light': '/Muice-light-logo.png',
    'dark': '/Muice-dark-logo.png'
  },
  route: {
    cleanUrls: true,
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/Moemu/MuiceBot/',
      },
      {
        icon: 'bilibili',
        mode: 'link',
        content: 'https://space.bilibili.com/97020216',
      },
      {
        icon: 'qq',
        mode: 'link',
        content: 'https://pd.qq.com/s/d4n2xp45i',
      },
    ],
  },
});
