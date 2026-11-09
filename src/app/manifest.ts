import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Phi Long Technology · Quản lý tòa nhà', short_name: 'Phi Long', description: 'Hệ thống quản lý vận hành tòa nhà',
    start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#12295b', lang: 'vi',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  }
}
