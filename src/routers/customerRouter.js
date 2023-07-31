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

// Rota para obter todos os clientes
router.get('/', (req, res) => {
    res.send('Lista de usuários');
  });
  
  // Rota para obter um usuário por ID
  router.get('/', async (req, res) => {
    try {
        const clientes = await db.query(`SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers;`)
        res.send(clientes.rows)
    } catch (err) {
        res.status(500).send(err.message)

    }

})

  // Rota para obter um usuário por ID
  router.get('/', async (req, res) => {
    const { id } = req.params


    try {
        const cliente = await db.query(`SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers where id = $1;`, [id])
        if (cliente.rows.length <= 0) {
            res.status(404).send('ID de cliente não encontrado!')
        } else {
            res.send(cliente.rows[0])
        }
    } catch (err) {
        res.status(500).send(err.message)

    }

})
  
  // Rota para criar um novo cliente
  router.post('/', async (req, res) => {

    const { name, phone, cpf, birthday } = req.body

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }


    const validation = createCustomer.validate({ phone, cpf, birthday }, { abortEarly: "False" })
    if (validation.error) {
        console.log("erro 1 - customersaaa")
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(400).send(errors);
    }

    let phoneValidation = phone.toString();
    let cpfValidation = cpf.toString();
    let birthdayValidation = birthday.toString();

    if (!name) {
        return res.status(400).send('Nome precisa ser preenchido!')
    }

    if (phoneValidation.length < 10 || phoneValidation.length > 11) {
        return res.status(400).send(`Phone deve ter 10 ou 11 caracteres. Atualmente ele tem: ${phoneValidation.length}`)
    }

    if (cpfValidation.length !== 11) {
        return res.status(400).send(`CPF deve ter 11 caracteres. Atualmente ele tem: ${cpfValidation.length}`)
    }

    if (!name) {
        return res.status(400).send("name precisa ser preenchido!")
    }

    if (birthdayValidation.length !== 10) {
        return res.status(400).send(`birthday deve ter 10 caracteres contando com hifen. Ex: 1995-05-12. Atualmente ele tem: ${birthdayValidation.length}`)
    }

    try {
        const formatedBirthday = birthday.slice(0, 10);
        console.log(birthday)
        console.log(formatedBirthday)
        const customer = await db.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
        if (customer.rows.length > 0) {
            res.status(409).send("Cliente de mesmo cpf já existe!")
        } else {
            await db.query('INSERT INTO customers(name, phone, cpf, birthday) values ($1, $2, $3, $4);', [name, phone, cpf, formatedBirthday]);
            res.status(201).send("Cliente criado!")
        }
    } catch (err) {
        res.status(500).send(err.message)

    }

    
  });
  
  // Rota para atualizar um usuário existente
  router.put('/', async (req, res) => {
   
    const { id } = req.params
    const { name, phone, cpf, birthday } = req.body

    const customerData = {
        name,
        phone,
        cpf,
        birthday
    }



    const validation = createCustomer.validate({ phone, cpf, birthday }, { abortEarly: "False" })
    if (validation.error) {
        console.log("erro 1 - customers update")
        const errors = validation.error.details.map((detail) => detail.message)
        return res.status(400).send(errors);
    }

    let phoneValidation = phone.toString();
    let cpfValidation = cpf.toString();
    let birthdayValidation = birthday.toString();

    if (phoneValidation.length < 10 || phoneValidation.length > 11) {
        return res.status(400).send(`Erro ao tentar atualizar dados: Phone deve ter 10 ou 11 caracteres. Atualmente ele tem: ${phoneValidation.length}`)
    }

    if (!name) {
        return res.status(400).send("Erro ao tentar atualizar dados: name precisa ser preenchido!")
    }

    if (cpfValidation.length !== 11) {
        return res.status(400).send(`CPF deve ter 11 caracteres. Atualmente ele tem: ${cpfValidation.length}`)
    }

    if (birthdayValidation.length !== 10) {
        return res.status(400).send(`birthday deve ter 10 caracteres contando com hifen. Ex: 1995-05-12. Atualmente ele tem: ${birthdayValidation.length}`)
    }

    try {
        ///busca no banco onde o cpf e id é o mesmo. para alterar valor da mesma pessoa
        const customer = await db.query('SELECT * FROM customers WHERE cpf = $1 and id = $2;', [cpf, id])
        ///se encontrar, ele altera. 
        if (customer.rows.length > 0) {
            ///atualiza os dados que não seja cpf
            await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
            res.status(200).send("Cliente alterado!")

        } else {
            //se não encontrar, faz mais uma busca, para ver se tem alguem com esse cpf no banco
            try {
                ///se encontrar, ele não altera e dá erro
                const customer = await db.query('SELECT * FROM customers WHERE cpf = $1;', [cpf])
                if (customer.rows.length > 0) {
                    res.status(409).send(`O CPF ${cpf} não pode ser o de outro cliente!`)

                } else {
                    ///se não encontrar, ele altera
                    await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;', [name, phone, cpf, birthday, id]);
                    res.status(200).send("Cliente alterado!")
                }
            } catch (error) {

            }
            res.status(409).send(`O CPF ${cpf} não pode ser o de outro cliente!`)
        }
    } catch (err) {
        res.status(500).send(err.message)

    }
  });
  
  // Rota para excluir um usuário
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    // Lógica para excluir o usuário com o ID especificado
    res.send(`Usuário com ID ${id} excluído`);
  });
  
  export default router;