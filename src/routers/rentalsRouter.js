// userRouter.js
import express from 'express';
import { db } from '../databases/database.connection.js';
import Joi from 'joi';

const router = express.Router();

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

// Rota para obter todos os alugueis
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT rentals.id, rentals."customerId", rentals."gameId", rentals."rentDate", rentals."daysRented", rentals."returnDate", rentals."originalPrice", rentals."delayFee",
                   customers.id as customer_id, customers.name as customer_name,
                   games.id as game_id, games.name as game_name
            FROM rentals
            JOIN customers ON rentals."customerId" = customers.id
            JOIN games ON rentals."gameId" = games.id;
        `;

        const alugueis = await db.query(query);
        const formattedRentals = alugueis.rows.map((aluguel) => {
            return {
                id: aluguel.id,
                customerId: aluguel.customerId,
                gameId: aluguel.gameId,
                rentDate: aluguel.rentDate,
                daysRented: aluguel.daysRented,
                returnDate: aluguel.returnDate,
                originalPrice: aluguel.originalPrice,
                delayFee: aluguel.delayFee,
                customer: {
                    id: aluguel.customer_id,
                    name: aluguel.customer_name
                },
                game: {
                    id: aluguel.game_id,
                    name: aluguel.game_name
                }
            };
        });

        res.send(formattedRentals);
    } catch (err) {
        res.status(500).send(err.message);
    }
  });
  
  // Rota para criar um usuário por ID
  router.post('/', async (req, res) => {
    const { id } = req.params


    try {
        let aluguel = await db.query(
            'SELECT rentals.*, games."pricePerDay" FROM rentals JOIN games ON rentals."gameId" = games.id WHERE rentals.id = $1;',
            [id]
        );



        if (aluguel.rows[0].returnDate) {
            return res.status(400).send('Aluguel já finalizado!')
        }


        let dataAtual = dayjs();
        let returnDate = dataAtual.format('YYYY-MM-DD')



        // Converter as datas para objetos dayjs
        let x = aluguel.rows[0].rentDate
        let y = returnDate
        let dateX = dayjs(x).format('YYYY-MM-DD');
        let dateY = dayjs(y);
        console.log('x', dateX, 'y', dateY)

        // Calcular a diferença em dias
        let diffInDays = dateY.diff(dateX, 'day');

        console.log(`A diferença entre ${x} e ${y} é de ${diffInDays} dias.`);
        let delayFee = 0;
        if (diffInDays > aluguel.rows[0].daysRented) {
            diffInDays = diffInDays - aluguel.rows[0].daysRented
            delayFee = diffInDays * aluguel.rows[0].pricePerDay
        } else {
            let delayFee = 0;
        }


        console.log('aluguel', aluguel.rows[0])

        console.log('diff', diffInDays, 'aluguel', aluguel.rows[0].pricePerDay)

        console.log((delayFee), (diffInDays), (returnDate))



        try {
            await db.query('UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3', [returnDate, delayFee, id]);
            return res.status(200).send('Aluguel finalizado!')
        } catch (err) {
            res.status(500).send(err.message)
        }
    } catch (err) {
        res.status(404).send(err.message)
    }


  });
  
  // Rota para criar um novo aluguel
  router.post('/', async (req, res) => {
    let { customerId, gameId, daysRented } = req.body



    try {
        const jogos = await db.query(`SELECT * FROM games where id = $1`, [gameId])
        if (jogos.rows.length <= 0) {
            res.status(404).send("Jogo não encontrado!")
        } else {
            let pricePerDay = jogos.rows[0].pricePerDay
            console.log('jogo encontrado com sucesso - 1')


            let originalPrice = daysRented * pricePerDay


            const rentData = {
                customerId: 1,
                gameId: 1,
                daysRented: 3
            }

            ///parte de data
            const dataAtual = dayjs();
            let rentDate = dataAtual.format('YYYY-MM-DD')
            ///
            let returnDate = null;
            let delayFee = null;



            const validation = createRent.validate({ customerId, gameId, daysRented }, { abortEarly: "False" })
            if (validation.error) {
                console.log("erro 1 - rent")
                const errors = validation.error.details.map((detail) => detail.message)
                return res.status(422).send(errors);
            }

            if (daysRented <= 0) {
                return res.status(400).send("daysRented deve ser maior do que 0.")
            }


            try {
                const jogos = await db.query('SELECT rentals.*, games.* FROM rentals JOIN games ON rentals."gameId" = games.id WHERE rentals."gameId" = $1 AND games.id = $2;', [gameId, gameId]);
                console.log(jogos.rows.length)
                if (jogos.rows.length > 0) {
                    ///se for maior que zero. significa que o jogo ja foi alugado. portanto, vai diminuir stocktotal em 1
                    const jogo = jogos.rows[0];
                    console.log('fase 2')
                    console.log(jogo.stockTotal)
                    if (jogo.stockTotal === 1) {
                        console.log('fase 3')
                        return res.status(400).send("Erro: Não há jogo em estoque.");
                    } else {
                        await db.query(
                            'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                            [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
                        );
                        await db.query('UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1', [gameId]);
                        return res.status(201).send(`Jogo: ${jogo.name} alugado com sucesso! Restam: ${jogo.stockTotal} unidades!`)
                    }
                } else {
                    console.log('caiu no else')
                    ///se cair aqui, preciso verificar primeiro se o jogo existe, se não existir dá erro, caso contrário, segue o fluxo e diminui
                    ///stocktotal em 1. a ideia é que aqui é se for o primeiro aluguel do jogo
                    const gameVerify = await db.query('SELECT * from games where id = $1', [gameId])
                    console.log('gameID:', gameId)
                    if (gameVerify.rows <= 0) {
                        return res.status(404).send("Jogo não encontrado.");
                    }
                    const jogo = gameVerify.rows[0];
                    console.log('jogo' + gameVerify.rows[0])
                    console.log('gameID 1:', gameId)
                    if (jogo.stockTotal === 0) {
                        return res.status(400).send("Erro: Não há jogo em estoque.");
                    } else {
                        console.log('entrou no segundo else')


                        console.log('itens: ' + customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee)
                        await db.query(
                            'INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)',
                            [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]
                        );
                        await db.query('UPDATE games SET "stockTotal" = "stockTotal" - 1 WHERE id = $1', [gameId]);
                        return res.status(201).send(`Jogo: ${jogo.name} alugado com sucesso! Restam: ${jogo.stockTotal} unidades!`)
                    }


                }

            } catch (err) {
                console.log('ERRRU22')
                res.status(500).send(err.message)

            }
        }
    } catch (err) {
        console.log('ERRRU')
        res.status(500).send(err.message)

    }
  });
  
  
  // Rota para excluir um usuário
  router.delete('/', async (req, res) => {
    console.log('entrou no delete')

    const { id } = req.params


    try {

        let aluguel = await db.query(
            'SELECT * from rentals where id = $1;',
            [id]
        );

        console.log('passou do try')



        if (!aluguel.rows[0].returnDate) {
            return res.status(400).send('Aluguel não finalizado!')
        }

        console.log('passou do returnDate')

        
        try {
            await db.query('DELETE from rentals where id = $1;', [id]);
            res.status(200).send('Aluguel deletado!')
            
        } catch (err) {
            res.status(404).send('erro ao deletar', err.message)
            
        }
        
    } catch (err) {

        res.status(404).send(err.message)

        
    }

  });
  
export default router;
