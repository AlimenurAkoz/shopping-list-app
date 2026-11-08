import pool from './db.js';
export async function getProducts(req, res) {
    try {
        const result = await pool.query(
            'SELECT id, product_name AS "productName", quantity FROM products ORDER BY created_at'
        );
        res.statusCode = 200;
        res.end(JSON.stringify(result.rows));
    }catch(error){
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({hata: 'Ürünler alınamadı'}));
    }
}