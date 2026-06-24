import Link from 'next/link'
import { liensRapides } from '@/data/categories'

export default function QuickLinksBar() {
   return (
  <div className="border-t border-neutral-100 w-full">
    <div className="w-full overflow-x-auto px-4 scrollbar-none">
      <div className="grid grid-flow-col grid-cols-4 auto-cols-[calc((100%-3*1rem)/4)] gap-4 py-2 w-full">
        {liensRapides.map((lien) => (
          <Link
            key={lien.href}
            href={lien.href}
            className="whitespace-nowrap text-sm font-medium text-neutral-600 hover:text-orange-600 text-center block"
          >
            {lien.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
 )
}
