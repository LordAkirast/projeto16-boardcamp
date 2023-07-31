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

// Rota para obter todos os jogos
router.get('/', async (req, res) => {

  try {
    const jogos = await db.query(`SELECT * FROM games;`)
    res.send(jogos.rows)
} catch (err) {
    res.status(500).send(err.message)

}

});


// Rota para criar um novo jogo
router.post('/', async (req, res) => {

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

});
  
export default router;
