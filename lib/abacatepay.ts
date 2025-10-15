import axios, { AxiosInstance } from 'axios';

// Tipos baseados na documentação do AbacatePay
export interface AbacatePayCustomer {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
}

export interface AbacatePayCustomerResponse {
  data: {
    id: string;
    metadata: AbacatePayCustomer;
  };
  error: string | null;
}

export interface CreatePixQRCodeRequest {
  amount: number; // Valor em centavos
  expiresIn: number; // Tempo de expiração em segundos
  description: string;
  customer?: AbacatePayCustomer;
  metadata?: {
    externalId?: string;
    [key: string]: any;
  };
}

export interface PixQRCodeResponse {
  data: {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    devMode: boolean;
    brCode: string; // Código PIX copia-e-cola
    brCodeBase64: string; // QR Code em base64
    platformFee: number;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
  };
  error: string | null;
}

export interface PaymentStatusResponse {
  data: {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
    devMode: boolean;
    brCode: string;
    brCodeBase64: string;
    platformFee: number;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    paidAt?: string;
  };
  error: string | null;
}

class AbacatePayClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    const baseURL = process.env.ABACATEPAY_BASE_URL || 'https://api.abacatepay.com/v1';

    if (!apiKey) {
      throw new Error('ABACATEPAY_API_KEY não está configurada');
    }

    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos
    });
  }

  /**
   * Cria um novo cliente no AbacatePay
   */
  async createCustomer(customer: AbacatePayCustomer): Promise<AbacatePayCustomerResponse> {
    try {
      const response = await this.client.post<AbacatePayCustomerResponse>(
        '/customer/create',
        customer
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar cliente no AbacatePay:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error || 'Erro ao criar cliente no AbacatePay'
      );
    }
  }

  /**
   * Cria um QR Code PIX para pagamento
   */
  async createPixQRCode(request: CreatePixQRCodeRequest): Promise<PixQRCodeResponse> {
    try {
      const response = await this.client.post<PixQRCodeResponse>(
        '/pixQrCode/create',
        request
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar QR Code PIX:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error || 'Erro ao criar QR Code PIX'
      );
    }
  }

  /**
   * Consulta o status de um pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await this.client.get<PaymentStatusResponse>(
        `/pixQrCode/${paymentId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Erro ao consultar status do pagamento:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error || 'Erro ao consultar status do pagamento'
      );
    }
  }

  /**
   * Lista todos os pagamentos
   */
  async listPayments(): Promise<any> {
    try {
      const response = await this.client.get('/pixQrCode/list');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao listar pagamentos:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error || 'Erro ao listar pagamentos'
      );
    }
  }
}

// Singleton instance
let abacatePayClient: AbacatePayClient | null = null;

export function getAbacatePayClient(): AbacatePayClient {
  if (!abacatePayClient) {
    abacatePayClient = new AbacatePayClient();
  }
  return abacatePayClient;
}

export default AbacatePayClient;