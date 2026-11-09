---
description: >-
  db.js, .env dosyasındaki bilgilerle PostgreSQL bağlantı havuzunu(pool)
  oluşturur ve servislerin kullanması için dışa aktarır.
---

# Veritabanı Bağlantısı(db.js)

Dosya: [`db.js`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/backend/db.js)

```js
import {Pool} from 'pg';
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
export default pool;
```

* `import {Pool} from 'pg'`: `pg` paketinden `Pool` sınıfı alınır. Ad büyük harfle başlar; `pool` yazılırsa alttaki `const pool` değişkeniyle çakışır.
* `process.env.DB_HOST`: Değer `.env` dosyasından okunur. Tırnak içinde yazılırsa (`'process.env.DB_HOST'`) değişken olarak değil düz metin olarak okunur ve sunucu adı gerçekten "process.env.DB\_HOST" olur.
* `export default pool`: Dosyanın ana değeri olarak pool'u dışa aktarır. İçe aktaran taraf süslü parantez kullanmaz: `import pool from './db.js'`.

## Bağlantı havuzu (Pool)

Veritabanına bağlantı açmak (ağ bağlantısı, kimlik doğrulama) bir sorgudan çok daha uzun sürer. Pool, açtığı bağlantıları sorgudan sonra kapatmaz, saklar ve sonraki sorgularda yeniden kullanır. Aynı anda birden fazla istek gelirse her birine ayrı bağlantı verir.

* `new Pool(...)` satırı bağlantı açmaz, yalnızca ayarları saklar. İlk bağlantı ilk sorguda (`pool.query(...)`) açılır. Bu yüzden veritabanı kapalıyken sunucu yine başlar; hata ilk istekte görülür.
* Modül yalnızca bir kez çalışır. `db.js` kaç dosyada içe aktarılırsa aktarılsın tek bir havuz oluşur.

## .env değerleri

```
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=shopping_user
DB_PASSWORD=<şifre>
DB_NAME=shopping_list
```

`.env` dosyasındaki değerler metin olarak okunur; `process.env.DB_PORT` sayı değil `"5433"` metnidir. `pg` bunu kendisi sayıya çevirir.

{% hint style="info" %}
`db.js`, yüklendiği anda `process.env` değerlerini okur. Bu yüzden `server.js` dosyasında `import "dotenv/config"` satırı, `db.js`'i yükleyen `products.js` içe aktarımından önce gelmelidir. Sıra ters olursa değerler `undefined` olur ve bağlantı yanlış adrese gider.
{% endhint %}

## Bağlantının test edilmesi

Servisler yazılmadan önce bağlantı, `server.js` dosyasına geçici olarak eklenen bir `/api/health` adresiyle denendi. Read servisi yazılınca bu blok silindi. Mantığını gösteren temsili hali:

```js
if (req.method === 'GET' && req.url === '/api/health') {
    try {
        await pool.query('SELECT NOW()');
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Veritabanına bağlanılamadı' }));
        return;
    }
}
```

1. `http://localhost:3000/api/health` adresinde `{"status":"ok"}` görüldü.
2. İkinci bir terminalde `docker stop shoppinglist_postgres` ile veritabanı durduruldu. Sayfa yenilenince `500` yanıtı geldi, terminalde `ECONNREFUSED` hatası görüldü.
3. `docker start shoppinglist_postgres` ile yeniden başlatılınca yanıt tekrar `ok` oldu.

`SELECT NOW()` sorgusu tabloya dokunmaz, yalnızca veritabanından saati ister, bağlantıyı denemek için yeterlidir.
