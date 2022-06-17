export const unauthorizedHandler = (req, res, next) => {
  if (err.status === 401) {
    res.status(401).send({ message: err.message });
  }
};

export const forbiddenHandler = (req, res, next) => {
  if (err.status === 403) {
    res.status(403).send({ message: err.message });
  }
};

export const genericHandler = (req, res, next) => {
  if (err.status === 500) {
    res.status(403).send({ message: err.message });
  }
};
