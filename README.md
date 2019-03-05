[firebase-url]: https://console.firebase.google.com/u/0/project/strv-addressbook-hernandez-fra/database
[heroku-url]: https://dashboard.heroku.com/apps/strv-addressbook-hernandez-fra
[documentation]: https://strv-addressbook-hernandez-fra.herokuapp.com/api/docs

# Backend Test Project: 
- Name: strv-addressbook-hernandez-francisco
- Documentation: [API docs][documentation] 


## Project description

The addressbook backend will be used by your users to perform the following tasks:

- Register new account
- Manage their contacts

## Technical details

This is a RESTful API delivered with expressJS

### Deployment

- API Deployment with Heroku
- Set up continuous integration with Heroku-CI.

### API

- [x] Use Node.js
- [x] Use framework Express.
- [x] HTTP responses follow best practices in the industry (especially with regard to status code definitions and request/response headers' usage)
- [x] API communicates with their clients using JSON data structures
- [x] Use stateless authentication.

### User accounts

- [x] All user account information are stored in a NoSQL database - MongoDB.
- [x] Registrations done with email+password
- [x] Implementing the following functionality:
  - [x] User registration
  - [x] User login

### Contact data

- [x] All your users' contacts are stored in [Firebase][firebase-url]
- [x] You should implement only the following functionality on backend:
  - [x] Create a new contact

### Firebase & Heroku project naming convention

 #### Firebase project
 - [x] [strv-addressbook-hernandez-fra][firebase-url]

 #### Heroku project
 - [x] [strv-addressbook-hernandez-fra][heroku-url]

## Review process

### 🔥 Security

- [x] Private endpoint protected via token validation
- [x] User passwords encrypted with bcrypt package
  - I didn't know if the token created needed to be valid to use in firebase as a custom token, the production release contains a simple JWT token with HS256 algorithm signed with a SECRET phrase
  - But if you need it to be valid as a firebase custom token, the code is in this [commit](https://github.com/fxhernandez87/strv-addressbook-hernandez-francisco/commit/4d668c37dbbe5d86dd04a74970060e828eb1b9ef), where a public and private key was needed.

### 🔥 Testability

Fully tested with mocha, chai and sinonJS.
Also with test coverage 
![Coverage](https://scontent.faep5-1.fna.fbcdn.net/v/t1.0-9/53532488_10217581688149463_3438246613233958912_o.jpg?_nc_cat=110&_nc_ht=scontent.faep5-1.fna&oh=8e7c26eaab3597f3856554987f2cb015&oe=5D1C599B)

### Development and deployment
- Local:
  - To run this project locally we need to create a .env file using .env.example. 
  - Have mongodb running and thats it.
  - ***npm start***
- Deploy:
  - The API is connected with heroku CI and github. Every push to develop will create the API in a staging environment not before running the tests. The same happens with master branch, and will rebuild the app on production.
  - I use Git Flow as my work flow, so i try not to promote the staging environment to production, instead i create a release, a PR containing all the develop changes and review the app. Then i merge it to master.
