
import { NewsletterSubscription, AdvertiserInquiry } from '../types';

export const saveNewsletterSubscription = async (data: NewsletterSubscription): Promise<{ success: boolean; message: string }> => {
  console.log('Sincronizando Lead Qualificado com Supabase/n8n:', data);
  await new Promise(resolve => setTimeout(resolve, 1200));
  return {
    success: true,
    message: `Excelente, ${data.firstName}. Sua credencial de acesso foi gerada. Em breve você receberá o próximo briefing em ${data.email}.`
  };
};

export const saveAdvertiserInquiry = async (data: AdvertiserInquiry): Promise<{ success: boolean; message: string }> => {
  console.log('Enviando proposta comercial para n8n:', data);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    success: true,
    message: `Sua solicitação foi encaminhada ao nosso conselho comercial. Em até 24h, um de nossos executivos entrará em contato via ${data.email}.`
  };
};
