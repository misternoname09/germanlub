import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const urlInterceptor: HttpInterceptorFn = (req, next) => {
  // If the request targets the hardcoded local API, rewrite it to use the environment URL.
  // This avoids having to refactor 40+ occurrences of the hardcoded string manually.
  const localApiPrefix = 'http://localhost:8000/api';
  
  if (req.url.startsWith(localApiPrefix)) {
    const newUrl = req.url.replace(localApiPrefix, environment.apiUrl);
    const apiReq = req.clone({ url: newUrl });
    return next(apiReq);
  }
  
  return next(req);
};
