// Visited countries (ISO 3166-1 alpha-2)
const visited = new Set([
  'GB', 'IE', 'FR', 'ES', 'BE', 'PT', 'CY', 'IT', 'CH', 'AT',
  'HU', 'CZ', 'SK', 'HR', 'ME', 'AL', 'MK', 'GR', 'TR', 'PL',
  'DE', 'LT', 'LV', 'EE', 'FI', 'SE', 'DK', 'SI', 'IS', 'US',
  'KG', 'CN', 'VN', 'TH', 'LK', 'BG', 'XK'
]);

const MAP_URL = 'https://unpkg.com/world-atlas@2/countries-110m.json';
const PROJECTION_SCALE = 120;

(async function () {
  // Load TopoJSON + d3 dependencies
  const [topoModule, geoModule] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/topojson-client@3/+esm'),
    import('https://cdn.jsdelivr.net/npm/d3-geo@3/+esm')
  ]);

  const { feature } = topoModule;
  const { geoNaturalEarth1, geoPath } = geoModule;

  // Country ID -> ISO alpha-2 mapping (Natural Earth numeric IDs)
  const idToIso = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(r => r.json())
    .then(async topo => {
      // We need a numeric-to-alpha2 lookup
      // Fetch the TSV that maps numeric IDs to names
      const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
      return topo;
    });

  const response = await fetch(MAP_URL);
  const world = await response.json();
  const countries = feature(world, world.objects.countries);

  // Numeric ISO 3166-1 to alpha-2 mapping for the countries we care about
  const numericToAlpha2 = {
    '826': 'GB', '372': 'IE', '250': 'FR', '724': 'ES', '056': 'BE',
    '620': 'PT', '196': 'CY', '380': 'IT', '756': 'CH', '040': 'AT',
    '348': 'HU', '203': 'CZ', '703': 'SK', '191': 'HR', '499': 'ME',
    '008': 'AL', '807': 'MK', '300': 'GR', '792': 'TR', '616': 'PL',
    '276': 'DE', '440': 'LT', '428': 'LV', '233': 'EE', '246': 'FI',
    '752': 'SE', '208': 'DK', '705': 'SI', '352': 'IS', '840': 'US',
    '417': 'KG', '156': 'CN', '704': 'VN', '764': 'TH', '144': 'LK',
    '100': 'BG', '-99': 'XK'  // Kosovo
  };

  const container = document.getElementById('map');
  const width = 960;
  const height = 500;

  const projection = geoNaturalEarth1()
    .scale(PROJECTION_SCALE)
    .translate([width / 2, height / 2]);

  const path = geoPath(projection);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  countries.features.forEach(f => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = path(f);
    if (!d) return;

    const id = String(f.id);
    const alpha2 = numericToAlpha2[id];
    const isVisited = alpha2 && visited.has(alpha2);

    el.setAttribute('d', d);
    el.setAttribute('fill', isVisited ? '#1a1a1a' : '#e0dfdc');
    el.setAttribute('stroke', '#f7f7f7');
    el.setAttribute('stroke-width', '0.5');

    if (isVisited) {
      el.style.transition = 'opacity 0.3s ease';
      el.addEventListener('mouseenter', () => { el.setAttribute('fill', '#444'); });
      el.addEventListener('mouseleave', () => { el.setAttribute('fill', '#1a1a1a'); });
    }

    svg.appendChild(el);
  });

  container.appendChild(svg);
})();
