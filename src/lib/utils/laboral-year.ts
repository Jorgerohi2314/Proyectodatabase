export function getLaboralYear(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();

  // Laboral year starts August 15
  // If date is before August 15, it belongs to the previous laboral year
  const isBeforeAugust15 = month < 7 || (month === 7 && day < 15);
  
  const startYear = isBeforeAugust15 ? year - 1 : year;
  const endYear = startYear + 1;
  
  // Format as YY/YY (e.g., 25/26)
  const startShort = String(startYear).slice(-2);
  const endShort = String(endYear).slice(-2);
  
  return `${startShort}/${endShort}`;
}

export function getLaboralYearRange(label: string): { start: Date; end: Date } {
  // Label format: "25/26"
  const [startShort, endShort] = label.split('/');
  const startYear = 2000 + parseInt(startShort, 10);
  const endYear = 2000 + parseInt(endShort, 10);
  
  const start = new Date(startYear, 7, 15); // August 15
  const end = new Date(endYear, 6, 15); // July 15
  
  return { start, end };
}

export function sortLaboralYears(years: string[]): string[] {
  return years.sort((a, b) => {
    const [aStart] = a.split('/');
    const [bStart] = b.split('/');
    return parseInt(bStart, 10) - parseInt(aStart, 10); // Descending order (newest first)
  });
}