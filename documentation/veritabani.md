---
description: >-
  Veriler PostgreSQL'de tek bir tabloda tutulur. Bu sayfa tablonun yapısını,
  kurallarını ve kuralların nasıl test edildiğini anlatır.
---

# 🗄️ Veritabanı(schema.sql)

Dosya: [`schema.sql`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/backend/schema.sql)

Konteynerin kurulumu için [Projeyi Oluşturma ve Çalıştırma](projeyi-olusturma-ve-calistirma.md#veritabanini-olusturma-docker) sayfasına bakabilirsiniz.

## Bağlantı

Tablo, VS Code'daki PostgreSQL eklentisiyle oluşturuldu. Bağlantı bilgileri:

<table><thead><tr><th width="200">Alan</th><th>Değer</th></tr></thead><tbody><tr><td>Server Name</td><td><code>127.0.0.1</code></td></tr><tr><td>Port (Advanced bölümünde)</td><td><code>5433</code></td></tr><tr><td>User Name</td><td><code>shopping_user</code></td></tr><tr><td>Database Name</td><td><code>shopping_list</code></td></tr><tr><td>SSL Mode</td><td><code>Disable</code></td></tr></tbody></table>

{% hint style="warning" %}
Port alanı ana formda değil, `Advanced` bölümündedir. Boş bırakılırsa varsayılan 5432 portuna, yani başka bir projenin veritabanına bağlanılır.
{% endhint %}

Doğru veritabanına bağlanıldığını kontrol etmek için:

```sql
SELECT current_database(), current_user, inet_server_port();
```

Sonuç `shopping_list | shopping_user | 5432` olmalıdır. Buradaki 5432 konteynerin iç portudur; bilgisayardan 5433 ile bağlanılır.

## Tablo

```sql
CREATE TABLE products(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL CHECK(LENGTH(TRIM(product_name)) != 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

<table><thead><tr><th width="140">Sütun</th><th width="130">Tip</th><th width="240">Kurallar</th><th>Görevi</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>UUID</code></td><td>Birincil anahtar, varsayılan <code>gen_random_uuid()</code></td><td>Ürünün kalıcı kimliği</td></tr><tr><td><code>product_name</code></td><td><code>TEXT</code></td><td>Boş olamaz, yalnızca boşluktan oluşamaz</td><td>Ürün adı</td></tr><tr><td><code>quantity</code></td><td><code>INTEGER</code></td><td>Boş olamaz, varsayılan 1, en az 1</td><td>Ürün adedi</td></tr><tr><td><code>created_at</code></td><td><code>TIMESTAMPTZ</code></td><td>Boş olamaz, varsayılan <code>NOW()</code></td><td>Listeyi ekleme sırasına göre sıralamak</td></tr></tbody></table>

* `UUID` ve `gen_random_uuid()`: Ürün eklenirken `id` verilmezse veritabanı rastgele, benzersiz bir kimlik üretir. Kimlik ürün silinse de diğer ürünlerde değişmez; adet güncelleme ve silme bu kimlikle yapılır.
* `PRIMARY KEY`: Kendiliğinden boş olamaz ve benzersizdir. Veritabanı bu sütun için arka planda bir indeks oluşturur, böylece `WHERE id = ...` aramaları hızlıdır.
* `NOT NULL` ile `CHECK` birlikte: `NOT NULL` değerin hiç olmamasını engeller. Boş metin (`''`) ve yalnızca boşluk (`'   '`) değer sayıldığı için bunları `CHECK(LENGTH(TRIM(...)) != 0)` engeller. `TRIM` boşlukları siler, `LENGTH` kalan uzunluğa bakar.
* `DEFAULT 1`: Ekleme sırasında adet hiç yazılmazsa 1 olur. API ürün eklerken adet göndermez.
* `CHECK(quantity >= 1)`: Sıfır ve negatif adetleri reddeder.
* `TIMESTAMPTZ`: Zamanı saat dilimi bilgisiyle saklar. UUID rastgele olduğu için ekleme sırasını taşımaz; liste bu sütuna göre sıralanır (`ORDER BY created_at`). Bu sütun API'den gönderilmez.

Frontend'deki `selected` alanı yalnızca ekranın o anki durumu olduğu için tabloya eklenmedi.

## Benzersiz indeks

```sql
CREATE UNIQUE INDEX product_name_unique ON products (LOWER(product_name COLLATE "tr-TR-x-icu"));
```

Aynı ürünün büyük-küçük harf farkıyla ("Elma" / "elma") tekrar eklenmesini engeller.

* `UNIQUE INDEX`: Verilen ifadenin değerlerinin tabloda tekrar etmesini yasaklar.
* `LOWER(...)`: Karşılaştırma adın küçük harfli hali üzerinden yapılır. Tabloda ad yine kullanıcının yazdığı gibi ("Elma") saklanır.
* `COLLATE "tr-TR-x-icu"`: Küçük harfe çevirirken Türkçe kuralları kullanır (`I → ı`, `İ → i`). Frontend'deki `toLocaleLowerCase('tr')` ile aynı karşılaştırmayı yapar.

Bu kural neden sütuna yazılan `UNIQUE` veya `CHECK` ile yapılmadı?

* Sütundaki düz `UNIQUE`, değerleri olduğu gibi karşılaştırır ve büyük-küçük harfe duyarlıdır.
* `CHECK` yalnızca eklenen satırın kendi değerine bakar, diğer satırları göremez.
* İfade üzerinde (burada `LOWER(...)`) benzersizlik yalnızca indeksle kurulabilir.

Kural frontend'de de (`findProduct()`) kontrol edilir. Veritabanında ayrıca korunmasının nedeni, frontend dışından gelen istekleri (örneğin doğrudan API'ye yapılan bir istek veya başka bir sekmede eklenmiş ürün) de yakalamaktır. Çakışmada PostgreSQL `23505` koduyla hata verir, API bunu `409` yanıtına çevirir.

## Testler

Kurallar, `backend/test.sql` dosyasında yazılan `INSERT` komutlarıyla denendi. Dosya, satırlar tek tek seçilerek çalıştırıldı.

```sql
INSERT INTO products (product_name) VALUES ('Elma');
INSERT INTO products (product_name) VALUES ('elma');
INSERT INTO products (product_name) VALUES ('   ');
INSERT INTO products (product_name, quantity) VALUES ('Armut', 0);
INSERT INTO products (product_name) VALUES ('Irmak');
INSERT INTO products (product_name) VALUES ('ırmak');
INSERT INTO products (product_name) VALUES ('İncir');
INSERT INTO products (product_name) VALUES ('incir');
SELECT * FROM products;
```

<table><thead><tr><th width="190">Deneme</th><th width="190">Beklenen</th><th>Sonuç</th></tr></thead><tbody><tr><td><code>Elma</code></td><td>Eklenir</td><td>Eklendi, adet otomatik 1</td></tr><tr><td><code>elma</code></td><td>Reddedilir</td><td>Reddedildi (benzersiz indeks)</td></tr><tr><td>Yalnızca boşluk</td><td>Reddedilir</td><td>Reddedildi (<code>CHECK</code>)</td></tr><tr><td><code>Armut</code>, adet 0</td><td>Reddedilir</td><td>Reddedildi (<code>CHECK</code>)</td></tr><tr><td><code>İncir</code> / <code>incir</code></td><td>İkincisi reddedilir</td><td>Reddedildi</td></tr><tr><td><code>Irmak</code> / <code>ırmak</code></td><td>İkincisi reddedilir</td><td>İlk indeksle ikisi de eklendi</td></tr></tbody></table>

İndeks ilk olarak `COLLATE` olmadan oluşturulmuştu. `LOWER('Irmak')` sonucu `irmak` olduğu için `ırmak` farklı bir ürün sayıldı. İndeks, Türkçe kurallarla yeniden oluşturuldu:

```sql
SELECT collname FROM pg_collation WHERE collname ILIKE 'tr%';
DELETE FROM products;
DROP INDEX product_name_unique;
CREATE UNIQUE INDEX product_name_unique ON products (LOWER(product_name COLLATE "tr-TR-x-icu"));
```

* İlk sorgu, veritabanının bildiği Türkçe karşılaştırma kurallarını listeler; listede `tr-TR-x-icu` olmalıdır.
* `DELETE FROM products` tablodaki satırları siler, tablonun yapısını korur. Tabloda `Irmak` ve `ırmak` varken yeni indeks oluşturulamayacağı için önce veriler silindi.
* İndeksin ifadesini değiştiren bir komut olmadığı için indeks `DROP INDEX` ile silinip yeniden oluşturuldu.

Yeni testte `ırmak` ve `incir` reddedildi, ardından test verileri `DELETE FROM products;` ile temizlendi.

{% hint style="info" %}
`schema.sql` dosyası tablonun nasıl kurulduğunu Git'te saklamak için durur; uygulama bu dosyayı çalıştırmaz. Tablo zaten varken yeniden çalıştırılırsa `relation "products" already exists` hatası verir. `test.sql` ise deneme komutları içerdiği için `.gitignore` ile Git dışında tutulur.
{% endhint %}
