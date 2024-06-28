export function formatDate(date) {
  let dt = new Date(date)
  return dt.toLocaleDateString("en-US", {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
  })
}

export function formatDateToYYYYMMDD(dateString) {
  if(!dateString) return ''
  const date = new Date(dateString);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns month from 0-11, so add 1
  const day = String(date.getDate()).padStart(2, '0'); // getDate() returns the day of the month from 1-31
  
  return `${year}-${month}-${day}`;
}