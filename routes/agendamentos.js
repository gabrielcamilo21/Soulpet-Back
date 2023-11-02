const { Router } = require("express");
const { Agendamento } = require("../database/agendamento");
const { agendamentoSchema } = require("../database/agendamento");
const { Pet } = require("../database/pet");
const { Servico } = require("../database/servico");

const router = Router();

//Listar todos agendamentos
router.get("/agendamentos", async (req, res) =>{
  
  const listaAgendamentos = await Agendamento.findAll();
  res.json(listaAgendamentos)
  
}) 

//Listar um agendamento por id
router.get('/agendamentos/:id', async (req, res, next) => {
  try {
    const agendamento = await Agendamento.findOne({
      where: { id: req.params.id },
    });

    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado.' });
    }

    return res.json(agendamento);
  } catch (err) {
    console.error(err);
    next(err) 
  }
});

// Criar agendamento
router.post("/agendamentos", async (req, res, next) => {
    const { dataAgendada, petId, servicoId } = req.body;
    const { error, value } = agendamentoSchema.validate(req.body);

    if(error) {
        return res.status(400).json({ message: "Erro de validação", error: error.details[0].message })
    }
    try {
    const pet = await Pet.findByPk(petId);
    const servico = await Servico.findByPk(servicoId);
    if(pet && servico) {
        const agendamento = await Agendamento.create({
            dataAgendada,
            petId,
            servicoId
        });
        res.status(201).json({ message: "Agendamento feito com sucesso", agendamento });
        } else {
        res.status(404).json({ error: "Pet ou Serviço não encontrados"})
        }
        } catch (err) {
          console.error(err);
          next(err) 
    }
    })

    router.put("/agendamentos/:id", async (req, res, next) => {
        const { dataAgendada, realizada, petId, servicoId } = req.body;
        const { error, value } = agendamentoSchema.validate(req.body);

      if(error) {
        return res.status(400).json({ message: "Erro de validação", error: error.details[0].message })
     }
        
        const pet = await Pet.findByPk(petId);
        const servico = await Servico.findByPk(servicoId);

        try {
            if(pet && servico) {
                await Agendamento.update(
                    { dataAgendada, realizada },
                    { where: { id: req.params.id }}
                );
                res.json({ message: "O agendamento foi atualizado com sucesso"})
            } else {
                res.status(404).json({ error: "Pet ou Serviço não encontrados"})
            }
        } catch (err) {
          console.error(err);
          next(err) 
        }
    })

//Deletar todos os agendamentos
router.delete("/agendamentos/all", async (req, res, next) => {
    try {
      await Agendamento.destroy({ where: {} });
      res.status(200).json({ message: "Todos os agendamentos foram removidos!" });
    } catch (err) {
      console.error(err);
    next(err) 
    }
  });

//Deletar agendamento por id
router.delete("/agendamentos/:id", async (req, res, next) => {
    const { id } = req.params;
    
    const agendamento = await Agendamento.findOne({ where: { id } });
    try {
      if (agendamento) {
        await agendamento.destroy();
        res.status(200).json({ message: "Agendamento removido!" });
      } else {
        res.status(404).json({ message: "Agendamento não encontrado." });
      }
    } catch (err) {
      console.error(err);
      next(err) 
    }
});

module.exports = router;