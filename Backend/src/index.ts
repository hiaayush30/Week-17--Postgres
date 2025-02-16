import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { connectToDb, pgClient } from './config/db';
const app = express();

app.use(express.json());

app.get('/todos', async (req, res) => {
    const response = await pgClient.query(`
        SELECT * FROM todos;
        `)
    res.json({
        message: 'todos fetched',
        data: response.rows
    })
})


app.post('/users', async (req, res): Promise<any> => {
    const { username, email, password } = req.body;
    try {

        await pgClient.query(`BEGIN`);
        const response = await pgClient.query(`
        INSERT INTO users(username,email,password) VALUES($1,$2,$3) RETURNING id;`
            , [username, email, password]);
        console.log(response);

        const addressInsertQuery = `INSERT INTO addresses (city,country,street,pincode,user_id) VALUES
        ($1,$2,$3,$4,$5);`

        const addressInsertResponse = await pgClient.query(addressInsertQuery,
            [req.body.city, req.body.country, req.body.street, req.body.pincode, response.rows[0].id]);
        await pgClient.query('COMMIT');
        return res.status(201).json({
            message: 'user created'
        })
    } catch (error) {
        console.log('error in signup ' + error);
        return res.status(500).json({
            message: 'internal server error'
        })
    }
})

app.post('/todos', async (req, res): Promise<any> => {
    const { title } = req.body;
    console.log(title);
    try {
        const response = await pgClient.query(`
            INSERT INTO todos (title,done) VALUES ('${title}','false'); 
            `);
        return res.json({
            message: "todo added!"
        })
    } catch (error) {
        await pgClient.query(`ROLLBACK`);
        console.log('error in adding todo ' + error);
        return res.status(500).json({
            message: 'internal server error'
        })
    }
})

app.get('/metadata/:id', async (req, res): Promise<any> => {
    // given the user id return all their metadata from all tables
    const id = req.params.id;
    try {
        // const query1 = `SELECT * FROM users WHERE user_id=$1;`;
        // const usersResponse = await pgClient.query(query1,[id]);
        // const query2 = `SELECT * FROM addresses WHERE user_id=$1;`;
        // const addressResponse = await pgClient.query(query2,[id]);
        //using JOIN
        const query1 = `SELECT users.username,users.email,addresses.country,addresses.city FROM users
         JOIN addresses ON users.id=addresses.user_id 
         WHERE users.id=$1`;
        const response = await pgClient.query(query1, [id]);
        return res.status(200).json({
            user: response.rows,
            // address: addressResponse.rows
        })
    } catch (error) {
        console.log('error in fetching metadata' + error);
    }
})

connectToDb()
    .then(() => {
        app.listen(3000, () => {
            console.log('server running on ' + 3000);
        })
    })