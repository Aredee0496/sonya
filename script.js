const app = {
    currentCategory: null,
    currentQuestionIndex: 0,
    coins: 0,
    totalCoins: 0, // เก็บคะแนนรวมทุกหมวด
    completedCategories: new Set(), // เก็บหมวดที่เล่นจบแล้ว
    questions: {
        สัตว์: ["LION", "ELEPHANT", "TIGER", "GIRAFFE"],
        อาชีพ: ["DOCTOR", "TEACHER", "ENGINEER", "ARTIST"],
        สิ่งของ: ["CHAIR", "TABLE", "LAMP", "BOOK"],
        ผลไม้: ["APPLE", "BANANA", "ORANGE", "GRAPE"]
    },
    sounds: {
        select: new Audio("sounds/select.mp3"),  // เสียงเมื่อเลือกตัวอักษร
        correct: new Audio("sounds/correct.mp3"), // เสียงเมื่อตอบถูก
        wrong: new Audio("sounds/wrong.mp3") // เสียงเมื่อตอบผิด
    },
    init() {
        this.bindEvents();
    },
    bindEvents() {
        document.getElementById("start-button").addEventListener("click", () => this.showCategoryPage());
        document.querySelectorAll(".category-button").forEach(button => {
            button.addEventListener("click", (e) => this.startGame(e.target.dataset.category));
        });
    },
    showCategoryPage() {
        document.getElementById("home-page").classList.add("hidden");
        document.getElementById("category-page").classList.remove("hidden");
    },
    startGame(category) {
        if (this.completedCategories.has(category)) {
            alert("คุณเล่นหมวดนี้ไปแล้ว!");
            return;
        }
        this.currentCategory = category;
        this.currentQuestionIndex = 0;
        this.coins = 0;
        document.getElementById("category-page").classList.add("hidden");
        document.getElementById("game-page").classList.remove("hidden");
        this.loadQuestion();
    },
    loadQuestion() {
        const question = this.questions[this.currentCategory][this.currentQuestionIndex];
        document.getElementById("category-title").textContent = this.currentCategory;
        document.getElementById("image-container").innerHTML = `<img src="images/${question.toLowerCase()}.jpg" alt="${question}">`;
        this.scrambleLetters(question);
    },
    scrambleLetters(word) {
        const scrambled = word.split("").sort(() => Math.random() - 0.5).join("");
        document.getElementById("scrambled-letters").innerHTML = scrambled.split("").map(letter => `
            <div class="letter" draggable="true" data-letter="${letter}">${letter}</div>
        `).join("");
        document.getElementById("answer-slots").innerHTML = word.split("").map(() => `
            <div class="slot"></div>
        `).join("");
        this.bindDragEvents();
    },
    bindDragEvents() {
        const letters = document.querySelectorAll(".letter");
        const slots = document.querySelectorAll(".slot");
        letters.forEach(letter => {
            letter.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text", e.target.dataset.letter);
                this.sounds.select.play(); // เล่นเสียงเลือกตัวอักษร
            });
        });
        slots.forEach(slot => {
            slot.addEventListener("dragover", (e) => e.preventDefault());
            slot.addEventListener("drop", (e) => {
                e.preventDefault();
                const letter = e.dataTransfer.getData("text");
                e.currentTarget.textContent = letter;

                // ลบตัวอักษรที่ถูกเลือกออกจาก scrambled-letters
                const draggedElement = document.querySelector(`.letter[data-letter="${letter}"]`);
                if (draggedElement) {
                    draggedElement.remove();
                }

                this.checkAnswer();
            });
        });
    },
    checkAnswer() {
        const answer = Array.from(document.querySelectorAll(".slot")).map(slot => slot.textContent).join("");
        const correctAnswer = this.questions[this.currentCategory][this.currentQuestionIndex];
        if (answer === correctAnswer) {
            document.getElementById("feedback").textContent = "✓";
            document.getElementById("feedback").style.color = "green";
            this.sounds.correct.play(); // เล่นเสียงเมื่อตอบถูก
            this.coins += correctAnswer.length;
            document.getElementById("coins").textContent = this.coins;
            setTimeout(() => this.nextQuestion(), 1000);
        } else {
            document.getElementById("feedback").textContent = "✗";
            document.getElementById("feedback").style.color = "red";
            this.sounds.wrong.play(); // เล่นเสียงเมื่อตอบผิด
        }
    },
    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions[this.currentCategory].length) {
            this.loadQuestion();
        } else {
            this.totalCoins += this.coins;
            this.completedCategories.add(this.currentCategory);
            this.checkAllCategoriesCompleted();
        }
    },
    checkAllCategoriesCompleted() {
        if (this.completedCategories.size === Object.keys(this.questions).length) {
            this.showFinalScore();
        } else {
            alert(`คุณทำคะแนนได้ ${this.coins} เหรียญในหมวด ${this.currentCategory}`);
            this.showCategoryPage();
        }
    },
    showFinalScore() {
        document.getElementById("game-page").classList.add("hidden");
        document.getElementById("congrats-page").classList.remove("hidden");
        document.getElementById("total-score").textContent = this.totalCoins;
    }
};

app.init();