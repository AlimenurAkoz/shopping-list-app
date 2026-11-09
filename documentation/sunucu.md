---
description: >-
  server.js gelen her HTTP isteğini karşılar, ortak başlıkları ekler ve isteği
  yöntemine ve adresine göre doğru servise yönlendirir.
---

# Sunucu(server.js)

Dosya: [`server.js`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/backend/server.js)

Sunucu Express kullanılmadan, Node.js'in yerleşik `node:http` modülüyle yazıldı. Express'in hazır yaptığı üç iş (adresleri ayırma, gelen JSON'u okuma, CORS) bu yüzden elle yapılır.

## İçe aktarmalar

* `import "dotenv/config"`: Bir değer almaz, yalnızca modülü çalıştırır. Bu modül `.env` dosyasını okuyup değerleri `process.env` içine yazar.
* `node:http`: `node:` öneki, bunun npm paketi değil Node.js'in yerleşik modülü olduğunu belirtir.
* Yerel dosyalar uzantısıyla yazılır (`./products.js`). `package.json` içindeki `"type": "module"` ayarında uzantı yazılmazsa `ERR_MODULE_NOT_FOUND` hatası alınır.

## Sunucunun oluşturulması

* `createServer()` içindeki fonksiyon, sunucu başlarken değil, her istek geldiğinde çalışır.
* `req` (request) gelen isteği temsil eder: yöntemi `req.method`, adresi `req.url` içindedir.
* `res` (response) gönderilecek yanıttır: durum kodu `res.statusCode`, başlıklar `res.setHeader()`, gövde `res.end()` ile verilir.
* Fonksiyon `async` tanımlanır, çünkü servisler veritabanının yanıtını beklediği için `await` ile çağrılır.
* `server.listen()` sunucuyu `.env` dosyasındaki portta (3000) başlatır. `createServer` bloğunun dışında olduğu için yalnızca bir kez çalışır. İçindeki fonksiyon port dinlenmeye başlayınca terminale "Çalıştı" yazar.

## Ortak başlıklar

```javascript
const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    ...
}
```

Başlıklar yönlendirmeden önce yazıldığı için hata yanıtları dahil her yanıtta bulunur.

<table><thead><tr><th width="280">Başlık</th><th>Görevi</th></tr></thead><tbody><tr><td><code>Content-Type</code></td><td>Yanıtın JSON olduğunu ve UTF-8 ile kodlandığını bildirir. <code>charset=utf-8</code> olmadan Türkçe karakterler bozuk görünür</td></tr><tr><td><code>Access-Control-Allow-Origin</code></td><td>Yanıtları okumasına izin verilen adres: Angular uygulaması</td></tr><tr><td><code>Access-Control-Allow-Methods</code></td><td>İzin verilen HTTP yöntemleri</td></tr><tr><td><code>Access-Control-Allow-Headers</code></td><td>İstekte gönderilmesine izin verilen başlıklar, JSON göndermek için <code>Content-Type</code> gerekir</td></tr></tbody></table>

### CORS

Tarayıcılar, bir sayfanın başka bir origine gönderdiği isteklerin yanıtını, karşı taraf izin vermedikçe sayfaya vermez. Origin; şema, adres ve porttan oluşur.&#x20;

Sunucu, `Access-Control-Allow-*` başlıklarıyla izin verir.

Tarayıcı bazı isteklerden önce, asıl isteği göndermeden izin sormak için bir `OPTIONS` isteği gönderir (preflight). `PATCH` ve `DELETE` istekleri ile JSON gövdeli `POST` istekleri bu gruptadır.

```js
if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
}
```

İzin bilgileri zaten yukarıdaki başlıklarda olduğu için gövdesiz bir `204` yanıtı yeterlidir. Adrese bakılmadığı için tüm adreslerin ön isteğini bu blok karşılar.

{% hint style="info" %}
CORS bir tarayıcı kuralıdır. PowerShell gibi tarayıcı dışı araçlardan gönderilen istekler bu başlıklara bakmaz.
{% endhint %}

## Yönlendirme

REST yaklaşımında adres kaynağı (ürünler), yöntem ise ne yapılacağını belirtir. Bu yüzden aynı `/api/products` adresi `GET` ile listeyi döndürür, `POST` ile ürün ekler.

<table><thead><tr><th width="84.79998779296875">Yöntem</th><th width="182">Adres</th><th width="162.800048828125">Servis</th><th>Adres kontrolü</th></tr></thead><tbody><tr><td><code>GET</code></td><td><code>/api/products</code></td><td><code>getProducts</code></td><td>Tam eşitlik (<code>===</code>)</td></tr><tr><td><code>POST</code></td><td><code>/api/products</code></td><td><code>createProduct</code></td><td>Tam eşitlik (<code>===</code>)</td></tr><tr><td><code>PATCH</code></td><td><code>/api/products/{id}</code></td><td><code>updateProduct</code></td><td><code>startsWith</code></td></tr><tr><td><code>DELETE</code></td><td><code>/api/products/{id}</code></td><td><code>deleteProduct</code></td><td><code>startsWith</code></td></tr></tbody></table>

* Tek bir ürünün adresi değişkendir (`/api/products/1d595004-...`), bu yüzden o ürüne erişebilmek için tam eşitlik yerine `startsWith('/api/products/')` ile adresin başı kontrol edilir.&#x20;
* `id` servise üçüncü parametre olarak verilir, servis adres ayrıştırmasıyla uğraşmaz.
* Yanıtı servis gönderir, `server.js` yalnızca yönlendirir. `await` ile servisin bitmesi beklenir.
* Her bloğun sonundaki `return`, fonksiyonu bitirerek alttaki blokların ve en sondaki `404` kodunun çalışmasını engeller. `return` olmasaydı başarılı bir yanıttan sonra kod `404` satırına da iner ve aynı isteğe ikinci kez yanıt göndermeye çalışırdı.
* Hiçbir blok eşleşmezse kod en alta iner ve `404` döner.

## Çalıştırma

```bash
cd backend
npm run dev
```

`npm run dev`, `package.json` içindeki `"dev": "nodemon server.js"` komutunu çalıştırır.&#x20;

`nodemon` klasördeki `.js` dosyalarını izler ve bir dosya kaydedildiğinde sunucuyu yeniden başlatır.
