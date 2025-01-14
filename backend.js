

// -------------------------------------------------SQL STUFF ---------------------------------------------

// session
const createSessionTable = `CREATE TABLE Session (
                            id INTEGER PRIMARY KEY,
                            phase TEXT NOT NULL
                            );`;

const insertSession = `INSERT INTO Session(phase) VALUES(?)`

const updateSession = `UPDATE Session
                      SET phase = ? 
                      WHERE id = ?`

const deleteSession = `DELETE FROM Session WHERE id = ?`

//question
const createQuestionTable = `CREATE TABLE Question (
                            id INTEGER PRIMARY KEY,
                            alternativeA TEXT NOT NULL,
                            alternativeB TEXT NOT NULL
                            );`;

const insertQuestion = `INSERT INTO Question(alternativeA, alternativeB) VALUES (?, ?)`

const getAllQuestions = `SELECT * FROM Question`;


//SessionQuestion
const createSessionQuestionTable = `CREATE TABLE SessionQuestion (
                                    sessionId INTEGER NOT NULL,
                                    questionId INTEGER NOT NULL,
                                    iscurrentquestion INTEGER NOT NULL,
                                    PRIMARY KEY (sessionId, questionId)
                                    );`;

const insertSessionQuestion = `INSERT INTO SessionQuestion(sessionId, questionId, iscurrentquestion) VALUES (?, ?, 0)`;

const getCurrentQuestionInSession = `SELECT questionid FROM SessionQuestion
                                    WHERE iscurrentquestion = 1
                                    AND sessionid = ?`;

const updateCurrentQuestionInSession = `UPDATE SessionQuestion
                                        SET iscurrentquestion = ?
                                        WHERE sessionid = ?
                                        AND questionid = ?`;

const deleteSessionQuestionWithSessionId = `DELETE FROM SessionQuestion WHERE sessionid = ?`;

// player
const createPlayerTable = `CREATE TABLE Player (
                           id INTEGER PRIMARY KEY,
                           name TEXT NOT NULL,
                           askquestion INTEGER NOT NULL ,
                           sessionid INTEGER,
                           FOREIGN KEY(sessionid) REFERENCES Session(id)
                           );`;    
                           
const insertPlayer = `INSERT INTO Player(name, sessionid, askquestion) VALUES (?, ?, 0)`

const selectPlayerIdWithSessionId = `SELECT Player.id FROM Player
                                   INNER JOIN Session on Player.sessionid = session.id
                                   WHERE Session.id = ?`;

const selectPlayerDataWithSessionId = `SELECT Player.id, Player.name, Player.askquestion
                                    FROM Player
                                    INNER JOIN Session on Player.sessionid = session.id
                                    WHERE Session.id = ?`;

const updatePlayer = `UPDATE Player 
                      SET askQuestion = ?
                      WHERE id = ?`;


const deletePlayer = `DELETE FROM Player WHERE id = (?)`;


//answerFirst
const CreateAnswerFirstTable = `CREATE TABLE AnswerFirst (
                                id INTEGER PRIMARY KEY,
                                answer TEXT NOT NULL,
                                questionid INTEGER NOT NULL,
                                playerid INTEGER NOT NULL,
                                FOREIGN KEY(questionid) REFERENCES Question(id),
                                FOREIGN KEY(playerid) REFERENCES Player(id)
                                );`;  

const SelectAnswerFirstWithSessionIdAndQuestionid = `SELECT Answerfirst.id, Answerfirst.answer, AnswerFirst.questionid, AnswerFirst.playerid FROM Answerfirst
                                                    INNER JOIN Player on Player.id = Answerfirst.playerid
                                                    INNER JOIN Question on Question.id = Answerfirst.questionid
                                                    WHERE Player.Sessionid = ? AND Question.id = ?`;

const SelectAnswerFirstWithSessionId = `SELECT Answerfirst.id FROM Answerfirst 
                                        INNER JOIN Player on Answerfirst.playerid = player.id
                                        INNER JOIN Session on Player.sessionid = Session.id
                                        WHERE Session.id = ?`;

const insertAnswerFirst = `INSERT INTO AnswerFirst (answer, questionid, playerid) VALUES (?, ?, ?)`;

const deleteAnswerFirst = `DELETE FROM AnswerFirst WHERE id = ?`;


//answerSecond
const CreateAnswerSecondTable = `CREATE TABLE AnswerSecond (
                                id INTEGER PRIMARY KEY,
                                answer INTEGER NOT NULL,
                                questionid INTEGER NOT NULL,
                                playerid INTEGER NOT NULL,
                                FOREIGN KEY(questionid) REFERENCES question(id),
                                FOREIGN KEY(playerid) REFERENCES player(id)
                                );`; 

const SelectAnswerSecondWithSessionIdAndQuestionid = `SELECT AnswerSecond.id, AnswerSecond.answer, AnswerSecond.questionid, AnswerSecond.playerid FROM Answersecond
                                                     INNER JOIN Player on Player.id = Answersecond.playerid
                                                    INNER JOIN Question on Question.id = Answersecond.questionid
                                                    WHERE Player.Sessionid = ? AND Question.id = ?`;

const SelectAnswerSecondWithSessionID = `SELECT Answersecond.id FROM Answersecond 
                                        INNER JOIN Player on Answersecond.playerid = player.id
                                        INNER JOIN Session on Player.sessionid = Session.id
                                        WHERE Session.id = ?`;

const insertAnswerSecond = `INSERT INTO AnswerSecond (answer, questionid, playerid) VALUES (?, ?, ?)`;

const deleteAnswerSecond = `DELETE FROM AnswerSecond WHERE id = (?)`;


//EXPRESS
const express = require('express');
const cors = require("cors")
const app = express();
app.use(express.json());


//DATABASE
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(':memory:');

const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
app.use(cors(corsOptions))


// --------------------------END POINT FUNCTIONS-------------------------------------------

// SESSION

const MakeNewSession = (req, res) => {
    console.log("connected to make new session");
    let databaseId = "";
   
    db.run(insertSession, "join", function(err) {
        if (err) {
          return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        databaseId = this.lastID;

        res.status(201).json({
                id: databaseId, 
                phase: "join"
            });
        });
}

const GetAllSessions = (req, res) => {
    console.log("connected to get all sessions");

    let sessions = [];
    db.all("SELECT * FROM Session", (err, rows) => {
        if (err) {
            return console.log(err.message);
        }
        rows.forEach((row) =>{
            sessions.push(row);
        })
        res.status(200).json({Session: sessions});
    })
}

const GetSessionById = (req, res) => {
    console.log("connected to get session by id");

    db.get("SELECT * FROM Session WHERE id = ?", req.params.id, (err, row) =>{
        if(err){
            throw err;
        }
        else{
            res.status(200).json({Session: row})
        }
    })
}

const UpdateSession = (req, res) => {
    console.log("connected to update session");


    db.run(updateSession, req.body.phase, req.params.id, function(err) {
        console.log("update request body: "+ req.body.phase);
        if (err) {
          return console.error(err.message);
        }
        console.log(`Row(s) updated: ${this.changes}`);
        res.status(200).send(`Row(s) updated: ${this.changes}`);
      })
}

const DeleteSession = (req, res) => {
   
    // delete answerfirst
    let answerFirstIds = [];
    db.all(SelectAnswerFirstWithSessionId, req.params.id, (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) =>{
            answerFirstIds.push(row);
        })
    })

    for (let id of answerFirstIds){
        db.run(deleteAnswerFirst, id)
    }
  
    //delete answersecond
    let answerSecondIds = [];
    db.all(SelectAnswerSecondWithSessionID, req.params.id, (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) =>{
            answerSecondIds.push(row);
        })
    });

    for (let id of answerSecondIds){
        db.run(deleteAnswerSecond, id)
    }

    //delete player
    let playerIds = [];

    db.all(selectPlayerIdWithSessionId, req.params.id, (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) =>{
            playerIds.push(row);
        })
    });

    for (let id of playerIds){
        db.run(deletePlayer, id)
    }

    //delete sessionquestion
    db.run(deleteSessionQuestionWithSessionId, req.params.id, (err, row) => {
        if (err) {
          throw err;
        }
    });
     
    //delete session

    db.run(deleteSession, req.params.id, (err, row) => {
        if (err) {
          throw err;
        }
        res.status(200).send("session deleted");
    });

}

// PLAYER

const GetPlayersBySessionId = (req, res) => {
    console.log("connected to get players by session id");
    let players = [];
    db.all(selectPlayerDataWithSessionId, req.params.sessionid, (err, rows) => {
        if (err) {
            throw err;
        }
       
        rows.forEach((row) =>{
            players.push(row);
        })

        res.status(200)
        .json({player: players})
    });
   
}

const GetPlayersById = (req, res) => {
    console.log("connected to get player by id");
    db.get("SELECT askquestion FROM Player WHERE id = ?", req.params.playerid, (err, row) => {
        if (err){
            throw err;
        }
        else{
            res.status(200).json({askquestion: row.askquestion});
        }
    })
}

const UpdatePlayerAskQuestion = (req, res) => {
    console.log("connected to update player");

    db.run(updatePlayer, req.body.askquestion, req.params.id, (err, row) => {
        if (err) {
            throw err;
        }

        res.status(200).send("player id: " + req.params.id + "askquestion = " +  req.body.askquestion);
    });
   
}

const InsertNewPlayer = (req, res) => {
    console.log("connected to insert a new player");

    db.run(insertPlayer, req.body.playername, req.body.sessionid, function(err) {
        if (err){
            throw err;
        }

        newPlayerid = this.lastID;
        console.log("new player inserted with the id " + newPlayerid);
        res.cookie("sessionid", 1).cookie("playerid", newPlayerid).status(200).json({playerid: newPlayerid});
        
    })
}

// ANSWER FIRST

const GetAnswersFirst = (req, res) => {
    console.log("connected to get answers first");

    let answers = [];
    db.all(SelectAnswerFirstWithSessionIdAndQuestionid, req.params.sessionid, req.params.questionid, (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) =>{
            answers.push(row);
        })
       
        res.status(200)
        .json({answerfirst: answers})
    });
}

const InsertAnswerFirst = (req, res) => {
    console.log("connected to insert answer first");
    let currentQuestionId;

    db.get(getCurrentQuestionInSession, req.params.sessionid, (err, row) => {
        if(err){
            throw err;
        }
        else{
            currentQuestionId = row.questionId
        }

        db.run(insertAnswerFirst, req.body.answerfirst, currentQuestionId, req.params.playerid, (err) => {
            if (err){
                console.log(err)
            }
            else{
                res.status(200)
                .send("new answer first added!")
            }
        });
    })
}

//ANSWER SECOND

const GetAnswersSecond = (req, res) => {
    console.log("connected to get answers second");

    let answers = [];
    db.all(SelectAnswerSecondWithSessionIdAndQuestionid, req.params.sessionid, req.params.questionid, (err, rows) => {
        if (err) {
            throw err;
        }
        
        rows.forEach((row) =>{
            answers.push(row);
        })
       
        res.status(200)
        .json({answersecond: answers})
    });

}

const InsertAnswersSecond = (req, res) => {
    console.log("connected to insert answer second")
    let currentQuestionId;

    db.get(getCurrentQuestionInSession, req.params.sessionid, (err, row) => {
        if(err){
            throw err;
        }
        else{
           currentQuestion = row.questionId
        }

        db.run(insertAnswerFirst, req.body.answerfirst, currentQuestionId, req.params.playerid, (err) => {
            if (err){
                console.log(err)
            }
            else{
                res.status(200)
                .send("new answer second added!")
            }
        });
    })
}

// QUESTIONS

const GetAllQuestions = (req, res) => {
    console.log("connected to get all questions");

    let questions = []
    db.all(getAllQuestions, (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) =>{
            questions.push(row);
        })
       
        res.status(200)
        .json({Question: questions})
    })
}

// SESSIONQUESTION

const InsertGameQuestions = (req, res) => {
    console.log("connected to log all game question");
    let sessionId = req.body.questions.sessionid;
    let questionIds = req.body.questions.ids;

    
    for (let id of questionIds){
            console.log('session id: ' + sessionId);
            console.log('question id: ' + id);
            db.run(insertSessionQuestion, sessionId, id, (err, row) => {
                if(err){
                    console.log(err);
                }
                else{

                }
            });
            res.status(200)
            .send("all questions updated");

    }

}

const GetCurrentQuestion = (req, res) => {
    console.log("connected to get current question in sessionquestion");

    db.get(getCurrentQuestionInSession, req.params.sessionid, (err, row) => {
        if(err){
            throw err;
        }
        else{
            res.status(200)
            .json({questionid: row.questionId});
        }
    })
}

const UpdateCurrentQuestion = (req, res) => {
    console.log("connected to update current question in sessionquestion");

    db.run(updateCurrentQuestionInSession, req.body.iscurrentquestion, req.params.sessionid, req.params.questionid, (err, row) => {
        if(err){
            console.log(err);
        }
        else{
            res.status(200)
            .send("session updated to 1")
        }
    })
}

const GetAllSessionQuestions = (req, res) => {
    console.log("connected to get all in sessionquestion");

    let sessionquestions = [];
    db.all("SELECT * FROM Sessionquestion", (err, row) => {
        if (err){
            console.log(err);
        }
        else{
            sessionquestions.push(row);
        }
        res.status(200)
        .json({SessionQuestions: sessionquestions})
    })
}

// JOIN SESSION

const JoinSession = (req, res) => {
    console.log("connected to get the frontend html files");
    res.cookie("sessionid", req.params.sessionid).send();
}

//--------------------------------------------------------TEST STUFF --------------------------------------------------------------------
const InsertTestSession = () => {
    db.run(insertSession, "join");
}

const InsertTestPlayers = () => {
    db.run(insertPlayer, "player 1", 1);
    db.run(insertPlayer, "player 2", 1);
    db.run(insertPlayer, "player 3", 1);
    db.run(insertPlayer, "player 4", 1);
}

const InsertTestQuestions = () => {
    db.run(insertQuestion, "be a monkey", "be a dog");
    db.run(insertQuestion, "eat a boot", "eat a dress shoe");
    db.run(insertQuestion, "lose all your money once", "lose all your cellphone for life");
    db.run(insertQuestion, "eat a hat", "eat a glove");
}

const InsertTestAnswersFirst= () => {
    //question 1
    db.run(insertAnswerFirst, "A", 1, 1);
    db.run(insertAnswerFirst, "A", 1, 2);
    db.run(insertAnswerFirst, "A", 1, 3);
    db.run(insertAnswerFirst, "A", 1, 4);

    // question 2
    db.run(insertAnswerFirst, "B", 2, 2);
    db.run(insertAnswerFirst, "B", 2, 1);
    db.run(insertAnswerFirst, "B", 2, 3);
    db.run(insertAnswerFirst, "A", 2, 4);

    // question 3
    db.run(insertAnswerFirst, "A", 3, 3);
    db.run(insertAnswerFirst, "A", 3, 1);
    db.run(insertAnswerFirst, "B", 3, 2);
    db.run(insertAnswerFirst, "B", 3, 4);
    
    //question 4
    db.run(insertAnswerFirst, "A", 4, 4);
    db.run(insertAnswerFirst, "B", 4, 1);
    db.run(insertAnswerFirst, "B", 4, 2);
    db.run(insertAnswerFirst, "B", 4, 3);


}

const InsertTestAnswersSecond = () => {
   
    //question 1
    db.run(insertAnswerSecond, 1000, 1, 1);
    db.run(insertAnswerSecond, 900, 1, 2);
    db.run(insertAnswerSecond, 800, 1, 3);
    db.run(insertAnswerSecond, 700, 1, 4);

    // question 2
    db.run(insertAnswerSecond, 2000, 2, 2);
    db.run(insertAnswerSecond, 1900, 2, 1);
    db.run(insertAnswerSecond, 1800, 2, 3);

}

const InsertSessionQuestion = () => {
    db.run(insertSessionQuestion, 1, 1);
    db.run(insertSessionQuestion, 1, 2);
    db.run(insertSessionQuestion, 1, 3);
    db.run(insertSessionQuestion, 1, 4);
}



//--------------------------------------------------------END POINTS --------------------------------------------------------------------

//session 
app.get('/api/session/all', GetAllSessions);
app.get('/api/session', MakeNewSession);
app.get('/api/session/:id/', GetSessionById)
app.put('/api/session/:id/', UpdateSession);
app.delete('/api/session/:id', DeleteSession);

//player 
app.get('/api/player/:sessionid', GetPlayersBySessionId);
app.get('/api/playerbyid/:playerid', GetPlayersById);
app.put('/api/player/:id', UpdatePlayerAskQuestion);
app.post('/api/player', InsertNewPlayer)

//answerFirst 
app.get('/api/answerfirst/:sessionid/:questionid', GetAnswersFirst);
app.post('/api/answerfirst/:playerid/:sessionid', InsertAnswerFirst);

//answersecond 
app.get('/api/answersecond/:sessionid/:questionid', GetAnswersSecond);
app.post('/api/answersecond/:playerid/:sessionid', InsertAnswersSecond);

//question 
app.get('/api/question', GetAllQuestions);

//sessionquestion
app.get('/api/sessionquestion', GetAllSessionQuestions);
app.get('/api/sessionquestion/:sessionid', GetCurrentQuestion);
app.post('/api/sessionquestion/', InsertGameQuestions);
app.put('/api/sessionquestion/:sessionid/:questionid', UpdateCurrentQuestion);

// join session and get html served

app.get('/joinsession/:sessionid', JoinSession);

// --------CREATE TABLES (AND INSERT TESTDATA)------

// OK

db.run(createSessionTable, err =>{
    if(err){
        console.log(err)
    }
    InsertTestSession();
});

db.run(createPlayerTable, err =>{
    if(err){
        console.log(err)
    }
    InsertTestPlayers();
});
db.run(createQuestionTable, err =>{
    if(err){
        console.log(err)
    }
    InsertTestQuestions();
});
db.run(createSessionQuestionTable, err =>{
    if(err){
        console.log(err)
    }
    InsertSessionQuestion();
});
db.run(CreateAnswerFirstTable, err =>{
    if(err){
        console.log(err)
    }
    InsertTestAnswersFirst();
});
db.run(CreateAnswerSecondTable, err =>{
    if(err){
        console.log(err)
    }
    InsertTestAnswersSecond();
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);

})



