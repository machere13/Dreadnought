export class CatalogQueryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CatalogQueryError';
    this.code = code;
    this.details = details;
  }
}
