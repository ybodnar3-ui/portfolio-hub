import { getFeatures } from '@/lib/data'
import { FeatureSearch } from '@/components/feature-search'

export const metadata = { title: 'Lab — бібліотека фіч' }

export default function LabPage() {
  const features = getFeatures()

  return (
    <main className="pb-20 pt-8" style={{ paddingInline: 'var(--gutter)' }}>
      <header className="reveal border-b border-line pb-7">
        
        <h1 className="text-4xl">Lab</h1>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted">
          Фічі, витягнуті з проєктів у самодостатні файли. Кожна працює, якщо відкрити її
          напряму в браузері — тому її можна взяти й покласти в новий проєкт як є.
        </p>
      </header>

      <div className="reveal pt-8">
        <FeatureSearch features={features} />
      </div>
    </main>
  )
}
