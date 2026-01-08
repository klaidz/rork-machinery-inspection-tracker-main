import { executeQuery } from './lib/db';

async function test() {
    console.log('Attempting to connect to Azure...');
    try {
        const result = await executeQuery('SELECT name FROM sys.tables');
        console.log('✅ SUCCESS! Connected to Azure SQL.');
        console.log('Tables found:', result);
    } catch (error) {
        console.log('❌ FAILED:', error);
    }
}

test();
