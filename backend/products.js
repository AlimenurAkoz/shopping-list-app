import pool from './db.js';
async function readBody(req) {
    let text ='';
    for await (const part of req){
        text+= part;
    }
    return text? JSON.parse(text) : {};
}

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
        res.end(JSON.stringify({error: 'Ürünler alınamadı'}));
    }
}

export async function createProduct(req,res){
    try{
        const body = await readBody(req);
        const productName = typeof body.productName ==='string' ? body.productName.trim() : '';
        if(productName === ''){
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Ürün adı boş olamaz'}));
            return;
        }
        const result = await pool.query(
            'INSERT INTO products (product_name) VALUES ($1) RETURNING id, product_name AS "productName", quantity',
            [productName]
        );
        res.statusCode = 201;
        res.end(JSON.stringify(result.rows[0]));
    }catch(error){
        if(error.code === '23505'){
            res.statusCode = 409;
            res.end(JSON.stringify({error: 'Bu ürün zaten var'}));
            return;
        }
        if(error instanceof SyntaxError){
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Geçersiz JSON'}));
            return;
        }
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({error: 'Ürün eklenemedi'}));
    }
}