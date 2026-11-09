# 📐 Interface(Arayüz)

Listedeki her ürün, `Product` arayüzüne uyan bir nesnedir. Ürünler, bu arayüz kullanılarak tanımlanan bir nesne dizisinde tutulur.

## Product Arayüzü

Dosya: [`product.ts`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/frontend/src/app/models/product.ts)

```ts
export interface Product {
    id: string;
    productName: string;
    quantity: number;
    selected?: boolean;
}
```

<table><thead><tr><th width="132.99993896484375">Alan</th><th width="110">Tip</th><th width="296.0001220703125">Açıklama</th><th>Değeri nereden gelir</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>Ürünün kalıcı kimliği (UUID). Ürün silinse de diğerlerinin kimliği değişmez</td><td>Veritabanı üretir</td></tr><tr><td><code>productName</code></td><td><code>string</code></td><td>Kullanıcının girdiği ürün adı</td><td>Giriş kutusundaki değer</td></tr><tr><td><code>quantity</code></td><td><code>number</code></td><td>Ürün adedi 1'den küçük olamaz</td><td>Yeni üründe veritabanı <code>1</code> verir</td></tr><tr><td><code>selected</code></td><td><code>boolean</code> (isteğe bağlı)</td><td>Seçim modunda ürünün işaretli olup olmadığı</td><td>Yalnızca ekranda; veritabanında yok</td></tr></tbody></table>

**Örnek:** Backend'den iki ürün geldiğinde dizi şu şekilde görünür:

```json
[
  { "id": "4940774e-948f-49ef-a9f2-82ebf48bb5fa", "productName": "Elma",  "quantity": 2 },
  { "id": "1d595004-3617-493b-8b73-d7d82c9e58c3", "productName": "Armut", "quantity": 1 }
]
```

### Frontend sürümünden farklar

* `id: number` → `id: string`: Önceden `id` ekrandaki sıra numarasıydı ve her silmeden sonra yeniden veriliyordu. Artık veritabanının ürettiği, hiç değişmeyen bir UUID metni. Ekrandaki sıra numarası `app.html` içinde `$index + 1` ile gösterilir.
* `selected: boolean` → `selected?: boolean`: `?` alanı isteğe bağlı yapar. Seçim yalnızca ekranın o anki durumu olduğu için veritabanında tutulmaz ve backend bu alanı göndermez. Alan olmadığında değeri `undefined` olur ve `false` gibi davrandığı için seçim mantığı değişmeden çalışır.

`product.ts` dosyası hiçbir işlem yapmaz, yalnızca bir ürünün neye benzediğini tarif eder. Ürün ekleme, silme, arama gibi asıl işler `app.ts` dosyasında yapılır.

Ürünler [`app.ts`](https://github.com/AlimenurAkoz/shopping-list-app/blob/main/frontend/src/app/app.ts) dosyasında, `Product` yapısına uyan nesnelerden oluşan, başlangıçta boş olan, `products` dizisi tanımlanır.

```ts
products: Product[] = [];
```

`product.ts` dosyasının yazılma amacı:

* Ürünlerin hangi alanlardan oluştuğunu tek yerde tanımlamak. Arayüz hem `app.ts` hem `product-api.ts` dosyasında kullanılır.
* Bir alan eksikse, yanlış yazılmışsa ya da yanlış tipte kullanılmışsa hatayı uygulama çalışmadan önce görmek. TypeScript, kodu derlerken her ürünü bu şablona göre kontrol eder.

| Yapılan hata                                       | TypeScript'in verdiği uyarı                              |
| -------------------------------------------------- | -------------------------------------------------------- |
| Var olmayan bir alan kullanıldı (`p.searchText`)   | `Property 'searchText' does not exist on type 'Product'` |
| Sayı tipindeki adet alanında `.length` kullanıldı  | `Property 'length' does not exist on type 'number'`      |
| `id` alanına sayı atanmaya çalışıldı               | `Type 'number' is not assignable to type 'string'`       |

* Metotların ne beklediğini, ne döndürdüğünü belirleyerek kod okunabilirliğini kolaylaştırmak.
* Backend ile frontend arasındaki veri biçimini belgelemek. Backend'deki SQL sorguları `product_name` sütununu `productName` adıyla döndürür, böylece gelen veri bu arayüze uyar.
* Proje büyüdüğünde aynı arayüzü `import` ederek yeniden kullanılabilirliğini sağlamak. Interface'in başındaki `export` anahtar kelimesi import edilmesini sağlar.

```ts
import { Product } from './models/product';
```

{% hint style="info" %}
Arayüz yalnızca TypeScript'in derleme sırasında kullandığı bir şablondur, tarayıcıya giden JavaScript'te yer almaz. Backend'in gerçekten bu biçimde veri göndermesini SQL sorgusundaki `AS "productName"` sağlar.
{% endhint %}
