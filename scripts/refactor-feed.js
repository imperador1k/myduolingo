const fs = require('fs');
let code = fs.readFileSync('src/components/learn/unit-island-feed.tsx', 'utf8');

// The main flex column has gap-16 lg:gap-[120px] and pb-12
// Let's replace it with just w-full flex flex-col items-center without gaps so the background colored sections seamlessly touch!
code = code.replace(
    '<div className="relative w-full flex flex-col items-center gap-16 lg:gap-[120px] pb-12">',
    '<div className="relative w-full flex flex-col items-center overflow-hidden rounded-none lg:rounded-[32px] shadow-sm">'
);

// We should also remove any extra padding or margin on the wrapper inside the map if there is any, but it's just `<div className="relative w-full flex flex-col items-center">`
// That's fine.

fs.writeFileSync('src/components/learn/unit-island-feed.tsx', code);
console.log('UNIT ISLAND FEED GAPS REMOVED!');
