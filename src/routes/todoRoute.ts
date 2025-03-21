import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
   createTodo,
  // getAllTodos,
  getTodoById,
   updateTodo,
  deleteTodo,
  toggleTodoCompletion,
} from "../controller/todoController";

const router = express.Router();

router.post("/addTodo",authMiddleware,createTodo); 
router.get("/getTodo/:userId", authMiddleware, getTodoById); 
router.put("/editTodo/:todoId", authMiddleware, updateTodo); 
router.delete("/deleteTodo/:id",  authMiddleware,deleteTodo); 
router.patch("/markAsCompleted/:todoId", authMiddleware, toggleTodoCompletion); 

export default router;
