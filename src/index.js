const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { response } = require("express");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExists = users.some((user) => user.username === username);
  if (!userExists) {
    return response.status(404).json({ error: "User not found" });
  }
  request.username = username;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { deadline, title } = request.body;
  const user = users.find((user) => user.username === username);
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "To Do not found" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "To Do not found" });
  }
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) =>
{
  const {username} = request
  const { id } = request.params;
  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);
  if (!user || !todo) {
    return response.status(404).json({ error: "Not found" });
  }
  user.todos.splice(todo, 1);
  return response.status(204).json(user.todos);
});

module.exports = app;
