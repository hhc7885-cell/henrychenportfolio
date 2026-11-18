# Mutoscope local portfolio

The public portfolio at https://mutoscope.framer.website/ is reproduced in this Next.js app. Start it with `npm run dev` and open the address printed by Next.js. Run `npm run check` for lint, TypeScript and the production build.

| Source and local path | Implementation |
| --- | --- |
| / | Hero.tsx, hero.module.css, WaterRipple.tsx and OrbitSeal.tsx |
| /work | src/app/work/page.tsx |
| /work/pelagraph, /work/ostrander-field, /work/silvanine, /work/plume-atlas, /work/oddfathom, /work/nye-okada, /work/the-ostler, /work/saltlick-labs | src/app/work/[slug]/page.tsx, work/Gallery.tsx and work/projects.json |
| /about, /contact, /privacy | Corresponding folders in src/app, PageHead.tsx, ContactForm.tsx and content.json |

Shared components live in src/components/sites/mutoscope. The site uses local Geist, Geist Mono and Caveat fonts, the portrait and the original project images. The JSON files beside this document map those assets back to the source.

The homepage reel responds to wheel, touch, arrow keys and the project index. Its geometry adapts to viewport width and height. Project galleries repeat image and text panels in two dimensions and respond to pointer dragging, wheel and keyboard. Escape returns to the work index. The main pages share the theme switch, sound switch, Chicago clock and mobile navigation.

The opening signature, cover ripples, transitions and audio use custom lightweight approximations of the original effects. The contact form validates the fields and prepares a draft in the visitor’s email application. WhatsApp, email, social links and Framer attribution retain external destinations.

