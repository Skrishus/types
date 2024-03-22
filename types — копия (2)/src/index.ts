import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import User from './user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



mongoose.connect("mongodb+srv://Santa:54555455@sanat.unssqya.mongodb.net/TYPE?retryWrites=true&w=majority")
  .then(() => console.log('Подключение к MongoDB успешно'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));



const app = express();
const PORT = 3000;
const parentDir = path.resolve(__dirname, '..'); // Получаем абсолютный путь к родительской папке текущей директории


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Установка папки для статических файлов (например, CSS, изображения)
app.use(express.static(path.join(__dirname, 'public')));

// Установка папки для шаблонов EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Главная страница
app.get('/', (_, res) => {
    res.render(path.join(parentDir, 'views', 'index.ejs'), { title: 'Главная страница' });
  });

  function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
      console.log(err)
      if (err) return res.sendStatus(403)
      req.user = user
      next()
    })
  }

 ///NOT ALL CODE PATH RETURN A VALUE!!!!!!!
  app.get('/privatePage', authenticateToken, (req, res) => {
    const userId = req.user.id; 
    User.findById(userId, (err: any, user: any) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
      }
      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      res.render('privatePage', { user: user }); 
    });
  });
  
  



  app.get('/register', (_, res) => {
    res.render(path.join(parentDir, 'views', 'register.ejs'), { title: 'Регистрация' });
  });
  

  app.post('/register', async (req, res) => {
      try {
          const { name, email, password } = req.body;
          // Проверяем, существует ли пользователь с таким email
          const existingUser = await User.findOne({ email });
          if (existingUser) {
              return res.status(400).send('Пользователь с таким email уже существует');
          }
          // Хэшируем пароль
          const hashedPassword = await bcrypt.hash(password, 10); // 10 - соль для хэширования
          // Создаем нового пользователя с хэшированным паролем
          const user = new User({ name, email, password: hashedPassword });
          await user.save();
          return res.send('Пользователь успешно зарегистрирован!');
      } catch (error) {
          console.error('Ошибка при регистрации пользователя:', error);
          return res.status(500).send('Произошла ошибка при регистрации пользователя.');
      }
  });
  
// Маршрут для страницы логина
app.get('/login', (_, res) => {
    res.render(path.join(parentDir, 'views', 'login.ejs'));
});

// Обработка запроса на логин
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Проверяем, существует ли пользователь с таким email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Пользователь с таким email не найден');
        }
        // Преобразуем введенный пароль в строку
        
        // Проверяем правильность пароля
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send('Неправильный пароль');
        }
        

        const accessToken = generateAccessToken(user)
        res.json({ accessToken: accessToken})

        return res.send('Вход выполнен успешно!');
    } catch (error) {
        console.error('Ошибка при попытке входа:', error);
        return res.status(500).send('Произошла ошибка при попытке входа');
    }
});


function generateAccessToken(user: any) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
  }
  


  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
// Запуск сервера

