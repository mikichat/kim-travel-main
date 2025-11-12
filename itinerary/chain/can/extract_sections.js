const fs = require('fs');
const html = fs.readFileSync('25년11월중순 광저우 망산-1.html', 'utf8');

// Remove all whitespace between tags for easier parsing
const compact = html.replace(/>\s+</g, '><');

console.log('=== EXTRACTING DATA SECTIONS ===\n');

// Extract all text from spans with the hrt class (heading/important text)
const textMatches = compact.match(/<span[^>]*class="[^"]*hrt[^"]*"[^>]*>([^<]*)<\/span>/g) || [];
console.log('Important text elements:');
textMatches.slice(0, 50).forEach((match, idx) => {
  const text = match.replace(/<span[^>]*>/i, '').replace(/<\/span>/i, '').replace(/&nbsp;/g, ' ').trim();
  if (text) console.log('  ' + (idx + 1) + '. ' + text);
});

console.log('\n=== ANALYZING TABLE STRUCTURES ===\n');

// Find all div.htb (table blocks)
const tableMatches = compact.match(/<div class="htb"[^>]*>[\s\S]{0,2000}?<\/div>/g) || [];
console.log('Found ' + tableMatches.length + ' table-like structures\n');

// Look for specific patterns in the first table
if (tableMatches.length > 0) {
  console.log('Sample table structure (first table, truncated):');
  const firstTable = tableMatches[0].substring(0, 500);
  console.log(firstTable);
}

console.log('\n\n=== EXTRACTING ITINERARY DATA ===\n');

// Look for day-by-day itinerary
const dayPattern = /([0-9]+)일차[:\s]*([^<]*)/gi;
let dayMatch;
const days = [];
while ((dayMatch = dayPattern.exec(html)) !== null) {
  days.push({
    day: dayMatch[1],
    content: dayMatch[2].substring(0, 100)
  });
}

if (days.length > 0) {
  console.log('Itinerary days found: ' + days.length);
  days.forEach(d => console.log('  Day ' + d.day + ': ' + d.content));
} else {
  console.log('No explicit day-by-day itinerary found in text format');
  console.log('Itinerary likely in image format or tables');
}

console.log('\n=== CHECKING CSS CLASSES ===\n');
const classPattern = /class="([^"]*)"/g;
const classes = {};
let classMatch;
while ((classMatch = classPattern.exec(compact)) !== null) {
  const classList = classMatch[1].split(/\s+/);
  classList.forEach(cls => {
    classes[cls] = (classes[cls] || 0) + 1;
  });
}

console.log('Top CSS classes by frequency:');
Object.entries(classes)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .forEach(([cls, count]) => {
    console.log('  ' + cls + ': ' + count);
  });
