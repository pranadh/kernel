export const webhookLogger = (req, res, next) => {
  console.log('Webhook Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
};