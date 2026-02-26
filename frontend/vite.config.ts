import uni from '@dcloudio/vite-plugin-uni';
import type { UserConfig } from 'vite';
import Components from 'unplugin-vue-components/vite';
import AutoImport from 'unplugin-auto-import/vite';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default async (): Promise<UserConfig> => {
  return {
    plugins: [
      Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        dts: 'src/components.d.ts',
      }),

      uni.default(),
      tailwindcss(),
      AutoImport({
        dts: 'src/auto-imports.d.ts',
        ignore: ['h'], //解决h报错
        imports: [
          'vue',
          'uni-app',
          'pinia',
          {
            '@/utils/common': ['showMessage'],
          },
        ],
        exclude: ['createApp'],
        eslintrc: {
          enabled: true,
        },
      }),
    ],
  };
};
