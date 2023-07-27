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

const createCustomer = Joi.object({
    name: Joi.string().required(),
    phone: Joi.number().required(),
    cpf: Joi.number().required(),
    birthday: Joi.date().required()
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


    const validation = createGame.validate({ stockTotal, pricePerDay }, { abortEarly: "False" })
    if (validation.error) {
        console.log("erro 1")
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors);
    }

    if (stockTotal <= 0 || pricePerDay <= 0) {
        return res.status(400).send("stockTotal e/ou pricePerDay devem ser maiores do que 0.")
    }

    if (!name) {
        return res.status(400).send("name precisa ser preenchido!")
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

app.get("/customers", async (req, res) => {

    try {
        const clientes = await db.query(`SELECT * FROM customers;`)
        res.send(clientes.rows)
    } catch (err) {
        res.status(500).send(err.message)

    }

})

app.get("/customers:id", async (req, res) => {
    const { id } = req.params


    try {
        const cliente = await db.query(`SELECT * FROM customers where id = $1;`, [id])
        if (cliente.rows[0].length <= 0) {
            res.status(404).send('ID de cliente não encontrado!')
        } else {
            res.send(cliente.rows[0])
        }
    } catch (err) {
        res.status(500).send(err.message)

    }

})

app.post("/customers", async (req, res) => {

    const { name, phone, cpf, birthday } = req.body

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }



    const validation = createCustomer.validate({ name, phone, cpf, birthday }, { abortEarly: "False" })
    if (validation.error) {
        console.log("erro 1 - customers")
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors);
    }

    let phoneValidation = phone.toString();
    let cpfValidation = cpf.toString();

    if (phoneValidation.length < 10 || phoneValidation.length > 11) {
        return res.status(400).send(`Phone deve ter 10 ou 11 caracteres. Atualmente ele tem: ${phoneValidation.length}`)
    }

    if (cpfValidation.length < 11) {
        return res.status(400).send(`CPF deve ter 11 caracteres. Atualmente ele tem: ${cpfValidation.length}`)
    }

    if (!name) {
        return res.status(400).send("name precisa ser preenchido!")
    }

    try {
        const customer = await db.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
        if (customer.rows.length > 0) {
            res.status(409).send("Cliente de mesmo cpf já existe!")
        } else {
            await db.query('INSERT INTO customers(name, phone, cpf, birthday) values ($1, $2, $3, $4);', [name, phone, cpf, birthday]);
            res.status(201).send("Cliente criado!")
        }
    } catch (err) {
        res.status(500).send(err.message)

    }

})

app.put("/customers:id", async (req, res) => {

    const { id } = req.params
    const { name, phone, cpf, birthday } = req.body

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }



    const validation = createCustomer.validate({ name, phone, cpf, birthday }, { abortEarly: "False" })
    if (validation.error) {
        console.log("erro 1 - customers update")
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(422).send(errors);
    }

    let phoneValidation = phone.toString();

    if (phoneValidation.length < 10 || phoneValidation > 11) {
        return res.status(400).send(`Erro ao tentar atualizar dados: Phone deve ter 10 ou 11 caracteres. Atualmente ele tem: ${phoneValidation.length}`)
    }

    if (!name) {
        return res.status(400).send("Erro ao tentar atualizar dados: name precisa ser preenchido!")
    }

    try {
        const customer = await db.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
        if (customer.rows.length > 0) {
            res.status(409).send("Cliente de mesmo cpf já existe!")
        } else {
            await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
            res.status(201).send("Cliente alterado!")
        }
    } catch (err) {
        res.status(500).send(err.message)

    }

})



app.listen(5000, () => console.log("Servidor ligado!"))