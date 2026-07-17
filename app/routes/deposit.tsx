import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/deposit";

const paypalScriptUrl =
  "https://www.paypal.com/sdk/js?client-id=BAAbK7cvbEz2tMrRNY1DZxpu7mtvaobg4QxEwfXYpiXFWC3civ_-HkD9IdiRCu2ullehUvvJuZq31TWbLQ&components=hosted-buttons&enable-funding=venmo&currency=USD";
const hostedButtonId = "T8P8TE6ENM58W";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Place a Deposit | Homestead Puppies" },
    { name: "description", content: "Place a secure PayPal deposit for a Homestead Puppies puppy." },
  ];
}

function PayPalHostedButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.paypal?.HostedButtons) return;
      containerRef.current.innerHTML = "";
      window.paypal
        .HostedButtons({ hostedButtonId })
        .render(containerRef.current)
        .catch(() => !cancelled && setError(true));
    };

    if (window.paypal?.HostedButtons) {
      render();
      return () => { cancelled = true; };
    }

    let script = document.querySelector<HTMLScriptElement>("script[data-homestead-paypal]");
    if (!script) {
      script = document.createElement("script");
      script.src = paypalScriptUrl;
      script.async = true;
      script.dataset.homesteadPaypal = "true";
      document.head.appendChild(script);
    }

    const handleError = () => !cancelled && setError(true);
    script.addEventListener("load", render, { once: true });
    script.addEventListener("error", handleError, { once: true });

    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      script?.removeEventListener("error", handleError);
    };
  }, []);

  if (error) {
    return (
      <div className="payment-error" role="alert">
        <h3>PayPal did not load.</h3>
        <p>Please refresh the page or use the deposit page on the original site.</p>
        <a className="button secondary small" href="https://homestead-puppies.com/deposit">Open original deposit page</a>
      </div>
    );
  }

  return <div ref={containerRef} id="paypal-hosted-button" className="paypal-container" aria-label="PayPal deposit options" />;
}

export default function Deposit() {
  const [searchParams] = useSearchParams();
  const selectedPuppy = searchParams.get("puppy")?.trim().slice(0, 60);

  return (
    <section className="deposit-page section-shell">
      <div className="deposit-copy">
        <p className="eyebrow">Secure checkout</p>
        <h1>{selectedPuppy ? `Reserve ${selectedPuppy}` : "Place a puppy deposit"}</h1>
        <p className="deposit-lede">
          Use the secure PayPal checkout to place your deposit. PayPal may also
          offer Venmo or another eligible funding option on your device.
        </p>

        <div className="deposit-checklist">
          <h2>Before you deposit</h2>
          <ol>
            <li><span>1</span><p><strong>Confirm availability.</strong> Make sure the puppy you’re interested in is still available.</p></li>
            <li><span>2</span><p><strong>Ask your questions.</strong> Contact us if you need details about pickup, timing, or what the deposit covers.</p></li>
            <li><span>3</span><p><strong>Pay securely.</strong> Complete the hosted checkout without sharing payment details with this site.</p></li>
          </ol>
        </div>
        <p className="help-note">
          Need to talk first? <a href="https://homestead-puppies.com/contact">Send us a message</a> or <Link to="/puppies">return to the puppies</Link>.
        </p>
      </div>

      <aside className="payment-card" aria-labelledby="payment-title">
        <div className="secure-label"><span aria-hidden="true">●</span> Hosted securely by PayPal</div>
        <h2 id="payment-title">Complete your deposit</h2>
        {selectedPuppy && <p className="selected-puppy">For: <strong>{selectedPuppy}</strong></p>}
        <PayPalHostedButton />
        <p className="payment-footnote">Payment details are handled directly by PayPal and are never stored by Homestead Puppies.</p>
      </aside>
    </section>
  );
}
