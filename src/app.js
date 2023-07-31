import express from "express"
import cors from "cors"
import { db } from "./databases/database.connection.js"
import Joi from "joi"
import dayjs from "dayjs"
import gameRouter from './routers/gameRouter.js'
import customerRouter from './routers/customerRouter.js'
import rentalsRouter from './routers/rentalsRouter.js'


const app = express()
app.use(cors())
app.use(express.json())



const createGame = Joi.object({
    stockTotal: Joi.number().required(),
    pricePerDay: Joi.number().required(),
});

const createCustomer = Joi.object({
    phone: Joi.string().required(),
    cpf: Joi.number().required(),
    birthday: Joi.date().iso().required()
});

const createRent = Joi.object({
    customerId: Joi.number().required(),
    gameId: Joi.number().required(),
    daysRented: Joi.number().required(),
});


app.use('/games', gameRouter);

// app.get("/games", async (req, res) => {

//     try {
//         const jogos = await db.query(`SELECT * FROM games;`)
//         res.send(jogos.rows)
//     } catch (err) {
//         res.status(500).send(err.message)

//     }

// })

// app.post("/games", async (req, res) => {

//     const { name, image, stockTotal, pricePerDay } = req.body

//     const gameData = {
//         name,
//         image,
//         stockTotal,
//         pricePerDay
//     }


//     const validation = createGame.validate({ stockTotal, pricePerDay }, { abortEarly: "False" })
//     if (validation.error) {
//         console.log("erro 1")
//         const errors = validation.error.details.map((detail) => detail.message)
//         return res.status(422).send(errors);
//     }

//     if (stockTotal <= 0 || pricePerDay <= 0) {
//         return res.status(400).send("stockTotal e/ou pricePerDay devem ser maiores do que 0.")
//     }

//     if (!name) {
//         return res.status(400).send("name precisa ser preenchido!")
//     }

//     try {
//         const jogos = await db.query('SELECT * FROM games WHERE name = $1;', [name]);
//         if (jogos.rows.length > 0) {
//             res.status(409).send("Jogo de mesmo nome já existe!")
//         } else {
//             await db.query(
//                 'INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ($1, $2, $3, $4);',
//                 [name, image, stockTotal, pricePerDay]
//             ); res.status(201).send("Jogo inserido!")
//         }
//     } catch (err) {
//         res.status(500).send(err.message)

//     }

// })

app.use('/games', gameRouter);

// app.get("/customers", async (req, res) => {

//     try {
//         const clientes = await db.query(`SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers;`)
//         res.send(clientes.rows)
//     } catch (err) {
//         res.status(500).send(err.message)

//     }

// })

app.use('/customers', customerRouter);

// app.get("/customers/:id", async (req, res) => {
//     const { id } = req.params


//     try {
//         const cliente = await db.query(`SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers where id = $1;`, [id])
//         if (cliente.rows.length <= 0) {
//             res.status(404).send('ID de cliente não encontrado!')
//         } else {
//             res.send(cliente.rows[0])
//         }
//     } catch (err) {
//         res.status(500).send(err.message)

//     }

// })

app.use('/customers/:id', customerRouter);

// app.post("/customers", async (req, res) => {

//     const { name, phone, cpf, birthday } = req.body

//     const customerData = {
//         name,
//         phone,
//         cpf,
//         birthday
//     }


//     const validation = createCustomer.validate({ phone, cpf, birthday }, { abortEarly: "False" })
//     if (validation.error) {
//         console.log("erro 1 - customersaaa")
//         const errors = validation.error.details.map((detail) => detail.message)
//         return res.status(400).send(errors);
//     }

//     let phoneValidation = phone.toString();
//     let cpfValidation = cpf.toString();
//     let birthdayValidation = birthday.toString();

//     if (!name) {
//         return res.status(400).send('Nome precisa ser preenchido!')
//     }

//     if (phoneValidation.length < 10 || phoneValidation.length > 11) {
//         return res.status(400).send(`Phone deve ter 10 ou 11 caracteres. Atualmente ele tem: ${phoneValidation.length}`)
//     }

//     if (cpfValidation.length !== 11) {
//         return res.status(400).send(`CPF deve ter 11 caracteres. Atualmente ele tem: ${cpfValidation.length}`)
//     }

//     if (!name) {
//         return res.status(400).send("name precisa ser preenchido!")
//     }

//     if (birthdayValidation.length !== 10) {
//         return res.status(400).send(`birthday deve ter 10 caracteres contando com hifen. Ex: 1995-05-12. Atualmente ele tem: ${birthdayValidation.length}`)
//     }

//     try {
//         const formatedBirthday = birthday.slice(0, 10);
//         console.log(birthday)
//         console.log(formatedBirthday)
//         const customer = await db.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
//         if (customer.rows.length > 0) {
//             res.status(409).send("Cliente de mesmo cpf já existe!")
//         } else {
//             await db.query('INSERT INTO customers(name, phone, cpf, birthday) values ($1, $2, $3, $4);', [name, phone, cpf, formatedBirthday]);
//             res.status(201).send("Cliente criado!")
//         }
//     } catch (err) {
//         res.status(500).send(err.message)

//     }

// })

app.use('/customers', customerRouter);


// app.put("/customers/:id", async (req, res) => {

//     const { id } = req.params
//     const { name, phone, cpf, birthday } = req.body

//     const customerData = {
//         name,
//         phone,
//         cpf,
//         birthday
//     }



//     const validation = createCustomer.validate({ phone, cpf, birthday }, { abortEarly: "False" })
//     if (validation.error) {
//         console.log("erro 1 - customers update")
//         const errors = validation.error.details.map((detail) => detail.message)
//         return res.status(400).send(errors);
//     }

//     let phoneValidation = phone.toString();
//     let cpfValidation = cpf.toString();
//     let birthdayValidation = birthday.toString();

//     if (phoneValidation.length < 10 || phoneValidation.length > 11) {
//         return res.status(400).send(`Erro ao tentar atualizar dados: Phone deve ter 10 ou 11 caracteres. Atualmente ele tem: ${phoneValidation.length}`)
//     }

//     if (!name) {
//         return res.status(400).send("Erro ao tentar atualizar dados: name precisa ser preenchido!")
//     }

//     if (cpfValidation.length !== 11) {
//         return res.status(400).send(`CPF deve ter 11 caracteres. Atualmente ele tem: ${cpfValidation.length}`)
//     }

//     if (birthdayValidation.length !== 10) {
//         return res.status(400).send(`birthday deve ter 10 caracteres contando com hifen. Ex: 1995-05-12. Atualmente ele tem: ${birthdayValidation.length}`)
//     }

//     try {
//         ///busca no banco onde o cpf e id é o mesmo. para alterar valor da mesma pessoa
//         const customer = await db.query('SELECT * FROM customers WHERE cpf = $1 and id = $2;', [cpf, id])
//         ///se encontrar, ele altera. 
//         if (customer.rows.length > 0) {
//             ///atualiza os dados que não seja cpf
//             await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
//             res.status(200).send("Cliente alterado!")

//         } else {
//             //se não encontrar, faz mais uma busca, para ver se tem alguem com esse cpf no banco
//             try {
//                 ///se encontrar, ele não altera e dá erro
//                 const customer = await db.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
//                 if (customer.rows.length > 0) {
//                     res.status(409).send(`O CPF ${cpf} não pode ser o de outro cliente!`)

//                 } else {
//                     ///se não encontrar, ele altera
//                     await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
//                     res.status(200).send("Cliente alterado!")
//                 }
//             } catch (error) {

//             }
//             res.status(409).send(`O CPF ${cpf} não pode ser o de outro cliente!`)
//         }
//     } catch (err) {
//         res.status(500).send(err.message)

//     }

// })

app.use('/customers/:id', customerRouter);

// app.get("/rentals", async (req, res) => {
//     try {
//         const query = `
//             SELECT rentals.id, rentals."customerId", rentals."gameId", rentals."rentDate", rentals."daysRented", rentals."returnDate", rentals."originalPrice", rentals."delayFee",
//                    customers.id as customer_id, customers.name as customer_name,
//                    games.id as game_id, games.name as game_name
//             FROM rentals
//             JOIN customers ON rentals."customerId" = customers.id
//             JOIN games ON rentals."gameId" = games.id;
//         `;

//         const alugueis = await db.query(query);
//         const formattedRentals = alugueis.rows.map((aluguel) => {
//             return {
//                 id: aluguel.id,
//                 customerId: aluguel.customerId,
//                 gameId: aluguel.gameId,
//                 rentDate: aluguel.rentDate,
//                 daysRented: aluguel.daysRented,
//                 returnDate: aluguel.returnDate,
//                 originalPrice: aluguel.originalPrice,
//                 delayFee: aluguel.delayFee,
//                 customer: {
//                     id: aluguel.customer_id,
//                     name: aluguel.customer_name
//                 },
//                 game: {
//                     id: aluguel.game_id,
//                     name: aluguel.game_name
//                 }
//             };
//         });

//         res.send(formattedRentals);
//     } catch (err) {
//         res.status(500).send(err.message);
//     }
// });

app.use('/rentals', rentalsRouter);


// app.post("/rentals", async (req, res) => {

//     let { customerId, gameId, daysRented } = req.body



//     try {
//         const jogos = await db.query(`SELECT * FROM games where id = $1`, [gameId])
//         if (jogos.rows.length <= 0) {
//             res.status(404).send("Jogo não encontrado!")
//         } else {
//             let pricePerDay = jogos.rows[0].pricePerDay
//             console.log('jogo encontrado com sucesso - 1')


//             let originalPrice = daysRented * pricePerDay


//             const rentData = {
//                 customerId: 1,
//                 gameId: 1,
//                 daysRented: 3
//             }

//             ///parte de data
//             const dataAtual = dayjs();
//             let rentDate = dataAtual.format('YYYY-MM-DD')
//             ///
//             let returnDate = null;
//             let delayFee = null;



//             const validation = createRent.validate({ customerId, gameId, daysRented }, { abortEarly: "False" })
//             if (validation.error) {
//                 console.log("erro 1 - rent")
//                 const errors = validation.error.details.map((detail) => detail.message)
//                 return res.status(422).send(errors);
//             }

//             if (daysRented <= 0) {
//                 return res.status(400).send("daysRented deve ser maior do que 0.")
//             }


//             try {
//                 const jogos = await db.query('SELECT rentals.*, games.* FROM rentals JOIN games ON rentals."gameId" = games.id WHERE rentals."gameId" = $1 AND games.id = $2;', [gameId, gameId]);
//                 console.log(jogos.rows.length)
//                 if (jogos.rows.length > 0) {
//                     ///se for maior que zero. significa que o jogo ja foi alugado. portanto, vai diminuir stocktotal em 1
//                     const jogo = jogos.rows[0];
//                     console.log('fase 2')
//                     console.log(jogo.stockTotal)
//                     if (jogo.stockTotal === 1) {
//                         console.log('fase 3')
//                         return res.status(400).send("Erro: Não há jogo em estoque.");
//                     } else {
//                         await db.query(
//                             'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
//                             [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
//                         );
//                         await db.query('UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1', [gameId]);
//                         return res.status(201).send(`Jogo: ${jogo.name} alugado com sucesso! Restam: ${jogo.stockTotal} unidades!`)
//                     }
//                 } else {
//                     console.log('caiu no else')
//                     ///se cair aqui, preciso verificar primeiro se o jogo existe, se não existir dá erro, caso contrário, segue o fluxo e diminui
//                     ///stocktotal em 1. a ideia é que aqui é se for o primeiro aluguel do jogo
//                     const gameVerify = await db.query('SELECT * from games where id = $1', [gameId])
//                     console.log('gameID:', gameId)
//                     if (gameVerify.rows <= 0) {
//                         return res.status(404).send("Jogo não encontrado.");
//                     }
//                     const jogo = gameVerify.rows[0];
//                     console.log('jogo' + gameVerify.rows[0])
//                     console.log('gameID 1:', gameId)
//                     if (jogo.stockTotal === 0) {
//                         return res.status(400).send("Erro: Não há jogo em estoque.");
//                     } else {
//                         console.log('entrou no segundo else')


//                         console.log('itens: ' + customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee)
//                         await db.query(
//                             'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
//                             [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
//                         );
//                         await db.query('UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1', [gameId]);
//                         return res.status(201).send(`Jogo: ${jogo.name} alugado com sucesso! Restam: ${jogo.stockTotal} unidades!`)
//                     }


//                 }

//             } catch (err) {
//                 console.log('ERRRU22')
//                 res.status(500).send(err.message)

//             }
//         }
//     } catch (err) {
//         console.log('ERRRU')
//         res.status(500).send(err.message)

//     }

// })

app.use('/rentals', rentalsRouter);

// app.post("/rentals/:id/return", async (req, res) => {

//     const { id } = req.params


//     try {
//         let aluguel = await db.query(
//             'SELECT rentals.*, games."pricePerDay" FROM rentals JOIN games ON rentals."gameId" = games.id WHERE rentals.id = $1;',
//             [id]
//         );



//         if (aluguel.rows[0].returnDate) {
//             return res.status(400).send('Aluguel já finalizado!')
//         }


//         let dataAtual = dayjs();
//         let returnDate = dataAtual.format('YYYY-MM-DD')



//         // Converter as datas para objetos dayjs
//         let x = aluguel.rows[0].rentDate
//         let y = returnDate
//         let dateX = dayjs(x).format('YYYY-MM-DD');
//         let dateY = dayjs(y);
//         console.log('x', dateX, 'y', dateY)

//         // Calcular a diferença em dias
//         let diffInDays = dateY.diff(dateX, 'day');

//         console.log(`A diferença entre ${x} e ${y} é de ${diffInDays} dias.`);
//         let delayFee = 0;
//         if (diffInDays > aluguel.rows[0].daysRented) {
//             diffInDays = diffInDays - aluguel.rows[0].daysRented
//             delayFee = diffInDays * aluguel.rows[0].pricePerDay
//         } else {
//             let delayFee = 0;
//         }


//         console.log('aluguel', aluguel.rows[0])

//         console.log('diff', diffInDays, 'aluguel', aluguel.rows[0].pricePerDay)

//         console.log((delayFee), (diffInDays), (returnDate))



//         try {
//             await db.query('UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3', [returnDate, delayFee, id]);
//             return res.status(200).send('Aluguel finalizado!')
//         } catch (err) {
//             res.status(500).send(err.message)
//         }
//     } catch (err) {
//         res.status(404).send(err.message)
//     }


// })

app.use('/rentals/:id/return', rentalsRouter);

// app.delete("/rentals/:id", async (req,res) => {
//     console.log('entrou no delete')

//     const { id } = req.params


//     try {

//         let aluguel = await db.query(
//             'SELECT * from rentals where id = $1;',
//             [id]
//         );

//         console.log('passou do try')



//         if (!aluguel.rows[0].returnDate) {
//             return res.status(400).send('Aluguel não finalizado!')
//         }

//         console.log('passou do returnDate')

        
//         try {
//             await db.query('DELETE from rentals where id = $1;', [id]);
//             res.status(200).send('Aluguel deletado!')
            
//         } catch (err) {
//             res.status(404).send('erro ao deletar', err.message)
            
//         }
        
//     } catch (err) {

//         res.status(404).send(err.message)

        
//     }

// })

app.use('/rentals/:id', rentalsRouter);

app.listen(5000, () => console.log("Servidor ligado!"))