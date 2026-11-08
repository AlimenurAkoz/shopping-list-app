import "dotenv/config";
import { createServer } from "node:http";

const server = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if(req.method === 'OPTIONS'){
        res.statusCode = 204;
        res.end();
        return;
    }
    //geçici sorgu<
    if (req.method === 'GET' && req.url === '/api/health') {
        res.statusCode = 200;
        res.end(JSON.stringify({ "status": "ok" }));
        return;
    }
    //if'ler eşleşmediyse her şeyi yakalayan yapı olarak çalışır
    res.statusCode = 404;
    res.end(JSON.stringify({ hata: 'Bulunamadı' }));
});
server.listen(process.env.PORT, () => {
    console.log('Çalıştı')
});