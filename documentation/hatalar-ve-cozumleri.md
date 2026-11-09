# Hatalar ve Çözümleri



### Frontend

<table data-search="false"><thead><tr><th width="223.5999755859375">Hata / Belirti</th><th width="238">Neden</th><th>Çözüm</th></tr></thead><tbody><tr><td><code>NG8002: Can't bind to 'ngModel'</code></td><td><code>FormsModule</code> bileşene eklenmemişti</td><td><code>imports: [FormsModule]</code></td></tr><tr><td><code>TS2339: Property '...' does not exist</code></td><td>Şablonda veya kodda tanımlanmamış bir değişken kullanıldı</td><td>Değişkeni sınıfta tanımlamak veya adını düzeltmek</td></tr><tr><td><code>NG5002</code></td><td>İçi boş bir <code>(click)=""</code> bağlaması yazıldı</td><td>Çağrılacak metodu yazmak veya bağlamayı kaldırmak</td></tr><tr><td><code>ng-model</code> çalışmıyor</td><td>AngularJS yazımı kullanıldı</td><td>Angular yazımı: <code>[(ngModel)]</code></td></tr><tr><td>Giriş kutusu genişliği ayarlanamadı</td><td>Genişlik <code>padding-right</code> ile verilmeye çalışıldı</td><td>Genişlik için <code>width</code>, iç boşluk için <code>padding</code></td></tr><tr><td>Google Fonts yüklenmiyor</td><td>Bağlantıdaki <code>&#x3C;uniquifier></code> yer tutucuları değiştirilmemişti</td><td>Google Fonts'un verdiği hazır bağlantıyı kullanmak</td></tr></tbody></table>

### Veritabanı ve Kurulum

<table data-search="false"><thead><tr><th width="219.60003662109375">Hata / Belirti</th><th width="210.7999267578125">Neden</th><th>Çözüm</th></tr></thead><tbody><tr><td><code>The term 'psql' is not recognized</code></td><td>PostgreSQL bilgisayara kurulu değil, Docker'da çalışıyor</td><td><code>docker exec -it shoppinglist_postgres psql ...</code></td></tr><tr><td>VS Code eklentisi: <code>Couldn't reach 'localhost' within 15 seconds</code></td><td>Windows <code>localhost</code> adını IPv6'ya çözümleyebiliyor; port alanı <code>Advanced</code> altında</td><td>Sunucu adı <code>127.0.0.1</code>, port <code>5433</code></td></tr><tr><td><code>could not create unique index ... is duplicated</code></td><td>Tabloda yeni indeksle çakışan kayıtlar vardı</td><td>Önce <code>DELETE FROM products;</code>, sonra indeks</td></tr><tr><td><code>relation "products" already exists</code></td><td><code>CREATE TABLE</code> yeniden çalıştırıldı</td><td>Tablo zaten var; komut tekrar çalıştırılmaz</td></tr></tbody></table>

### Backend

<table data-search="false"><thead><tr><th width="197.20001220703125">Hata / Belirti</th><th width="233.99993896484375">Neden</th><th>Çözüm</th></tr></thead><tbody><tr><td>Türkçe karakterler bozuk (<code>Ã§alÄ±ÅŸÄ±yor</code>)</td><td>Yanıtın karakter kodlaması bildirilmedi</td><td><code>Content-Type: application/json; charset=utf-8</code></td></tr><tr><td><code>Identifier 'pool' has already been declared</code></td><td><code>import {pool} from 'pg'</code> ile alttaki <code>const pool</code> çakıştı</td><td>Sınıf adı büyük harfle: <code>import {Pool} from 'pg'</code></td></tr></tbody></table>

### Angular'ın Backend'e Bağlanması

<table><thead><tr><th width="250">Hata / Belirti</th><th width="194.8001708984375">Neden</th><th>Çözüm</th></tr></thead><tbody><tr><td><code>ng generate service</code> → <code>A collection and schematic is required</code></td><td>Servis adı komutta verilmedi</td><td><code>ng generate service services/product-api</code></td></tr><tr><td><code>A merge conflicted on path ".../product-api.spec.ts"</code></td><td>Dosyalar önceki denemede zaten oluşmuştu</td><td>Komutu tekrarlamadan mevcut dosyayı düzenlemek</td></tr><tr><td><code>Property 'api' does not exist on type 'App'</code> ve <code>'unknown'</code> tip hataları</td><td><code>private api = inject(ProductApi);</code> satırı eksikti</td><td>Satırı değişkenlerin arasına eklemek</td></tr></tbody></table>
