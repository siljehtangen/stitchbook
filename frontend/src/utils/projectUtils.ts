export function parseCraftDetails(json: string): Record<string, string> {
  try {
    return JSON.parse(json || '{}')
  } catch (e) {
    console.error('Malformed craftDetails:', e)
    return {}
  }
}
