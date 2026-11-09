---
description: >-
  Alışveriş Listem; kullanıcının eksik ürünlerini yazıp listeye eklediği,
  adetlerini yönettiği ve dilediğinde tek tek ya da toplu olarak silebildiği tek
  sayfalık bir web uygulamasıdır.
---

# 🏠 Giriş

## Projenin Amacı

Proje iki aşamada geliştirildi:

1. Frontend (`v1.0-frontend`): JavaScript dizi (array) işlemlerini ve Angular'ın temel kavramlarını gerçek bir arayüz üzerinde uygulamak için geliştirildi. Veriler tarayıcıda, bir nesne dizisinde (object array) ve `sessionStorage` içinde tutuluyordu.
2. Backend (`v2.0-backend`): Uygulamaya Node.js ile yazılmış bir API ve PostgreSQL veritabanı eklendi. Veriler artık kalıcı olarak veritabanında tutulur; sayfa yenilense, sekme kapansa ya da başka bir tarayıcıdan açılsa da liste korunur. API yalnızca 4 CRUD servisinden (Create, Read, Update, Delete) oluşur.

Bu dokümantasyon projenin son halini (frontend + backend) anlatır. Yalnızca frontend'den oluşan önceki sürümün farkları ve eski dokümantasyonu için [Sürüm Geçmişi](surum-gecmisi.md) sayfasına bakabilirsiniz.

Kullanım akışı şu şekildedir:

* Kullanıcı ürün ekleme(input) çubuğuna ürünü girer ve "**Ekle**" butonu ya da "enter tuşu" aracılığıyla ekleme işlemi yapar. "[Ürün Ekleme](ozellikler-ve-metotlar.md#urun-ekleme)" başlığından detaylara ulaşabilirsiniz.
* Eklenmek istenen ürün listede mevcutsa mevcut olduğuna ve adedine dair ekrana bildirim gelir. Adet artırarak ("**Artıralım**" butonuyla) ve ya değişiklik yapamayarak ("**Yeterli**" butonuyla) işleme devam edilir. "[Tekrar Eden Ürün Uyarısı](ozellikler-ve-metotlar.md#tekrar-eden-urun-uyarisi)" başlığından detaylara ulaşabilirsiniz.
* Eklenmek istenen ürün listede mevcut değilse veritabanına kaydedilir ve ekrandaki tabloda gösterilir.
* Tabloda ilgili ürün sayısı artırıp azaltılabilir veya silinebilir. "[Adet Artırma ve Azaltma](ozellikler-ve-metotlar.md#adet-artirma-ve-azaltma)" başlığından detaylara ulaşabilirsiniz.
* Tablonun üstündeki arama çubuğu ile ürün aranabilir. "[Listede Arama](ozellikler-ve-metotlar.md#listede-arama)" başlığından detaylara ulaşabilirsiniz.
* Tablonun altındaki; "**Seç**" butonuyla istenen ürünler toplu seçilip silme işlemi yapılabilir, "**Toplam Ürün Adedi**" kutusuyla toplam ürün adedi gösterilir, "**Listeyi Temizle**" butonuyla da tüm liste temizlenebilir. "[Seçim Modu ve Toplu Silme](ozellikler-ve-metotlar.md#secim-modu-ve-toplu-silme)" başlığından detaylara ulaşabilirsiniz.
* Liste boş ise "**Eksik Yok**" yazısıyla boş bir ekran ile karşılaşılır.

<div><figure><img src=".gitbook/assets/bosListe (2).png" alt="" width="563"><figcaption></figcaption></figure> <figure><img src=".gitbook/assets/doluListe (1).png" alt="" width="563"><figcaption></figcaption></figure></div>

## Mimari

Uygulama üç katmandan oluşur. Katmanlar birbirleriyle yalnızca HTTP ve SQL üzerinden konuşur.

<table><thead><tr><th width="128">Katman</th><th width="190">Teknoloji</th><th width="170">Adres</th><th>Görevi</th></tr></thead><tbody><tr><td>Frontend</td><td>Angular 21</td><td><code>localhost:4200</code></td><td>Ekranı çizer, kullanıcı işlemlerini alır, API'yi çağırır</td></tr><tr><td>API</td><td>Node.js (<code>node:http</code>)</td><td><code>localhost:3000</code></td><td>İstekleri karşılar, doğrular, SQL çalıştırır, yanıt döndürür</td></tr><tr><td>Veritabanı</td><td>PostgreSQL 16 (Docker)</td><td><code>127.0.0.1:5433</code></td><td>Veriyi kalıcı tutar; boş ad, 1'den küçük adet ve aynı adın tekrarını engeller</td></tr></tbody></table>

```
app.html → app.ts → product-api.ts ──HTTP──► server.js → products.js → db.js ──SQL──► PostgreSQL
```

Angular doğrudan veritabanına bağlanmaz. Tarayıcıya giden kod herkese açık olduğu için veritabanı şifresi orada korunamaz. API, tarayıcıya yalnızca dört işlemi açar ve şifreyi sunucu tarafında `.env` dosyasında saklar.

## Kullanılan Teknolojiler

<table data-search="false"><thead><tr><th width="160">Araç</th><th>Kullanım Amacı</th></tr></thead><tbody><tr><td>Angular</td><td>Bileşen yapısı, veri bağlama (data binding), olay bağlama (event binding) ve kontrol akışı blokları (<code>@if</code>, <code>@for</code>, <code>@empty</code>)</td></tr><tr><td>TypeScript</td><td>Tip güvenliği; Product arayüzü (interface) ve tipli dizi (<code>Product[]</code>)</td></tr><tr><td>HTML</td><td>Form, tablo, buton ve onay kutusu yapısı</td></tr><tr><td>CSS</td><td>Flexbox ile yerleşim, konumlandırma, tema renkleri</td></tr><tr><td>FormsModule</td><td><code>[(ngModel)]</code> ile iki yönlü veri bağlama ve (<code>ngSubmit</code>) ile form gönderimi</td></tr><tr><td>HttpClient</td><td>Angular'dan API'ye HTTP isteği gönderme</td></tr><tr><td>SweetAlert2 </td><td>Tekrar eden ürün eklenirken çıkan onay penceresi ("Artıralım" / "Yeterli"), "Ürün eklenmedi." ve hata bildirimleri</td></tr><tr><td>Node.js</td><td>API sunucusu; yerleşik <code>node:http</code> modülü ile, Express kullanılmadan</td></tr><tr><td>pg</td><td>Node.js'ten PostgreSQL'e sorgu gönderme</td></tr><tr><td>dotenv</td><td>Bağlantı bilgilerini koddan ayırıp <code>.env</code> dosyasında tutma</td></tr><tr><td>nodemon</td><td>Kod kaydedildiğinde API sunucusunu yeniden başlatma (geliştirme)</td></tr><tr><td>PostgreSQL</td><td>Verilerin kalıcı olarak saklandığı veritabanı</td></tr><tr><td>Docker</td><td>PostgreSQL'i bilgisayara kurmadan, ayrı bir konteynerde çalıştırma</td></tr></tbody></table>
