import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { client, connectDb } from './config/db';
const app = express();
app.use(express.json());

app.get('/todos', async (req, res) => {
    try {
        const response = await client.query(`SELECT * FROM todos`);
        res.json({
            message: 'todos fetched!',
            todos: response.rows
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'internal server error'
        })
    }
})

app.post('/todo', async (req, res) => {
    const { title, content } = req.body;
    try {
        const todo = await client.query(`INSERT INTO todos (title,content) VALUES ($1,$2) RETURNING *;`, [title, content])
        res.json({
            message: 'todo added',
            todo: todo.rows[0]
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'internal server error'
        })
    }
})

app.delete('/todo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await client.query(`DELETE FROM todos WHERE id=$1;`, [id]);
        res.status(200).json({
            message: 'todo deleted!'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'internal server error'
        })
    }

})

app.put('/todo/:id', async (req, res) => {
    const { id } = req.params;
    const { done } = req.body;
    try {
        const response = await client.query(`UPDATE todos SET done=$1 WHERE id=$2 RETURNING done;`, [done, id]);
        //    console.log(response);
        res.status(200).json({
            message: 'todo updated'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'internal server error'
        })
    }
})

connectDb()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('server running on PORT:' + process.env.PORT);
        })
    })
