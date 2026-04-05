import{c as m,u as k,r as u,f as p,R as x,g as y,j as e}from"./index-CFA2fXQR.js";import{C as f}from"./chevron-right-t4-3sK4K.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["path",{d:"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",key:"k3hazp"}]],g=m("book",b);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z",key:"kmsa83"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],v=m("circle-play",z),o=[{id:"getting-started",icon:g,titleKey:"docs.gettingStarted",content:`2MC Gastro platformuna hoş geldiniz! Bu kılavuz, platformun temel özelliklerini ve kullanımını anlatmaktadır.

**Hesap Oluşturma**: Kayıt sayfasından firma bilgilerinizi girerek hesabınızı oluşturun.

**İlk Proje**: Dashboard'dan "Yeni Proje" butonuna tıklayarak ilk projenizi başlatın. Proje adı, alan bilgisi ve müşteri detaylarını girin.

**Ekipman Seçimi**: Katalog sayfasından ihtiyacınız olan ekipmanları inceleyin, filtreleme ve arama özelliklerini kullanarak doğru ürünleri bulun.

**Tasarım**: Tasarım Stüdyosu'nda oda boyutlarını ayarlayın ve ekipmanları yerleştirin.

**Malzeme Listesi**: BOM sayfasından tüm malzemeleri görüntüleyin ve PDF/CSV olarak dışa aktarın.`},{id:"design",icon:p,titleKey:"docs.designGuide",content:`Tasarım Stüdyosu, mutfak planlarınızı oluşturmanız için güçlü bir araçtır.

**Oda Boyutları**: Sağ panelden uzunluk ve genişlik değerlerini metre cinsinden girin.

**Ekipman Yerleştirme**: Ekipman tepsisinden istediğiniz ekipmanı seçin ve çalışma alanına sürükleyin.

**Otomatik Hizalama**: Auto-Snap özelliği, ekipmanları otomatik olarak duvarlara ve diğer ekipmanlara hizalar.

**Kapı ve Pencere**: Oda planınıza kapı ve pencere ekleyerek gerçekçi bir düzen oluşturun.

**Enerji Hesaplama**: Platform, yerleştirdiğiniz ekipmanların toplam enerji tüketimini otomatik hesaplar.`},{id:"equipment",icon:x,titleKey:"docs.equipmentGuide",content:`Ekipman kataloğumuz, endüstriyel mutfak ekipmanlarının kapsamlı bir veritabanını içerir.

**Arama**: Üst kısımdaki arama çubuğundan model adı, ürün kodu veya açıklama ile arama yapabilirsiniz.

**Filtreleme**: Sol paneldeki filtreler ile seri (60er, 70er, 80er), ekipman türü ve güç özellikleri bazında filtreleme yapabilirsiniz.

**Teknik Detaylar**: Her ekipmanın boyutları, güç tüketimi ve teknik özellikleri detaylı olarak listelenmektedir.

**Plana Ekleme**: "Plana Ekle" butonu ile ekipmanı aktif projenize ekleyebilirsiniz.`},{id:"bom",icon:y,titleKey:"docs.bomGuide",content:`Malzeme Listesi (BOM), projeniz için gerekli tüm bileşen ve donanımları takip etmenizi sağlar.

**Görüntüleme**: BOM sayfasında tüm kalemler miktar, ürün kodu, tanım ve stok durumu ile listelenir.

**Arama/Filtreleme**: Üst kısımdaki filtre ile belirli ürün kodlarını arayabilirsiniz.

**Dışa Aktarma**: PDF ve CSV formatlarında dışa aktarım desteklenmektedir.

**Revizyon Takibi**: Onay geçmişi bölümünden proje revizyonlarını takip edebilirsiniz.`}];function N(){const{t:i}=k(),[t,d]=u.useState("getting-started"),l=o.find(a=>a.id===t);return e.jsxs("div",{className:"max-w-6xl mx-auto w-full space-y-6",children:[e.jsx("h1",{className:"font-headline text-3xl font-black text-on-surface tracking-tight",children:i("docs.title")}),e.jsxs("div",{className:"flex flex-col lg:flex-row gap-6",children:[e.jsxs("div",{className:"lg:w-72 flex lg:flex-col gap-2 overflow-x-auto",children:[o.map(a=>{const n=a.icon;return e.jsxs("button",{onClick:()=>d(a.id),className:`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${t===a.id?"bg-primary-fixed-dim/20 text-primary font-bold":"text-on-surface-variant hover:bg-surface-container-high"}`,children:[e.jsx(n,{size:18}),i(a.titleKey),t===a.id&&e.jsx(f,{size:16,className:"ml-auto hidden lg:block"})]},a.id)}),e.jsxs("button",{className:"flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high whitespace-nowrap",children:[e.jsx(v,{size:18})," ",i("docs.videoTutorials")]})]}),e.jsxs("div",{className:"flex-1 bg-surface-container-lowest rounded-xl shadow-sm p-8 border border-outline-variant/10",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[e.jsx(l.icon,{size:24,className:"text-primary"}),e.jsx("h2",{className:"font-headline font-bold text-xl text-primary",children:i(l.titleKey)})]}),e.jsx("div",{className:"prose prose-sm max-w-none",children:l.content.split(`

`).map((a,n)=>{if(a.startsWith("**")){const c=a.split("**");return e.jsx("p",{className:"text-on-surface leading-relaxed mb-4",children:c.map((r,s)=>s%2===1?e.jsx("strong",{className:"text-primary",children:r},s):r)},n)}return e.jsx("p",{className:"text-on-surface leading-relaxed mb-4",children:a},n)})})]})]})]})}export{N as default};
