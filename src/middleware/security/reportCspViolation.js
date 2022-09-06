import { logger } from "@utils";

export const reportCspViolation = (req, res) => {
  const report = Object.prototype.hasOwnProperty.call(req.body, "csp-report")
    ? req.body["csp-report"]
    : { ...req.body };

  logger.security(report, "CSP VIOLATION REPORT");
  res.end();
};

/* EXAMPLE STRUCTURE:

'csp-report': {
  'document-uri': 'http://localhost:5500/',
  referrer: '',
  'violated-directive': 'script-src-elem',
  'effective-directive': 'script-src-elem',
  'original-policy': "default-src 'self'; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com; script-src 'self' https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/ 'sha256-INJfZVfoUd61ITRFLf63g+S/NJAfswGDl15oK0iXgYM='; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css; frame-src 'self' https://www.youtube.com https://youtube.com; report-uri /__cspreport__;",
  disposition: 'report',
  'blocked-uri': 'inline',
  'line-number': 58,
  'source-file': 'http://localhost:5500/',
  'status-code': 200,
  'script-sample': ''
}
*/
