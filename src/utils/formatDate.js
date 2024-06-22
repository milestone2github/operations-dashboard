export function formatDate(date) {
  let dt = new Date(date)
  return dt.toLocaleDateString("en-US", {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
  })
}