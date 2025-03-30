// API Service for Soltura registration
import axios from "axios"

const BASE_URL = "http://192.168.0.53:8000/api"

// API service for Soltura
export const SolturaService = {
  // Get motoristas from specific endpoint
  getMotoristas: async () => {
    try {
      console.log("Buscando motoristas...")
      const response = await axios.get(`${BASE_URL}/colaboradores/colaboradores_lista_motoristas_ativos/`)
      const motoristasResponse = response.data.colaboradores_lista;
      
      // Verifique se motoristasResponse é um array antes de chamar .map()
      if (Array.isArray(motoristasResponse)) {
        console.log("Motoristas recebidos:", motoristasResponse)
        return motoristasResponse;
      } else {
        console.error("A resposta não contém um array de motoristas.");
        throw new Error("A resposta da API não contém motoristas válidos.");
      }
    } catch (error) {
      console.error("Erro ao buscar motoristas:", error);
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor");
      throw new Error("Falha ao buscar motoristas. " + (error.response?.data?.message || error.message));
    }
  },

  // Get coletores from specific endpoint
  getColetores: async () => {
    try {
      console.log("Buscando coletores...")
      const response = await axios.get(`${BASE_URL}/colaboradores/colaboradores_lista_coletores_ativos/`)
      const coletoresResponse = response.data.colaboradores_lista;

      // Verifique se coletoresResponse é um array antes de chamar .map()
      if (Array.isArray(coletoresResponse)) {
        console.log("Coletores recebidos:", coletoresResponse)
        return coletoresResponse;
      } else {
        console.error("A resposta não contém um array de coletores.");
        throw new Error("A resposta da API não contém coletores válidos.");
      }
    } catch (error) {
      console.error("Erro ao buscar coletores:", error);
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor");
      throw new Error("Falha ao buscar coletores. " + (error.response?.data?.message || error.message));
    }
  },

  // Get veiculos from specific endpoint
  getVeiculos: async () => {
    try {
      console.log("Buscando veículos...")
      const response = await axios.get(`${BASE_URL}/veiculos/lista/`)
      const veiculosResponse = response.data.veiculos_lista_ativos;

      // Verifique se veiculosResponse é um array antes de chamar .map()
      if (Array.isArray(veiculosResponse)) {
        console.log("Veículos recebidos:", veiculosResponse)
        return veiculosResponse;
      } else {
        console.error("A resposta não contém um array de veículos.");
        throw new Error("A resposta da API não contém veículos válidos.");
      }
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor");
      throw new Error("Falha ao buscar veículos. " + (error.response?.data?.message || error.message));
    }
  },
  

  // Get frequencias, setores, and lideres from criar soltura endpoint
  getOutrosDados: async () => {
    try {
      console.log("Buscando outros dados (frequências, setores, líderes)...")
      
      // Mocked response data
      const mockedResponse = {
        frequencias: ['Diária', 'Semanal', 'Mensal'],
        setores: ['Setor A', 'Setor B', 'Setor C'],
        lideres: ['José Ferreira', 'Fernanda Souza', 'José Oliveira'],
      };
      
      console.log("Outros dados recebidos:", mockedResponse);
      return mockedResponse;
    } catch (error) {
      console.error("Erro ao buscar outros dados:", error);
      console.error("Detalhes do erro:", error.response ? error.response.data : "Sem resposta do servidor");
      throw new Error("Falha ao buscar dados complementares. " + (error.response?.data?.message || error.message));
    }
  },

  // Create soltura (release)
  criarSoltura: async (solturaData) => {
    try {
      console.log("Enviando dados de soltura:", solturaData)
      const response = await axios.post(`${BASE_URL}/soltura/criar/`, {
        motorista: solturaData.motorista,
        coletores: solturaData.coletores,
        veiculo: solturaData.prefixo,
        frequencia: solturaData.frequencia,
        setor: solturaData.setor,
        hora_entrega_chave: solturaData.hora_entrega_chave,
        hora_entrega_saida_frota: solturaData.hora_entrega_saida_frota,
        nome_lider: solturaData.nome_lider || "",  // Envia vazio se não houver
        telefone_lider: solturaData.telefone_lider || "",  // Envia vazio se não houver
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

