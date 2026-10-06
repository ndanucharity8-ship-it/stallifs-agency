import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Car,
  HeartPulse,
  Home,
  Plane,
  ShieldCheck,
  Umbrella,
} from 'lucide-react';
import Card from '../../../shared/components/Card/Card';

const products = [
  {
    id: 'motor',
    name: 'Motor Insurance',
    description:
      'Protect your vehicle against accidents, theft, damage, and other covered risks.',
    icon: Car,
  },
  {
    id: 'medical',
    name: 'Medical Insurance',
    description:
      'Access financial protection for eligible medical treatment and healthcare expenses.',
    icon: HeartPulse,
  },
  {
    id: 'life',
    name: 'Life Insurance',
    description:
      'Provide financial protection for your loved ones with life cover designed around your needs.',
    icon: ShieldCheck,
  },
  {
    id: 'property',
    name: 'Property Insurance',
    description:
      'Protect your home and property against covered losses and unexpected events.',
    icon: Home,
  },
  {
    id: 'business',
    name: 'Business Insurance',
    description:
      'Protect your business, assets, and operations against eligible risks.',
    icon: BriefcaseBusiness,
  },
  {
    id: 'travel',
    name: 'Travel Insurance',
    description:
      'Travel with greater confidence with protection for eligible travel-related risks.',
    icon: Plane,
  },
  {
    id: 'accident',
    name: 'Personal Accident Insurance',
    description:
      'Get financial protection against eligible accidental injury and related losses.',
    icon: Umbrella,
  },
];

function ProductsPage() {
  return (
    <section className="products-page">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">OUR PRODUCTS</span>

          <h1>Insurance designed around what matters.</h1>

          <p>
            Explore STALLIFS insurance products and find the protection that
            fits your needs.
          </p>
        </div>

        <div className="products-grid">
          {products.map((product) => {
            const Icon = product.icon;

            return (
              <Card key={product.id} className="product-card">
                <div className="product-card__icon" aria-hidden="true">
                  <Icon size={28} />
                </div>

                <div className="product-card__content">
                  <h2>{product.name}</h2>

                  <p>{product.description}</p>

                  <Link
                    className="button button--secondary"
                    to={`/products/${product.id}`}
                  >
                    View Product
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProductsPage;