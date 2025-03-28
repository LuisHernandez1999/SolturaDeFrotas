import axios from "axios"

const API_URL = "http://192.168.0.233:8000/api/login/"

export const loginUser = async (nome, senha) => {
  try {
    const response = await axios.post(API_URL, {
      nome: nome,
      senha: senha,
    })
    console.log("Resposta original da API:", response.data)

    if (response.data && response.data.status === "erro") {
      let field = null
      const mensagem = response.data.erro.toLowerCase()

      if (mensagem.includes("nome") || mensagem.includes("usuário") || mensagem.includes("usuario")) {
        field = "name"
      } else if (mensagem.includes("senha")) {
        field = "password"
      }

      return {
        erro: response.data.erro,
        success: false,
        field: field,
      }
    }

    return {
      ...response.data,
      success: true,
    }
  } catch (error) {
    console.error("Erro na requisição:", error)

    if (error.message && error.message.includes("Network Error")) {
      return {
        erro: "Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está online.",
        success: false,
        isNetworkError: true,
      }
    } else if (error.response) {
      console.error("Erro do servidor:", error.response.data)
      const errorData = error.response.data
      let errorMessage = "Erro no servidor"
      let errorField = null

      if (errorData.erro) {
        errorMessage = errorData.erro
        const mensagemLower = errorMessage.toLowerCase()

        if (mensagemLower.includes("nome") || mensagemLower.includes("usuário") || mensagemLower.includes("usuario")) {
          errorField = "name"
        } else if (mensagemLower.includes("senha")) {
          errorField = "password"
        }
      }

      return {
        erro: errorMessage,
        success: false,
        field: errorField,
      }
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request)
      return {
        erro: "Erro ao se comunicar com o servidor. Verifique sua conexão.",
        success: false,
        isNetworkError: true,
      }
    } else {
      console.error("Erro na configuração da requisição:", error.message)
      return {
        erro: error.message || "Ocorreu um erro desconhecido",
        success: false,
      }
    }
  }
}