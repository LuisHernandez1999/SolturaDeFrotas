import axios from "axios"

const BASE_URL = "http://192.168.0.103:8000/api"

export const SolturaService = {
  getMotoristas: async () => {
    try {
      console.log("Buscando motoristas...")
      const response = await axios.get(`${BASE_URL}/colaboradores/colaboradores_lista_motoristas_ativos/`)
      const motoristasResponse = response.data.colaboradores_lista
      if (Array.isArray(motoristasResponse)) {
        console.log("Motoristas recebidos:", motoristasResponse)
        return motoristasResponse
      } else {
        console.error("A resposta não contém um array de motoristas.")
        throw new Error("A resposta da API não contém motoristas válidos.")
      }
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error)
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor")
      throw new Error("Falha ao buscar motoristas. " + (error.response?.data?.message || error.message))
    }
  },
  getColetores: async () => {
    try {
      console.log("Buscando coletores...")
      const response = await axios.get(`${BASE_URL}/colaboradores/colaboradores_lista_coletores_ativos/`)
      const coletoresResponse = response.data.colaboradores_lista
      if (Array.isArray(coletoresResponse)) {
        console.log("Coletores recebidos:", coletoresResponse)
        return coletoresResponse
      } else {
        console.error("A resposta não contém um array de coletores.")
        throw new Error("A resposta da API não contém coletores válidos.")
      }
    } catch (error) {
      console.error("Erro ao buscar coletores:", error)
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor")
      throw new Error("Falha ao buscar coletores. " + (error.response?.data?.message || error.message))
    }
  },
  getVeiculos: async () => {
    try {
      console.log("Buscando veículos...")
      const response = await axios.get(`${BASE_URL}/veiculos/lista/`)
      const veiculosResponse = response.data.veiculos_lista_ativos
      if (Array.isArray(veiculosResponse)) {
        console.log("Veículos recebidos:", veiculosResponse)
        return veiculosResponse
      } else {
        console.error("A resposta não contém um array de veículos.")
        throw new Error("A resposta da API não contém veículos válidos.")
      }
    } catch (error) {
      console.error("Erro ao buscar veículos:", error)
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor")
      throw new Error("Falha ao buscar veículos. " + (error.response?.data?.message || error.message))
    }
  },

  getOutrosDados: async () => {
    try {
      console.log("Buscando outros dados (frequências, setores, líderes)...")
      const mockedResponse = {
        frequencias: ["Semanal"],
        setores: [], // Setores serão gerados dinamicamente com base nas regras de negócio
        garagens: ["PA1", "PA2", "PA3", "PA4"],
      }
      console.log("Outros dados recebidos:", mockedResponse)
      return mockedResponse
    } catch (error) {
      console.error("Erro ao buscar outros dados:", error)
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor")
      throw new Error("Falha ao buscar dados complementares. " + (error.response?.data?.message || error.message))
    }
  },
  getTurnos: async () => {
    try {
      console.log("Buscando turnos...")
      const turnosData = ["Diurno", "Noturno"]
      console.log("Turnos recebidos:", turnosData)
      return turnosData
    } catch (error) {
      console.error("Erro ao buscar turnos:", error)
      throw new Error("Falha ao buscar turnos. " + error.message)
    }
  },
  getTiposFrota: async () => {
    try {
      console.log("Buscando tipos de frota...")
      const tiposFrotaData = ["Seletiva", "Coleta", "Cata Treco", "Varrição", "Remoção"]
      console.log("Tipos de frota recebidos:", tiposFrotaData)
      return tiposFrotaData
    } catch (error) {
      console.error("Erro ao buscar tipos de frota:", error)
      throw new Error("Falha ao buscar tipos de frota. " + error.message)
    }
  },

  // Substituir a função getRotasDisponiveis existente com a implementação completa da lógica de rotas
  getRotasDisponiveis: (tipoServico, turno, frequencia, garagem) => {
    // Check if service type is "Coleta"
    if (tipoServico !== "Coleta") {
      return []
    }

    // Group days by frequency pattern
    const diasSegundaQuartaSexta = [" Semanal"]
    const diasTercaQuintaSabado = ["Semanal"]

    // Define routes based on shift, frequency pattern, and garage
    const rotas = {
      Diurno: {
        SegundaQuartaSexta: {
          PA1: [
            "AD12",
            "AD13",
            "AD14",
            "AD15",
            "AD16",
            "AD17",
            "AD18",
            "AD19",
            "AD20",
            "AD21",
            "AD22",
            "AD23",
            "AD24",
            "DD11",
          ],
          PA2: ["AD12", "AD13", "AD14", "AD15", "AD16", "AD17", "AD18", "AD19", "AD20", "AD21", "AD22"],
          PA3: ["AD13", "AD14", "AD15", "AD16", "AD17", "AD18", "AD19", "AD20", "AD21", "AD22", "AD23", "AD24"],
          PA4: ["AD12", "AD13", "AD14", "AD15", "AD16", "AD17", "AD18", "AD19", "AD20", "AD21", "AD22", "AD24"],
        },
        TercaQuintaSabado: {
          PA1: [
            "AD12",
            "AD13",
            "AD14",
            "AD15",
            "AD16",
            "AD17",
            "AD18",
            "AD19",
            "AD20",
            "AD21",
            "AD22",
            "AD23",
            "AD24",
            "DD11",
          ],
          PA2: ["AD12", "AD13", "AD14", "AD15", "AD16", "AD17", "AD18", "AD19", "AD20", "AD21", "AD22", "AD24"],
          PA3: ["AD13", "AD14", "AD15", "AD16", "AD17", "AD18", "AD19", "AD20", "AD21", "AD22", "AD23", "AD24"],
          PA4: ["AD13", "AD14", "AD15", "AD16", "AD17", "AD18", "AD19", "AD20", "AD21", "AD22", "AD24"],
        },
      },
      Noturno: {
        SegundaQuartaSexta: {
          PA1: ["AN09", "AN10", "DN01", "DN02", "DN03", "DN04", "DN05", "DN06", "DN07", "DN08", "AN20"],
          PA2: ["AN07", "AN08", "AN09", "AN10", "AN11", "DN01", "DN02", "DN03", "DN04", "DN05", "DN06"],
          PA3: ["DN01", "DN02", "DN03", "DN04", "DN05", "DN06", "DN07", "DN08", "DN09", "DN10", "DN11", "DN12", "AN15"],
          PA4: ["AN07", "AN08", "AN09", "AN10", "AN11", "DN01", "DN02", "DN03", "DN04", "DN05", "DN06"],
        },
        TercaQuintaSabado: {
          PA1: ["BN09", "BN10", "DN01", "DN02", "DN03", "DN04", "DN05", "DN06", "DN07", "DN08", "BN20"],
          PA2: ["BN07", "BN08", "BN09", "BN10", "BN11", "DN01", "DN02", "DN03", "DN04", "DN05", "DN06"],
          PA3: ["DN01", "DN02", "DN03", "DN04", "DN05", "DN06", "DN07", "DN08", "DN09", "DN10", "DN11", "DN12", "BN15"],
          PA4: ["BN07", "BN08", "BN09", "BN10", "BN11", "DN01", "DN02", "DN03", "DN04", "DN05", "DN06"],
        },
      },
    }

    // Determine frequency pattern
    let frequencyPattern
    if (diasSegundaQuartaSexta.includes(frequencia)) {
      frequencyPattern = "SegundaQuartaSexta"
    } else if (diasTercaQuintaSabado.includes(frequencia)) {
      frequencyPattern = "TercaQuintaSabado"
    } else {
      return [] // Invalid frequency
    }

    // Check if all parameters are valid
    if (!rotas[turno] || !rotas[turno][frequencyPattern] || !rotas[turno][frequencyPattern][garagem]) {
      return [] // Invalid parameters
    }

    // Return the appropriate routes
    return rotas[turno][frequencyPattern][garagem]
  },

  criarSoltura: async (solturaData) => {
    try {
      console.log("Enviando dados de soltura:", solturaData)

      // Verifique se tipo_servico está presente em solturaData
      if (!solturaData.tipo_servico) {
        console.error("Erro: tipo_servico não foi fornecido.")
        throw new Error("O campo tipo_servico é obrigatório.")
      }

      const response = await axios.post(`${BASE_URL}/soltura/criar/`, {
        motorista: solturaData.motorista,
        coletores: solturaData.coletores,
        veiculo: solturaData.prefixo,
        frequencia: solturaData.frequencia,
        setor: solturaData.setor,
        hora_entrega_chave: solturaData.hora_entrega_chave,
        hora_saida_frota: solturaData.hora_saida_frota,
        nome_lider: solturaData.nome_lideres || "", // Envia vazio se não houver
        telefone_lider: solturaData.telefone_lider || "", // Envia vazio se não houver
        turno: solturaData.turno, // Novo campo para turno
        tipo_servico: solturaData.tipo_servico, // Novo campo para tipo de frota
        garagem: solturaData.garagem || "", // Garagem selecionada
        rota: solturaData.setor || "",
        tipo_equipe: solturaData.tipo_equipe,  // A rota é o setor selecionado
      })

      console.log("Resposta da criação de soltura:", response.data)
      return response.data
    } catch (error) {
      console.error("Erro ao criar soltura:", error)
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor")
      throw new Error("Falha ao criar soltura. " + (error.response?.data?.message || error.message))
    }
  },

  // Format time for API
  formatTimeForAPI: (time) => {
    if (!time) return ""
    const hours = String(time.getHours()).padStart(2, "0")
    const minutes = String(time.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes}`
  },

  // Função para buscar solturas do dia
  getSolturas: async () => {
    try {
      console.log("Buscando solturas do dia...")
      const response = await axios.get(`${BASE_URL}/soltura/ver_solturas_dia/`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // para autenticação via session/cookie
      })

      console.log("Solturas do dia recebidas:", response.data)
      return response.data
    } catch (error) {
      console.error("Erro ao buscar solturas do dia:", error)
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor")
      throw new Error("Falha ao buscar solturas do dia. " + (error.response?.data?.message || error.message))
    }
  },
}
