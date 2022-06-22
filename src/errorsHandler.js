export const unauthorizedHandler = (err, req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({ message: err.message });
  }
};

export const forbiddenHandler = (err, req, res, next) => {
  if (err.status === 403) {
    res.status(403).send({ message: err.message });
  }
};

export const genericHandler = (err, req, res, next) => {
  if (err.status === 500) {
    res.status(403).send({ message: err.message });
  }
};
