import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Car,
  HeartPulse,
  Home,
  Plane,
  ShieldCheck,
  Umbrella,
} from 'lucide-react';
import Card from '../../../shared/components/Card/Card';

const products = {
  motor: {
    name: 'Motor Insurance',
    icon: Car,
    description:
      'Protect your vehicle against accidents, theft, damage, and other covered risks.',
    features: [
      'Vehicle protection against covered accidental damage',
      'Protection against eligible theft and loss',
      'Flexible cover options based on your needs',
    ],
  },
  medical: {
    name: 'Medical Insurance',
    icon: HeartPulse,
    description:
      'Access financial protection for eligible medical treatment and healthcare expenses.',
    features: [
      'Financial protection for eligible medical expenses',
      'Cover options designed around individual and family needs',
      'Support throughout your insurance journey',
    ],
  },
  life: {
    name: 'Life Insurance',
    icon: ShieldCheck,
    description:
      'Provide financial protection for your loved ones with life cover designed around your needs.',
    features: [
      'Financial protection for your beneficiaries',
      'Cover options based on your protection needs',
      'A structured way to plan for the future',
    ],
  },
  property: {
    name: 'Property Insurance',
    icon: Home,
    description:
      'Protect your home and property against covered losses and unexpected events.',
    features: [
      'Protection for eligible property losses',
      'Cover designed around your property needs',
      'Financial support following covered events',
    ],
  },
  business: {
    name: 'Business Insurance',
    icon: BriefcaseBusiness,
    description:
      'Protect your business, assets, and operations against eligible risks.',
    features: [
      'Protection for eligible business assets',
      'Cover options for different business needs',
      'Support for managing unexpected covered losses',
    ],
  },
  travel: {
    name: 'Travel Insurance',
    icon: Plane,
    description:
      'Travel with greater confidence with protection for eligible travel-related risks.',
    features: [
      'Protection against eligible travel-related losses',
      'Cover options for different travel needs',
      'Support during your covered journey',
    ],
  },
  accident: {
    name: 'Personal Accident Insurance',
    icon: Umbrella,
    description:
      'Get financial protection against eligible accidental injury and related losses.',
    features: [
      'Financial protection against eligible accidental injuries',
      'Cover designed around your personal protection needs',
      'Support following covered accidental events',
    ],
  },
};

function ProductDetailsPage() {
  const { id } = useParams();
  const product = products[id];

  if (!product) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <span className="eyebrow">PRODUCT NOT FOUND</span>
          <h1>We couldn't find that insurance product.</h1>
          <p>
            Return to our products page to explore the available STALLIFS
            insurance products.
          </p>

          <div className="hero__actions">
            <Link className="button button--primary" to="/products">
              View Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const Icon = product.icon;

  return (
    <section className="product-details-page">
      <div className="container">
        <Link className="product-details__back" to="/products">
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="product-details__hero">
          <div className="product-details__copy">
            <div className="product-details__icon" aria-hidden="true">
              <Icon size={34} />
            </div>

            <span className="eyebrow">STALLIFS INSURANCE</span>

            <h1>{product.name}</h1>

            <p>{product.description}</p>

            <div className="product-details__actions">
              <Link className="button button--primary" to="/quote">
                Get a Quote
                <ArrowRight size={18} />
              </Link>

              <Link className="button button--secondary" to="/products">
                Explore Other Products
              </Link>
            </div>
          </div>

          <Card className="product-details__summary">
            <ShieldCheck size={30} />

            <h2>Protection made simpler</h2>

            <p>
              Start your insurance journey with STALLIFS and explore cover
              based on your needs.
            </p>
          </Card>
        </div>

        <div className="product-details__features">
          <div className="section-heading">
            <span className="eyebrow">WHAT'S INCLUDED</span>
            <h2>Designed around your protection needs</h2>
          </div>

          <div className="product-details__feature-grid">
            {product.features.map((feature) => (
              <Card key={feature} className="product-details__feature">
                <ShieldCheck size={24} />
                <p>{feature}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="product-details__cta">
          <Card>
            <div>
              <span className="eyebrow">READY TO GET STARTED?</span>
              <h2>Find out what your cover could look like.</h2>
              <p>
                Get a personalised quote and continue your STALLIFS insurance
                journey.
              </p>
            </div>

            <Link className="button button--primary" to="/quote">
              Get a Quote
              <ArrowRight size={18} />
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;