"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("./user.model"));
const bcrypt = require('bcrypt');
mongoose_1.default.connect("mongodb+srv://Santa:54555455@sanat.unssqya.mongodb.net/TYPE?retryWrites=true&w=majority")
    .then(() => console.log('Подключение к MongoDB успешно'))
    .catch(err => console.error('Ошибка подключения к MongoDB:', err));
const app = (0, express_1.default)();
const PORT = 3000;
const parentDir = path_1.default.resolve(__dirname, '..');
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (_, res) => {
    res.render(path_1.default.join(parentDir, 'views', 'index.ejs'), { title: 'Главная страница' });
});
app.get('/register', (_, res) => {
    res.render(path_1.default.join(parentDir, 'views', 'register.ejs'), { title: 'Регистрация' });
});
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Пользователь с таким email уже существует');
        }
        const hashedPassword = yield bcrypt.hash(password, 10);
        const user = new user_model_1.default({ name, email, password: hashedPassword });
        yield user.save();
        return res.send('Пользователь успешно зарегистрирован!');
    }
    catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        return res.status(500).send('Произошла ошибка при регистрации пользователя.');
    }
}));
app.get('/login', (_, res) => {
    res.render(path_1.default.join(parentDir, 'views', 'login.ejs'));
});
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).send('Пользователь с таким email не найден');
        }
        const isPasswordValid = yield user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send('Неправильный пароль');
        }
        return res.send('Вход выполнен успешно!');
    }
    catch (error) {
        console.error('Ошибка при попытке входа:', error);
        return res.status(500).send('Произошла ошибка при попытке входа');
    }
}));
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
//# sourceMappingURL=index.js.map