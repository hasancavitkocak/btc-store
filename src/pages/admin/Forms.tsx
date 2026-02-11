import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import Container from '../../components/Container';
import Section from '../../components/Section';
import Card from '../../components/Card';

export default function Forms() {
  const { t } = useTranslation();
  const { callRequests, productContactForms, products } = useStore();

  return (
    <Section>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('admin.forms')}
          </h1>
          <p className="text-gray-600">View all form submissions</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Call Requests ({callRequests.length})
            </h2>
            {callRequests.length === 0 ? (
              <Card className="p-6">
                <p className="text-gray-500 text-center">No call requests yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {callRequests.slice().reverse().map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{request.name} {request.surname}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{request.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">KVKK Accepted</p>
                        <p className="font-medium">{request.kvkkAccepted ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Product Contact Forms ({productContactForms.length})
            </h2>
            {productContactForms.length === 0 ? (
              <Card className="p-6">
                <p className="text-gray-500 text-center">No product contact forms yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {productContactForms.slice().reverse().map((form) => {
                  const product = products.find((p) => p.id === form.productId);
                  return (
                    <Card key={form.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Product</p>
                          <p className="font-medium">{product ? t(product.nameKey) : form.productId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">{form.name} {form.surname}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{form.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{form.email}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Message</p>
                          <p className="font-medium">{form.message}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(form.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
