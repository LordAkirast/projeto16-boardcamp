import express from "express"
import cors from "cors"
import { db } from "./databases/database.connection.js"
import Joi from "joi"


const app = express()
app.use(cors())
app.use(express.json())


const createGame = Joi.object({
    name: Joi.string().required(),
    stockTotal: Joi.number().required(),
    pricePerDay: Joi.number().required(),
});


app.get("/games", async (req, res) => {

    try {
        const jogos = await db.query(`SELECT * FROM games;`)
        res.send(jogos.rows)
    } catch (err) {
        res.status(500).send(err.message)

    }

})

app.post("/games", async (req, res) => {

    const { name, image, stockTotal, pricePerDay } = req.body

    const gameData = {
        name,
        image,
        stockTotal,
        pricePerDay
    }


    const validation = createGame.validate({ name, stockTotal, pricePerDay }, { abortEarly: "False" })
    if (validation.error) {
        console.log("erro 1")
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors);
    }

    try {
        const jogos = await db.query('SELECT * FROM games WHERE name = $1;', [name]);
        if (jogos.rows.length > 0) {
            res.status(409).send("Jogo de mesmo nome já existe!")
        } else {
            await db.query(
                'INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);',
                [name, image, stockTotal, pricePerDay]
            ); res.status(201).send("Jogo inserido!")
        }
    } catch (err) {
        res.status(500).send(err.message)

    }

})



app.listen(5000, () => console.log("Servidor ligado!"))