import {executeQuery} from '../query/executeQuery.mjs';
import {CatalogQueryError} from '../query/errors.mjs';

export function invokeCatalog(operation, args, config) {
  try {
    const {component, query, ...options} = args;
    const payload = executeQuery({operation, catalogPath: config.catalogPath,
      projectPath: config.projectPath, component, query, options});
    return {content: [{type: 'text', text: JSON.stringify(payload)}], structuredContent: payload};
  } catch (error) {
    const known = error instanceof CatalogQueryError;
    const payload = {responseVersion: 1, operation, error: {
      code: known ? error.code : 'INTERNAL_ERROR',
      message: known ? error.message : 'Unexpected catalog error',
      details: known ? error.details : {},
    }};
    return {content: [{type: 'text', text: JSON.stringify(payload)}], structuredContent: payload, isError: true};
  }
}
