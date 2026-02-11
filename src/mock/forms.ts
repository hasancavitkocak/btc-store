export interface CallRequest {
  id: string;
  name: string;
  surname: string;
  phone: string;
  kvkkAccepted: boolean;
  createdAt: string;
}

export interface ProductContactForm {
  id: string;
  productId: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
}

export const callRequests: CallRequest[] = [];

export const productContactForms: ProductContactForm[] = [];
