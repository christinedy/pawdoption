import express from 'express';
import { loginUser,registerUser,adminLogin,getAllUsers,getUserById,updateUser,deleteUser} from '../controllers/userController.js';

const userRouter = express.Router();


userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)


userRouter.get('/all', getAllUsers)        
userRouter.get('/:id', getUserById)         
userRouter.put('/:id', updateUser)            
userRouter.delete('/:id', deleteUser)        

export default userRouter;