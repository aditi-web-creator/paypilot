const fs = require('fs');
const path = require('path');

const categories = [
  {
    name: 'Headphones',
    brands: ['Sony', 'Bose', 'Sennheiser', 'Apple', 'Anker Soundcore', 'Audio-Technica', 'JBL', 'Beyerdynamic', 'Skullcandy', 'Marshall'],
    types: ['Over-Ear Wireless ANC', 'In-Ear Wireless Earbuds', 'Studio Monitor Headphones', 'Open-Ear Sport Headphones', 'Budget Wireless Earbuds'],
    basePriceMin: 35,
    basePriceMax: 399,
    imageKeywords: 'headphones,earphones,earbuds',
    specsGen: (brand, name, price) => ({
      battery_life: price > 150 ? '30-40 hours' : price > 80 ? '24 hours' : '15 hours',
      connectivity: price > 100 ? 'Bluetooth 5.3, Multipoint, 3.5mm AUX' : 'Bluetooth 5.2',
      noise_cancellation: price > 90 ? 'Active Noise Cancellation (Hybrid ANC) with Ambient Mode' : 'Passive Noise Isolation with ENC',
      drivers: price > 200 ? '40mm Titanium drivers' : '32mm Neodymium dynamic drivers',
      charging: 'USB-C Fast Charging (10 mins = 3 hours playback)',
      weight: '235g',
      water_resistance: 'IPX4 Splash Proof',
      warranty: '1 Year Manufacturer Warranty'
    })
  },
  {
    name: 'Laptops',
    brands: ['Apple', 'Dell', 'Lenovo', 'ASUS', 'HP', 'Acer', 'Framework', 'MSI', 'Razer', 'Samsung'],
    types: ['Productivity Ultrabook', 'Creator & Developer Laptop', 'Gaming Laptop', 'Thin & Light Business Laptop', 'Affordable Student Laptop'],
    basePriceMin: 499,
    basePriceMax: 2199,
    imageKeywords: 'laptop,computer,ultrabook',
    specsGen: (brand, name, price) => ({
      processor: price > 1200 ? 'Apple M3 Pro / Intel Core i7-14700H / AMD Ryzen 9' : price > 750 ? 'Intel Core i5-13500H / AMD Ryzen 7' : 'Intel Core i3 / AMD Ryzen 5',
      ram: price > 1200 ? '32GB LPDDR5X' : price > 700 ? '16GB DDR5' : '8GB DDR4',
      storage: price > 1000 ? '1TB NVMe PCIe 4.0 SSD' : '512GB PCIe SSD',
      display: price > 1200 ? '15.6" 3.2K OLED 120Hz 500 nits' : '14" FHD IPS Anti-Glare 300 nits',
      battery_life: price > 1000 ? '14-18 hours' : '8-10 hours',
      ports: '2x Thunderbolt 4 / USB-C, 1x USB-A 3.2, 1x HDMI 2.1, Audio Jack',
      weight: price > 1200 ? '1.45 kg' : '1.7 kg',
      os: brand === 'Apple' ? 'macOS Sonoma' : 'Windows 11 Home / Ubuntu Compatible'
    })
  },
  {
    name: 'Smartphones',
    brands: ['Apple', 'Samsung', 'Google', 'OnePlus', 'Motorola', 'Xiaomi', 'Sony Xperia', 'Nothing', 'Asus ROG', 'Realme'],
    types: ['Flagship 5G Smartphone', 'Pro Photography Smartphone', 'Compact Performance Phone', 'Balanced Mid-Ranger', 'Budget Battery Champ'],
    basePriceMin: 199,
    basePriceMax: 1299,
    imageKeywords: 'smartphone,mobile,phone',
    specsGen: (brand, name, price) => ({
      display: price > 800 ? '6.7" Dynamic AMOLED 2X 120Hz LTPO 2600 nits' : '6.5" OLED 90Hz FHD+',
      camera: price > 800 ? 'Triple 50MP OIS Main + 48MP Ultrawide + 12MP 5x Telephoto' : '50MP Main OIS + 8MP Ultrawide',
      processor: price > 800 ? 'Snapdragon 8 Gen 3 / Apple A17 Pro' : 'Snapdragon 7s Gen 2 / Dimensity 7200',
      battery: price > 500 ? '5,000 mAh with 67W SuperVOOC / MagSafe' : '5,000 mAh with 33W Fast Charge',
      ram_storage: price > 800 ? '12GB RAM + 256GB/512GB UFS 4.0' : '8GB RAM + 128GB Storage',
      os: brand === 'Apple' ? 'iOS 17' : 'Android 14 (3-5 Years Updates)',
      protection: price > 600 ? 'IP68 Dust & Water Resistant, Gorilla Glass Victus 2' : 'IP54 Splash Resistant'
    })
  },
  {
    name: 'Keyboards',
    brands: ['Keychron', 'Logitech', 'Razer', 'Corsair', 'NuPhy', 'Epomaker', 'SteelSeries', 'Akko', 'Ducky', 'RK Royal Kludge'],
    types: ['Custom Wireless Mechanical Keyboard', 'Low-Profile Ergonomic Keyboard', 'Hot-Swappable 75% Compact Keyboard', 'Tenkeyless RGB Gaming Keyboard', 'Quiet Office Wireless Keyboard'],
    basePriceMin: 45,
    basePriceMax: 220,
    imageKeywords: 'keyboard,mechanical keyboard',
    specsGen: (brand, name, price) => ({
      switch_type: price > 100 ? 'Gateron G Pro Brown / Red (Hot-swappable 3/5-pin)' : 'Membrane / Outemu Blue Clicky',
      layout: price > 90 ? '75% Compact 84-Key / TKL' : 'Full-size 104-Key',
      connectivity: 'Tri-Mode: Bluetooth 5.1 + 2.4GHz Wireless + USB-C Wired',
      backlight: price > 70 ? 'South-facing RGB with 22 lighting modes' : 'White LED Backlit',
      battery: '4000 mAh Rechargeable (Up to 200 hours without backlight)',
      keycaps: 'Double-shot PBT Cherry/OSA profile',
      compatibility: 'macOS, Windows, Linux, iOS, Android'
    })
  },
  {
    name: 'Smartwatches',
    brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Amazfit', 'Withings', 'Fossil', 'Huawei', 'OnePlus', 'Polar'],
    types: ['Advanced Health GPS Watch', 'Rugged Adventure Smartwatch', 'Minimalist Fitness Tracker', 'Classic Hybrid Smartwatch', 'Daily Lifestyle Watch'],
    basePriceMin: 49,
    basePriceMax: 799,
    imageKeywords: 'smartwatch,fitness tracker,watch',
    specsGen: (brand, name, price) => ({
      display: price > 300 ? '1.4" Always-On Sapphire Crystal AMOLED 1000 nits' : '1.3" Color TFT Display',
      sensors: 'ECG, SpO2 Blood Oxygen, Heart Rate, Skin Temperature, Barometer, Compass',
      gps: price > 200 ? 'Dual-Frequency Multi-Band GNSS' : 'Connected GPS / Single-band GPS',
      battery_life: price > 400 ? '14-21 days (Solar GPS)' : price > 200 ? '36 hours standard' : '7 days',
      water_resistance: '50m Water Resistant (5 ATM / Swimproof)',
      connectivity: price > 300 ? 'Bluetooth 5.3, Wi-Fi, NFC Mobile Payments' : 'Bluetooth 5.0 LE'
    })
  },
  {
    name: 'Monitors',
    brands: ['Dell', 'LG', 'ASUS', 'Samsung', 'BenQ', 'Gigabyte', 'AOC', 'Philips', 'ViewSonic', 'MSI'],
    types: ['4K UHD Color-Accurate Creator Monitor', '34" Curved Ultrawide Productivity Monitor', '27" 180Hz Fast IPS Gaming Monitor', '24" Ergonomic Office Monitor', 'USB-C Hub Daisy-Chain Monitor'],
    basePriceMin: 129,
    basePriceMax: 1199,
    imageKeywords: 'monitor,computer screen,display',
    specsGen: (brand, name, price) => ({
      resolution: price > 500 ? '3840 x 2160 (4K UHD) 16:9' : price > 300 ? '3440 x 1440 (UWQHD) 21:9' : '1920 x 1080 (FHD)',
      refresh_rate: price > 400 && price < 800 ? '165Hz - 240Hz Fast IPS 1ms' : '60Hz - 100Hz IPS',
      color_gamut: price > 400 ? '99% DCI-P3, 100% sRGB, Factory Calibrated Delta E < 2' : '99% sRGB',
      ports: price > 350 ? '1x USB-C 90W Power Delivery, 2x HDMI 2.1, 1x DP 1.4, 4x USB 3.2 Hub' : '1x HDMI, 1x DisplayPort',
      stand: 'Fully Ergonomic: Height, Tilt, Swivel, Pivot adjust',
      eye_care: 'TÜV Certified Flicker-Free & Low Blue Light Hardware'
    })
  },
  {
    name: 'Speakers',
    brands: ['JBL', 'Bose', 'Sonos', 'Sony', 'Marshall', 'Harman Kardon', 'Anker Soundcore', 'Ultimate Ears', 'Audioengine', 'Edifier'],
    types: ['Portable Waterproof Bluetooth Speaker', 'Multi-Room Wi-Fi Smart Home Speaker', 'Bookshelf Hi-Fi Active Speakers', 'Compact TV Soundbar', 'Party Outdoor Speaker with Bass Boost'],
    basePriceMin: 39,
    basePriceMax: 599,
    imageKeywords: 'speaker,soundbar,audio',
    specsGen: (brand, name, price) => ({
      output_power: price > 250 ? '80W - 120W RMS High Fidelity' : price > 90 ? '40W RMS Stereo' : '16W Dual Drivers',
      battery_life: price > 100 ? '18-24 hours rechargeable' : '10-12 hours',
      waterproof_rating: 'IP67 Waterproof & Dustproof (floats in water)',
      connectivity: price > 200 ? 'Wi-Fi 6 (AirPlay 2, Spotify Connect) + Bluetooth 5.3' : 'Bluetooth 5.3 + Aux 3.5mm',
      features: 'PartyBoost Stereo Pairing, Built-in Mic for Speakerphone, Custom EQ App',
      weight: price > 200 ? '2.1 kg' : '550g portable'
    })
  },
  {
    name: 'Tablets',
    brands: ['Apple', 'Samsung', 'Lenovo', 'Microsoft Surface', 'Xiaomi', 'OnePlus', 'Amazon Fire', 'Google', 'Huawei', 'Wacom'],
    types: ['Pro Pen & Productivity Tablet', 'Slim Media Entertainment Tablet', '2-in-1 Detachable Laptop-Tablet', 'Drawing Pen Display Tablet', 'Compact Reading Tablet'],
    basePriceMin: 149,
    basePriceMax: 1099,
    imageKeywords: 'tablet,ipad,screen tablet',
    specsGen: (brand, name, price) => ({
      screen_size: price > 700 ? '12.9" Liquid Retina XDR / OLED 120Hz ProMotion' : '11.0" 2K IPS 90Hz',
      stylus_support: 'Active Stylus / Apple Pencil / S-Pen (Magnetic Charging)',
      processor: price > 700 ? 'Apple M2 / Snapdragon 8 Gen 2' : 'Helio G99 / Snapdragon 680',
      storage_ram: price > 600 ? '8GB RAM + 256GB Storage' : '4GB RAM + 128GB Storage',
      speakers: 'Quad Stereo Speakers tuned with Dolby Atmos',
      battery: '8,000 - 10,000 mAh (Up to 12 hours web browsing & video)'
    })
  },
  {
    name: 'Cameras',
    brands: ['Sony', 'Canon', 'Fujifilm', 'Nikon', 'GoPro', 'DJI', 'Panasonic Lumix', 'Instax', 'Insta360', 'Blackmagic'],
    types: ['Mirrorless 4K Creator Camera', 'Action 5.3K Waterproof Camera', 'Pocket 3-Axis Gimbal Vlog Camera', 'Vintage Film Simulation Camera', 'Full-Frame Photography Camera'],
    basePriceMin: 79,
    basePriceMax: 1899,
    imageKeywords: 'camera,dslr,mirrorless camera',
    specsGen: (brand, name, price) => ({
      sensor: price > 1000 ? '33MP Full-Frame Exmor R BSI CMOS' : price > 400 ? '24.2MP APS-C / 1" CMOS' : '1/1.9" Action Sensor',
      video: price > 800 ? '4K 60p 10-bit 4:2:2 All-Intra, S-Log3 / C-Log' : '4K 30p HDR',
      autofocus: 'Real-time Eye AF (Human, Animal, Bird, Vehicle) with 759 phase-detect points',
      stabilization: '5-Axis In-Body Image Stabilization (IBIS up to 7 stops)',
      connectivity: 'Wi-Fi 5GHz, Bluetooth, Micro-HDMI, USB-C Webcam mode',
      storage_slots: 'Dual UHS-II SD / CFexpress Type A'
    })
  },
  {
    name: 'Accessories',
    brands: ['Anker', 'Logitech', 'UGREEN', 'Belkin', 'Satechi', 'Baseus', 'Peak Design', 'SanDisk', 'Nomad', 'Spigen'],
    types: ['GaN Fast Wall Charger 100W', 'Ergonomic Wireless Trackball Mouse', '10-in-1 USB-C Hub Docking Station', 'High-Speed MagSafe Power Bank 20000mAh', 'Weatherproof Everyday Tech Backpack'],
    basePriceMin: 18,
    basePriceMax: 180,
    imageKeywords: 'charger,mouse,usb hub,accessories',
    specsGen: (brand, name, price) => ({
      material: price > 80 ? 'Anodized Aircraft-grade Aluminum & Cordura Fabric' : 'Durable Polycarbonate & Braided Nylon',
      compatibility: 'Universal (MacBook, Windows, iPhone, Android, Steam Deck, iPad)',
      safety: 'ActiveShield 2.0 Temperature Monitoring & Overvoltage Protection',
      certifications: 'CE, FCC, RoHS, Qi2 / MagSafe Certified, USB-IF',
      warranty: '2 Years Hassle-Free Replacement Warranty'
    })
  }
];

// Curated high quality Unsplash tech photography images (clean, licensed free for commercial use)
const categoryImages = {
  Headphones: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80'
  ],
  Smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02542?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
  ],
  Keyboards: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80'
  ],
  Smartwatches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
  ],
  Monitors: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=800&q=80'
  ],
  Speakers: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80'
  ],
  Tablets: [
    'https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80'
  ],
  Cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
  ],
  Accessories: [
    'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1627993078453-670d5006b002?auto=format&fit=crop&w=800&q=80'
  ]
};

const products = [];
let idCounter = 1;

// Generate 16 products per category -> 10 categories * 16 = 160 products!
categories.forEach(cat => {
  for (let i = 0; i < 16; i++) {
    const brand = cat.brands[i % cat.brands.length];
    const type = cat.types[i % cat.types.length];
    
    // Series / Model naming
    const models = [
      'Pro Max 2026', 'Ultra Horizon', 'Aero Edition', 'Studio Classic', 'Apex Elite',
      'Quantum 7', 'Zenith Master', 'Prime Touch', 'Evolution S', 'Phantom Edition',
      'Voyager Go', 'Spectrum 5', 'Omni Wave', 'Velocity V', 'Pulse Pro', 'Core Lite'
    ];
    const model = models[i];
    const name = `${brand} ${model} ${cat.name.slice(0, -1)}`;
    
    // Price curve across items
    const step = (cat.basePriceMax - cat.basePriceMin) / 15;
    let price = Math.round((cat.basePriceMin + (step * i)) * 100) / 100;
    // Add realistic 9.99 pricing
    price = Math.floor(price) + 0.99;
    
    const rating = Math.round((4.0 + (i % 9) * 0.1) * 10) / 10;
    const stock_status = (i === 15) ? 'low_stock' : 'in_stock';
    
    const imgList = categoryImages[cat.name] || categoryImages['Accessories'];
    const image_url = imgList[i % imgList.length];
    
    const descPrefixes = [
      'Engineered for premium performance and seamless daily productivity.',
      'Designed with meticulous precision, delivering outstanding reliability and sleek aesthetics.',
      'Features cutting-edge hardware architecture with intelligent battery management.',
      'The ideal balance between power, portability, and exceptional user comfort.',
      'Delivers studio-grade fidelity, robust construction, and industry-leading ergonomics.'
    ];
    const description = `${descPrefixes[i % descPrefixes.length]} The ${name} is crafted by ${brand} to satisfy discerning users who demand high specifications without compromising on build quality or intuitive operation.`;
    
    const specs = cat.specsGen(brand, name, price);
    
    products.push({
      id: `prod_${String(idCounter++).padStart(4, '0')}`,
      name,
      brand,
      category: cat.name,
      description,
      price,
      currency: 'USD',
      specifications: specs,
      image_url,
      rating: Math.min(5.0, rating),
      stock_status,
      created_at: new Date('2026-01-15T08:00:00Z').toISOString()
    });
  }
});

console.log(`Generated ${products.length} products across ${categories.length} categories.`);

// Save JSON
const outputPath = path.join(__dirname, 'products_catalog.json');
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Saved products catalog to ${outputPath}`);

// Generate SQL Seed file
let sqlContent = `-- ============================================================================\n`;
sqlContent += `-- PayPilot Demo Database Seed Data (160 Products across 10 Categories)\n`;
sqlContent += `-- ============================================================================\n\n`;

// Demo user profile
sqlContent += `-- Default demo user profile\n`;
sqlContent += `INSERT INTO profiles (id, email, full_name, preferred_currency, created_at)\n`;
sqlContent += `VALUES ('00000000-0000-0000-0000-000000000001', 'demo.shopper@paypilot.ai', 'Alex Mercer', 'USD', CURRENT_TIMESTAMP)\n`;
sqlContent += `ON CONFLICT (email) DO NOTHING;\n\n`;

sqlContent += `-- Default demo user budget ($500.00)\n`;
sqlContent += `INSERT INTO user_budgets (id, user_id, budget_limit, currency, updated_at)\n`;
sqlContent += `VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 500.00, 'USD', CURRENT_TIMESTAMP)\n`;
sqlContent += `ON CONFLICT (user_id) DO NOTHING;\n\n`;

sqlContent += `-- Products insert\n`;
sqlContent += `INSERT INTO products (id, name, brand, category, description, price, currency, specifications, image_url, rating, stock_status, created_at) VALUES\n`;

const rows = products.map((p, idx) => {
  const safeName = p.name.replace(/'/g, "''");
  const safeBrand = p.brand.replace(/'/g, "''");
  const safeDesc = p.description.replace(/'/g, "''");
  const specsJson = JSON.stringify(p.specifications).replace(/'/g, "''");
  return `  ('${p.id}', '${safeName}', '${safeBrand}', '${p.category}', '${safeDesc}', ${p.price}, '${p.currency}', '${specsJson}'::jsonb, '${p.image_url}', ${p.rating}, '${p.stock_status}', '${p.created_at}')`;
});

sqlContent += rows.join(',\n') + '\n';
sqlContent += `ON CONFLICT (id) DO UPDATE SET\n`;
sqlContent += `  name = EXCLUDED.name,\n`;
sqlContent += `  price = EXCLUDED.price,\n`;
sqlContent += `  specifications = EXCLUDED.specifications,\n`;
sqlContent += `  image_url = EXCLUDED.image_url,\n`;
sqlContent += `  stock_status = EXCLUDED.stock_status;\n`;

const sqlPath = path.join(__dirname, 'seed.sql');
fs.writeFileSync(sqlPath, sqlContent, 'utf-8');
console.log(`Saved SQL seed to ${sqlPath}`);
