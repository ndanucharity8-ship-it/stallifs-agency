import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
} from 'lucide-react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import api from '../../../shared/api/axios';
import Button from '../../../shared/components/Button/Button';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';
import { useAuth } from '../../../app/providers/useAuth';

import './GetQuote.css';

const initialForm = {
  product: '',
  fullName: '',
  phone: '',
  age: '',
  details: '',
  vehicleValue: '',
  vehicleAge: '',
  coverType: 'comprehensive',
  members: 1,
  coverAmount: 500000,
  travellers: 1,
  duration: 1,
  businessValue: '',
  propertyValue: '',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function GetQuote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [quote, setQuote] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => product._id === form.product,
      ),
    [products, form.product],
  );

  const category =
    selectedProduct?.category?.toLowerCase();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setError('');

        const response = await api.get('/products');

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.products || [];

        setProducts(data);

        const requestedProduct =
          searchParams.get('product');

        if (
          requestedProduct &&
          data.some(
            (product) =>
              product._id === requestedProduct,
          )
        ) {
          setForm((current) => ({
            ...current,
            product: requestedProduct,
          }));
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load insurance products.',
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === 'product') {
      setQuote(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.product) {
      setError(
        'Please select an insurance product.',
      );
      return;
    }

    const fullName =
      form.fullName || user?.name || '';

    const phone =
      form.phone || user?.phone || '';

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    try {
      setCalculating(true);
      setError('');
      setQuote(null);

      const response = await api.post('/quotes', {
        ...form,

        fullName: fullName.trim(),
        phone: phone.trim(),

        age: form.age
          ? Number(form.age)
          : undefined,

        vehicleValue: form.vehicleValue
          ? Number(form.vehicleValue)
          : undefined,

        vehicleAge: form.vehicleAge
          ? Number(form.vehicleAge)
          : undefined,

        members: Number(form.members),
        coverAmount: Number(form.coverAmount),
        travellers: Number(form.travellers),
        duration: Number(form.duration),

        businessValue: form.businessValue
          ? Number(form.businessValue)
          : undefined,

        propertyValue: form.propertyValue
          ? Number(form.propertyValue)
          : undefined,
      });

      setQuote(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to calculate your quote. Please try again.',
      );
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyForQuote = () => {
    if (!quote?._id) {
      return;
    }

    const applicationPath =
      `/apply-for-quote/${encodeURIComponent(
        quote._id,
      )}`;

    if (user) {
      navigate(applicationPath);
      return;
    }

    navigate(
      `/login?redirect=${encodeURIComponent(
        applicationPath,
      )}`,
    );
  };

  const renderProductFields = () => {
    if (!category) {
      return null;
    }

    if (category === 'motor') {
      return (
        <>
          <div className="quote-form__field">
            <label htmlFor="vehicleValue">
              Vehicle value (KES)
            </label>

            <input
              id="vehicleValue"
              name="vehicleValue"
              type="number"
              min="0"
              value={form.vehicleValue}
              onChange={updateField}
              placeholder="e.g. 1500000"
              required
            />
          </div>

          <div className="quote-form__field">
            <label htmlFor="vehicleAge">
              Vehicle age (years)
            </label>

            <input
              id="vehicleAge"
              name="vehicleAge"
              type="number"
              min="0"
              value={form.vehicleAge}
              onChange={updateField}
              placeholder="e.g. 3"
              required
            />
          </div>

          <div className="quote-form__field">
            <label htmlFor="coverType">
              Cover type
            </label>

            <select
              id="coverType"
              name="coverType"
              value={form.coverType}
              onChange={updateField}
            >
              <option value="comprehensive">
                Comprehensive
              </option>

              <option value="third_party">
                Third Party
              </option>
            </select>
          </div>
        </>
      );
    }

    if (category === 'medical') {
      return (
        <div className="quote-form__field">
          <label htmlFor="members">
            Number of members
          </label>

          <input
            id="members"
            name="members"
            type="number"
            min="1"
            value={form.members}
            onChange={updateField}
            required
          />
        </div>
      );
    }

    if (category === 'life') {
      return (
        <div className="quote-form__field">
          <label htmlFor="coverAmount">
            Cover amount (KES)
          </label>

          <input
            id="coverAmount"
            name="coverAmount"
            type="number"
            min="0"
            value={form.coverAmount}
            onChange={updateField}
            required
          />
        </div>
      );
    }

    if (category === 'travel') {
      return (
        <>
          <div className="quote-form__field">
            <label htmlFor="travellers">
              Number of travellers
            </label>

            <input
              id="travellers"
              name="travellers"
              type="number"
              min="1"
              value={form.travellers}
              onChange={updateField}
              required
            />
          </div>

          <div className="quote-form__field">
            <label htmlFor="duration">
              Travel duration (days)
            </label>

            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              value={form.duration}
              onChange={updateField}
              required
            />
          </div>
        </>
      );
    }

    if (category === 'business') {
      return (
        <div className="quote-form__field">
          <label htmlFor="businessValue">
            Business value (KES)
          </label>

          <input
            id="businessValue"
            name="businessValue"
            type="number"
            min="0"
            value={form.businessValue}
            onChange={updateField}
            placeholder="e.g. 2000000"
            required
          />
        </div>
      );
    }

    if (category === 'property') {
      return (
        <div className="quote-form__field">
          <label htmlFor="propertyValue">
            Property value (KES)
          </label>

          <input
            id="propertyValue"
            name="propertyValue"
            type="number"
            min="0"
            value={form.propertyValue}
            onChange={updateField}
            placeholder="e.g. 5000000"
            required
          />
        </div>
      );
    }

    return null;
  };

  if (loadingProducts) {
    return (
      <LoadingState message="Loading insurance products..." />
    );
  }

  return (
    <section className="quote-page">
      <div className="container">
        <div className="quote-page__heading">
          <span className="eyebrow">GET A QUOTE</span>

          <h1>Find your estimated premium</h1>

          <p>
            Tell us a little about the cover you need
            and STALLIFS will calculate an initial
            estimated premium.
          </p>
        </div>

        {error && (
          <div
            className="quote-alert"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="quote-layout">
          <Card>
            <div className="quote-card__heading">
              <Calculator size={24} />

              <div>
                <h2>Your quote details</h2>

                <p>
                  Complete the information below to
                  calculate your estimate.
                </p>
              </div>
            </div>

            <form
              className="quote-form"
              onSubmit={handleSubmit}
            >
              <div className="quote-form__field">
                <label htmlFor="product">
                  Insurance product
                </label>

                <select
                  id="product"
                  name="product"
                  value={form.product}
                  onChange={updateField}
                  required
                >
                  <option value="">
                    Select a product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quote-form__grid">
                <div className="quote-form__field">
                  <label htmlFor="fullName">
                    Full name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={
                      form.fullName ||
                      user?.name ||
                      ''
                    }
                    onChange={updateField}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="quote-form__field">
                  <label htmlFor="phone">
                    Phone number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={
                      form.phone ||
                      user?.phone ||
                      ''
                    }
                    onChange={updateField}
                    placeholder="07XXXXXXXX"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <div className="quote-form__field">
                <label htmlFor="age">
                  Age
                </label>

                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  value={form.age}
                  onChange={updateField}
                  placeholder="Your age"
                  required={[
                    'motor',
                    'medical',
                    'life',
                    'accident',
                  ].includes(category)}
                />
              </div>

              <div className="quote-form__grid">
                {renderProductFields()}
              </div>

              <div className="quote-form__field">
                <label htmlFor="details">
                  Additional details
                </label>

                <textarea
                  id="details"
                  name="details"
                  rows="4"
                  value={form.details}
                  onChange={updateField}
                  placeholder="Tell us anything else that may help with your quote."
                />
              </div>

              <Button
                type="submit"
                disabled={calculating}
              >
                {calculating
                  ? 'Calculating...'
                  : 'Calculate Quote'}

                {!calculating && (
                  <ArrowRight size={18} />
                )}
              </Button>
            </form>
          </Card>

          <div className="quote-result-column">
            {quote ? (
              <Card className="quote-result">
                <div className="quote-result__icon">
                  <CheckCircle2 size={28} />
                </div>

                <span className="eyebrow">
                  ESTIMATED PREMIUM
                </span>

                <h2>
                  {formatCurrency(
                    quote.estimatedPremium,
                  )}
                </h2>

                <p>
                  Your initial estimated premium for{' '}
                  <strong>
                    {quote.product?.name}
                  </strong>
                  .
                </p>

                {quote.calculation?.breakdown && (
                  <div className="quote-breakdown">
                    <h3>Quote breakdown</h3>

                    {Object.entries(
                      quote.calculation.breakdown,
                    ).map(([key, value]) => (
                      <div
                        className="quote-breakdown__row"
                        key={key}
                      >
                        <span>
                          {key
                            .replace(
                              /([A-Z])/g,
                              ' $1',
                            )
                            .replace(
                              /^./,
                              (letter) =>
                                letter.toUpperCase(),
                            )}
                        </span>

                        <strong>
                          {typeof value ===
                          'number'
                            ? key
                                .toLowerCase()
                                .includes('rate')
                              ? `${(
                                  value * 100
                                ).toFixed(2)}%`
                              : key
                                    .toLowerCase()
                                    .includes(
                                      'value',
                                    ) ||
                                  key ===
                                    'coverAmount' ||
                                  key ===
                                    'basePremium' ||
                                  key ===
                                    'minimumPremium'
                                ? formatCurrency(
                                    value,
                                  )
                                : value
                            : String(value)}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                <div className="quote-result__actions">
                  <Button
                    type="button"
                    onClick={
                      handleApplyForQuote
                    }
                  >
                    Apply for this quote
                    <ArrowRight size={18} />
                  </Button>

                  <Link
                    className="button button--secondary"
                    to="/products"
                  >
                    Explore other products
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="quote-result quote-result--empty">
                <Calculator size={32} />

                <h2>
                  Your estimate will appear here
                </h2>

                <p>
                  Select a product and complete the
                  form to see your estimated premium
                  and calculation details.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default GetQuote;