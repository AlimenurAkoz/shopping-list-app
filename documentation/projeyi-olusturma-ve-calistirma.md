# ⚒️ Projeyi Oluşturma ve Çalıştırma

Proje üç parçadan oluşur: Angular uygulaması (`frontend/`), Node.js API'si (`backend/`) ve Docker'da çalışan PostgreSQL veritabanı. Bu sayfa önce her parçanın sıfırdan nasıl oluşturulduğunu, sonra hazır projenin nasıl çalıştırılacağını anlatır.

## Gereksinimler

```
node -v
npm -v
docker --version
```

Bu projede kullanılan sürümler: Node.js `v24.22.1`, npm `11.19.1`, Angular CLI `21.2.27`. PostgreSQL bilgisayara kurulmaz, Docker Desktop yeterlidir.

## Frontend'i Oluşturma(Sıfırdan)

1. Angular CLI'ı Kur

```
npm install -g @angular/cli
ng version
```

2. Projeyi Oluştur

```
mkdir frontend
cd frontend
ng new shopping-list-app --directory .
```

`ng new` çalışırken sorulan sorulara bu projede verilen cevaplar:

<table><thead><tr><th width="675.8000183105469">Soru</th><th>Cevap</th></tr></thead><tbody><tr><td>Would you like to share pseudonymous usage data about this project with the Angular Team at Google under Google's Privacy Policy at https://policies.google.com/privacy. For more details and how to change this setting, see https://angular.dev/cli/analytics . (y/N) <br>(Google'ın https://policies.google.com/privacy adresindeki Gizlilik Politikası uyarınca, bu projeye ilişkin takma adla ilişkilendirilmiş kullanım verilerini Google'daki Angular Ekibi ile paylaşmak ister misiniz? Daha fazla bilgi ve bu ayarı nasıl değiştireceğinizi öğrenmek için https://angular.dev/cli/analytics adresini ziyaret edin.(e/H)</td><td><code>N</code> (hayır)</td></tr><tr><td>Stylesheet format</td><td><code>CSS</code></td></tr><tr><td>SSR / prerendering</td><td><code>No</code></td></tr><tr><td>AI tools</td><td><code>None</code></td></tr></tbody></table>

{% hint style="info" %}
Soruların sırası ve adı CLI sürümüne göre değişebilir. Proje ilk olarak reponun kökünde oluşturulmuş, backend eklendikten sonra `frontend` klasörüne taşınmıştır. Taşıma için [Sürüm Geçmişi](surum-gecmisi.md#frontend-klasorune-tasima) sayfasına bakabilirsiniz.
{% endhint %}

3. Her ürünün hangi alanlara sahip olacağını ve bu alanların tiplerini belirlemek amacıyla `product.ts` dosyasını oluştur:

```
cd src/app
ng generate interface models/product
```

4. Onay penceresi ve bildirim ekranı için SweetAlert2'yi yükle:

```bash
npm install sweetalert2
```

`app.ts` dosyasında içeri alınır:

```ts
import Swal from 'sweetalert2';
```

5. Backend ile konuşacak servisi oluştur. Komut `frontend` klasöründe çalıştırılır:

```bash
ng generate service services/product-api
```

Ad `product` verilseydi `Product` adında bir sınıf oluşur ve modeldeki `Product` arayüzüyle çakışırdı. Servisin içeriği [ProductApi Servisi](productapi-servisi.md) sayfasında anlatılıyor.

## Veritabanını Oluşturma(Docker)

Bilgisayarda başka bir proje 5432 portunda PostgreSQL kullandığı için bu projeye ayrı bir konteyner açıldı ve 5433 portu kullanıldı. Komut tek satırda çalıştırılmalıdır; iki satıra bölünürse PowerShell ikinci satırı ayrı bir komut sanar.

```bash
docker run -d --name shoppinglist_postgres -e POSTGRES_USER=shopping_user -e POSTGRES_PASSWORD=<şifre> -e POSTGRES_DB=shopping_list -p 5433:5432 -v shoppinglist_data:/var/lib/postgresql/data postgres:16-alpine
```

<table><thead><tr><th width="250">Parametre</th><th>Açıklama</th></tr></thead><tbody><tr><td><code>-d</code></td><td>Konteyneri arka planda çalıştırır</td></tr><tr><td><code>--name</code></td><td>Konteynerin adı</td></tr><tr><td><code>-e POSTGRES_USER / PASSWORD / DB</code></td><td>İlk açılışta oluşturulacak kullanıcı, şifre ve veritabanı</td></tr><tr><td><code>-p 5433:5432</code></td><td>Bilgisayarın 5433 portunu konteynerin 5432 portuna bağlar</td></tr><tr><td><code>-v</code></td><td>Verileri konteyner silinse bile kalan bir alanda (volume) tutar</td></tr></tbody></table>

Kontrol:

```bash
docker ps
docker logs shoppinglist_postgres --tail 5
```

Son satırda "database system is ready to accept connections" görülmelidir. Konteyner oluştuktan sonra tablo [Veritabanı](veritabani.md) sayfasındaki `schema.sql` komutlarıyla bir kez oluşturulur.

## Backend'i Oluşturma(Sıfırdan)

1. Klasörü ve Node.js projesini oluştur (reponun kökünde):

```bash
mkdir backend
cd backend
npm init -y
```

2. `package.json` dosyasında iki değişiklik yap:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "nodemon server.js"
},
"type": "module",
```

* `"type": "module"`, kodda Angular'daki gibi `import`/`export` kullanılmasını sağlar. Bu ayarla yerel dosyalar uzantısıyla içe aktarılır: `./db.js`.
* `"dev"`, `npm run dev` komutunun ne çalıştıracağını belirler.

3. Paketleri yükle:

```bash
npm install pg dotenv
npm install -D nodemon
```

<table><thead><tr><th width="120">Paket</th><th>Görevi</th></tr></thead><tbody><tr><td><code>pg</code></td><td>Node.js'ten PostgreSQL'e sorgu gönderir</td></tr><tr><td><code>dotenv</code></td><td><code>.env</code> dosyasındaki değerleri <code>process.env</code> içine yükler</td></tr><tr><td><code>nodemon</code></td><td>Dosya kaydedilince sunucuyu yeniden başlatır. <code>-D</code> ile yalnızca geliştirme bağımlılığı olarak kurulur</td></tr></tbody></table>

API, Node.js'in yerleşik `node:http` modülüyle yazıldığı için Express kurulmadı.

4. `backend` klasöründe `.env` dosyasını oluştur:

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=shopping_user
DB_PASSWORD=<şifre>
DB_NAME=shopping_list
```

`PORT` API'nin, `DB_PORT` veritabanının portudur. `localhost` yerine `127.0.0.1` yazıldı, çünkü Windows `localhost` adını IPv6 adresine çözümleyebiliyor.

5. `backend` klasöründe `.gitignore` dosyasını oluştur:

```
node_modules/
.env
```

{% hint style="warning" %}
`.env` dosyası veritabanı şifresini içerdiği için Git'e gönderilmez. Kontrol için `git check-ignore node_modules .env` komutu iki adı da yazdırmalıdır.
{% endhint %}

## Projeyi Çalıştırma

#### Hazır projeyi bilgisayara alıp kurmak için:

```bash
git clone https://github.com/AlimenurAkoz/shopping-list-app
cd shopping-list-app/frontend
npm install
cd ../backend
npm install
```

Ardından `backend/.env` dosyası yukarıdaki gibi oluşturulur, PostgreSQL konteyneri `docker run` ile açılır ve `schema.sql` komutları veritabanında bir kez çalıştırılır.

#### Her çalışmada:

<table><thead><tr><th width="70">Sıra</th><th width="190">Ne</th><th width="250">Nerede</th><th>Komut</th></tr></thead><tbody><tr><td>1</td><td>Docker Desktop</td><td>—</td><td>Uygulamayı aç</td></tr><tr><td>2</td><td>Veritabanı</td><td>Herhangi bir terminal</td><td><code>docker start shoppinglist_postgres</code></td></tr><tr><td>3</td><td>API</td><td>1. terminal, <code>backend</code></td><td><code>npm run dev</code></td></tr><tr><td>4</td><td>Frontend</td><td>2. terminal, <code>frontend</code></td><td><code>npm start</code> veya <code>ng serve</code></td></tr><tr><td>5</td><td>Tarayıcı</td><td>—</td><td><code>http://localhost:4200</code></td></tr></tbody></table>

API terminali kapatılmamalıdır; frontend için VS Code'da `+` ile ikinci bir terminal açılır. Konteyner bilgisayar açılınca kendiliğinden başlamaz.

Frontend geliştirme sunucusu aşağıdaki iki komuttan biriyle başlatılır:

<table><thead><tr><th width="125.79998779296875">Komut</th><th>Açıklama</th></tr></thead><tbody><tr><td><code>npm start</code></td><td><code>package.json</code> içindeki <code>start</code> betiğini çalıştırır. Projeyle birlikte inen yerel Angular CLI'ı kullandığı için Angular CLI'ın global kurulu olmasına gerek yoktur.</td></tr><tr><td><code>ng serve</code></td><td>Angular CLI'ın doğrudan komutudur. Global kurulu <code>ng</code> gerektirir. Ek parametreleri kolayca yazmak için uygundur (örneğin <code>ng serve --port 4300</code>).</td></tr></tbody></table>

{% hint style="warning" %}
API, yalnızca `http://localhost:4200` adresinden gelen tarayıcı isteklerine izin verir (CORS). Frontend başka bir portta açılırsa istekler engellenir.
{% endhint %}

#### Kapatma:

1. API ve frontend terminallerinde `Ctrl + C`
2. `docker stop shoppinglist_postgres`

## Diğer komutlar

#### Testleri çalıştırmak için(.spec.ts dosyaları, `frontend` klasöründe):

```bash
ng test
```

veya

```bash
npm test
```

Testler izleme modunda açılır. Beklenen sonuç:

<figure><img src=".gitbook/assets/image (1).png" alt=""><figcaption></figcaption></figure>

{% hint style="info" %}
Görseldeki sonuç frontend sürümüne aittir. `product-api.spec.ts` ve `app.spec.ts` test ortamına `HttpClient` eklenmediği için backend'li sürümde bu testler hata verebilir. Bkz. [Sürüm Geçmişi](surum-gecmisi.md#bilinen-sinirlamalar).
{% endhint %}

#### Uygulamayı derlemek için(`frontend` klasöründe):

```bash
ng build
```

veya

```bash
npm run build
```

#### Veritabanına terminalden bağlanmak için:

```bash
docker exec -it shoppinglist_postgres psql -U shopping_user -d shopping_list
```

`psql` bilgisayarda kurulu olmadığı için konteynerin içindeki `psql` kullanılır. İçeride `\d products` tablo yapısını gösterir, `\q` çıkar.
