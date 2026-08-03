/** Поля, які скрипт має право перезаписувати. Решта — недоторканна. */
const AUTO_FIELDS = ['lastTouched']

export function mergeProjects(existing, discovered) {
  const byslug = new Map(existing.map((p) => [p.slug, p]))

  for (const found of discovered) {
    if (!found.slug) continue
    const current = byslug.get(found.slug)

    if (current) {
      const updated = { ...current }
      for (const field of AUTO_FIELDS) {
        if (found[field]) updated[field] = found[field]
      }
      byslug.set(found.slug, updated)
      continue
    }

    byslug.set(found.slug, {
      slug: found.slug,
      title: found.title ?? found.slug,
      tagline: '',
      story: '',
      kind: found.kind ?? 'web',
      stack: found.stack ?? [],
      liveUrl: found.liveUrl ?? null,
      localPath: found.localPath ?? '',
      tags: [],
      status: 'idea',
      featureSlugs: [],
      nextStep: '',
      blocker: '',
      lastTouched: found.lastTouched ?? '',
      health: 'unknown',
    })
  }

  return [...byslug.values()]
}
