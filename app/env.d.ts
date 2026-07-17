interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type PayPalHostedButtons = {
  render: (target: HTMLElement | string) => Promise<void>;
};

interface Window {
  paypal?: {
    HostedButtons: (options: { hostedButtonId: string }) => PayPalHostedButtons;
  };
}
