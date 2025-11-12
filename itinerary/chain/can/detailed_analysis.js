const fs = require('fs');
const html = fs.readFileSync('25년11월중순 광저우 망산-1.html', 'utf8');

console.log('=== DETAILED STRUCTURE ANALYSIS ===\n');

// Extract all text content
const regex = /<span[^>]*class="[^"]*hrt[^"]*"[^>]*>([^<]+)<\/span>/g;
let match;
const textContent = [];
while ((match = regex.exec(html)) !== null) {
  const text = match[1].replace(/&nbsp;/g, ' ').trim();
  if (text && text.length > 0) {
    textContent.push(text);
  }
}

console.log('Key Text Content (extracted in order):');
textContent.slice(0, 40).forEach((text, idx) => {
  console.log((idx + 1) + '. ' + text);
});

console.log('\n\n=== Looking for Data Patterns ===\n');

// Price patterns
const pricePattern = /([0-9,]+원|[0-9]+,?[0-9]*\$|[0-9]+,?[0-9]*USD)/g;
const prices = html.match(pricePattern) || [];
console.log('Price values found:', prices.slice(0, 10));

// Date patterns
const datePattern = /[0-9]{4}년\s*[0-9]{1,2}월\s*[0-9]{1,2}일/g;
const dates = html.match(datePattern) || [];
console.log('\nDate values found:', dates);

// Look for table structure (div.htb sections)
const tablePattern = /<div class="htb"/g;
const tables = html.match(tablePattern) || [];
console.log('\nNumber of table-like structures (div.htb): ' + tables.length);

// Extract SVG count
const svgPattern = /<svg/g;
const svgs = html.match(svgPattern) || [];
console.log('Number of SVG blocks: ' + svgs.length);

console.log('\n\n=== Checking for specific content sections ===\n');

const contactMatch = html.match(/담당자[:\s]*([^<]*)/i);
const destMatch = html.match(/여행지[:\s]*([^<]*)/i);
const dateMatch = html.match(/일\s*자[:\s]*([^<]*)/i);
const airlineMatch = html.match(/(아시아나|대한항공|에어부산|롯데항공)/i);

if (contactMatch) console.log('Contact: ' + contactMatch[1]);
if (destMatch) console.log('Destination: ' + destMatch[1]);
if (dateMatch) console.log('Dates: ' + dateMatch[1]);
if (airlineMatch) console.log('Airline: ' + airlineMatch[1]);

console.log('\n\nFile Analysis Summary:');
console.log('- Total file size: ' + Math.round(html.length / 1024) + ' KB');
console.log('- Format: Minified HTML (single line)');
console.log('- Contains embedded images: Yes (18 PNG files)');
console.log('- Layout: Absolute positioning with mm units');
console.log('- Document type: Print-optimized itinerary/quote');
