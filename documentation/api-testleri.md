---
description: >-
  API, Angular'a bağlanmadan önce her servis yazıldıkça PowerShell'den
  gönderilen isteklerle test edildi.
---

# 🧪 API Testleri

Tarayıcının adres çubuğu yalnızca `GET` isteği gönderebildiği için diğer yöntemler PowerShell ile denendi. Testler sırasında `backend` klasöründe `npm run dev` ayrı bir terminalde açık olmalıdır.

{% hint style="info" %}
PowerShell'den gönderilen istekler tarayıcıdan geçmez. Bu yüzden F12 → Network sekmesinde görünmez ve CORS kurallarına takılmaz.
{% endhint %}

## Read

Tarayıcıda `http://localhost:3000/api/products` adresi açılır:

```json
[{"id":"4940774e-948f-49ef-a9f2-82ebf48bb5fa","productName":"Elma","quantity":3}]
```

Tablo boşsa sonuç `[]` olur. Test için `test.sql` dosyasında bir ürün eklenebilir:

```sql
INSERT INTO products (product_name, quantity) VALUES ('Elma', 3);
```

## Create

```bash
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -ContentType "application/json; charset=utf-8" -Body '{"productName":"Armut"}'
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -ContentType "application/json; charset=utf-8" -Body '{"productName":"armut"}'
Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -ContentType "application/json; charset=utf-8" -Body '{"productName":"   "}'
```

<table><thead><tr><th width="190">Gövde</th><th>Beklenen sonuç</th></tr></thead><tbody><tr><td><code>Armut</code></td><td>Eklenen ürün, <code>quantity: 1</code></td></tr><tr><td><code>armut</code></td><td><code>{"error":"Bu ürün zaten var"}</code> (409)</td></tr><tr><td>Yalnızca boşluk</td><td><code>{"error":"Ürün adı boş olamaz"}</code> (400)</td></tr></tbody></table>

* `Invoke-RestMethod`: PowerShell'in HTTP isteği gönderen komutu. Yanıt JSON ise nesneye çevirip gösterir.
* `-ContentType`: Gövdenin JSON olduğunu belirtir. Backend gövdeyi `JSON.parse` ile okur.
* `-Body`: Gönderilen gövde. Tek tırnak, içindeki çift tırnakların bozulmamasını sağlar.

Windows PowerShell, hata yanıtlarında yalnızca gövdeyi kırmızı hata olarak gösterir, durum kodunu yazmaz. Durum kodunu görmek için komut `try`/`catch` içine alınır:

```bash
try { Invoke-RestMethod -Uri http://localhost:3000/api/products -Method Post -ContentType "application/json; charset=utf-8" -Body '{"productName":"armut"}' } catch { $_.Exception.Response.StatusCode.value__ }
```

## Update

`ID` yerine Read sonucundaki bir ürünün `id` değeri yazılır:

```bash
Invoke-RestMethod -Uri http://localhost:3000/api/products/ID -Method Patch -ContentType "application/json" -Body '{"quantity":4}'
try { Invoke-RestMethod -Uri http://localhost:3000/api/products/ID -Method Patch -ContentType "application/json" -Body '{"quantity":0}' } catch { $_.Exception.Response.StatusCode.value__ }
try { Invoke-RestMethod -Uri http://localhost:3000/api/products/yanlis-id -Method Patch -ContentType "application/json" -Body '{"quantity":2}' } catch { $_.Exception.Response.StatusCode.value__ }
```

<table><thead><tr><th width="190">Test</th><th>Beklenen sonuç</th></tr></thead><tbody><tr><td>Adet 4</td><td>Güncellenen ürün, <code>quantity: 4</code></td></tr><tr><td>Adet 0</td><td><code>400</code></td></tr><tr><td>Yanlış id</td><td><code>404</code></td></tr></tbody></table>

## Delete

`204` yanıtında gövde olmadığı için `Invoke-RestMethod` hiçbir şey yazmaz. Durum kodunu görmek için `Invoke-WebRequest` kullanılır:

```bash
(Invoke-WebRequest -Uri http://localhost:3000/api/products/ID -Method Delete -UseBasicParsing).StatusCode
try { Invoke-WebRequest -Uri http://localhost:3000/api/products/ID -Method Delete -UseBasicParsing } catch { $_.Exception.Response.StatusCode.value__ }
try { Invoke-WebRequest -Uri http://localhost:3000/api/products/yanlis-id -Method Delete -UseBasicParsing } catch { $_.Exception.Response.StatusCode.value__ }
```

<table><thead><tr><th width="190">Test</th><th>Beklenen sonuç</th></tr></thead><tbody><tr><td>Var olan id</td><td><code>204</code></td></tr><tr><td>Aynı id tekrar</td><td><code>404</code></td></tr><tr><td>Yanlış id</td><td><code>404</code></td></tr></tbody></table>

## Arayüz testi

Angular bağlandıktan sonra uygulama `http://localhost:4200` adresinde denendi. Her işlemden sonra sayfa yenilendi; değişikliklerin kalması, verinin veritabanına yazıldığını gösterir.

<table><thead><tr><th width="270">İşlem</th><th>Beklenen</th></tr></thead><tbody><tr><td>Ürün ekleme</td><td>Listeye eklenir, sayfa yenilenince kalır</td></tr><tr><td>Aynı ürünü farklı harfle ekleme</td><td>"Artıralım / Yeterli" penceresi</td></tr><tr><td>"+" / "−"</td><td>Adet değişir, 1'in altına inmez</td></tr><tr><td>Çöp kutusu</td><td>Ürün silinir</td></tr><tr><td>Seç → Seçilenleri Sil</td><td>Yalnızca seçilenler silinir</td></tr><tr><td>Listeyi Temizle</td><td>Liste boşalır, "Eksik Yok" görünür</td></tr><tr><td>API kapalıyken sayfayı açma</td><td>"Ürünler yüklenemedi." bildirimi</td></tr></tbody></table>

Tarayıcıda F12 → Network → Fetch/XHR filtresinde `products` istekleri ve durum kodları görülebilir.
