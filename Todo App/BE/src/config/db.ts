import pg from 'pg';

export const client = new pg.Client(String(process.env.DB_URI));

export const connectDb = async () => {
    try {
        await client.connect();
        await client.query(`CREATE TABLE IF NOT EXISTS todos(
            id SERIAL,
            title VARCHAR(20) NOT NULL,
            content VARCHAR(50),
            done BOOLEAN DEFAULT false,
            CONSTRAINT todos_pkey PRIMARY KEY (id)
            );`);
        console.log('db connected');
    } catch (error) {
        throw new Error('db connection failed:' + error);
    }
}
