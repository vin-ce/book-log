export function formatDateFromDash(dateString) {
  const [day, month, year] = dateString.split('/');
  const dateObject = new Date(`${month}/${day}/${year}`);
  const formattedDate = dateObject.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return formattedDate;
};

export function formatDateFromSeconds(seconds) {
  const date = new Date(seconds * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

export function extractPartsFromDashDate(date) {
  const [day, month, year] = date.split('/');
  return { day, month, year };
}