import { Request, Response } from "express";
import { Todo } from "../model/taskModel";
import mongoose from "mongoose";

export const createTodo = async (req: Request, res: Response): Promise<void> => {
  
  try {
     console.log(req.body);
     
    const { title, description,user } = req.body;
    

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const newTodo = new Todo({
      title,
      description,
      user: user,
    });


    await newTodo.save();

    const startOfDay = new Date();
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999); 

const todos = await Todo.find({
  user: user, 
  createdAt: { $gte: startOfDay, $lt: endOfDay } 
});


    res.status(201).json({ message: "Todo created successfully", todo: todos,newTodo });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to create todo" });
  }
};


export const getTodoById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId.trim(); 
  
    
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ error: "Invalid Todo ID" });
        return;
      }
  
      const todo = await Todo.find({ user: userId});
  
      if (!todo) {
        res.status(404).json({ error: "Todo not found or unauthorized" });
        return;
      }  
      res.status(200).json(todo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch todo" });
    }
  };


  
  export const updateTodo = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.todoId.trim();
      const { title, description } = req.body; // Get description from request body
  
      console.log("Reached at update");
  
      if (!title) {
        res.status(400).json({ error: "Title is required" });
        return;
      }
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: "Invalid Todo ID" });
        return;
      }
  
      const updatedTodo = await Todo.findOneAndUpdate(
        { _id: id}, 
        { title, description }, 
        { new: true }
      );
      
      if (!updatedTodo) {
        res.status(404).json({ error: "Todo not found" });
        return;
      }
  
      const userTodos = await Todo.find({ user: updatedTodo.user });

      res.json({ message: "Todo updated successfully",  userTodos});
    } catch (error) {
      console.error("Error updating todo:", error);
      res.status(500).json({ error: "Failed to update todo" });
    }
  };
  


export const deleteTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id.trim(); 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: "Invalid Todo ID" });
      return;
    }

    const deletedTodo = await Todo.findOneAndDelete({ _id: id });

    if (!deletedTodo) {
      res.status(404).json({ error: "Todo not found or unauthorized" });
      return;
    }

    const todos = await Todo.find({ user: deletedTodo.user });

    res.status(200).json({ message: "Todo deleted successfully", todos });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
};
  

export const toggleTodoCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    const todoId = req.params.todoId.trim(); 
    console.log("Reached backend with ID:", todoId); 

    const todo = await Todo.findOne({ _id: todoId });
    console.log(todo);
    

    if (!todo) {
      res.status(404).json({ error: "Todo not found or unauthorized" });
      return;
    }

    todo.completed = !todo.completed;
    await todo.save();

    const todos = await Todo.find({ user: todo.user });

    res.status(200).json({ message: `Todo marked as ${todo.completed ? "completed" : "incomplete"}`, todos });
  } catch (error) {
    console.log("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo status" });
  }
};

