---
description: >-
  Bu sayfada, uygulamanın her özelliğinin nasıl çalıştığı ve hangi metotları
  kullandığı anlatılıyor.
---

# Özellikler ve Metotlar

## Ürün Ekleme

Kullanıcının yazdığı ürün önce backend'e gönderilir ve veritabanına kaydedilir. Sunucunun döndürdüğü ürün (veritabanının verdiği `id` ile birlikte) `push()` ile dizinin sonuna eklenir. Ürün listede zaten varsa yeni satır açılmaz. Kullanıcıya adedi artırmak isteyip istemediği sorulur. [Tekrar eden ürün uyarısı](ozellikler-ve-metotlar.md#tekrar-eden-urun-uyarisi) kısmından detaylı incelenebilir.

`app.html`

```html
<form (ngSubmit)="add()">
  <div class="input-text">
    <input type="text" id="objectName" [(ngModel)]="objectName" name="objectName" placeholder="Ürün adını giriniz" />
    ...
</form>
```

* `(ngSubmit)` forma bağlı olduğu için hem "Ekle" butonu hem de enter tuşu `add()` metodunu çalıştırır.
* Form içinde `ngModel` kullanan giriş alanlarında `name` özelliği zorunludur.
* `ngModel`, `ngSubmit` gibi form özelliklerini kullanabilmek için `FormsModule app.ts` dosyasında import edilir.

```typescript
import { FormsModule } from '@angular/forms';
@Component({  
  imports: [FormsModule],
  ...
}
```

`app.ts`

```ts
async add() {
  const name = this.objectName.trim();
  if (name == '') {
    return;
  }
  const existing = this.findProduct(name);
  if (existing) {
    await this.availableProduct(existing);
    return;
  }
  try {
    const newProduct = await firstValueFrom(this.api.createProduct(name));
    this.products.push(newProduct);
    this.clean();
  } catch (error) {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      await this.loadProducts();
      this.showError('Bu ürün listede zaten var.');
    } else {
      this.showError('Ürün eklenemedi.');
    }
  }
  this.cdr.markForCheck();
}
```

* `trim()` baştaki ve sondaki boşlukları siler. Böylece yalnızca boşluktan oluşan girişler reddedilir ve " Süt " gibi önünde boşluk olan girişler "Süt" olarak boşluksuz kaydedilir.
* `return`, koşul sağlanmadığında metodu erken bitirir. Geri kalan satırlar çalışmaz.
* Metot `async` olarak tanımlanmıştır, çünkü ürün listede varsa onay penceresinin kapanmasını, yoksa sunucunun yanıtını `await` ile bekler.(Asenkron işlem)
* `this.api.createProduct(name)` `POST /api/products` isteğini hazırlar, `firstValueFrom` isteği gönderip yanıtı bekler. Yanıt, veritabanına eklenen üründür, adedi veritabanı `1` olarak verir.
* Ürün ekranda yalnızca sunucu onayladıktan sonra görünür. İstek başarısız olursa diziye bir şey eklenmez ve giriş kutusu temizlenmez, kullanıcı yazdığını kaybetmez.
* `409` (Conflict), aynı ürünün veritabanında zaten olduğunu gösterir. Bu durum, ürün başka bir sekmeden eklendiği için ekrandaki listede görünmüyorsa oluşur. Liste sunucudan yenilenir ve kullanıcıya bildirilir.
* `instanceof HttpErrorResponse` kontrolü, yakalanan hatanın gerçekten bir HTTP hatası olduğundan emin olmak için yapılır. TypeScript `catch` içindeki hatanın tipini bilmez.

Ürün eklemek için kullanılan giriş kutusunu temizlemek için "x" butonu eklenir, `app.html`'de `type="button"` olarak tanımlanır. Bu butonun konumu ve stili `app.css`'te ayarlanır.

## Tekrar Eden Ürün Uyarısı

Listede mevcut olan bir ürün eklenmek istendiğinde yeni satır açılmaz ve sunucuya istek gönderilmez. Kullanıcıya ürünün listede kaç adet olduğu gösterilir ve adedi artırmak isteyip istemediği sorulur.

<table><thead><tr><th width="115">Seçim/Buton</th><th>İşlem</th></tr></thead><tbody><tr><td>Artıralım</td><td>Pencere kapanır, ilgili satır vurgulanır ve görünür alana kaydırılır, satırdaki "+" butonu yanıp söner. Adet, kullanıcı "+" butonuna bastığında artar.</td></tr><tr><td>Yeterli</td><td>Pencere kapanır, ekleme yapılmaz, sağ alt köşede "Ürün eklenmedi." bildirimi görünür.</td></tr></tbody></table>

Her iki durumda da giriş kutusu temizlenir.

### Aynı ürünün tespiti

`app.ts`

```ts
findProduct(name: string): Product | undefined {
  const text = name.trim().toLocaleLowerCase('tr');
  return this.products.find(p => p.productName.trim().toLocaleLowerCase('tr') == text);
}
```

* `find()`, koşulu sağlayan ilk elemanın kendisini döndürür bulamazsa `undefined` döner. Dönüş tipi `Product | undefined` bu yüzden iki seçenek içerir.
* `toLocaleLowerCase('tr')`, Türkçe kurallarına göre küçük harfe çevirir. `'tr'` yazılmazsa "I" harfi "ı" yerine "i" olur ve "Ispanak" ile "ispanak" eşleşmez.
* Aynı kural veritabanında da korunur: tablodaki benzersiz indeks Türkçe harf kurallarıyla karşılaştırma yapar. Böylece frontend dışından (örneğin doğrudan API'ye) gelen istekler de aynı ürünü ikinci kez ekleyemez. Ayrıntılar: [Veritabanı](veritabani.md#benzersiz-indeks)

<figure><img src=".gitbook/assets/image (3).png" alt="" width="545"><figcaption></figcaption></figure>

### Onay penceresi ve bildirim: SweetAlert2

Tarayıcının hazır `confirm()` penceresi buton yazılarının değiştirilmesine izin vermez ve görünümü özelleştirilemez. Bu nedenle pencere ve bildirim için "SweetAlert2" kütüphanesi kullanıldı. Kurulumuna [Proje Oluşturma ve Çalıştırma](projeyi-olusturma-ve-calistirma.md#frontendi-olusturma-sifirdan) sayfasından ulaşabilirsiniz.

#### Onay penceresi

```ts
const result = await Swal.fire({
  title: "Ürün Eklensin mi?",
  text: `Eklemeye çalıştığınız ürün listede ${product.quantity} adet bulunuyor. Sayısı artırmak ister misiniz?`,
  ...
});
```

* `Swal.fire()` bir söz (Promise) döndürür, `await` ile kullanıcı bir butona basana kadar beklenir. Sonuç `result.isConfirmed` ile okunur: "Artıralım" butonuna basıldıysa `true`, "Yeterli" butonuna basıldıysa veya pencere kapatıldıysa `false` olur.
* Metin ters tırnak (`` ` ``) ile yazılmıştır. Bu yazımda `${...}` içine değişken yerleştirilebilir (template literal). Ürünün adedi metne bu şekilde eklenir.

Bildirim için aynı fonksiyon `toast: true` ile kullanılır. `position: 'bottom-end'` bildirimi sağ alt köşeye yerleştirir, `timer: 2500` 2,5 saniye sonra kapatır.

Sunucu hataları da aynı bildirim tasarımıyla, `error` simgesiyle gösterilir. Bunun için `showError()` metodu yazıldı:

```ts
showError(message: string) {
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'error',
    title: message,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
}
```

### Satır vurgusu

```ts
highlight(product: Product) {
  clearTimeout(this.highlightTime);
  this.highlightedId = product.id;

  setTimeout(() => {
    document.getElementById('row-' + product.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  this.highlightTime = setTimeout(() => this.clearHighlight(), 6000);
}
```

* Vurgulanan ürün, `highlightedId` değişkenindeki kimlikle (`id`) belirlenir. Vurgu 6 saniye sonra `clearHighlight()` ile kaldırılır.
* `clearTimeout(this.highlightTime)` art arda iki vurgu yapıldığında önceki zamanlayıcıyı iptal eder. İptal etmeseydi eski zamanlayıcı yeni vurguyu erken kaldırırdı.
* `scrollIntoView()` satırı kaydırılabilir tablo alanında görünür konuma getirir. Gecikmesiz bir `setTimeout` içinde çağrılır, çünkü Angular satırı bir sonraki çizimde günceller.
* `?.` ile eleman bulunamazsa hata vermeden işlemi atlar.
* `highlightTime` değişkeninin tipi `ReturnType<typeof setTimeout>` olarak yazılmıştır, "`setTimeout`'un döndürdüğü değerin tipi" anlamına gelir.

`app.html`

```html
<tr [id]="'row-' + product.id" [class.highlight]="product.id == highlightedId">
  ...
  <button class="operation" [class.pulse]="product.id == highlightedId" type="button" (click)="increase(product)">+</button>
</tr>
```

* `[id]` her satıra ürünün kimliğinden oluşan `row-4940774e-...` gibi benzersiz bir kimlik verir, `scrollIntoView()` satırı bu kimlikle bulur.
* `[class.highlight]="koşul"` koşul doğruysa elemana `highlight` sınıfını ekler, değilse kaldırır.

<figure><img src=".gitbook/assets/image (6).png" alt="" width="529"><figcaption></figcaption></figure>

### Ekran güncellemesi

Pencere kapandıktan, vurgu zamanlayıcısı bittikten ve sunucudan yanıt geldikten sonra `this.cdr.markForCheck()` çağrılır. Bu satır, bekleme sonrasında yapılan değişikliklerin (giriş kutusunun temizlenmesi, vurgunun kalkması, yeni ürünün eklenmesi) ekrana hemen yansıması için Angular'a ekranı yeniden kontrol etmesini söyler.

## Adet Artırma ve Azaltma

Her satırdaki "−" ve "+" butonları, o satırdaki ürünün adedini bir azaltır veya bir artırır. Yeni adet veritabanına kaydedilir.

`app.ts`

```ts
async decrease(product: Product) {
  ...
}

async increase(product: Product) {
  ...
}

async changeQuantity(product: Product, quantity: number) {
  try {
    const updated = await firstValueFrom(this.api.updateProduct(product.id, quantity));
    product.quantity = updated.quantity;
  } catch (error) {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.showError('Ürün bulunamadı, liste yenilendi.');
      await this.loadProducts();
      return;
    }
    this.showError('Adet güncellenemedi.');
  }
  this.cdr.markForCheck();
}
```

`decrease()` metoduyla adet sayısı 1 azaltılır, `increase()` metoduyla ise adet sayısı artırılır. İki butonun ortak işi (sunucuya istek gönderip sonucu ekrana yazmak) `changeQuantity()` metodunda toplanır. Bu metotlarda:

* Sayı (`product.quantity`) değil, ürünün kendisi (`product`) alınır. Sayılar metoda kopya olarak gider, nesneler ise referans olarak gider. Bu yüzden metotta yapılan değişiklik dizideki asıl ürünü değiştirir ve tablo güncellenir.
* Yeni adet hesaplanıp `PATCH /api/products/{id}` isteğiyle gönderilir. Ekrandaki adet, sunucunun döndürdüğü değerle (`updated.quantity`) güncellenir. İstek başarısız olursa ekran eski adette kalır ve veritabanıyla farklılaşmaz.
* `404`, ürünün başka bir yerden silindiğini gösterir. Bu durumda liste sunucudan yenilenir.
* Azaltma işleminde adet 1'in altına inemez. Bu kural üç yerde korunur: şablonda `[disabled]="product.quantity == 1"` ile "−" butonu pasif yapılır, `decrease()` adet 1 iken erken çıkar ve backend 1'den küçük adeti `400` ile reddeder.
* Vurgulu satırın "+" butonuna basıldığında adet artar ve vurgu kalkar.

## Ürün Silme

Satırdaki çöp kutusuna basıldığında ürün önce veritabanından silinir, sonra diziden çıkarılır.

`app.ts`

```ts
async delete(product: Product) {
  try {
    await firstValueFrom(this.api.deleteProduct(product.id));
  } catch (error) {
    if (!(error instanceof HttpErrorResponse && error.status === 404)) {
      this.showError('Ürün silinemedi.');
      this.cdr.markForCheck();
      return;
    }
  }
  this.products = this.products.filter(p => p.id !== product.id);
  this.clearHighlight();
}
```

* `this.api.deleteProduct(product.id)` `DELETE /api/products/{id}` isteğini gönderir. Başarılı silmede sunucu `204` döndürür, yanıtın gövdesi yoktur.
* `404`, ürünün veritabanında zaten olmadığını gösterir. Silme açısından istenen sonuç bu olduğu için hata sayılmaz ve ürün ekrandan da kaldırılır. Diğer hatalarda ürün listede kalır ve "Ürün silinemedi." bildirimi gösterilir.
* `filter()`, kimliği silinen ürünle aynı olmayan ürünlerden yeni bir dizi oluşturur; yani silinen ürün dışındakiler kalır.

Satırın tablodan kaybolması için ayrıca kod yazılmaz. Tablo satırları `@for` ile diziden üretildiği için, diziden eleman çıkarıldığı anda Angular tabloyu yeniden oluşturur.

{% hint style="info" %}
Frontend sürümünde silme `findIndex()` ve `splice()` ile yapılıyor, ardından `indexSort()` ile kalan ürünlerin sıra numaraları (`id`) yeniden veriliyordu. Artık `id` veritabanının verdiği kalıcı bir kimlik olduğu için yeniden numaralandırılmaz; `indexSort()` ve `counter` kaldırıldı. Ekrandaki sıra numarası `app.html` içinde `@for` bloğunun `$index` değişkeninden üretilir:

```html
<td>{{ $index + 1 }}</td>
```

`$index` 0'dan başladığı için 1 eklenir. Arama yapıldığında numaralar filtrelenmiş listeye göre 1'den başlar.
{% endhint %}

## Listede Arama

Arama işlemi `filterProducts()` metoduyla sağlanır. Bu metotta:

* `filter()` , koşulu sağlayan elemanlardan yeni bir dizi döndürür asıl dizi değişmez.
* `includes()`, ürün adının arama metnini içerip içermediğine bakar.

```typescript
filterProducts(): Product[] {
    const searchText = this.searchProduct.trim().toLocaleLowerCase('tr');
    return this.products.filter(p => p.productName.toLocaleLowerCase('tr').includes(searchText));
  }
```

Tablonun `@for` döngüsü asıl dizi yerine bu metodun döndürdüğü diziyi dolaşır. Sonuç yoksa `@empty` bloğu "Ürün alışveriş listenizde bulunmuyor." mesajını gösterir.

Seçim modunda arama ile gizlenen işaretli ürünlerin de "Seçilenleri Sil" ile silinmemesi için arama kutusu `[disabled]="isOpen"` ile pasif olur.

<figure><img src=".gitbook/assets/image (2).png" alt="" width="521"><figcaption></figcaption></figure>

## Seçim Modu ve Toplu Silme

Seç butonuna basıldığında son sütundaki çöp kutuları onay kutularına, "Seç" butonu "Vazgeç" butonuna, "Listeyi Temizle" butonu "Seçilenleri Sil" butonuna dönüşür.

`app.html`

```html
<td>
  @if (isOpen){
  <input type="checkbox" [(ngModel)]="product.selected">
  }@else {
  <button class="delete-btn" type="button" (click)="delete(product)">🗑️</button>
  }
</td>
```

* "Vazgeç" butonuna basılarak mod kapatma işleminde `openClose()` metodundaki `closeSelect()` tüm işaretleri kaldırır. Bu yapılmazsa mod tekrar açıldığında eski seçimler işaretli gelir.
* `isSelected()` işaretli ilk ürünü bulduğunda `return true` ile döngüden çıkar.
* Temizleme butonu `[disabled]="isOpen && !isSelected()"` ile yalnızca seçim modu açıkken hiçbir ürün işaretli değilse pasif olur.

<figure><img src=".gitbook/assets/image (7).png" alt="" width="563"><figcaption></figcaption></figure>

## Listeyi Temizleme

"Seçilenleri Sil" ve "Listeyi Temizle" butonları aynı metodu, `clearList()` metodunu kullanır. Fark yalnızca silinecek ürünlerde:

```ts
async clearList() {
  this.clearHighlight();
  const toDelete = this.isOpen ? this.products.filter(p => p.selected) : this.products;
  const results = await Promise.allSettled(
    toDelete.map(p => firstValueFrom(this.api.deleteProduct(p.id)))
  );
  if (results.some(r => r.status === 'rejected')) {
    this.showError('Bazı ürünler silinemedi.');
  }
  this.isOpen = false;
  await this.loadProducts();
}
```

* Seçim modu açıkken `filter()` ile yalnızca işaretli ürünler, kapalıyken tüm liste silinecekler listesine alınır.
* Backend'de toplu silme servisi olmadığı için her ürün için ayrı bir `DELETE` isteği gönderilir. `map()`, her ürün için bir istek oluşturur ve istekler aynı anda gider.
* `Promise.allSettled()`, isteklerin hepsinin bitmesini bekler. Biri başarısız olsa bile diğerleri devam eder; sonuçta her isteğin başarılı (`fulfilled`) ya da başarısız (`rejected`) olduğu bilgisi gelir. `Promise.all()` kullanılsaydı ilk hatada beklemeyi bırakırdı.
* `some()` en az bir başarısız istek varsa bildirim gösterir.
* Sonunda liste sunucudan yeniden yüklenir. Hangi ürünün silindiği tek tek takip edilmez, ekran veritabanının gerçek halini gösterir.

## Toplam Ürün Adedi

* Toplam ürün adedi ayrı bir değişkende tutulmaz. Ekleme, silme ve adet değişikliklerinden sonra `totalQuantity()` metodu çağırılarak yeniden hesaplanır.
* Toplam ürün adedi, `app.html`'de `{{ totalQuantity() }}` şeklinde çağrılır.

## Verilerin Saklanması

Liste PostgreSQL veritabanında saklanır. Sayfa yenilendiğinde, sekme veya tarayıcı kapatıldığında, hatta başka bir tarayıcıdan açıldığında liste korunur. Tarayıcıdaki `products` dizisi, veritabanındaki listenin ekranda gösterilen kopyasıdır.

<table><thead><tr><th width="155.20001220703125">İşlem</th><th width="202.79998779296875">İstek</th><th>Ne zaman kullanılır</th></tr></thead><tbody><tr><td>Listeyi yükleme</td><td><code>GET /api/products</code></td><td>Sayfa açılışında, toplu silmeden sonra, hata sonrası tutarsızlık şüphesinde</td></tr><tr><td>Ürün ekleme</td><td><code>POST /api/products</code></td><td><code>add()</code></td></tr><tr><td>Adet değiştirme</td><td><code>PATCH /api/products/{id}</code></td><td><code>increase()</code>, <code>decrease()</code></td></tr><tr><td>Ürün silme</td><td><code>DELETE /api/products/{id}</code></td><td><code>delete()</code>, <code>clearList()</code></td></tr></tbody></table>

* Seçim modu, arama metni ve satır vurgusu kaydedilmez, sayfa yenilendiğinde başlangıç değerlerine döner.
* İsteklerin nasıl gönderildiği [ProductApi Servisi](productapi-servisi.md), sunucuda nasıl karşılandığı [CRUD Servisleri](crud-servisleri.md) sayfasında anlatılıyor.

{% hint style="info" %}
İstekler tarayıcıda F12 → Network → Fetch/XHR altında `products` adıyla görülebilir. `POST`, `PATCH` ve `DELETE` isteklerinden önce görünen `OPTIONS` satırları, tarayıcının izin sormak için gönderdiği ön isteklerdir.
{% endhint %}

{% hint style="info" %}
Frontend sürümünde liste tarayıcının `sessionStorage` alanında `JSON.stringify()` / `JSON.parse()` ile saklanıyor ve her değişiklikten sonra `save()` çağrılıyordu. Bu kod kaldırıldı. Bkz. [Sürüm Geçmişi](/broken/pages/j3WS7jc65IsSw331IRKv).
{% endhint %}

## Kullanılan Metotların Özeti

<table data-header-hidden data-search="false"><thead><tr><th width="176.60003662109375">Metot</th><th>Ne yapar</th><th>Kullanıldığı yer</th></tr></thead><tbody><tr><td>Metot</td><td>Ne yapar</td><td>Kullanıldığı yer</td></tr><tr><td><code>push()</code></td><td>Dizinin sonuna eleman ekler</td><td>Ürün Ekleme</td></tr><tr><td><code>length</code></td><td>Eleman sayısını verir</td><td>Boş liste kontrolü, döngüler</td></tr><tr><td><code>find()</code></td><td>Koşulu sağlayan ilk elemanın kendisini döndürür</td><td>Tekrar Eden Ürün Uyarısı</td></tr><tr><td><code>filter()</code></td><td>Koşulu sağlayan elemanlardan yeni bir dizi oluşturur</td><td>Listede Arama, Ürün Silme, Listeyi Temizleme</td></tr><tr><td><code>map()</code></td><td>Her elemandan yeni bir değer üretip yeni bir dizi oluşturur</td><td>Listeyi Temizleme (her ürün için bir istek)</td></tr><tr><td><code>some()</code></td><td>En az bir eleman koşulu sağlıyorsa <code>true</code> döndürür</td><td>Listeyi Temizleme</td></tr><tr><td><code>trim()</code></td><td>Baştaki ve sondaki boşlukları siler</td><td>Ürün Ekleme, Tekrar Eden Ürün Uyarısı, Listede Arama</td></tr><tr><td><code>toLocaleLowerCase('tr')</code></td><td>Türkçe kurallarına göre küçük harfe çevirir</td><td>Tekrar Eden Ürün Uyarısı, Listede Arama</td></tr><tr><td><code>includes()</code></td><td>Metnin başka bir metni içerip içermediğini kontrol eder</td><td>Listede Arama</td></tr><tr><td><code>firstValueFrom()</code></td><td><code>Observable</code> döndüren isteği <code>await</code> ile beklenebilir hale getirir</td><td>Tüm sunucu istekleri</td></tr><tr><td><code>Promise.allSettled()</code></td><td>Birden fazla isteğin hepsinin bitmesini bekler</td><td>Listeyi Temizleme</td></tr></tbody></table>

Dizi fonksiyonlarından `pop()` her zaman dizinin son elemanını sildiği için, kullanıcının seçtiği belirli bir ürünü silmekte kullanılamaz. Frontend sürümünde bu yüzden `findIndex()` ve `splice()` kullanılmıştı; şimdiki sürümde silinen ürün dışındakiler `filter()` ile bırakılıyor.
