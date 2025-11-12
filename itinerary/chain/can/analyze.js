const fs = require('fs');
const html = fs.readFileSync('25년11월중순 광저우 망산-1.html', 'utf8');

console.log('=== HTML STRUCTURE ANALYSIS ===\n');

// Get key info
const titleMatch = html.match(/<title>([^<]*)<\/title>/);
console.log('Title:', titleMatch ? titleMatch[1] : 'N/A');

// Count major elements
const divCount = (html.match(/<div/g) || []).length;
const spanCount = (html.match(/<span/g) || []).length;
const svgCount = (html.match(/<svg/g) || []).length;
const pathCount = (html.match(/<path/g) || []).length;
const styleLinks = html.match(/<link[^>]*href='([^']*)'/g) || [];
const imageUrls = html.match(/url\('([^']*\.png)'\)/g) || [];

console.log('\nElement Counts:');
console.log('- DIV elements:', divCount);
console.log('- SPAN elements:', spanCount);
console.log('- SVG elements:', svgCount);
console.log('- PATH elements:', pathCount);
console.log('- Images (PNG):', imageUrls.length);
console.log('- Style sheets:', styleLinks.length);

console.log('\nCSS Class References:');
const classMatches = html.match(/class="[^"]*"/g) || [];
const uniqueClasses = [...new Set(classMatches)].slice(0, 20);
uniqueClasses.forEach(c => console.log('  ' + c));

console.log('\nImage Files:');
imageUrls.slice(0, 10).forEach(url => console.log('  ' + url));

// Find text content patterns
const textSpans = html.match(/<span[^>]*>([^<]*)<\/span>/g) || [];
console.log('\nText Content Samples (first 10 unique):');
const uniqueTexts = [...new Set(textSpans)].slice(0, 10);
uniqueTexts.forEach(t => {
  const content = t.match(/<span[^>]*>([^<]*)<\/span>/);
  if (content && content[1]) console.log('  ' + content[1]);
});

console.log('\nFile size:', (html.length / 1024 / 1024).toFixed(2), 'MB');
