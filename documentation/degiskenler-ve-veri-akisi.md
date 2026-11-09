---
description: >-
  Uygulamanın o anki hali (listede hangi ürünler var, seçim modu açık mı, arama
  kutusuna ne yazılmış) App bileşenindeki birkaç değişkende tutulur.
---

# Değişkenler ve Veri Akışı

[`app.html`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/frontend/src/app/app.html), bu değişkenlere bağlıdır. Bir değişken değiştiğinde Angular ekranı günceller. Ekranı elle değiştiren bir kod yoktur.

## Değişkenler

`app.ts`

<table><thead><tr><th width="143.5999755859375">Değişken</th><th width="143.39996337890625">Tip</th><th width="88.2000732421875">Başlangıç</th><th>Görevi</th></tr></thead><tbody><tr><td><code>objectName</code></td><td><code>string</code></td><td><code>''</code></td><td>Ürün ekleme kutusuna yazılan metin</td></tr><tr><td><code>products</code></td><td><code>Product[]</code></td><td><code>[]</code></td><td>Ekranda gösterilen ürünlerin dizisi. Veritabanındaki listenin tarayıcıdaki kopyasıdır</td></tr><tr><td><code>isOpen</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Seçim modunun açık olup olmadığı</td></tr><tr><td><code>searchProduct</code></td><td><code>string</code></td><td><code>''</code></td><td>Arama kutusuna yazılan metin</td></tr><tr><td><code>highlightedId</code></td><td><code>string | null</code></td><td><code>null</code></td><td>Vurgulanan ürünün kimliği (UUID), vurgu yoksa <code>null</code></td></tr></tbody></table>

#### Yardımcı değişkenler

Bu değişkenler ekranda doğrudan görünmez, durumu yönetmeye yardım eder:

<table><thead><tr><th width="139.79998779296875">Değişken</th><th>Görevi</th></tr></thead><tbody><tr><td><code>api</code></td><td>Backend ile konuşan <code>ProductApi</code> servisi. <code>inject(ProductApi)</code> ile alınır. Ayrıntılar: <a href="productapi-servisi.md">ProductApi Servisi</a></td></tr><tr><td><code>highlightTime</code></td><td>Vurguyu birkaç saniye sonra kaldıracak zamanlayıcının kaydı. Yeni bir vurgu başladığında eski zamanlayıcıyı iptal etmek için tutulur.</td></tr><tr><td><code>cdr</code></td><td>Angular'ın değişiklik algılayıcısı (<code>ChangeDetectorRef</code>). Bekleme gerektiren işlemlerden (onay penceresi, zamanlayıcı, sunucu yanıtı) sonra Angular'a "ekranı yeniden kontrol et" demek için kullanılır.</td></tr><tr><td><code>title</code></td><td>Angular'ın proje şablonundan kalan değişken, uygulamada kullanılmaz.</td></tr></tbody></table>

`private` ile tanımlanan değişkenler (`cdr`, `api`, `highlightTime`) yalnızca sınıfın içinden kullanılabilir, şablondan erişilemez.

{% hint style="info" %}
Frontend sürümündeki `counter` (bir sonraki ürünün sıra numarası) kaldırıldı. Ürün kimliğini artık veritabanı üretiyor.
{% endhint %}

#### Hesaplanan değerler

Bazı değerler ayrı bir değişkende saklanmaz. İhtiyaç duyulduğunda diziden yeniden hesaplanır.

<table><thead><tr><th width="204">Değer</th><th width="200.2000732421875">Hesaplayan</th><th>Ekranda nerede</th></tr></thead><tbody><tr><td>Toplam ürün adedi</td><td><code>totalQuantity()</code></td><td>Alt bardaki "Toplam Ürün Adedi"</td></tr><tr><td>En az bir ürün seçili mi?</td><td><code>isSelected()</code></td><td>"Seçilenleri Sil" butonunun aktif/pasif durumu</td></tr><tr><td>Aramaya uyan ürünler</td><td><code>filterProducts()</code></td><td>Tablo satırları</td></tr><tr><td>Satırın sıra numarası</td><td><code>$index + 1</code></td><td>Tablonun "Sıra" sütunu</td></tr><tr><td>Liste boş mu?</td><td><code>products.length == 0</code></td><td>"Eksik Yok" ekranı</td></tr></tbody></table>

**Örnek:** Toplam adedi ayrı bir değişkende tutup her işlemde artırmak/azaltmak, silme veya temizleme gibi bir işlemde güncellemenin unutulma ihtimaline karşı, `totalQuantity()` her çağrıldığında toplamı diziden baştan hesaplanır.

## Veri akışı

Listeyi değiştiren işlemlerde (ekleme, adet, silme) değişiklik önce veritabanında yapılır. Sunucu onaylayınca dizi güncellenir. Yalnızca ekranı ilgilendiren işlemler (arama, seçim modu, vurgu) sunucuya gitmez.

```
Kullanıcı işlemi (yazma / tıklama)
        │
        ▼
Şablondaki bağlama: [(ngModel)], (click), (ngSubmit)
        │
        ▼
app.ts metodu
        │
        ├── yalnızca ekran durumu (arama, seçim, vurgu) → değişkeni değiştirir
        │
        └── liste değişikliği (ekleme, adet, silme)
                │
                ▼
          product-api.ts → HTTP isteği → backend → PostgreSQL
                │
                ▼
          yanıt gelir → products dizisi güncellenir → markForCheck()
        │
        ▼
Angular değişikliği algılar → @if / @for / {{ }} yeniden hesaplanır
        │
        ▼
Ekran güncellenir
```

### İki yönlü bağlama(Two way binding)

Ekleme kutusu, arama kutusu ve onay kutuları `[(ngModel)]` ile doğrudan değişkenlere bağlıdır. Akış iki yönlüdür:

* **Ekran → değişken:** Kullanıcı yazdıkça (veya işaretledikçe) değişken anında güncellenir.
* **Değişken → ekran:** Kodda değişken değiştirildiğinde ekran da değişir. Örneğin `clean()` metodu `objectName`'i boşalttığında ekleme kutusu da boşalır.

### Uygulamanın açılışı

Bileşen oluşturulurken `constructor` bir kez çalışır ve listeyi sunucudan ister:

```ts
constructor() {
  this.loadProducts();
}

async loadProducts() {
  try {
    this.products = await firstValueFrom(this.api.getProducts());
  } catch {
    this.showError('Ürünler yüklenemedi.');
  }
  this.cdr.markForCheck();
}
```

1. `getProducts()` ile `GET /api/products` isteği gönderilir.
2. `firstValueFrom` isteğin yanıtını `await` ile beklenebilir hale getirir.
3. Gelen dizi `products` değişkenine atanır, ekran güncellenir.
4. Sunucu veya veritabanı kapalıysa "Ürünler yüklenemedi." bildirimi gösterilir ve liste boş kalır.

`constructor` `async` olamayacağı için yükleme ayrı bir metotta yapılır. `loadProducts()` başka yerlerde de "ekranı veritabanının gerçek haliyle eşitle" amacıyla kullanılır.

Veritabanında `selected` alanı olmadığı için sunucudan gelen ürünlerde hiçbir ürün seçili değildir. Bu yüzden [frontend sürümündeki](surum-gecmisi.md) `closeSelect()` çağrısına gerek kalmaz.

### Bekleme gerektiren işlemler(Asenkron İşlemler)

Çoğu işlem anında tamamlanır ve Angular ekranı hemen günceller. Üç tür işlem bekleme içerir:

* **Onay penceresi:** `add()` ve `availableProduct()` metotları `async` olarak tanımlıdır. `await Swal.fire(...)` satırında kod, kullanıcı "Artıralım" ya da "Yeterli"ye basana kadar bekler.
* **Zamanlayıcılar:** Vurgu `setTimeout` ile 6 saniye sonra kaldırılır.
* **Sunucu istekleri:** Ekleme, adet değiştirme, silme ve listeleme, `await firstValueFrom(...)` ile sunucunun yanıtını bekler.

Bu uygulama Angular'ın zone.js kullanmayan (zoneless) yapısıyla çalışır. Bu yapıda Angular, bir tıklamadan sonra gelen sunucu yanıtı gibi değişiklikleri kendiliğinden fark etmez. Bekleme bittikten sonra `this.cdr.markForCheck()` çağrılarak Angular'a ekranı yeniden kontrol etmesi söylenir.
