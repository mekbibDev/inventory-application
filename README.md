# Dependencies to install

- nodemon (dev)
- compression
- cookie-parser
- debug
- dotenv
- express
- express-async-handler
- express-rate-limit
- express-validator
- helmet
- http-errors
- mongoose
- morgan
- pug

# Scripts to add

```
   "scripts": {
   "start": "node ./bin/www",
   "devstart": "nodemon --inspect ./bin/www",
   "serverstart":"DEBUG=`name of project`:* yarn devstart"
 }
```
