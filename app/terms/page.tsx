import Link from "next/link";

export default function TermsPage() {
  return <main className="content">
    <header className="simple-header"><Link href="/auth">‹ Back</Link><strong>Terms of Service</strong><span /></header>
    <section className="create-card" style={{lineHeight:1.7}}>
      <p style={{fontSize:12,fontWeight:800,color:"#8a5a00",background:"#fff7e6",padding:10,borderRadius:10}}>WORKING DRAFT — confirm operator details and product rules before public launch.</p>
      <h1>Gista Terms of Service</h1>
      <p><strong>Version:</strong> 0.1 (draft)<br/><strong>Effective date:</strong> To be set before publication.</p>
      <p>Welcome to Gista. Gista is a social platform built around conversation. By creating an account or using Gista, you agree to follow these Terms and applicable law.</p>
      <h3>1. Eligibility and accounts</h3>
      <p>You must meet Gista&apos;s minimum age requirement and be legally able to agree to these Terms. You must provide accurate account information, keep your sign-in credentials secure and tell us if you suspect unauthorised access. Do not impersonate another person or create accounts for fraudulent purposes.</p>
      <h3>2. Your content and licence</h3>
      <p>You retain ownership of content you create, subject to the rights of others. When you upload or publish content, you grant Gista a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, display and distribute that content only as reasonably necessary to operate, secure and provide the service, including showing it to the audiences you choose through the app. The licence ends when the content is deleted, except for limited copies retained in backups, security records or where retention is legally required.</p>
      <p>You are responsible for the content you publish and must have the rights and permissions needed to share it.</p>
      <h3>3. Respectful and lawful use</h3>
      <p>You must not use Gista to threaten, harass or exploit others; impersonate people or organisations; publish unlawful, fraudulent or knowingly deceptive material; expose another person&apos;s private information without a lawful basis; distribute spam or malicious code; infringe intellectual-property rights; or interfere with the platform&apos;s security or operation.</p>
      <h3>4. Moderation and reports</h3>
      <p>Users may report content or accounts and block other users. Gista may review reports, remove content, restrict features, suspend accounts or terminate accounts when reasonably necessary to enforce these Terms, protect users or comply with law. We aim to act fairly and proportionately.</p>
      <h3>5. Public content and interactions</h3>
      <p>Content shared publicly may be viewed, copied or shared by others. Account privacy settings may limit some visibility, but cannot guarantee that other people will not capture or redistribute content they can access.</p>
      <h3>6. Gista intellectual property</h3>
      <p>Gista&apos;s name, branding, software, design and platform materials are owned by Gista&apos;s operator or their respective rights holders. You may not copy or commercially exploit them without permission.</p>
      <h3>7. Service availability and changes</h3>
      <p>We work to keep Gista available but do not guarantee uninterrupted or error-free service. We may maintain, change, suspend or discontinue features when reasonably necessary.</p>
      <h3>8. Account deletion</h3>
      <p>You may request account deletion through Settings. Some information may remain temporarily in backups or be retained where necessary for security, legal compliance or dispute resolution.</p>
      <h3>9. Disclaimers and liability</h3>
      <p>To the extent permitted by applicable law, Gista is provided on an “as available” basis. Nothing in these Terms excludes rights or remedies that cannot lawfully be excluded, including applicable consumer protections.</p>
      <h3>10. Changes to these Terms</h3>
      <p>We may update these Terms as Gista develops. Material changes will be communicated and renewed agreement will be requested where required by law.</p>
      <h3>11. Governing law</h3>
      <p>These Terms are intended to be governed by the laws of the Federal Republic of Nigeria, subject to mandatory legal protections and the jurisdiction of competent courts.</p>
      <h3>12. Contact</h3>
      <p>Gista is operated by Solomon Kelechi Enyinnaya as an individual under the Gista brand. Black Core Technologies is the project/brand affiliation and is not represented here as a separate registered legal entity.</p><p>For questions or complaints, contact:</p><ul><li><strong>Email:</strong> solomonenyinnaya14@gmail.com</li><li><strong>Telephone:</strong> 09131196685</li></ul><p>You may also use the <Link href="/help" style={{color:"#6d28d9",fontWeight:700}}>Gista Help Center</Link>.</p>
      <p><strong>Legal note:</strong> This is a working draft, not legal advice or a guarantee of compliance. It must be reviewed against Gista&apos;s final product rules and applicable law before public use.</p>
      <p><Link href="/privacy" style={{color:"#6d28d9",fontWeight:750}}>Read Gista&apos;s Privacy Policy →</Link></p>
    </section>
  </main>;
}
