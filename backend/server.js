import "dotenv/config";
import { getProducts, createProduct, updateProduct } from "./products.js";
import { createServer } from "node:http";

const server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    //READ Servisi
    if (req.method === 'GET' && req.url === '/api/products') {
        await getProducts(req, res);
        return;
    }
    //CREATE Servisi
    if (req.method === 'POST' && req.url === '/api/products') {
        await createProduct(req, res);
        return;
    }
    //UPDATE servisi
    if (req.method === 'PATCH' && req.url.startsWith('/api/products/')) {
        const id = req.url.slice('/api/products/'.length);
        await updateProduct(req, res, id);
        return;
    }
    //if'ler eşleşmediyse her şeyi yakalayan yapı olarak çalışır
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Bulunamadı' }));
});
server.listen(process.env.PORT, () => {
    console.log('Çalıştı')
});