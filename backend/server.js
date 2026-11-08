import "dotenv/config";
import pool from "./db.js";
import { createServer } from "node:http";
import { retry } from "rxjs";

const server = createServer(async(req, res) => {
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
        try{
            const result = await pool.query('SELECT NOW()');
            res.statusCode = 200;
            res.end(JSON.stringify({"status": "ok"}));
            return;
        }catch (hata){
            res.statusCode = 500;
            res.end(JSON.stringify({"hata": "error"}));
            return;
        }
    }
    //if'ler eşleşmediyse her şeyi yakalayan yapı olarak çalışır
    res.statusCode = 404;
    res.end(JSON.stringify({ hata: 'Bulunamadı' }));
});
server.listen(process.env.PORT, () => {
    console.log('Çalıştı')
});