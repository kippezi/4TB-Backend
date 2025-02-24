# 4TB-Backend

4TB-Backend is the backend component of the 4TB-Unity game system. It uses **Node.js**, **Express.js**, and **SQLite** to manage and interact with a database that powers the game. The backend provides the necessary functionality to create and manage tables that store information about the game session, players, quiz questions, and answers.

The `4TB-Backend` repository contains the logic and endpoints for managing the database and supporting the gameplay experience defined in the `4TB-Unity` repository.

The code for the project is located in the **backend.js** file

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Database Tables](#database-tables)
3. [API Endpoints](#api-endpoints)
---

## Project Overview

4TB-Backend provides a backend for the quiz game, which is built with Unity and communicated with via HTTP endpoints. It handles game session creation, player management, question handling, and answer tracking. The backend uses **SQLite** to store data about the game, players, questions, and answers.

## Database Tables

The backend supports the following tables:

1. **Session**  
   Stores information about the game session, including a unique `id` and the `phase` of the session (e.g., waiting for players, active, completed).

2. **Question**  
   Stores the quiz questions, each identified by a unique `id`, with two alternatives (`alternativeA` and `alternativeB`) for each question.

3. **SessionQuestion**  
   Links `Session` and `Question` tables. It tracks which question is currently active (`iscurrentquestion`) in the session. The table uses a composite primary key of `sessionId` and `questionId`.

4. **Player**  
   Stores player information, including the unique `id`, `name`, and `sessionid` they belong to. The `askquestion` field tracks whether the player is the one asking the questions.

5. **AnswerFirst**  
   Stores the first answer given by a player for each question. Each answer entry contains an `id`, the answer (`answer`), `questionid`, and `playerid`.

6. **AnswerSecond**  
   Stores the second answer given by a player for each question. Similar to `AnswerFirst`, it contains an `id`, `answer`, `questionid`, and `playerid`.

---

## API Endpoints

The backend exposes several API endpoints to interact with the data. These include endpoints for creating, reading, updating, and deleting data from the tables. Some example API routes are:

- **Session Endpoints:**
  - `POST /sessions` - Create a new game session.
  - `GET /sessions/:id` - Retrieve information about a specific session.
  - `PUT /sessions/:id` - Update the phase of a session.

- **Question Endpoints:**
  - `POST /questions` - Create a new quiz question.
  - `GET /questions` - Retrieve all quiz questions.
  - `GET /questions/:id` - Retrieve a specific question by ID.

- **Player Endpoints:**
  - `POST /players` - Add a new player to a session.
  - `GET /players/:sessionId` - Retrieve players in a specific session.
  - `PUT /players/:id` - Update player information.

- **Answer Endpoints:**
  - `POST /answers/first` - Submit the first answer for a player.
  - `POST /answers/second` - Submit the second answer for a player.
  - `GET /answers/first/:sessionId` - Retrieve the first answers for a session.
  - `GET /answers/second/:sessionId` - Retrieve the second answers for a session.

These endpoints interact with the database to manage and retrieve game data as players progress through the game.


