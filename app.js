import express from "express";
import mongoose from "mongoose";
import cors from "cors";

mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Conexão com o banco efetuada com sucesso");
});

const server = express();
const port = 9995;

server.use(cors());
server.use(express.urlencoded({ extended: true }));

const crsSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  titulo: String,
  nucleo: String,
  descricao: String,
  codigocrs: Number,
  responsavel: String,
  date: Date,
  status: Boolean,
  observacoes: Array,
});

const CrsItem = mongoose.model("CRS", crsSchema);

server.get("/", (req, res) => {
  let response = JSON.stringify({
    "api-version": "v1",
    descricao: "API utilizado para o backend do CRS Controller",
  });
  res.send(response).status(200);
});

server.post(
  "/v1/createcrs/:titulo&:descricao&:responsavel&:codigocrs&:nucleo",
  (req, res) => {
    const today = new Date();
    const id = new mongoose.Types.ObjectId();
    const data = {
      _id: id,
      titulo: req.params.titulo,
      descricao: req.params.descricao,
      responsavel: req.params.responsavel,
      codigocrs: req.params.codigocrs,
      nucleo: req.params.nucleo,
      status: false,
      date: today,
    };

    const crs = new CrsItem(data);
    crs.save().then((err, crs) => {
      if (err) res.send(err).status(500);
      res.json(crs);
    });

    res.send(data).status(200);
  }
);

server.get("/v1/crsaberta", (req, res) => {
  CrsItem.find({ status: false }, (err, crs) => {
    if (err) res.status(500).send(err);
    res.json(crs).status(200);
  });
});

server.get("/v1/crsresolvida", (req, res) => {
  CrsItem.find({ status: true }, (err, crs) => {
    if (err) res.status(500).send(err);
    res.json(crs).status(200);
  });
});

server.get("/v1/getcrs/:id", (req, res) => {
  CrsItem.findById(req.params.id, (err, crs) => {
    if (err) res.status(500).send(err);
    if (crs) res.json(crs);
    else
      res
        .send(`Não foi encontrada nenhuma CRS com essa ID: ${req.params.id}`)
        .status(404);
  });
});

server.put("/v1/updatecrs/:id", (req, res) => {
  CrsItem.findById(req.params.id, (err, crs) => {
    if (err) res.status(500).send(err);
    if (crs) {
      crs.status = true;
      crs.save().then((err, crs) => {
        if (err) res.status(500).send(err);
        res.json(crs);
      });
    } else
      res.send(
        `Não foi possível dar update na CRS: ${req.params.id}, não foi encontrada.`
      );
  });
});

server.put("/v1/updateobs/:id&:observacao", (req, res) => {
  CrsItem.findById(req.params.id, (err, crs) => {
    if (err) res.status(500).send(err);
    if (crs) {
      console.log(crs.observacoes);
      let date = new Date();
      date = date.toLocaleDateString("pt-br");
      const newObs = `${date} - ${req.params.observacao}`;
      crs.observacoes.push(newObs);
      crs.save().then((err, crs) => {
        if (err) res.status(500).send(err);
        res.json(crs);
      });
    } else
      res.send(
        `Não foi possível dar update na CRS: ${req.params.id}, não foi encontrada.`
      );
  });
});

server.put(
  "/v1/updateinfocrs/:id&:titulo&:descricao&:responsavel&:codigocrs&:nucleo&:date",
  (req, res) => {
    CrsItem.findById(req.params.id, (err, crs) => {
      if (err) res.status(500).send(err);
      if (crs) {
        (crs.titulo = req.params.titulo),
          (crs.descricao = req.params.descricao),
          (crs.responsavel = req.params.responsavel),
          (crs.codigocrs = req.params.codigocrs),
          (crs.nucleo = req.params.nucleo),
          (crs.date = req.params.date),
          crs.save().then((err, crs) => {
            if (err) res.status(500).send(err);
            res.json(crs);
          });
      } else
        res.send(
          `Não foi possível dar update na CRS: ${req.params.id}, não foi encontrada.`
        );
    });
  }
);

server.delete("/v1/deletecrs/:id", (req, res) => {
  CrsItem.findByIdAndDelete(req.params.id, (err) => {
    if (err) res.status(500).send(err);
    res.send(`CRS com a ID: ${req.params.id} foi excluída!`).status(200);
  });
});

server.use(express.json());

server.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
