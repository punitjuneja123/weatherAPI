let cityValidator = (city) => {
  (req, res, next) => {
    let flag = false;
    for (let i = 0; i < city.length; i++) {
      if (+city[i]) {
        flag = true;
        res.send("city name shouldn't contain any number");
        break;
      }
    }
    if (flag == false) {
      next();
    }
  };
};
module.exports = { cityValidator };
