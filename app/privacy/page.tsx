import Link from "next/link";

export default function PrivacyPage() {
  return <main className="content">
    <header className="simple-header"><Link href="/auth">‹ Back</Link><strong>Privacy Policy</strong><span /></header>
    <section className="create-card" style={{lineHeight:1.7}}>
      <p style={{fontSize:12,fontWeight:800,color:"#8a5a00",background:"#fff7e6",padding:10,borderRadius:10}}>WORKING DRAFT — confirm the operator identity, contact details and technical data practices before public launch.</p>
      <h1>Gista Privacy Policy</h1>
      <p><strong>Version:</strong> 0.1 (draft)<br/><strong>Effective date:</strong> To be set before publication.</p>
      <p>Gista is a social platform for sharing text, photographs and voice posts and taking part in conversations. This policy explains the personal information Gista may process, why it is used, and the choices available to users.</p>
      <h3>1. Who operates Gista?</h3>
      <p><strong>Data controller / operator:</strong> Solomon Kelechi Enyinnaya, operating Gista as an individual under the Gista brand.</p><p><strong>Brand affiliation:</strong> Black Core Technologies (project/brand affiliation; not represented here as a separate registered legal entity).</p>
      <h3>2. Information that may be processed</h3>
      <ul>
        <li><strong>Account details:</strong> email address and authentication information used to create and secure an account.</li>
        <li><strong>Profile details:</strong> username, display name, profile photograph, biography and other details a user chooses to add.</li>
        <li><strong>User content:</strong> text posts, photographs, voice posts, comments and voice responses.</li>
        <li><strong>Interactions:</strong> follows, likes, saves, shares, notifications, reports, blocks and account preferences.</li>
        <li><strong>Technical and security data:</strong> information that hosting, authentication, database, analytics or security services may process, such as IP address, browser/device information, logs and diagnostic events. The exact fields and retention periods must be confirmed against the live configuration.</li>
      </ul>
      <h3>3. How information is used</h3>
      <p>Information is used to create and manage accounts; display profiles and content; provide feeds, search, comments, voice features and notifications; respond to support requests; enforce platform rules; protect the service; troubleshoot problems; and meet legal obligations.</p>
      <h3>4. Content visibility</h3>
      <p>Public posts and profile details may be visible to other users and may be copied or shared by them. Private-account settings restrict visibility as described in the app, but users should avoid posting information they do not want others to see. We must confirm the precise visibility rules for every content type before publication.</p>
      <h3>5. Service providers and storage</h3>
      <p>Gista currently uses Supabase for authentication, database and related backend services, and Vercel for website hosting and deployment. These providers process information as needed to provide their services. Any additional providers, including email delivery, analytics, monitoring or media services, must be added after the production configuration is audited.</p>
      <h3>6. Sharing</h3>
      <p>Gista does not intend to sell users&apos; personal information. Information may be processed by service providers acting for Gista, disclosed where required by law, or used when necessary to protect users, the platform or legal rights. This section must be checked against the actual provider contracts and data flows.</p>
      <h3>7. Security</h3>
      <p>Reasonable technical and organisational measures are used to protect information. No internet service can guarantee absolute security. Suspected data incidents will be handled in accordance with applicable legal requirements.</p>
      <h3>8. Retention and deletion</h3>
      <p>Information should be kept only as long as needed for the purpose for which it was collected, subject to legal, security, dispute-resolution and backup requirements. Exact retention periods for accounts, posts, voice media, support tickets, logs and backups have not yet been confirmed and must be documented before public launch. Users can request account deletion through Settings; deletion may not immediately remove data from protected backups or records that must lawfully be retained.</p>
      <h3>9. Your rights and choices</h3>
      <p>Subject to applicable law, users may have rights to request access to, correction of, deletion of, or restriction of processing of their personal information; object to certain processing; request portability where applicable; and withdraw consent where processing is based on consent. Requests can be submitted through the in-app <Link href="/help" style={{color:"#6d28d9",fontWeight:700}}>Gista Help Center</Link>. Users may also contact the Nigeria Data Protection Commission.</p>
      <h3>10. Children</h3>
      <p>Gista is not intended for people below the minimum age set by its eligibility rules. The final age rule and age-handling process must be confirmed before launch.</p>
      <h3>11. Changes</h3>
      <p>This policy may be updated as Gista changes. Material changes will be communicated and renewed consent will be requested where required by law.</p>
      <h3>12. Contact</h3>
      <p>For privacy questions, data requests or complaints, contact the Gista operator:</p><ul><li><strong>Name:</strong> Solomon Kelechi Enyinnaya</li><li><strong>Email:</strong> solomonenyinnaya14@gmail.com</li><li><strong>Telephone:</strong> 09131196685</li></ul><p>You may also submit a request through the <Link href="/help" style={{color:"#6d28d9",fontWeight:700}}>Gista Help Center</Link>.</p>
      <p><strong>Legal note:</strong> This is a working product draft, not a legal certification or a statement that all compliance requirements have been met. It must be reconciled with Gista&apos;s actual production data flows and applicable law before public use.</p>
      <p><Link href="/terms" style={{color:"#6d28d9",fontWeight:750}}>Read Gista&apos;s Terms of Service →</Link></p>
    </section>
  </main>;
}
