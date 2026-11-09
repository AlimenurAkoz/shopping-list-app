---
description: >-
  products.js, istek gövdesini okuyan bir yardımcı fonksiyon ile API'nin dört
  servisini içerir. Her servis SQL sorgusunu çalıştırır ve yanıtı kendisi gönderir.
---

# 📡 CRUD Servisleri(products.js)

Dosya: [`products.js`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/backend/products.js)

<table><thead><tr><th width="110">İşlem</th><th width="230">İstek</th><th width="170">Fonksiyon</th><th width="120">Başarılı</th><th>Hata</th></tr></thead><tbody><tr><td>Read</td><td><code>GET /api/products</code></td><td><code>getProducts</code></td><td>200 + dizi</td><td>500</td></tr><tr><td>Create</td><td><code>POST /api/products</code></td><td><code>createProduct</code></td><td>201 + ürün</td><td>400, 409, 500</td></tr><tr><td>Update</td><td><code>PATCH /api/products/{id}</code></td><td><code>updateProduct</code></td><td>200 + ürün</td><td>400, 404, 500</td></tr><tr><td>Delete</td><td><code>DELETE /api/products/{id}</code></td><td><code>deleteProduct</code></td><td>204</td><td>404, 500</td></tr></tbody></table>

Dört servis aynı yapıyı izler:

```
try {
    (gerekirse) gövdeyi oku ve doğrula   → hatalıysa 400
    parametreli SQL sorgusunu çalıştır
    (gerekirse) etkilenen satır yoksa     → 404
    başarı kodu + JSON
} catch (error) {
    bilinen hata kodları                  → 400 / 404 / 409
    bilinmeyen hata                       → terminale yaz + 500
}
```

Tüm hata yanıtları aynı biçimdedir: `{ "error": "mesaj" }`. Böylece frontend hata mesajını tek bir alandan okuyabilir.

```js
import pool from './db.js';
```

Bağlantı havuzu `db.js` dosyasından alınır. `export default` ile dışa aktarıldığı için süslü parantez kullanılmaz.

## Gövdeyi okuma(readBody)

```js
async function readBody(req) {
    let text = '';
    for await (const part of req) {
        text += part;
    }
    return text ? JSON.parse(text) : {};
}
```

`node:http`, istek gövdesini hazır vermez. Gövde, ağdan parçalar halinde gelen bir akıştır (stream).

* `for await (const part of req)`: Her parça geldiğinde döngü bir tur döner ve sonraki parçayı bekler. Gövde bitince döngü biter.
* `text += part`: Gelen parça metne eklenir.
* `text ? JSON.parse(text) : {}`: Gövde boşsa `JSON.parse('')` hata vereceği için boş nesne döner. Gövde bozuk JSON ise `JSON.parse` bir `SyntaxError` oluşturur; servislerdeki `catch` bunu `400` yanıtına çevirir.
* Yalnızca bu dosyada kullanıldığı için `export` edilmez.

## Read(getProducts)

```js
export async function getProducts(req, res) {
    try {
        const result = await pool.query(
            'SELECT id, product_name AS "productName", quantity FROM products ORDER BY created_at'
        );
        res.statusCode = 200;
        res.end(JSON.stringify(result.rows));
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Ürünler yüklenemedi' }));
    }
}
```

* `export`: Fonksiyonun `server.js` tarafından içe aktarılabilmesini sağlar.
* `pool.query()` bir `Promise` döndürür, `await` sorgunun sonucunu bekler.
* `AS "productName"`: `product_name` sütununu Angular'ın beklediği adla döndürür. Çift tırnak olmadan PostgreSQL adı küçük harfe çevirir ve `productname` olur.
* `ORDER BY created_at`: Sıralama verilmezse PostgreSQL satırları belirli bir sırada döndürmeyi garanti etmez; adet güncellendikten sonra liste karışabilir.
* `result.rows`: Her satırın bir nesne olduğu dizidir. `res.end()` yalnızca metin kabul ettiği için `JSON.stringify()` ile metne çevrilir.
* Veritabanı kapalıysa (`ECONNREFUSED`) `catch` bloğuna geçilir. Hatanın ayrıntısı terminale yazılır, istemciye yalnızca genel mesaj gider.

## Create(createProduct)

```js
export async function createProduct(req, res) {
    try {
        const body = await readBody(req);
        const productName = typeof body.productName === 'string' ? body.productName.trim() : '';
        if (productName === '') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Ürün adı boş olamaz' }));
            return;
        }
        const result = await pool.query(
            'INSERT INTO products (product_name) VALUES ($1) RETURNING id, product_name AS "productName", quantity',
            [productName]
        );
        res.statusCode = 201;
        res.end(JSON.stringify(result.rows[0]));
    } catch (error) {
        if (error.code === '23505') {
            res.statusCode = 409;
            res.end(JSON.stringify({ error: 'Bu ürün zaten var' }));
            return;
        }
        if (error instanceof SyntaxError) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Geçersiz JSON' }));
            return;
        }
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Ürün eklenemedi' }));
    }
}
```

* `typeof body.productName === 'string'`: Ad metin değilse (hiç gönderilmemiş, sayı veya `null`) `.trim()` hata vereceği için boş metin kabul edilir. Böylece tüm geçersiz durumlar tek bir kontrolle yakalanır.
* Boş ad, veritabanına gitmeden `400` ile reddedilir. Veritabanındaki `CHECK` kuralı da aynı şeyi yapardı, ama o durumda yanıt `500` olurdu. `400`, hatanın istekte olduğunu bildirir.
* `$1` ve `[productName]`: Değer SQL metnine birleştirilmez, ayrıca gönderilir. Kullanıcı ad yerine bir SQL komutu yazsa bile komut olarak değil metin olarak saklanır (SQL injection koruması).
* Yalnızca `product_name` yazılır; `id`, `quantity` ve `created_at` veritabanının varsayılan değerlerini alır.
* `RETURNING`: Eklenen satırı geri döndürür. Veritabanının ürettiği `id` bu sayede öğrenilir; frontend ürünü sonradan bu kimlikle günceller ve siler.
* `rows[0]`: Tek satır eklendiği için dizinin ilk elemanı alınır.
* `201`: Yeni kayıt oluşturuldu.
* `23505`: PostgreSQL'in benzersizlik ihlali kodu; ürün adı benzersiz indekse takıldı. `409` (Conflict) döner.

{% hint style="info" %}
Aynı ad kontrolü API kodunda değil veritabanında yapılır. API önce "bu ad var mı?" diye sorup sonra ekleseydi, aynı anda gelen iki istek ikisi de "yok" cevabı alıp ürünü iki kez ekleyebilirdi. İndeks bu kontrolü ekleme işlemiyle aynı anda yapar.
{% endhint %}

## Update(updateProduct)

```js
export async function updateProduct(req, res, id) {
    try {
        const body = await readBody(req);
        if (!Number.isInteger(body.quantity) || body.quantity < 1) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Geçersiz adet' }));
            return;
        }
        const result = await pool.query(
            'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING id, product_name AS "productName", quantity',
            [body.quantity, id]
        );

        if (result.rowCount === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Ürün bulunamadı' }));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify(result.rows[0]));
    } catch (error) {
        if (error.code === '22P02') {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Ürün bulunamadı' }));
            return;
        }
        if (error instanceof SyntaxError) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Geçersiz JSON' }));
            return;
        }
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({error: 'Ürün güncellenemedi'}))
    }
}
```

* `id`: `server.js` adresten ayırıp üçüncü parametre olarak gönderir.
* `Number.isInteger()`: Değer tam sayıysa `true` döndürür. `"4"` (metin), `2.5`, `null` ve gönderilmemiş değer için `false` döndürür. Başına `!` konunca "tam sayı değilse" anlamına gelir.
* `||`: İlk koşul doğruysa ikincisine bakılmaz.
* `SET quantity = $1 WHERE id = $2`: Yalnızca kimliği eşleşen satırın adedi değişir. `WHERE` yazılmasaydı tüm ürünlerin adedi değişirdi. Dizideki sıra yer tutucularla eşleşir: önce adet, sonra `id`.
* `RETURNING`: Güncellenen satırı döndürür; frontend ekrandaki adedi bu değerle günceller.
* `rowCount`: Sorgunun etkilediği satır sayısıdır. `UPDATE` eşleşen satır bulamazsa hata vermez, sıfır satırı etkiler; bu durumda `404` döner.
* `22P02`: `id` UUID biçiminde değilse (örneğin `yanlis-id`) PostgreSQL metni UUID'ye çeviremez ve bu kodla hata verir. Böyle bir ürün olamayacağı için `404` döner.

## Delete(deleteProduct)

```js
export async function deleteProduct(req,res,id){
    try{
        const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
        if(result.rowCount === 0){
            res.statusCode = 404;
            res.end(JSON.stringify({error : 'Ürün bulunamadı'}));
            return;
        }
        res.statusCode = 204;
        res.end();
    }catch(error){
        if(error.code === '22P02'){
            res.statusCode = 404;
            res.end(JSON.stringify({error: 'Ürün bulunamadı'}));
            return;
        }
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({error: 'Ürün silinemedi'}));
    }
}
```

* Gövde okunmaz; silinecek ürün adresteki `id` ile belirlenir.
* Silinen satır geri gönderilmeyeceği için `RETURNING` kullanılmaz.
* `204` (No Content): Başarılı, ama yanıtın gövdesi yok. Bu yüzden `res.end()` boş çağrılır.
* Bulunamayan ürün için iki durum vardır: biçimi doğru ama var olmayan `id` (`rowCount === 0`) ve biçimi yanlış `id` (`22P02`). İkisi de `404` döner.

## Durum kodları

<table><thead><tr><th width="90">Kod</th><th width="200">Anlamı</th><th>Kullanıldığı yer</th></tr></thead><tbody><tr><td>200</td><td>Başarılı</td><td>Read, Update</td></tr><tr><td>201</td><td>Oluşturuldu</td><td>Create</td></tr><tr><td>204</td><td>Başarılı, içerik yok</td><td>Delete, <code>OPTIONS</code></td></tr><tr><td>400</td><td>Hatalı istek</td><td>Boş ad, geçersiz adet, bozuk JSON</td></tr><tr><td>404</td><td>Bulunamadı</td><td>Var olmayan ürün, tanımsız adres</td></tr><tr><td>409</td><td>Çakışma</td><td>Aynı ad</td></tr><tr><td>500</td><td>Sunucu hatası</td><td>Beklenmeyen hatalar (ör. veritabanı kapalı)</td></tr></tbody></table>
