const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

const apiKey = "C4834690694B370B1D5CC97B1FBFA2A6";

app.use(cors());
app.use(bodyParser.json());

const makeRoute4MeRequest = async (url, data) => {
   try {
      const response = await axios.post(url, data, {
         headers: { "Content-Type": "application/json" },
      });
      return response.data;
   } catch (error) {
      throw error;
   }
};

app.post("/geocoder", async (req, res) => {
   const { address, format = "json" } = req.body;

   if (!address) {
      return res.status(400).json({ message: "Endereço é obrigatório" });
   }

   const apiUrl = `https://api.route4me.com/api/geocoder.php?api_key=${apiKey}&addresses=${encodeURIComponent(
      address
   )}&format=${format}`;

   try {
      const data = await makeRoute4MeRequest(apiUrl, {});
      res.json(data);
   } catch (error) {
      console.error("Erro ao se comunicar com a API do Route4Me:", error);
      res.status(500).json({
         message: "Erro ao comunicar com a API do Route4Me",
      });
   }
});

app.post("/optimization_problem", async (req, res) => {
   const { route_name, optimize, addresses, order_id } = req.body;

   if (!Array.isArray(addresses) || addresses.length === 0) {
      return res
         .status(400)
         .json({ message: "Deve haver pelo menos um endereço" });
   }

   const route4MeDataRoute = { route_name, optimize, addresses, order_id };
   const apiUrl = `https://api.route4me.com/api.v4/optimization_problem.php?api_key=${apiKey}`;

   try {
      const data = await makeRoute4MeRequest(apiUrl, route4MeDataRoute);
      res.json(data);
   } catch (error) {
      console.error("Erro ao se comunicar com a API do Route4Me:", error);
      res.status(500).json({
         message: "Erro ao se comunicar com a API do Route4Me",
      });
   }
});

app.post("/order", async (req, res) => {
   const {
      address_1,
      address_2,
      EXT_FIELD_first_name,
      EXT_FIELD_last_name,
      EXT_FIELD_email,
      EXT_FIELD_phone,
      EXT_FIELD_pieces,
      local_time_window_start,
      local_time_window_end,
      local_time_window_start_2,
      local_time_window_end_2,
   } = req.body;

   if (!address_1 || !address_2) {
      return res.status(400).json({ message: "Endereços são obrigatórios" });
   }

   const route4MeDataPedido = {
      address_1,
      address_2,
      EXT_FIELD_first_name,
      EXT_FIELD_last_name,
      EXT_FIELD_email,
      EXT_FIELD_phone,
      EXT_FIELD_pieces,
      local_time_window_start,
      local_time_window_end,
      local_time_window_start_2,
      local_time_window_end_2,
   };

   const apiUrl = `https://api.route4me.com/api.v4/order.php?api_key=${apiKey}`;

   try {
      const response = await axios.post(apiUrl, route4MeDataPedido, {
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
         },
      });

      if (response.status === 200) {
         res.json(response.data);
      } else {
         res.status(response.status).json({
            message: "Erro na resposta da API do Route4Me",
         });
      }
   } catch (error) {
      console.error("Erro ao se comunicar com a API do Route4Me:", error);

      if (error.response) {
         res.status(error.response.status).json({
            message: error.response.data.message || "Erro desconhecido da API",
         });
      } else if (error.request) {
         res.status(500).json({ message: "Sem resposta da API do Route4Me" });
      } else {
         res.status(500).json({
            message: `Erro ao fazer requisição: ${error.message}`,
         });
      }
   }
});

app.put("/add_order_to_route", async (req, res) => {
   const { optimization_problem_id, order_id } = req.body;

   if (!optimization_problem_id || !order_id) {
      return res.status(400).json({
         message: "optimization_problem_id e order_id são obrigatórios",
      });
   }

   const apiUrl = `https://api.route4me.com/api.v4/optimization_problem.php?api_key=${apiKey}&optimization_problem_id=${optimization_problem_id}&redirect=0`;

   const data = {
      order_id,
   };

   try {
      console.log("Enviando dados para a API do Route4Me:", data);
      const response = await axios.put(apiUrl, data, {
         headers: { "Content-Type": "application/json" },
      });

      res.json(response.data);
   } catch (error) {
      console.error("Erro ao adicionar pedido à otimização:", error);

      if (error.response) {
         console.error("Resposta da API:", error.response.data);
         res.status(error.response.status).json({
            message: error.response.data.message || "Erro desconhecido da API",
         });
      } else if (error.request) {
         console.error("Nenhuma resposta recebida:", error.request);
         res.status(500).json({ message: "Sem resposta da API do Route4Me" });
      } else {
         console.error("Erro ao configurar a requisição:", error.message);
         res.status(500).json({
            message: `Erro ao fazer requisição: ${error.message}`,
         });
      }
   }
});

// verificar se o pedido está associado a rota
app.get("/check_order_in_route", async (req, res) => {
   const { optimization_problem_id, order_id } = req.body;

   if (!optimization_problem_id || !order_id) {
      return res.status(400).json({
         message: "optimization_problem_id e order_id são obrigatórios",
      });
   }

   try {
      const apiUrl = `https://api.route4me.com/api.v4/optimization_problem.php?api_key=${apiKey}&optimization_problem_id=${optimization_problem_id}`;
      const response = await axios.get(apiUrl);
      const optimizationData = response.data;

      // Verifica se o order_id está presente em alguma das rotas
      let orderExists = false;
      let routeData = null;

      for (const route of optimizationData.routes) {
         const routeResponse = await axios.get(
            `https://api.route4me.com/api.v4/route.php?api_key=${apiKey}&route_id=${route.route_id}`
         );
         routeData = routeResponse.data;

         if (
            routeData.addresses.some(
               (stop) => stop.order_id === parseInt(order_id)
            )
         ) {
            orderExists = true;
            break;
         }
      }

      if (orderExists) {
         res.json({
            message: "Pedido está associado à rota.",
            routeData,
         });
      } else {
         res.json({
            message: "Pedido não está associado à rota.",
         });
      }
   } catch (error) {
      console.error("Erro ao verificar pedido na rota:", error);

      if (error.response) {
         console.error("Resposta da API:", error.response.data);
         const errorMessage = error.response.data.errors
            ? error.response.data.errors.join(", ")
            : "Erro desconhecido da API";
         res.status(error.response.status).json({
            message: errorMessage,
         });
      } else if (error.request) {
         console.error("Nenhuma resposta recebida:", error.request);
         res.status(500).json({ message: "Sem resposta da API do Route4Me" });
      } else {
         console.error("Erro ao configurar a requisição:", error.message);
         res.status(500).json({
            message: `Erro ao fazer requisição: ${error.message}`,
         });
      }
   }
});

app.get("/orders", async (req, res) => {
   const { order_id } = req.query;

   if (!order_id) {
      return res
         .status(400)
         .json({ message: "O parâmetro order_id é obrigatório" });
   }

   const apiUrl = `https://api.route4me.com/api.v4/order.php?api_key=${apiKey}&order_id=${order_id}`;

   try {
      const response = await axios.get(apiUrl);
      res.json(response.data);
   } catch (error) {
      console.error("Erro ao buscar pedido(s):", error);

      if (error.response) {
         res.status(error.response.status).json({
            message: error.response.data.message || "Erro desconhecido da API",
            detalhes: error.response.data,
         });
      } else if (error.request) {
         res.status(500).json({ message: "Sem resposta da API do Route4Me" });
      } else {
         res.status(500).json({
            message: `Erro ao fazer requisição: ${error.message}`,
         });
      }
   }
});

// Iniciar o servidor
app.listen(port, () => {
   console.log(`Servidor rodando em http://localhost:${port}`);
});
