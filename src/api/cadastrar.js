import axios from "axios"

const API_URL = "http:/192.168.0.53:8000/api/cadastro/cadastrar_user/"

export const cadastrarUser = async (nome, celular, senha, senhaConfirmar) => {
    try {
      const response = await axios.post(API_URL, {
        nome: nome,
        celular: celular,
        senha: senha,
        senha_confirmar: senhaConfirmar,
      })
  
      console.log("Resposta original da API:", response.data)
      if (response.data && response.data.mensagem) {
        const mensagem = response.data.mensagem.toLowerCase()
        if (
          mensagem.includes("existe") ||
          mensagem.includes("erro") ||
          mensagem.includes("inválido") ||
          mensagem.includes("invalido")
        ) {
          let field = null
          if (mensagem.includes("celular") || mensagem.includes("telefone") || mensagem.includes("número")) {
            field = "phone"
          } else if (mensagem.includes("nome") || mensagem.includes("usuario") || mensagem.includes("usuário")) {
            field = "name"
          }
          if (mensagem.includes("nome") && (mensagem.includes("celular") || mensagem.includes("telefone"))) {
            field = "both" 
          }
  
          return {
            erro: response.data.mensagem,
            success: false, 
            field: field,
          }
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
        // O servidor respondeu com um status de erro
        console.error("Erro do servidor:", error.response.data)
  
        // Verificar se há mensagem na resposta
        const errorData = error.response.data
        let errorMessage = "Erro no servidor"
        let errorField = null
        if (errorData.mensagem) {
          errorMessage = errorData.mensagem
          const mensagemLower = errorMessage.toLowerCase()
          if (mensagemLower.includes("celular") || mensagemLower.includes("telefone")) {
            errorField = "phone"
          } else if (
            mensagemLower.includes("nome") ||
            mensagemLower.includes("usuario") ||
            mensagemLower.includes("usuário")
          ) {
            errorField = "name"
          }
          if (
            mensagemLower.includes("nome") &&
            (mensagemLower.includes("celular") || mensagemLower.includes("telefone"))
          ) {
            errorField = "both"
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