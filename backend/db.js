import {Pool} from 'pg';
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
export default pool;
/*şu kullanım da yapılabilir(default zorunlu değil):
export const pool = new Pool({...});
*/