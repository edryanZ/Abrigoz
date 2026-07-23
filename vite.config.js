import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: 'autoUpdate',

  
      manifest: {

        name: 'Abrigo',

        short_name: 'Abrigo',

        description:
          'Um lugar tranquilo para guardar momentos especiais.',

        theme_color: '#87CEEB',

        background_color: '#f7fcff',

        display: 'standalone',

        orientation: 'portrait',

        icons: [

          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },

          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }

        ]

      }

    })

  ]

})