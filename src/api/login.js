import axios from "axios";
const API_URL = "http://192.168.0.53:8000/api/login/";

export const login = async (celular, senha) => {
    try {
        if (!celular || !senha) {
            throw new Error("Celular e senha são obrigatórios.");
        }

        const response = await axios.post(`${API_URL}`, { celular, senha });

        return {
            success: true,
            token: response.data.token,
            nome: response.data.nome,
            mensagem: response.data.mensagem
        };
    } catch (error) {
        return {
            success: false,
            status: error.response?.status || 500,
            message: error.response?.data?.erro || error.message || "Erro inesperado. Tente novamente mais tarde."
        };
    }
};
