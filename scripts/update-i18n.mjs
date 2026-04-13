import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, '..', 'src', 'i18n');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// TR translations (Turkish - base)
const tr = {
  welcome: {
    popularCategories: 'En Popüler Kategoriler',
    bestsellers: 'En Çok Satanlar',
    toolsTitle: 'Akıllı Mutfak Araçları',
    bannerHint: 'Sonraki banner için tıkla',
    modules: {
      diamond: 'Katalog', combisteel: 'Mağaza', studio: 'Tasarım',
      compare: 'Ürün', quote: 'PDF', projects: 'Yönetim',
      compareLabel: 'KARŞILAŞTIR', quoteLabel: 'TEKLİF', projectsLabel: 'PROJELER'
    },
    cat: {
      pizzaGrill: 'Pizza & Izgara', cooling: 'Soğutma', washing: 'Yıkama & Temizlik',
      steelFurniture: 'Paslanmaz Mobilya', doughMachines: 'Hamur Makineleri', cookingDevices: 'Pişirme Cihazları'
    },
    tools: {
      badge: 'Araçlar',
      subtitle: 'AI planlama, kapasite hesabı ve 3D tasarım — tek platformda',
      aiPlanner: {
        title: 'AI Mutfak Planlayıcı',
        desc: 'Yapay zeka işletme tipinize göre eksiksiz ekipman listesi çıkarır. Metrekare, kapasite ve bütçeye göre öneriler.',
        badge: 'YAPAY ZEKA', step1: 'İşletme tipi', step2: 'Alan & kuver', step3: 'Ekipman listesi'
      },
      capacity: {
        title: 'Kapasite Hesap Aracı',
        desc: 'Günlük kuver, menü tipi ve alan bilgileriyle ocak, fırın, soğutma ve bulaşık kapasitelerini anında hesaplayın.',
        badge: 'HESAPLAMA', step1: 'Menü tipi', step2: 'Pişirme', step3: 'Soğutma', step4: 'Bulaşık'
      },
      studio3d: {
        title: '3D Tasarım Stüdyosu',
        desc: 'Mutfağınızı sürükle-bırak ile 3D modelleyin, ekipmanları yerleştirin ve teklifinizi tek tıkla PDF olarak alın.',
        step1: 'Plan çiz', step2: '3D yerleştir', step3: 'PDF teklif'
      }
    },
    spec: {
      capacity: 'Kapasite', power: 'Güç', rpm: 'Devir', dimensions: 'Boyutlar',
      weight: 'Ağırlık', material: 'Malzeme', category: 'Kategori',
      lighting: 'Aydınlatma', usage: 'Kullanım', installation: 'Montaj'
    },
    showcase3d: {
      title: '3D Ürün', titleAccent: 'Vitrini',
      subtitle: 'Modelleri döndürün, yakınlaştırın · karta tıklayın ve tüm detayları inceleyin',
      tagEquipment: 'EKİPMAN', tagPresentation: 'SUNUM', tagConcept: 'KONSEPT',
      item1: {
        subtitle: 'Yüksek kapasite endüstriyel',
        desc: 'Endüstriyel fırın, pastane ve büyük catering işletmeleri için 60 litre kazan kapasiteli profesyonel planet mikser.',
        material: 'AISI 304 Paslanmaz',
        feat1: 'Planet hareket · homojen yoğurma', feat2: 'Otomatik kazan yükseltme',
        feat3: 'Zaman ayarlı dijital kontrol', feat4: 'CE sertifikalı · 2 yıl garanti'
      },
      item2: {
        title: 'Şişe Teşhir Vitrini', subtitle: 'Bar & içecek sunum rafı',
        desc: 'Bar ve restoranlar için renkli içecek şişelerini estetik bir şekilde sergileyen profesyonel teşhir vitrini.',
        catVal: 'Bar ekipmanı', capVal: 'Çok katlı teşhir', lightVal: 'LED arka plan', matVal: 'Paslanmaz · temperli cam',
        feat1: 'LED arkadan aydınlatma', feat2: 'Ayarlanabilir raf sistemi', feat3: 'Temperli cam paneller', feat4: 'Bar ve restoranlar için ideal'
      },
      item3: {
        title: 'Showroom Konsept Modeli', subtitle: 'Sergi & tanıtım modülü',
        desc: 'Mağaza ve showroomlar için özel tasarlanmış konsept ekipman.',
        catVal: 'Showroom ekipmanı', useVal: 'Sergi · tanıtım', installVal: 'Modüler sistem', matVal: 'Paslanmaz çelik',
        feat1: 'Modüler tasarım', feat2: 'Kolay kurulum', feat3: 'Profesyonel görünüm', feat4: 'Dayanıklı yapı'
      },
      modal: {
        hint: 'Döndür · Yakınlaştır · Sürükle', close: 'Kapat', catalogPrice: 'Katalog fiyatı',
        techSpecs: 'Teknik Özellikler', highlights: 'Öne Çıkan Özellikler',
        exploreBtn: 'Katalogda Keşfet', closeBtn: 'Kapat'
      }
    },
    theme: {
      doner: 'Dönerci', pizzeria: 'Pizzeria', imbiss: 'Büfe', restaurant: 'Restoran',
      cafe: 'Café', iceCream: 'Dondurmacı', asian: 'Asya Mutfağı', bakery: 'Pastane',
      butcher: 'Kasap', bar: 'Bar & Pub', market: 'Market', catering: 'Catering',
      hotel: 'Otel', foodTruck: 'Food Truck'
    },
    themedWorlds: { subtitle: '14 iş kolu · her konsept için eksiksiz ekipman seti' },
    trust: {
      euroBiggest: "Avrupa'nın En Büyük", euroBiggestSub: 'Endüstriyel gastro tedarikçisi',
      freeShipping: 'Ücretsiz Teslimat', freeShippingSub: 'Tüm Avrupa geneli',
      priceGuarantee: 'Düşük Fiyat Garantisi', priceGuaranteeSub: 'En iyi fiyat taahhüdü',
      expressCargo: 'Ekspres Kargo', expressCargoSub: '24-48 saat içinde'
    },
    explore: {
      catHeading: 'Ürün Kategorileri', pagesHeading: 'Site Mimarisi',
      catSubtitle: '8 ana kategori · 6.300+ ürün', pagesSubtitle: '14 sayfa · tüm deneyim noktaları',
      tabCategories: 'Kategoriler', tabPages: 'Sayfalar',
      cat1: 'Pişirme Ekipmanları', cat1Sub: 'Ocak, Fırın, Izgara, Fritöz, Pizza Fırını',
      cat2: 'Soğutma & Dondurma', cat2Sub: 'Buzdolabı, Dondurucu, Salatbar, Blast Chiller',
      cat3: 'Yıkama & Hijyen', cat3Sub: 'Bulaşık & Bardak Makinesi, El Yıkama',
      cat4: 'Hazırlama & Kesme', cat4Sub: 'Sebze Doğrama, Et Kıyma, Dilimleyici',
      cat5: 'Mobilya & Paslanmaz', cat5Sub: 'Tezgah, Raf, Arabalar, Evye, Davlumbaz',
      cat6: 'İçecek & Bar', cat6Sub: 'Espresso, Blender, Sıkacak, Bar',
      cat7: 'Servis & Sunum', cat7Sub: 'Tabak, Bardak, Servis Arabası, Chafing',
      cat8: 'Paketleme & Teslimat', cat8Sub: 'Vakum, Folyo, Teslimat Çantası',
      tagCritical: 'KRİTİK', tagImportant: 'ÖNEMLİ', tagDifferentiator: 'FARK YARATAN',
      page: {
        home: 'Anasayfa', homeDesc: 'Hero, kategoriler, öneriler',
        catList: 'Kategori Listesi', catListDesc: 'Filtreleme, sıralama, grid/list',
        prodDetail: 'Ürün Detay', prodDetailDesc: 'Galeri, spec, fiyat, stok',
        cart: 'Sepet', cartDesc: 'Slide-over + tam sayfa, özet',
        payment: 'Ödeme', paymentDesc: '3 adım: bilgi → kargo → ödeme',
        search: 'Arama Sonuçları', searchDesc: 'Anlık öneriler, filtreler',
        account: 'Kullanıcı Hesabı', accountDesc: 'Siparişler, adres, favoriler',
        b2b: 'B2B Portal', b2bDesc: 'Toplu fiyat, teklif, fatura',
        blog: 'Blog / Rehber', blogDesc: 'SEO içerikleri, rehberler',
        compare: 'Karşılaştırma', compareDesc: '2–4 ürün yan yana',
        planner: 'Mutfak Planlayıcı', plannerDesc: 'AI-destekli ekipman planlama'
      }
    },
    quickLinks: {
      heading: 'Yardım & İletişim',
      contact: 'İletişim', contactDesc: 'Form, harita, telefon, WhatsApp',
      about: 'Hakkımızda', aboutDesc: 'Hikâye, değerler, ekip',
      faq: 'SSS / Yardım', faqDesc: 'Sık sorulanlar, kargo, iade',
      tagStandard: 'STANDART'
    },
    nav: { home: 'Anasayfa', contact: 'İletişim', loginRegister: 'Giriş / Kayıt' }
  },
  nav: { admin: 'Yönetici', search: 'Ara...', brand: 'Marka Kimliği', adminOrders: 'Siparişler', adminUsers: 'Kullanıcılar' }
};

// EN translations
const en = {
  welcome: {
    popularCategories: 'Most Popular Categories',
    bestsellers: 'Our Bestsellers',
    toolsTitle: 'Smart Kitchen Tools',
    bannerHint: 'Click for next banner',
    modules: {
      diamond: 'Catalog', combisteel: 'Store', studio: 'Design',
      compare: 'Product', quote: 'PDF', projects: 'Management',
      compareLabel: 'COMPARE', quoteLabel: 'QUOTE', projectsLabel: 'PROJECTS'
    },
    cat: {
      pizzaGrill: 'Pizza & Grill', cooling: 'Cooling', washing: 'Washing & Cleaning',
      steelFurniture: 'Stainless Steel Furniture', doughMachines: 'Dough Machines', cookingDevices: 'Cooking Devices'
    },
    tools: {
      badge: 'Tools',
      subtitle: 'AI planning, capacity calculation and 3D design — all in one platform',
      aiPlanner: {
        title: 'AI Kitchen Planner',
        desc: 'AI generates a complete equipment list based on your business type. Recommendations by area, capacity, and budget.',
        badge: 'AI', step1: 'Business type', step2: 'Area & covers', step3: 'Equipment list'
      },
      capacity: {
        title: 'Capacity Calculator',
        desc: 'Instantly calculate cooking, oven, cooling and dishwashing capacities based on daily covers, menu type and area.',
        badge: 'CALCULATION', step1: 'Menu type', step2: 'Cooking', step3: 'Cooling', step4: 'Dishwashing'
      },
      studio3d: {
        title: '3D Design Studio',
        desc: 'Model your kitchen in 3D with drag-and-drop, place equipment and get your quote as a PDF in one click.',
        step1: 'Draw plan', step2: '3D place', step3: 'PDF quote'
      }
    },
    spec: {
      capacity: 'Capacity', power: 'Power', rpm: 'Speed', dimensions: 'Dimensions',
      weight: 'Weight', material: 'Material', category: 'Category',
      lighting: 'Lighting', usage: 'Usage', installation: 'Installation'
    },
    showcase3d: {
      title: '3D Product', titleAccent: 'Showcase',
      subtitle: 'Rotate, zoom in · click the card to see all details',
      tagEquipment: 'EQUIPMENT', tagPresentation: 'DISPLAY', tagConcept: 'CONCEPT',
      item1: {
        subtitle: 'High capacity industrial',
        desc: 'Professional planetary mixer with 60-liter bowl capacity for industrial bakeries, pastry shops and large catering operations.',
        material: 'AISI 304 Stainless Steel',
        feat1: 'Planetary motion · homogeneous kneading', feat2: 'Automatic bowl lift',
        feat3: 'Timer digital control', feat4: 'CE certified · 2 year warranty'
      },
      item2: {
        title: 'Bottle Display Cabinet', subtitle: 'Bar & beverage display shelf',
        desc: 'Professional display cabinet for bars and restaurants to elegantly showcase colorful beverage bottles.',
        catVal: 'Bar equipment', capVal: 'Multi-tier display', lightVal: 'LED backlight', matVal: 'Stainless steel · tempered glass',
        feat1: 'LED backlighting', feat2: 'Adjustable shelf system', feat3: 'Tempered glass panels', feat4: 'Ideal for bars and restaurants'
      },
      item3: {
        title: 'Showroom Concept Model', subtitle: 'Exhibition & presentation module',
        desc: 'Custom designed concept equipment for stores and showrooms.',
        catVal: 'Showroom equipment', useVal: 'Exhibition · presentation', installVal: 'Modular system', matVal: 'Stainless steel',
        feat1: 'Modular design', feat2: 'Easy installation', feat3: 'Professional look', feat4: 'Durable construction'
      },
      modal: {
        hint: 'Rotate · Zoom · Drag', close: 'Close', catalogPrice: 'Catalog price',
        techSpecs: 'Technical Specifications', highlights: 'Key Features',
        exploreBtn: 'Explore in Catalog', closeBtn: 'Close'
      }
    },
    theme: {
      doner: 'Döner Shop', pizzeria: 'Pizzeria', imbiss: 'Snack Bar', restaurant: 'Restaurant',
      cafe: 'Café', iceCream: 'Ice Cream Shop', asian: 'Asian Kitchen', bakery: 'Bakery',
      butcher: 'Butcher', bar: 'Bar & Pub', market: 'Market', catering: 'Catering',
      hotel: 'Hotel', foodTruck: 'Food Truck'
    },
    themedWorlds: { subtitle: '14 business segments · complete equipment set for every concept' },
    trust: {
      euroBiggest: "Europe's Largest", euroBiggestSub: 'Industrial gastro supplier',
      freeShipping: 'Free Delivery', freeShippingSub: 'All across Europe',
      priceGuarantee: 'Low Price Guarantee', priceGuaranteeSub: 'Best price commitment',
      expressCargo: 'Express Shipping', expressCargoSub: 'Within 24-48 hours'
    },
    explore: {
      catHeading: 'Product Categories', pagesHeading: 'Site Architecture',
      catSubtitle: '8 main categories · 6,300+ products', pagesSubtitle: '14 pages · all experience points',
      tabCategories: 'Categories', tabPages: 'Pages',
      cat1: 'Cooking Equipment', cat1Sub: 'Stove, Oven, Grill, Fryer, Pizza Oven',
      cat2: 'Cooling & Freezing', cat2Sub: 'Refrigerator, Freezer, Salad Bar, Blast Chiller',
      cat3: 'Washing & Hygiene', cat3Sub: 'Dishwasher & Glass Washer, Hand Washing',
      cat4: 'Preparation & Cutting', cat4Sub: 'Vegetable Cutter, Meat Grinder, Slicer',
      cat5: 'Furniture & Stainless', cat5Sub: 'Counter, Shelf, Carts, Sink, Hood',
      cat6: 'Beverage & Bar', cat6Sub: 'Espresso, Blender, Juicer, Bar',
      cat7: 'Service & Presentation', cat7Sub: 'Plates, Glasses, Service Cart, Chafing',
      cat8: 'Packaging & Delivery', cat8Sub: 'Vacuum, Film, Delivery Bag',
      tagCritical: 'CRITICAL', tagImportant: 'IMPORTANT', tagDifferentiator: 'DIFFERENTIATOR',
      page: {
        home: 'Home', homeDesc: 'Hero, categories, recommendations',
        catList: 'Category List', catListDesc: 'Filtering, sorting, grid/list',
        prodDetail: 'Product Detail', prodDetailDesc: 'Gallery, spec, price, stock',
        cart: 'Cart', cartDesc: 'Slide-over + full page, summary',
        payment: 'Payment', paymentDesc: '3 steps: info → shipping → payment',
        search: 'Search Results', searchDesc: 'Instant suggestions, filters',
        account: 'User Account', accountDesc: 'Orders, address, favorites',
        b2b: 'B2B Portal', b2bDesc: 'Bulk pricing, quotes, invoices',
        blog: 'Blog / Guide', blogDesc: 'SEO content, guides',
        compare: 'Comparison', compareDesc: '2–4 products side by side',
        planner: 'Kitchen Planner', plannerDesc: 'AI-powered equipment planning'
      }
    },
    quickLinks: {
      heading: 'Help & Contact',
      contact: 'Contact', contactDesc: 'Form, map, phone, WhatsApp',
      about: 'About Us', aboutDesc: 'Story, values, team',
      faq: 'FAQ / Help', faqDesc: 'FAQ, shipping, returns',
      tagStandard: 'STANDARD'
    },
    nav: { home: 'Home', contact: 'Contact', loginRegister: 'Login / Register' }
  },
  nav: { admin: 'Admin', search: 'Search...', brand: 'Brand Identity', adminOrders: 'Orders', adminUsers: 'Users' }
};

// DE translations
const de = {
  welcome: {
    popularCategories: 'Beliebteste Kategorien',
    bestsellers: 'Unsere Bestseller',
    toolsTitle: 'Smarte Küchenwerkzeuge',
    bannerHint: 'Klicken für nächstes Banner',
    modules: {
      diamond: 'Katalog', combisteel: 'Shop', studio: 'Design',
      compare: 'Produkt', quote: 'PDF', projects: 'Verwaltung',
      compareLabel: 'VERGLEICHEN', quoteLabel: 'ANGEBOT', projectsLabel: 'PROJEKTE'
    },
    cat: {
      pizzaGrill: 'Pizza & Grill', cooling: 'Kühlung', washing: 'Spülen & Reinigen',
      steelFurniture: 'Edelstahlmöbel', doughMachines: 'Teigmaschinen', cookingDevices: 'Kochgeräte'
    },
    tools: {
      badge: 'Werkzeuge',
      subtitle: 'KI-Planung, Kapazitätsberechnung und 3D-Design — alles auf einer Plattform',
      aiPlanner: {
        title: 'KI-Küchenplaner',
        desc: 'KI erstellt eine vollständige Geräteliste basierend auf Ihrem Geschäftstyp. Empfehlungen nach Fläche, Kapazität und Budget.',
        badge: 'KI', step1: 'Geschäftstyp', step2: 'Fläche & Gedecke', step3: 'Geräteliste'
      },
      capacity: {
        title: 'Kapazitätsrechner',
        desc: 'Berechnen Sie sofort Koch-, Ofen-, Kühl- und Spülkapazitäten basierend auf täglichen Gedecken, Menütyp und Fläche.',
        badge: 'BERECHNUNG', step1: 'Menütyp', step2: 'Kochen', step3: 'Kühlung', step4: 'Spülen'
      },
      studio3d: {
        title: '3D Design Studio',
        desc: 'Modellieren Sie Ihre Küche in 3D per Drag-and-Drop, platzieren Sie Geräte und erhalten Sie Ihr Angebot als PDF mit einem Klick.',
        step1: 'Plan zeichnen', step2: '3D platzieren', step3: 'PDF-Angebot'
      }
    },
    spec: {
      capacity: 'Kapazität', power: 'Leistung', rpm: 'Drehzahl', dimensions: 'Abmessungen',
      weight: 'Gewicht', material: 'Material', category: 'Kategorie',
      lighting: 'Beleuchtung', usage: 'Verwendung', installation: 'Montage'
    },
    showcase3d: {
      title: '3D Produkt', titleAccent: 'Vitrine',
      subtitle: 'Drehen, zoomen · klicken Sie auf die Karte für alle Details',
      tagEquipment: 'AUSRÜSTUNG', tagPresentation: 'PRÄSENTATION', tagConcept: 'KONZEPT',
      item1: {
        subtitle: 'Hohe Kapazität industriell',
        desc: 'Professioneller Planetenmixer mit 60-Liter-Kessel für industrielle Bäckereien, Konditoreien und große Catering-Betriebe.',
        material: 'AISI 304 Edelstahl',
        feat1: 'Planetenbewegung · homogenes Kneten', feat2: 'Automatische Kesselanhebung',
        feat3: 'Timer-Digitalsteuerung', feat4: 'CE-zertifiziert · 2 Jahre Garantie'
      },
      item2: {
        title: 'Flaschen-Vitrine', subtitle: 'Bar- & Getränke-Präsentationsregal',
        desc: 'Professionelle Vitrine für Bars und Restaurants zur eleganten Präsentation bunter Getränkeflaschen.',
        catVal: 'Bar-Ausstattung', capVal: 'Mehrstöckige Präsentation', lightVal: 'LED-Hintergrundbeleuchtung', matVal: 'Edelstahl · gehärtetes Glas',
        feat1: 'LED-Hintergrundbeleuchtung', feat2: 'Verstellbares Regalsystem', feat3: 'Gehärtete Glaspaneele', feat4: 'Ideal für Bars und Restaurants'
      },
      item3: {
        title: 'Showroom-Konzeptmodell', subtitle: 'Ausstellungs- & Präsentationsmodul',
        desc: 'Speziell entworfene Konzeptausrüstung für Geschäfte und Showrooms.',
        catVal: 'Showroom-Ausrüstung', useVal: 'Ausstellung · Präsentation', installVal: 'Modulares System', matVal: 'Edelstahl',
        feat1: 'Modulares Design', feat2: 'Einfache Installation', feat3: 'Professionelles Aussehen', feat4: 'Robuste Konstruktion'
      },
      modal: {
        hint: 'Drehen · Zoomen · Ziehen', close: 'Schließen', catalogPrice: 'Katalogpreis',
        techSpecs: 'Technische Daten', highlights: 'Herausragende Merkmale',
        exploreBtn: 'Im Katalog entdecken', closeBtn: 'Schließen'
      }
    },
    theme: {
      doner: 'Döner-Laden', pizzeria: 'Pizzeria', imbiss: 'Imbiss', restaurant: 'Restaurant',
      cafe: 'Café', iceCream: 'Eisdiele', asian: 'Asiatische Küche', bakery: 'Bäckerei',
      butcher: 'Metzgerei', bar: 'Bar & Pub', market: 'Markt', catering: 'Catering',
      hotel: 'Hotel', foodTruck: 'Food Truck'
    },
    themedWorlds: { subtitle: '14 Branchen · komplette Ausstattung für jedes Konzept' },
    trust: {
      euroBiggest: 'Europas Größter', euroBiggestSub: 'Industrieller Gastro-Lieferant',
      freeShipping: 'Kostenlose Lieferung', freeShippingSub: 'Europaweit',
      priceGuarantee: 'Tiefpreisgarantie', priceGuaranteeSub: 'Bestpreis-Zusage',
      expressCargo: 'Expressversand', expressCargoSub: 'Innerhalb von 24-48 Stunden'
    },
    explore: {
      catHeading: 'Produktkategorien', pagesHeading: 'Website-Architektur',
      catSubtitle: '8 Hauptkategorien · 6.300+ Produkte', pagesSubtitle: '14 Seiten · alle Erlebnispunkte',
      tabCategories: 'Kategorien', tabPages: 'Seiten',
      cat1: 'Kochgeräte', cat1Sub: 'Herd, Ofen, Grill, Fritteuse, Pizzaofen',
      cat2: 'Kühlung & Tiefkühlung', cat2Sub: 'Kühlschrank, Gefrierschrank, Salatbar, Schockkühler',
      cat3: 'Spülen & Hygiene', cat3Sub: 'Geschirrspüler & Gläserspüler, Handwaschbecken',
      cat4: 'Vorbereitung & Schneiden', cat4Sub: 'Gemüseschneider, Fleischwolf, Aufschnittmaschine',
      cat5: 'Möbel & Edelstahl', cat5Sub: 'Arbeitstisch, Regal, Wagen, Spüle, Dunstabzug',
      cat6: 'Getränke & Bar', cat6Sub: 'Espresso, Mixer, Entsafter, Bar',
      cat7: 'Service & Präsentation', cat7Sub: 'Teller, Gläser, Servierwagen, Chafing',
      cat8: 'Verpackung & Lieferung', cat8Sub: 'Vakuum, Folie, Liefertasche',
      tagCritical: 'KRITISCH', tagImportant: 'WICHTIG', tagDifferentiator: 'DIFFERENZIEREND',
      page: {
        home: 'Startseite', homeDesc: 'Hero, Kategorien, Empfehlungen',
        catList: 'Kategorieliste', catListDesc: 'Filtern, Sortieren, Raster/Liste',
        prodDetail: 'Produktdetail', prodDetailDesc: 'Galerie, Spez., Preis, Bestand',
        cart: 'Warenkorb', cartDesc: 'Slide-over + Vollbild, Zusammenfassung',
        payment: 'Zahlung', paymentDesc: '3 Schritte: Info → Versand → Zahlung',
        search: 'Suchergebnisse', searchDesc: 'Sofortvorschläge, Filter',
        account: 'Benutzerkonto', accountDesc: 'Bestellungen, Adresse, Favoriten',
        b2b: 'B2B-Portal', b2bDesc: 'Mengenpreise, Angebote, Rechnungen',
        blog: 'Blog / Ratgeber', blogDesc: 'SEO-Inhalte, Ratgeber',
        compare: 'Vergleich', compareDesc: '2–4 Produkte nebeneinander',
        planner: 'Küchenplaner', plannerDesc: 'KI-gestützte Geräteplanung'
      }
    },
    quickLinks: {
      heading: 'Hilfe & Kontakt',
      contact: 'Kontakt', contactDesc: 'Formular, Karte, Telefon, WhatsApp',
      about: 'Über uns', aboutDesc: 'Geschichte, Werte, Team',
      faq: 'FAQ / Hilfe', faqDesc: 'Häufige Fragen, Versand, Rückgabe',
      tagStandard: 'STANDARD'
    },
    nav: { home: 'Startseite', contact: 'Kontakt', loginRegister: 'Anmelden / Registrieren' }
  },
  nav: { admin: 'Admin', search: 'Suche...', brand: 'Markenidentität', adminOrders: 'Bestellungen', adminUsers: 'Benutzer' }
};

// FR translations
const fr = {
  welcome: {
    popularCategories: 'Catégories les plus populaires',
    bestsellers: 'Nos best-sellers',
    toolsTitle: 'Outils de cuisine intelligents',
    bannerHint: 'Cliquez pour le prochain',
    modules: {
      diamond: 'Catalogue', combisteel: 'Boutique', studio: 'Design',
      compare: 'Produit', quote: 'PDF', projects: 'Gestion',
      compareLabel: 'COMPARER', quoteLabel: 'DEVIS', projectsLabel: 'PROJETS'
    },
    cat: {
      pizzaGrill: 'Pizza & Grill', cooling: 'Réfrigération', washing: 'Lavage & Nettoyage',
      steelFurniture: 'Mobilier inox', doughMachines: 'Pétrins', cookingDevices: 'Appareils de cuisson'
    },
    tools: {
      badge: 'Outils', subtitle: 'Planification IA, calcul de capacité et design 3D — tout en une plateforme',
      aiPlanner: { title: 'Planificateur IA', desc: "L'IA génère une liste complète d'équipements selon votre type d'entreprise.", badge: 'IA', step1: "Type d'entreprise", step2: 'Surface & couverts', step3: "Liste d'équipements" },
      capacity: { title: 'Calculateur de capacité', desc: 'Calculez instantanément les capacités de cuisson, réfrigération et lavage.', badge: 'CALCUL', step1: 'Type de menu', step2: 'Cuisson', step3: 'Réfrigération', step4: 'Lavage' },
      studio3d: { title: 'Studio Design 3D', desc: 'Modélisez votre cuisine en 3D, placez les équipements et obtenez votre devis en PDF.', step1: 'Dessiner le plan', step2: 'Placer en 3D', step3: 'Devis PDF' }
    },
    spec: { capacity: 'Capacité', power: 'Puissance', rpm: 'Vitesse', dimensions: 'Dimensions', weight: 'Poids', material: 'Matériau', category: 'Catégorie', lighting: 'Éclairage', usage: 'Utilisation', installation: 'Installation' },
    showcase3d: {
      title: 'Produit 3D', titleAccent: 'Vitrine', subtitle: 'Tournez, zoomez · cliquez sur la carte pour tous les détails',
      tagEquipment: 'ÉQUIPEMENT', tagPresentation: 'PRÉSENTATION', tagConcept: 'CONCEPT',
      item1: { subtitle: 'Haute capacité industrielle', desc: 'Pétrin planétaire professionnel de 60 litres.', material: 'AISI 304 Inox', feat1: 'Mouvement planétaire · pétrissage homogène', feat2: 'Levée automatique de cuve', feat3: 'Commande numérique avec minuterie', feat4: 'Certifié CE · garantie 2 ans' },
      item2: { title: 'Vitrine à bouteilles', subtitle: 'Présentoir bar & boissons', desc: 'Vitrine professionnelle pour bars et restaurants.', catVal: 'Équipement de bar', capVal: 'Présentation multi-niveaux', lightVal: 'Rétroéclairage LED', matVal: 'Inox · verre trempé', feat1: 'Rétroéclairage LED', feat2: 'Système de rayonnage réglable', feat3: 'Panneaux en verre trempé', feat4: 'Idéal pour bars et restaurants' },
      item3: { title: 'Modèle concept showroom', subtitle: "Module d'exposition", desc: 'Équipement concept conçu sur mesure pour les showrooms.', catVal: 'Équipement showroom', useVal: 'Exposition · présentation', installVal: 'Système modulaire', matVal: 'Acier inoxydable', feat1: 'Design modulaire', feat2: 'Installation facile', feat3: 'Aspect professionnel', feat4: 'Construction durable' },
      modal: { hint: 'Tourner · Zoomer · Glisser', close: 'Fermer', catalogPrice: 'Prix catalogue', techSpecs: 'Caractéristiques techniques', highlights: 'Points forts', exploreBtn: 'Découvrir dans le catalogue', closeBtn: 'Fermer' }
    },
    theme: { doner: 'Kebab', pizzeria: 'Pizzeria', imbiss: 'Snack', restaurant: 'Restaurant', cafe: 'Café', iceCream: 'Glacier', asian: 'Cuisine asiatique', bakery: 'Boulangerie', butcher: 'Boucherie', bar: 'Bar & Pub', market: 'Supermarché', catering: 'Traiteur', hotel: 'Hôtel', foodTruck: 'Food Truck' },
    themedWorlds: { subtitle: "14 secteurs · équipement complet pour chaque concept" },
    trust: { euroBiggest: "Le plus grand d'Europe", euroBiggestSub: 'Fournisseur gastro industriel', freeShipping: 'Livraison gratuite', freeShippingSub: "Dans toute l'Europe", priceGuarantee: 'Garantie du meilleur prix', priceGuaranteeSub: 'Engagement meilleur prix', expressCargo: 'Livraison express', expressCargoSub: 'Sous 24-48 heures' },
    explore: {
      catHeading: 'Catégories de produits', pagesHeading: 'Architecture du site',
      catSubtitle: '8 catégories · 6 300+ produits', pagesSubtitle: '14 pages · tous les points de contact',
      tabCategories: 'Catégories', tabPages: 'Pages',
      cat1: 'Équipements de cuisson', cat1Sub: 'Cuisinière, Four, Grill, Friteuse, Four à pizza',
      cat2: 'Réfrigération & Congélation', cat2Sub: 'Réfrigérateur, Congélateur, Saladette, Cellule de refroidissement',
      cat3: 'Lavage & Hygiène', cat3Sub: 'Lave-vaisselle, Lave-verres, Lavabo',
      cat4: 'Préparation & Découpe', cat4Sub: 'Coupe-légumes, Hachoir, Trancheuse',
      cat5: 'Mobilier & Inox', cat5Sub: 'Plan de travail, Étagère, Chariots, Évier, Hotte',
      cat6: 'Boissons & Bar', cat6Sub: 'Espresso, Blender, Presse-agrumes, Bar',
      cat7: 'Service & Présentation', cat7Sub: 'Assiettes, Verres, Chariot de service, Chafing',
      cat8: 'Emballage & Livraison', cat8Sub: 'Sous vide, Film, Sac de livraison',
      tagCritical: 'CRITIQUE', tagImportant: 'IMPORTANT', tagDifferentiator: 'DIFFÉRENCIATEUR',
      page: { home: 'Accueil', homeDesc: 'Hero, catégories, recommandations', catList: 'Liste de catégories', catListDesc: 'Filtrage, tri, grille/liste', prodDetail: 'Détail produit', prodDetailDesc: 'Galerie, spec, prix, stock', cart: 'Panier', cartDesc: 'Slide-over + pleine page, résumé', payment: 'Paiement', paymentDesc: '3 étapes: info → livraison → paiement', search: 'Résultats de recherche', searchDesc: 'Suggestions instantanées, filtres', account: 'Compte utilisateur', accountDesc: 'Commandes, adresse, favoris', b2b: 'Portail B2B', b2bDesc: 'Prix en gros, devis, factures', blog: 'Blog / Guide', blogDesc: 'Contenu SEO, guides', compare: 'Comparaison', compareDesc: '2–4 produits côte à côte', planner: 'Planificateur cuisine', plannerDesc: 'Planification IA des équipements' }
    },
    quickLinks: { heading: 'Aide & Contact', contact: 'Contact', contactDesc: 'Formulaire, carte, téléphone, WhatsApp', about: 'À propos', aboutDesc: 'Histoire, valeurs, équipe', faq: 'FAQ / Aide', faqDesc: 'Questions fréquentes, livraison, retours', tagStandard: 'STANDARD' },
    nav: { home: 'Accueil', contact: 'Contact', loginRegister: 'Connexion / Inscription' }
  },
  nav: { admin: 'Admin', search: 'Rechercher...', brand: 'Identité de marque', adminOrders: 'Commandes', adminUsers: 'Utilisateurs' }
};

// Process each language file
const langs = { tr, en, de, fr };

// For languages without specific translations, use EN as fallback
const otherLangs = ['nl', 'it', 'es', 'pt', 'pl', 'cs', 'ro', 'el', 'sv', 'da', 'hu'];

for (const [lang, newData] of Object.entries(langs)) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  deepMerge(existing, newData);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
  console.log(`Updated ${lang}.json`);
}

// For other languages, use English translations as base
for (const lang of otherLangs) {
  const filePath = path.join(i18nDir, `${lang}.json`);
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  deepMerge(existing, en);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
  console.log(`Updated ${lang}.json (EN fallback)`);
}

console.log('Done!');
