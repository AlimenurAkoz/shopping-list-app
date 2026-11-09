---
description: >-
  Projenin sürümleri, sürümler arasındaki farklar ve geliştirme sırasında
  yapılan Git işlemleri.
---

# 🏷️ Sürüm Geçmişi

## Sürümler

<table><thead><tr><th width="160">Sürüm</th><th width="110">Commit</th><th>İçerik</th></tr></thead><tbody><tr><td><code>v1.0-frontend</code></td><td><code>ce6f4c8</code></td><td>Yalnızca Angular; veriler <code>sessionStorage</code> içinde</td></tr><tr><td><code>v2.0-backend</code></td><td><code>dc48bdf</code></td><td>Angular + Node.js API + PostgreSQL, 4 CRUD servisi</td></tr></tbody></table>

Bu dokümantasyon projenin son halini anlatır. Yalnızca frontend'den oluşan sürümün kodu ve dokümantasyonu ayrıca saklanır:

* Kod: [`v1.0-frontend` sürümündeki dosyalar](https://github.com/AlimenurAkoz/shopping-list-app/tree/v1.0-frontend)
* Tüm sürümler: [Etiketler (Tags)](https://github.com/AlimenurAkoz/shopping-list-app/tags)
* Dokümantasyon: GitBook'taki "Shopping List App (Frontend v1.0)" bölümü

## v1.0-frontend → v2.0-backend

<table><thead><tr><th width="190">Konu</th><th width="270">v1.0-frontend</th><th>v2.0-backend</th></tr></thead><tbody><tr><td>Verinin saklandığı yer</td><td>Tarayıcının <code>sessionStorage</code> alanı; sekme kapanınca silinir</td><td>PostgreSQL veritabanı; kalıcı</td></tr><tr><td>Ürün kimliği (<code>id</code>)</td><td><code>number</code>; sıra numarası, her silmede yeniden verilir</td><td><code>string</code> (UUID); veritabanı üretir, hiç değişmez</td></tr><tr><td>Ekrandaki sıra numarası</td><td><code>product.id</code></td><td><code>$index + 1</code></td></tr><tr><td><code>selected</code></td><td>Zorunlu alan</td><td>İsteğe bağlı (<code>selected?</code>); veritabanında yok</td></tr><tr><td>Kaldırılanlar</td><td><code>counter</code>, <code>indexSort()</code>, <code>save()</code></td><td>—</td></tr><tr><td>Eklenenler</td><td>—</td><td><code>loadProducts()</code>, <code>showError()</code>, <code>changeQuantity()</code>, <code>ProductApi</code> servisi, <code>provideHttpClient()</code></td></tr><tr><td>Ekleme</td><td><code>push()</code> ile diziye</td><td><code>POST</code> isteği, sunucunun döndürdüğü ürün diziye</td></tr><tr><td>Silme</td><td><code>findIndex()</code> + <code>splice()</code></td><td><code>DELETE</code> isteği, ardından <code>filter()</code></td></tr><tr><td>Listeyi temizleme</td><td><code>length = 0</code></td><td>Her ürün için <code>DELETE</code>, ardından listeyi yeniden yükleme</td></tr><tr><td>Aynı ürün kontrolü</td><td>Yalnızca frontend'de</td><td>Frontend'de ve veritabanında (benzersiz indeks)</td></tr><tr><td>Klasör yapısı</td><td>Angular projesi reponun kökünde</td><td><code>frontend/</code>, <code>backend/</code>, <code>documentation/</code></td></tr></tbody></table>

Arayüz, kullanım akışı, arama, seçim modu, satır vurgusu ve tekrar eden ürün uyarısı iki sürümde de aynıdır.

## Git işlemleri

### Frontend sürümünün etiketlenmesi

Backend'e başlamadan önce GitHub'daki son hal alındı ve frontend sürümü etiketlendi:

```bash
git fetch origin
git pull
git tag -a v1.0-frontend -m "Yalnızca frontend, veriler sessionStorage'da"
git push origin v1.0-frontend
```

* `git fetch` / `git pull`: GitBook, dokümantasyonu `main` dalına doğrudan yazdığı için önce GitHub'daki son hal alınır. `git status` yalnızca son `fetch` bilgisine göre konuşur.
* `git tag -a`: Açıklamalı etiket oluşturur. Etiket, bir commit'e verilen kalıcı bir addır ve hiç değişmez.
* Etiketler `git push` ile otomatik gitmez, ayrıca gönderilir.

### Backend dalı

```bash
git switch -c backend
git push -u origin backend
```

Backend, `main` dalını etkilemeden ayrı bir dalda geliştirildi. Her servis çalışır hale geldikten sonra ayrı bir commit atıldı. Commit'ten önce `git status --short` ile listede `.env` ve `node_modules` olmadığı kontrol edildi.

```
dc48bdf Angular uygulaması backend servislerine bağlandı
400b9f3 Delete (deleteProduct()) servisi eklendi
a661d5d Update(updateProduct()) servisi eklendi
1082952 Create (createProduct()) servisi eklendi
fe8fa34 READ servisi eklendi
5c25dab db.js dosyası (Veritabanı bağlantısı) eklendi
1e38a5f server.js dosyası eklendi
54192ae Backend projesi ve veritabani semasi eklendi
```

### main dalına birleştirme ve etiket

```bash
git switch main
git pull
git log --oneline main..backend
git merge backend --no-edit
git push
git tag -a v2.0-backend -m "Node.js backend ve PostgreSQL ile CRUD"
git push origin v2.0-backend
```

* `git log main..backend`: `backend` dalında olup `main` dalında olmayan commit'leri listeler.
* Birleştirme `Fast-forward` ile sonuçlandı: `main` dalında yeni commit olmadığı için `main` doğrudan `backend` dalının ucuna taşındı.

### Frontend klasörüne taşıma

Angular projesi reponun kökünden `frontend` klasörüne taşındı. Böylece kökte `frontend`, `backend` ve `documentation` yan yana durur.

* `src`, `public`, `angular.json`, `package.json`, `package-lock.json`, `tsconfig*.json`, `.editorconfig`, `.prettierrc`, `.gitignore` ve `node_modules` taşındı.
* Kökteki `.angular` (önbellek) ve `dist` (derleme çıktısı) klasörleri silindi; gerektiğinde `frontend` içinde yeniden oluşur.
* Köke yeni ve kısa bir `.gitignore` eklendi (`test.sql`, VS Code ayarları, sistem dosyaları). Angular'ın `.gitignore` dosyası `frontend` içine taşındı, çünkü içindeki `/node_modules`, `/dist` gibi kurallar dosyanın bulunduğu klasöre göre çalışır.
* `angular.json` ve `tsconfig` dosyalarındaki yollar dosyanın kendi konumuna göre yazıldığı için değiştirilmedi. Taşıma sonrası çıkan hata için bkz. [Hatalar ve Çözümleri](hatalar-ve-cozumleri.md#frontend-klasorune-tasima).

Taşıma sonrası kontrol:

```bash
git add -A
git status --short
```

Taşınan dosyalar `R` (renamed) olarak görünür; Git dosya içeriklerinden taşıma olduğunu anlar ve dosyaların geçmişi korunur. Silinmiş görünen ama hedefte olmayan dosyaları bulmak için:

```bash
git status --short | Select-String '^ D ' | ForEach-Object { $p = $_.Line.Substring(3); if (-not (Test-Path "frontend\$p")) { "EKSIK: $p" } }
```

Taşımadan sonra Angular komutları `frontend` klasöründe, backend komutları `backend` klasöründe çalıştırılır.

### Eski dokümantasyonun korunması

GitBook, Git Sync ile bir dala bağlanır; etikete bağlanamaz. Frontend dokümantasyonunu ayrı göstermek için etiketten bir dal oluşturuldu:

```bash
git branch frontend-v1 v1.0-frontend
git push origin frontend-v1
```

<table><thead><tr><th width="300">GitBook bölümü</th><th width="140">Bağlı dal</th><th>İçerik</th></tr></thead><tbody><tr><td>Shopping List App</td><td><code>main</code></td><td>Bu dokümantasyon (son sürüm)</td></tr><tr><td>Shopping List App (Frontend v1.0)</td><td><code>frontend-v1</code></td><td>Frontend sürümünün dokümantasyonu; değiştirilmez</td></tr></tbody></table>

`frontend-v1` dalına commit atılmaz, böylece etiketle aynı noktada kalır. Yeni bölüm bağlanırken ilk senkronizasyon yönü "GitHub → GitBook" seçildi; ters yön seçilseydi GitBook'taki boş bölüm GitHub'daki dosyaların üzerine yazılırdı.

#### Eski sürüme bilgisayarda geçmek

```bash
git switch --detach v1.0-frontend
```

Dosyalar o sürüme döner. Bu durumda commit atılmaz. Geri dönmek için:

```bash
git switch main
```

## Bilinen sınırlamalar

<table><thead><tr><th width="190">Konu</th><th width="270">Durum</th><th>Olası geliştirme</th></tr></thead><tbody><tr><td>Toplu silme</td><td>Her ürün için ayrı bir <code>DELETE</code> isteği gönderilir</td><td>Kimlik listesi alan ayrı bir servis</td></tr><tr><td>Ürün adını değiştirme</td><td>Update yalnızca adedi değiştirir</td><td>Adı da kabul eden bir doğrulama</td></tr><tr><td>Testler</td><td><code>ng test</code> için test ortamına <code>HttpClient</code> eklenmedi</td><td><code>provideHttpClient()</code> ve <code>provideHttpClientTesting()</code></td></tr><tr><td>CORS kökeni</td><td>Yalnızca <code>http://localhost:4200</code></td><td>Kökeni <code>.env</code> dosyasından okumak</td></tr><tr><td>Sorgu metni</td><td><code>?</code> ile parametre içeren adresler eşleşmez</td><td>Adresi <code>new URL()</code> ile ayrıştırmak</td></tr><tr><td>Kurulum belgesi</td><td><code>.env</code> Git'te olmadığı için örneği yok</td><td>Şifresiz bir <code>backend/.env.example</code></td></tr><tr><td>VS Code görevleri</td><td><code>.vscode/tasks.json</code> ve <code>launch.json</code> <code>npm start</code> komutunu kökte çalıştırır; taşımadan sonra F5 ile başlatma çalışmaz</td><td>Görevlere <code>frontend</code> klasörünü belirtmek</td></tr><tr><td>Kullanılmayan kod</td><td><code>title</code> değişkeni ve <code>signal</code> importu</td><td>Silinebilir</td></tr><tr><td>Konteyner</td><td>Bilgisayar açılınca kendiliğinden başlamaz</td><td><code>docker update --restart unless-stopped shoppinglist_postgres</code></td></tr></tbody></table>
