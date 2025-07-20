# React + fastapi + appwrite movie browser project

![Tux, the Linux mascot](/assets/images/main.jpg)


### Movie browsing webapp with up-to-date movies, real time notifications and option to select movies as favorites.

This project is built as a way to learn about web developement. It uses a react@vite frontend and follows RESTapi principles. The project uses up-to-date data from the tmdb api. For user authentication, storing the likes and the users' favorites it relies on appwrite cloud. Like notifications are sent via websockets. The frontend only communicates with appwrite when authenticating a user, it mainly communicates with the backend.

## Usage

### Online
You can try it [online](https://movie-app-frontend-297123749347.europe-west3.run.app)

### Locally

#### Installation
1. Download [git](https://git-scm.com/downloads)
2. Download [node.js](https://nodejs.org/en/download)
3. Download [python](https://www.python.org/downloads/)
4. Download [docker](https://www.docker.com/products/docker-desktop/)
5. clone the project 
   ```bash
   git clone https://github.com/mysteryMrE/movies.git
   ```
> Note: You can use the program just with <em>node + python</em> or just with <em>docker</em>
#### Environment Setup

1. Frontend Setup
   - Copy `.env.example` to `.env`
      ```bash
      cp frontend/.env.example frontend/.env
   - Replace the placeholder values
2. Backend Setup
   - Copy `.env.example` to `.env`
      ```bash
      cp backend/.env.example backend/.env
   - Replace the placeholder values

3. Root Setup (only neccessary for docker-compose)
   - Copy `.env.example` to `.env`
      ```bash
      cp .env.example .env
      ```
   - Replace the placeholder values
      
> Note: Never commit your actual `.env` files to version control or copy them to docker image!

#### Running locally
If you have docker installed, using it is the faster and easier way.
##### Without docker
1. Frontend
   - Open a terminal and go into the frontend folder
      ```bash
      cd frontend
      ```
   - Install dependencies
      ```bash
      npm install
      ```
   - Start the program
      ```bash
      npm run dev
      ```
      it will run the project on <strong>localhost:5173</strong> by default
2. Backend
   - Open a terminal and go into the backend folder
      ```bash
      cd backend
      ```
   - Create a virtual environment
      ```bash
      python -m venv my_project_env
      ```
   - Activate the virtual environment
      - Mac/Linux
         ```bash
         source my_project_env/bin/activate
         ```
      - Windows
         ```bash
         my_project_env\Scripts\activate
         ```
   - Install dependencies
      ```bash
      pip install -r requirements.txt
      ```
   - Start the program
      ```bash
      python main.py
      ```
      it will run the project on <strong>localhost:8080</strong> by default, you can visit <strong>localhost:8080/docs</strong> to be able to interact with the backend directly
##### With docker
1. Make sure docker desktop is running
2. Open a terminal in the root of the project
3. Docker
   - Build images
      ```bash
      docker build -t movie-project-frontend ./frontend
      ```
      ```bash
      docker build -t movie-project-backend ./backend
      ```
   - Run the containers
      ```bash
      docker run movie-project-frontend
      ```
      ```bash
      docker run movie-project-backend
      ```
   > NOT WORKING YET, NO ENV FILE NOR INJECTION FOR BACKEND CONTAINER
4. Docker Compose
   - Build + Run separately
      - Build the images
         ```bash
         docker-compose build
         ```
      - Run the containers
         ```bash
         docker-compose up
         ```
   - Build + Run together
      ```bash
      docker-compose up --build
      ```
## 📚 Based On

The frontend project is based on:
* **Tutorial:** [React JS 19 Full Course 2025]([Link to the Tutorial](https://www.youtube.com/watch?v=dCLhUialKPQ)) by [JavaScript Mastery]
