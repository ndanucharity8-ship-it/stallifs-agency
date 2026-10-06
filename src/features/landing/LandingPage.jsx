import './LandingPage.css';
import heroImage from '../../assets/hero.png';
import quoteImage from '../../assets/sic.png';
import { Link } from 'react-router-dom';
import {
ArrowRight,
CheckCircle2,
HandCoins,
HeartPulse,
Home,
Car,
ShieldCheck,
Users,
BriefcaseBusiness,
Plane,
DollarSign,
GraduationCap,
ChartNoAxesCombined
} from 'lucide-react';

function LandingPage() {
const products = [
{
title: 'Motor Insurance',
description:
'Protect your vehicle with reliable cover and peace of mind on every journey.',
icon: Car,
path: '/products',
},
{
title: 'Medical Insurance',
description:
'Get access to protection that helps you take care of your health and wellbeing.',
icon: HeartPulse,
path: '/products',
},
{
title: 'Life Insurance',
description:
'Protect your loved ones and secure their future with the right life cover.',
icon: ShieldCheck,
path: '/products',
},
{
title: 'Home Insurance',
description:
'Protect your home and the things that matter most to you.',
icon: Home,
path: '/products',
},
{
title: 'Business Insurance',
description:
'Protect your business with insurance solutions designed around your needs.',
icon: BriefcaseBusiness,
path: '/products',
},
{
title: 'Travel Insurance',
description:
'Travel with confidence knowing you have protection wherever your journey takes you.',
icon: Plane,
path: '/products',
},
];

const features = [
{
title: 'Fast & Easy Claims',
description:
'We make claims simple and hassle-free.',
icon: CheckCircle2,
},
{
title: 'Trusted Advisors',
description:
'Professional guidance to help you make the right decisions.',
icon: Users,
},
{
title: 'Nationwide Support',
description:
'We’re always here for you, anywhere in Kenya.',
icon: HandCoins,
},
];

return ( <div className="landing-page">

```
  {/* ==================================================
      HERO
  ================================================== */}

  <section className="hero">
    <div className="hero__container">

      <div className="hero__copy">
        <h1>
          Insurance made
          <span>simple.</span>
        </h1>

        <p>
          Protect what matters with confidence. Reliable cover, fast
          claims and real support when you need it most.
        </p>

        <div className="hero__actions">
          <Link
            className="button button--primary"
            to="/quote"
          >
            Get a Quote
            <ArrowRight size={18} />
          </Link>

          <Link
            className="button button--secondary"
            to="/products"
          >
            Explore Products
          </Link>
        </div>
      </div>

      <div className="hero__visual">
        <div className="hero__image-wrapper">
          <img
            src={heroImage}
            alt="STALLIFS insurance protection"
            className="hero__image"
          />
        </div>
      </div>

    </div>
  </section>

  {/* ==================================================
      PRODUCTS
  ================================================== */}

  <section className="feature-section products-section">
    <div className="container">

      <div className="section-heading">
        <span className="eyebrow">
          OUR PRODUCTS
        </span>

        <h2>Insurance solutions for every need</h2>
      </div>

      <div className="feature-grid">
        {products.map((product) => {
          const Icon = product.icon;

          return (
            <article
              className="feature-card product-card"
              key={product.title}
            >
              <div className="feature-card__icon">
                <Icon size={28} />
              </div>

              <h3>{product.title}</h3>

              <p>{product.description}</p>

              <Link
                className="feature-card__link"
                to={product.path}
              >
                Learn More
                <ArrowRight size={17} />
              </Link>
            </article>
          );
        })}
      </div>

    </div>
  </section>

  {/* ==================================================
      WHY CHOOSE + INSTANT QUOTE
  ================================================== */}

  <section className="why-quote-section">
    <div className="container">

      <div className="why-quote-layout">

        {/* ==================================================
            WHY CHOOSE STALLIFS
        ================================================== */}

        <div className="why-content">

          <div className="section-heading section-heading--left">
            <span className="eyebrow">
              WHY CHOOSE STALLIFS?
            </span>

            <h2>We’ve got you covered</h2>
          </div>

          <div className="why-list">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  className="why-item"
                  key={feature.title}
                >
                  <div className="why-item__icon">
                    <Icon size={28} strokeWidth={2} />
                  </div>

                  <div className="why-item__content">
                    <h3>{feature.title}</h3>

                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* ==================================================
            INSTANT QUOTE
        ================================================== */}

        <div className="quote-feature">

          <div className="quote-feature__image">
            <img
              src={quoteImage}
              alt="Get an instant insurance quote"
            />
          </div>

          <div className="quote-feature__overlay">
            <span className="eyebrow">
              GET STARTED
            </span>

            <h2>Get an instant quote</h2>

            <p>
              It only takes a few minutes.
            </p>

            <Link
              className="button button--primary"
              to="/quote"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
          </div>

        </div>

      </div>

    </div>
  </section>

  {/* ==================================================
      AGENT CTA
  ================================================== */}

  <section className="cta-section cta-section--agent">
  <div className="container">

```
<div className="cta-card cta-card--agent">

  {/* EXISTING AGENT CONTENT */}
  <div className="cta-card__content">

    <span className="eyebrow">
      JOIN OUR NETWORK
    </span>

    <h2>Become a STALLIFS Agent</h2>

    <p>
      Build your business. Earn great commissions.
    </p>

    <p>
      We’ll support you every step of the way.
    </p>

    <Link
      className="button button--primary"
      to="/apply-agent"
    >
      Apply Now
      <ArrowRight size={18} />
    </Link>

  </div>

  {/* THREE BENEFITS */}
  <div className="agent-benefits">

    <div className="agent-benefit">
      <DollarSign size={30} />
      <span>Attractive Commissions</span>
    </div>

    <span className="agent-benefit__separator">|</span>

    <div className="agent-benefit">
      <GraduationCap size={30} />
      <span>Training &amp; Support</span>
    </div>

    <span className="agent-benefit__separator">|</span>

    <div className="agent-benefit">
      <ChartNoAxesCombined size={30} />
      <span>Grow Your Business</span>
    </div>

  </div>

</div>


  </div>
</section>


</div>


);
}

export default LandingPage;
