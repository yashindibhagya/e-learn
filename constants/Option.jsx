export const Praticeoption =[
  {
    name:"Quiz", 
    image: require('./../assets/images/quizz.png') ,
    icon: require('./../assets/images/quizz.png') ,
    path: '/quiz'


  },
  {
    name:"Flashcards", 
    image: require('./../assets/images/flashcard.png') ,
    icon: require('./../assets/images/flashcard.png') ,
    path: '/flashcards'

  },
  {
    name:"Question & Ans.",
    image: require("./../assets/images/notes.png") ,
    icon: require("./../assets/images/notes.png") ,
    path: '/questionAnswer'
  },

]

export const imageAssets = {
  '/banner1.png': require("./../assets/images/banner1.png"),
  '/banner2.png': require('./../assets/images/banner2.png'),
  '/banner3.png': require('./../assets/images/banner3.png'),
  '/banner4.png': require("./../assets/images/banner4.png"),
};

export const CourseCategory = ["Tech & Coding" , "Business & Finance" , "Health & Fitness" , "Arts & Creativity" , "Science & Engineering"]

export const ProfileMenu = [
  {
    name: "Add Course",
    icon: 'add-outline', //ionic icons
    path: '/addCourse'
  },
  {
    name: 'My Courses',
    icon: 'book',
    path: '/(tabs)/home'
  },
  {
    name: 'Course Progress',
    icon: 'analytics-outline',
    path: '/(tabs)/progress'
  },
  {
    name: 'Logout',
    icon: 'log-out',
    path: '/signIn'
  },
]
