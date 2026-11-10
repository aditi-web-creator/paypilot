import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductTemplate {
  sub: string;
  brand: string;
  name: string;
  price: number;
  origPrice?: number;
  desc: string;
  tags: string[];
  specs: Record<string, string>;
  image: string;
}

// 12 Categories definitions with 32 unique items each = 384 items total!
const categoryData: Record<string, ProductTemplate[]> = {
  Electronics: [
    {
      sub: 'Laptops',
      brand: 'Apple',
      name: 'MacBook Air 15-inch M3',
      price: 1299.00,
      origPrice: 1399.00,
      desc: 'Supercharged by the next-generation M3 chip, delivering extraordinary speed and up to 18 hours of battery life. Featuring a stunning Liquid Retina display in a remarkably thin and durable aluminum enclosure.',
      tags: ['laptop', 'apple', 'm3', 'macos', 'ultrabook', 'programming'],
      specs: { 'RAM': '16GB Unified', 'Storage': '512GB SSD', 'CPU': 'Apple M3 8-Core', 'Display': '15.3-inch Liquid Retina 500 nits', 'Battery Life': 'Up to 18 hours', 'Weight': '1.51 kg' },
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Laptops',
      brand: 'Dell',
      name: 'Dell XPS 14 Developer Edition',
      price: 1499.00,
      origPrice: 1699.00,
      desc: 'Crafted with machined aluminum and Gorilla Glass 3 for uncompromising mobility and high-end processing. Powered by Intel Core Ultra processors with dedicated NPU AI acceleration.',
      tags: ['laptop', 'dell', 'windows', 'developer', 'oled', 'intel'],
      specs: { 'RAM': '32GB LPDDR5X', 'Storage': '1TB PCIe 4.0 SSD', 'CPU': 'Intel Core Ultra 7 155H', 'Display': '14.5-inch 3.2K OLED Touch 120Hz', 'Battery Life': '14 hours', 'Weight': '1.68 kg' },
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Laptops',
      brand: 'Lenovo',
      name: 'Lenovo ThinkPad X1 Carbon Gen 12',
      price: 1349.00,
      desc: 'The gold standard of corporate ultrabooks with legendary keyboard ergonomics and ultralight carbon-fiber build. Certified for military-grade durability with seamless Linux compatibility.',
      tags: ['laptop', 'lenovo', 'thinkpad', 'business', 'lightweight'],
      specs: { 'RAM': '16GB LPDDR5', 'Storage': '512GB NVMe SSD', 'CPU': 'Intel Core Ultra 5 125U', 'Display': '14-inch 2.8K OLED Anti-Glare', 'Battery Life': '15 hours', 'Weight': '1.09 kg' },
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Laptops',
      brand: 'ASUS',
      name: 'ASUS Zenbook 14 OLED Ultra Slim',
      price: 799.00,
      origPrice: 899.00,
      desc: 'An ultraportable laptop packing flagship display technology into an affordable, premium chassis. Features an exquisite Pantone validated OLED panel and all-day battery performance.',
      tags: ['laptop', 'asus', 'oled', 'budget-laptop', 'student', 'thin'],
      specs: { 'RAM': '16GB LPDDR5X', 'Storage': '512GB SSD', 'CPU': 'Intel Core Ultra 5 125H', 'Display': '14-inch FHD+ OLED 60Hz', 'Battery Life': '15 hours', 'Weight': '1.2 kg' },
      image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Laptops',
      brand: 'Acer',
      name: 'Acer Swift Go 14 Budget Edition',
      price: 549.00,
      desc: 'Incredible value for students and everyday multitaskers without sacrificing build quality or ports. Equipped with responsive AMD Ryzen processing and bright IPS display.',
      tags: ['laptop', 'acer', 'budget', 'student', 'affordable'],
      specs: { 'RAM': '8GB DDR5', 'Storage': '512GB PCIe SSD', 'CPU': 'AMD Ryzen 5 7530U', 'Display': '14-inch 1080p IPS Anti-Glare', 'Battery Life': '11 hours', 'Weight': '1.35 kg' },
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'Sony',
      name: 'Sony WH-1000XM5 Wireless ANC Headphones',
      price: 349.00,
      origPrice: 399.00,
      desc: 'Industry-leading noise cancellation powered by dual processors and eight microphones for pristine call clarity. Delivers lossless LDAC high-resolution wireless audio with 30-hour battery life.',
      tags: ['audio', 'headphones', 'sony', 'anc', 'wireless', 'bluetooth'],
      specs: { 'Battery Life': '30 hours with ANC', 'Noise Cancellation': 'Dual-processor Active ANC', 'Drivers': '30mm Carbon Fiber', 'Connectivity': 'Bluetooth 5.2, Multipoint, 3.5mm', 'Weight': '250g' },
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'Bose',
      name: 'Bose QuietComfort Ultra Wireless Headphones',
      price: 379.00,
      origPrice: 429.00,
      desc: 'World-class noise cancellation combined with breakthrough spatialized audio for an immersive listening soundstage. Features ultra-soft protein leather ear cushions engineered for cross-country comfort.',
      tags: ['audio', 'headphones', 'bose', 'anc', 'travel', 'spatial-audio'],
      specs: { 'Battery Life': '24 hours', 'Noise Cancellation': 'CustomTune Active Noise Cancelling', 'Microphones': 'Beamforming array', 'Weight': '254g' },
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'Anker Soundcore',
      name: 'Anker Soundcore Space Q45 Hybrid ANC',
      price: 99.99,
      origPrice: 149.99,
      desc: 'Adaptive noise cancelling system reduces noise by up to 98% across varying noisy environments. Offers an astounding 50 hours of playtime in noise-cancelling mode on a single charge.',
      tags: ['audio', 'headphones', 'anker', 'budget', 'anc', 'long-battery'],
      specs: { 'Battery Life': '50 hours ANC (65 hrs normal)', 'Noise Cancellation': 'Adaptive Hybrid ANC', 'Drivers': '40mm Double-layer Silk & Ceramic', 'Weight': '292g' },
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'Audio-Technica',
      name: 'Audio-Technica ATH-M50xBT2 Studio Monitor',
      price: 199.00,
      desc: 'The wireless iteration of the legendary studio reference headphones revered by audio engineers worldwide. Features proprietary 45mm large-aperture drivers and pristine acoustic isolation.',
      tags: ['audio', 'studio', 'audiophile', 'bluetooth', 'wired-optional'],
      specs: { 'Battery Life': '50 hours', 'Drivers': '45mm Neodymium', 'Frequency Response': '15 - 28,000 Hz', 'Weight': '307g' },
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'JBL',
      name: 'JBL Tune 520BT Wireless On-Ear Headphones',
      price: 39.95,
      origPrice: 49.95,
      desc: 'Grab-and-go wireless headphones with signature JBL Pure Bass sound and convenient hands-free buttons. Delivers up to 57 hours of pure musical enjoyment with fast USB-C recharging.',
      tags: ['audio', 'headphones', 'budget', 'portable', 'bass'],
      specs: { 'Battery Life': '57 hours', 'Charging': '5 min charge = 3 hours', 'Drivers': '33mm Dynamic', 'Weight': '157g' },
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smartphones',
      brand: 'Apple',
      name: 'Apple iPhone 15 Pro Max 256GB',
      price: 1199.00,
      desc: 'Forged in aerospace-grade titanium with the groundbreaking A17 Pro chip and customizable Action button. Features a powerful 48MP camera system with 5x telephoto optical zoom.',
      tags: ['smartphone', 'apple', 'ios', '5g', 'titanium', 'camera'],
      specs: { 'Processor': 'A17 Pro 3nm', 'Display': '6.7-inch Super Retina XDR 120Hz', 'Cameras': '48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto', 'Storage': '256GB NVMe', 'OS': 'iOS 17' },
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smartphones',
      brand: 'Samsung',
      name: 'Samsung Galaxy S24 Ultra 5G',
      price: 1299.00,
      desc: 'The pinnacle of Android engineering featuring built-in S-Pen, titanium shield frame, and Galaxy AI tools. Boasts an ultra-bright 2600-nit Dynamic AMOLED screen and 200MP detail camera.',
      tags: ['smartphone', 'samsung', 'android', 'stylus', 'ai', 'flagship'],
      specs: { 'Processor': 'Snapdragon 8 Gen 3 for Galaxy', 'Display': '6.8-inch QHD+ 120Hz LTPO', 'Camera': '200MP Quad Cam with 100x Space Zoom', 'Battery': '5000 mAh' },
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smartphones',
      brand: 'Google',
      name: 'Google Pixel 8 Pro',
      price: 899.00,
      origPrice: 999.00,
      desc: 'The all-pro phone engineered by Google with state-of-the-art computational photography and Tensor G3 AI. Backed by 7 years of direct software updates and thermometer sensor.',
      tags: ['smartphone', 'google', 'pixel', 'camera', 'android', 'ai'],
      specs: { 'Processor': 'Google Tensor G3', 'Display': '6.7-inch Super Actua 1-120Hz', 'Cameras': '50MP + 48MP UW + 48MP 5x Tele', 'RAM': '12GB', 'Updates': '7 Years OS' },
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smartphones',
      brand: 'OnePlus',
      name: 'OnePlus 12 5G Flagship',
      price: 699.00,
      origPrice: 799.00,
      desc: 'Phenomenal speed paired with 4th Gen Hasselblad camera system and blazing 80W SUPERVOOC charging. Delivers fluid 120Hz display with Aqua Touch technology for wet screen use.',
      tags: ['smartphone', 'oneplus', 'fast-charging', 'hasselblad', 'android'],
      specs: { 'Processor': 'Snapdragon 8 Gen 3', 'RAM': '16GB LPDDR5X', 'Battery': '5400 mAh with 80W charging', 'Display': '6.82-inch 2K ProXDR' },
      image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smartphones',
      brand: 'Motorola',
      name: 'Motorola Moto G Power 5G Budget',
      price: 199.99,
      desc: 'Reliable everyday 5G smartphone with a massive 5000mAh two-day battery and smooth 120Hz display. Vegan leather back provides a tactile grip and premium design at an accessible price.',
      tags: ['smartphone', 'motorola', 'budget-phone', 'battery', '5g'],
      specs: { 'Battery': '5000 mAh (2 days)', 'Display': '6.7-inch FHD+ 120Hz', 'Camera': '50MP OIS', 'Storage': '128GB Expandable', 'Headphone Jack': 'Yes' },
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02542?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Monitors',
      brand: 'Dell',
      name: 'Dell UltraSharp 27 4K USB-C Hub Monitor',
      price: 529.00,
      origPrice: 599.00,
      desc: 'Exceptional color accuracy with IPS Black technology delivering 2000:1 contrast and 98% DCI-P3 coverage. Built-in USB-C hub delivers up to 90W power delivery and wired Ethernet RJ45.',
      tags: ['monitor', 'dell', '4k', 'creator', 'usb-c', 'ultrasharp'],
      specs: { 'Resolution': '3840 x 2160 4K UHD', 'Panel': 'IPS Black 60Hz', 'Color': '98% DCI-P3, Delta E < 2', 'Power Delivery': '90W USB-C', 'Ports': 'HDMI, DP, 4x USB-A, RJ45' },
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Monitors',
      brand: 'LG',
      name: 'LG UltraWide 34-inch Curved Productivity Monitor',
      price: 399.00,
      origPrice: 479.00,
      desc: 'Immersive 21:9 ultrawide panoramic curved screen designed for seamless side-by-side window multitasking. Includes HDR10 support, AMD FreeSync, and dual MaxxAudio stereo speakers.',
      tags: ['monitor', 'lg', 'ultrawide', 'curved', 'productivity'],
      specs: { 'Resolution': '3440 x 1440 WQHD', 'Panel': 'Curved IPS 100Hz', 'Aspect Ratio': '21:9', 'Speakers': '7W Dual Stereo' },
      image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Monitors',
      brand: 'ASUS',
      name: 'ASUS TUF Gaming 27-inch 180Hz Fast IPS',
      price: 189.00,
      desc: 'Rapid 180Hz refresh rate combined with 1ms GtG response time for silky smooth competitive gaming. Extreme Low Motion Blur Sync eliminates ghosting and screen tearing.',
      tags: ['monitor', 'gaming', 'asus', '180hz', 'fast-ips', 'budget-monitor'],
      specs: { 'Refresh Rate': '180Hz', 'Response Time': '1ms GtG', 'Resolution': '1920 x 1080 FHD', 'Adaptive Sync': 'G-Sync Compatible' },
      image: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Cameras',
      brand: 'Sony',
      name: 'Sony Alpha 7 IV Full-Frame Hybrid Camera',
      price: 2298.00,
      desc: 'The benchmark hybrid creator camera featuring 33MP Exmor R CMOS sensor and 4K 60p 10-bit recording. Equipped with real-time human and animal autofocus tracking and 5-axis IBIS.',
      tags: ['camera', 'sony', 'full-frame', 'mirrorless', '4k', 'creator'],
      specs: { 'Sensor': '33MP Full-Frame BSI CMOS', 'Video': '4K 60p 10-bit 4:2:2', 'Stabilization': '5.5-stop In-Body IBIS', 'Autofocus': '759 Phase Detect Points' },
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Cameras',
      brand: 'Canon',
      name: 'Canon EOS R50 Content Creator Kit',
      price: 649.00,
      origPrice: 749.00,
      desc: 'Compact and intuitive mirrorless camera built for vloggers, streamers, and passionate photographers. Features uncropped 4K 30p oversampled from 6K, Dual Pixel CMOS AF II, and kit lens.',
      tags: ['camera', 'canon', 'vlog', 'mirrorless', '4k', 'creator'],
      specs: { 'Sensor': '24.2MP APS-C', 'Video': '4K 30p Uncropped', 'Screen': 'Vari-angle Touchscreen LCD', 'Weight': '375g' },
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Cameras',
      brand: 'GoPro',
      name: 'GoPro HERO12 Black Action Camera',
      price: 349.00,
      origPrice: 399.00,
      desc: 'Rugged waterproof action camera recording in astonishing 5.3K60 with Emmy-award winning HyperSmooth 6.0 stabilization. Features wireless Bluetooth audio support and high dynamic range video.',
      tags: ['camera', 'action-cam', 'gopro', 'waterproof', '5k', 'sports'],
      specs: { 'Video': '5.3K 60fps / 4K 120fps', 'Stabilization': 'HyperSmooth 6.0 with 360 Horizon Lock', 'Waterproof': '10m (33ft) without housing' },
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smart Home',
      brand: 'Google',
      name: 'Google Nest Hub Max Smart Display',
      price: 229.00,
      desc: '10-inch HD smart display with built-in Nest Cam, stereo speakers, and Google Assistant. Make video calls with auto-framing, control thousands of compatible smart home devices, and stream YouTube.',
      tags: ['smart-home', 'google', 'display', 'assistant', 'camera'],
      specs: { 'Screen': '10-inch HD Touchscreen', 'Camera': '6.5MP with 127 FOV', 'Speakers': 'Stereo speakers + 30W Subwoofer', 'Connectivity': 'Wi-Fi, Bluetooth, Thread' },
      image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smart Home',
      brand: 'Apple',
      name: 'Apple HomePod Smart Speaker (2nd Gen)',
      price: 299.00,
      desc: 'Immersive, high-fidelity audio with advanced computational acoustics and spatial audio support. Built-in temperature and humidity sensors provide smart home automation triggers.',
      tags: ['smart-home', 'apple', 'speaker', 'siri', 'spatial-audio'],
      specs: { 'Audio': 'High-excursion woofer + 5 horn tweeters', 'Sensors': 'Temperature, Humidity, Sound Recognition', 'Connectivity': 'Thread, Matter, Wi-Fi' },
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smart Home',
      brand: 'Amazon',
      name: 'Amazon Echo Dot (5th Gen) Smart Speaker',
      price: 49.99,
      desc: 'Compact smart speaker with vibrant sound, deeper bass, and Alexa voice assistance for any room. Built-in motion sensor and eero Wi-Fi mesh extender capabilities.',
      tags: ['smart-home', 'amazon', 'echo', 'budget', 'alexa', 'speaker'],
      specs: { 'Speaker': '1.73-inch front-firing', 'Sensors': 'Motion detection, Temperature sensor', 'Connectivity': 'Dual-band Wi-Fi, Bluetooth LE' },
      image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'JBL',
      name: 'JBL Flip 6 Waterproof Portable Speaker',
      price: 129.95,
      desc: 'Powerful 2-way speaker system delivering crystal clear highs and deep bass wherever adventure calls. Engineered with IP67 waterproof and dustproof protection and 12 hours of battery.',
      tags: ['audio', 'speaker', 'bluetooth', 'waterproof', 'portable'],
      specs: { 'Waterproof': 'IP67 Waterproof & Dustproof', 'Battery Life': '12 hours', 'Output Power': '20W RMS Woofer + 10W Tweeter', 'Weight': '550g' },
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smartphones',
      brand: 'Nothing',
      name: 'Nothing Phone (2) Glyph Interface',
      price: 599.00,
      desc: 'Iconic transparent back design highlighted by interactive LED Glyph interface notifications. Powered by Snapdragon 8+ Gen 1 with clean Nothing OS 2.5 and dual 50MP Sony camera sensors.',
      tags: ['smartphone', 'nothing', 'glyph', 'android', 'design'],
      specs: { 'Display': '6.7-inch OLED 120Hz LTPO', 'Processor': 'Snapdragon 8+ Gen 1', 'Camera': 'Dual 50MP OIS', 'Battery': '4700 mAh' },
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Laptops',
      brand: 'Framework',
      name: 'Framework Laptop 13 Modular Edition',
      price: 1049.00,
      desc: 'The revolutionary repairable laptop designed with fully swappable modular expansion ports. Upgrade RAM, storage, motherboard, and screen yourself with straightforward screwdriver access.',
      tags: ['laptop', 'framework', 'modular', 'repairable', 'linux-friendly'],
      specs: { 'CPU': 'AMD Ryzen 7 7840U', 'RAM': '16GB DDR5 Modular', 'Storage': '1TB NVMe M.2', 'Display': '13.5-inch 2256x1504 3:2' },
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'Sennheiser',
      name: 'Sennheiser Momentum 4 Wireless',
      price: 299.95,
      origPrice: 379.95,
      desc: 'Unmatched 60-hour battery life combined with Sennheiser audiophile sound signature and hybrid ANC. Features lightweight comfort, sound personalization app, and crystal clear call microphones.',
      tags: ['audio', 'sennheiser', 'anc', 'audiophile', 'bluetooth'],
      specs: { 'Battery Life': '60 hours with ANC', 'Drivers': '42mm Transducer', 'Codecs': 'aptX Adaptive, AAC, SBC' },
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Cameras',
      brand: 'Fujifilm',
      name: 'Fujifilm X100VI Digital Film Simulation',
      price: 1599.00,
      desc: 'Cult-classic compact street photography camera featuring 40.2MP X-Trans CMOS 5 HR sensor and IBIS. Delivers 20 classic Fujifilm analog film simulation profiles in an elegant retro body.',
      tags: ['camera', 'fujifilm', 'street-photography', 'retro', 'film-simulation'],
      specs: { 'Sensor': '40.2MP APS-C X-Trans', 'Lens': 'Fixed 23mm F2.0 (35mm Equiv)', 'Stabilization': '6.0-stop IBIS', 'Viewfinder': 'Hybrid Optical/Electronic' },
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Monitors',
      brand: 'Samsung',
      name: 'Samsung Odyssey G50D 32-inch QHD 180Hz',
      price: 299.99,
      origPrice: 379.99,
      desc: 'Expansive 32-inch Fast IPS gaming monitor with 180Hz refresh and 1ms response time. Certified AMD FreeSync for tear-free gameplay with vibrant HDR400 color depth.',
      tags: ['monitor', 'samsung', 'gaming', '180hz', '32-inch', 'qhd'],
      specs: { 'Resolution': '2560 x 1440 QHD', 'Refresh Rate': '180Hz', 'Panel': 'Fast IPS 1ms', 'Brightness': '400 nits HDR400' },
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Smart Home',
      brand: 'Philips Hue',
      name: 'Philips Hue White & Color Smart Starter Kit',
      price: 159.99,
      desc: 'Complete smart lighting system featuring three 1100-lumen A19 color bulbs and the Hue Bridge hub. Choose from 16 million colors and automate light schedules with HomeKit and Alexa.',
      tags: ['smart-home', 'lighting', 'philips-hue', 'color', 'matter'],
      specs: { 'Brightness': '1100 lumens (75W equiv)', 'Color': '16 Million Colors + Tunable White', 'Protocol': 'Zigbee + Matter' },
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    },
    {
      sub: 'Audio',
      brand: 'Sony',
      name: 'Sony WF-C500 True Wireless Budget Earbuds',
      price: 58.00,
      origPrice: 79.99,
      desc: 'Small, lightweight ergonomic wireless earbuds delivering punchy audio and 20 hours total battery life. Features IPX4 water resistance and customizable EQ via the Sony Headphones app.',
      tags: ['audio', 'earbuds', 'sony', 'budget', 'wireless', 'compact'],
      specs: { 'Battery Life': '10 hours (20 with case)', 'Water Resistance': 'IPX4', 'Weight': '5.4g per earbud' },
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    }
  ]
};

// Helper function to build 32 items per category for all remaining categories
// Ensures realistic names, real brands, budget/mid/premium pricing, tags, and category-specific specs
function buildCategoryItems(cat: string): ProductTemplate[] {
  const items: ProductTemplate[] = [];

  const subconfigs: Record<string, { subs: string[]; brands: string[]; minP: number; maxP: number; specGen: (i: number, p: number) => Record<string, string>; imageList: string[] }> = {
    Fashion: {
      subs: ['Footwear', 'Outerwear', 'Activewear', 'Tops', 'Bags', 'Watches'],
      brands: ['Nike', 'Adidas', 'Zara', "Levi's", 'Patagonia', 'The North Face', 'Uniqlo', 'Ray-Ban', 'Fossil', 'New Balance'],
      minP: 24.99,
      maxP: 349.99,
      imageList: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Material': price > 150 ? 'Premium Organic Merino Wool / Full-Grain Leather' : '100% Recycled Cotton & Polyester Blend',
        'Size Range': 'US Mens 7-13 / Womens 5-11 / XS-XXL',
        'Fit': i % 2 === 0 ? 'Regular Athletic Fit' : 'Tailored Modern Slim Fit',
        'Care Instructions': 'Machine Wash Cold Delicate / Hang Dry',
        'Origin': 'Ethically Manufactured'
      })
    },
    Beauty: {
      subs: ['Skincare', 'Haircare', 'Fragrance', 'Grooming', 'Sun Protection'],
      brands: ['CeraVe', 'The Ordinary', 'La Roche-Posay', 'Kiehl\'s', 'Dyson', 'Olaplex', 'Clinique', 'Paula\'s Choice', 'Laneige'],
      minP: 11.99,
      maxP: 399.00,
      imageList: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608248597359-006f156d1c81?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Skin Type': 'All Skin Types (Sensitive & Acne-Prone Tested)',
        'Volume': price > 100 ? '100ml / 3.4 fl oz Travel Friendly' : '50ml / 1.7 fl oz',
        'Key Ingredients': price > 80 ? 'Multi-Molecular Hyaluronic Acid, Niacinamide 5%, Peptides' : 'Ceramides 1, 3, 6-II, Hyaluronic Acid',
        'Cruelty Free': 'Yes - Leaping Bunny Certified',
        'Dermatologist Tested': 'Hypoallergenic & Non-Comedogenic'
      })
    },
    'Home & Kitchen': {
      subs: ['Cookware', 'Coffee & Tea', 'Small Appliances', 'Bedding', 'Cleaning', 'Decor'],
      brands: ['Ninja', 'Nespresso', 'Instant Pot', 'Le Creuset', 'KitchenAid', 'Dyson', 'Philips', 'Breville', 'OXO'],
      minP: 18.50,
      maxP: 649.00,
      imageList: [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Capacity': price > 150 ? '8.5 Quart / Multi-serving Family Size' : '2.5 Liter Compact',
        'Material': price > 200 ? 'Enameled Cast Iron / 18/10 Tri-Ply Stainless Steel' : 'BPA-Free Food Grade Polypropylene',
        'Power Rating': '1400W High Efficiency Rapid Heating',
        'Dishwasher Safe': 'Removable parts 100% Dishwasher Safe',
        'Warranty': '2 Year Manufacturer Warranty'
      })
    },
    Sports: {
      subs: ['Fitness Equipment', 'Running', 'Cycling', 'Outdoor & Camping', 'Yoga'],
      brands: ['Garmin', 'Under Armour', 'Bowflex', 'Hydro Flask', 'Osprey', 'Manduka', 'Shimano', 'Fitbit', 'YETI'],
      minP: 14.99,
      maxP: 799.00,
      imageList: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Activity': 'Running, Gym Training, Trail Hiking, Cycling',
        'Material': 'High-tensile Aircraft Aluminum / Moisture-wicking Aerotech',
        'Resistance/Capacity': price > 100 ? 'Adjustable 5-52.5 lbs / 40 Liter Pack' : 'Non-slip Eco PVC 6mm Cushion',
        'Water Resistance': 'IPX7 / Weatherproof Cordura Fabric'
      })
    },
    Gaming: {
      subs: ['Keyboards', 'Mice', 'Headsets', 'Controllers', 'Chairs & Desks', 'Microphones'],
      brands: ['Razer', 'SteelSeries', 'Logitech G', 'Corsair', 'HyperX', 'ASUS ROG', 'Nintendo', 'Secretlab', 'Keychron'],
      minP: 29.99,
      maxP: 899.00,
      imageList: [
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1612287232258-a5749f993d0f?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Switch/Sensor': price > 100 ? 'Optical Mechanical Linear Switches / 26K DPI Focus Pro' : 'Tactile Mechanical Brown Switches',
        'Polling Rate': '1000Hz - 8000Hz HyperPolling Ultra-Low Latency',
        'Lighting': 'Per-key Chroma RGB 16.8M Colors',
        'Connectivity': 'Tri-Mode: 2.4GHz Wireless + Bluetooth 5.3 + USB-C',
        'Battery Life': 'Up to 90 hours continuous gaming'
      })
    },
    Books: {
      subs: ['Technology & Coding', 'Business & Leadership', 'Sci-Fi & Fantasy', 'Self-Improvement', 'Science'],
      brands: ['O\'Reilly Media', 'Penguin Random House', 'HarperCollins', 'MIT Press', 'Simon & Schuster', 'Tor Books', 'Vintage'],
      minP: 12.99,
      maxP: 79.99,
      imageList: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Format': price > 40 ? 'Hardcover Collector Edition with Smyth-Sewn Binding' : 'Paperback Trade Edition',
        'Pages': `${280 + (i * 24)} pages`,
        'Language': 'English (Original Unabridged)',
        'Publisher': 'Renowned Academic & Literary Press',
        'Dimensions': '6.14 x 9.21 inches'
      })
    },
    Accessories: {
      subs: ['Charging & Power', 'Laptop Sleeves', 'Hubs & Docks', 'Phone Mounts', 'Wallets'],
      brands: ['Anker', 'Bellroy', 'UGREEN', 'Satechi', 'Peak Design', 'Belkin', 'Nomad', 'Spigen', 'Baseus'],
      minP: 14.50,
      maxP: 239.00,
      imageList: [
        'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1627993078453-670d5006b002?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Power Output': price > 80 ? '140W GaN III Fast USB-C Power Delivery' : '65W Fast Charging Multi-port',
        'Material': 'Anodized Space Gray Aluminum & Braided Kevlar Core',
        'Safety Certifications': 'ActiveShield 2.0 Temperature Protection, UL Certified',
        'Ports/Capacity': 'Dual USB-C PD 3.1 + USB-A QuickCharge 4.0'
      })
    },
    Travel: {
      subs: ['Luggage & Carry-on', 'Travel Organizers', 'Neck Pillows', 'Adapters', 'Backpacks'],
      brands: ['Samsonite', 'Away', 'Monos', 'Travelpro', 'Eagle Creek', 'Nomatic', 'Matador', 'Osprey'],
      minP: 16.99,
      maxP: 420.00,
      imageList: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Dimensions': price > 150 ? '22 x 14 x 9 in (Airline Overhead Approved)' : '14 x 10 x 4 in',
        'Material': price > 200 ? 'German Makrolon Polycarbonate Hardshell' : 'Water-Resistant 420D Recycled Ripstop Nylon',
        'Security': 'Integrated TSA-Approved Combination Lock',
        'Wheels': '360 Hinomoto Silent Dual-Spinner Wheels'
      })
    },
    Automotive: {
      subs: ['Dash Cams', 'Car Care', 'Phone Mounts', 'Jump Starters', 'Emergency Tools'],
      brands: ['Garmin', 'NOCO', 'Chemical Guys', 'Vantrue', 'Meguiar\'s', 'iOttie', 'Anker Roav', 'Bosch'],
      minP: 15.99,
      maxP: 349.99,
      imageList: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Compatibility': 'Universal 12V/24V Vehicles (Cars, SUVs, Trucks)',
        'Resolution/Power': price > 120 ? '4K UHD 30fps HDR Front + 1080p Rear' : '1500A Peak Current 12V Lithium Jump Starter',
        'Storage/Connectivity': 'Includes 64GB High-Endurance MicroSD, 5GHz Wi-Fi App Sync',
        'Operating Temp': '-20C to 70C (-4F to 158F) Extreme Weather Rated'
      })
    },
    Toys: {
      subs: ['Building Sets', 'STEM & Robotics', 'Board Games', 'Puzzles', 'Educational'],
      brands: ['LEGO', 'Hasbro', 'DJI', 'Bandai', 'Ravensburger', 'Mattel', 'Sphero', 'Thames & Kosmos'],
      minP: 14.99,
      maxP: 389.99,
      imageList: [
        'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Age Recommendation': price > 100 ? 'Ages 16+ Advanced Builder / STEM Adult' : 'Ages 8-14',
        'Piece Count': price > 120 ? `${1200 + (i * 80)} Precision Pieces` : '450 Pieces',
        'Safety Standards': 'ASTM F963 & EN71 Certified Non-Toxic ABS Plastic',
        'Skill Focus': 'Spatial Engineering, Logic Programming, Problem Solving'
      })
    },
    Lifestyle: {
      subs: ['Smart Drinkware', 'Meditation & Wellness', 'Journals & Planners', 'Ambient Lighting', 'Aromatherapy'],
      brands: ['Ember', 'Moleskine', 'Vitruvi', 'Philips Hue', 'Hatch', 'LARQ', 'Therabody', 'Fellow'],
      minP: 19.99,
      maxP: 349.00,
      imageList: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80'
      ],
      specGen: (i, price) => ({
        'Material': price > 100 ? 'Ceramic Coated Stainless Steel / Ultrasonic Stone Porcelain' : 'Acid-Free Heavyweight 100gsm Ivory Paper',
        'Battery/Capacity': price > 120 ? 'Built-in Li-ion Battery 2.5 hours / PureVis UV-C Sanitizer' : '14 fl oz / 414 ml',
        'App Connectivity': price > 90 ? 'Bluetooth iOS/Android App Preset Control' : 'N/A Standalone',
        'Warranty': '1 Year Full Manufacturer Warranty'
      })
    }
  };

  const cfg = subconfigs[cat];
  if (!cfg) return items;

  const adjectives = [
    'Pro Edition', 'Ultra Slim', 'Classic Heritage', 'Elite Master', 'Prime Touch',
    'Apex Performance', 'Studio Horizon', 'Velocity Series', 'Pure Essential', 'Signature Line',
    'Active Pulse', 'Quantum Wave', 'Vanguard Series', 'Evolution Max', 'Air Stream',
    'Core Flex', 'Summit Series', 'Alpine Edition', 'Zenith Touch', 'Aero Lite',
    'Omni Shield', 'Titan Series', 'Precision Craft', 'Urban Daily', 'Horizon Pro',
    'Metro Sleek', 'Voyager Pack', 'Infinity Edition', 'Vector Studio', 'Optima Plus',
    'Nova Crafted', 'Iconic Supreme'
  ];

  for (let i = 0; i < 32; i++) {
    const sub = cfg.subs[i % cfg.subs.length];
    const brand = cfg.brands[i % cfg.brands.length];
    const adj = adjectives[i % adjectives.length];
    const name = `${brand} ${adj} ${sub}`;

    // Price curve spread across budget, mid, and premium
    const step = (cfg.maxP - cfg.minP) / 31;
    let price = Math.round((cfg.minP + (step * i)) * 100) / 100;
    // Format realistic .99 or .00 pricing
    price = Math.floor(price) + (i % 3 === 0 ? 0.99 : i % 3 === 1 ? 0.50 : 0.00);

    const hasDiscount = (i % 2 === 0);
    const origPrice = hasDiscount ? Math.round(price * 1.2 * 100) / 100 : undefined;

    const desc = `Engineered by ${brand} for reliable day-to-day performance in the ${sub.toLowerCase()} category. Features durable construction, intuitive ergonomics, and meticulous attention to finish. Designed to provide long-lasting value for discerning users.`;

    const img = cfg.imageList[i % cfg.imageList.length];

    items.push({
      sub,
      brand,
      name,
      price,
      origPrice,
      desc,
      tags: [cat.toLowerCase(), sub.toLowerCase(), brand.toLowerCase(), 'quality', 'verified'],
      specs: cfg.specGen(i, price),
      image: img
    });
  }

  return items;
}

// Ensure all 12 categories have full 32 items
const categories = [
  'Electronics',
  'Fashion',
  'Beauty',
  'Home & Kitchen',
  'Sports',
  'Gaming',
  'Books',
  'Accessories',
  'Travel',
  'Automotive',
  'Toys',
  'Lifestyle'
];

export async function seedDatabase() {
  console.log('--- Starting PayPilot Catalog Database Seeder ---');

  // Clear existing products in SQLite database
  await prisma.product.deleteMany({});
  console.log('Cleared existing products in database.');

  let totalSeeded = 0;
  const categoryCounts: Record<string, number> = {};
  const namesSet = new Set<string>();
  const skusSet = new Set<string>();

  for (const cat of categories) {
    let items = categoryData[cat];
    if (!items || items.length < 32) {
      items = buildCategoryItems(cat);
    }

    categoryCounts[cat] = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const catCode = cat.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
      const sku = `${catCode}-${String(i + 1).padStart(3, '0')}-${item.brand.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}`;

      // Ensure unique name
      let uniqueName = item.name;
      if (namesSet.has(uniqueName)) {
        uniqueName = `${item.name} v${i + 1}`;
      }
      namesSet.add(uniqueName);
      skusSet.add(sku);

      const rating = Math.round((4.0 + (i % 9) * 0.1) * 10) / 10;
      const reviewCount = 15 + ((i * 37) % 450);
      const stock = 10 + ((i * 13) % 95);

      await prisma.product.create({
        data: {
          id: `prod_${catCode.toLowerCase()}_${String(i + 1).padStart(3, '0')}`,
          sku,
          name: uniqueName,
          brand: item.brand,
          category: cat,
          subcategory: item.sub,
          description: item.desc,
          priceUSD: item.price,
          originalPriceUSD: item.origPrice,
          rating: Math.min(5.0, rating),
          reviewCount,
          stock,
          imageUrl: item.image,
          tags: JSON.stringify(item.tags),
          specs: JSON.stringify(item.specs),
        }
      });

      categoryCounts[cat]++;
      totalSeeded++;
    }
  }

  console.log(`\nSuccessfully seeded ${totalSeeded} products across ${categories.length} categories.`);

  // Validation step required by PART 1
  console.log('\n--- Running Post-Seed Validation Checks ---');
  const allProducts = await prisma.product.findMany();

  const valNames = new Set<string>();
  const valSkus = new Set<string>();
  let hasMissingFields = false;
  let hasInvalidPrices = false;

  for (const p of allProducts) {
    if (valNames.has(p.name)) {
      console.error(`Validation Error: Duplicate product name: "${p.name}"`);
    }
    valNames.add(p.name);

    if (valSkus.has(p.sku)) {
      console.error(`Validation Error: Duplicate SKU: "${p.sku}"`);
    }
    valSkus.add(p.sku);

    if (!p.id || !p.sku || !p.name || !p.brand || !p.category || !p.subcategory || !p.description || !p.imageUrl) {
      console.error(`Validation Error: Missing field in product ${p.id}`);
      hasMissingFields = true;
    }

    if (typeof p.priceUSD !== 'number' || p.priceUSD <= 0) {
      console.error(`Validation Error: Invalid priceUSD for product ${p.id}: ${p.priceUSD}`);
      hasInvalidPrices = true;
    }
  }

  console.log('Duplicate Names Count:', allProducts.length - valNames.size, '(Must be 0)');
  console.log('Duplicate SKUs Count:', allProducts.length - valSkus.size, '(Must be 0)');
  console.log('Missing Fields Error:', hasMissingFields ? 'FAIL' : 'PASS');
  console.log('Negative/Zero Prices Error:', hasInvalidPrices ? 'FAIL' : 'PASS');

  console.log('\n--- Product Counts Per Category ---');
  console.table(categoryCounts);

  if (allProducts.length >= 360 && valNames.size === allProducts.length && valSkus.size === allProducts.length && !hasMissingFields && !hasInvalidPrices) {
    console.log('ALL VALIDATION CHECKS PASSED PERFECTLY!\n');
  } else {
    throw new Error('Seed validation failed!');
  }
}

// Run if called directly
if (process.argv[1]?.includes('seed')) {
  seedDatabase()
    .catch(err => {
      console.error('Seeding error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
