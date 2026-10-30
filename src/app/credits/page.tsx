import { StaticPage } from '@/components/layout/StaticPage'
import { brand } from '@/config/brand'

export const metadata = { title: 'Credits' }

export default function Credits() {
  return (
    <StaticPage title="Credits">
      <p>{brand.gameTitle} at {brand.schoolLong} is an original game. The school, characters, trophy and copy were made for it.</p>
      <h2 className="label text-[13px] font-bold text-navy">Type</h2>
      <p>Anton, Alfa Slab One, Graduate, Montserrat and Zilla Slab, all under the SIL Open Font License.</p>
      <h2 className="label text-[13px] font-bold text-navy">Art</h2>
      <p>The 3D corridor, trophy and textures are generated in code. Icons and character portraits were drawn for this project.</p>
      <h2 className="label text-[13px] font-bold text-navy">Built with</h2>
      <p>Next.js, React, three.js, React Three Fiber, drei and postprocessing.</p>
    </StaticPage>
  )
}
