import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Roboto',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
})
