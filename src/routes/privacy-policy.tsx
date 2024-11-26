import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <article className="prose w-full max-w-screen-md text-foreground">
      <h1 className="text-foreground">Privacy Policy</h1>
      <h2 className="text-foreground">Information We Collect</h2>
      <p className="text-foreground">
        <strong className="text-foreground">YNAB Data:</strong> No data from your YNAB account is
        stored or retained by our app. The only data we handle is your YNAB access token.
      </p>
      <ul>
        <li>
          We have no access to, nor do we collect, any bank credentials or account information from
          YNAB.
        </li>
        <li>
          Your YNAB access token is stored securely in your browser's local storage to ensure that
          it is not exposed or accessible by unauthorized parties.
        </li>
        <li>We do not store any other data collected from YNAB on our servers or elsewhere.</li>
      </ul>

      <p>
        <strong className="text-foreground">Personal Information:</strong> We do not collect or
        store any personal information such as your name, email address, or phone number.
      </p>
      <p>
        <strong className="text-foreground">Usage Data:</strong> We do not collect or store any
        usage data or information about how you interact with the app.
      </p>

      <h2 className="text-foreground">How We Use Your Information</h2>
      <p className="text-foreground">
        Since no user data is collected or stored, there is no data usage beyond facilitating access
        to your YNAB account using the access token stored in your browser.
      </p>

      <h2 className="text-foreground">Data Sharing</h2>
      <p className="text-foreground">
        We do not sell, trade, or transfer your information to any third parties. Your YNAB access
        token remains secure within your browser and is not accessible by us.
      </p>

      <h2 className="text-foreground">Updates to Our Privacy Policy</h2>
      <p>
        We may update our privacy policy from time to time. Any changes will be reflected on this
        page.
      </p>

      <h2 className="text-foreground">Contact Us</h2>
      <p>
        If you have any questions or concerns about our privacy practices, please contact me at
        <br />
        <a
          className="dark:text-white dark:hover:text-gray-300"
          href="mailto:trackingaccountupdaterforynab@manz.aleeas.com"
        >
          trackingaccountupdaterforynab@manz.aleeas.com
        </a>
        .
      </p>
    </article>
  );
}
