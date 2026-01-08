import sql from 'mssql';
import dotenv from 'dotenv';

// Load passwords from .env file
dotenv.config();

const config: sql.config = {
    user: 'admin_rork', 
    password: process.env.DB_PASSWORD, // We will set this in Step 3
    server: 'machinery-server-klaidas.database.windows.net', 
    database: 'machinery-db',
    options: {
        encrypt: true, // Required for Azure
        trustServerCertificate: false 
    }
};

// Function to connect and run a query
export async function executeQuery(query: string, params: any[] = []) {
    try {
        const pool = await sql.connect(config);
        const request = pool.request();
        
        // Add parameters to prevent hacks
        params.forEach((p, index) => {
            request.input(`p${index}`, p);
        });

        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('SQL Error:', err);
        throw err;
    }
}