import pg from 'pg';

export const pgClient = new pg.Client(process.env.DB_URI);
export const connectToDb = async () => {
    try {
        await pgClient.connect();
        console.log('db connected');
    } catch (error) {
        throw new Error('db connection failed ' + error);
    }
}


