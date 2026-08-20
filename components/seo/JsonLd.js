export default function JsonLd({ schema }) {
  if (!schema) return null;
  
  // Safely serialize JSON-LD to prevent XSS script injection
  const jsonString = JSON.stringify(schema).replace(/</g, '\\u003c');
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
