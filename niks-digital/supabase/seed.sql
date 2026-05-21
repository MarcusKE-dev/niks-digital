-- ════════════════════════════════════════════════════════════
-- NIKS DIGITAL CONNECTION — SEED DATA
-- File: supabase/seed.sql
-- ════════════════════════════════════════════════════════════
-- CATEGORIES
-- ════════════════════════════════════════════════════════════

INSERT INTO categories (name, slug, description, icon, display_order)
VALUES
  ('Televisions',        'televisions',   'LED, Smart, and Android TVs from 24" to 75". Stream Netflix, YouTube and more.',      '📺', 1),
  ('Refrigerators',      'refrigerators', 'Single-door, double-door, and side-by-side fridges. Energy-saving compressors.',      '🧊', 2),
  ('Cookers & Ovens',    'cookers',       'Gas cookers, electric cookers, built-in ovens, and range cookers.',                   '🔥', 3),
  ('Laptops & Computers','laptops',       'Laptops, desktop PCs, and accessories for work, school, and business.',               '💻', 4),
  ('Mobile Phones',      'phones',        'Smartphones and accessories from Samsung, Tecno, Infinix, and more.',                 '📱', 5),
  ('Audio & Speakers',   'audio',         'Home theatre systems, Bluetooth speakers, soundbars, and headphones.',                '🔊', 6),
  ('Cameras',            'cameras',       'DSLRs, mirrorless cameras, camcorders, and photography accessories.',                 '📷', 7),
  ('Kitchen Appliances', 'kitchen',       'Microwaves, kettles, blenders, air fryers, rice cookers, and more.',                  '🍳', 8)
ON CONFLICT (slug) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — TELEVISIONS
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Samsung 55" 4K Crystal UHD Smart TV',
  'samsung-55-4k-crystal-uhd-smart-tv',
  (SELECT id FROM categories WHERE slug = 'televisions'),
  'Samsung',
  'Experience stunning 4K picture quality with Samsung''s Crystal Processor 4K, which upscales all your content to near 4K resolution. The sleek AirSlim design fits beautifully in any living room, while the smart features—Netflix, YouTube, Prime Video—keep you entertained. Includes 3 HDMI ports and Wi-Fi connectivity.',
  ARRAY['55" 4K Crystal UHD Display','Crystal Processor 4K (upscaling)','Smart TV — Tizen OS','Built-in Netflix, YouTube, Prime Video','AirSlim Design','3x HDMI · 2x USB','Dolby Digital+ Audio (20W)','Wi-Fi & Bluetooth 5.0'],
  68000, 82000, 15,
  'https://picsum.photos/seed/samsung55tv/600/600',
  ARRAY['https://picsum.photos/seed/samsung55tv/600/600','https://picsum.photos/seed/samsung55tv-b/600/600','https://picsum.photos/seed/samsung55tv-c/600/600'],
  'hot', true, 4.9, 287
),
(
  'TCL 43" Android TV Full HD',
  'tcl-43-android-tv-full-hd',
  (SELECT id FROM categories WHERE slug = 'televisions'),
  'TCL',
  'A feature-packed 43-inch Full HD Android TV at an unbeatable price. Access thousands of apps from the Google Play Store, use Google Assistant voice control, and cast from your phone with Chromecast built-in.',
  ARRAY['43" Full HD Display (1920x1080)','Android TV 11 — Google Play Store','Built-in Google Assistant','Chromecast Built-In','Micro Dimming Technology','2x HDMI · 2x USB','Wi-Fi & Bluetooth','A+ Energy Rating'],
  28500, 35000, 22,
  'https://picsum.photos/seed/tcl43tv/600/600',
  ARRAY['https://picsum.photos/seed/tcl43tv/600/600','https://picsum.photos/seed/tcl43tv-b/600/600'],
  'sale', false, 4.6, 191
),
(
  'Hisense 32" HD LED TV',
  'hisense-32-hd-led-tv',
  (SELECT id FROM categories WHERE slug = 'televisions'),
  'Hisense',
  'Reliable and affordable 32-inch HD LED TV ideal for bedrooms, kitchens, and small living rooms. Clear picture, multiple inputs, and a 2-year brand warranty.',
  ARRAY['32" HD Ready Display (1366x768)','HDMI · USB · AV Input','Built-In Stereo Speakers (16W)','USB Media Playback','Hotel Mode','Wall Mount Compatible (VESA)','2-Year Manufacturer Warranty'],
  18500, NULL, 31,
  'https://picsum.photos/seed/hisense32tv/600/600',
  ARRAY['https://picsum.photos/seed/hisense32tv/600/600','https://picsum.photos/seed/hisense32tv-b/600/600'],
  NULL, false, 4.4, 134
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — REFRIGERATORS
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Samsung 310L Double-Door Refrigerator',
  'samsung-310l-double-door-refrigerator',
  (SELECT id FROM categories WHERE slug = 'refrigerators'),
  'Samsung',
  'A spacious 310-litre frost-free double-door refrigerator designed for Kenyan families. The Digital Inverter Compressor adapts to cooling demand, saving energy and running quietly.',
  ARRAY['310L Total Capacity (230L fridge + 80L freezer)','Digital Inverter Compressor (energy saving)','Frost-Free Technology','Deodorising Filter','Large Vegetable Crisper','All-Around Cooling','Digital Temperature Display','10-Year Compressor Warranty'],
  42000, 48000, 8,
  'https://picsum.photos/seed/samsung310fridge/600/600',
  ARRAY['https://picsum.photos/seed/samsung310fridge/600/600','https://picsum.photos/seed/samsung310fridge-b/600/600'],
  'hot', true, 4.8, 124
),
(
  'LG 200L Single-Door Refrigerator',
  'lg-200l-single-door-refrigerator',
  (SELECT id FROM categories WHERE slug = 'refrigerators'),
  'LG',
  'The perfect fridge for a small family, bedsitter, or office. Compact yet spacious with a freezer compartment. LG''s Smart Inverter compressor uses up to 32% less energy than conventional compressors.',
  ARRAY['200L Total Capacity','Smart Inverter Compressor (32% energy saving)','Built-In Freezer Compartment','Multi Air Flow Cooling','Door Alarm','Low Energy LED Interior Lighting','Easy Slide Shelf','5-Year Compressor Warranty'],
  28000, 32000, 14,
  'https://picsum.photos/seed/lg200fridge/600/600',
  ARRAY['https://picsum.photos/seed/lg200fridge/600/600','https://picsum.photos/seed/lg200fridge-b/600/600'],
  NULL, false, 4.6, 88
),
(
  'Hisense 500L Side-by-Side Refrigerator',
  'hisense-500l-side-by-side-refrigerator',
  (SELECT id FROM categories WHERE slug = 'refrigerators'),
  'Hisense',
  'Premium side-by-side refrigerator with massive 500-litre capacity. Dual cooling zones, water and ice dispenser, Wi-Fi connectivity for remote temperature control.',
  ARRAY['500L Total Capacity (285L fridge + 215L freezer)','Side-by-Side Layout','Dual Inverter Compressor','External Water & Ice Dispenser','Multi Air Flow Cooling','Holiday Mode','Wi-Fi App Control','Door Alarm'],
  89000, 105000, 4,
  'https://picsum.photos/seed/hisense500sbs/600/600',
  ARRAY['https://picsum.photos/seed/hisense500sbs/600/600','https://picsum.photos/seed/hisense500sbs-b/600/600'],
  'sale', true, 4.7, 56
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — COOKERS & OVENS
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Ramtons 4-Burner Gas Cooker with Oven',
  'ramtons-4-burner-gas-cooker-with-oven',
  (SELECT id FROM categories WHERE slug = 'cookers'),
  'Ramtons',
  'Kenya''s most popular family cooker. Stainless steel body, 4 gas burners, auto-ignition, and a 55-litre oven with inner grill. Compatible with all standard gas cylinders.',
  ARRAY['4 Gas Burners (1 high-power wok burner)','Auto-Ignition (no matches needed)','Stainless Steel Body','55L Oven Capacity','Oven Inner Grill','Tempered Glass Lid','Enamelled Pan Supports','Compatible with All Gas Cylinders'],
  18500, NULL, 27,
  'https://picsum.photos/seed/ramtons4burner/600/600',
  ARRAY['https://picsum.photos/seed/ramtons4burner/600/600','https://picsum.photos/seed/ramtons4burner-b/600/600'],
  'hot', true, 4.9, 203
),
(
  'Mika 2-Plate Electric Table Cooker',
  'mika-2-plate-electric-table-cooker',
  (SELECT id FROM categories WHERE slug = 'cookers'),
  'Mika',
  'Compact and affordable 2-plate electric cooker ideal for bedsitters, hostels, and small offices. No gas cylinder needed. Cast iron heating plates retain heat efficiently.',
  ARRAY['2 Electric Heating Plates','Cast Iron Plates (heat retention)','Variable Heat Control (6 settings)','Compact & Portable Design','Stainless Steel Body','Easy Wipe-Clean Surface','1-Year Manufacturer Warranty'],
  5500, 6500, 45,
  'https://picsum.photos/seed/mika2plate/600/600',
  ARRAY['https://picsum.photos/seed/mika2plate/600/600'],
  NULL, false, 4.3, 178
),
(
  'LG 1.5HP Dual Inverter Split Air Conditioner',
  'lg-1-5hp-dual-inverter-split-ac',
  (SELECT id FROM categories WHERE slug = 'cookers'),
  'LG',
  'Stay cool all year with LG''s Dual Inverter Split AC, saving up to 70% on electricity. Features 4-way air swing, auto clean, and Wi-Fi control via the ThinQ app.',
  ARRAY['1.5 HP (12,000 BTU) Cooling Capacity','Dual Inverter Compressor (up to 70% energy saving)','4-Way Auto Air Swing','Dual Protection Filter','Auto Clean (prevents mould growth)','Wi-Fi Control via LG ThinQ App','Sleep Mode & Timer','10-Year Compressor Warranty'],
  58000, 68000, 6,
  'https://picsum.photos/seed/lgac15hp/600/600',
  ARRAY['https://picsum.photos/seed/lgac15hp/600/600','https://picsum.photos/seed/lgac15hp-b/600/600'],
  'sale', false, 4.7, 39
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — LAPTOPS & COMPUTERS
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'HP 250 G9 Laptop — Core i5 8GB 256GB SSD',
  'hp-250-g9-laptop-i5-8gb-256gb',
  (SELECT id FROM categories WHERE slug = 'laptops'),
  'HP',
  'A powerful, reliable business and student laptop. 12th Gen Intel Core i5, fast NVMe SSD, Full HD IPS display, and 8-hour battery life. Comes with genuine Windows 11 Home.',
  ARRAY['12th Gen Intel Core i5-1235U Processor','8GB DDR4 RAM','256GB NVMe SSD','15.6" Full HD IPS Display (anti-glare)','Windows 11 Home (genuine)','Intel Iris Xe Graphics','8-Hour Battery Life','USB-C · USB-A · HDMI · SD Card Reader'],
  58000, 68000, 10,
  'https://picsum.photos/seed/hp250g9/600/600',
  ARRAY['https://picsum.photos/seed/hp250g9/600/600','https://picsum.photos/seed/hp250g9-b/600/600'],
  'hot', true, 4.7, 165
),
(
  'Dell Inspiron 15 — Core i3 4GB 1TB HDD',
  'dell-inspiron-15-i3-4gb-1tb',
  (SELECT id FROM categories WHERE slug = 'laptops'),
  'Dell',
  'Budget-friendly Dell laptop for everyday computing — browsing, documents, streaming, and school work. Large 1TB storage and RAM upgradeable to 16GB.',
  ARRAY['11th Gen Intel Core i3-1115G4','4GB RAM (upgradeable to 16GB)','1TB Hard Drive','15.6" HD Display','Windows 11 Home (genuine)','Intel UHD Graphics','Wi-Fi 5 + Bluetooth 4.2','USB-C · 2x USB-A · HDMI'],
  42000, 48000, 13,
  'https://picsum.photos/seed/dellinspironi3/600/600',
  ARRAY['https://picsum.photos/seed/dellinspironi3/600/600'],
  NULL, false, 4.4, 88
),
(
  'Epson L3250 Wi-Fi Ink Tank All-in-One Printer',
  'epson-l3250-wifi-ink-tank-printer',
  (SELECT id FROM categories WHERE slug = 'laptops'),
  'Epson',
  'The most popular office printer in Kenya. Print, scan, copy wirelessly. EcoTank refillable ink gives thousands of pages per fill — no expensive cartridges ever again.',
  ARRAY['Print · Scan · Copy (All-in-One)','Wi-Fi & USB Connectivity','EcoTank Refillable Ink — No Cartridges','7500 B&W pages per fill','6000 Colour pages per fill','5760 DPI Print Resolution','A4 Paper Size','Includes 1 Set of Ink Bottles'],
  22000, 26500, 18,
  'https://picsum.photos/seed/epsonl3250/600/600',
  ARRAY['https://picsum.photos/seed/epsonl3250/600/600','https://picsum.photos/seed/epsonl3250-b/600/600'],
  'new', false, 4.7, 95
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — MOBILE PHONES
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Samsung Galaxy A55 5G 8GB 256GB',
  'samsung-galaxy-a55-5g-8gb-256gb',
  (SELECT id FROM categories WHERE slug = 'phones'),
  'Samsung',
  'The Galaxy A55 5G brings flagship features to a mid-range price. 6.6-inch AMOLED 120Hz display, triple camera, 5G connectivity, and IP67 water resistance.',
  ARRAY['6.6" FHD+ Super AMOLED 120Hz','Exynos 1480 Octa-Core Processor','8GB RAM + 256GB Storage','50MP + 12MP + 5MP Camera','5000mAh Battery · 25W Fast Charging','5G Connectivity','IP67 Water & Dust Resistant','Android 14 · 4 OS Updates Guaranteed'],
  48000, 55000, 20,
  'https://picsum.photos/seed/samsunga55/600/600',
  ARRAY['https://picsum.photos/seed/samsunga55/600/600','https://picsum.photos/seed/samsunga55-b/600/600'],
  'new', true, 4.8, 234
),
(
  'Tecno Camon 30 Pro 8GB 256GB',
  'tecno-camon-30-pro-8gb-256gb',
  (SELECT id FROM categories WHERE slug = 'phones'),
  'Tecno',
  'Tecno''s most capable camera phone. 108MP main camera, 6.78-inch AMOLED 120Hz display, MediaTek Helio G99 processor, and 5000mAh battery with 33W fast charging.',
  ARRAY['108MP Main Camera (AI-enhanced)','6.78" FHD+ AMOLED 120Hz','MediaTek Helio G99 Processor','8GB RAM + 256GB Storage (expandable)','5000mAh Battery · 33W Fast Charging','32MP Selfie Camera','Side Fingerprint Sensor','Android 14 (HiOS 14)'],
  28000, 34000, 35,
  'https://picsum.photos/seed/tecnocamon30/600/600',
  ARRAY['https://picsum.photos/seed/tecnocamon30/600/600','https://picsum.photos/seed/tecnocamon30-b/600/600'],
  'hot', false, 4.5, 312
),
(
  'Infinix Hot 40i 8GB 128GB',
  'infinix-hot-40i-8gb-128gb',
  (SELECT id FROM categories WHERE slug = 'phones'),
  'Infinix',
  'Excellent entry-level smartphone with big screen and long battery life. 6.56-inch display, 5000mAh battery lasting 2 days on moderate use.',
  ARRAY['6.56" HD+ IPS LCD Display','Unisoc T606 Octa-Core Processor','8GB RAM (+ 8GB virtual RAM)','128GB Storage (expandable to 1TB)','5000mAh Battery · 10W Charging','50MP Main Camera','Fingerprint + Face ID','Android 13 (XOS 13)'],
  12500, 15000, 50,
  'https://picsum.photos/seed/infinixhot40i/600/600',
  ARRAY['https://picsum.photos/seed/infinixhot40i/600/600'],
  'sale', false, 4.2, 189
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — AUDIO & SPEAKERS
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Sony HT-S40R 5.1 Home Theatre System',
  'sony-ht-s40r-5-1-home-theatre',
  (SELECT id FROM categories WHERE slug = 'audio'),
  'Sony',
  '600W 5.1 surround sound system with Dolby Digital decoding. HDMI ARC for easy TV connection, Bluetooth streaming, and four satellite speakers plus a powered subwoofer.',
  ARRAY['600W Total Power Output','5.1 Channel Surround Sound','Dolby Digital & DTS Decoding','HDMI ARC Input','Bluetooth Streaming','USB Playback (MP3, AAC)','4 Satellite Speakers + Powered Subwoofer','Wall-Mount Compatible Satellites'],
  52000, 62000, 5,
  'https://picsum.photos/seed/sonyht5ch/600/600',
  ARRAY['https://picsum.photos/seed/sonyht5ch/600/600','https://picsum.photos/seed/sonyht5ch-b/600/600'],
  'hot', true, 4.8, 73
),
(
  'JBL PartyBox 110 Portable Bluetooth Speaker',
  'jbl-partybox-110-portable-speaker',
  (SELECT id FROM categories WHERE slug = 'audio'),
  'JBL',
  '160W portable party speaker with dynamic light show, 12-hour battery, IPX4 water resistance, and guitar/mic inputs. Bluetooth 5.0 with 30m range.',
  ARRAY['160W RMS Power Output','Bluetooth 5.0 (30m range)','Dynamic Sync Light Show','IPX4 Water Splash Resistant','12-Hour Battery Life','Guitar + Microphone Input (3.5mm)','Built-In Power Bank','PartyBox App Control'],
  32000, 38000, 9,
  'https://picsum.photos/seed/jblpartybox110/600/600',
  ARRAY['https://picsum.photos/seed/jblpartybox110/600/600','https://picsum.photos/seed/jblpartybox110-b/600/600'],
  'new', false, 4.7, 109
),
(
  'Sony WH-1000XM5 Noise-Cancelling Headphones',
  'sony-wh-1000xm5-noise-cancelling-headphones',
  (SELECT id FROM categories WHERE slug = 'audio'),
  'Sony',
  'Industry-leading noise cancellation, 30-hour battery, 8 microphones for crystal-clear calls, and multipoint Bluetooth for 2 devices at once.',
  ARRAY['Industry-Leading Active Noise Cancellation','30-Hour Battery Life (with ANC on)','8 Microphones for HD Call Quality','Multipoint Bluetooth (2 devices at once)','Speak-to-Chat Technology','Foldable Design for Travel','USB-C Quick Charge (3 min = 3 hrs)','LDAC Hi-Res Audio Wireless'],
  38000, 45000, 7,
  'https://picsum.photos/seed/sonywh1000xm5/600/600',
  ARRAY['https://picsum.photos/seed/sonywh1000xm5/600/600','https://picsum.photos/seed/sonywh1000xm5-b/600/600'],
  'sale', false, 4.9, 83
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — CAMERAS
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Canon EOS M50 Mark II Mirrorless Camera Kit',
  'canon-eos-m50-mark-ii-kit',
  (SELECT id FROM categories WHERE slug = 'cameras'),
  'Canon',
  '24.1MP mirrorless camera with 4K video, Dual Pixel autofocus, flip-out touchscreen, and built-in Wi-Fi. Ideal for content creators and photography enthusiasts. Includes 15-45mm kit lens.',
  ARRAY['24.1MP APS-C CMOS Sensor','4K 24fps Video Recording','Dual Pixel CMOS AF','Flip-Out Vari-Angle Touchscreen','Built-In Wi-Fi & Bluetooth','EV-5 Low-Light Autofocus','Eye-Detection AF for portraits','Includes EF-M 15-45mm Kit Lens'],
  85000, 98000, 4,
  'https://picsum.photos/seed/canonm50mkii/600/600',
  ARRAY['https://picsum.photos/seed/canonm50mkii/600/600','https://picsum.photos/seed/canonm50mkii-b/600/600'],
  'sale', true, 4.9, 47
),
(
  'Sony ZV-1F Vlogging Camera',
  'sony-zv-1f-vlogging-camera',
  (SELECT id FROM categories WHERE slug = 'cameras'),
  'Sony',
  'Purpose-built for vloggers. 20mm ultra-wide lens, flip-out touchscreen, 4K video, 3-capsule directional microphone, and real-time eye tracking autofocus.',
  ARRAY['20.1MP 1" Type CMOS Sensor','20mm Ultra-Wide Fixed Lens','Flip-Out LCD Touchscreen','4K Video (30fps) · Full HD 120fps','3-Capsule Directional Microphone','Real-time Eye AF & Tracking','Product Showcase Mode','Built-In Wi-Fi for phone transfer'],
  62000, 72000, 6,
  'https://picsum.photos/seed/sonyzv1f/600/600',
  ARRAY['https://picsum.photos/seed/sonyzv1f/600/600','https://picsum.photos/seed/sonyzv1f-b/600/600'],
  'new', false, 4.7, 31
),
(
  'GoPro HERO12 Black Action Camera',
  'gopro-hero12-black',
  (SELECT id FROM categories WHERE slug = 'cameras'),
  'GoPro',
  'Waterproof to 10m straight out of the box. 5.3K video, 27MP photos, HyperSmooth 6.0 stabilisation, and GPS. The world''s most versatile action camera.',
  ARRAY['5.3K60 · 4K120 · 2.7K240 Video','27MP RAW Photos','HyperSmooth 6.0 Stabilisation','Waterproof to 10m (no case needed)','HDR Video & Photo','Voice Control','USB-C Charging · GPS Built-In','Max Lens Mod Compatible'],
  48000, 55000, 8,
  'https://picsum.photos/seed/gopro12black/600/600',
  ARRAY['https://picsum.photos/seed/gopro12black/600/600','https://picsum.photos/seed/gopro12black-b/600/600'],
  NULL, false, 4.8, 62
);


-- ════════════════════════════════════════════════════════════
-- PRODUCTS — KITCHEN APPLIANCES
-- ════════════════════════════════════════════════════════════

INSERT INTO products (name, slug, category_id, brand, description, features, price, old_price, stock_qty, thumbnail, images, badge, is_featured, rating, review_count)
VALUES
(
  'Midea 20L Digital Microwave Oven',
  'midea-20l-digital-microwave',
  (SELECT id FROM categories WHERE slug = 'kitchen'),
  'Midea',
  '700W microwave with 8 pre-set cooking modes, digital touch controls, child safety lock, and 30-minute timer. Compact enough for any kitchen counter.',
  ARRAY['20L Capacity','700W Power Output','8 Pre-Set Auto Cooking Modes','Digital Touch Controls','30-Minute Timer','Child Safety Lock','Defrost by Weight or Time','Easy-Clean Interior'],
  9500, 11000, 24,
  'https://picsum.photos/seed/midea20micro/600/600',
  ARRAY['https://picsum.photos/seed/midea20micro/600/600','https://picsum.photos/seed/midea20micro-b/600/600'],
  'new', false, 4.5, 67
),
(
  'Philips Airfryer XXL 6.2L HD9650',
  'philips-airfryer-xxl-6-2l',
  (SELECT id FROM categories WHERE slug = 'kitchen'),
  'Philips',
  'Cook crispy food with up to 90% less fat. 6.2L capacity for families — cook a whole chicken in one go. 7 pre-set programs, keep warm function, dishwasher-safe basket.',
  ARRAY['6.2L Capacity (serves 4-6 people)','2000W Rapid Air Technology','Up to 200 degrees C','7 Pre-Set Digital Programs','Keep Warm Function','Dishwasher-Safe Basket & Insert','Double Layer Rack Included','NutriU Recipe App (500+ recipes)'],
  18500, 22000, 11,
  'https://picsum.photos/seed/philipsairfryerxxl/600/600',
  ARRAY['https://picsum.photos/seed/philipsairfryerxxl/600/600','https://picsum.photos/seed/philipsairfryerxxl-b/600/600'],
  'hot', true, 4.8, 112
),
(
  'Russell Hobbs Luna 1.7L Cordless Kettle',
  'russell-hobbs-luna-1-7l-kettle',
  (SELECT id FROM categories WHERE slug = 'kitchen'),
  'Russell Hobbs',
  'Boil water in under 3 minutes. 2200W rapid boil, 360 degree rotating base, auto shut-off, and boil-dry protection. Stainless steel body, 1.7L capacity.',
  ARRAY['1.7L Capacity (up to 6 cups per boil)','2200W Rapid Boil','360 Degree Rotating Cordless Base','Auto Shut-Off','Boil-Dry Safety Protection','Removable & Washable Scale Filter','Stainless Steel Body','Water Level Window'],
  3800, NULL, 38,
  'https://picsum.photos/seed/russhobskettle/600/600',
  ARRAY['https://picsum.photos/seed/russhobskettle/600/600'],
  NULL, false, 4.7, 141
);


-- ════════════════════════════════════════════════════════════
-- VERIFY — run these after seeding to confirm success
-- ════════════════════════════════════════════════════════════

SELECT COUNT(*) AS category_count FROM categories;
-- Expected: 8

SELECT COUNT(*) AS product_count FROM products;
-- Expected: 24

SELECT c.name AS category, COUNT(p.id) AS products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name, c.display_order
ORDER BY c.display_order;
-- Expected: 3 products per category
