---
description: >-
  Bu sayfa, hangi dosyanın nerede durduğunu ve ne işe yaradığını gösterir.
  Sonraki sayfalarda bir dosyadan söz edildiğinde yerini bu sayfadan
  bulabilirsiniz.
---

# 🧩 Proje Yapısı ve Dosya Haritası

## Klasör yapısı

Repo üç ana klasörden oluşur. `frontend` ve `backend` birbirinden bağımsız iki ayrı Node.js projesidir; her birinin kendi `package.json` dosyası ve `node_modules` klasörü vardır. İkisi birbirini `import` etmez, yalnızca HTTP üzerinden konuşur.

```
shopping-list-app/
├── frontend/                     → Angular uygulaması
│   ├── public/
│   │   ├── background.png        → sayfa arka plan görseli
│   │   ├── basket.png            → boş liste görseli
│   │   └── favicon.ico           → sekme simgesi
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/
│   │   │   │   └── product.ts    → Product arayüzü (veri modeli)
│   │   │   ├── services/
│   │   │   │   ├── product-api.ts      → backend'e HTTP isteği gönderen servis
│   │   │   │   └── product-api.spec.ts → servisin test dosyası
│   │   │   ├── app.ts            → bileşen mantığı: değişkenler ve metotlar
│   │   │   ├── app.html          → arayüz şablonu
│   │   │   ├── app.css           → bileşene ait stiller
│   │   │   ├── app.config.ts     → uygulama ayarları (HttpClient burada eklenir)
│   │   │   ├── app.routes.ts     → sayfa yönlendirme tanımları (boş)
│   │   │   └── app.spec.ts       → birim test dosyası
│   │   ├── index.html            → ana sayfa: font bağlantıları, sayfa dili, sekme başlığı
│   │   ├── main.ts               → uygulamanın başlangıç noktası
│   │   └── styles.css            → tüm sayfaya uygulanan genel stiller
│   ├── angular.json, package.json, tsconfig*.json
│   └── .gitignore                → Angular'ın yok sayılan dosyaları
├── backend/                      → Node.js API'si
│   ├── server.js                 → HTTP sunucusu, CORS, yönlendirme
│   ├── db.js                     → PostgreSQL bağlantı havuzu
│   ├── products.js               → 4 CRUD servisi
│   ├── schema.sql                → tablo ve indeks tanımı
│   ├── package.json              → backend ayarları ve paketleri
│   ├── .env                      → bağlantı bilgileri (Git'te yok)
│   └── .gitignore                → node_modules ve .env
├── documentation/                → GitBook dokümantasyonu
├── .gitignore                    → test.sql, VS Code ve sistem dosyaları
└── README.md
```

Geliştirmenin büyük kısmı `frontend/src/app` ve `backend` klasörlerinde yapılır; diğer dosyaların çoğu Angular veya npm tarafından otomatik oluşturulur ve genellikle değiştirilmez.

## Dosyaların görevleri <a href="#dosyalarin-gorevleri" id="dosyalarin-gorevleri"></a>

#### Frontend

<table data-header-hidden data-search="false"><thead><tr><th width="191.19998168945312"></th><th></th></tr></thead><tbody><tr><td>Dosya</td><td>Görevi</td></tr><tr><td><code>models/product.ts</code></td><td>Bir ürünün hangi alanlardan oluştuğunu tarif eder. Kod çalıştırmaz, yalnızca şablon sağlar</td></tr><tr><td><code>services/product-api.ts</code></td><td>Backend'deki 4 servise istek gönderen fonksiyonları içerir. Bileşen HTTP ayrıntılarını bilmez, bu servisi çağırır</td></tr><tr><td><code>app.ts</code></td><td>Ürün dizisini ve mod değişkenlerini, tüm işlemleri (ekleme, silme, arama, adet değiştirme) içerir. Veri işlemleri için servisi çağırır</td></tr><tr><td><code>app.html</code></td><td>Başlık, form, arama kutusu, tablo, alt bar ve boş durum ekranlarını içerir</td></tr><tr><td><code>app.css</code></td><td>Kart, form, tablo, butonlar ve kaydırma alanı stilleri. Yalnızca bu bileşeni etkiler</td></tr><tr><td><code>app.config.ts</code></td><td>Uygulama genelinde kullanılacak özellikleri kaydeder; <code>provideHttpClient()</code> burada</td></tr><tr><td><code>styles.css</code></td><td><code>body</code>'nin arka planı, genel yazı tipi ve kenar boşlukları</td></tr><tr><td><code>index.html</code></td><td>Google Fonts satırları, sayfa dili ve sekme başlığı</td></tr><tr><td><code>public/</code></td><td>Statik dosyalar. Buradaki dosyalara şablonda doğrudan adıyla ulaşılır(<code>src="basket.png"</code> gibi)</td></tr></tbody></table>

#### Backend

<table data-header-hidden data-search="false"><thead><tr><th width="191.19998168945312"></th><th></th></tr></thead><tbody><tr><td>Dosya</td><td>Görevi</td></tr><tr><td><code>server.js</code></td><td>Her HTTP isteğini karşılar, CORS başlıklarını ekler, isteği yöntem ve adrese göre doğru servise yönlendirir</td></tr><tr><td><code>db.js</code></td><td><code>.env</code> değerleriyle PostgreSQL bağlantı havuzunu oluşturur ve dışa aktarır</td></tr><tr><td><code>products.js</code></td><td>İstek gövdesini okuyan yardımcı fonksiyon ve 4 servis: listeleme, ekleme, adet güncelleme, silme</td></tr><tr><td><code>schema.sql</code></td><td>Tablonun nasıl kurulduğunu belgeler. Uygulama bu dosyayı çalıştırmaz</td></tr><tr><td><code>.env</code></td><td>Port ve veritabanı bağlantı bilgileri. Şifre içerdiği için Git'e gönderilmez</td></tr><tr><td><code>package.json</code></td><td><code>"type": "module"</code> ayarı, <code>npm run dev</code> komutu ve paket listesi</td></tr></tbody></table>

{% hint style="info" %}
Deneme sorguları için kullanılan `backend/test.sql` dosyası kökteki `.gitignore` tarafından yok sayılır ve GitHub'da bulunmaz.
{% endhint %}

## Dosyalar arası iletişim

Bir işlem, örneğin bir ürünün "+" butonuna basılması, sırasıyla şu dosyalardan geçer:

```
app.html     (click)="increase(product)"
   │
app.ts       increase() → changeQuantity() → this.api.updateProduct(id, 4)
   │
product-api.ts   PATCH http://localhost:3000/api/products/{id}   gövde: {"quantity":4}
   │
server.js    yöntem ve adrese bakar, adresten id'yi ayırır → updateProduct(req, res, id)
   │
products.js  gövdeyi okur ve doğrular → UPDATE sorgusu
   │
db.js        bağlantı havuzu sorguyu PostgreSQL'e iletir
   │
PostgreSQL   kuralları kontrol eder, satırı günceller ve geri döndürür
```

Yanıt aynı yoldan geri döner: `products.js` güncellenen ürünü JSON olarak gönderir, `app.ts` yeni adedi ekrana yazar.

<table><thead><tr><th width="110">İşlem</th><th width="170">app.ts</th><th width="230">İstek</th><th width="140">products.js</th><th>SQL</th></tr></thead><tbody><tr><td>Listeleme</td><td><code>loadProducts()</code></td><td><code>GET /api/products</code></td><td><code>getProducts</code></td><td><code>SELECT</code></td></tr><tr><td>Ekleme</td><td><code>add()</code></td><td><code>POST /api/products</code></td><td><code>createProduct</code></td><td><code>INSERT</code></td></tr><tr><td>Adet</td><td><code>changeQuantity()</code></td><td><code>PATCH /api/products/{id}</code></td><td><code>updateProduct</code></td><td><code>UPDATE</code></td></tr><tr><td>Silme</td><td><code>delete()</code>, <code>clearList()</code></td><td><code>DELETE /api/products/{id}</code></td><td><code>deleteProduct</code></td><td><code>DELETE</code></td></tr></tbody></table>

İki taraf arasındaki ortak dil alan adlarıdır: backend `productName` ve `quantity` adlarıyla veri gönderir, frontend'deki `Product` arayüzü aynı adları bekler.
