# DevConnector
This web application is a MERN based social APP targeting at implementing basic functions of profile sharing, short literal blog posting and comment. The content follows the [Udemy course](https://www.udemy.com/course/mern-stack-front-to-back/).

## How to run
Git clone the repo and cd to the directory.  
Create a file named `default.json` in the Config folder with content:  
```json
{
    "mongoURI" : "YOUR MONGODB URI",
    "jwtSecret" : "mysecrettoken",
    "githubToken" : "YOUR GITHUB TOKEN"
}
```
Then run the command:
For Windows powershell: `npm install ; cd client ; npm install ; cd .. ; npm run dev`  
For Linux: `npm install && cd client && npm install && cd .. && npm run dev`  

Now you can open up a new tab in your browser and see the application in `http://localhost:3000`

## Architecture summary
The backend APIs are developed via Express.js with MongoDB.  
The frontend is developed in React. The state manipulation are wrapped in Redux.

