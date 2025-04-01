import axios from "axios"

const BASE_URL = "http://192.168.0.53:8000/api"
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
        frequencias: ["Diária", "Semanal", "Mensal"],
        setores: ["Setor A", "Setor B", "Setor C"],
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
      const turnosData = ["Diurno", "Vespertino", "Noturno"]
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
      const tiposFrotaData = ["Seletiva", "Coleta", "Cata Treco", "Varrição"]
      console.log("Tipos de frota recebidos:", tiposFrotaData)
      return tiposFrotaData
    } catch (error) {
      console.error("Erro ao buscar tipos de frota:", error)
      throw new Error("Falha ao buscar tipos de frota. " + error.message)
    }
  },

  criarSoltura: async (solturaData) => {
    try {
      console.log("Enviando dados de soltura:", solturaData)

      // Verifique se tipo_coleta está presente em solturaData
      if (!solturaData.tipo_coleta) {
        console.error("Erro: tipo_coleta não foi fornecido.")
        throw new Error("O campo tipo_coleta é obrigatório.")
      }

      const response = await axios.post(`${BASE_URL}/soltura/criar/`, {
        motorista: solturaData.motorista,
        coletores: solturaData.coletores,
        veiculo: solturaData.prefixo,
        frequencia: solturaData.frequencia,
        setor: solturaData.setor,
        hora_entrega_chave: solturaData.hora_entrega_chave,
        hora_saida_frota: solturaData.hora_saida_frota,
        nome_lider: solturaData.nome_lider || "", // Envia vazio se não houver
        telefone_lider: solturaData.telefone_lider || "", // Envia vazio se não houver
        turno: solturaData.turno, // Novo campo para turno
        tipo_coleta: solturaData.tipo_coleta, // Novo campo para tipo de frota
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
}
