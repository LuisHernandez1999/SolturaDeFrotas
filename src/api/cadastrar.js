import axios from "axios"

const API_URL = "http://192.168.0.53:8000/api/cadastro/cadastrar_user/";

export const cadastrarUser = async (nome, celular, senha, senhaConfirmar) => {
    try {
      const response = await axios.post(API_URL, {
        nome: nome,
        celular: celular,
        senha: senha,
        senha_confirmar: senhaConfirmar,
      })
  
      console.log("Resposta original da API:", response.data)
  
      // Verificar se há uma mensagem de erro, mesmo que success seja true
      if (response.data && response.data.mensagem) {
        const mensagem = response.data.mensagem.toLowerCase()
  
        // Verificar se a mensagem indica um erro
        if (
          mensagem.includes("existe") ||
          mensagem.includes("erro") ||
          mensagem.includes("inválido") ||
          mensagem.includes("invalido")
        ) {
          // Determinar qual campo está com problema
          let field = null
          if (mensagem.includes("celular") || mensagem.includes("telefone") || mensagem.includes("número")) {
            field = "phone"
          } else if (mensagem.includes("nome") || mensagem.includes("usuario") || mensagem.includes("usuário")) {
            field = "name"
          }
  
          // Se a mensagem menciona ambos nome e celular
          if (mensagem.includes("nome") && (mensagem.includes("celular") || mensagem.includes("telefone"))) {
            field = "both" // Indicar que ambos os campos estão com problema
          }
  
          return {
            erro: response.data.mensagem,
            success: false, // Forçar success como false quando há mensagem de erro
            field: field,
          }
        }
      }
  
      // Se não houver mensagem de erro, considerar como sucesso
      return {
        ...response.data,
        success: true,
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
  
      // Verificar se é um erro de rede (Network Error)
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
  
        // Verificar se há mensagem no campo 'mensagem'
        if (errorData.mensagem) {
          errorMessage = errorData.mensagem
          const mensagemLower = errorMessage.toLowerCase()
  
          // Determinar qual campo está com problema
          if (mensagemLower.includes("celular") || mensagemLower.includes("telefone")) {
            errorField = "phone"
          } else if (
            mensagemLower.includes("nome") ||
            mensagemLower.includes("usuario") ||
            mensagemLower.includes("usuário")
          ) {
            errorField = "name"
          }
  
          // Se a mensagem menciona ambos nome e celular
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
        // A requisição foi feita mas não houve resposta
        console.error("Sem resposta do servidor:", error.request)
        return {
          erro: "Erro ao se comunicar com o servidor. Verifique sua conexão.",
          success: false,
          isNetworkError: true,
        }
      } else {
        // Erro na configuração da requisição
        console.error("Erro na configuração da requisição:", error.message)
        return {
          erro: error.message || "Ocorreu um erro desconhecido",
          success: false,
        }
      }
    }
  }