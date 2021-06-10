# NeighborhoodRecipe

## Table of Contents
- [NeighborhoodRecipe](#neighborhoodrecipe)
  - [Table of Contents](#table-of-contents)
  - [About](#about)
  - [Data Strategy](#data-strategy)
  - [Languages, Libraries, Framekworks Applied](#languages-libraries-framekworks-applied)
  - [UML Diagrams](#uml-diagrams)
    - [Class](#class)
    - [Sequence](#sequence)
      - [Register/Login](#registerlogin)
      - [Google Authentication](#google-authentication)
      - [Recipe Creation](#recipe-creation)
  - [User handling](#user-handling)
    - [Password Management](#password-management)
    - [Backend `/auth` routes](#backend-auth-routes)
    - [Expected React paradigm](#expected-react-paradigm)
    - [Google OAUTH2 login](#google-oauth2-login)
  - [Design Challenges and Solutions](#design-challenges-and-solutions)
    - [**Changes to enum types within the database**](#changes-to-enum-types-within-the-database)
    - [**Searches and SQL Arrays**](#searches-and-sql-arrays)
    - [**Saving time with testing**](#saving-time-with-testing)
    - [**Raw formatting of data**](#raw-formatting-of-data)
  - [API Routes Reference](#api-routes-reference)
    - [**Authorization Routes**](#authorization-routes)
    - [**Users Routes**](#users-routes)
    - [**Recipe Routes**](#recipe-routes)
    - [**Ingredients Routes**](#ingredients-routes)

## About
Up until May of 2021 I was using an online spreadsheet to store all of my recipe data for recipes that I had discovered and wanted to keep for later. Online recipe sites were too cluttered for fast and easy access, and the social connections built into recipe social media apps felt too distant and remote. I decided to keep a personal recipe journal in an online app that I could design. My display would only show me the most necessary information about recipes and social connections I made on the site would be more familiar and I would only see recipes within my personalized network of people.

**key features:**
- Uncluttered view of user entered information
- Intimate feeling of connection with other users, no distractions from large datasets of public recipes.

## Data Strategy
The application will be driven by user provided data. An API connection point to the Edamam API has been built into the backend service, and this external connection is capable of collecting nutrition details about a given recipe using NLP of the recipe text. Edamam does not permit storage of recipe data, so this service is not considered part of the data strategy of the app.

Recipe data will be stored in a collection of three tables. A recipe table stores instructions and general information about a recipe. To store ingredients, a many-to-many relationship is used with an ingredients table, and a join table between the ingredients and the recipe. The recipe object and the ingredient object both have uuids that act as foreign keys within the join table. The decision to use a relationship between recipes and ingredients was made to encourage users to re-use common naming for ingredients they used in multiple recipes. The front-end should be designed so that while adding a new ingredient to a new recipe, the ingredient text field attempts to autocomplete based on matching ingredients in the database.

User data will be stored in a pair of tables. Users will also have their uuid stored as a foreign key within each recipe. This facilitates recipe ownership by a single user. User connections to other users is managed through a many-to-many join. A userUserJoin table is used to track user connections with a `requestorUuId` and `targetUuId` acting as foreign key fields for the users. Any connection that is initiated but unapproved is matched with a boolean that reflects `false` for being `accepted`. When connections are accepted the `accepted` boolean switches to `true` and users can see eachother's recipes.

## Languages, Libraries, Framekworks Applied
| Role | Name |
| --- | ---- |
| Database | Postgres SQL |
| Object Relational Mapping | Sequelize |
| Backend Service Framework | Express |
| Password Encryption | bcrypt |
| Identity management | JSON web token (JWT) |
| Backend Unit and Integration Testing | Jest |
| Deployment | Amazon Elastic Beanstalk |

## UML Diagrams
### Class
<image src="./ClassUML1.jpeg" alt="Class UML" width=1000>

### Sequence
#### Register/Login
<image src="./Account-Create-Login-Sequence.jpeg" alt="Account creation and login" width=800>

#### Google Authentication
<image src="./Google-Auth-Sequence.jpeg" alt="Account Recognition with Google" width=800>

#### Recipe Creation
<image src="./Create-Recipe-Sequence.jpeg" alt="Creating a Recipe" width=800>


## User handling
The NeighborhoodRecipe stores user data in a database. This user dataset organizes recipe and user-user connection data to fulfill the requirement that the recipe app feel personal and intimate. This section describes the ways in which the client and backend service are expected to handle user data.

### Password Management
Any password that the user uses to identify themselves is discard for security reasons and replaced with a bcrypt hash. Future access attempts use the same account are gaurded with middleware routing that compares the provided password hash with the stored password hash. The provided password given with any sign in attempt is deleted at the earliest possible point in code execution

### Backend `/auth` routes
Routes that are rooted off the `/auth` uri typically produce a server generated JSON web token (JWT). This token is protected with an app-wide passcode, that can be defined in a .env file. The backend service generates and tramsits these JWTs on the expectation that they will be used by the client to authenticate user identity.

### Expected React paradigm
Although this app is accessible across multiple web enabled platforms, the first tested use case is a react app. The react app is expected to store the the JWT within react component state. When the client makes future API calls to the NeighborhoodRecipe backend service, it attaches the JWT to the header of the http request at the authorization key value pair.

### Google OAUTH2 login
To ease new users into the access of this app, it is designed around accepting google's identity management API. When the client produces an tokenId, the backend service will use the google-auth-library to authenticate the token, and extract personalizing information to populate a new user's page. In the event that the user already exists, the google token will be used to load that user's information. This functionality easily allows hesitate users to connect to the app. 

## Design Challenges and Solutions
### **Changes to enum types within the database**
**Problem**: Sequelize is a powerful ORM that's used within this system, and it helps create some enum types for database fields. During exploratory testing of the system, more ingredient measurement types were desired. When changes are made to the sequelize design, the sequelize allows for a force option which will force the database to adopt new changes. This force option also clears all data previously stored in the database. This poses a problem since it would also clear out any user data that had been stored as well.

**Solution**: To address this problem, the project was launched with a relational database system (rds) through Amazon web service which was separate from the default elastic beanstalk platform. Launching an independent RDS allows development operations to update the database with direct SQL commands through a postgres client such as psql or pgAdmin.

**Lesson Learned**: By keeping Front-end client, Back-end service, and Database object separate. I realize that I can now operate on different parts of the deployment and minimize app functionality.

### **Searches and SQL Arrays**
**Problem**: Users need to be able to search for recipes that meet a variety of search terms that apply to ingredients, diet categories, and meal categories. Both diet categories and meal categories are stored as arrays within the postgres database. Querying with wildcard terms within an SQL array was cumbersome and did not come with any additional benefit. In addition, users needed to be able to search for matching recipes from connections with users, and potentially searched based on ingredients that were then joined.

**Brute-Force Solution**: Producing a complete list of recipes and then utilizing an `array.filter()` function was considered as a brute force method, but it was decided that a large request transaction to the database for every recipe would be expensive in a scaling perspective.

**Choosen Solution**: To make the most of the SQL efficiency, a storage tradeoff was made. Arrays of diet and meal categorizations as well as ingredient names (only) are stored as simple text datatypes in the database. These "flat" datatypes can be quickly queried when the user applies a general search.

### **Saving time with testing**
**Problem**: A unique challenge for this project was the marked increase of number of parameters used to describe a recipe object. I wanted to ensure that the recipes could be created with a large number and high diversity of different input fields. At the same time I realized that a user connection and visibility system could produce an overwhelming number of possible failure conditions.

**Solution**: Test driven development helped me keep pace with the various backend functions. I often found myself able to correct method problems closer to their root cause. During debugging I grew to trust that my testing was working properly and that my problems were elsewhere within the integration or frontend client. This was a positive experience though, and I found that I saved time whenever I needed to change a backend controller function.

### **Raw formatting of data**
**Problem**: The test user group that I wanted to share this application with needed to feel as though they wouldn't be repeatedly doing data entry of a recipe object. Part of this was fixed by arranging the operations of this app into a three tier architecture, but the ability to give users full ability to download a JSON serialized version of their recipe was still desired

**Solution**:** A frontend only method to render the JSON into a text file was implemented using the function `encodeURIComponent(input)`.

**Lessong Learned**: Empowering a front-end browswer client to download a rendition of hosted content avoids putting a computational load on a backend-service and may be userful in other applications.

## API Routes Reference
The NeighborhoodRecipe app is designed to work with various web enabled clients. A backend API is exposed for clients to interact with the data of the application.
### **Authorization Routes**
- POST `auth/token` this route passes both a username and a password to the API. The api then provides an encrypted JSON web token which can be decrypted for future transactions.
- POST `/auth/google` similar to token authentication. This route recieves an idToken from a google login attempt. The route then utilizes the google OATH2 client to verify the idToken. Once verified, the token returns a JSON web token for future use.
- POST `/auth/register` this route recieves the necessary information to register a new user to the database. The database completes the storage task for the new user and a JSON web token is generated and returned which the client can use in the future.
### **Users Routes**
- POST `/users/connect/:userUuId` this route accepts a post request for a client with a valid JWT, and includes a url parameter of a user uuid. This route initiates or completes a user to user connection request depending on the status of the connection request
- DELETE `/users/connect/:userUuId` this route accepts the same thing as the POST request version of the route. This route produces the removal of a connection between two users instead.
- GET `/users/` this route is accessible only to admin users, and it produces a list of all users that have registered in the system.
- GET `/users/:userUuId` this route produces a json object of the requested user's info, and is accessible by an admin or the user with the JWT that matches the request.
- POST `/users/emailSearch` this route finds a user that matches the email listed in the post body for a user that offers a valid JWT.
- GET `/users/connections/:userUuId` this route finds the connection list of other users related to the user provided within the JWT.
- POST `/users/:userUuId` this route is accessible by a user designated within a authorization JWT or an admin, and changes user profile data to match the request body.
### **Recipe Routes**
- GET `/recipes/adminall` this is accessible only to admin users, and it produces a list of all recipes that have been created in the system.
- GET `/recipes/view` this get route is used with a JWT for a registered user. It produces a view of that particular user's perspective of the recipes they can see through their connections and their own.
- GET `/recipes/:recipeUuid` retrieves recipe details for a request that includes a JWT in the authorization of the heade. The recipe details must be from the user of the JWT or from a connected user, otherwise a forbiddedn error is thrown.
- GET `/recipes/research/:recipeUuid` this route, of a logged in user, can trigger a research request to the Edamam API. The Edamam API returns a collection of generated nutrition details, meal categories, and diet categories.
- POST `/recipes/` this route, accepts a request with a JWT in the authorization portion of the header and produces a recipe in the database, applied to the user encoded in the JWT.
- PATCH `/recipes/` this route accepts a request with a JWT in the authorization portion of the header and changes a recipe in the database that matches the recipe's uuid within the request body.
- DELETE `/recipes/:recipeUuid` deletes a recipe if the JWT passed within the authorization portion of the header matches a profile of an admin or the user of the recipe to be deleted.
### **Ingredients Routes**
- GET `/ingredients/` this is a route that verifies that a valid JWT is attached to the authorization portion of the header, and it returns a list of ingredients that match a filter object of ingredients. Necessary for generating autocomplete suggestions