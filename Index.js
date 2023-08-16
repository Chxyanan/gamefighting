const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

function startGame() {
  // ทำการลบเนื้อหาในส่วนของเมนูออก
  const menuContainer = document.querySelector('.menu-container');
  menuContainer.style.display = 'none';
}

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: 'bg.png'
})

const crow = new Sprite({
  position: {
    x: 650,
    y: 200
  },
  imageSrc: 'crow/Left.png',
  scale: 0.5,
  framesMax: 5
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: 'img/player2/Sprites/Idle.png',
  framesMax: 8,
  scale: 2,
  offset: {
    x: 50,
    y: 139
  },
  sprites: {
    idle: {
      imageSrc: 'img/player2/Sprites/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: 'img/player2/Sprites/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: 'img/player2/Sprites/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: 'img/player2/Sprites/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: 'img/player2/Sprites/Attack1.png',
      framesMax: 8
    },
    takeHit: {
      imageSrc: 'img/player2/Sprites/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: 'img/player2/Sprites/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: 30,
      y: 50
    },
    width: 150,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: 700,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: 'img/player1/Sprites/Idle.png',
  framesMax: 10,
  scale: 2.5,
  offset: {
    x: 50,
    y: 60
  },
  sprites: {
    idle: {
      imageSrc: 'img/player1/Sprites/Idle.png',
      framesMax: 10
    },
    run: {
      imageSrc: 'img/player1/Sprites/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: 'img/player1/Sprites/Jump.png',
      framesMax: 3
    },
    fall: {
      imageSrc: 'img/player1/Sprites/Fall.png',
      framesMax: 3
    },
    attack1: {
      imageSrc: 'img/player1/Sprites/Attack1.png',
      framesMax: 7
    },
    takeHit: {
      imageSrc: 'img/player1/Sprites/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: 'img/player1/Sprites/Death.png',
      framesMax: 5
    }
  },
  attackBox: {
    offset: {
      x: -130,
      y: 50
    },
    width: 170,
    height: 50
  }
})



const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()


function checkHealthStatus() {
  if (player.health <= 0 || enemy.health <= 0) {
    const modal = document.getElementById('questionModal');
    modal.style.display = 'none';
    determineWinner({ player, enemy, timerId });
    return false; // คืนค่าเป็น false เพื่อหยุดการทำงานของ animate()
  }
  return true;
}





function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  crow.update()
  c.fillStyle = 'rgba(255, 255, 255, 0)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()
  
  if (!checkHealthStatus()) {
    CloseEvent; // หยุดการทำงานของ animate()
  }
  

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
    return; // หยุดการทำงานของ animate() เมื่อเลือดหมด
  }
}

const questions = [
  {
    question: " 2 + 2 = 4?",
    answer: true
  },
  {
    question: "25 * 25 = 650?",
    answer:  false 
  },
  {
    question: "การก่อสร้างหอไอเฟลเสร็จสมบูรณ์ในวันที่ 31 มีนาคม พ.ศ. 1887?",
    answer: false 
  },
  {
    question: "ฟ้าแลบก่อนจะได้ยินเพราะแสงเดินทางเร็วกว่าเสียง?",
    answer: true
  },
  {
    question: "ภูเขาไฟฟูจิเป็นภูเขาที่สูงที่สุดในญี่ปุ่น?",
    answer: true 
  },
  {
    question: "กะโหลกศีรษะเป็นกระดูกที่แข็งแรงที่สุดในร่างกายมนุษย์?",
    answer: false 
  },
  {
    question: "เป็นไปไม่ได้ที่จะจามในขณะที่คุณลืมตา?",
    answer: false 
  },
  {
    question: "คุณสามารถจามขณะนอนหลับ?",
    answer: false 
  },
  {
    question: "Google เดิมเรียกว่า BackRub?",
    answer: true 
  },
  {
    question: "หากคุณบวกตัวเลขสองตัวที่อยู่ด้านตรงข้ามของลูกเต๋าเข้าด้วยกัน คำตอบก็คือ 7 เสมอ?",
    answer: true
  },
  // เพิ่มคำถามอื่น ๆ ต่อที่นี่
];

function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}



function openQuestionModal(question) {
  const modal = document.getElementById('questionModal');
  const questionTextElement = modal.querySelector('#questionText');
  questionTextElement.textContent = question; // แทนที่ค่า {{currentQuestion}} ด้วย question
  modal.style.display = 'block';
}




let questionIndex = 0;
let currentQuestion = null;


function openNextQuestionModal() {
  if (questionIndex < questions.length) {
    const randomQuestion = questions[questionIndex];
    openQuestionModal(randomQuestion.question);
    questionIndex++;
  }
}

function answerQuestion(isCorrect) {
  const modal = document.getElementById('questionModal');
  modal.style.display = 'none'
  
if (!checkHealthStatus()) {
    return; // ไม่ต้องทำอะไรเพิ่มเมื่อเลือดหมด
  }

  // ตรวจสอบว่าเป็นครั้งแรกที่โจมตีหรือไม่
  const isFirstAttack = !player.isAttacking && !enemy.isAttacking;

  // ตรวจสอบคำตอบที่ถูกต้องเพื่อกำหนดให้ผู้เล่นหรือศัตรูโจมตี
  if (isFirstAttack) {
    if (isCorrect) {
      player.isAttacking = true;
    } else {
      enemy.isAttacking = true;
    }
  }

  

  // ลบคำถามที่ถูกต้องออกจากอาร์เรย์ questions
  if (isCorrect) {
    questions.splice(questionIndex - 1, -1);
  }
  openNextQuestionModal();
  
 // สุ่มคำถามใหม่และเปิดหน้าต่างคำถาม
 if (!player.isAttacking && !enemy.isAttacking) {
  if (questions.length > 0 && Math.random() < 0.01) {
    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[currentQuestionIndex];
    openQuestionModal(randomQuestion.question);
  }
}

if (isFirstAttack) {
  if (isCorrect) {
    // โจมตีศัตรูเมื่อตอบถูก
    setTimeout(() => {
      player.velocity.x = 520;
      player.switchSprite('run'); // เปลี่ยน sprite เป็น run สำหรับการโจมตี
      player.attack(); // ให้ผู้เล่นโจมตี
      setTimeout(() => {
        player.velocity.x = -520; // หยุดการเคลื่อนที่
        player.switchSprite('run'); // เปลี่ยน sprite เป็น run เพื่อกลับไปยังตำแหน่งเดิม
      }, 800); // หลังจากโจมตี รอ 0.8 วินาที แล้วหยุดการเคลื่อนที่
    }, 100); // รอ 0.1 วินาที ก่อนการโจมตี

  } else {
    // โจมตีผู้เล่นเมื่อตอบผิด
    setTimeout(() => {
      enemy.velocity.x = -520;
      enemy.switchSprite('run'); // เปลี่ยน sprite เป็น run สำหรับการโจมตี
      enemy.attack(); // ให้ศัตรูโจมตี
      setTimeout(() => {
        enemy.velocity.x = 520; // หยุดการเคลื่อนที่
        enemy.switchSprite('run'); // เปลี่ยน sprite เป็น run เพื่อกลับไปยังตำแหน่งเดิม
      }, 800); // หลังจากโจมตี รอ 0.8 วินาที แล้วหยุดการเคลื่อนที่
    }, 100); // รอ 0.1 วินาที ก่อนการโจมตี
  }
}
}


// เมื่อเริ่มเกม
openNextQuestionModal();

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'Enter':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})