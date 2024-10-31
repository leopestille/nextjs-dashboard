// Este arquivo contém definições de tipo para seus dados.
// Ele descreve o formato dos dados e qual tipo de dados cada propriedade deve aceitar.
// Para simplificar o ensino, estamos definindo esses tipos manualmente.
// No entanto, esses tipos são gerados automaticamente se você estiver usando um ORM como o Prisma.
/**
 * Representa um usuário no sistema.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

/**
 * Representa um cliente.
 */
export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

/**
 * Representa uma fatura.
 */
export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // No TypeScript, isso é chamado de tipo de união de string.
  // Isso significa que a propriedade "status" só pode ser uma das duas strings: 'pendente' ou 'pago'.
  status: 'pending' | 'paid';
};

/**
 * Representa os dados de receita de um mês específico.
 */
export type Revenue = {
  month: string;
  revenue: number;
};

/**
 * Representa os detalhes da fatura mais recente.
 */
export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// O banco de dados retorna um número para o valor, mas depois o formatamos para uma string com a função formatCurrency

/**
 * Representa a versão bruta do tipo LatestInvoice, com o campo 'amount'
 * sendo um número em vez de seu tipo original.
 */
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

/**
 * Representa a estrutura de uma fatura na tabela de faturas.
 */
export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

/**
 * Representa uma entrada de tabela de clientes formatada.
 */
export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

/**
 * Representa um campo de cliente com um ID e um nome.
 */
export type CustomerField = {
  id: string;
  name: string;
};

/**
 * Representa os dados do formulário para uma fatura. 
 */
export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
