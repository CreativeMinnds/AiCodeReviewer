# 🤖 AI Code Reviewer (MERN Stack Project)

An intelligent web application built with the MERN stack that provides **automated AI-powered code reviews**. Users can write or paste code into a live editor, and the AI (powered by Google's Gemini API) will analyze and return a detailed, professional review—similar to how a senior developer would provide feedback.

---

## 🚀 Features

- 🧠 **AI-Powered Code Review** using  openai/gpt-oss-120b 
- 🖥️ **Live Code Editor** with syntax highlighting
- ✅ **Signup & Login** with secure password hashing (bcrypt)
- 🔐 **JWT Authentication**
- 📋 **Personalized Reviews** with markdown rendering
- 🎥 **Stylish Auth Page with Background Video**
- 🌙 **Dark Mode UI** with TailwindCSS & responsive design
- 📦 Modular and scalable folder structure

---

## 📸 Demo

![Aicode1](https://github.com/user-attachments/assets/0dece66a-11b6-4aed-8588-162b8706a242)
![AiCode2](https://github.com/user-attachments/assets/19c991f2-0f59-4157-b1fd-3f0b92c7d9b3)
![AiCode3](https://github.com/user-attachments/assets/a81519f3-d639-40da-a784-76d295b8850f)



---

## 🛠️ Tech Stack

- **Frontend:** React, TailwindCSS, React Simple Code Editor, React Markdown, PrismJS, Axios, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
- **AI Integration:** Google Generative AI SDK (Gemini API)

---

## 🔐 Authentication

- 🔒 Passwords are hashed using `bcrypt`
- 🛡️ JWT tokens are used to secure protected routes
- 🌐 All tokens are stored in `localStorage`

---

## 🧪 AI Review Instruction

The backend sends code snippets to Google Gemini with a detailed **system prompt** that acts like a **Senior Code Reviewer** with 7+ years of experience. Feedback includes:
- Code quality
- Best practices
- Performance tips
- Security concerns
- Refactored suggestions

---

## 📁 Project Structure


/client
├── components/
├── App.jsx
├── index.js
└── styles...

/server
├── controller/
├── routes/
├── model/
├── services/
├── db.js
└── server.js

---

## ⚙️ Getting Started

### Prerequisites
- Node.js and npm
- MongoDB
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-code-reviewer.git
cd ai-code-reviewer
2. Backend Setup
cd server
npm install
🔐 Create a .env file in /server:

JWT_SECRET=your_jwt_secret_key
GOOGLE_GEMINI_KEY=your_google_gemini_api_key
node server.js
3. Frontend Setup
cd client
npm install
npm run dev
🌐 API Endpoints  
Endpoint	Method	Description
/api/auth/signup	POST	Register new user
/api/auth/login	POST	Login user
/ai/get-review	POST	Get AI code review


