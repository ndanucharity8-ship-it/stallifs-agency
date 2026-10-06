import { Link } from 'react-router-dom';
import './Footer.css';
import stallifsLogo from '../../../assets/stallifs_logo.png';

function Footer() {
return ( <footer className="site-footer"> <div className="container site-footer__inner"> <div className="site-footer__brand"> <Link to="/" className="site-footer__logo"> <img
           src={stallifsLogo}
           alt="STALLIFS"
           className="site-footer__logo-image"
         /> </Link>

```
      <p className="site-footer__tagline">
        Simple, reliable insurance for life&apos;s important moments.
      </p>
    </div>

    <nav className="site-footer__nav" aria-label="Footer navigation">
      <Link to="/">Home</Link>
      <Link to="/products">Products</Link>
      <Link to="/quote">Get a Quote</Link>
      <Link to="/apply-agent">Apply as Agent</Link>
    </nav>

    <div className="site-footer__support">
      <span className="site-footer__label">Need help?</span>

      <a href="mailto:stallyagency@gmail.com">
        stallyagency@gmail.com
      </a>

      <a href="tel:0718250239">
        0718250239
      </a>
    </div>
  </div>

  <div className="site-footer__bottom">
    <div className="container site-footer__bottom-inner">
      <p>
        &copy; {new Date().getFullYear()} STALLIFS. All rights reserved.
      </p>

      <div className="site-footer__legal">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </div>
    </div>
  </div>
</footer>


);
}

export default Footer;
