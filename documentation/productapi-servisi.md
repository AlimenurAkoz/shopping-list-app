---
description: >-
  Angular uygulamasının backend ile konuşan tek dosyası. Bileşen HTTP
  ayrıntılarını bilmez; ürün işlemleri için bu servisin fonksiyonlarını çağırır.
---

# ProductApi Servisi(product-api.ts)

Dosya: [`product-api.ts`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/frontend/src/app/services/product-api.ts)

Servis, `frontend` klasöründe şu komutla oluşturuldu:

```bash
ng generate service services/product-api
```

Komut `src/app/services/product-api.ts` ve test dosyası `product-api.spec.ts` dosyalarını oluşturur.

## HttpClient'ın Etkinleştirilmesi

Angular'ın HTTP istemcisi (`HttpClient`) bir serviste kullanılabilmesi için önce uygulamaya kaydedilmelidir. Bu kayıt [`app.config.ts`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/frontend/src/app/app.config.ts) dosyasında yapılır:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideHttpClient()],
};
```

* Angular'da servisler `new` ile oluşturulmaz, `inject()` ile istenir. Angular bir servisi ancak nasıl oluşturacağı `providers` listesine kaydedilmişse verebilir.
* `provideHttpClient()`, `HttpClient`'ı uygulama genelinde kullanılabilir hale getirir. Eklenmezse uygulama açılırken `NullInjectorError: No provider for HttpClient` hatası verir.
* `main.ts`, bu `appConfig` nesnesini `bootstrapApplication()` fonksiyonuna verir; yani kayıt uygulama başlarken bir kez yapılır.

```ts
@Injectable({
  providedIn: 'root',
})
export class ProductApi {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/products';
  ...
}
```

* `@Injectable({ providedIn: 'root' })`: Servisin uygulama genelinde tek bir örneği olur ve ayrıca bir yere kaydedilmeden `inject()` ile alınabilir.
* `inject(HttpClient)`: `app.config.ts`'te kaydedilen HTTP istemcisini alır.
* `apiUrl`: Dört isteğin ortak adresi. Adres değişirse yalnızca bu satır güncellenir.

## Fonksiyonlar

<table><thead><tr><th width="142">Fonksiyon</th><th width="171.5999755859375">İstek</th><th width="153.199951171875">Gönderilen gövde</th><th>Dönen değer</th></tr></thead><tbody><tr><td><code>getProducts()</code></td><td><code>GET /api/products</code></td><td>—</td><td>Ürün dizisi</td></tr><tr><td><code>createProduct(name)</code></td><td><code>POST /api/products</code></td><td><code>{"productName":"Elma"}</code></td><td>Eklenen ürün</td></tr><tr><td><code>updateProduct(id, q)</code></td><td><code>PATCH /api/products/{id}</code></td><td><code>{"quantity":4}</code></td><td>Güncellenen ürün</td></tr><tr><td><code>deleteProduct(id)</code></td><td><code>DELETE /api/products/{id}</code></td><td>—</td><td>Yok (<code>void</code>)</td></tr></tbody></table>

* `get<Product[]>`: Köşeli parantezdeki tip, yanıtın biçimini TypeScript'e bildirir.&#x20;
* `{ productName }`: `{ productName: productName }` yazımının kısaltmasıdır. `HttpClient` nesneyi JSON metnine çevirir ve `Content-Type: application/json` başlığını ekler. Backend bu alanı `body.productName` olarak okur.
* `` `${this.apiUrl}/${id}` ``: Ters tırnaklı yazım (template literal) ile adresin sonuna ürünün kimliği eklenir: `/api/products/1d595004-...`.
* `delete<void>`: Backend başarılı silmede `204` ile boş yanıt döndürdüğü için beklenen bir değer yoktur.

## Observable ve firstValueFrom

`HttpClient`'ın fonksiyonları isteği hemen göndermez, bir `Observable` döndürür. `Observable`, "ileride gelecek değerler" demektir ve istek ancak birisi ona abone olduğunda (subscribe) gönderilir.

Bileşende (`app.ts`) zaten `async/await` kullanıldığı için `Observable`, `rxjs` kütüphanesindeki `firstValueFrom()` ile `Promise`'e çevrilir:

```ts
const newProduct = await firstValueFrom(this.api.createProduct(name));
```

* `firstValueFrom()` `Observable`'a abone olur, böylece istek gönderilir.
* Sunucunun yanıtı gelince `Promise` çözülür ve `await` o değeri verir.
* HTTP isteği tek bir yanıt ürettiği için ilk değeri almak yeterlidir.
* Sunucu hata kodu (`400`, `404`, `409`, `500`) döndürürse veya sunucuya ulaşılamazsa `Promise` reddedilir ve `catch` bloğuna `HttpErrorResponse` düşer.

## Hata Yanıtları

`HttpClient`, 200–299 dışındaki durum kodlarını hata olarak verir. Hatanın kodu `error.status` alanından okunur:

```ts
} catch (error) {
  if (error instanceof HttpErrorResponse && error.status === 409) {
    ...
  }
}
```

<table><thead><tr><th width="65.199951171875">Kod</th><th width="239.20001220703125">Anlamı</th><th>Bileşende yapılan</th></tr></thead><tbody><tr><td><code>409</code></td><td>Ürün veritabanında zaten var</td><td>Liste yenilenir, "Bu ürün listede zaten var." gösterilir</td></tr><tr><td><code>404</code></td><td>Ürün bulunamadı (başka yerden silinmiş)</td><td>Adet değiştirmede liste yenilenir, silmede ürün ekrandan da kaldırılır</td></tr><tr><td><code>400</code></td><td>Geçersiz istek (boş ad, geçersiz adet)</td><td>Frontend kontrolleri bu duruma gelmeden önler</td></tr><tr><td><code>500</code></td><td>Sunucu veya veritabanı hatası</td><td>"Ürün eklenemedi." gibi genel bildirim</td></tr></tbody></table>

## Test Dosyası

`product-api.spec.ts`, CLI tarafından oluşturuldu ve değiştirilmedi:

```ts
describe('ProductApi', () => {
  let service: ProductApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

Test ortamına `provideHttpClient()` eklenmediği için `ng test` çalıştırılırsa servis `HttpClient`'ı bulamayıp hata verebilir. Uygulamanın çalışmasını etkilemez.
